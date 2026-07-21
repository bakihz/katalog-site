import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function isValidImage(buffer: Buffer, type: keyof typeof imageTypes) {
  if (type === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (type === "image/png") {
    return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  return buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const formData = await req.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Bir görsel dosyası seçin." }, { status: 400 });
  }

  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Görsel en fazla 5 MB olabilir." }, { status: 400 });
  }

  if (!(image.type in imageTypes)) {
    return NextResponse.json(
      { error: "Yalnızca JPG, PNG veya WebP görsel yükleyebilirsiniz." },
      { status: 400 },
    );
  }

  const type = image.type as keyof typeof imageTypes;
  const buffer = Buffer.from(await image.arrayBuffer());

  if (!isValidImage(buffer, type)) {
    return NextResponse.json({ error: "Geçerli bir görsel dosyası seçin." }, { status: 400 });
  }

  const directory = path.join(process.cwd(), "public", "uploads", "products");
  const fileName = `product-${productId}-${randomUUID()}.${imageTypes[type]}`;
  const imageUrl = `/uploads/products/${fileName}`;

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), buffer);
  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
