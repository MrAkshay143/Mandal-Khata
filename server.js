var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/env.ts
import dotenv from "dotenv";
var ENV;
var init_env = __esm({
  "src/config/env.ts"() {
    dotenv.config();
    ENV = {
      PORT: Number(process.env.PORT) || 3e3,
      NODE_ENV: process.env.NODE_ENV || "development",
      DB_HOST: process.env.DB_HOST || "localhost",
      DB_PORT: Number(process.env.DB_PORT) || 3306,
      DB_USER: process.env.DB_USER || "root",
      DB_PASSWORD: process.env.DB_PASSWORD ?? "",
      DB_NAME: process.env.DB_NAME || "mandal_khata",
      JWT_SECRET: process.env.JWT_SECRET || "mandal-khata-secret-change-this",
      JWT_EXPIRY: "7d",
      // Fixed as per original logic
      SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
      SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
      SMTP_USER: process.env.SMTP_USER || "",
      SMTP_PASS: process.env.SMTP_PASS || "",
      SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@mandal-khata.com",
      APP_URL: process.env.APP_URL || "http://localhost:3000"
    };
  }
});

// src/config/db.ts
var db_exports = {};
__export(db_exports, {
  default: () => db_default,
  initSchema: () => initSchema,
  pool: () => pool,
  query: () => query
});
import mysql from "mysql2/promise";
async function initSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email_verified TINYINT(1) DEFAULT 0,
        verification_token VARCHAR(255),
        verification_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255),
        reset_expires DATETIME
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('GAVE', 'GOT') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      );
    `);
    try {
      await conn.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);");
    } catch (e) {
    }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN reset_expires DATETIME;");
    } catch (e) {
    }
    try {
      await conn.query("ALTER TABLE customers ADD COLUMN deleted_at DATETIME DEFAULT NULL;");
    } catch (e) {
    }
    try {
      await conn.query("ALTER TABLE transactions ADD COLUMN deleted_at DATETIME DEFAULT NULL;");
    } catch (e) {
    }
    try {
      await conn.query("CREATE INDEX idx_customers_user_id ON customers(user_id);");
    } catch (e) {
    }
    try {
      await conn.query("CREATE INDEX idx_transactions_user_id ON transactions(user_id);");
    } catch (e) {
    }
    try {
      await conn.query("CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);");
    } catch (e) {
    }
    try {
      await conn.query("CREATE INDEX idx_transactions_date ON transactions(date);");
    } catch (e) {
    }
    const [rows] = await conn.query("SELECT COUNT(*) as cnt FROM admin_config");
    if (rows[0].cnt === 0) {
      const bcrypt3 = await import("bcryptjs");
      const hash = await bcrypt3.hash("password", 10);
      await conn.query("INSERT INTO admin_config (username, password_hash) VALUES (?, ?)", ["admin", hash]);
    }
    console.log("[MySQL] Schema initialized with new columns and indexes");
  } catch (err) {
    console.error("[MySQL] Schema initialization failed:", err);
    throw err;
  } finally {
    conn.release();
  }
}
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
var pool, db_default;
var init_db = __esm({
  "src/config/db.ts"() {
    init_env();
    pool = mysql.createPool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });
    db_default = pool;
  }
});

// server.ts
init_env();
init_db();
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// src/utils/logger.ts
import winston from "winston";
var logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, stack }) => {
            if (stack) {
              return `${timestamp} ${level}: ${message}
${stack}`;
            }
            return `${timestamp} ${level}: ${message}`;
          }
        )
      )
    })
  ]
});

// src/routes/authRoutes.ts
import { Router } from "express";

// src/controllers/authController.ts
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// src/models/userModel.ts
init_db();
var userModel = {
  async findByEmail(email) {
    const users = await query("SELECT * FROM users WHERE email = ?", [email]);
    return users.length > 0 ? users[0] : null;
  },
  async findByUsername(username) {
    const users = await query("SELECT id FROM users WHERE username = ?", [username]);
    return users.length > 0 ? users[0] : null;
  },
  async findById(id) {
    const users = await query("SELECT id, name, email, email_verified, created_at FROM users WHERE id = ?", [id]);
    return users.length > 0 ? users[0] : null;
  },
  async create(user) {
    const { name, email, passwordHash, username, verificationToken, verificationExpires } = user;
    const result = await query(
      "INSERT INTO users (name, email, password_hash, username, verification_token, verification_expires) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, passwordHash, username, verificationToken, verificationExpires]
    );
    return result;
  },
  async verifyEmail(token) {
    const users = await query(
      "SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()",
      [token]
    );
    if (users.length === 0) return null;
    await query(
      "UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE id = ?",
      [users[0].id]
    );
    return users[0];
  },
  async setVerificationToken(userId, token, expires) {
    await query(
      "UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?",
      [token, expires, userId]
    );
  },
  async setResetToken(email, token, expires) {
    await query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, email]
    );
  },
  async resetPassword(token, passwordHash) {
    const users = await query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );
    if (users.length === 0) return false;
    await query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [passwordHash, users[0].id]
    );
    return true;
  }
};

// src/config/smtp.ts
init_env();
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_PORT === 465,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS
  }
});

// src/services/emailService.ts
init_env();
async function sendVerificationEmail(email, name, token) {
  const verifyLink = `${ENV.APP_URL}/verify-email?token=${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #059669; padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body p { color: #444; font-size: 15px; line-height: 1.6; }
    .btn { display: block; margin: 28px auto 0; background: #059669; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; max-width: 220px; }
    .footer { text-align: center; padding: 20px; color: #aaa; font-size: 12px; }
    .link-text { word-break: break-all; color: #059669; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mandal Khata</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering! Please verify your email address to activate your account and start creating entries.</p>
      <a href="${verifyLink}" class="btn">Verify My Email</a>
      <p class="link-text">Or copy this link: ${verifyLink}</p>
    </div>
    <div class="footer">This link expires in 24 hours. If you did not register, please ignore this email.</div>
  </div>
</body>
</html>
  `.trim();
  try {
    await transporter.sendMail({
      from: `"Mandal Khata" <${ENV.SMTP_FROM}>`,
      to: email,
      subject: "Verify Your Email \u2014 Mandal Khata",
      html,
      text: `Hello ${name},

Please verify your email by visiting:
${verifyLink}

This link expires in 24 hours.`
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}`, err);
    throw err;
  }
}
async function sendPasswordResetEmail(email, name, token) {
  const resetLink = `${ENV.APP_URL}/reset-password?token=${token}`;
  const html = `
<!DOCTYPE html>
<html>
<!-- Using similar styles to verification email -->
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #059669; padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body p { color: #444; font-size: 15px; line-height: 1.6; }
    .btn { display: block; margin: 28px auto 0; background: #059669; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; max-width: 220px; }
    .footer { text-align: center; padding: 20px; color: #aaa; font-size: 12px; }
    .link-text { word-break: break-all; color: #059669; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mandal Khata</h1>
      <p>Password Reset</p>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p class="link-text">Or copy this link: ${resetLink}</p>
    </div>
    <div class="footer">This link expires in 1 hour. If you did not request this, please ignore this email.</div>
  </div>
</body>
</html>
  `.trim();
  try {
    await transporter.sendMail({
      from: `"Mandal Khata" <${ENV.SMTP_FROM}>`,
      to: email,
      subject: "Reset Your Password \u2014 Mandal Khata",
      html,
      text: `Hello ${name},

Please reset your password by visiting:
${resetLink}

This link expires in 1 hour.`
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}`, err);
    throw err;
  }
}

// src/utils/tokenUtils.ts
init_env();
import jwt from "jsonwebtoken";
function generateToken(userId, email) {
  const options = { expiresIn: ENV.JWT_EXPIRY };
  return jwt.sign({ userId, email }, ENV.JWT_SECRET, options);
}
function verifyToken(token) {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch {
    return null;
  }
}
function generateAdminToken() {
  return jwt.sign({ admin: true }, ENV.JWT_SECRET, { expiresIn: "1d" });
}

// src/constants/appConstants.ts
var APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 50
  }
};

// src/utils/helpers.ts
function generateUsername(name) {
  const base = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const rand = Math.floor(1e3 + Math.random() * 9e3);
  return `${base}_${rand}`;
}
function getPaginationQuery(params) {
  const limit = params.limit ? Math.min(Number(params.limit), 100) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
  const offset = params.offset ? Number(params.offset) : 0;
  return { limit, offset };
}

// src/controllers/authController.ts
async function ensureUniqueUsername(name) {
  let username = generateUsername(name);
  let attempts = 0;
  while (attempts < 10) {
    const existing = await userModel.findByUsername(username);
    if (!existing) return username;
    username = generateUsername(name);
    attempts++;
  }
  return `${generateUsername(name)}_${Date.now()}`;
}
var authController = {
  async register(req, res) {
    const { name, email, password } = req.body;
    try {
      const existing = await userModel.findByEmail(email);
      if (existing) return res.status(409).json({ error: "Email already registered" });
      const username = await ensureUniqueUsername(name);
      const passwordHash = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await userModel.create({
        name,
        email,
        passwordHash,
        username,
        verificationToken,
        verificationExpires
      });
      sendVerificationEmail(email, name, verificationToken).catch((err) => {
        console.error("[Mailer] Failed to send verification email:", err.message);
      });
      return res.json({ success: true, message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Registration failed" });
    }
  },
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid email or password" });
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: "Invalid email or password" });
      const token = generateToken(user.id, user.email);
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified === 1
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Login failed" });
    }
  },
  async verifyEmail(req, res) {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });
    try {
      const user = await userModel.verifyEmail(token);
      if (!user) return res.status(400).json({ error: "Invalid or expired verification token" });
      return res.json({ success: true, message: "Email verified successfully! You can now log in." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Verification failed" });
    }
  },
  async resendVerification(req, res) {
    const { email } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.email_verified) return res.status(400).json({ error: "Email already verified" });
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await userModel.setVerificationToken(user.id, verificationToken, verificationExpires);
      await sendVerificationEmail(user.email, user.name, verificationToken);
      return res.json({ success: true, message: "Verification email sent. Please check your inbox." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to resend verification email: " + error.message });
    }
  },
  async requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1e3);
      await userModel.setResetToken(user.email, resetToken, resetExpires);
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      return res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({ error: "Failed to request password reset" });
    }
  },
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const success = await userModel.resetPassword(token, passwordHash);
      if (!success) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      return res.json({ success: true, message: "Password reset successful. You can log in." });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  },
  async me(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const user = await userModel.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified === 1,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  }
};

// src/middleware/validationMiddleware.ts
import { ZodError } from "zod";
var validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          issues: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }
      return res.status(500).json({ error: "Internal Server Error during validation" });
    }
  };
};

// src/validators/authValidator.ts
import { z } from "zod";
var registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address")
});
var resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});

// src/middleware/authMiddleware.ts
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}

// src/routes/authRoutes.ts
var router = Router();
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/request-password-reset", validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", authMiddleware, authController.me);
var authRoutes_default = router;

// src/routes/customerRoutes.ts
import { Router as Router2 } from "express";

// src/models/customerModel.ts
init_db();
var customerModel = {
  async findAllByUser(userId, pagination) {
    return await query(`
      SELECT 
        c.*,
        COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
        (SELECT date FROM transactions WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY date DESC LIMIT 1) as last_transaction_date,
        (SELECT description FROM transactions WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY date DESC LIMIT 1) as last_transaction_desc
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
      WHERE c.user_id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY last_transaction_date DESC, c.name ASC
      LIMIT ? OFFSET ?
    `, [userId, pagination.limit, pagination.offset]);
  },
  async findById(id, userId) {
    const customers = await query(
      "SELECT * FROM customers WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [id, userId]
    );
    return customers.length > 0 ? customers[0] : null;
  },
  async create(userId, customer) {
    const result = await query(
      "INSERT INTO customers (user_id, name, mobile) VALUES (?, ?, ?)",
      [userId, customer.name, customer.mobile || ""]
    );
    return result;
  },
  async update(id, userId, customer) {
    await query(
      "UPDATE customers SET name = ?, mobile = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [customer.name, customer.mobile || "", id, userId]
    );
  },
  async softDelete(id, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
      await conn.query("UPDATE transactions SET deleted_at = ? WHERE customer_id = ? AND user_id = ?", [now, id, userId]);
      await conn.query("UPDATE customers SET deleted_at = ? WHERE id = ? AND user_id = ?", [now, id, userId]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
};

// src/controllers/customerController.ts
var customerController = {
  async list(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const pagination = getPaginationQuery(req.query);
    try {
      const customers = await customerModel.findAllByUser(req.userId, pagination);
      return res.json(customers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch customers" });
    }
  },
  async create(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { name, mobile } = req.body;
    try {
      const result = await customerModel.create(req.userId, { name, mobile });
      return res.json({ id: result.insertId, name, mobile });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create customer" });
    }
  },
  async update(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { name, mobile } = req.body;
    try {
      await customerModel.update(Number(id), req.userId, { name, mobile });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update customer" });
    }
  },
  async delete(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      await customerModel.softDelete(Number(id), req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete customer" });
    }
  }
};

// src/validators/customerValidator.ts
import { z as z2 } from "zod";
var createCustomerSchema = z2.object({
  name: z2.string().min(1, "Name is required"),
  mobile: z2.string().optional()
});
var updateCustomerSchema = createCustomerSchema;

// src/routes/customerRoutes.ts
var router2 = Router2();
router2.use(authMiddleware);
router2.get("/", customerController.list);
router2.post("/", validate(createCustomerSchema), customerController.create);
router2.put("/:id", validate(updateCustomerSchema), customerController.update);
router2.delete("/:id", customerController.delete);
var customerRoutes_default = router2;

// src/routes/transactionRoutes.ts
import { Router as Router3 } from "express";

// src/models/transactionModel.ts
init_db();
var transactionModel = {
  async findAllByCustomer(customerId, userId, pagination) {
    return await query(`
      SELECT * FROM transactions 
      WHERE customer_id = ? AND user_id = ? AND deleted_at IS NULL 
      ORDER BY date ASC
      LIMIT ? OFFSET ?
    `, [customerId, userId, pagination.limit, pagination.offset]);
  },
  async getCustomerBalance(customerId, userId) {
    const balResult = await query(
      `SELECT COALESCE(SUM(CASE WHEN type = 'GAVE' THEN amount ELSE -amount END), 0) as balance 
       FROM transactions WHERE customer_id = ? AND user_id = ? AND deleted_at IS NULL`,
      [customerId, userId]
    );
    return Number(balResult[0]?.balance || 0);
  },
  async create(userId, transaction) {
    const { customerId, type, amount, description, date } = transaction;
    const result = await query(
      "INSERT INTO transactions (customer_id, user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)",
      [customerId, userId, type, amount, description || "", date || (/* @__PURE__ */ new Date()).toISOString()]
    );
    return result;
  },
  async update(id, userId, transaction) {
    const { type, amount, description, date } = transaction;
    await query(
      "UPDATE transactions SET type = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [type, amount, description, date, id, userId]
    );
  },
  async softDelete(id, userId) {
    const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
    await query("UPDATE transactions SET deleted_at = ? WHERE id = ? AND user_id = ?", [now, id, userId]);
  },
  async getSummary(userId, today, startOfMonth) {
    const totalGiven = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GAVE' AND user_id = ? AND deleted_at IS NULL", [userId]);
    const totalGot = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GOT' AND user_id = ? AND deleted_at IS NULL", [userId]);
    const todayEntries = await query(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL",
      [today, userId]
    );
    const monthEntries = await query(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) >= ? AND user_id = ? AND deleted_at IS NULL",
      [startOfMonth, userId]
    );
    return {
      totalReceive: Number(totalGiven[0].total) - Number(totalGot[0].total),
      totalPay: 0,
      todayEntries: todayEntries[0],
      monthEntries: monthEntries[0]
    };
  }
};

// src/controllers/transactionController.ts
init_db();
var transactionController = {
  async listByCustomer(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { customerId } = req.params;
    const pagination = getPaginationQuery(req.query);
    try {
      const customer = await customerModel.findById(Number(customerId), req.userId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      const transactions = await transactionModel.findAllByCustomer(Number(customerId), req.userId, pagination);
      const balance = await transactionModel.getCustomerBalance(Number(customerId), req.userId);
      return res.json({ customer: { ...customer, balance }, transactions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },
  async create(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const customer = await customerModel.findById(Number(req.body.customerId), req.userId);
      if (!customer) return res.status(403).json({ error: "Customer not found" });
      const result = await transactionModel.create(req.userId, req.body);
      return res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add transaction" });
    }
  },
  async update(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      await transactionModel.update(Number(id), req.userId, req.body);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update transaction" });
    }
  },
  async delete(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      await transactionModel.softDelete(Number(id), req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete transaction" });
    }
  },
  async getSummary(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().split("T")[0];
      const totalGiven = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GAVE' AND user_id = ? AND deleted_at IS NULL", [req.userId]);
      const totalGot = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GOT' AND user_id = ? AND deleted_at IS NULL", [req.userId]);
      const todayEntries = await query(
        "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL",
        [today, req.userId]
      );
      const monthEntries = await query(
        "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) >= ? AND user_id = ? AND deleted_at IS NULL",
        [startOfMonth, req.userId]
      );
      return res.json({
        totalReceive: Number(totalGiven[0].total) - Number(totalGot[0].total),
        totalPay: 0,
        todayEntries: todayEntries[0],
        monthEntries: monthEntries[0]
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }
  },
  async getDashboard(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const customers = await query(`
        SELECT c.id, c.name,
          COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
          MAX(t.date) as last_transaction_date
        FROM customers c
        LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
        WHERE c.user_id = ? AND c.deleted_at IS NULL
        GROUP BY c.id
      `, [req.userId]);
      let totalToReceive = 0, totalToPay = 0;
      customers.forEach((c) => {
        const bal = Number(c.balance);
        if (bal > 0) totalToReceive += bal;
        else totalToPay += Math.abs(bal);
      });
      const topPending = [...customers].filter((c) => Number(c.balance) !== 0).sort((a, b) => Math.abs(Number(b.balance)) - Math.abs(Number(a.balance))).slice(0, 5).map((c) => ({ id: c.id, name: c.name, balance: Number(c.balance) }));
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdueCustomers = customers.filter((c) => {
        if (Number(c.balance) <= 0) return false;
        if (!c.last_transaction_date) return true;
        return new Date(c.last_transaction_date) < thirtyDaysAgo;
      }).map((c) => ({ id: c.id, name: c.name, balance: Number(c.balance), lastDate: c.last_transaction_date }));
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayStats = await query(`
        SELECT COUNT(*) as count,
          COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
          COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
        FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL
      `, [today, req.userId]);
      const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const monthStats = await query(`
        SELECT COUNT(*) as count,
          COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
          COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
        FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND user_id = ? AND deleted_at IS NULL
      `, [currentMonth, req.userId]);
      const monthlyOverview = [];
      for (let i = 5; i >= 0; i--) {
        const d = /* @__PURE__ */ new Date();
        d.setMonth(d.getMonth() - i);
        const ym = d.toISOString().slice(0, 7);
        const label = d.toLocaleString("default", { month: "short" });
        const row = await query(`
          SELECT 
            COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
            COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
          FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND user_id = ? AND deleted_at IS NULL
        `, [ym, req.userId]);
        monthlyOverview.push({ month: label, gave: Number(row[0].gave), got: Number(row[0].got) });
      }
      const recentTransactions = await query(`
        SELECT t.*, c.name as customer_name
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id AND c.deleted_at IS NULL
        WHERE t.user_id = ? AND t.deleted_at IS NULL
        ORDER BY t.date DESC LIMIT 10
      `, [req.userId]);
      return res.json({
        totalToReceive,
        totalToPay,
        todayCount: Number(todayStats[0].count),
        todayGave: Number(todayStats[0].gave),
        todayGot: Number(todayStats[0].got),
        monthCount: Number(monthStats[0].count),
        monthGave: Number(monthStats[0].gave),
        monthGot: Number(monthStats[0].got),
        topPending,
        overdueCustomers,
        monthlyOverview,
        recentTransactions
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  },
  async getEntries(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const entries = await query("SELECT * FROM transactions WHERE user_id = ? AND deleted_at IS NULL", [req.userId]);
      return res.json(entries);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch entries" });
    }
  },
  async restore(req, res) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { customers, entries } = req.body;
    if (!customers || !entries) return res.status(400).json({ error: "Invalid data" });
    const conn = await (await Promise.resolve().then(() => (init_db(), db_exports))).pool.getConnection();
    try {
      await conn.beginTransaction();
      const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
      await conn.execute("UPDATE transactions SET deleted_at = ? WHERE user_id = ?", [now, req.userId]);
      await conn.execute("UPDATE customers SET deleted_at = ? WHERE user_id = ?", [now, req.userId]);
      await conn.execute("DELETE FROM transactions WHERE user_id = ? AND deleted_at IS NOT NULL", [req.userId]);
      await conn.execute("DELETE FROM customers WHERE user_id = ? AND deleted_at IS NOT NULL", [req.userId]);
      for (const c of customers) {
        await conn.execute("INSERT INTO customers (id, user_id, name, mobile) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), mobile=VALUES(mobile), deleted_at=NULL", [c.id, req.userId, c.name, c.mobile || ""]);
      }
      for (const t of entries) {
        await conn.execute(
          "INSERT INTO transactions (id, customer_id, user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), amount=VALUES(amount), description=VALUES(description), date=VALUES(date), deleted_at=NULL",
          [t.id, t.customer_id, req.userId, t.type, t.amount, t.description || "", t.date]
        );
      }
      await conn.commit();
      return res.json({ success: true });
    } catch (error) {
      await conn.rollback();
      console.error(error);
      return res.status(500).json({ error: "Restore failed" });
    } finally {
      conn.release();
    }
  }
};

// src/validators/transactionValidator.ts
import { z as z3 } from "zod";
var createTransactionSchema = z3.object({
  customerId: z3.number().or(z3.string().regex(/^\d+$/).transform(Number)),
  type: z3.enum(["GAVE", "GOT"], { message: "Type must be GAVE or GOT" }),
  amount: z3.number().positive("Amount must be positive"),
  description: z3.string().optional(),
  date: z3.string().datetime().optional()
});
var updateTransactionSchema = z3.object({
  type: z3.enum(["GAVE", "GOT"], { message: "Type must be GAVE or GOT" }),
  amount: z3.number().positive(),
  description: z3.string().optional(),
  date: z3.string().datetime().optional()
});

// src/routes/transactionRoutes.ts
var router3 = Router3();
router3.use(authMiddleware);
router3.post("/", validate(createTransactionSchema), transactionController.create);
router3.put("/:id", validate(updateTransactionSchema), transactionController.update);
router3.delete("/:id", transactionController.delete);
router3.get("/customer/:customerId", transactionController.listByCustomer);
router3.get("/summary", transactionController.getSummary);
router3.get("/dashboard", transactionController.getDashboard);
router3.get("/entries", transactionController.getEntries);
router3.post("/restore", transactionController.restore);
var transactionRoutes_default = router3;

// src/routes/adminRoutes.ts
import { Router as Router4 } from "express";

// src/controllers/adminController.ts
import bcrypt2 from "bcryptjs";

// src/models/adminModel.ts
init_db();
var adminModel = {
  async getAdminByUsername(username) {
    const admins = await query("SELECT * FROM admin_config WHERE username = ?", [username]);
    return admins.length > 0 ? admins[0] : null;
  },
  async updateAdminCredentials(id, username, passwordHash) {
    if (username) {
      await query("UPDATE admin_config SET username = ? WHERE id = ?", [username, id]);
    }
    if (passwordHash) {
      await query("UPDATE admin_config SET password_hash = ? WHERE id = ?", [passwordHash, id]);
    }
  },
  async getAllUsers() {
    return await query(
      "SELECT id, name, email, username, email_verified, created_at FROM users ORDER BY created_at DESC"
    );
  },
  async getUserStats(userId) {
    const cCount = await query("SELECT COUNT(*) as cnt FROM customers WHERE user_id = ? AND deleted_at IS NULL", [userId]);
    const tCount = await query("SELECT COUNT(*) as cnt FROM transactions WHERE user_id = ? AND deleted_at IS NULL", [userId]);
    return {
      customerCount: cCount[0].cnt,
      transactionCount: tCount[0].cnt
    };
  },
  async getGlobalStats() {
    const totalUsers = await query("SELECT COUNT(*) as cnt FROM users");
    const totalCustomers = await query("SELECT COUNT(*) as cnt FROM customers WHERE deleted_at IS NULL");
    const totalTransactions = await query("SELECT COUNT(*) as cnt FROM transactions WHERE deleted_at IS NULL");
    const verifiedUsers = await query("SELECT COUNT(*) as cnt FROM users WHERE email_verified = 1");
    return {
      totalUsers: totalUsers[0].cnt,
      totalCustomers: totalCustomers[0].cnt,
      totalTransactions: totalTransactions[0].cnt,
      verifiedUsers: verifiedUsers[0].cnt
    };
  }
};

// src/controllers/adminController.ts
init_db();
var adminController = {
  async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    try {
      const admin = await adminModel.getAdminByUsername(username);
      if (!admin) return res.status(401).json({ error: "Invalid credentials" });
      const valid = await bcrypt2.compare(password, admin.password_hash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const token = generateAdminToken();
      return res.json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Login failed" });
    }
  },
  async updateCredentials(req, res) {
    const { username, password } = req.body;
    if (!username && !password) return res.status(400).json({ error: "Provide username or password to update" });
    try {
      let passwordHash;
      if (password) {
        passwordHash = await bcrypt2.hash(password, 10);
      }
      await adminModel.updateAdminCredentials(1, username, passwordHash);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update credentials" });
    }
  },
  async getUsers(req, res) {
    try {
      const users = await adminModel.getAllUsers();
      for (const user of users) {
        const stats = await adminModel.getUserStats(user.id);
        user.customer_count = stats.customerCount;
        user.transaction_count = stats.transactionCount;
        user.email_verified = user.email_verified === 1;
      }
      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  },
  async updateUser(req, res) {
    const { id } = req.params;
    const { action, password } = req.body;
    try {
      if (action === "verify-email") {
        await query("UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE id = ?", [id]);
        return res.json({ success: true, message: "User email verified" });
      } else if (action === "reset-password" && password) {
        const hash = await bcrypt2.hash(password, 10);
        await query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, id]);
        return res.json({ success: true, message: "Password reset" });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  },
  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      await query("DELETE FROM users WHERE id = ?", [id]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete user" });
    }
  },
  async getCustomers(req, res) {
    const search = req.query.search;
    try {
      let sql = `SELECT c.*, u.name as user_name, u.email as user_email,
        COALESCE(SUM(CASE WHEN t.type='GAVE' THEN t.amount ELSE -t.amount END), 0) as balance
        FROM customers c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
        WHERE c.deleted_at IS NULL`;
      const params = [];
      if (search) {
        sql += " AND (c.name LIKE ? OR u.name LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }
      sql += " GROUP BY c.id ORDER BY c.created_at DESC";
      const customers = await query(sql, params);
      return res.json(customers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch customers" });
    }
  },
  async getStats(req, res) {
    try {
      const stats = await adminModel.getGlobalStats();
      return res.json(stats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
};

// src/middleware/adminMiddleware.ts
init_env();
import jwt2 from "jsonwebtoken";
function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt2.verify(token, ENV.JWT_SECRET);
    if (!payload.admin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}

// src/routes/adminRoutes.ts
var router4 = Router4();
router4.post("/login", adminController.login);
router4.use(adminAuthMiddleware);
router4.get("/users", adminController.getUsers);
router4.put("/users/:id", adminController.updateUser);
router4.delete("/users/:id", adminController.deleteUser);
router4.get("/customers", adminController.getCustomers);
router4.get("/stats", adminController.getStats);
router4.put("/credentials", adminController.updateCredentials);
var adminRoutes_default = router4;

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = ENV.PORT;
  app.use(express.json());
  try {
    await initSchema();
  } catch (err) {
    logger.error("Database initialization failed. Please check config:", err);
    process.exit(1);
  }
  app.use("/admin", express.static(path.join(__dirname, "admin")));
  app.get("/admin", (_req, res) => {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
  });
  app.use("/api/auth", authRoutes_default);
  app.use("/api/customers", customerRoutes_default);
  app.use("/api/transactions", transactionRoutes_default);
  app.get("/api/summary", (req, res, next) => {
    req.url = "/summary";
    transactionRoutes_default(req, res, next);
  });
  app.get("/api/dashboard", (req, res, next) => {
    req.url = "/dashboard";
    transactionRoutes_default(req, res, next);
  });
  app.get("/api/entries", (req, res, next) => {
    req.url = "/entries";
    transactionRoutes_default(req, res, next);
  });
  app.post("/api/restore", (req, res, next) => {
    req.url = "/restore";
    transactionRoutes_default(req, res, next);
  });
  app.use("/api/admin", adminRoutes_default);
  if (ENV.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Admin panel: http://localhost:${PORT}/admin`);
  });
}
startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
