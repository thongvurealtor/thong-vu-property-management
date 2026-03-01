"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LeaseForm from "@/components/forms/LeaseForm";

type Payment = {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentMethod: string | null;
};

type Lease = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: string;
  property: { id: string; address: string };
  payments: Payment[];
};

type MaintenanceReq = {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  property: { id: string; address: string };
};

type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  leases: Lease[];
  maintenance: MaintenanceReq[];
};

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
const maintenanceVariant: Record<string, "red" | "yellow" | "gray"> = {
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "gray",
};

export default function TenantDetailClient({ tenant }: { tenant: Tenant }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const router = useRouter();

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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Leases</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAssignOpen(true)}>+ Assign to Property</Button>
            <Link href="/dashboard/leases">
              <Button variant="ghost" size="sm">Manage leases</Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {tenant.leases.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No leases found.</p>
          ) : (
            tenant.leases.map((lease) => (
              <div key={lease.id} className="px-6 py-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/properties/${lease.property.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {lease.property.address}
                    </Link>
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
                          {p.paymentMethod && (
                            <span className="text-gray-400 ml-1">via {p.paymentMethod}</span>
                          )}
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

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Maintenance Requests</h2>
          <Link href="/dashboard/maintenance">
            <Button variant="ghost" size="sm">Manage maintenance</Button>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {tenant.maintenance.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No maintenance requests.</p>
          ) : (
            tenant.maintenance.map((req) => (
              <div key={req.id} className="px-6 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{req.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <Link
                      href={`/dashboard/properties/${req.property.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {req.property.address}
                    </Link>
                  </div>
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

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Tenant to Property"
      >
        <LeaseForm
          defaultValues={{ tenantId: tenant.id }}
          onSuccess={() => {
            setAssignOpen(false);
            router.refresh();
          }}
          onCancel={() => setAssignOpen(false)}
        />
      </Modal>
    </div>
  );
}
