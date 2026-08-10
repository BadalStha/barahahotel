/**
 * Client-side image upload. Sends the file to the admin-authenticated
 * /api/upload route (which stores it in Vercel Blob server-side), keeping
 * the BLOB_READ_WRITE_TOKEN out of the browser bundle.
 */
export async function uploadImageToBlob(
  file: File,
  folder = "baraha-hotel",
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Upload failed — please try again.");
  }
  return data.url;
}
