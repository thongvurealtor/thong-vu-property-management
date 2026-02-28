"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type Lease = {
  id: string;
  property: { address: string };
  tenant: { name: string };
  monthlyRent: number;
};

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

function toDateInput(val: string | Date | undefined | null): string {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString().split("T")[0];
}

interface Props {
  defaultValues?: Partial<PaymentInput & { id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ defaultValues, onSuccess, onCancel }: Props) {
  const [error, setError] = useState("");
  const [leases, setLeases] = useState<Lease[]>([]);
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    fetch("/api/leases")
      .then((r) => r.json())
      .then(setLeases);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentInput>,
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          dueDate: toDateInput(defaultValues.dueDate),
          paidAt: toDateInput(defaultValues.paidAt),
          status: defaultValues.status ?? "PENDING",
        }
      : { status: "PENDING" },
  });

  const onSubmit = async (data: PaymentInput) => {
    setError("");
    const url = isEdit ? `/api/payments/${defaultValues!.id}` : "/api/payments";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Something went wrong");
      return;
    }
    onSuccess();
  };

  const leaseOptions = leases.map((l) => ({
    value: l.id,
    label: `${l.tenant.name} – ${l.property.address} ($${l.monthlyRent.toLocaleString()}/mo)`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        id="leaseId"
        label="Lease"
        options={leaseOptions}
        placeholder="Select lease..."
        {...register("leaseId")}
        error={errors.leaseId?.message}
      />
      <Input
        id="amount"
        label="Amount ($)"
        type="number"
        min={0}
        step="0.01"
        {...register("amount")}
        error={errors.amount?.message}
      />
      <Input
        id="dueDate"
        label="Due Date"
        type="date"
        {...register("dueDate")}
        error={errors.dueDate?.message}
      />
      <Select
        id="status"
        label="Status"
        options={statusOptions}
        {...register("status")}
        error={errors.status?.message}
      />
      <Input
        id="paidAt"
        label="Paid On (optional)"
        type="date"
        {...register("paidAt")}
        error={errors.paidAt?.message}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Record Payment"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
