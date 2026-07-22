import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export class PublicImageUploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function isValidImage(buffer: Buffer, type: keyof typeof imageTypes) {
  if (type === "image/jpeg") {
    return (
      buffer.length > 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (type === "image/png") {
    return (
      buffer.length > 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }

  return (
    buffer.length > 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export async function savePublicImage(
  entry: FormDataEntryValue | null,
  options: { directory: string; filePrefix: string },
) {
  if (!(entry instanceof File)) {
    throw new PublicImageUploadError("Bir görsel dosyası seçin.", 400);
  }

  if (entry.size === 0 || entry.size > MAX_IMAGE_SIZE) {
    throw new PublicImageUploadError("Görsel en fazla 5 MB olabilir.", 400);
  }

  if (!(entry.type in imageTypes)) {
    throw new PublicImageUploadError(
      "Yalnızca JPG, PNG veya WebP görsel yükleyebilirsiniz.",
      400,
    );
  }

  const type = entry.type as keyof typeof imageTypes;
  const buffer = Buffer.from(await entry.arrayBuffer());

  if (!isValidImage(buffer, type)) {
    throw new PublicImageUploadError("Geçerli bir görsel dosyası seçin.", 400);
  }

  const directory = path.join(process.cwd(), "public", "uploads", options.directory);
  const fileName = `${options.filePrefix}-${randomUUID()}.${imageTypes[type]}`;
  const imageUrl = `/uploads/${options.directory}/${fileName}`;

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), buffer);

  return imageUrl;
}
