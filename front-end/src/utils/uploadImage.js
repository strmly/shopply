/**
 * Upload an image file to local backend storage.
 * Returns the public URL path (e.g. /uploads/avatars/uuid.jpg)
 * which is served statically and proxied through Vite in dev.
 *
 * @param {File} file  - The File object to upload
 * @param {'avatar'|'product'|'general'} type - Storage subdirectory
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadImage = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/uploads/image?type=${type}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.url; // e.g. /uploads/avatars/abc123.jpg
};
