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

  const serialized = {
    ...tenant,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
    leases: tenant.leases.map((l) => ({
      ...l,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      property: {
        ...l.property,
        createdAt: l.property.createdAt.toISOString(),
        updatedAt: l.property.updatedAt.toISOString(),
      },
      payments: l.payments.map((p) => ({
        ...p,
        dueDate: p.dueDate.toISOString(),
        paidAt: p.paidAt?.toISOString() ?? null,
      })),
    })),
    maintenance: tenant.maintenance.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      property: {
        ...m.property,
        createdAt: m.property.createdAt.toISOString(),
        updatedAt: m.property.updatedAt.toISOString(),
      },
    })),
  };

  return <TenantDetailClient tenant={serialized} />;
}
