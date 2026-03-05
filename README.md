<div align="center">
  <img src="public/favicon.ico" width="80" alt="Mandal Khata Logo" />
  <h1>Mandal Khata</h1>
  <p><strong>A Modern, Full-Stack Digital Ledger (Khata) Application</strong></p>

<p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#privacy">Privacy</a> •
    <a href="#license">License</a>
  </p>
</div>

<hr />

## 📖 Introduction

Mandal Khata is a fast, beautifully designed digital ledger built for modern
business owners to easily track customer balances and transactions offline.
Replace your traditional paper khata with a secure, snappy, and
zero-learning-curve PWA (Progressive Web Application).

## ✨ Features

- **Full-Stack Architecture:** Secure, robust Node.js and Express backend backed
  by a MySQL database.
- **RESTful API:** Clean API structure with robust Zod validation.
- **PDF Reports:** Generate detailed, downloadable PDF ledger summaries
  automatically.
- **Multi-language Support:** Easily toggle between English, Bengali, and Hindi.
- **Beautiful UI/UX:** Clean, intuitive, modern interface featuring smooth
  animations and a responsive dashboard that works flawlessly on web and mobile.
- **Dark Mode Native:** Gorgeous Dark Mode available for better battery life and
  low-light environments.
- **Smart Analytics:** Gain insights into your top pending balances, monthly
  metrics, and net outstanding cashflow inside a visually pleasing summary
  screen.
- **WhatsApp & SMS Sharing:** Share ledger summaries or single-transaction
  receipts to your customers instantly via WhatsApp or native Messaging apps.
- **Security & Privacy:** Complete privacy. No email logins, no analytics
  tracking, no external data collection.
- **Backups & Security:** Native backend soft-deletes and database indexing
  ensure safe, reliable, and recoverable records.
- **Admin Dashboard:** Review total user statistics and platform performance
  securely.

## 🛠 Tech Stack

| Technology            | Description                                         |
| --------------------- | --------------------------------------------------- |
| **Vite & React 18**   | Next-generation, lightning-fast frontend UI.        |
| **Tailwind CSS**      | Utility-first, highly customizable styling engine.  |
| **Node.js & Express** | Powerful, structured modular backend.               |
| **MySQL2**            | Fast and safe database driver for persistence.      |
| **Zod & PDFKit**      | Type-safe validations and dynamic report generation |
| **TypeScript**        | Strict type-checking built on Javascript.           |

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrAkshay143/Mandal-Khata.git
   cd Mandal-Khata
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup your Environment Variables (`.env`):
   ```env
   NODE_ENV=development
   PORT=3000
   APP_URL=http://localhost:3000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mandal_khata

   JWT_SECRET=your_super_secret_key
   JWT_EXPIRY=7d

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   ```

4. Run the development server (Frontend + Backend):
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   npm start
   ```

## 🔒 Privacy Guarantee

Mandal Khata treats user data with the utmost respect.

- **No Unwanted Telemetry:** We do not record any hidden telemetry or usage
  patterns.
- **Secure Persistence:** Your ledger data remains strictly isolated in your
  database.

## 👨‍💻 Developed By

**Akshay Mondal**

## 📄 License

This project is licensed under the [MIT License](LICENSE).
