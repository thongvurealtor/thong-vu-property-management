"use client";

import { useEffect, useState, useCallback } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PaymentForm from "@/components/forms/PaymentForm";

type Payment = {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "PENDING" | "PAID" | "OVERDUE";
  paymentMethod: "CHECK" | "ZELLE" | "VENMO" | "ACH" | null;
  lease: {
    id: string;
    monthlyRent: number;
    property: { address: string };
    tenant: { name: string };
  };
};

const methodLabel: Record<string, string> = {
  CHECK: "Check",
  ZELLE: "Zelle",
  VENMO: "Venmo",
  ACH: "ACH",
};

const statusVariant: Record<string, "green" | "yellow" | "red"> = {
  PAID: "green",
  PENDING: "yellow",
  OVERDUE: "red",
};

const statusFilters = ["All", "PENDING", "PAID", "OVERDUE"];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    const url = filter !== "All" ? `/api/payments?status=${filter}` : "/api/payments";
    const res = await fetch(url);
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    fetchPayments();
  };

  const markAsPaid = async (p: Payment) => {
    await fetch(`/api/payments/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "PAID",
        paidAt: new Date().toISOString().split("T")[0],
      }),
    });
    fetchPayments();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    setModalOpen(true);
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}>+ Record Payment</Button>
      </div>

      {/* Summary */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: `$${totalAmount.toLocaleString()}`, color: "text-gray-900" },
            { label: "Collected", value: `$${paidAmount.toLocaleString()}`, color: "text-green-700" },
            {
              label: "Pending",
              value: `$${payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0).toLocaleString()}`,
              color: "text-yellow-700",
            },
            {
              label: "Overdue",
              value: `$${payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0).toLocaleString()}`,
              color: "text-red-700",
            },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </Card>
          ))}
        </div>
      )}

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
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : payments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400">No payments found.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Tenant</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Property</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Due Date</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Paid On</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Method</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.lease.tenant.name}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">
                      {p.lease.property.address}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">${p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.dueDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.paymentMethod ? methodLabel[p.paymentMethod] : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[p.status] ?? "gray"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        {p.status !== "PAID" && (
                          <Button variant="secondary" size="sm" onClick={() => markAsPaid(p)}>
                            Mark Paid
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
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
        title={editing ? "Edit Payment" : "Record Payment"}
      >
        <PaymentForm
          defaultValues={
            editing
              ? {
                  id: editing.id,
                  leaseId: editing.lease.id,
                  amount: editing.amount,
                  dueDate: editing.dueDate,
                  paidAt: editing.paidAt,
                  status: editing.status,
                  paymentMethod: editing.paymentMethod,
                }
              : undefined
          }
          onSuccess={() => {
            setModalOpen(false);
            fetchPayments();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
