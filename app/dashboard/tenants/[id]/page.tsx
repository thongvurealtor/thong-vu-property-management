export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantDetailClient from "@/components/TenantDetailClient";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      leases: {
        include: {
          property: true,
          payments: { orderBy: { dueDate: "desc" }, take: 5 },
        },
        orderBy: { createdAt: "desc" },
      },
      maintenance: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!tenant) notFound();

  return (
    <TenantDetailClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        createdAt: tenant.createdAt.toISOString(),
        leases: tenant.leases.map((l) => ({
          id: l.id,
          startDate: l.startDate.toISOString(),
          endDate: l.endDate.toISOString(),
          monthlyRent: l.monthlyRent,
          status: l.status,
          property: { id: l.property.id, address: l.property.address },
          payments: l.payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            dueDate: p.dueDate.toISOString(),
            status: p.status,
            paymentMethod: p.paymentMethod,
          })),
        })),
        maintenance: tenant.maintenance.map((m) => ({
          id: m.id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          createdAt: m.createdAt.toISOString(),
          requestedAt: m.requestedAt?.toISOString() ?? null,
          completedAt: m.completedAt?.toISOString() ?? null,
          cost: m.cost,
          fixedBy: m.fixedBy,
          property: { id: m.property.id, address: m.property.address },
        })),
      }}
    />
  );
}
