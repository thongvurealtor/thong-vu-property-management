import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maintenanceSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: true, tenant: true },
    });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance request" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = maintenanceSchema.partial().parse(body);
    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...data,
        tenantId: data.tenantId || null,
      },
      include: { property: true, tenant: true },
    });
    return NextResponse.json(request);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update maintenance request" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.maintenanceRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete maintenance request" }, { status: 500 });
  }
}
