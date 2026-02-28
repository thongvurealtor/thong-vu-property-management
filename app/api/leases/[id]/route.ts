import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaseSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: { property: true, tenant: true, payments: true },
    });
    if (!lease) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(lease);
  } catch {
    return NextResponse.json({ error: "Failed to fetch lease" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const raw = leaseSchema.partial().parse(body);
    const data: Record<string, unknown> = { ...raw };
    if (raw.startDate) data.startDate = new Date(raw.startDate);
    if (raw.endDate) data.endDate = new Date(raw.endDate);
    const lease = await prisma.lease.update({
      where: { id },
      data,
      include: { property: true, tenant: true },
    });
    return NextResponse.json(lease);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update lease" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lease.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lease" }, { status: 500 });
  }
}
