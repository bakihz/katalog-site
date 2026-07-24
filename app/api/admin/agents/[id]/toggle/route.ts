import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = getRequestBaseUrl(req);
  const agent = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!agent) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=not-found`, {
      status: 303,
    });
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: !agent.isActive },
  });

  return NextResponse.redirect(`${baseUrl}/admin/agents?success=status`, {
    status: 303,
  });
}
