"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  notificationSettingsSchema,
  NotificationSettingsInput,
} from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const alertMethodOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "Text (SMS)" },
  { value: "BOTH", label: "Both" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotificationSettingsInput>({
    resolver: zodResolver(notificationSettingsSchema) as Resolver<NotificationSettingsInput>,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        reset({
          email: data.email ?? "",
          phone: data.phone ?? "",
          defaultAlertEnabled: data.defaultAlertEnabled,
          defaultAlertDaysBefore: data.defaultAlertDaysBefore,
          defaultAlertMethod: data.defaultAlertMethod,
        });
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: NotificationSettingsInput) => {
    setError("");
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to save");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Notification Settings
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Contact Information
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Where should lease expiry alerts be sent?
          </p>
          <div className="space-y-3">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              id="phone"
              label="Phone Number (with country code)"
              type="tel"
              placeholder="+1234567890"
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Global Default Alert
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These settings apply to all leases unless overridden on a per-lease basis.
          </p>

          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register("defaultAlertEnabled")}
            />
            <span className="text-sm font-medium text-gray-700">
              Enable lease expiry alerts
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="defaultAlertDaysBefore"
              label="Days before expiry"
              type="number"
              min={1}
              {...register("defaultAlertDaysBefore")}
              error={errors.defaultAlertDaysBefore?.message}
            />
            <Select
              id="defaultAlertMethod"
              label="Notify via"
              options={alertMethodOptions}
              {...register("defaultAlertMethod")}
              error={errors.defaultAlertMethod?.message}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && (
          <p className="text-sm text-green-600 font-medium">
            Settings saved successfully!
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}
