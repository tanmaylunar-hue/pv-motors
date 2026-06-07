import { prisma } from "../lib/db";
import * as fs from "fs/promises";
import * as path from "path";

async function main() {
  console.log("Seeding database...");

  // Read data/catalogue.json
  const filePath = path.join(process.cwd(), "data", "catalogue.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  const items = data.catalogue;

  // Clear existing items in database (to start fresh)
  console.log("Clearing existing database entries...");
  await prisma.enquiry.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.vehicle.deleteMany({});

  for (const item of items) {
    console.log(`Processing: ${item.vehicle} - ${item.variant}`);

    // 1. Find or create Vehicle
    let vehicle = await prisma.vehicle.findFirst({
      where: { name: item.vehicle },
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          name: item.vehicle,
          category: item.category,
        },
      });
    }

    // Determine stockQuantity based on stockStatus in JSON
    let stockQuantity = 6;
    if (item.stockStatus === "low_stock") {
      stockQuantity = 3;
    } else if (item.stockStatus === "out_of_stock") {
      stockQuantity = 0;
    } else if (item.stockStatus === "pre_order") {
      stockQuantity = 0;
    }

    // 2. Create Variant
    await prisma.variant.create({
      data: {
        id: item.id,
        vehicleId: vehicle.id,
        name: item.variant,
        slug: item.slug,
        tagline: item.tagline,
        price: item.price,
        specifications: item.specifications,
        images: item.images,
        stockStatus: item.stockStatus,
        stockQuantity: stockQuantity,
        featured: item.featured,
        highlights: item.highlights,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
