import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationSettingsSchema } from "@/lib/validations";

export async function GET() {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { id: "default" },
      });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = notificationSettingsSchema.parse(body);
    const settings = await prisma.notificationSettings.upsert({
      where: { id: "default" },
      update: {
        email: data.email || null,
        phone: data.phone || null,
        defaultAlertEnabled: data.defaultAlertEnabled,
        defaultAlertDaysBefore: data.defaultAlertDaysBefore,
        defaultAlertMethod: data.defaultAlertMethod,
      },
      create: {
        id: "default",
        email: data.email || null,
        phone: data.phone || null,
        defaultAlertEnabled: data.defaultAlertEnabled,
        defaultAlertDaysBefore: data.defaultAlertDaysBefore,
        defaultAlertMethod: data.defaultAlertMethod,
      },
    });
    return NextResponse.json(settings);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: unknown }).issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
