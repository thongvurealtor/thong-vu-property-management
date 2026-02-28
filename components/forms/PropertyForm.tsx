"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useState } from "react";

const typeOptions = [
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Studio", label: "Studio" },
  { value: "Commercial", label: "Commercial" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "MAINTENANCE", label: "Under Maintenance" },
];

interface Props {
  defaultValues?: Partial<PropertyInput & { id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PropertyForm({ defaultValues, onSuccess, onCancel }: Props) {
  const [error, setError] = useState("");
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyInput>,
    defaultValues: defaultValues ?? { status: "AVAILABLE", bedrooms: 1, bathrooms: 1 },
  });

  const onSubmit = async (data: PropertyInput) => {
    setError("");
    const url = isEdit ? `/api/properties/${defaultValues!.id}` : "/api/properties";
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
        id="address"
        label="Address"
        placeholder="123 Main St, City, State"
        {...register("address")}
        error={errors.address?.message}
      />
      <Select
        id="type"
        label="Property Type"
        options={typeOptions}
        placeholder="Select type..."
        {...register("type")}
        error={errors.type?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="bedrooms"
          label="Bedrooms"
          type="number"
          min={0}
          {...register("bedrooms")}
          error={errors.bedrooms?.message}
        />
        <Input
          id="bathrooms"
          label="Bathrooms"
          type="number"
          min={0}
          {...register("bathrooms")}
          error={errors.bathrooms?.message}
        />
      </div>
      <Input
        id="rent"
        label="Monthly Rent ($)"
        type="number"
        min={0}
        step="0.01"
        placeholder="0.00"
        {...register("rent")}
        error={errors.rent?.message}
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Add Property"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
