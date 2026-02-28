"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema, MaintenanceInput } from "@/lib/validations";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

type Property = { id: string; address: string };
type Tenant = { id: string; name: string };

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

interface Props {
  defaultValues?: Partial<MaintenanceInput & { id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MaintenanceForm({ defaultValues, onSuccess, onCancel }: Props) {
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
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: defaultValues ?? { priority: "MEDIUM", status: "OPEN" },
  });

  const onSubmit = async (data: MaintenanceInput) => {
    setError("");
    const url = isEdit ? `/api/maintenance/${defaultValues!.id}` : "/api/maintenance";
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
  const tenantOptions = [
    { value: "", label: "None (no tenant)" },
    ...tenants.map((t) => ({ value: t.id, label: t.name })),
  ];

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
        label="Tenant (optional)"
        options={tenantOptions}
        {...register("tenantId")}
        error={errors.tenantId?.message}
      />
      <Textarea
        id="description"
        label="Description"
        placeholder="Describe the issue..."
        {...register("description")}
        error={errors.description?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          id="priority"
          label="Priority"
          options={priorityOptions}
          {...register("priority")}
          error={errors.priority?.message}
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
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Submit Request"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
