# HelpLender — Full System Architecture & Flow Diagram

> **Status**: ✅ Approved — Build in Progress

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Frontend — Next.js 14 (App Router)"]
        LP[Landing Page]
        AUTH[Auth Pages - Login/Signup]
        CUST[Customer Portal]
        PROV[Provider Dashboard]
        ADMN[Admin Panel]
        TRACK[Live Tracking Map]
    end

    subgraph BACKEND["⚙️ Backend — Node.js + Express"]
        API[REST API Server :5000]
        SOCK[Socket.io Server]
        MW[Middleware Layer\nJWT · RBAC · FirstLogin]
        CTRL[Controllers\nAuth · Booking · Provider · Admin · Payment]
        SVC[Services\nTwilio · Stripe · Commission · Availability]
    end

    subgraph DATA["🗄️ MongoDB + Mongoose"]
        USER[(User)]
        BOOKING[(Booking)]
        TRANS[(Transaction)]
        PROFILE[(ProviderProfile)]
        SERVICE[(Service)]
        REVIEW[(Review)]
        SMSLOG[(SmsLog)]
    end

    subgraph THIRD["☁️ Third-Party Services"]
        TWILIO[Twilio SMS]
        STRIPE[Stripe Payments]
        GMAPS[Google Maps Platform]
    end

    CLIENT -->|HTTPS REST| API
    CLIENT <-->|WebSocket| SOCK
    API --> MW --> CTRL --> SVC
    CTRL --> DATA
    SVC --> TWILIO
    SVC --> STRIPE
    CLIENT --> GMAPS
    API --> GMAPS
```

---

## 2. Complete User Flow — 3-Sided System

```mermaid
flowchart TD
    START([User Visits HelpLender]) --> ROLE{Who are you?}

    ROLE -->|Customer| CLOGIN[Customer Login/Signup]
    ROLE -->|Provider| PJOIN[Become a Helper Page]
    ROLE -->|Admin| ALOGIN[Admin Login]

    %% CUSTOMER FLOW
    CLOGIN --> CBROWSE[Browse Service Categories]
    CBROWSE --> CBOOK[Step 1: Describe Task]
    CBOOK --> CTIME[Step 2: Pick Date & Time]
    CTIME --> CHECK{Immediate booking?\nWithin 2-4 hrs}
    CHECK -->|Yes| AVAIL[Availability Check\n3hr lead time + geo-fence 15km]
    CHECK -->|No| SCHEDULED[Scheduled Slot Check]
    AVAIL --> CPICK[Step 3: Pick Provider\nRating + Price + Distance]
    SCHEDULED --> CPICK
    CPICK --> CPAY{Payment Method}
    CPAY -->|Card| STRIPE_PAY[Stripe Payment Intent]
    CPAY -->|Cash| COD[COD — Confirmed]
    STRIPE_PAY --> BOOK_CREATED[Booking Created\nStatus: PENDING]
    COD --> BOOK_CREATED
    BOOK_CREATED --> SMS_CUST[SMS to Customer\n'Booking Confirmed!']
    BOOK_CREATED --> NOTIFY_PROV[Push Notification to Provider]

    %% PROVIDER FLOW
    PJOIN --> PFORM[Submit Join Request\nName + Phone + Skills + ID Doc]
    PFORM --> PEND[Status: PENDING]
    PEND --> AAPPROVE

    NOTIFY_PROV --> PDASH[Provider Dashboard — New Request]
    PDASH --> PACCEPT{Accept or Reject?}
    PACCEPT -->|Reject| BOOK_REJECT[Booking — Find Next Provider]
    PACCEPT -->|Accept| BOOK_CONFIRM[Booking: CONFIRMED\nProvider Assigned]
    BOOK_CONFIRM --> PTRAVEL[Provider clicks 'Start Travel']
    PTRAVEL --> TRACK_ON[Status: ON_THE_WAY\nGeolocation watchPosition ACTIVE]
    TRACK_ON --> SOCKET_EMIT[Socket.io: Emit lat/lng every 30s]
    SOCKET_EMIT --> CMAP[Customer sees Live Map\nDistance + ETA via Distance Matrix]
    CMAP --> PARRIVED[Provider clicks 'Arrived'\nStatus: ARRIVED\nwatchPosition STOPPED]
    PARRIVED --> PSTART[Provider clicks 'Start Job'\nStatus: IN_PROGRESS]
    PSTART --> PCOMPLETE[Provider clicks 'Complete'\nStatus: COMPLETED]
    PCOMPLETE --> PAY_CALC[Server calculates:\nTotal - 20% Commission = Provider Earning]
    PAY_CALC --> WALLET[Provider Wallet Updated]
    WALLET --> REVIEW_PROMPT[Customer prompt to Review]

    %% ADMIN FLOW
    ALOGIN --> ADASH[Admin Dashboard]
    ADASH --> AAPPROVE[Review Pending Providers]
    AAPPROVE -->|Approve| SMS_PROV[SMS to Provider:\n'Approved! Login: user\nTemp Pass: OTP']
    SMS_PROV --> PFIRSTLOGIN[Provider First Login\nisFirstLogin: true]
    PFIRSTLOGIN --> PRESET[Forced: /reset-password page]
    PRESET --> PACTIVE[Provider Active — Can Accept Jobs]
    AAPPROVE -->|Reject| PREJECT[Provider Rejected]

    ADASH --> ACOMMISSION[Set Commission Rate %]
    ADASH --> ALEDGER[Transaction Ledger\nPaid | Commission | Payout]
    ADASH --> AREVENUE[Revenue Analytics]
```

---

## 3. Booking Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer Books + Pays
    PENDING --> CONFIRMED: Provider Accepts
    PENDING --> CANCELLED: Provider Rejects / Timeout
    CONFIRMED --> PROVIDER_ASSIGNED: System routes to Provider
    PROVIDER_ASSIGNED --> ON_THE_WAY: Provider clicks 'Start Travel'
    ON_THE_WAY --> ARRIVED: Provider clicks 'Arrived'
    ARRIVED --> IN_PROGRESS: Provider clicks 'Start Job'
    IN_PROGRESS --> COMPLETED: Provider clicks 'Complete'
    COMPLETED --> REVIEWED: Customer submits Review
    CANCELLED --> [*]
    REVIEWED --> [*]

    note right of ON_THE_WAY
        Socket.io ACTIVE
        GPS every 30 seconds
        Customer sees live map
    end note

    note right of COMPLETED
        Commission calculated server-side
        Provider wallet credited
        Transaction record created
    end note
```

---

## 4. Real-Time Tracking Flow

```mermaid
sequenceDiagram
    participant P as Provider Browser
    participant S as Socket.io Server
    participant C as Customer Browser
    participant G as Google Maps API

    P->>P: Click "Start Travel"
    P->>S: emit('join-room', bookingId)
    P->>P: navigator.geolocation.watchPosition()

    loop Every 30 seconds
        P->>S: emit('location-update', {lat, lng, bookingId})
        S->>C: emit('provider-location', {lat, lng})
        C->>G: Distance Matrix API (provider → customer)
        G->>C: ETA + distance string
        C->>C: Update map marker + ETA display
    end

    P->>S: emit('status-update', 'ARRIVED')
    P->>P: clearWatch() — GPS STOPPED
    S->>C: emit('status-changed', 'ARRIVED')
    C->>C: Show "Provider has arrived!" alert
```

---

## 5. Commission & Payment Flow

```mermaid
flowchart LR
    BOOK[Booking Completed\nTotal: ₹1000] --> COMM[Commission Service\nServer-Side ONLY]
    COMM --> ADMIN_CUT[Admin Commission\n20% = ₹200]
    COMM --> PROV_EARN[Provider Earning\n80% = ₹800]
    ADMIN_CUT --> TRANS_LOG[Transaction Record Created]
    PROV_EARN --> TRANS_LOG
    TRANS_LOG --> ADMIN_LEDGER[Admin Dashboard\nTransaction Ledger]
    TRANS_LOG --> PROV_WALLET[Provider Virtual Wallet]
```

---

## 6. Provider Onboarding & Vetting Flow

```mermaid
sequenceDiagram
    participant PV as Provider
    participant DB as MongoDB
    participant AD as Admin
    participant TW as Twilio SMS

    PV->>DB: Submit Join Form (name, phone, skills, ID doc)
    DB->>DB: Create User {role: provider, status: PENDING, isFirstLogin: true}
    AD->>DB: GET /admin/providers?status=PENDING
    DB->>AD: List of pending providers

    AD->>DB: PUT /admin/providers/:id/approve
    DB->>DB: Update status: APPROVED, generate tempPassword
    DB->>TW: Send SMS via Twilio
    TW->>PV: "Approved! Login: username, Temp Pass: OTP123"

    PV->>DB: POST /auth/login (with temp password)
    DB->>PV: JWT Token + {isFirstLogin: true}
    PV->>PV: Redirected to /reset-password
    PV->>DB: PUT /auth/reset-password (new password)
    DB->>DB: isFirstLogin = false
    PV->>PV: Access Provider Dashboard ✅
```

---

## 7. API Route Map

```mermaid
graph LR
    subgraph AUTH["/api/auth"]
        A1[POST /login]
        A2[POST /signup]
        A3[PUT /reset-password]
        A4[GET /me]
    end

    subgraph BOOK["/api/bookings"]
        B1[POST / — Create Booking]
        B2[GET /my — Customer bookings]
        B3[PUT /:id/status — Update status]
        B4[GET /available-providers]
    end

    subgraph PROV["/api/providers"]
        P1[GET /jobs — Incoming requests]
        P2[PUT /jobs/:id/accept]
        P3[PUT /jobs/:id/reject]
        P4[PUT /me/location — Update coordinates]
        P5[PUT /me/status — Toggle active]
    end

    subgraph ADMIN["/api/admin"]
        AD1[GET /providers — All providers]
        AD2[PUT /providers/:id/approve]
        AD3[PUT /providers/:id/reject]
        AD4[GET /transactions]
        AD5[PUT /commission — Set rate]
        AD6[GET /revenue — Analytics]
    end

    subgraph PAY["/api/payments"]
        PY1[POST /create-intent — Stripe]
        PY2[POST /webhook — Stripe]
        PY3[GET /wallet — Provider wallet]
    end
```

---

## 8. Database Schema Overview

```mermaid
erDiagram
    USER {
        ObjectId _id
        string name
        string email
        string phone
        string passwordHash
        enum role "customer|provider|admin"
        enum status "PENDING|APPROVED|REJECTED"
        boolean isFirstLogin
        boolean isActive
        object currentLocation
        number walletBalance
        string tempPassword
    }

    PROVIDER_PROFILE {
        ObjectId userId
        array skills
        array serviceAreas
        number rating
        number totalJobs
        string idDocumentUrl
        number hourlyRate
    }

    BOOKING {
        ObjectId _id
        ObjectId customerId
        ObjectId providerId
        ObjectId serviceId
        enum status
        datetime scheduledTime
        datetime bufferEndTime
        object liveLocation
        object pricing
        enum paymentMethod "CARD|COD"
        string paymentStatus
    }

    TRANSACTION {
        ObjectId _id
        ObjectId bookingId
        ObjectId customerId
        ObjectId providerId
        number totalAmount
        number platformFee
        number providerPayout
        number commissionRate
        enum status "PENDING|COMPLETED"
        string stripePaymentId
    }

    REVIEW {
        ObjectId bookingId
        ObjectId customerId
        ObjectId providerId
        number rating
        string comment
    }

    SMS_LOG {
        ObjectId _id
        string to
        string message
        enum type "BOOKING_CONFIRM|PROVIDER_APPROVED"
        string twilioSid
        datetime sentAt
    }

    USER ||--o{ BOOKING : "creates (customer)"
    USER ||--o{ BOOKING : "fulfills (provider)"
    USER ||--|| PROVIDER_PROFILE : "has"
    BOOKING ||--|| TRANSACTION : "generates"
    BOOKING ||--o| REVIEW : "receives"
    TRANSACTION ||--o{ SMS_LOG : "triggers"
```

---

## 9. Environment Variables

```env
# Backend .env
MONGODB_URI=mongodb://localhost:27017/helplender
JWT_SECRET=helplender_jwt_secret_2024
TWILIO_ACCOUNT_SID=<your_account_sid>
TWILIO_AUTH_TOKEN=VYE3GKTKC962F99MJWGSP8AP
TWILIO_PHONE_NUMBER=<your_twilio_number>
STRIPE_SECRET_KEY=sk_test_51TIqhYRx2xQsy5pql3XuQmb2wGULbebKdJdoOX1E0lDpwvjZFNI3BRLRr3ijTkIpDBR3Ljx3kgpWiK2ROgoAI7oN00WWbamr1S
STRIPE_WEBHOOK_SECRET=<from_stripe_cli>
GOOGLE_MAPS_API_KEY=AIzaSyAekkx-FksUME_Y-UqrnWrjm29EyxAStlM
COMMISSION_RATE=0.20
PORT=5000
CLIENT_URL=http://localhost:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAekkx-FksUME_Y-UqrnWrjm29EyxAStlM
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TIqhYRx2xQsy5pqJp66fumguFXk1HToqqIgSQHA7pJH5v1NEU0r5vxdXnbxeJuYIRlgmiw2sBLizEfsUja0VBo600GiHDywPq
```

---

## Build Phases

- [x] Plan & Architecture — **DONE**
- [/] Phase 1 — Backend: Scaffolding + Models + Auth + Middleware
- [ ] Phase 2 — Backend: Booking Engine + Commission + Availability
- [ ] Phase 3 — Socket.io Real-time Tracking
- [ ] Phase 4 — Frontend: Layout + Landing + Auth Pages
- [ ] Phase 5 — Customer Booking Flow + Stripe
- [ ] Phase 6 — Provider Dashboard + Live Tracking
- [ ] Phase 7 — Admin Panel + Ledger
- [ ] Phase 8 — Seed Script + .env files + Setup Guide
