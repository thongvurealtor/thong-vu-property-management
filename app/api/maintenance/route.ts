import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maintenanceSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        ...(status ? { status: status as "OPEN" | "IN_PROGRESS" | "CLOSED" } : {}),
        ...(propertyId ? { propertyId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { property: true, tenant: true },
    });
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = maintenanceSchema.parse(body);
    const request = await prisma.maintenanceRequest.create({
      data: {
        propertyId: data.propertyId,
        tenantId: data.tenantId || null,
        description: data.description,
        priority: data.priority ?? "MEDIUM",
        status: data.status ?? "OPEN",
      },
      include: { property: true, tenant: true },
    });
    return NextResponse.json(request, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create maintenance request" }, { status: 500 });
  }
}
