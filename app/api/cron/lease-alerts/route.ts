import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAlert } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.notificationSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    return NextResponse.json({ message: "No notification settings configured" });
  }

  const activeLeases = await prisma.lease.findMany({
    where: { status: "ACTIVE", alertSentAt: null },
    include: { tenant: true, property: true },
  });

  const now = new Date();
  let sent = 0;

  for (const lease of activeLeases) {
    const useCustom = lease.alertEnabled && lease.alertDaysBefore && lease.alertMethod;
    const shouldAlert = useCustom ? true : settings.defaultAlertEnabled;
    if (!shouldAlert) continue;

    const daysBefore = useCustom ? lease.alertDaysBefore! : settings.defaultAlertDaysBefore;
    const method = useCustom ? lease.alertMethod! : settings.defaultAlertMethod;

    const daysUntilEnd = Math.ceil(
      (lease.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEnd <= daysBefore && daysUntilEnd > 0) {
      try {
        await sendAlert(method, settings.email, settings.phone, {
          tenantName: lease.tenant.name,
          propertyAddress: lease.property.address,
          endDate: lease.endDate,
          daysUntilEnd,
        });
        await prisma.lease.update({
          where: { id: lease.id },
          data: { alertSentAt: now },
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send alert for lease ${lease.id}:`, err);
      }
    }
  }

  return NextResponse.json({ message: `Processed ${activeLeases.length} leases, sent ${sent} alerts` });
}
