"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LeaseForm from "@/components/forms/LeaseForm";

type Lease = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  propertyId: string;
  tenantId: string;
  property: { id: string; address: string };
  tenant: { id: string; name: string };
  _count: { payments: number };
};

const statusVariant: Record<string, "green" | "gray" | "red"> = {
  ACTIVE: "green",
  EXPIRED: "gray",
  TERMINATED: "red",
};

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lease | null>(null);

  const fetchLeases = useCallback(async () => {
    const res = await fetch("/api/leases");
    const data = await res.json();
    setLeases(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lease? All related payments will be removed.")) return;
    await fetch(`/api/leases/${id}`, { method: "DELETE" });
    fetchLeases();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (l: Lease) => {
    setEditing(l);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leases</h1>
          <p className="text-sm text-gray-500 mt-1">{leases.length} total leases</p>
        </div>
        <Button onClick={openCreate}>+ Add Lease</Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : leases.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400">No leases yet. Create your first one.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Property</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Tenant</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Period</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Rent/mo</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Payments</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leases.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium max-w-[180px] truncate">
                      <Link href={`/dashboard/properties/${l.property.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {l.property.address}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/tenants/${l.tenant.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {l.tenant.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      ${l.monthlyRent.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{l._count.payments}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[l.status] ?? "gray"}>{l.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(l)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(l.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Lease" : "Add Lease"}
      >
        <LeaseForm
          defaultValues={
            editing
              ? {
                  id: editing.id,
                  propertyId: editing.propertyId,
                  tenantId: editing.tenantId,
                  startDate: editing.startDate,
                  endDate: editing.endDate,
                  monthlyRent: editing.monthlyRent,
                  status: editing.status,
                }
              : undefined
          }
          onSuccess={() => {
            setModalOpen(false);
            fetchLeases();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
