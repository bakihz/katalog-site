import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const agent = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!agent) {
    return NextResponse.redirect(new URL("/admin/agents", req.url));
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: !agent.isActive },
  });

  return NextResponse.redirect(new URL("/admin/agents", req.url));
}
