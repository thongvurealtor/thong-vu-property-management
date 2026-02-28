import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaseSchema } from "@/lib/validations";

export async function GET() {
  try {
    const leases = await prisma.lease.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: true,
        tenant: true,
        _count: { select: { payments: true } },
      },
    });
    return NextResponse.json(leases);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = leaseSchema.parse(body);
    const lease = await prisma.lease.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: { property: true, tenant: true },
    });
    return NextResponse.json(lease, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lease" }, { status: 500 });
  }
}
