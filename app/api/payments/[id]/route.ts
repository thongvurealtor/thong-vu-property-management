import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const raw = paymentSchema.partial().parse(body);
    const data: Record<string, unknown> = { ...raw };
    if (raw.dueDate) data.dueDate = new Date(raw.dueDate);
    if (raw.paidAt) data.paidAt = new Date(raw.paidAt);
    else if (raw.paidAt === null) data.paidAt = null;

    const payment = await prisma.payment.update({
      where: { id },
      data,
      include: { lease: { include: { property: true, tenant: true } } },
    });
    return NextResponse.json(payment);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
