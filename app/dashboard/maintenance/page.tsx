"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import MaintenanceForm from "@/components/forms/MaintenanceForm";

type MaintenanceRequest = {
  id: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  requestedAt: string | null;
  completedAt: string | null;
  cost: number | null;
  fixedBy: string | null;
  property: { id: string; address: string };
  tenant: { id: string; name: string } | null;
};

const priorityVariant: Record<string, "red" | "yellow" | "gray"> = {
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "gray",
};

const statusVariant: Record<string, "yellow" | "blue" | "green"> = {
  OPEN: "yellow",
  IN_PROGRESS: "blue",
  CLOSED: "green",
};

const statusFilters = ["All", "OPEN", "IN_PROGRESS", "CLOSED"];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    const url = filter !== "All" ? `/api/maintenance?status=${filter}` : "/api/maintenance";
    const res = await fetch(url);
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this maintenance request?")) return;
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    fetchRequests();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (r: MaintenanceRequest) => {
    setEditing(r);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">{requests.length} request{requests.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}>+ New Request</Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "IN_PROGRESS" ? "In Progress" : s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400">No maintenance requests found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/dashboard/properties/${r.property.id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      {r.property.address}
                    </Link>
                    {r.tenant && (
                      <span className="text-sm text-gray-500">·{" "}
                        <Link href={`/dashboard/tenants/${r.tenant.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {r.tenant.name}
                        </Link>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
                    {r.requestedAt && (
                      <span>Requested: {new Date(r.requestedAt).toLocaleDateString()}</span>
                    )}
                    {r.completedAt && (
                      <span>Completed: {new Date(r.completedAt).toLocaleDateString()}</span>
                    )}
                    {r.cost != null && (
                      <span className="font-medium text-gray-600">Cost: ${r.cost.toLocaleString()}</span>
                    )}
                    {r.fixedBy && (
                      <span>Fixed by: {r.fixedBy}</span>
                    )}
                    {!r.requestedAt && !r.completedAt && !r.cost && !r.fixedBy && (
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={priorityVariant[r.priority]}>{r.priority}</Badge>
                  <Badge variant={statusVariant[r.status]}>{r.status.replace("_", " ")}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Update Maintenance Request" : "New Maintenance Request"}
      >
        <MaintenanceForm
          defaultValues={
            editing
              ? {
                  id: editing.id,
                  propertyId: editing.property.id,
                  tenantId: editing.tenant?.id ?? "",
                  description: editing.description,
                  priority: editing.priority,
                  status: editing.status,
                  requestedAt: editing.requestedAt,
                  completedAt: editing.completedAt,
                  cost: editing.cost,
                  fixedBy: editing.fixedBy,
                }
              : undefined
          }
          onSuccess={() => {
            setModalOpen(false);
            fetchRequests();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
