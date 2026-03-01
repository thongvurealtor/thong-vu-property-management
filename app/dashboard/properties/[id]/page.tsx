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

  const serialized = {
    ...property,
    rent: property.rent,
    leases: property.leases.map((l) => ({
      ...l,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    maintenance: property.maintenance.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };

  return <PropertyDetailClient property={serialized} />;
}
