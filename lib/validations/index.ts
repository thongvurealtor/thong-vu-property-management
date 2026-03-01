import { z } from "zod";

export const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  type: z.string().min(1, "Type is required"),
  bedrooms: z.coerce.number().int().min(0, "Must be 0 or more"),
  bathrooms: z.coerce.number().int().min(0, "Must be 0 or more"),
  rent: z.coerce.number().positive("Must be positive"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).optional(),
});

export const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export const leaseSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  monthlyRent: z.coerce.number().positive("Must be positive"),
  status: z.enum(["ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  alertEnabled: z.coerce.boolean().optional(),
  alertDaysBefore: z.coerce.number().int().min(1).optional().nullable(),
  alertMethod: z.enum(["EMAIL", "SMS", "BOTH"]).optional().nullable(),
});

export const notificationSettingsSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  defaultAlertEnabled: z.coerce.boolean(),
  defaultAlertDaysBefore: z.coerce.number().int().min(1, "Must be at least 1 day"),
  defaultAlertMethod: z.enum(["EMAIL", "SMS", "BOTH"]),
});

export const maintenanceSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
});

export const paymentSchema = z.object({
  leaseId: z.string().min(1, "Lease is required"),
  amount: z.coerce.number().positive("Must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  paidAt: z.string().optional().nullable(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type LeaseInput = z.infer<typeof leaseSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
