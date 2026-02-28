import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create properties
  const prop1 = await prisma.property.create({
    data: {
      address: "123 Oak Street, San Francisco, CA 94102",
      type: "Apartment",
      bedrooms: 2,
      bathrooms: 1,
      rent: 2500,
      status: "OCCUPIED",
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      address: "456 Maple Ave, San Francisco, CA 94103",
      type: "House",
      bedrooms: 3,
      bathrooms: 2,
      rent: 3800,
      status: "AVAILABLE",
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      address: "789 Pine Blvd, Oakland, CA 94601",
      type: "Condo",
      bedrooms: 1,
      bathrooms: 1,
      rent: 1800,
      status: "MAINTENANCE",
    },
  });

  // Create tenants
  const tenant1 = await prisma.tenant.create({
    data: { name: "Alice Johnson", email: "alice@example.com", phone: "+1 (415) 555-0101" },
  });

  const tenant2 = await prisma.tenant.create({
    data: { name: "Bob Smith", email: "bob@example.com", phone: "+1 (415) 555-0102" },
  });

  // Create leases
  const lease1 = await prisma.lease.create({
    data: {
      propertyId: prop1.id,
      tenantId: tenant1.id,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      monthlyRent: 2500,
      status: "ACTIVE",
    },
  });

  // Create payments
  await prisma.payment.createMany({
    data: [
      { leaseId: lease1.id, amount: 2500, dueDate: new Date("2024-01-01"), paidAt: new Date("2024-01-02"), status: "PAID" },
      { leaseId: lease1.id, amount: 2500, dueDate: new Date("2024-02-01"), paidAt: new Date("2024-02-03"), status: "PAID" },
      { leaseId: lease1.id, amount: 2500, dueDate: new Date("2024-03-01"), status: "OVERDUE" },
    ],
  });

  // Create maintenance requests
  await prisma.maintenanceRequest.createMany({
    data: [
      {
        propertyId: prop1.id,
        tenantId: tenant1.id,
        description: "Leaking faucet in bathroom",
        priority: "MEDIUM",
        status: "OPEN",
      },
      {
        propertyId: prop3.id,
        description: "HVAC unit not working – needs full replacement",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
      {
        propertyId: prop2.id,
        tenantId: tenant2.id,
        description: "Broken window latch in bedroom",
        priority: "LOW",
        status: "CLOSED",
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`  • ${3} properties`);
  console.log(`  • ${2} tenants`);
  console.log(`  • ${1} lease`);
  console.log(`  • ${3} payments`);
  console.log(`  • ${3} maintenance requests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
