import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const result = await prisma.product.updateMany({
    where: {
      showOnWebsite: true,
      NOT: { publicationStatus: "published" },
    },
    data: {
      publicationStatus: "published",
      publishedAt: new Date(),
    },
  });

  console.log(
    `${result.count} mevcut katalog ürünü yeni yayın durumuna aktarıldı.`,
  );
} finally {
  await prisma.$disconnect();
}
