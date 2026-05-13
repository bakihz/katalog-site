import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payment = await prisma.payment.create({
      data: {
        customerName: body.customerName,
        companyName: body.companyName,
        description: body.description,
        amount: Number(body.amount),
        status: "Pending",
      },
    });

    return Response.json({
      success: true,
      payment,
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
