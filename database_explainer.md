# 📊 HelpLender Database Architecture

HelpLender uses a **Relational NoSQL** design with MongoDB. The data is spread across different collections but linked using unique IDs.

---

## 1. Core Collections & Data Storage

### 👤 `users` (The Root)
This is the central table for everyone (Customers, Providers, and Admins).
- **Stored Data**: Email, Password (hashed), Name, Phone, Role (`customer` | `provider` | `admin`), and current status.
- **Why?**: One table for all users ensures a secure, centralized login system.

### 💼 `providerprofiles` (Professional Details)
When a user signs up as a "Helper," their professional information is stored here.
- **Link**: Connects to `users` via `userId`.
- **Stored Data**: Bio, Skills (Array), Experience, Hourly Rate, Rating (Avg), and Total Jobs completed.
- **Why?**: Separating this from the `users` table keeps the system clean for customers who don't need professional profiles.

### 🧹 `services` (The Catalog)
This is the "Menu" of cleaning services you see on the landing page.
- **Stored Data**: Service Name, Category, Icon, Base Price, and descriptions of "What's Included."
- **Admin Control**: Admins can Add, Update, or Delete these items from their dashboard.

### 📅 `bookings` (The Business Logic)
The most important table that connects everything when a customer books a service.
- **Links**: `customerId`, `providerId`, and `serviceId`.
- **Stored Data**: Scheduled Date, Time, Status (`PENDING`, `ON_THE_WAY`, `COMPLETED`), Service Address, and Pricing breakdown.

---

## 2. Feature Flow: "Book a Helper"

When a customer clicks **"Book a Cleaner"**, the following happens behind the scenes:

1.  **Selection**: The app fetches a list from the `services` collection.
2.  **Matching**: Based on the customer's location and time, the app looks for `users` with `role: "provider"` who have an active `providerprofile` matching those skills.
3.  **Creation**: A new record is created in the `bookings` collection.
4.  **Transaction**: A record is created in the `transactions` collection to track the split:
    - **Customer Total** = ₹1,000
    - **Admin Commission (20%)** = ₹200
    - **Provider Payout (80%)** = ₹800

---

## 3. Data Flow Summary

| Data Type | collection / Table | Controlled By |
| :--- | :--- | :--- |
| **Login Credentials** | `users` | User (Self) |
| **Helper Experience/Skills** | `providerprofiles` | Provider (Self) |
| **Cleaning Menu & Prices** | `services` | **Admin** |
| **Orders & Tracking** | `bookings` | System Automations |
| **Payments & Payouts** | `transactions` | System / Admin |
