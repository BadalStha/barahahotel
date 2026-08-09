/**
 * Baraha Hotel — development seed.
 *
 * Run with: `npm run db:seed` (or `npx prisma db seed`).
 *
 * Requires ADMIN_PASSWORD in .env — the seeded admin user's password.
 * Everything is idempotent: re-running replaces menu items and room
 * images, and upserts the admin user and site settings.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@barahahotel.com";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Baraha Admin";
const ADMIN_ROLE = "OWNER" as const;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type RoomTypeSeed = {
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  maxOccupancy: number;
  sizeSqft: number;
  amenities: string[];
  images: { url: string; altText: string; sortOrder: number }[];
};

const roomTypeSeeds: RoomTypeSeed[] = [
  {
    name: "Standard Room",
    slug: "standard-room",
    description:
      "Comfortable double room with garden views, hot water, and a quiet desk corner.",
    basePrice: "1500",
    maxOccupancy: 2,
    sizeSqft: 180,
    amenities: ["Free WiFi", "Hot water", "Garden view", "Writing desk"],
    images: [
      { url: "/images/rooms/standard-1.jpg", altText: "Standard room with a double bed", sortOrder: 1 },
      { url: "/images/rooms/standard-2.jpg", altText: "Standard room bathroom", sortOrder: 2 },
    ],
  },
  {
    name: "Deluxe Room",
    slug: "deluxe-room",
    description:
      "Spacious room with a private balcony overlooking the Dhankuta hills.",
    basePrice: "2500",
    maxOccupancy: 3,
    sizeSqft: 260,
    amenities: ["Free WiFi", "Balcony", "Hill view", "Hot water", "Room service"],
    images: [
      { url: "/images/rooms/deluxe-1.jpg", altText: "Deluxe room with a balcony", sortOrder: 1 },
      { url: "/images/rooms/deluxe-2.jpg", altText: "Deluxe room seating area", sortOrder: 2 },
    ],
  },
  {
    name: "Family Suite",
    slug: "family-suite",
    description:
      "Two-bedroom suite with a living room and kitchenette — ideal for families and trekkers.",
    basePrice: "4000",
    maxOccupancy: 5,
    sizeSqft: 420,
    amenities: ["Free WiFi", "Two bedrooms", "Living room", "Kitchenette", "Hill view"],
    images: [
      { url: "/images/rooms/suite-1.jpg", altText: "Family suite living room", sortOrder: 1 },
      { url: "/images/rooms/suite-2.jpg", altText: "Family suite bedroom", sortOrder: 2 },
    ],
  },
];

type FoodCategorySeed = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS" | "BEVERAGES";

type FoodItemSeed = {
  name: string;
  category: FoodCategorySeed;
  price: string;
  description: string;
  imageUrl: string;
};

const foodItemSeeds: FoodItemSeed[] = [
  { name: "Nepali Breakfast Set", category: "BREAKFAST", price: "450", description: "Sel roti, aloo tama, eggs, and chiya.", imageUrl: "/images/food/breakfast-set.jpg" },
  { name: "Milk Tea (Chiya)", category: "BREAKFAST", price: "80", description: "Nepali milk tea brewed with ginger and cardamom.", imageUrl: "/images/food/milk-tea.jpg" },
  { name: "Dal Bhat", category: "LUNCH", price: "350", description: "Steamed rice with lentil soup, seasonal vegetables, and pickle.", imageUrl: "/images/food/dal-bhat.jpg" },
  { name: "Chicken Chow Mein", category: "LUNCH", price: "300", description: "Wok-tossed noodles with chicken and vegetables.", imageUrl: "/images/food/chow-mein.jpg" },
  { name: "Gundruk Soup with Rice", category: "DINNER", price: "400", description: "Fermented leafy-green soup — a Dhankuta speciality.", imageUrl: "/images/food/gundruk-soup.jpg" },
  { name: "Mutton Sekuwa", category: "DINNER", price: "650", description: "Char-grilled marinated mutton served with chutney.", imageUrl: "/images/food/sekuwa.jpg" },
  { name: "Sel Roti", category: "SNACKS", price: "120", description: "Crisp ring-shaped rice doughnuts, warm from the pan.", imageUrl: "/images/food/sel-roti.jpg" },
  { name: "French Fries", category: "SNACKS", price: "150", description: "Golden fries with tomato ketchup.", imageUrl: "/images/food/fries.jpg" },
  { name: "Masala Chai", category: "BEVERAGES", price: "100", description: "Spiced milk tea with aromatic masala.", imageUrl: "/images/food/masala-chai.jpg" },
  { name: "Fresh Orange Juice", category: "BEVERAGES", price: "250", description: "Freshly squeezed local oranges.", imageUrl: "/images/food/orange-juice.jpg" },
];

const siteSettings = [
  { key: "hotel_name", value: "Baraha Hotel and Lodge" },
  { key: "location", value: "Bhedetar, Dhankuta, Nepal" },
  { key: "phone", value: "+977-00-0000000" },
  { key: "email", value: "info@barahahotel.com" },
];

async function main() {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add ADMIN_PASSWORD=<your-password> to .env and re-run the seed.",
    );
  }

  // 1. Admin user
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, name: ADMIN_NAME, role: ADMIN_ROLE },
    create: { email: ADMIN_EMAIL, passwordHash, name: ADMIN_NAME, role: ADMIN_ROLE },
  });

  // 2. Room types + images
  for (const seed of roomTypeSeeds) {
    const { images, ...data } = seed;
    const roomType = await prisma.roomType.upsert({
      where: { slug: seed.slug },
      update: data,
      create: data,
    });
    await prisma.roomImage.deleteMany({ where: { roomTypeId: roomType.id } });
    await prisma.roomImage.createMany({
      data: images.map((img) => ({ ...img, roomTypeId: roomType.id })),
    });
  }

  // 3. Food menu (upsert by unique name in one transaction, so re-running
  //    the seed never breaks food orders that already reference items)
  await prisma.$transaction(
    foodItemSeeds.map((item) =>
      prisma.foodMenuItem.upsert({
        where: { name: item.name },
        update: item,
        create: item,
      }),
    ),
  );

  // 4. Site settings
  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: JSON.stringify(s.value) },
      create: { key: s.key, value: JSON.stringify(s.value) },
    });
  }

  // 5. Report
  const [roomTypeCount, foodCount, imageCount] = await Promise.all([
    prisma.roomType.count(),
    prisma.foodMenuItem.count(),
    prisma.roomImage.count(),
  ]);

  console.log("Seed complete:");
  console.log(`  • Admin user : ${admin.email} (${admin.role}) — password from ADMIN_PASSWORD`);
  console.log(`  • Room types : ${roomTypeCount} (${roomTypeSeeds.map((r) => r.name).join(", ")})`);
  console.log(`  • Room images: ${imageCount}`);
  console.log(`  • Menu items : ${foodCount} across ${new Set(foodItemSeeds.map((f) => f.category)).size} categories`);
  console.log(`  • Settings   : ${siteSettings.length} (${siteSettings.map((s) => s.key).join(", ")})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
