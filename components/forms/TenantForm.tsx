"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, TenantInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";

interface Props {
  defaultValues?: Partial<TenantInput & { id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TenantForm({ defaultValues, onSuccess, onCancel }: Props) {
  const [error, setError] = useState("");
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: defaultValues ?? {},
  });

  const onSubmit = async (data: TenantInput) => {
    setError("");
    const url = isEdit ? `/api/tenants/${defaultValues!.id}` : "/api/tenants";
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Full Name"
        placeholder="Jane Doe"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="jane@example.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        id="phone"
        label="Phone Number (optional)"
        type="tel"
        placeholder="+1 (555) 000-0000"
        {...register("phone")}
        error={errors.phone?.message}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Add Tenant"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
