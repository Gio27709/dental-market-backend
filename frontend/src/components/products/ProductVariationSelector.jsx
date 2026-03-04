import { useState } from "react";
import PropTypes from "prop-types";

export default function ProductVariationSelector({
  variations = [],
  onChange,
}) {
  const [selectedId, setSelectedId] = useState("");

  const handleSelect = (e) => {
    const value = e.target.value;
    setSelectedId(value);
    if (onChange) onChange(value);
  };

  if (!variations || variations.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Sin variaciones disponibles.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <label
        htmlFor="variation-select"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Selecciona una opción
      </label>
      <select
        id="variation-select"
        value={selectedId}
        onChange={handleSelect}
        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-gray-50 border"
      >
        <option value="" disabled>
          -- Elige una variación --
        </option>
        {variations.map((v) => {
          const isOutOfStock = v.stock <= 0;
          return (
            <option key={v.id} value={v.id} disabled={isOutOfStock}>
              {v.attribute_name}: {v.attribute_value}{" "}
              {isOutOfStock ? "(Agotado)" : `(${v.stock} disp.)`}
            </option>
          );
        })}
      </select>
    </div>
  );
}

ProductVariationSelector.propTypes = {
  variations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      stock: PropTypes.number.isRequired,
      attribute_name: PropTypes.string.isRequired,
      attribute_value: PropTypes.string.isRequired,
    }),
  ),
  onChange: PropTypes.func,
};
