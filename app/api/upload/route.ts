import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — generous for hotel photos

/** Sanitizes a folder segment to [a-z0-9-_/] and prevents traversal. */
function safeFolder(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "baraha-hotel";
  const cleaned = value
    .replace(/[^a-zA-Z0-9_/-]/g, "")
    .replace(/^\/+|\/+$/g, "");
  return cleaned || "baraha-hotel";
}

/**
 * Admin-only image upload. Files are stored as *public* Vercel Blobs (the
 * URLs are rendered on the public website), but the upload endpoint itself
 * requires a valid admin session — anonymous visitors can't mint uploads.
 *
 * POST FormData: { file: File, folder?: string } → { url }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured" },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large — max 10 MB" },
      { status: 400 },
    );
  }

  const folder = safeFolder(formData.get("folder"));
  // addRandomSuffix guarantees unique paths even for same-named files.
  const blob = await put(`${folder}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
