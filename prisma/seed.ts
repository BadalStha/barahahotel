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
      { url: "/images/rooms/standard-1.jpg", altText: "Standard room with a double bed at Baraha Hotel, Bhedetar", sortOrder: 1 },
      { url: "/images/rooms/standard-2.jpg", altText: "Standard room bathroom at Baraha Hotel and Lodge, Bhedetar", sortOrder: 2 },
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
      { url: "/images/rooms/deluxe-1.jpg", altText: "Deluxe room with a balcony and hill view at Baraha Hotel, Bhedetar", sortOrder: 1 },
      { url: "/images/rooms/deluxe-2.jpg", altText: "Deluxe room seating area at Baraha Hotel and Lodge, Bhedetar", sortOrder: 2 },
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
      { url: "/images/rooms/suite-1.jpg", altText: "Family suite living room at Baraha Hotel, Bhedetar", sortOrder: 1 },
      { url: "/images/rooms/suite-2.jpg", altText: "Family suite bedroom with hill view at Baraha Hotel and Lodge, Bhedetar", sortOrder: 2 },
    ],
  },
];

const siteSettings = [
  { key: "hotel_name", value: "Baraha Hotel and Lodge" },
  { key: "tagline", value: "A hill-station hotel in Bhedetar, Dhankuta — mountain views, home-style food, free WiFi and hot water" },
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
  { key: "homepage_hero_title", value: "Wake up to the Himalayas in Bhedetar" },
  { key: "homepage_hero_subtitle", value: "Quiet rooms, mountain views, and home-style food at a hill-station retreat in Bhedetar, Dhankuta." },
  { key: "homepage_hero_image", value: "/images/rooms/deluxe-1.jpg" },
  { key: "homepage_hero_badge", value: "Bhedetar · Dhankuta · Nepal" },
  { key: "homepage_usp_title", value: "Why stay at Baraha" },
  { key: "homepage_usp_subtitle", value: "Small comforts that make a big difference after a day on the hills." },
  { key: "homepage_usp_1_title", value: "Mountain views" },
  { key: "homepage_usp_1_text", value: "Wake to the Dhankuta ridgeline from a private balcony or garden-facing window." },
  { key: "homepage_usp_2_title", value: "Home-style dining" },
  { key: "homepage_usp_2_text", value: "Dal bhat, gundruk soup, and fresh local oranges — food cooked the way we cook at home." },
  { key: "homepage_usp_3_title", value: "Free WiFi & hot water" },
  { key: "homepage_usp_3_text", value: "Fast WiFi in every room and reliable hot water — the essentials, done properly." },
  { key: "homepage_viewpoint_label", value: "A local favourite" },
  { key: "homepage_viewpoint_title", value: "The Bhedetar viewpoint" },
  { key: "homepage_viewpoint_text", value: "Ten minutes from the hotel, the Bhedetar viewpoint drops away to the Terai plains below. On clear mornings the whole of the Koshi valley unfolds at your feet — bring a camera and a cup of chiya." },
  { key: "homepage_viewpoint_image", value: "/images/rooms/deluxe-2.jpg" },
  { key: "homepage_rooms_title", value: "Rooms & suites" },
  { key: "homepage_rooms_subtitle", value: "Simple, warm rooms with mountain air — pick the one that fits your stay." },
  { key: "homepage_testimonials_title", value: "What our guests say" },
  { key: "homepage_testimonials_subtitle", value: "Real words from real stays." },
  { key: "homepage_cta_title", value: "Ready for the hills?" },
  { key: "homepage_cta_text", value: "Call, WhatsApp, or email us to check availability and plan your stay." },
  { key: "rooms_page_title", value: "Rooms & suites" },
  { key: "rooms_page_subtitle", value: "Simple, warm rooms with mountain air and hill-station quiet — pick the one that fits your stay." },
  { key: "dining_page_title", value: "Dining" },
  { key: "dining_page_subtitle", value: "Food cooked the way we cook at home — dal bhat, gundruk soup, and Dhankuta specialities." },
  { key: "dining_intro_title", value: "Our food" },
  { key: "dining_intro_text", value: "We serve simple, home-style meals made with local ingredients. Breakfast means sel roti and milk tea. Lunch and dinner feature dal bhat, gundruk soup, and seasonal vegetables. Ask us about packed trekking lunches and evening snacks." },
  { key: "dining_menu_title", value: "Our menu" },
  { key: "dining_cta_title", value: "Hungry outside menu hours?" },
  { key: "dining_cta_text", value: "Ask our team about seasonal specials, packed treks lunches, and late-evening chiya." },
  { key: "gallery_page_title", value: "Gallery" },
  { key: "gallery_page_subtitle", value: "A glimpse of the hotel, the food, and the hills around Bhedetar." },
  { key: "blog_page_title", value: "From the hills" },
  { key: "blog_page_subtitle", value: "Travel notes, food stories, and tips from around Bhedetar and Dhankuta." },
  { key: "contact_page_title", value: "Contact us" },
  { key: "contact_page_subtitle", value: "Questions, requests, or just saying hello — we'd love to hear from you." },
  { key: "contact_form_title", value: "Send us a message" },
  { key: "contact_form_text", value: "We usually reply within a day." },
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
      { type: "image", text: "", url: "/images/rooms/standard-1.jpg", alt: "The Baraha Hotel garden in Bhedetar, Dhankuta" },
    ],
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    metaTitle: "FAQs — Baraha Hotel and Lodge, Bhedetar",
    metaDescription: "Answers about staying at Baraha Hotel and Lodge — best time to visit Bhedetar, how to reach us from Dharan and Kathmandu, hot water, WiFi, food and check-in times.",
    blocks: [
      { type: "heading", text: "What is the best time to visit Bhedetar?", url: "", alt: "" },
      { type: "paragraph", text: "October to November is the sweet spot: crisp mornings, clear skies, and green hills after the monsoon. March to April brings rhododendron blooms along the ridges. Winter is cold but sunny with quiet trails, while the summer monsoon turns everything lush — though mist can hide the views. Baraha Hotel and Lodge welcomes guests in every season.", url: "", alt: "" },
      { type: "heading", text: "How do I reach Baraha Hotel from Dharan, Itahari or Kathmandu?", url: "", alt: "" },
      { type: "paragraph", text: "From Dharan it is a 20–30 minute uphill drive toward Dhankuta — take any taxi, jeep or bus heading to Bhedetar and ask the driver for Baraha Hotel and Lodge. From Itahari, travel via Dharan (about 1–1.5 hours in total). From Kathmandu, take an overnight bus to Dharan or Itahari (10–12 hours) or fly to Biratnagar and drive up (2.5–3 hours), then continue to Bhedetar. Call us before you travel and we will guide you the last stretch.", url: "", alt: "" },
      { type: "heading", text: "How far is the Bhedetar viewpoint from the hotel?", url: "", alt: "" },
      { type: "paragraph", text: "About ten minutes by car or motorbike, or roughly forty minutes on foot along a gentle uphill trail. Go before 7 AM for the clearest light over the Terai plains and the Koshi valley. Bhedetar Tower is also nearby and easy to combine into the same outing — ask at the front desk and we will point you the right way.", url: "", alt: "" },
      { type: "heading", text: "Does Baraha Hotel have hot water and WiFi?", url: "", alt: "" },
      { type: "paragraph", text: "Yes — every room has reliable hot water and free WiFi. After a cold morning at the viewpoint, a hot shower and a pot of chiya are waiting.", url: "", alt: "" },
      { type: "heading", text: "What food do you serve?", url: "", alt: "" },
      { type: "paragraph", text: "Simple home-style meals with local ingredients: dal bhat, gundruk soup, mutton sekuwa, sel roti with milk tea for breakfast, and fresh local orange juice in season. We can pack trekking lunches if you ask the evening before — see our dining page for the full menu.", url: "", alt: "" },
      { type: "heading", text: "What are the check-in and check-out times?", url: "", alt: "" },
      { type: "paragraph", text: "Check-in is from 2:00 PM and check-out is by 12:00 PM. Arriving early or leaving late? Call or message us and we will do our best to adjust.", url: "", alt: "" },
      { type: "heading", text: "How many days should I stay in Bhedetar?", url: "", alt: "" },
      { type: "paragraph", text: "Two to three days is ideal: one morning for the viewpoint and tower, one day for the pine trails and tea gardens, and an unhurried day for Dhankuta bazaar or simply the hotel garden. Families and trekkers passing through often stay one night — our family suites sleep up to five.", url: "", alt: "" },
    ],
  },
];

const gallerySeeds = [
  { url: "/images/rooms/standard-1.jpg", altText: "Standard room with a double bed at Baraha Hotel, Bhedetar", category: "Rooms", sortOrder: 0 },
  { url: "/images/rooms/deluxe-1.jpg", altText: "Deluxe room balcony at sunrise at Baraha Hotel and Lodge, Bhedetar", category: "Rooms", sortOrder: 1 },
  { url: "/images/rooms/suite-1.jpg", altText: "Family suite living room at Baraha Hotel, Bhedetar", category: "Rooms", sortOrder: 2 },
  { url: "/images/food/dal-bhat.jpg", altText: "Dal bhat with seasonal vegetables at Baraha Hotel, Bhedetar", category: "Dining", sortOrder: 3 },
  { url: "/images/food/sekuwa.jpg", altText: "Mutton sekuwa with chutney at Baraha Hotel and Lodge, Bhedetar", category: "Dining", sortOrder: 4 },
];

const blogSeeds = [
  {
    slug: "things-to-do-in-bhedetar",
    title: "Things to do in Bhedetar",
    excerpt: "From sunrise at the viewpoint to slow walks through the tea gardens — how to spend 2–3 days in Bhedetar.",
    content: "Bhedetar is small enough to see in a weekend and varied enough to leave you planning your next visit.\n\nStart with the viewpoint at dawn, then wander the pine-fringed trails around the ridge. Visit the nearby tea gardens, stop for chiya at a local stand, and finish the day with a view of the Terai plains stretching out below.\n\nIf you have an extra day, drive down toward Dhankuta bazaar or take a short walk to one of the smaller viewpoints along the Koshi Highway.",
    coverImageUrl: "/images/rooms/deluxe-2.jpg",
    metaTitle: "Things to do in Bhedetar — viewpoint, trails and tea gardens",
    metaDescription: "How to spend 2–3 days in Bhedetar: sunrise viewpoints, pine trails, tea gardens and Dhankuta bazaar. Local tips from Baraha Hotel and Lodge.",
    isPublished: true,
    daysAgo: 2,
  },
  {
    slug: "how-to-reach-bhedetar-viewpoint",
    title: "How to reach Bhedetar viewpoint",
    excerpt: "A quick guide to getting to the most popular viewpoint near Baraha Hotel — by car, bike, or on foot.",
    content: "The Bhedetar viewpoint is about ten minutes from the hotel by car or motorbike. If you're staying with us, just ask the front desk and we'll point you in the right direction.\n\nFor the more adventurous, the walk from the hotel takes roughly forty minutes along a gentle uphill trail. Wear good shoes, bring water, and aim to be there before 7 AM for the clearest light.\n\nThe viewpoint drops away sharply to the Terai plains — on a clear morning you can see all the way to the lowlands.",
    coverImageUrl: "/images/rooms/standard-1.jpg",
    metaTitle: "How to reach Bhedetar viewpoint — by car, bike or on foot",
    metaDescription: "Reach the Bhedetar viewpoint in 10 minutes from Baraha Hotel and Lodge, or walk 40 minutes uphill. Dawn timing tips for the clearest Terai views.",
    isPublished: true,
    daysAgo: 5,
  },
  {
    slug: "best-season-to-visit-bhedetar",
    title: "Best season to visit Bhedetar",
    excerpt: "Clear skies, rhododendron blooms, and monsoon mist — when to plan your trip to the Dhankuta hills.",
    content: "Bhedetar is a year-round destination, but each season brings a different experience.\n\nAutumn (October to November) is the sweet spot: crisp mornings, clear skies, and the hills are still green after the monsoon. Rhododendrons bloom in spring (March to April), painting the ridges pink and red.\n\nWinter is cold but sunny — bring a jacket and you'll have the trails mostly to yourself. Summer brings monsoon clouds and lush greenery, but occasional mist can hide the views.\n\nWhenever you come, Baraha Hotel and Lodge is ready with a warm room and a pot of chiya.",
    coverImageUrl: "/images/food/milk-tea.jpg",
    metaTitle: "Best season to visit Bhedetar, Dhankuta",
    metaDescription: "When to visit Bhedetar — autumn skies, spring rhododendrons, winter sun and monsoon mist. Plan your Dhankuta hills trip with Baraha Hotel and Lodge.",
    isPublished: true,
    daysAgo: 8,
  },
  {
    slug: "things-to-do-near-bhedetar-tower",
    title: "Things to do near Bhedetar Tower",
    excerpt: "The tower, the viewpoint, pine trails and tea gardens — how to fill a perfect day around Bhedetar Tower.",
    content: "Bhedetar Tower makes an easy anchor for a day out: climb up for the panorama over the Terai plains, then walk the pine-fringed ridge trails that loop back toward the bazaar.\n\nPair the tower with a dawn visit to the Bhedetar viewpoint, about ten minutes from Baraha Hotel and Lodge by car — on clear mornings the whole Koshi valley unfolds below. Afterwards, wander down to the tea gardens for a slow afternoon.\n\nPack water and good shoes, start early, and finish the day with dal bhat back at the hotel. If you are staying with us, the front desk will sketch the route on a map and tell you current trail conditions.",
    coverImageUrl: "/images/rooms/deluxe-1.jpg",
    metaTitle: "Things to do near Bhedetar Tower — viewpoints, trails, tea gardens",
    metaDescription: "Plan a day around Bhedetar Tower: sunrise at the viewpoint, ridge walks, tea gardens and dinner at Baraha Hotel and Lodge in Bhedetar.",
    isPublished: true,
    daysAgo: 11,
  },
  {
    slug: "how-to-reach-bhedetar-from-kathmandu",
    title: "How to reach Bhedetar from Kathmandu",
    excerpt: "Buses, flights to Biratnagar, and the final uphill stretch — every practical way to get from Kathmandu to Bhedetar.",
    content: "Getting from Kathmandu to Bhedetar takes a full day, but the route is simple. Overnight tourist and deluxe buses run from Kathmandu to Dharan and Itahari in 10–12 hours — book a seat a day ahead in peak season.\n\nThe faster option is a 45-minute flight from Kathmandu to Biratnagar, then a 2.5–3 hour drive via Itahari and Dharan up to Bhedetar. Taxis and jeeps are easy to find outside Biratnagar airport; agree the fare before you set off.\n\nThe last stretch from Dharan climbs about 20–30 minutes to the ridge. Tell your driver you are staying at Baraha Hotel and Lodge in Bhedetar — and if anything is unclear on the road, call us and we will talk you in.",
    coverImageUrl: "/images/rooms/standard-1.jpg",
    metaTitle: "How to reach Bhedetar from Kathmandu — bus, flight and taxi guide",
    metaDescription: "Kathmandu to Bhedetar by overnight bus or via Biratnagar flights, plus the final uphill drive from Dharan. Travel guide from Baraha Hotel and Lodge.",
    isPublished: true,
    daysAgo: 14,
  },
  {
    slug: "homestay-vs-lodge-dhankuta",
    title: "Homestay vs lodge in Dhankuta: where should you stay?",
    excerpt: "Private rooms, hot water and checkout times — an honest comparison to help you choose between a homestay and a lodge.",
    content: "Both homestays and lodges have their place in the Dhankuta hills, and the right choice depends on the trip you want.\n\nA homestay puts you inside a local family's daily rhythm — shared meals, stories by the fire, and a glimpse of hill life. A lodge like Baraha Hotel and Lodge gives you a private room with an attached bathroom, reliable hot water, free WiFi, and staff on hand from morning to night.\n\nFamilies with children, trekkers with early starts, and anyone who values a hot shower after a cold viewpoint sunrise usually prefer the lodge. Travellers chasing cultural immersion often split their trip: a night or two in a village homestay, then comfort at the hotel before heading home.\n\nWhichever you choose, book ahead on autumn weekends — Bhedetar fills up fast when the skies clear.",
    coverImageUrl: "/images/rooms/suite-1.jpg",
    metaTitle: "Homestay vs lodge in Dhankuta — which stay suits your trip?",
    metaDescription: "Homestay or lodge in the Dhankuta hills? Compare privacy, hot water, food and flexibility, and see why travellers pick Baraha Hotel and Lodge in Bhedetar.",
    isPublished: true,
    daysAgo: 17,
  },
  {
    slug: "what-to-eat-in-bhedetar",
    title: "What to eat in Bhedetar: a short food guide",
    excerpt: "Dal bhat, gundruk soup, sekuwa and sel roti — the dishes worth travelling uphill for.",
    content: "Bhedetar's food is hill food at its best: simple, filling, and cooked fresh. Start with dal bhat — steamed rice, lentil soup, seasonal vegetables and pickle — the meal that fuels porters and travellers alike.\n\nTry gundruk soup, the fermented leafy-green speciality of the eastern hills, and char-grilled mutton sekuwa with chutney in the evening. Mornings belong to sel roti, crisp ring-shaped rice doughnuts eaten warm with milk tea.\n\nIn season, Dhankuta's local oranges are everywhere — have them fresh or as juice. At Baraha Hotel and Lodge we cook all of the above the way we cook at home, and we can pack trekking lunches if you ask the evening before.",
    coverImageUrl: "/images/food/dal-bhat.jpg",
    metaTitle: "What to eat in Bhedetar — dal bhat, sekuwa and local food guide",
    metaDescription: "A food lover's guide to Bhedetar: dal bhat, gundruk soup, sekuwa, sel roti and Dhankuta oranges — served daily at Baraha Hotel and Lodge.",
    isPublished: true,
    daysAgo: 20,
  },
  {
    slug: "weekend-itinerary-bhedetar-dharan",
    title: "A slow weekend in Bhedetar: 2-day itinerary from Dharan",
    excerpt: "Two unhurried days from Dharan — sunrise viewpoints, tower, tea gardens and Dhankuta bazaar.",
    content: "Day one: leave Dharan after breakfast and reach Bhedetar in under an hour. Drop your bags at the hotel, walk the ridge trails, and be at the viewpoint for sunset over the Terai. Dinner is dal bhat and an early night.\n\nDay two: up before dawn for the viewpoint at its clearest, then Bhedetar Tower and a slow wander through the tea gardens. If energy allows, continue to Dhankuta bazaar for oranges and knitwear before heading back down to Dharan by evening.\n\nStaying a second night? Walk the longer pine-trail loops, revisit the viewpoint at sunset instead of dawn, or simply claim a sunny corner of the hotel garden with milk tea. Two days is enough to unwind; three lets you do it properly.",
    coverImageUrl: "/images/rooms/deluxe-2.jpg",
    metaTitle: "2-day Bhedetar itinerary from Dharan — weekend plan",
    metaDescription: "A slow 2-day weekend itinerary from Dharan to Bhedetar: viewpoints, tower, tea gardens and Dhankuta bazaar, with nights at Baraha Hotel and Lodge.",
    isPublished: true,
    daysAgo: 23,
  },
];

const testimonialSeeds = [
  { guestName: "Sita Rai", quote: "Clean rooms, hot water, and the best chiya in Bhedetar. We'll be back.", rating: 5 },
  { guestName: "Hari Tamang", quote: "The staff went out of their way to help us plan our trek. Felt like family.", rating: 5 },
  { guestName: "Anju Gurung", quote: "Quiet, comfortable, and the dal bhat was superb. A great stop on the way to Dhankuta.", rating: 4 },
];

const menuItemSeeds = [
  { name: "Dal Bhat", description: "Steamed rice with lentil soup, seasonal vegetables, and pickle.", price: "350", category: "Mains", sortOrder: 1 },
  { name: "Gundruk Soup", description: "Fermented leafy-green soup — a Dhankuta speciality.", price: "400", category: "Mains", sortOrder: 2 },
  { name: "Mutton Sekuwa", description: "Char-grilled marinated mutton served with chutney.", price: "650", category: "Mains", sortOrder: 3 },
  { name: "Nepali Breakfast Set", description: "Sel roti, eggs, curry, and milk tea — served till 10 AM.", price: "450", category: "Breakfast", sortOrder: 4 },
  { name: "Masala Chai", description: "Spiced milk tea with aromatic masala.", price: "100", category: "Drinks", sortOrder: 5 },
  { name: "Fresh Orange Juice", description: "Freshly squeezed local oranges.", price: "250", category: "Drinks", sortOrder: 6 },
  { name: "Sel Roti", description: "Crisp ring-shaped rice doughnuts, warm from the pan.", price: "120", category: "Snacks", sortOrder: 7 },
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

type ReservationSeed = {
  guestName: string;
  guestPhone: string;
  numGuests: number;
  roomTypeSlug: string;
  roomNumber: string | null;
  arrivalOffsetDays: number;
  nights: number;
  notes?: string;
};

const reservationSeeds: ReservationSeed[] = [
  {
    guestName: "Gita Sharma",
    guestPhone: "+977-9810000011",
    numGuests: 2,
    roomTypeSlug: "deluxe-room",
    roomNumber: null,
    arrivalOffsetDays: 2,
    nights: 3,
    notes: "Called to book for the weekend.",
  },
  {
    guestName: "Deepak KC",
    guestPhone: "+977-9810000012",
    numGuests: 4,
    roomTypeSlug: "family-suite",
    roomNumber: "301",
    arrivalOffsetDays: 5,
    nights: 2,
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

  // 4f. Dining menu items (upsert by name so manual entries survive reseeds)
  for (const m of menuItemSeeds) {
    const existing = await prisma.menuItem.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.menuItem.update({ where: { id: existing.id }, data: m });
    } else {
      await prisma.menuItem.create({ data: m });
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

  // 6b. Advance bookings (demo) — only created when no matching BOOKED
  // reservation exists, so re-running the seed never duplicates them.
  for (const seed of reservationSeeds) {
    const roomType = await prisma.roomType.findUnique({
      where: { slug: seed.roomTypeSlug },
    });
    if (!roomType) continue;
    const arrivalDate = atNoon(seed.arrivalOffsetDays);
    const existing = await prisma.reservation.findFirst({
      where: {
        guestName: seed.guestName,
        arrivalDate,
        status: "BOOKED",
      },
    });
    if (existing) continue;
    const room = seed.roomNumber
      ? await prisma.room.findUnique({ where: { roomNumber: seed.roomNumber } })
      : null;
    await prisma.reservation.create({
      data: {
        guestName: seed.guestName,
        guestPhone: seed.guestPhone,
        numGuests: seed.numGuests,
        roomTypeId: roomType.id,
        roomId: room?.id ?? null,
        arrivalDate,
        nights: seed.nights,
        notes: seed.notes ?? null,
      },
    });
  }

  // 7. Report
  const [roomTypeCount, imageCount, roomCount, entryCount, chargeCount, pageCount, galleryCount, blogCount, testimonialCount, invoiceCount, menuItemCount, reservationCount] =
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
      prisma.menuItem.count(),
      prisma.reservation.count(),
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
  console.log(`  • Menu items : ${menuItemCount}`);
  console.log(`  • Reservations: ${reservationCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
