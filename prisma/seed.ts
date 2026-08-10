/**
 * Baraha Hotel — development seed.
 *
 * Run with: `npm run db:seed` (or `npx prisma db seed`).
 *
 * Requires ADMIN_PASSWORD in .env — the seeded admin user's password.
 * Everything is idempotent: re-running upserts the admin, room types,
 * rooms, guests, bookings, and site settings, refreshes menu items, and
 * recreates demo food orders.
 *
 * NOTE: demo-only data — re-running resets room statuses to AVAILABLE
 * and wipes/recreates food orders, so don't re-seed a database that has
 * real operational data.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  { key: "invoice_tax_rate", value: 13 }, // Nepal VAT %, editable in Content → Site settings
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
  {
    slug: "amenities",
    title: "Amenities",
    metaTitle: "Amenities at Baraha Hotel and Lodge",
    metaDescription: "Rooms, dining, WiFi, and more — see what's included with your stay at Baraha Hotel and Lodge.",
    blocks: [
      { type: "heading", text: "Comforts of home, views of the hills", url: "", alt: "" },
      { type: "paragraph", text: "Every room comes with free WiFi, hot water, and a writing desk. Deluxe rooms add private balconies; our family suites include a living room and kitchenette.", url: "", alt: "" },
      { type: "heading", text: "Dining", url: "", alt: "" },
      { type: "paragraph", text: "Our kitchen serves dal bhat, Nepali breakfast sets, and Dhankuta specialities like gundruk soup and mutton sekuwa — plus fresh local oranges in season.", url: "", alt: "" },
      { type: "image", text: "", url: "/images/food/dal-bhat.jpg", alt: "Dal bhat at the hotel restaurant" },
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
    slug: "day-trip-dhankuta-bazaar",
    title: "A day trip to Dhankuta bazaar",
    excerpt: "Half an hour from the hotel, the old bazaar town of Dhankuta is worth a morning.",
    content: "From Bhedetar it's a short drive up the hill to Dhankuta. The bazaar is best visited early, when vendors set out fresh vegetables, handwoven dhaka, and the day's first plates of sel roti.\n\nSpend the afternoon wandering the temple steps and the covered market, then come back to the hotel in time for tea on the balcony.",
    coverImageUrl: "/images/food/sel-roti.jpg",
    isPublished: true,
    daysAgo: 3,
  },
  {
    slug: "what-to-eat-in-bhedetar",
    title: "What to eat in Bhedetar",
    excerpt: "From gundruk soup to fresh orange juice — the flavours of the Dhankuta hills.",
    content: "The hills around Bhedetar grow oranges, and in season the juice is as good as it gets. For dinner, try gundruk soup with rice or char-grilled mutton sekuwa.\n\nBreakfast means sel roti and aloo tama with a pot of milk tea — the way the trekking crowds like it.",
    coverImageUrl: "/images/food/gundruk-soup.jpg",
    isPublished: true,
    daysAgo: 10,
  },
  {
    slug: "planning-your-trek",
    title: "Planning your trek from Bhedetar",
    excerpt: "A few notes for trekkers starting the Dhankuta–Hile route from our doorstep.",
    content: "Bhedetar is the traditional gateway to the eastern hills. If you're planning a trek toward Hile or further into the Koshi zone, the hotel can help you arrange transport, packed lunches, and an early start.\n\nCome prepared for steep climbs in the afternoon heat — and bring a light jacket for the evenings.",
    coverImageUrl: "/images/rooms/deluxe-2.jpg",
    isPublished: false,
    daysAgo: 2,
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

const guestSeeds = [
  { fullName: "Sita Rai", email: "sita.rai@example.com", phone: "+977-9810000001", address: "Kathmandu" },
  { fullName: "Hari Tamang", email: "hari.tamang@example.com", phone: "+977-9810000002", address: "Dharan" },
  { fullName: "Anju Gurung", email: "anju.gurung@example.com", phone: "+977-9810000003", address: "Pokhara" },
  { fullName: "Bikash Shrestha", email: "bikash.shrestha@example.com", phone: "+977-9810000004", address: "Biratnagar" },
  { fullName: "Maya Limbu", email: "maya.limbu@example.com", phone: "+977-9810000005", address: "Ilam" },
  { fullName: "Ram Thapa", email: "ram.thapa@example.com", phone: "+977-9810000006", address: "Bhedetar" },
];

type BookingSeed = {
  bookingCode: string;
  guestEmail: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  numGuests: number;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  source: "WEBSITE" | "WALK_IN" | "PHONE";
};

// Dates are relative to today so the dashboard always has fresh data:
// a couple of current stays (occupancy), check-ins over the next 3 days,
// and a few past stays for this month's revenue.
const bookingSeeds: BookingSeed[] = [
  { bookingCode: "BH-DEMO-001", guestEmail: "sita.rai@example.com", roomNumber: "101", checkIn: atNoon(-1), checkOut: atNoon(2), numGuests: 2, status: "CONFIRMED", source: "WEBSITE" },
  { bookingCode: "BH-DEMO-002", guestEmail: "hari.tamang@example.com", roomNumber: "102", checkIn: atNoon(0), checkOut: atNoon(3), numGuests: 2, status: "CHECKED_IN", source: "PHONE" },
  { bookingCode: "BH-DEMO-003", guestEmail: "anju.gurung@example.com", roomNumber: "201", checkIn: atNoon(1), checkOut: atNoon(4), numGuests: 3, status: "CONFIRMED", source: "WEBSITE" },
  { bookingCode: "BH-DEMO-004", guestEmail: "bikash.shrestha@example.com", roomNumber: "202", checkIn: atNoon(2), checkOut: atNoon(5), numGuests: 2, status: "CONFIRMED", source: "WALK_IN" },
  { bookingCode: "BH-DEMO-005", guestEmail: "maya.limbu@example.com", roomNumber: "301", checkIn: atNoon(3), checkOut: atNoon(7), numGuests: 5, status: "PENDING", source: "WEBSITE" },
  { bookingCode: "BH-DEMO-006", guestEmail: "ram.thapa@example.com", roomNumber: "103", checkIn: atNoon(-5), checkOut: atNoon(-2), numGuests: 2, status: "CHECKED_OUT", source: "WALK_IN" },
  { bookingCode: "BH-DEMO-007", guestEmail: "sita.rai@example.com", roomNumber: "101", checkIn: atNoon(-20), checkOut: atNoon(-18), numGuests: 2, status: "CHECKED_OUT", source: "PHONE" },
  { bookingCode: "BH-DEMO-008", guestEmail: "hari.tamang@example.com", roomNumber: "201", checkIn: atNoon(5), checkOut: atNoon(10), numGuests: 2, status: "PENDING", source: "WEBSITE" },
];

// Demo food orders placed this month — count toward "food revenue".
const foodOrderSeeds = [
  { bookingCode: "BH-DEMO-001", itemName: "Dal Bhat", quantity: 2, daysAgo: 1 },
  { bookingCode: "BH-DEMO-001", itemName: "Masala Chai", quantity: 2, daysAgo: 1 },
  { bookingCode: "BH-DEMO-002", itemName: "Nepali Breakfast Set", quantity: 2, daysAgo: 0 },
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

  // 4b. Pages (About, Amenities) — upsert by unique slug
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

  // 6. Guests
  for (const g of guestSeeds) {
    const existing = await prisma.guest.findFirst({ where: { email: g.email } });
    if (existing) {
      await prisma.guest.update({ where: { id: existing.id }, data: g });
    } else {
      await prisma.guest.create({ data: g });
    }
  }

  // 7. Bookings (upsert by booking code; rate snapshots the room type price)
  for (const seed of bookingSeeds) {
    const guest = await prisma.guest.findFirst({ where: { email: seed.guestEmail } });
    const room = await prisma.room.findUnique({ where: { roomNumber: seed.roomNumber } });
    if (!guest || !room) continue;
    const roomType = await prisma.roomType.findUnique({ where: { id: room.roomTypeId } });
    if (!roomType) continue;

    const { guestEmail: _g, roomNumber: _r, ...data } = seed;
    await prisma.booking.upsert({
      where: { bookingCode: seed.bookingCode },
      update: {
        ...data,
        guestId: guest.id,
        roomId: room.id,
        roomRateAtBooking: roomType.basePrice.toString(),
      },
      create: {
        ...data,
        guestId: guest.id,
        roomId: room.id,
        roomRateAtBooking: roomType.basePrice.toString(),
      },
    });
  }

  // 8. Food orders (recreated each run — pure demo data)
  await prisma.foodOrderItem.deleteMany();
  await prisma.foodOrder.deleteMany();

  for (const spec of foodOrderSeeds) {
    const booking = await prisma.booking.findUnique({
      where: { bookingCode: spec.bookingCode },
    });
    const item = await prisma.foodMenuItem.findFirst({ where: { name: spec.itemName } });
    if (!booking || !item) continue;

    await prisma.foodOrder.create({
      data: {
        bookingId: booking.id,
        orderedAt: atNoon(-spec.daysAgo),
        status: "DELIVERED",
        items: {
          create: {
            foodMenuItemId: item.id,
            quantity: spec.quantity,
            priceAtOrder: item.price.toString(),
          },
        },
      },
    });
  }

  // 9. Report
  const [roomTypeCount, foodCount, imageCount, roomCount, guestCount, bookingCount, orderCount, pageCount, galleryCount, blogCount, testimonialCount] =
    await Promise.all([
      prisma.roomType.count(),
      prisma.foodMenuItem.count(),
      prisma.roomImage.count(),
      prisma.room.count(),
      prisma.guest.count(),
      prisma.booking.count(),
      prisma.foodOrder.count(),
      prisma.page.count(),
      prisma.galleryImage.count(),
      prisma.blogPost.count(),
      prisma.testimonial.count(),
    ]);

  console.log("Seed complete:");
  console.log(`  • Admin user : ${admin.email} (${admin.role}) — password from ADMIN_PASSWORD`);
  console.log(`  • Room types : ${roomTypeCount} (${roomTypeSeeds.map((r) => r.name).join(", ")})`);
  console.log(`  • Room images: ${imageCount}`);
  console.log(`  • Menu items : ${foodCount} across ${new Set(foodItemSeeds.map((f) => f.category)).size} categories`);
  console.log(`  • Rooms      : ${roomCount} (${roomSeeds.map((r) => r.roomNumber).join(", ")})`);
  console.log(`  • Guests     : ${guestCount}`);
  console.log(`  • Bookings   : ${bookingCount} (demo stays with dynamic dates)`);
  console.log(`  • Food orders: ${orderCount} (this month, for dashboard revenue)`);
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
