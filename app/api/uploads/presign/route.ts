import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateUploadUrl } from "@/lib/s3/presign";
import { originalKey } from "@/lib/s3/keys";
import {
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} from "@/lib/utils";
import crypto from "crypto";
import { z } from "zod";

const fileItemSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

const presignRequestSchema = z.object({
  files: z.array(fileItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = presignRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 }
      );
    }

    const { files } = parsed.data;
    const uploads = [];

    for (const file of files) {
      const ext = "." + (file.filename.split(".").pop()?.toLowerCase() ?? "");

      // Strict validation: MIME type + extension allowlists
      if (
        !ACCEPTED_MIME_TYPES.has(file.mimeType.toLowerCase()) ||
        !ACCEPTED_EXTENSIONS.has(ext)
      ) {
        return NextResponse.json(
          {
            error: `Unsupported file type for "${file.filename}". Accepted formats: JPEG, PNG, HEIC, WebP, MP4, MOV, AVI.`,
          },
          { status: 400 }
        );
      }

      const uploadId = crypto.randomUUID();
      const s3Key = originalKey(session.user.id, file.filename);
      const presignedUrl = await generateUploadUrl(
        s3Key,
        file.mimeType,
        file.size
      );

      uploads.push({
        uploadId,
        s3Key,
        presignedUrl,
        expiresIn: 900,
      });
    }

    return NextResponse.json({ uploads });
  } catch (err) {
    console.error("[POST /api/uploads/presign]", err);
    return NextResponse.json(
      { error: "Failed to generate presigned upload URLs" },
      { status: 500 }
    );
  }
}
