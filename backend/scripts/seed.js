require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for seeding');
};

// ============================================================
// HOME CLEANING SERVICES — All prices in INR
// ============================================================
const services = [
  // ── INDOOR LIVING AREAS ──────────────────────────────────
  {
    name: 'Bedroom & Living Room Cleaning',
    slug: 'bedroom-living-room-cleaning',
    category: 'indoor_living',
    categoryLabel: '🛋️ Indoor Living Areas',
    description:
      'Complete cleaning of bedrooms and living rooms including vacuuming, dusting, and surface wiping.',
    whatIncluded: [
      'Stripping beds & changing sheets',
      'Vacuuming under bed frames',
      'Wiping cupboard & wardrobe exterior surfaces and handles',
      'Dusting fan blades and light fixtures',
      'Wiping light switches and sockets',
      'Detailed skirting board cleaning (dust & scuff marks)',
      'Inside window glass cleaning',
      'Wiping inner sills and tracks',
    ],
    icon: '🛋️',
    basePrice: 799,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹799',
    addOns: [
      { name: 'Wardrobe Interior Cleaning', description: 'Deep clean inside wardrobes', price: 299 },
      { name: 'Under-furniture vacuum', description: 'Move and vacuum under all furniture', price: 199 },
    ],
    duration: { min: 90, max: 150 },
    isActive: true,
    isPopular: true,
    isImmediate: true,
    tags: ['bedroom', 'living room', 'dusting', 'vacuuming'],
    sortOrder: 1,
  },
  {
    name: 'Fan & Fixture Deep Clean',
    slug: 'fan-fixture-cleaning',
    category: 'indoor_living',
    categoryLabel: '🛋️ Indoor Living Areas',
    description:
      'Thorough cleaning of ceiling fans, light fixtures, and all switches throughout the home.',
    whatIncluded: [
      'Dusting and wiping all ceiling fan blades',
      'Cleaning light fixture covers and bulbs',
      'Wiping all light switches and plates',
      'Cleaning ceiling corners and cobwebs',
    ],
    icon: '💡',
    basePrice: 399,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹399',
    addOns: [],
    duration: { min: 60, max: 90 },
    isActive: true,
    isPopular: false,
    isImmediate: true,
    tags: ['fans', 'lights', 'fixtures'],
    sortOrder: 2,
  },

  // ── KITCHEN & DINING ─────────────────────────────────────
  {
    name: 'Kitchen Deep Clean',
    slug: 'kitchen-deep-clean',
    category: 'kitchen_dining',
    categoryLabel: '🍳 Kitchen & Dining',
    description:
      'Professional kitchen degreasing and deep cleaning — from oven to countertops.',
    whatIncluded: [
      'Deep degreasing of stovetop and knobs',
      'Internal oven cleaning (racks, glass, interior)',
      'Wiping down grease from cabinet faces and handles',
      'Descaling faucets and polishing stainless steel sinks',
      'Wiping exterior of fridge, microwave, and dishwasher',
      'Cleaning countertops and backsplash tiles',
      'Sink and drain scrubbing',
    ],
    icon: '🍳',
    basePrice: 999,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹999',
    addOns: [
      { name: 'Refrigerator Interior Clean', description: 'Empty and deep clean fridge interior', price: 349 },
      { name: 'Microwave Interior Clean', description: 'Thorough microwave interior cleaning', price: 149 },
      { name: 'Cabinet Interior Wipe', description: 'Empty and wipe all kitchen cabinets inside', price: 399 },
    ],
    duration: { min: 120, max: 180 },
    isActive: true,
    isPopular: true,
    isImmediate: true,
    tags: ['kitchen', 'oven', 'degreasing', 'sink', 'appliances'],
    sortOrder: 3,
  },
  {
    name: 'Oven & Stove Cleaning',
    slug: 'oven-stove-cleaning',
    category: 'kitchen_dining',
    categoryLabel: '🍳 Kitchen & Dining',
    description:
      'Focused deep-clean for your oven and stove — full degreasing and rack cleaning.',
    whatIncluded: [
      'Stovetop burner and knob deep degreasing',
      'Oven interior cleaning (walls, racks, glass door)',
      'Grease trap cleaning',
      'Exterior polish and wipe-down',
    ],
    icon: '🔥',
    basePrice: 549,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹549',
    addOns: [],
    duration: { min: 60, max: 90 },
    isActive: true,
    isImmediate: true,
    tags: ['oven', 'stove', 'kitchen'],
    sortOrder: 4,
  },

  // ── FLOOR & SURFACE CARE ─────────────────────────────────
  {
    name: 'Floor Cleaning (Hard Floors)',
    slug: 'hard-floor-cleaning',
    category: 'floor_surface',
    categoryLabel: '🧼 Floor & Surface Care',
    description:
      'Professional sweeping and mopping of all hard floor surfaces — tiles, wood, or laminate.',
    whatIncluded: [
      'Dry sweeping entire floor area',
      'Mopping tiles, hardwood, or laminate with appropriate cleaner',
      'Edge and corner cleaning',
      'Spot removal for stains',
    ],
    icon: '🧹',
    basePrice: 499,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹499',
    addOns: [
      { name: 'Machine Scrubbing', description: 'Power scrubber for stubborn stains', price: 299 },
    ],
    duration: { min: 60, max: 120 },
    isActive: true,
    isPopular: true,
    isImmediate: true,
    tags: ['floor', 'mopping', 'tiles', 'hardwood'],
    sortOrder: 5,
  },
  {
    name: 'Carpet & Upholstery Cleaning',
    slug: 'carpet-upholstery-cleaning',
    category: 'floor_surface',
    categoryLabel: '🧼 Floor & Surface Care',
    description:
      'Expert vacuuming and spot-clean for carpets, sofas, and armchairs.',
    whatIncluded: [
      'Carpet vacuuming (edges and high-traffic areas)',
      'Sofa and armchair vacuuming',
      'Cushion removal and crumb cleaning',
      'Spot treatment for light stains',
    ],
    icon: '🛋️',
    basePrice: 699,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹699',
    addOns: [
      { name: 'Steam Cleaning (Carpet)', description: 'Professional hot-water extraction steam clean', price: 799 },
      { name: 'Fabric Deodoriser', description: 'Fabric freshener spray on sofas and carpets', price: 149 },
    ],
    duration: { min: 90, max: 150 },
    isActive: true,
    isPopular: false,
    isImmediate: true,
    tags: ['carpet', 'sofa', 'upholstery', 'vacuuming'],
    sortOrder: 6,
  },

  // ── OUTDOOR & SEMI-OUTDOOR ───────────────────────────────
  {
    name: 'Terrace & Balcony Cleaning',
    slug: 'terrace-balcony-cleaning',
    category: 'outdoor',
    categoryLabel: '🌿 Outdoor & Semi-Outdoor',
    description:
      'Full outdoor space clean — sweep, mop, and wipe down your terrace or balcony.',
    whatIncluded: [
      'Sweeping all debris and leaves',
      'Mopping balcony/terrace tiles',
      'Wiping down railing glass',
      'Cleaning balcony furniture surfaces',
      'Drain unclogging (basic)',
    ],
    icon: '🌿',
    basePrice: 449,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹449',
    addOns: [
      { name: 'Pressure Wash', description: 'High-pressure water cleaning for tiles', price: 499 },
    ],
    duration: { min: 60, max: 90 },
    isActive: true,
    isImmediate: true,
    tags: ['terrace', 'balcony', 'outdoor'],
    sortOrder: 7,
  },
  {
    name: 'Outside Window Cleaning',
    slug: 'outside-window-cleaning',
    category: 'outdoor',
    categoryLabel: '🌿 Outdoor & Semi-Outdoor',
    description:
      'Specialist exterior window cleaning — streak-free glass from outside.',
    whatIncluded: [
      'Exterior glass pane cleaning',
      'Frame and sill wipe-down',
      'Streak-free polish',
      'Safety equipment included',
    ],
    icon: '🪟',
    basePrice: 599,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹599',
    addOns: [],
    duration: { min: 60, max: 120 },
    isActive: true,
    isImmediate: false, // specialist service, pre-booking recommended
    tags: ['windows', 'exterior', 'specialist'],
    sortOrder: 8,
  },

  // ── FULL HOME / PACKAGES ─────────────────────────────────
  {
    name: 'Full Home Deep Clean',
    slug: 'full-home-deep-clean',
    category: 'deep_cleaning',
    categoryLabel: '✨ Deep Cleaning Packages',
    description:
      'Our most comprehensive package — every room, every surface, top to bottom.',
    whatIncluded: [
      'All bedroom & living room services',
      'Full kitchen deep clean',
      'All bathrooms (scrub, descale, sanitise)',
      'All floors swept and mopped',
      'All fans, fixtures, and switches',
      'Inside windows cleaned',
      'Balcony swept and mopped',
    ],
    icon: '✨',
    basePrice: 2999,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹2,999',
    addOns: [
      { name: '1 BHK', description: 'For 1 BHK apartment', price: 0 },
      { name: '2 BHK (+₹800)', description: 'Additional rooms for 2 BHK', price: 800 },
      { name: '3 BHK (+₹1,500)', description: 'Additional rooms for 3 BHK', price: 1500 },
      { name: 'Carpet Steam Clean', description: 'Add carpet steam cleaning', price: 799 },
    ],
    duration: { min: 300, max: 480 },
    isActive: true,
    isPopular: true,
    isImmediate: false,
    tags: ['deep clean', 'full home', 'package', 'comprehensive'],
    sortOrder: 9,
  },
  {
    name: 'Move-In / Move-Out Cleaning',
    slug: 'move-in-out-cleaning',
    category: 'deep_cleaning',
    categoryLabel: '✨ Deep Cleaning Packages',
    description:
      'Perfect for handing over or taking over a property — leave it spotless.',
    whatIncluded: [
      'Full home deep clean',
      'Cabinet and wardrobe interior wipe',
      'All appliance exterior cleaning',
      'Bathroom deep scrub and sanitise',
      'Balcony and windows',
      'Waste removal (basic)',
    ],
    icon: '🏠',
    basePrice: 3999,
    priceUnit: 'per_visit',
    priceLabel: 'Starting from ₹3,999',
    addOns: [
      { name: 'Pest Control', description: 'Basic cockroach/ant control spray', price: 499 },
    ],
    duration: { min: 360, max: 540 },
    isActive: true,
    isPopular: false,
    isImmediate: false,
    tags: ['move in', 'move out', 'handover', 'deep clean'],
    sortOrder: 10,
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================
const seedDB = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Service.deleteMany({});
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});

    // Seed services
    console.log('🛠️  Seeding services...');
    const createdServices = await Service.insertMany(services);
    console.log(`✅ ${createdServices.length} services seeded`);

    // Seed admin user
    console.log('👤 Seeding admin user...');
    const adminUser = await User.create({
      name: 'HelpLender Admin',
      email: 'admin@helplender.com',
      phone: '9000000001',
      passwordHash: 'Admin@123456',
      role: 'admin',
      status: 'ACTIVE',
      isFirstLogin: false,
    });
    console.log(`✅ Admin created: admin@helplender.com / Admin@123456`);

    // Seed sample customer
    const customer = await User.create({
      name: 'Priya Sharma',
      email: 'priya@test.com',
      phone: '9876543210',
      passwordHash: 'Test@1234',
      role: 'customer',
      status: 'ACTIVE',
      isFirstLogin: false,
      address: { street: '12 Marine Drive', city: 'Mumbai', pincode: '400020' },
    });
    console.log(`✅ Test customer: priya@test.com / Test@1234`);

    // Seed sample approved provider
    const provider = await User.create({
      name: 'Raju Cleaning Services',
      email: 'raju@test.com',
      phone: '9123456780',
      passwordHash: 'Test@1234',
      role: 'provider',
      status: 'APPROVED',
      isFirstLogin: false,
      isOnline: true,
      currentLocation: { lat: 19.076, lng: 72.8777, updatedAt: new Date() },
      address: { street: 'Dadar West', city: 'Mumbai', pincode: '400028' },
    });

    await ProviderProfile.create({
      userId: provider._id,
      skills: ['bedroom_cleaning', 'kitchen_cleaning', 'floor_care', 'bathroom_cleaning'],
      rating: 4.8,
      totalReviews: 42,
      totalJobs: 58,
      hourlyRate: 300,
      experience: '3-5 years',
      bio: 'Professional cleaner with 4 years of experience. Specializing in deep kitchen and bathroom cleaning.',
      serviceAreas: [{ city: 'Mumbai', pincode: '400028', lat: 19.076, lng: 72.8777, radiusKm: 15 }],
    });
    console.log(`✅ Test provider: raju@test.com / Test@1234`);

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DATABASE SEEDED SUCCESSFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Services: ${createdServices.length}

🔐 Test Credentials:
   Admin:    admin@helplender.com / Admin@123456
   Customer: priya@test.com / Test@1234
   Provider: raju@test.com / Test@1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDB();
