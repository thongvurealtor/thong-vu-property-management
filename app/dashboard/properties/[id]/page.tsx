export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const statusVariant: Record<string, "green" | "blue" | "orange"> = {
  AVAILABLE: "green",
  OCCUPIED: "blue",
  MAINTENANCE: "orange",
};
const leaseVariant: Record<string, "green" | "gray" | "red"> = {
  ACTIVE: "green",
  EXPIRED: "gray",
  TERMINATED: "red",
};
const maintenanceVariant: Record<string, "red" | "yellow" | "gray"> = {
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "gray",
};

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
      maintenance: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/properties">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
            <p className="text-gray-500 mt-1">
              {property.type} · {property.bedrooms} bed / {property.bathrooms} bath
            </p>
          </div>
          <Badge variant={statusVariant[property.status] ?? "gray"}>{property.status}</Badge>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-4">
          ${property.rent.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
        </p>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Leases</h2>
          <Link href="/dashboard/leases">
            <Button variant="ghost" size="sm">Manage leases</Button>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {property.leases.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No leases found.</p>
          ) : (
            property.leases.map((lease) => (
              <div key={lease.id} className="px-6 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{lease.tenant.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(lease.startDate).toLocaleDateString()} –{" "}
                    {new Date(lease.endDate).toLocaleDateString()} · ${lease.monthlyRent.toLocaleString()}/mo
                  </p>
                </div>
                <Badge variant={leaseVariant[lease.status] ?? "gray"}>{lease.status}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Maintenance Requests</h2>
          <Link href="/dashboard/maintenance">
            <Button variant="ghost" size="sm">Manage maintenance</Button>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {property.maintenance.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No maintenance requests.</p>
          ) : (
            property.maintenance.map((req) => (
              <div key={req.id} className="px-6 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{req.description}</p>
                  <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={maintenanceVariant[req.priority] ?? "gray"}>{req.priority}</Badge>
                  <Badge variant={req.status === "CLOSED" ? "green" : req.status === "IN_PROGRESS" ? "blue" : "yellow"}>
                    {req.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
