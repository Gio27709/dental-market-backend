import { supabaseAdmin } from "../config/supabase.js";
import fs from "fs";
import csv from "csv-parser";
import path from "path";

/**
 * @desc    Get all active products including their variations
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
                *,
                product_variations (*),
                store_profiles (business_name, rating_avg)
            `,
      )
      .eq("is_active", true)
      .eq("moderation_status", "approved");

    if (error) throw error;

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a product with mandatory initial variations
 * @route   POST /api/products
 * @access  Private (Store, Admin, Owner)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category_id, price, images, variations } =
      req.body;
    const storeId = req.user.id;

    // Auto-generate slug from name + random element
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 1000)}`;

    // 1. Insert Base Product
    const { data: productData, error: productError } = await supabaseAdmin
      .from("products")
      .insert([
        {
          store_id: storeId,
          name,
          slug,
          description,
          category_id,
          price,
          images,
          moderation_status: "pending", // Pending manual approval by admin
          is_active: false,
        },
      ])
      .select()
      .single();

    if (productError) throw productError;

    // 2. Map & Insert Variations relying on the new product ID
    const variationsToInsert = variations.map((v) => ({
      product_id: productData.id,
      attribute_name: v.attribute_name,
      attribute_value: v.attribute_value,
      stock: v.stock,
      price_modifier: v.price_modifier,
      sku: v.sku,
    }));

    const { data: variationsData, error: variationsError } = await supabaseAdmin
      .from("product_variations")
      .insert(variationsToInsert)
      .select();

    if (variationsError) {
      // Rollback manual attempt by discarding the created product since transaction control in JS is limited here
      await supabaseAdmin.from("products").delete().eq("id", productData.id);
      throw variationsError;
    }

    res.status(201).json({
      success: true,
      message: "Product mapped successfully. Awaiting moderation.",
      data: { ...productData, variations: variationsData },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete (soft-delete) a product
 * @route   DELETE /api/products/:id
 * @access  Private (Store owner of the product or Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Security check: Owner or Admin?
    if (req.user.role !== "admin" && req.user.role !== "owner") {
      const { data: check } = await supabaseAdmin
        .from("products")
        .select("store_id")
        .eq("id", productId)
        .single();
      if (!check || check.store_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to modify this product",
        });
      }
    }

    // Soft Delete
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", productId);

    if (error) throw error;
    res
      .status(200)
      .json({ success: true, message: "Product deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get template for bulk product import
 * @route   GET /api/products/bulk-import/template
 * @access  Private (Store, Owner)
 */
export const getBulkImportTemplate = (req, res, next) => {
  try {
    const templatePath = path.resolve("templates/products-import-template.csv");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template file not found" });
    }
    res.download(templatePath, "products-import-template.csv");
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Process Bulk Import of products
 * @route   POST /api/products/bulk-import
 * @access  Private (Store, Owner)
 */
export const bulkImportProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a CSV file" });
    }
    const storeId = req.user.id;
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        // Delete the temp file
        fs.unlinkSync(req.file.path);

        if (results.length > 500) {
          return res
            .status(400)
            .json({ error: "Maximum 500 rows allowed per import." });
        }
        if (results.length === 0) {
          return res
            .status(400)
            .json({ error: "The uploaded CSV file is empty." });
        }

        let successCount = 0;
        let failedCount = 0;
        let errors = [];

        // Group by product name to batch variations into single product
        const productsMap = {};
        results.forEach((row, index) => {
          const {
            name,
            description,
            category_id,
            price,
            attribute_name,
            attribute_value,
            stock,
            sku,
          } = row;
          if (
            !name ||
            !description ||
            !category_id ||
            !price ||
            !attribute_name ||
            !attribute_value
          ) {
            failedCount++;
            errors.push(
              `Row ${index + 1} (${name || "Unknown"}): Missing required fields.`,
            );
            return;
          }
          if (!productsMap[name]) {
            productsMap[name] = {
              name,
              description,
              category_id,
              price: parseFloat(price),
              variations: [],
            };
          }
          productsMap[name].variations.push({
            attribute_name,
            attribute_value,
            stock: parseInt(stock) || 0,
            sku: sku || "",
          });
        });

        // Process sequentially
        for (const productName of Object.keys(productsMap)) {
          const productRaw = productsMap[productName];
          try {
            const slug = `${productRaw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 1000)}`;
            const { data: productData, error: productError } =
              await supabaseAdmin
                .from("products")
                .insert([
                  {
                    store_id: storeId,
                    name: productRaw.name,
                    slug,
                    description: productRaw.description,
                    category_id: productRaw.category_id,
                    price: productRaw.price,
                    moderation_status: "pending",
                    is_active: false,
                    images: [],
                  },
                ])
                .select()
                .single();

            if (productError) throw productError;

            const variationsToInsert = productRaw.variations.map((v) => ({
              product_id: productData.id,
              attribute_name: v.attribute_name,
              attribute_value: v.attribute_value,
              stock: v.stock,
              price_modifier: 0,
              sku: v.sku,
            }));

            const { error: varError } = await supabaseAdmin
              .from("product_variations")
              .insert(variationsToInsert);

            if (varError) {
              await supabaseAdmin
                .from("products")
                .delete()
                .eq("id", productData.id);
              throw varError;
            }

            successCount += productRaw.variations.length;
          } catch (err) {
            failedCount += productRaw.variations.length;
            errors.push(
              `Failed importing product: ${productName} - ${err.message}`,
            );
          }
        }

        res.status(200).json({
          success: true,
          message: "Bulk import processing completed.",
          report: {
            success: successCount,
            failed: failedCount,
            errors,
          },
        });
      });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};
