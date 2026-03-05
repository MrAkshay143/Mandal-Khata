# Mandal Khata - Deep Project Analysis & Roadmap

This document provides a comprehensive technical and functional analysis of the
current state of the Mandal Khata application, along with a detailed roadmap of
suggested features and architectural refinements required to elevate it to a
production-grade SaaS platform.

---

## 🟢 1. Currently Implemented Features

The application has successfully been transitioned from a localized, single-user
offline app (SQLite based) to a **multi-tenant cloud-ready web application**.

### **Authentication & Security**

- **JWT-based Authentication**: Secure login and registration using JSON Web
  Tokens (Bearer strategy).
- **Password Hashing**: `bcryptjs` is utilized to secure user credentials before
  database insertion.
- **Email Verification**: Nodemailer integration with unique UUID tokens to
  enforce email verification within 24 hours of account creation.
- **Route Protection**: A React `<AuthGuard>` wrapper restricts access to
  authenticated routes, and backend API requests use an `authMiddleware` to
  verify the JWT token.

### **Multi-Tenancy & Data Isolation**

- **MySQL Database**: Transitioned from SQLite to MySQL for scalable data
  management.
- **Strict Data Isolation**: All queries fetching customers, transactions, or
  stats are strictly scoped to the `req.userId` of the logged-in user.

### **Core Functionality (Ledger System)**

- **Customer Management**: Ability to create, update, and delete customer
  profiles.
- **Transaction Engine**: Double-entry style "Gave" (Debit) and "Got" (Credit)
  entries.
- **Real-time Balance**: Aggregated balance calculation (`SUM(amount)` based on
  debit/credit signs).
- **Multi-language Support**: Comprehensive translation dictionary supporting
  English, Bengali, and Hindi.
- **WhatsApp/SMS Integration**: Deep-links enabling users to share ledgers or
  reminders directly via native messaging apps.

### **Admin Portal**

- **Dashboard Analytics**: Graphical and statistical overview of total users,
  verified accounts, global customers, and total ledger entries.
- **User Management**: Admins can view, manually verify, reset passwords, or
  hard-delete users and their associated data.
- **Global Customers View**: Admins can monitor customer records associated with
  different users.
- **Modern UI**: Tailored dark/light theme switching with custom `ConfirmDialog`
  intercepts for destructive actions.

### **Utilities**

- **JSON Backup & Restore**: Users can manually export a comprehensive JSON
  snapshot of their customers and entries, and import them later (managed
  atomically via MySQL transactions).

---

## 🟡 2. Missing Features (Suggested to Implement)

To make Mandal Khata a highly competitive and robust platform, the following
features should be implemented:

### **User Experience & Core Features**

1. **Forgot Password Flow (Crucial)**
   - Currently, if a user forgets their password, they must contact an admin. A
     proper `/forgot-password` route generating an email with a secure reset
     token is essential.
2. **Pagination & Infinite Scrolling (Crucial for Scale)**
   - The `<CustomerList>` and `<CustomerChat>` currently fetch and render _all_
     entries at once. As a user accumulates thousands of entries, this will
     cripple the browser's memory and slow down the database. Implement chunked
     loading (e.g., 50 items at a time).
3. **Automated Cloud Backups**
   - Replace or supplement the manual JSON export with an automated weekly
     backup sent to the user's email, or auto-synced to Google Drive.
4. **PDF Reports & Exports**
   - Allow users to generate a professional PDF receipt/invoice or a monthly
     ledger statement to send to their customers.
5. **Role-Based Access Control (RBAC)**
   - Allow a business owner to create "Sub-users" (e.g., a cashier) who can
     _only_ add entries but cannot delete transactions or modify settings.

### **Analytics & Insights**

1. **Data Visualization**
   - Implement charting libraries (like `Recharts` or `Chart.js`) on the user's
     Dashboard (`Summary.tsx`) to show monthly revenue trends or cash flow
     comparisons.
2. **Overdue Reminders Automation**
   - Establish cron jobs (e.g., using `node-cron`) to periodically check for
     overdue customer balances and automatically send reminder emails or SMS to
     the business owners to take action.

---

## 🔴 3. Architectural & Codebase Suggestions (Technical Debt)

As the application continues to grow, structural refactoring is highly
recommended to prevent the codebase from becoming an unmanageable monolith.

### **Backend Structure (Express.js)**

1. **Deconstruct `server.ts`**:
   - The current `server.ts` is over 600 lines long, handling database
     connections, authentication logic, ledger endpoints, email services, and
     admin routes.
   - **Action**: Refactor into an MVC-style directory structure:
     - `/routes/authRoutes.ts`
     - `/routes/ledgerRoutes.ts`
     - `/routes/adminRoutes.ts`
     - `/controllers/` (Business logic)
2. **Request Validation**:
   - Implement `Zod` or `Joi` validation middleware on routes like
     `POST /api/entries` to ensure data types (e.g., ensuring `amount` is
     strictly numeric) before hitting the MySQL database.
3. **Rate Limiting**:
   - Implement `express-rate-limit` on the `/api/auth/login` and
     `/api/auth/register` endpoints to thwart brute-force password guessing and
     spam registrations.

### **Frontend Structure (React)**

1. **State Management**:
   - As prop drilling increases, consider integrating `Zustand` or
     `Redux Toolkit` for complex global states, abstracting away massive API
     fetching logic from within components to clean up files like
     `CustomerChat.tsx`.
2. **Optimistic UI Updates**:
   - Implement React Query (`@tanstack/react-query`) for fetching data. It
     provides built-in caching and allows for "optimistic updates" (making the
     UI feel instantaneous before the server responds).

### **Database (MySQL)**

1. **Indexing Strategy**:
   - Add structural indexes to the database to optimize read queries:
     - `CREATE INDEX idx_user ON customers (user_id);`
     - `CREATE INDEX idx_customer_user ON transactions (customer_id, user_id);`
2. **Soft Deletes**:
   - Instead of hard-deleting transactions using `DELETE FROM`, implement a
     `deleted_at` timestamp column. This allows business owners to recover
     "accidentally deleted" financial entries.

---

## Summary

The foundation of **Mandal Khata** is notably strong, achieving multi-tenancy
securely with a fast frontend. Prioritizing **Pagination**, a **Forgot
Password** flow, and **Request Validation** will immediately prepare it for safe
public release, while structural refactoring will ensure it can scale smoothly
without technical bottlenecks.
