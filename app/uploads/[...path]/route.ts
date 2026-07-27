import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedDirectories = new Set(["categories", "homepage", "products"]);
const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getSafeUploadPath(segments: string[]) {
  if (segments.length !== 2 || !allowedDirectories.has(segments[0])) {
    return null;
  }

  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[a-zA-Z0-9._-]+$/.test(segment),
    )
  ) {
    return null;
  }

  const extension = path.extname(segments[1]).toLowerCase();

  if (!contentTypes[extension]) {
    return null;
  }

  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, ...segments);

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return null;
  }

  return { extension, filePath };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const requestedFile = getSafeUploadPath((await params).path);

  if (!requestedFile) {
    return NextResponse.json({ error: "Geçersiz görsel yolu." }, { status: 400 });
  }

  try {
    const file = await readFile(requestedFile.filePath);

    return new Response(file, {
      headers: {
        "Content-Type": contentTypes[requestedFile.extension],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";

    if (code === "ENOENT") {
      return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 404 });
    }

    console.error("[PublicUploadReadError]", error);
    return NextResponse.json(
      { error: "Görsel okunamadı." },
      { status: 500 },
    );
  }
}
