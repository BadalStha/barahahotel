/**
 * Baraha Hotel — development seed.
 *
 * Run with: `npm run db:seed` (or `npx prisma db seed`).
 *
 * Requires ADMIN_PASSWORD in .env — the seeded admin user's password.
 * Everything is idempotent: re-running upserts the admin, room types,
 * rooms, room entries, and site settings, refreshes menu items, and
 * recreates demo room charges.
 *
 * NOTE: demo-only data — re-running resets room statuses to AVAILABLE
 * and wipes/recreates room charges, so don't re-seed a database that has
 * real operational data.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { generateInvoice } from "@/lib/invoice";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@barahahotel.com";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Baraha Admin";
const ADMIN_ROLE = "OWNER" as const;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** A Date at noon, offset by n days from today (noon avoids DST edge cases). */
function atNoon(offsetDays: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

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

const siteSettings = [
  { key: "hotel_name", value: "Baraha Hotel and Lodge" },
  { key: "tagline", value: "A Himalayan hill-station retreat in Bhedetar, Dhankuta" },
  { key: "location", value: "Bhedetar, Dhankuta, Nepal" },
  { key: "phone", value: "+977-00-0000000" },
  { key: "email", value: "info@barahahotel.com" },
  { key: "social_facebook", value: "https://facebook.com/barahahotel" },
  { key: "social_instagram", value: "https://instagram.com/barahahotel" },
  { key: "social_twitter", value: "" },
  { key: "social_youtube", value: "" },
  { key: "business_hours", value: "Mon–Sun: 6:00 AM – 10:00 PM" },
  { key: "check_in_time", value: "2:00 PM" },
  { key: "check_out_time", value: "12:00 PM" },
  { key: "invoice_tax_rate", value: 13 },
  { key: "homepage_hero_title", value: "Wake up to the Himalayas" },
  { key: "homepage_hero_subtitle", value: "Quiet rooms, mountain views, and home-style food at a hill-station retreat in Bhedetar, Dhankuta." },
  { key: "homepage_hero_image", value: "/images/rooms/deluxe-1.jpg" },
  { key: "homepage_usp_title", value: "Why stay at Baraha" },
  { key: "homepage_usp_subtitle", value: "Small comforts that make a big difference after a day on the hills." },
  { key: "homepage_usp_1_title", value: "Mountain views" },
  { key: "homepage_usp_1_text", value: "Wake to the Dhankuta ridgeline from a private balcony or garden-facing window." },
  { key: "homepage_usp_2_title", value: "Home-style dining" },
  { key: "homepage_usp_2_text", value: "Dal bhat, gundruk soup, and fresh local oranges — food cooked the way we cook at home." },
  { key: "homepage_usp_3_title", value: "Free WiFi & hot water" },
  { key: "homepage_usp_3_text", value: "Fast WiFi in every room and reliable hot water — the essentials, done properly." },
  { key: "homepage_viewpoint_title", value: "The Bhedetar viewpoint" },
  { key: "homepage_viewpoint_text", value: "Ten minutes from the hotel, the Bhedetar viewpoint drops away to the Terai plains below. On clear mornings the whole of the Koshi valley unfolds at your feet — bring a camera and a cup of chiya." },
  { key: "homepage_viewpoint_image", value: "/images/rooms/deluxe-2.jpg" },
];

const pageSeeds = [
  {
    slug: "about",
    title: "About Us",
    metaTitle: "About Baraha Hotel and Lodge",
    metaDescription: "Learn about Baraha Hotel and Lodge, a family-run hill-station retreat in Bhedetar, Dhankuta.",
    blocks: [
      { type: "heading", text: "Welcome to Baraha", url: "", alt: "" },
      { type: "paragraph", text: "Baraha Hotel and Lodge sits on the ridgeline at Bhedetar, where the Terai plains rise into the Dhankuta hills. We've been welcoming travellers, trekkers, and families for years with warm rooms, mountain views, and food cooked the way we cook at home.", url: "", alt: "" },
      { type: "heading", text: "Our story", url: "", alt: "" },
      { type: "paragraph", text: "What started as a small roadside lodge has grown into a full-service hotel, while staying true to its roots: honest hospitality, local ingredients, and a cup of chiya ready whenever you land.", url: "", alt: "" },
      { type: "image", text: "", url: "/images/rooms/standard-1.jpg", alt: "The Baraha Hotel garden" },
    ],
  },
];

const gallerySeeds = [
  { url: "/images/rooms/standard-1.jpg", altText: "Standard room with a double bed", category: "Rooms", sortOrder: 0 },
  { url: "/images/rooms/deluxe-1.jpg", altText: "Deluxe room balcony at sunrise", category: "Rooms", sortOrder: 1 },
  { url: "/images/rooms/suite-1.jpg", altText: "Family suite living room", category: "Rooms", sortOrder: 2 },
  { url: "/images/food/dal-bhat.jpg", altText: "Dal bhat with seasonal vegetables", category: "Dining", sortOrder: 3 },
  { url: "/images/food/sekuwa.jpg", altText: "Mutton sekuwa with chutney", category: "Dining", sortOrder: 4 },
];

const blogSeeds = [
  {
    slug: "things-to-do-in-bhedetar",
    title: "Things to do in Bhedetar",
    excerpt: "From sunrise at the viewpoint to slow walks through the tea gardens — how to spend 2–3 days in Bhedetar.",
    content: "Bhedetar is small enough to see in a weekend and varied enough to leave you planning your next visit.\n\nStart with the viewpoint at dawn, then wander the pine-fringed trails around the ridge. Visit the nearby tea gardens, stop for chiya at a local stand, and finish the day with a view of the Terai plains stretching out below.\n\nIf you have an extra day, drive down toward Dhankuta bazaar or take a short walk to one of the smaller viewpoints along the Koshi Highway.",
    coverImageUrl: "/images/rooms/deluxe-2.jpg",
    isPublished: true,
    daysAgo: 2,
  },
  {
    slug: "how-to-reach-bhedetar-viewpoint",
    title: "How to reach Bhedetar viewpoint",
    excerpt: "A quick guide to getting to the most popular viewpoint near Baraha Hotel — by car, bike, or on foot.",
    content: "The Bhedetar viewpoint is about ten minutes from the hotel by car or motorbike. If you're staying with us, just ask the front desk and we'll point you in the right direction.\n\nFor the more adventurous, the walk from the hotel takes roughly forty minutes along a gentle uphill trail. Wear good shoes, bring water, and aim to be there before 7 AM for the clearest light.\n\nThe viewpoint drops away sharply to the Terai plains — on a clear morning you can see all the way to the lowlands.",
    coverImageUrl: "/images/rooms/standard-1.jpg",
    isPublished: true,
    daysAgo: 5,
  },
  {
    slug: "best-season-to-visit-bhedetar",
    title: "Best season to visit Bhedetar",
    excerpt: "Clear skies, rhododendron blooms, and monsoon mist — when to plan your trip to the Dhankuta hills.",
    content: "Bhedetar is a year-round destination, but each season brings a different experience.\n\nAutumn (October to November) is the sweet spot: crisp mornings, clear skies, and the hills are still green after the monsoon. Rhododendrons bloom in spring (March to April), painting the ridges pink and red.\n\nWinter is cold but sunny — bring a jacket and you'll have the trails mostly to yourself. Summer brings monsoon clouds and lush greenery, but occasional mist can hide the views.\n\nWhenever you come, Baraha Hotel and Lodge is ready with a warm room and a pot of chiya.",
    coverImageUrl: "/images/food/milk-tea.jpg",
    isPublished: true,
    daysAgo: 8,
  },
];

const testimonialSeeds = [
  { guestName: "Sita Rai", quote: "Clean rooms, hot water, and the best chiya in Bhedetar. We'll be back.", rating: 5 },
  { guestName: "Hari Tamang", quote: "The staff went out of their way to help us plan our trek. Felt like family.", rating: 5 },
  { guestName: "Anju Gurung", quote: "Quiet, comfortable, and the dal bhat was superb. A great stop on the way to Dhankuta.", rating: 4 },
];

const roomSeeds = [
  { roomNumber: "101", slug: "standard-room", floor: 1 },
  { roomNumber: "102", slug: "standard-room", floor: 1 },
  { roomNumber: "103", slug: "standard-room", floor: 1 },
  { roomNumber: "201", slug: "deluxe-room", floor: 2 },
  { roomNumber: "202", slug: "deluxe-room", floor: 2 },
  { roomNumber: "301", slug: "family-suite", floor: 3 },
  { roomNumber: "302", slug: "family-suite", floor: 3 },
  { roomNumber: "303", slug: "family-suite", floor: 3 },
];

type RoomEntrySeed = {
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  numGuests: number;
  checkIn: Date;
  checkOut: Date | null;
  ratePerNight: string;
  status: "OCCUPIED" | "CHECKED_OUT";
  notes?: string;
  charges: { itemName: string; quantity: number; price: string }[];
};

const roomEntrySeeds: RoomEntrySeed[] = [
  {
    roomNumber: "101",
    guestName: "Sita Rai",
    guestPhone: "+977-9810000001",
    numGuests: 2,
    checkIn: atNoon(-1),
    checkOut: atNoon(2),
    ratePerNight: "1500",
    status: "OCCUPIED",
    charges: [
      { itemName: "Dal Bhat", quantity: 2, price: "350" },
      { itemName: "Masala Chai", quantity: 2, price: "100" },
    ],
  },
  {
    roomNumber: "102",
    guestName: "Hari Tamang",
    guestPhone: "+977-9810000002",
    numGuests: 2,
    checkIn: atNoon(0),
    checkOut: atNoon(3),
    ratePerNight: "1500",
    status: "OCCUPIED",
    charges: [
      { itemName: "Nepali Breakfast Set", quantity: 2, price: "450" },
    ],
  },
  {
    roomNumber: "201",
    guestName: "Anju Gurung",
    guestPhone: "+977-9810000003",
    numGuests: 3,
    checkIn: atNoon(1),
    checkOut: atNoon(4),
    ratePerNight: "2500",
    status: "OCCUPIED",
    charges: [],
  },
  {
    roomNumber: "202",
    guestName: "Bikash Shrestha",
    guestPhone: "+977-9810000004",
    numGuests: 2,
    checkIn: atNoon(2),
    checkOut: atNoon(5),
    ratePerNight: "2500",
    status: "OCCUPIED",
    charges: [],
  },
  {
    roomNumber: "301",
    guestName: "Maya Limbu",
    guestPhone: "+977-9810000005",
    numGuests: 5,
    checkIn: atNoon(3),
    checkOut: atNoon(7),
    ratePerNight: "4000",
    status: "OCCUPIED",
    charges: [],
  },
  {
    roomNumber: "103",
    guestName: "Ram Thapa",
    guestPhone: "+977-9810000006",
    numGuests: 2,
    checkIn: atNoon(-5),
    checkOut: atNoon(-2),
    ratePerNight: "1500",
    status: "CHECKED_OUT",
    charges: [
      { itemName: "Sel Roti", quantity: 3, price: "120" },
    ],
  },
  {
    roomNumber: "101",
    guestName: "Sita Rai",
    guestPhone: "+977-9810000001",
    numGuests: 2,
    checkIn: atNoon(-20),
    checkOut: atNoon(-18),
    ratePerNight: "1500",
    status: "CHECKED_OUT",
    charges: [
      { itemName: "Dal Bhat", quantity: 4, price: "350" },
      { itemName: "Fresh Orange Juice", quantity: 2, price: "250" },
    ],
  },
  {
    roomNumber: "201",
    guestName: "Hari Tamang",
    guestPhone: "+977-9810000002",
    numGuests: 2,
    checkIn: atNoon(5),
    checkOut: atNoon(10),
    ratePerNight: "2500",
    status: "OCCUPIED",
    charges: [],
  },
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

  // 3. Site settings
  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: JSON.stringify(s.value) },
      create: { key: s.key, value: JSON.stringify(s.value) },
    });
  }

  // 4b. Pages (About) — upsert by unique slug
  for (const seed of pageSeeds) {
    const { blocks, ...data } = seed;
    await prisma.page.upsert({
      where: { slug: seed.slug },
      update: { ...data, content: blocks },
      create: { ...data, content: blocks },
    });
  }

  // 4c. Gallery images (refresh demo photos, keyed by URL)
  await prisma.galleryImage.deleteMany();
  await prisma.galleryImage.createMany({ data: gallerySeeds });

  // 4d. Blog posts (upsert by unique slug)
  for (const seed of blogSeeds) {
    const { daysAgo, ...data } = seed;
    await prisma.blogPost.upsert({
      where: { slug: seed.slug },
      update: {
        ...data,
        publishedAt: seed.isPublished ? atNoon(-daysAgo) : null,
      },
      create: {
        ...data,
        publishedAt: seed.isPublished ? atNoon(-daysAgo) : null,
      },
    });
  }

  // 4e. Testimonials (upsert by guest name — demo data)
  for (const t of testimonialSeeds) {
    const existing = await prisma.testimonial.findFirst({
      where: { guestName: t.guestName },
    });
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data: t });
    } else {
      await prisma.testimonial.create({ data: t });
    }
  }

  // 5. Rooms
  for (const r of roomSeeds) {
    const roomType = await prisma.roomType.findUnique({ where: { slug: r.slug } });
    if (!roomType) continue;
    await prisma.room.upsert({
      where: { roomNumber: r.roomNumber },
      update: { roomTypeId: roomType.id, floor: r.floor, status: "AVAILABLE" },
      create: { roomNumber: r.roomNumber, roomTypeId: roomType.id, floor: r.floor },
    });
  }

  // 6. Room entries + charges (recreated each run — pure demo data)
  await prisma.roomCharge.deleteMany();
  await prisma.roomEntry.deleteMany();

  for (const seed of roomEntrySeeds) {
    const room = await prisma.room.findUnique({ where: { roomNumber: seed.roomNumber } });
    if (!room) continue;

    const entry = await prisma.roomEntry.create({
      data: {
        roomId: room.id,
        guestName: seed.guestName,
        guestPhone: seed.guestPhone,
        numGuests: seed.numGuests,
        checkIn: seed.checkIn,
        checkOut: seed.checkOut,
        ratePerNight: seed.ratePerNight,
        status: seed.status,
        notes: seed.notes || null,
        charges: {
          create: seed.charges.map((c) => ({
            itemName: c.itemName,
            quantity: c.quantity,
            priceAtAdd: c.price,
          })),
        },
      },
    });

    // Generate invoice for checked-out entries
    if (seed.status === "CHECKED_OUT") {
      await generateInvoice(entry.id);
    }
  }

  // 7. Report
  const [roomTypeCount, imageCount, roomCount, entryCount, chargeCount, pageCount, galleryCount, blogCount, testimonialCount, invoiceCount] =
    await Promise.all([
      prisma.roomType.count(),
      prisma.roomImage.count(),
      prisma.room.count(),
      prisma.roomEntry.count(),
      prisma.roomCharge.count(),
      prisma.page.count(),
      prisma.galleryImage.count(),
      prisma.blogPost.count(),
      prisma.testimonial.count(),
      prisma.invoice.count(),
    ]);

  console.log("Seed complete:");
  console.log(`  • Admin user : ${admin.email} (${admin.role}) — password from ADMIN_PASSWORD`);
  console.log(`  • Room types : ${roomTypeCount} (${roomTypeSeeds.map((r) => r.name).join(", ")})`);
  console.log(`  • Room images: ${imageCount}`);
  console.log(`  • Rooms      : ${roomCount} (${roomSeeds.map((r) => r.roomNumber).join(", ")})`);
  console.log(`  • Room entries: ${entryCount}`);
  console.log(`  • Room charges: ${chargeCount}`);
  console.log(`  • Invoices   : ${invoiceCount}`);
  console.log(`  • Settings   : ${siteSettings.length} (${siteSettings.map((s) => s.key).join(", ")})`);
  console.log(`  • Pages      : ${pageCount} (${pageSeeds.map((p) => p.slug).join(", ")})`);
  console.log(`  • Gallery    : ${galleryCount} photos`);
  console.log(`  • Blog posts : ${blogCount} (${blogSeeds.filter((b) => b.isPublished).length} published)`);
  console.log(`  • Testimonials: ${testimonialCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
