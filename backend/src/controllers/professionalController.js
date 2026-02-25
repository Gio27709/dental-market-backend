import { supabaseAdmin } from "../config/supabase.js";
import fs from "fs";

/**
 * @desc    Upload professional license document
 * @route   POST /api/professional/license-upload
 * @access  Private (Professional)
 */
export const uploadLicense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file)
      return res.status(400).json({ error: "Please upload a document" });

    const file = req.file;
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res
        .status(400)
        .json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." });
    }

    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5MB." });
    }

    const fileExt = file.originalname.split(".").pop();
    const fileName = `${userId}/${Date.now()}_license.${fileExt}`;

    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } =
      await supabaseAdmin.storage
        .from("licenses")
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

    fs.unlinkSync(filePath); // remove temp local file

    if (storageError) throw storageError;

    // We don't save the public URL natively since the bucket is private.
    // We save the storage path.
    const pathInStorage = storageData.path;

    const { error: profileError } = await supabaseAdmin
      .from("professional_profiles")
      .update({
        license_image_url: pathInStorage,
        is_verified: false,
        license_reviewed_at: null,
        license_review_notes: null,
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    res.status(200).json({
      success: true,
      message: "License uploaded successfully. Awaiting administrative review.",
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};

/**
 * @desc    Get professional verification status
 * @route   GET /api/professional/status
 * @access  Private (Professional)
 */
export const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("professional_profiles")
      .select(
        "is_verified, license_image_url, license_reviewed_at, license_review_notes",
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all pending professional licenses
 * @route   GET /api/admin/professional-licenses
 * @access  Private (Admin)
 */
export const getPendingLicenses = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("professional_profiles")
      .select("id, full_name, license_image_url, license_reviewed_at")
      .not("license_image_url", "is", null)
      .eq("is_verified", false)
      .is("license_reviewed_at", null);

    if (error) throw error;

    // Generate signed URLs so admins can view them securely via frontend links
    for (let profile of data) {
      if (profile.license_image_url) {
        const { data: urlData } = await supabaseAdmin.storage
          .from("licenses")
          .createSignedUrl(profile.license_image_url, 3600); // 1hr
        profile.signed_url = urlData ? urlData.signedUrl : null;
      }
    }

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify or Reject professional license
 * @route   PUT /api/admin/professionals/:id/verify
 * @access  Private (Admin)
 */
export const verifyLicense = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { is_verified, notes } = req.body;

    if (typeof is_verified !== "boolean")
      return res.status(400).json({ error: "is_verified boolean required" });

    const { error } = await supabaseAdmin
      .from("professional_profiles")
      .update({
        is_verified,
        license_reviewed_at: new Date().toISOString(),
        license_review_notes: notes || null,
      })
      .eq("id", targetId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Professional ${is_verified ? "verified" : "rejected"} mapped successfully`,
    });
  } catch (err) {
    next(err);
  }
};
