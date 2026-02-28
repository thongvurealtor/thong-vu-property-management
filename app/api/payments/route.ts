import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leaseId = searchParams.get("leaseId");
    const status = searchParams.get("status");

    const payments = await prisma.payment.findMany({
      where: {
        ...(leaseId ? { leaseId } : {}),
        ...(status ? { status: status as "PENDING" | "PAID" | "OVERDUE" } : {}),
      },
      orderBy: { dueDate: "desc" },
      include: { lease: { include: { property: true, tenant: true } } },
    });
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = paymentSchema.parse(body);
    const payment = await prisma.payment.create({
      data: {
        leaseId: data.leaseId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        status: data.status ?? "PENDING",
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
      },
      include: { lease: { include: { property: true, tenant: true } } },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
