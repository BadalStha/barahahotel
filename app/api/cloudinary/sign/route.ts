import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  // This route is outside the /admin middleware matcher — require a session
  // so anonymous visitors can't mint signed uploads against our account.
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { paramsToSign?: Record<string, string> };
  const { paramsToSign } = body;
  if (!paramsToSign) {
    return NextResponse.json({ error: "Missing paramsToSign" }, { status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({ signature });
}
