import { sendData, uploadImage } from "@/lib/api";
import imageCompression from "browser-image-compression";

async function maybeUploadFile(file) {
  if (!file) return null;
  if (typeof file === "string") return file;
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });
  const res = await uploadImage(compressed);
  if (res instanceof Error) throw res;
  if (!res?.img) throw new Error("Image upload returned empty URL");
  return res.img;
}

/**
 * Map rows → upload images → POST bulk create.
 * @param {string} endpoint e.g. "app/events/bulk"
 * @param {object[]} rows
 * @param {(row: object, imageUrl: string|null) => object} mapItem
 * @param {object} [extraBody] merged into POST body (e.g. { tabId })
 */
export async function submitBulkCreate(endpoint, rows, mapItem, extraBody = {}) {
  const items = [];
  for (const row of rows) {
    const imageUrl = await maybeUploadFile(row.image || row.file || row.iconFile);
    items.push(mapItem(row, imageUrl));
  }
  const response = await sendData(endpoint, { items, ...extraBody }, "POST");
  if (response instanceof Error) throw response;
  if (response?.status_code !== 200) {
    throw new Error(response?.message || "Bulk create failed");
  }
  return {
    createdCount: response?.data?.createdCount ?? 0,
    failedCount: response?.data?.failedCount ?? 0,
    message: response?.message,
    failed: response?.data?.failed || [],
  };
}

export async function submitBulkDelete(endpoint, body) {
  const response = await sendData(endpoint, body, "DELETE");
  if (response instanceof Error) throw response;
  if (response?.status_code !== 200) {
    throw new Error(response?.message || "Bulk delete failed");
  }
  return response;
}
