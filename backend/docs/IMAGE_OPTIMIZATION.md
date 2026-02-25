# IMAGE OPTIMIZATION PIPELINE (Phase 2.2)

## Description

This module provides an advanced, automated pipeline to compress, optimize, and safely parse Product Images submitted by Verified Store Owners. By integrating heavily performant Python scripts within the fast-paced Node.js application, we can guarantee that every image will load efficiently.

## Core Features

1. **WebP Generation:** All images uploaded are dynamically converted into `.webp` for maximal fidelity with the lowest possible size footprint.
2. **Quality Compressions:** The system dynamically adjusts scaling and lossy qualities through algorithms to safely ensure NO image uploaded to Supabase exceeds the _1.5MB_ maximum target threshold limit.
3. **AI Background Removal:** Optionally powered by `rembg`, stores can choose parameterize the complete removal of the photo's original background by isolating the focus (the product) leveraging embedded AI.
4. **Safety Network Fallbacks:** If the Python pipeline ever faults or exhausts, the service `imageOptimizerService.js` rescues the data stream by automatically ignoring the corruption and submitting the natively sized image into Supabase Storage.
5. **No Clutter Guarantee:** A node-side automatic GC sweeps every `.tmp` and raw image chunk processed locally instantly after the Supabase dispatch is completed.

---

## Endpoint Usage (Frontend Integration)

### Route

`POST /api/products/upload-image`
_(Requires Valid JWT authentication matching any store or owner role)_

### Accepted Modifiers:

- **FormData Upload:** Must be submitted exclusively as `multipart/form-data`.
- `image`: Provide the blob/file natively (Accepts: `.jpeg`, `.jpg`, `.png`, `.gif`, `.webp`)
- `remove_background`: (String/"Boolean") Default `false`. Set to `'true'` to invoke the AI logic.
- `max_size_mb`: (String/"Float") Configuration for the max bytes accepted target by Python compression algorithms. Defaults to `'1.5'`.

### Example Fetch Call:

```javascript
const formData = new FormData();
// Add the file object
formData.append("image", selectedFileBlob);

// Toggles
formData.append("remove_background", "true"); // optional
formData.append("max_size_mb", "1.5"); // optional

const uploadResponse = await fetch(
  "http://localhost:4000/api/products/upload-image",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`, // Important!
    },
    body: formData,
  },
);

const uploadData = await uploadResponse.json();
```

### JSON Response Schema

```json
{
  "success": true,
  "message": "Image optimized and uploaded successfully",
  "file": {
    "url": "https://upzodyuuikrwosliscgy.supabase.co/storage/v1/object/public/products/...webp",
    "path": "storekeeper123/4ce48bd8-...webp",
    "size": 756400,
    "originalSize": 3500200,
    "format": "webp",
    "removeBg": true,
    "metadata": {
      "bg_removed": true,
      "compressed": true,
      "original_size": 3500200,
      "final_size": 756400,
      "format": "WEBP"
    }
  }
}
```

## Python Module Ecosystem Requirements

To test or deploy this API functionality locally, you are forced to run `pip install -r scripts/requirements.txt` which will download `rembg`, `pillow`, and `onnxruntime`. The Render.com pipeline has already been natively updated in its `render.yaml` directives to fetch setup prior to execution on every deploy.
