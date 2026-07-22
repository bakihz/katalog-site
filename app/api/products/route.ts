import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { showOnWebsite: true, logoIsActive: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(products);
}
