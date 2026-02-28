export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const leaseVariant: Record<string, "green" | "gray" | "red"> = {
  ACTIVE: "green",
  EXPIRED: "gray",
  TERMINATED: "red",
};
const paymentVariant: Record<string, "green" | "yellow" | "red"> = {
  PAID: "green",
  PENDING: "yellow",
  OVERDUE: "red",
};

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
    },
  });
  if (!tenant) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tenants">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <p>Email: {tenant.email}</p>
          {tenant.phone && <p>Phone: {tenant.phone}</p>}
          <p>Joined: {new Date(tenant.createdAt).toLocaleDateString()}</p>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Leases</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {tenant.leases.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No leases found.</p>
          ) : (
            tenant.leases.map((lease) => (
              <div key={lease.id} className="px-6 py-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{lease.property.address}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(lease.startDate).toLocaleDateString()} –{" "}
                      {new Date(lease.endDate).toLocaleDateString()} · ${lease.monthlyRent.toLocaleString()}/mo
                    </p>
                  </div>
                  <Badge variant={leaseVariant[lease.status] ?? "gray"}>{lease.status}</Badge>
                </div>
                {lease.payments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Payments</p>
                    {lease.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Due {new Date(p.dueDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${p.amount.toLocaleString()}</span>
                          <Badge variant={paymentVariant[p.status] ?? "gray"}>{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
