import { prisma } from "@/lib/prisma";
import csv from "csv-parser";
import { Readable } from "stream";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "Dosya yok",
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const results: any[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(buffer)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    for (const item of results) {
      await prisma.product.upsert({
        where: {
          stockCode: item.stockCode || "",
        },

        update: {
          name: item.name || "",

          slug: slugify(item.name || ""),

          description: item.description || "",

          price: Number(item.price || 0),

          brand: item.brand || "",

          category: item.category || "",

          subCategory: item.subCategory || "",

          stockStatus: item.stockStatus || "",

          unit: item.unit || "",

          imageUrl: item.imageUrl || "",
        },

        create: {
          stockCode: item.stockCode || "",

          name: item.name || "",

          slug: slugify(item.name || ""),

          description: item.description || "",

          price: Number(item.price || 0),

          brand: item.brand || "",

          category: item.category || "",

          subCategory: item.subCategory || "",

          stockStatus: item.stockStatus || "",

          unit: item.unit || "",

          imageUrl: item.imageUrl || "",
        },
      });
    }

    return Response.json({
      success: true,
      count: results.length,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
