export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

async function getStats() {
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const [
    totalProperties,
    availableProperties,
    totalTenants,
    activeLeases,
    openMaintenance,
    overduePayments,
    recentMaintenance,
    recentPayments,
    expiringLeases,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.tenant.count(),
    prisma.lease.count({ where: { status: "ACTIVE" } }),
    prisma.maintenanceRequest.count({ where: { status: { not: "CLOSED" } } }),
    prisma.payment.count({ where: { status: "OVERDUE" } }),
    prisma.maintenanceRequest.findMany({
      where: { status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { property: true },
    }),
    prisma.payment.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { lease: { include: { property: true, tenant: true } } },
    }),
    prisma.lease.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: sixtyDaysFromNow, gte: new Date() },
      },
      orderBy: { endDate: "asc" },
      take: 5,
      include: { property: true, tenant: true },
    }),
  ]);

  return {
    totalProperties,
    availableProperties,
    totalTenants,
    activeLeases,
    openMaintenance,
    overduePayments,
    recentMaintenance,
    recentPayments,
    expiringLeases,
  };
}

const statCards = [
  {
    title: "Total Properties",
    key: "totalProperties" as const,
    sub: (s: Awaited<ReturnType<typeof getStats>>) => `${s.availableProperties} available`,
    color: "bg-blue-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    href: "/dashboard/properties",
  },
  {
    title: "Total Tenants",
    key: "totalTenants" as const,
    sub: () => "Registered tenants",
    color: "bg-purple-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: "/dashboard/tenants",
  },
  {
    title: "Active Leases",
    key: "activeLeases" as const,
    sub: () => "Currently active",
    color: "bg-green-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: "/dashboard/leases",
  },
  {
    title: "Open Maintenance",
    key: "openMaintenance" as const,
    sub: (s: Awaited<ReturnType<typeof getStats>>) =>
      `${s.overduePayments} overdue payment${s.overduePayments !== 1 ? "s" : ""}`,
    color: "bg-orange-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: "/dashboard/maintenance",
  },
];

const priorityVariant: Record<string, "red" | "yellow" | "gray"> = {
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "gray",
};

const statusVariant: Record<string, "yellow" | "orange" | "red"> = {
  PENDING: "yellow",
  OVERDUE: "red",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your property portfolio</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-xl`}>{card.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats[card.key]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub(stats)}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Expiring leases */}
      {stats.expiringLeases.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Leases Expiring Soon
            </h2>
            <Link href="/dashboard/leases" className="text-xs text-blue-600 hover:underline">
              View all leases
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.expiringLeases.map((lease) => {
              const daysLeft = Math.ceil(
                (new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={lease.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {lease.tenant.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lease.property.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={daysLeft <= 14 ? "red" : daysLeft <= 30 ? "yellow" : "gray"}>
                      {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                    </Badge>
                    {lease.alertSentAt && (
                      <span className="text-xs text-green-600" title="Alert sent">
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open maintenance */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Open Maintenance Requests</h2>
            <Link href="/dashboard/maintenance" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentMaintenance.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No open requests</p>
            ) : (
              stats.recentMaintenance.map((req) => (
                <div key={req.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{req.property.address}</p>
                    <p className="text-xs text-gray-500 truncate">{req.description}</p>
                  </div>
                  <Badge variant={priorityVariant[req.priority] ?? "gray"}>{req.priority}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming payments */}
        <Card>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Upcoming &amp; Overdue Payments</h2>
            <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No pending payments</p>
            ) : (
              stats.recentPayments.map((payment) => (
                <div key={payment.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {payment.lease.tenant.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.lease.property.address} · Due{" "}
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-800">
                      ${payment.amount.toLocaleString()}
                    </span>
                    <Badge variant={statusVariant[payment.status] ?? "gray"}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
