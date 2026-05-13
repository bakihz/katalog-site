import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } = await context.params;

  await prisma.paymentProvider.updateMany({
    data: {
      isActive: false,
    },
  });

  await prisma.paymentProvider.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: true,
    },
  });

  return Response.redirect(new URL("/admin/providers", req.url));
}
