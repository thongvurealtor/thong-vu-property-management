"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TenantForm from "@/components/forms/TenantForm";

type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { leases: number };
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  const fetchTenants = useCallback(async () => {
    const res = await fetch("/api/tenants");
    const data = await res.json();
    setTenants(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tenant? All related data will be removed.")) return;
    await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    fetchTenants();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditing(t);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">{tenants.length} total tenants</p>
        </div>
        <Button onClick={openCreate}>+ Add Tenant</Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400">No tenants yet. Add your first one.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Leases</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-5 py-3 text-gray-600">{t.email}</td>
                    <td className="px-5 py-3 text-gray-500">{t.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{t._count.leases}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/dashboard/tenants/${t.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
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
        title={editing ? "Edit Tenant" : "Add Tenant"}
      >
        <TenantForm
          defaultValues={
            editing
              ? { ...editing, phone: editing.phone ?? undefined }
              : undefined
          }
          onSuccess={() => {
            setModalOpen(false);
            fetchTenants();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
