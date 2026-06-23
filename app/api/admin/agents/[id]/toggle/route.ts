import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = getBaseUrl(req);
  const agent = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!agent) {
    return NextResponse.redirect(`${baseUrl}/admin/agents`);
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: !agent.isActive },
  });

  return NextResponse.redirect(`${baseUrl}/admin/agents`);
}
