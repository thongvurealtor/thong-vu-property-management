"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema, LeaseInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type Property = { id: string; address: string };
type Tenant = { id: string; name: string };

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
];

const alertMethodOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "Text (SMS)" },
  { value: "BOTH", label: "Both" },
];

function toDateInput(val: string | Date | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString().split("T")[0];
}

interface Props {
  defaultValues?: Partial<LeaseInput & { id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LeaseForm({ defaultValues, onSuccess, onCancel }: Props) {
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const isEdit = !!defaultValues?.id;

  useEffect(() => {
    Promise.all([fetch("/api/properties"), fetch("/api/tenants")])
      .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
      .then(([props, tens]) => {
        setProperties(props);
        setTenants(tens);
      });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeaseInput>({
    resolver: zodResolver(leaseSchema) as Resolver<LeaseInput>,
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          startDate: toDateInput(defaultValues.startDate),
          endDate: toDateInput(defaultValues.endDate),
          status: defaultValues.status ?? "ACTIVE",
          alertEnabled: defaultValues.alertEnabled ?? false,
          alertDaysBefore: defaultValues.alertDaysBefore ?? null,
          alertMethod: defaultValues.alertMethod ?? null,
        }
      : { status: "ACTIVE", alertEnabled: false },
  });

  const alertEnabled = watch("alertEnabled");

  const onSubmit = async (data: LeaseInput) => {
    setError("");
    if (!data.alertEnabled) {
      data.alertDaysBefore = null;
      data.alertMethod = null;
    }
    const url = isEdit ? `/api/leases/${defaultValues!.id}` : "/api/leases";
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

  const propertyOptions = properties.map((p) => ({ value: p.id, label: p.address }));
  const tenantOptions = tenants.map((t) => ({ value: t.id, label: t.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        id="propertyId"
        label="Property"
        options={propertyOptions}
        placeholder="Select property..."
        {...register("propertyId")}
        error={errors.propertyId?.message}
      />
      <Select
        id="tenantId"
        label="Tenant"
        options={tenantOptions}
        placeholder="Select tenant..."
        {...register("tenantId")}
        error={errors.tenantId?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="startDate"
          label="Start Date"
          type="date"
          {...register("startDate")}
          error={errors.startDate?.message}
        />
        <Input
          id="endDate"
          label="End Date"
          type="date"
          {...register("endDate")}
          error={errors.endDate?.message}
        />
      </div>
      <Input
        id="monthlyRent"
        label="Monthly Rent ($)"
        type="number"
        min={0}
        step="0.01"
        {...register("monthlyRent")}
        error={errors.monthlyRent?.message}
      />
      {isEdit && (
        <Select
          id="status"
          label="Status"
          options={statusOptions}
          {...register("status")}
          error={errors.status?.message}
        />
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register("alertEnabled")}
          />
          <span className="text-sm font-medium text-gray-700">
            Custom alert for this lease
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-6">
          Override the global default. Leave unchecked to use global settings.
        </p>
      </div>

      {alertEnabled && (
        <div className="grid grid-cols-2 gap-3 pl-6">
          <Input
            id="alertDaysBefore"
            label="Days before end"
            type="number"
            min={1}
            placeholder="e.g. 30"
            {...register("alertDaysBefore")}
            error={errors.alertDaysBefore?.message}
          />
          <Select
            id="alertMethod"
            label="Notify via"
            options={alertMethodOptions}
            placeholder="Select..."
            {...register("alertMethod")}
            error={errors.alertMethod?.message}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Create Lease"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
