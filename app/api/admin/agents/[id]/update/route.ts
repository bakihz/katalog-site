import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUserRole } from "@/lib/userRole";

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
  const formData = await req.formData();
  const name = ((formData.get("name") as string) ?? "").trim();
  const username = ((formData.get("username") as string) ?? "").trim();
  const role = normalizeUserRole(formData.get("role"));
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0 || !name || !username) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=update`, {
      status: 303,
    });
  }

  try {
    await prisma.user.update({
      where: { id: agentId },
      data: { name, username, role } as Prisma.UserUpdateInput,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.redirect(`${baseUrl}/admin/agents?error=duplicate`, {
        status: 303,
      });
    }

    throw error;
  }

  return NextResponse.redirect(`${baseUrl}/admin/agents?success=updated`, {
    status: 303,
  });
}
