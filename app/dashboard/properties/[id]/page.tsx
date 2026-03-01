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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      leases: {
        include: {
          tenant: true,
          payments: {
            where: { dueDate: { gte: startOfMonth, lte: endOfMonth } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
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
        leases: property.leases.map((l) => {
          const monthPayment = l.payments[0];
          return {
            id: l.id,
            startDate: l.startDate.toISOString(),
            endDate: l.endDate.toISOString(),
            monthlyRent: l.monthlyRent,
            status: l.status,
            tenant: { id: l.tenant.id, name: l.tenant.name },
            currentMonthPayment: monthPayment
              ? {
                  status: monthPayment.status,
                  amount: monthPayment.amount,
                  method: monthPayment.paymentMethod,
                  paidAt: monthPayment.paidAt?.toISOString() ?? null,
                }
              : null,
          };
        }),
        maintenance: property.maintenance.map((m) => ({
          id: m.id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          createdAt: m.createdAt.toISOString(),
          requestedAt: m.requestedAt?.toISOString() ?? null,
          completedAt: m.completedAt?.toISOString() ?? null,
          cost: m.cost,
          fixedBy: m.fixedBy,
          tenant: m.tenant ? { id: m.tenant.id, name: m.tenant.name } : null,
        })),
      }}
    />
  );
}
