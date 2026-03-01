import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const properties = await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leases: true, maintenance: true } },
        leases: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            tenant: { select: { name: true } },
            payments: {
              where: {
                dueDate: { gte: startOfMonth, lte: endOfMonth },
              },
              select: { status: true },
            },
          },
        },
      },
    });

    const result = properties.map((p) => {
      const activeLease = p.leases[0];
      let monthlyPaymentStatus: "PAID" | "UNPAID" | "NO_LEASE" = "NO_LEASE";
      let activeTenantName: string | null = null;

      if (activeLease) {
        activeTenantName = activeLease.tenant.name;
        const monthPayment = activeLease.payments[0];
        monthlyPaymentStatus = monthPayment?.status === "PAID" ? "PAID" : "UNPAID";
      }

      const { leases: _leases, ...rest } = p;
      void _leases;
      return { ...rest, monthlyPaymentStatus, activeTenantName };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = propertySchema.parse(body);
    const property = await prisma.property.create({ data });
    return NextResponse.json(property, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
