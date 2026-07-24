import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = getRequestBaseUrl(req);
  const formData = await req.formData();
  const confirmUsername = (
    (formData.get("confirmUsername") as string) ?? ""
  ).trim();
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=not-found`, {
      status: 303,
    });
  }

  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    include: { _count: { select: { payments: true } } },
  });

  if (!agent) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=not-found`, {
      status: 303,
    });
  }

  if (agent._count.payments > 0) {
    return NextResponse.redirect(
      `${baseUrl}/admin/agents?error=has-payments`,
      { status: 303 },
    );
  }

  if (confirmUsername !== agent.username) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=confirm`, {
      status: 303,
    });
  }

  await prisma.user.delete({
    where: { id: agentId },
  });

  return NextResponse.redirect(`${baseUrl}/admin/agents?success=deleted`, {
    status: 303,
  });
}
