import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      showOnWebsite: true,
      logoIsActive: true,
      catalogCategory: { isActive: true },
      OR: [
        { catalogSubcategoryId: null },
        { catalogSubcategory: { isActive: true } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(products);
}
