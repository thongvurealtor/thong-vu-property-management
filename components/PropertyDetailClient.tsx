"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LeaseForm from "@/components/forms/LeaseForm";

type CurrentMonthPayment = {
  status: string;
  amount: number;
  method: string | null;
  paidAt: string | null;
};

type Lease = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: string;
  tenant: { id: string; name: string };
  currentMonthPayment: CurrentMonthPayment | null;
};

const methodLabel: Record<string, string> = {
  CHECK: "Check",
  ZELLE: "Zelle",
  VENMO: "Venmo",
  ACH: "ACH",
};

type MaintenanceReq = {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  requestedAt: string | null;
  completedAt: string | null;
  cost: number | null;
  fixedBy: string | null;
  tenant: { id: string; name: string } | null;
};

type Property = {
  id: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  status: string;
  leases: Lease[];
  maintenance: MaintenanceReq[];
};

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

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const router = useRouter();

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
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAssignOpen(true)}>+ Assign Tenant</Button>
            <Link href="/dashboard/leases">
              <Button variant="ghost" size="sm">Manage leases</Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {property.leases.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No leases found.</p>
          ) : (
            property.leases.map((lease) => (
              <div key={lease.id} className="px-6 py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/tenants/${lease.tenant.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {lease.tenant.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(lease.startDate).toLocaleDateString()} –{" "}
                      {new Date(lease.endDate).toLocaleDateString()} · ${lease.monthlyRent.toLocaleString()}/mo
                    </p>
                  </div>
                  <Badge variant={leaseVariant[lease.status] ?? "gray"}>{lease.status}</Badge>
                </div>
                {lease.status === "ACTIVE" && (
                  <div className="flex items-center gap-2 text-sm">
                    {lease.currentMonthPayment?.status === "PAID" ? (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">
                          Paid ${lease.currentMonthPayment.amount.toLocaleString()}
                          {lease.currentMonthPayment.method && ` via ${methodLabel[lease.currentMonthPayment.method] ?? lease.currentMonthPayment.method}`}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="font-medium">Not paid this month</span>
                      </span>
                    )}
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
          {property.maintenance.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-400">No maintenance requests.</p>
          ) : (
            property.maintenance.map((req) => (
              <div key={req.id} className="px-6 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{req.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : new Date(req.createdAt).toLocaleDateString()}</span>
                      {req.tenant && (
                        <>
                          <span>·</span>
                          <Link
                            href={`/dashboard/tenants/${req.tenant.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {req.tenant.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={maintenanceVariant[req.priority] ?? "gray"}>{req.priority}</Badge>
                    <Badge variant={req.status === "CLOSED" ? "green" : req.status === "IN_PROGRESS" ? "blue" : "yellow"}>
                      {req.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {(req.cost != null || req.fixedBy || req.completedAt) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                    {req.cost != null && <span className="text-gray-600 font-medium">${req.cost.toLocaleString()}</span>}
                    {req.fixedBy && <span>by {req.fixedBy}</span>}
                    {req.completedAt && <span>completed {new Date(req.completedAt).toLocaleDateString()}</span>}
                  </div>
                )}
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
          defaultValues={{ propertyId: property.id }}
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
