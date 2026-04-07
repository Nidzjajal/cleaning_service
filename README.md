# HelpLender — Home Services Marketplace

A production-grade 3-sided platform (Customer, Provider, Admin) inspired by TaskRabbit and Urban Company. Built with Next.js, Node.js, Express, MongoDB, and Socket.io.

---

## 🛠️ Tech Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS      |
| **Backend**  | Node.js, Express 5, Middleware architecture (JWT, RBAC) |
| **Database** | MongoDB Atlas (Mongoose ODM)                            |
| **Payments** | Stripe API (Test Mode) + Cash on Delivery (COD)        |
| **SMS**      | Twilio SDK                                              |
| **Real-Time**| Socket.io (Live GPS tracking)                           |
| **Maps**     | Google Maps Platform (Directions + Distance Matrix)     |

---

## 📁 Folder Structure

```
helplender/
├── backend/
│   ├── config/          # Database connection (db.js)
│   ├── controllers/     # authController, bookingController, adminController
│   ├── middleware/       # auth (JWT), roleGuard, firstLoginGuard, errorHandler
│   ├── models/          # User, Booking, Service, Review, ProviderProfile, Transaction, SmsLog
│   ├── routes/          # auth, bookings, services, providers, admin
│   ├── services/        # twilioService, stripeService, commissionService, availabilityService
│   ├── sockets/         # trackingSocket.js (real-time GPS broadcasting)
│   ├── scripts/         # seed.js (populate database)
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                        # Landing page
│   │   ├── (auth)/login/page.tsx           # Login
│   │   ├── (auth)/signup/page.tsx          # Customer signup
│   │   ├── (auth)/reset-password/page.tsx  # Force password reset (providers)
│   │   ├── become-a-helper/page.tsx        # Provider application form
│   │   ├── customer/book/page.tsx          # Step 1: Browse services
│   │   ├── customer/book/details/page.tsx  # Step 2: Date/time/address
│   │   ├── customer/book/confirm/page.tsx  # Step 3: Select provider + pay
│   │   ├── customer/dashboard/page.tsx     # Customer bookings dashboard
│   │   ├── customer/tracking/page.tsx      # Live GPS tracking
│   │   ├── provider/dashboard/page.tsx     # Provider job management
│   │   ├── admin/dashboard/page.tsx        # Admin overview + stats
│   │   ├── admin/providers/page.tsx        # Provider approval/management
│   │   └── admin/transactions/page.tsx     # Transaction ledger
│   ├── components/
│   │   ├── layout/      # Navbar, Footer
│   │   ├── ui/          # LoadingSpinner, StatusBadge
│   │   ├── booking/     # ServiceCard, ProviderCard, PriceSummary
│   │   └── maps/        # LiveTrackingMap
│   ├── context/         # AuthContext (JWT + role management)
│   ├── hooks/           # useGeolocation
│   ├── lib/             # api.ts (Axios), socket.ts (Socket.io client)
│   └── types/           # TypeScript interfaces
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (v24 recommended)
- **MongoDB Atlas** account (free tier works)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd helplender
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:3001
MONGODB_URI=mongodb://your-connection-string-here

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+919510951842

STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_placeholder

GOOGLE_MAPS_API_KEY=your_google_maps_key

COMMISSION_RATE=0.20
BUFFER_TIME_MINUTES=30
GEO_FENCE_KM=15
IMMEDIATE_BOOKING_LEAD_HOURS=3

NODE_ENV=development
```

> **Important MongoDB Note:** If your password contains `@`, encode it as `%40` in the URI. If your ISP blocks SRV records, use the long-form connection string (non-SRV) from MongoDB Atlas.

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **10 cleaning services** across 5 categories
- **Test accounts:**
  - Admin: `admin@helplender.com` / `Admin@123456`
  - Customer: `priya@test.com` / `Test@1234`
  - Provider: `raju@test.com` / `Test@1234`

### 4. Start Backend

```bash
npm run dev
```

You should see:
```
🚀 HelpLender Server Running!
📡 API:    http://localhost:5000/api
✅ MongoDB Connected: ...
```

### 5. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env.local` in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 6. Start Frontend

```bash
npm run dev
```

The app will be available at: **http://localhost:3001**

> **Note:** Port 3001 is the default. If port 3000 is free, it will use 3000 instead.

---

## 🔑 3-Sided System

### 👤 Customer Flow
1. Browse → Select Service → Pick Date/Time → Choose Address
2. Select Provider (or auto-assign) → Choose Payment (Card/COD)
3. Confirm Booking → Track Live → Rate Service
4. **Login required only at checkout** — browsing is open to everyone

### 🧹 Provider Flow
1. Apply via "Become a Helper" page → **Status: PENDING**
2. Admin approves → SMS sent with temp credentials
3. First login → Forced password reset
4. Dashboard: Toggle Online/Offline → Accept/Reject jobs
5. Start Travel → GPS tracking → Arrived → Start Job → Complete
6. Earnings credited to wallet automatically

### 🛡️ Admin Flow
1. Dashboard: Platform stats, revenue, pending approvals
2. Approve/Reject providers (triggers SMS via Twilio)
3. Set global commission rate (e.g., 20%)
4. Transaction Ledger: Customer Paid | Admin Cut | Provider Payout

---

## 📊 Database Models (MongoDB)

| Model            | Key Fields                                                           |
| ---------------- | -------------------------------------------------------------------- |
| **User**         | name, email, phone, role, status, isFirstLogin, walletBalance, currentLocation |
| **Service**      | name, slug, category, basePrice, addOns, duration, isImmediate      |
| **Booking**      | customerId, providerId, serviceId, status, pricing, liveLocation    |
| **Transaction**  | bookingId, customerPaid, adminCommission, providerPayout, status    |
| **ProviderProfile** | userId, skills, rating, totalJobs, hourlyRate, serviceAreas      |
| **Review**       | bookingId, customerId, providerId, rating, comment                  |
| **SmsLog**       | userId, bookingId, type, status, twilioSid                         |

### Key Relationships
- Booking → User (customer), User (provider), Service
- Transaction → Booking, User (customer), User (provider)
- ProviderProfile → User

---

## 💰 Commission Logic

All pricing is calculated **server-side** to prevent tampering:
```
Total = basePrice + addOnsTotal
Admin Commission = Total × commissionRate (e.g., 20%)
Provider Earning = Total - Admin Commission
```

---

## 📱 Real-Time Tracking (Socket.io)

- Provider clicks "Start Travel" → `navigator.geolocation.watchPosition` activates
- Location emitted to server every **30 seconds**
- Server broadcasts to customer via Socket.io room
- Tracking stops when provider clicks "Arrived" (battery-safe)

---

## 🔒 Authentication & Security

- **JWT tokens** stored in `localStorage`
- **Role-based access** via `roleGuard` middleware
- **First-login force reset** via `firstLoginGuard` middleware
- **Password hashing** with bcryptjs (salt rounds: 12)
- Providers cannot self-register as `admin`

---

## 🧪 Testing

### Stripe Test Cards
| Card Number          | Result       |
| -------------------- | ------------ |
| `4242 4242 4242 4242` | Success      |
| `4000 0000 0000 0002` | Decline      |

### API Health Check
```bash
curl http://localhost:5000/api/health
```

---

## 📝 Available Scripts

### Backend
| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start with nodemon (dev)       |
| `npm start`      | Start production server        |
| `npm run seed`   | Seed database with test data   |

### Frontend
| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start Next.js dev server       |
| `npm run build`  | Build for production           |
| `npm start`      | Start production server        |

---

## 🎨 Design System

| Token            | Value          | Usage                        |
| ---------------- | -------------- | ---------------------------- |
| Background       | `#F8FAFC`      | Page backgrounds             |
| Primary (Dark)   | `#0F172A`      | Buttons, headers, text       |
| Accent (Blue)    | `#3B82F6`      | CTAs, links, highlights      |
| Success (Green)  | `#22C55E`      | Online status, completions   |
| Cards            | `#FFFFFF`      | Containers with soft shadows |
| Font Display     | Montserrat     | Headings                     |
| Font Body        | Inter          | Body text                    |

---

## 🚧 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use environment variables on hosting platform (Vercel/Render/Railway)
3. Enable MongoDB Atlas IP whitelisting for your server IP
4. Enable Stripe live mode keys
5. Configure Twilio for production SMS

---

## 📄 License

MIT License — Free to use for educational and commercial purposes.
