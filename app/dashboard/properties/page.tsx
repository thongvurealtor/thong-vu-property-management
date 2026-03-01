"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PropertyForm from "@/components/forms/PropertyForm";

type Property = {
  id: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  monthlyPaymentStatus: "PAID" | "UNPAID" | "NO_LEASE";
  activeTenantName: string | null;
  _count: { leases: number; maintenance: number };
};

const statusVariant: Record<string, "green" | "blue" | "orange"> = {
  AVAILABLE: "green",
  OCCUPIED: "blue",
  MAINTENANCE: "orange",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const fetchProperties = useCallback(async () => {
    const res = await fetch("/api/properties");
    const data = await res.json();
    setProperties(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property? All related data will be removed.")) return;
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    fetchProperties();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} total properties</p>
        </div>
        <Button onClick={openCreate}>+ Add Property</Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : properties.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400">No properties yet. Add your first one.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.address}</p>
                  <p className="text-sm text-gray-500">{p.type} · {p.bedrooms}bd / {p.bathrooms}ba</p>
                </div>
                <Badge variant={statusVariant[p.status] ?? "gray"}>{p.status}</Badge>
              </div>
              <p className="text-xl font-bold text-gray-900">${p.rent.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              {p.monthlyPaymentStatus !== "NO_LEASE" && (
                <div className="flex items-center gap-2 text-sm">
                  {p.monthlyPaymentStatus === "PAID" ? (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Paid this month</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-medium">Not paid this month</span>
                    </span>
                  )}
                  {p.activeTenantName && (
                    <span className="text-gray-400 text-xs">· {p.activeTenantName}</span>
                  )}
                </div>
              )}
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{p._count.leases} lease{p._count.leases !== 1 ? "s" : ""}</span>
                <span>{p._count.maintenance} maintenance</span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <Link href={`/dashboard/properties/${p.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Property" : "Add Property"}
      >
        <PropertyForm
          defaultValues={editing ?? undefined}
          onSuccess={() => {
            setModalOpen(false);
            fetchProperties();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
