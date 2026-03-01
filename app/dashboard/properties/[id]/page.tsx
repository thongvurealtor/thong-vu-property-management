export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      leases: { include: { tenant: true }, orderBy: { createdAt: "desc" } },
      maintenance: { include: { tenant: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!property) notFound();

  return (
    <PropertyDetailClient
      property={{
        id: property.id,
        address: property.address,
        type: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        rent: property.rent,
        status: property.status,
        leases: property.leases.map((l) => ({
          id: l.id,
          startDate: l.startDate.toISOString(),
          endDate: l.endDate.toISOString(),
          monthlyRent: l.monthlyRent,
          status: l.status,
          tenant: { id: l.tenant.id, name: l.tenant.name },
        })),
        maintenance: property.maintenance.map((m) => ({
          id: m.id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          createdAt: m.createdAt.toISOString(),
          tenant: m.tenant ? { id: m.tenant.id, name: m.tenant.name } : null,
        })),
      }}
    />
  );
}
