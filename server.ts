import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Server] Notice creating data dir:', err);
  }
}
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const portFromArg = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : undefined;
  const PORT = parseInt(process.env.PORT || portFromArg || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Helper to resolve sender identity matching authenticated SMTP credentials
  function getSenderDetails(customConfig?: {
    host?: string;
    port?: number | string;
    user?: string;
    pass?: string;
    senderName?: string;
    senderEmail?: string;
  }) {
    const user = (
      customConfig?.senderEmail ||
      customConfig?.user ||
      process.env.SMTP_USER ||
      process.env.ADMIN_EMAIL ||
      'ahmedskkawsar43@gmail.com'
    ).trim();
    const name = (
      customConfig?.senderName ||
      process.env.SMTP_SENDER_NAME ||
      'R Mart Official'
    ).trim();
    const domain = user.includes('@') ? user.split('@')[1] : 'rmartofficial.shop';
    return {
      user,
      name,
      domain,
      fromHeader: `"${name}" <${user}>`,
    };
  }

  // Helper to create mail transporter (supports dynamic SMTP config or env fallback)
  function getTransporter(customConfig?: {
    host?: string;
    port?: number | string;
    user?: string;
    pass?: string;
    senderName?: string;
    senderEmail?: string;
  }) {
    const host = (customConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt(String(customConfig?.port || process.env.SMTP_PORT || '587'), 10);
    const user = (customConfig?.user || customConfig?.senderEmail || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'ahmedskkawsar43@gmail.com').trim();
    const rawPass = (customConfig?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
    const pass = rawPass.replace(/\s+/g, '');

    // If no password is provided in environment variables or config, return null to avoid failing connections
    if (!pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 9000,
      greetingTimeout: 9000,
      socketTimeout: 9000,
    });
  }

  // API endpoint: Test SMTP Connection & Send Test Email
  app.post('/api/test-smtp-connection', async (req, res) => {
    const { host, port, user, pass, testRecipient } = req.body;
    const transporter = getTransporter({ host, port, user, pass });

    if (!transporter) {
      return res.status(400).json({
        success: false,
        error: 'SMTP Password or App Password is required. Please enter your Gmail App Password or SMTP password.',
      });
    }

    try {
      // 1. Verify credentials with SMTP server
      await transporter.verify();

      // 2. Optionally dispatch a test ping message
      if (testRecipient) {
        const senderUser = (user || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'ahmedskkawsar43@gmail.com').trim();
        await transporter.sendMail({
          from: `"R Mart SMTP Tester" <${senderUser}>`,
          to: testRecipient,
          subject: '✅ R Mart SMTP Connection Successful!',
          text: `Your SMTP settings on R Mart are working perfectly!\nTimestamp: ${new Date().toLocaleString()}\nHost: ${host || process.env.SMTP_HOST || 'smtp.gmail.com'}`,
          html: `<div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 500px; margin: 0 auto;">
            <div style="background: #ecfdf5; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
              <h2 style="color: #059669; margin: 0; font-size: 18px;">✅ SMTP Connection Successful!</h2>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">Your R Mart e-commerce store is properly configured to send automated transactional order confirmation & shipping notification emails.</p>
            <ul style="color: #475569; font-size: 13px; line-height: 1.6;">
              <li><strong>Host:</strong> ${host || process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
              <li><strong>Port:</strong> ${port || process.env.SMTP_PORT || '587'}</li>
              <li><strong>User:</strong> ${senderUser}</li>
              <li><strong>Tested At:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 20px;">R Mart Official • Mirpur DOHS, Dhaka, Bangladesh</p>
          </div>`,
        });
      }

      return res.json({
        success: true,
        message: `SMTP connection established successfully! Test email dispatched${testRecipient ? ' to ' + testRecipient : ''}.`,
      });
    } catch (err: any) {
      console.warn('[R Mart SMTP Test Notice]:', err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to authenticate with SMTP server. Please verify credentials.',
      });
    }
  });

  // API endpoint: Send OTP Email
  app.post('/api/send-otp', async (req, res) => {
    const { email, code, name, type = 'verification', smtpConfig } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and verification code are required' });
    }

    const transporter = getTransporter(smtpConfig);
    const sender = getSenderDetails(smtpConfig);

    // If SMTP credentials are not set
    if (!transporter) {
      console.log(`[R Mart Email Server] ℹ️ SMTP credentials not set in environment or config. Test OTP for ${email}: ${code} (type: ${type})`);
      return res.json({
        success: true,
        smtpConfigured: false,
        code,
        message: `SMTP is not configured in server environment or admin settings. For testing, your 6-digit code is: ${code}`,
      });
    }

    console.log(`[R Mart Email Server] Dispatching OTP (${type}) via SMTP to: ${email} from ${sender.user}`);

    try {
      const isReset = type === 'reset';
      const messageId = `<rmart-${isReset ? 'reset' : 'otp'}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@${sender.domain}>`;
      const cleanSubject = isReset
        ? `${code} is your R Mart password reset code`
        : `${code} is your R Mart verification code`;
      const preheader = isReset
        ? `Your 6-digit R Mart password reset code is ${code}. Valid for 10 minutes.`
        : `Your 6-digit R Mart verification code is ${code}. Valid for 10 minutes.`;

      const cardTitle = isReset ? 'Password Reset Code' : 'Account Verification Code';
      const instructionHtml = isReset
        ? `Hello <strong>${name || 'Customer'}</strong>, you requested to reset your R Mart account password. Use the 6-digit code below to set a new password:`
        : `Hello <strong>${name || 'Customer'}</strong>, use the 6-digit verification code below to confirm your account on R Mart:`;

      const plainText = [
        `R Mart Bangladesh`,
        `Official Online Shopping Destination`,
        ``,
        `Hello ${name || 'Customer'},`,
        ``,
        isReset
          ? `You requested to reset your account password. Your 6-digit reset code is: ${code}`
          : `Your 6-digit verification code is: ${code}`,
        ``,
        `This code is valid for 10 minutes. For your security, do not share this code with anyone.`,
        ``,
        `If you did not request this, please ignore this email. Your account remains safe.`,
        ``,
        `----------------------------------------`,
        `R Mart Bangladesh`,
        `House #24, Road #03, Mirpur DOHS, Dhaka-1216, Bangladesh`,
        `Helpline: 01619415744 | Email: ahmedskkawsar43@gmail.com`,
      ].join('\n');

      const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${cleanSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for primary inbox preview -->
  <div style="display:none; font-size:1px; color:#f8fafc; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; padding: 8px 16px; background-color: #ecfdf5; border-radius: 12px; margin-bottom: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">R Mart</span>
              </div>
              <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">
                Official Online Shopping Destination
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                ${cardTitle}
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                ${instructionHtml}
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 20px; margin: 0 auto 24px auto; max-width: 320px;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #047857; text-align: center; margin-left: 12px;">
                  ${code}
                </div>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b;">
                ⏱ This code is valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request this, please ignore this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer (CAN-SPAM compliance prevents Spam folder) -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">
                R Mart Bangladesh
              </p>
              <p style="margin: 0 0 6px 0;">
                House #24, Road #03, Mirpur DOHS, Dhaka-1216, Bangladesh
              </p>
              <p style="margin: 0;">
                Hotline: <a href="tel:01619415744" style="color: #059669; text-decoration: none; font-weight: 600;">01619415744</a> &bull; Support: <a href="mailto:ahmedskkawsar43@gmail.com" style="color: #059669; text-decoration: none;">ahmedskkawsar43@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const mailOptions = {
        from: sender.fromHeader,
        replyTo: sender.user,
        to: email,
        subject: cleanSubject,
        text: plainText,
        html: htmlBody,
        messageId,
        headers: {
          'X-Entity-Ref-ID': messageId,
          'X-Mailer': 'R Mart NodeMailer Dispatcher',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
      };

      await transporter.sendMail(mailOptions);
      console.log(`[R Mart Email Server] ✅ Verification email successfully sent to: ${email}`);
      return res.json({
        success: true,
        smtpConfigured: true,
        message: `Verification code successfully sent to ${email}`,
      });
    } catch (err: any) {
      console.warn('[R Mart Email Server] ⚠️ SMTP dispatch failed:', err?.message || err);
      return res.json({
        success: true,
        smtpConfigured: false,
        code,
        error: err?.message,
        message: `SMTP dispatch notice: ${err?.message || 'Delivery error'}. For testing, your verification code is: ${code}`,
      });
    }
  });

  // API endpoint: Send Order Notification Email
  app.post('/api/send-order-email', async (req, res) => {
    const { to, subject, html, text, smtpConfig } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ success: false, error: 'Recipient and subject are required' });
    }

    const transporter = getTransporter(smtpConfig);
    const sender = getSenderDetails(smtpConfig);

    if (!transporter) {
      console.log(`[R Mart Email Server] Order email simulated for ${to} (GMAIL_APP_PASSWORD not set)`);
      return res.json({ success: true, simulated: true, note: 'GMAIL_APP_PASSWORD not set in environment' });
    }

    console.log(`[R Mart Email Server] Dispatching order email to: ${to} from ${sender.user}`);

    try {
      const orderMessageId = `<rmart-order-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@${sender.domain}>`;
      await transporter.sendMail({
        from: sender.fromHeader,
        replyTo: sender.user,
        to,
        subject,
        text: text || '',
        html: html || `<p>${text || ''}</p>`,
        messageId: orderMessageId,
        headers: {
          'X-Entity-Ref-ID': orderMessageId,
          'X-Mailer': 'R Mart NodeMailer Dispatcher v2.0',
        },
      });
      console.log(`[R Mart Email Server] ✅ Order email successfully sent to: ${to}`);
      return res.json({ success: true });
    } catch (err: any) {
      console.warn('[R Mart Email Server] Order email notice:', err?.message || err);
      return res.json({ success: true, error: err?.message });
    }
  });

  // Helper to get GoogleGenAI client safely
  function getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch {
      return null;
    }
  }

  // 1. Transactional API: Automated Order Confirmation Email to Customer
  app.post('/api/send-order-confirmation', async (req, res) => {
    const {
      to,
      orderNumber,
      customerName,
      items = [],
      totalAmount = 0,
      subtotal = 0,
      deliveryCharge = 0,
      discountAmount = 0,
      couponCode,
      shippingAddress = {},
      paymentMethod = 'Cash on Delivery',
      deliveryZoneName = 'Inside Dhaka',
      smtpConfig,
    } = req.body;

    if (!to || !orderNumber) {
      return res.status(400).json({ success: false, error: 'Recipient email and orderNumber are required' });
    }

    const transporter = getTransporter(smtpConfig);
    const sender = getSenderDetails(smtpConfig);
    if (!transporter) {
      console.log(`[R Mart Email] Order confirmation simulated for ${to} (Order #${orderNumber})`);
      return res.json({ success: true, simulated: true });
    }

    try {
      const messageId = `<rmart-confirm-${orderNumber}-${Date.now()}@${sender.domain}>`;
      const cleanSubject = `Order Confirmed: #${orderNumber} - R Mart Bangladesh`;
      const preheader = `Thank you for your order #${orderNumber}! Total: ৳${Number(totalAmount).toLocaleString()}. We are preparing your shipment.`;

      const itemsHtml = (items as any[])
        .map(
          (item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; font-size: 13px; color: #0f172a;">
            <strong>${item.productName || item.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${item.size ? 'Size: ' + item.size : ''} ${item.color ? '· Color: ' + item.color : ''}</span>
          </td>
          <td style="padding: 12px 8px; font-size: 13px; text-align: center; color: #334155;">${item.quantity}</td>
          <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #334155;">৳${Number(item.unitPrice || item.price).toLocaleString()}</td>
          <td style="padding: 12px 8px; font-size: 13px; text-align: right; font-weight: 700; color: #059669;">৳${Number(item.totalPrice || (item.price * item.quantity)).toLocaleString()}</td>
        </tr>`
        )
        .join('');

      const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${cleanSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display:none; font-size:1px; color:#f8fafc; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 16px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Top Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background-color: #047857; color: #ffffff;">
              <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">R Mart</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Official Online Store • Bangladesh</p>
              <div style="margin-top: 16px; display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px; font-weight: 600;">
                ✓ Order Confirmed: #${orderNumber}
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                Thank You, ${customerName || 'Valued Customer'}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                We have received your order successfully. Our fulfillment team is carefully preparing your items for swift delivery to your doorstep.
              </p>

              <!-- Order Summary Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                  Order Details
                </h3>
                <table width="100%" style="border-collapse: collapse; font-size: 12px;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Order Number:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #0f172a;">#${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Payment Method:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Delivery Zone:</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a;">${deliveryZoneName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Shipping To:</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a;">
                      ${shippingAddress.streetAddress || ''}, ${shippingAddress.district || ''}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Items Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                Ordered Items
              </h3>
              <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f1f5f9; font-size: 11px; text-transform: uppercase; color: #475569;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Unit</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Totals -->
              <table width="100%" style="border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Items Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a;">৳${Number(subtotal).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Delivery Charge:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a;">৳${Number(deliveryCharge).toLocaleString()}</td>
                </tr>
                ${
                  discountAmount > 0
                    ? `<tr>
                  <td style="padding: 4px 0; color: #059669;">Promo Discount (${couponCode || 'VOUCHER'}):</td>
                  <td style="padding: 4px 0; text-align: right; color: #059669; font-weight: 600;">-৳${Number(discountAmount).toLocaleString()}</td>
                </tr>`
                    : ''
                }
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 10px 0; font-size: 15px; font-weight: 800; color: #0f172a;">Total Payable:</td>
                  <td style="padding: 10px 0; font-size: 16px; font-weight: 800; text-align: right; color: #047857;">৳${Number(totalAmount).toLocaleString()}</td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                Need help with your order? Hotline: <a href="tel:01619415744" style="color: #059669; font-weight: 600; text-decoration: none;">01619415744</a> (10:00 AM - 10:00 PM).
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">R Mart Bangladesh</p>
              <p style="margin: 0;">House #24, Road #03, Mirpur DOHS, Dhaka-1216</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: sender.fromHeader,
        replyTo: sender.user,
        to,
        subject: cleanSubject,
        html: htmlBody,
        messageId,
        headers: {
          'X-Entity-Ref-ID': messageId,
          'X-Mailer': 'R Mart NodeMailer Dispatcher v2.0',
        },
      });

      console.log(`[R Mart Email] ✅ Automated order confirmation sent to ${to} for #${orderNumber}`);
      return res.json({ success: true });
    } catch (err: any) {
      console.warn('[R Mart Email] Order confirmation error:', err?.message || err);
      return res.json({ success: true, error: err?.message });
    }
  });

  // 2. Transactional API: Automated Shipping Status Update Email
  app.post('/api/send-shipping-update', async (req, res) => {
    const {
      to,
      orderNumber,
      customerName,
      newStatus,
      statusNote,
      totalAmount,
      itemsCount = 1,
      courierName = 'Steadfast Courier / RedX',
      consignmentId,
      smtpConfig,
    } = req.body;

    if (!to || !orderNumber || !newStatus) {
      return res.status(400).json({ success: false, error: 'Recipient, orderNumber and newStatus are required' });
    }

    const transporter = getTransporter(smtpConfig);
    const sender = getSenderDetails(smtpConfig);
    if (!transporter) {
      console.log(`[R Mart Email] Shipping update simulated for ${to} (${newStatus})`);
      return res.json({ success: true, simulated: true });
    }

    const statusTitles: Record<string, { title: string; color: string; desc: string }> = {
      confirmed: {
        title: 'Order Confirmed',
        color: '#0284c7',
        desc: 'Your order has been verified and confirmed by our team. Preparing for packing.',
      },
      processing: {
        title: 'Packing & Quality Check',
        color: '#d97706',
        desc: 'Your items are being packed with premium safety packaging at our warehouse.',
      },
      shipped: {
        title: 'Handed Over to Courier',
        color: '#7c3aed',
        desc: 'Your package is on its way with our trusted courier partner.',
      },
      out_for_delivery: {
        title: 'Out for Delivery Today',
        color: '#059669',
        desc: 'The delivery hero is carrying your parcel and will contact your phone soon.',
      },
      delivered: {
        title: 'Delivered Successfully',
        color: '#16a34a',
        desc: 'Your parcel has been delivered! Thank you for choosing R Mart.',
      },
      cancelled: {
        title: 'Order Cancelled',
        color: '#dc2626',
        desc: 'This order was cancelled as requested or due to customer verification notice.',
      },
    };

    const statusInfo = statusTitles[newStatus] || {
      title: newStatus.toUpperCase(),
      color: '#059669',
      desc: statusNote || 'Your order status has been updated.',
    };

    try {
      const messageId = `<rmart-shipment-${orderNumber}-${Date.now()}@${sender.domain}>`;
      const cleanSubject = `Shipment Update: #${orderNumber} is now ${statusInfo.title}`;

      const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${cleanSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 16px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px; text-align: center; background-color: ${statusInfo.color}; color: #ffffff;">
              <span style="font-size: 24px; font-weight: 800;">R Mart</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Order Shipment Tracking</p>
              <div style="margin-top: 14px; display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.25); border-radius: 20px; font-size: 13px; font-weight: 700;">
                ${statusInfo.title}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Hello <strong>${customerName || 'Customer'}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                ${statusInfo.desc}
              </p>

              ${
                statusNote
                  ? `<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #854d0e;">
                  <strong>Dispatcher Note:</strong> ${statusNote}
                </div>`
                  : ''
              }

              <!-- Tracking Info Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                <table width="100%" style="font-size: 12px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Order Number:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #0f172a;">#${orderNumber}</td>
                  </tr>
                  ${
                    totalAmount
                      ? `<tr>
                    <td style="padding: 4px 0; color: #64748b;">Total Amount:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #047857;">৳${Number(totalAmount).toLocaleString()}</td>
                  </tr>`
                      : ''
                  }
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Courier Partner:</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a;">${courierName}</td>
                  </tr>
                  ${
                    consignmentId
                      ? `<tr>
                    <td style="padding: 4px 0; color: #64748b;">Tracking ID:</td>
                    <td style="padding: 4px 0; text-align: right; font-family: monospace; font-weight: 700; color: #0284c7;">${consignmentId}</td>
                  </tr>`
                      : ''
                  }
                </table>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                For any delivery inquiries, please call our hotline: <a href="tel:01619415744" style="color: #059669; font-weight: 600; text-decoration: none;">01619415744</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #64748b;">
              <p style="margin: 0;">R Mart Bangladesh • Mirpur DOHS, Dhaka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: sender.fromHeader,
        replyTo: sender.user,
        to,
        subject: cleanSubject,
        html: htmlBody,
        messageId,
        headers: {
          'X-Entity-Ref-ID': messageId,
          'X-Mailer': 'R Mart NodeMailer Dispatcher v2.0',
        },
      });

      console.log(`[R Mart Email] ✅ Shipping update email sent to ${to} (${newStatus})`);
      return res.json({ success: true });
    } catch (err: any) {
      console.warn('[R Mart Email] Shipping update error:', err?.message || err);
      return res.json({ success: true, error: err?.message });
    }
  });

  // 3. AI Promo Broadcast API: Broadcast an AI marketing email to registered users
  app.post('/api/broadcast-product-email', async (req, res) => {
    const {
      recipients = [],
      subject,
      html,
      text,
      productName,
      smtpConfig,
      storeName,
      domain,
      senderName,
      senderEmail,
    } = req.body;
    if (!recipients.length || !subject || !html) {
      return res.status(400).json({ success: false, error: 'recipients list, subject, and html are required' });
    }

    const transporter = getTransporter(smtpConfig);
    const sender = getSenderDetails({
      ...smtpConfig,
      senderName: senderName || smtpConfig?.senderName,
      senderEmail: senderEmail || smtpConfig?.user,
    });
    const activeDomain = (domain || sender.domain || 'rmartofficial.shop').trim();

    if (!transporter) {
      console.log(`[R Mart Email] Promo broadcast simulated to ${recipients.length} recipients for ${productName}`);
      return res.json({ success: true, simulated: true, count: recipients.length });
    }

    console.log(`[R Mart Email] Broadcasting AI promo email for "${productName}" to ${recipients.length} recipients from ${sender.user}...`);

    let sentCount = 0;
    const errors: string[] = [];

    // Ensure email contains anti-spam CAN-SPAM compliant unsubscribe block
    let finalHtml = html;
    if (!finalHtml.toLowerCase().includes('unsubscribe')) {
      const antiSpamFooter = `
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 24px 20px; background-color: #f1f5f9; text-align: center; font-size: 11px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-top: 1px solid #e2e8f0; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0 0 6px 0; color: #334155; font-weight: 700;">${sender.name} Official Online Store</p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">House #24, Road #03, Mirpur DOHS, Dhaka-1216, Bangladesh</p>
              <p style="margin: 0 0 10px 0; font-size: 10px; color: #94a3b8; max-width: 440px; line-height: 1.4; margin-left: auto; margin-right: auto;">
                You are receiving this communication because you are a registered customer of R Mart (https://${activeDomain}).
              </p>
              <p style="margin: 0; font-size: 11px;">
                <a href="https://${activeDomain}/account?unsubscribe=true" style="color: #059669; text-decoration: underline; font-weight: 600;">Unsubscribe from promotional emails</a> &nbsp;•&nbsp; 
                <a href="https://${activeDomain}/privacy-policy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> &nbsp;•&nbsp; 
                <a href="https://${activeDomain}/contact" style="color: #64748b; text-decoration: none;">Customer Support</a>
              </p>
            </td>
          </tr>
        </table>
      `;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${antiSpamFooter}</body>`);
      } else {
        finalHtml += antiSpamFooter;
      }
    }

    // Clean plain text companion for optimal MIME multipart compliance (SpamAssassin score booster)
    const cleanPlainText = text && text.length > 50
      ? text
      : `${subject}\n\n${productName}\nOrder Online: https://${activeDomain}\n\nR Mart Official Store\nHouse #24, Road #03, Mirpur DOHS, Dhaka-1216, Bangladesh\nTo unsubscribe from marketing emails, visit: https://${activeDomain}/account?unsubscribe=true`;

    // Process recipients with rate-limiting delay between dispatches (avoids bulk spam triggers)
    for (const recipientEmail of recipients) {
      try {
        const promoId = `<rmart-promo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${sender.domain}>`;
        await transporter.sendMail({
          from: sender.fromHeader,
          replyTo: sender.user,
          to: recipientEmail,
          subject,
          html: finalHtml,
          text: cleanPlainText,
          messageId: promoId,
          headers: {
            'X-Entity-Ref-ID': promoId,
            'List-Unsubscribe': `<mailto:${sender.user}?subject=Unsubscribe>, <https://${activeDomain}/account?unsubscribe=true>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'Precedence': 'bulk',
            'Auto-Submitted': 'auto-generated',
            'X-Auto-Response-Suppress': 'All',
            'Feedback-ID': `promo:${activeDomain}:rmart`,
            'X-Report-Abuse': `mailto:${sender.user}`,
            'X-Mailer': 'R Mart Campaign Dispatcher v2.0 (Inbox Verified)',
          },
        });
        sentCount++;
        // Small delay (150ms) to ensure smooth SMTP throttling and preserve domain reputation
        if (recipients.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      } catch (err: any) {
        errors.push(`${recipientEmail}: ${err?.message}`);
      }
    }

    console.log(`[R Mart Email] Broadcast finished. Successfully dispatched: ${sentCount}/${recipients.length}`);
    return res.json({
      success: true,
      count: sentCount,
      total: recipients.length,
      errors: errors.slice(0, 3),
      inboxOptimized: true,
      senderUsed: sender.user,
    });
  });

  // 4. AI Generator: Product Description
  app.post('/api/ai/generate-description', async (req, res) => {
    const { productName, category, brand, features, price } = req.body;
    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `You are a top Bangladeshi e-commerce copywriter for R Mart (rmartofficial.shop).
Generate a rich, persuasive product description in a blend of English and Bangla (Banglish-friendly for Bangladeshi shoppers) for the following product:
Product Name: ${productName}
Category: ${category || 'General'}
Brand: ${brand || 'R Mart Originals'}
Key Features: ${features || 'Premium quality, durable, stylish'}
Price: ৳${price || 'Affordable'}

Format the output cleanly with:
1. An irresistible 2-sentence opening hook.
2. 5 bullet points of key specifications & highlights (with emoji).
3. Quality & Authenticity guarantee.
4. Care & Usage instructions.
5. Why order from R Mart (Cash on Delivery nationwide, 7-day easy return).

Keep it professional, engaging, and ready to paste into an online store product description textarea.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ success: true, description: response.text.trim() });
        }
      } catch (err: any) {
        console.warn('Gemini API call notice, using smart local generator:', err?.message || err);
      }
    }

    // High quality domain-specific fallback generator
    const brandName = brand || 'R Mart Originals';
    const fallbackDesc = `🌟 **${productName}** – Exclusive Collection from ${brandName}!

প্রিমিয়াম কোয়ালিটি ও আধুনিক ডিজাইনের সমন্বয়ে তৈরি ${productName} আপনার প্রতিদিনের জীবনযাত্রা এবং স্টাইলিংয়ের জন্য একটি আদর্শ পছন্দ। ১০০% আসল ও টেকসই উপাদানে তৈরি।

✨ **প্রধান আকর্ষণ ও বৈশিষ্ট্যসমূহ:**
• 💎 **উচ্চমানের ম্যাটেরিয়াল:** আরামদায়ক, দীর্ঘস্থায়ী এবং প্রিমিয়াম ফিনিশিং।
• 🎯 **স্মার্ট ও ট্রেন্ডি লুক:** আধুনিক ট্রেন্ডের সাথে মানানসই মার্জিত লুক।
• 🛡️ **১০০% অরিজিনাল গ্যারান্টি:** সরাসরি বিশ্বস্ত সোর্স থেকে সংগ্রহ করা পণ্য।
• ⚡ **সহজ ব্যবহার ও যত্ন:** প্রতিদিনের ব্যবহারের জন্য অত্যন্ত উপযোগী।
• 📦 **নিরাপদ প্যাকেজিং:** ডেলিভারির সময় ক্ষতিমুক্ত রাখার বিশেষ প্যাকিং।

🚚 **কেন R Mart থেকে কিনবেন?**
✓ সমগ্র বাংলাদেশে দ্রুততম হোম ডেলিভারি।
✓ ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা।
✓ পণ্য দেখে মূল্য পরিশোধের সুযোগ।
✓ ৭ দিনের সহজ রিটার্ন ও পরিবর্তন পলিসি।

📞 হেল্পলাইন ও অর্ডার সাপোর্ট: 01619415744 (সকাল ১০টা - রাত ১০টা)`;

    return res.json({ success: true, description: fallbackDesc });
  });

  // 5. AI Generator: Realistic Customer Reviews
  app.post('/api/ai/generate-reviews', async (req, res) => {
    const { productName, category, count = 3 } = req.body;
    const reviewCount = Math.min(Math.max(1, Number(count) || 3), 5);

    const bangladeshiNames = [
      'Tanvir Ahmed', 'Farhana Akter', 'Md. Rakibul Hasan', 'Nusrat Jahan',
      'Arifur Rahman', 'Shamima Nasrin', 'Kamrul Islam', 'Tahmina Begum',
      'Mahmudul Hasan', 'Sumaiya Chowdhury'
    ];
    const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Narayanganj'];

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `Generate ${reviewCount} realistic customer reviews from Bangladeshi buyers for the product: "${productName}" (Category: ${category || 'General'}).
Return a clean JSON array with objects containing:
- userName (Realistic Bangladeshi name)
- rating (number between 4 and 5)
- comment (natural Bengali or English review praising quality, delivery, and value)
- location (City in Bangladesh)

Return ONLY valid JSON array with no markdown code blocks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({ success: true, reviews: parsed });
          }
        }
      } catch (err: any) {
        console.warn('Gemini review generator notice, using smart local template:', err?.message || err);
      }
    }

    // High quality localized fallback reviews
    const fallbackTemplates = [
      { comment: 'অসাধারণ কোয়ালিটি! ছবির মতোই হুবহু পেয়েছি। ডেলিভারিও খুব দ্রুত হয়েছে। R Mart-কে ধন্যবাদ!', rating: 5 },
      { comment: 'Very satisfied with the product! Material feels premium and durable. Will order again definitely.', rating: 5 },
      { comment: 'প্যাকেজিং খুব সুন্দর ছিল এবং ক্যাশ অন ডেলিভারিতে কোনো ঝামেলা হয়নি। প্রাইস অনুযায়ী খুবই ভালো।', rating: 4 },
      { comment: 'Product quality is top notch! Customer care service also very helpful. 10/10 recommended.', rating: 5 },
      { comment: 'অনেক খোঁজাখুঁজির পর R Mart-এ পেলাম। কোয়ালিটি নিয়ে কোনো সন্দেহ নেই, এক কথায় সেরা।', rating: 5 },
    ];

    const generated = Array.from({ length: reviewCount }).map((_, i) => {
      const template = fallbackTemplates[i % fallbackTemplates.length];
      const name = bangladeshiNames[(i * 3 + Math.floor(Math.random() * 2)) % bangladeshiNames.length];
      const city = cities[(i * 2) % cities.length];
      return {
        id: 'rev_ai_' + Date.now() + '_' + i,
        userName: name,
        rating: template.rating,
        comment: template.comment,
        location: city,
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(),
      };
    });

    return res.json({ success: true, reviews: generated });
  });

  // 6. AI Generator: Promotional Email Template
  app.post('/api/ai/generate-promo-email', async (req, res) => {
    const { productName, price, salePrice, category, imageUrl, productUrl } = req.body;
    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const currentPrice = salePrice || price || 1200;
    const oldPrice = salePrice && price && price > salePrice ? price : null;
    const discountPercent = oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : null;

    const defaultSubject = discountPercent
      ? `🔥 স্পেশাল অফার: ${productName} এখন ${discountPercent}% ছাড়ে R Mart-এ!`
      : `✨ নতুন কালেকশন: ${productName} এখন পাওয়া যাচ্ছে R Mart-এ!`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${defaultSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 16px; background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Top Banner -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #047857; color: #ffffff;">
              <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">R Mart</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">New Arrival Exclusive Announcement</p>
            </td>
          </tr>

          ${
            imageUrl
              ? `<!-- Product Image -->
          <tr>
            <td style="padding: 0; text-align: center; background-color: #f1f5f9;">
              <img src="${imageUrl}" alt="${productName}" style="width: 100%; max-height: 280px; object-fit: cover; display: block;" />
            </td>
          </tr>`
              : ''
          }

          <!-- Details -->
          <tr>
            <td style="padding: 28px 32px; text-align: center;">
              ${
                discountPercent
                  ? `<div style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #b91c1c; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 12px;">
                🔥 SAVE ${discountPercent}% LIMITED TIME
              </div>`
                  : `<div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; color: #047857; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 12px;">
                ✨ JUST ADDED TO CATALOG
              </div>`
              }

              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                ${productName}
              </h2>
              <p style="margin: 0 0 18px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                আমাদের নতুন কালেকশন এখন লাইভ! প্রিমিয়াম কোয়ালিটি ও দ্রুত হোম ডেলিভারির সাথে অর্ডার করুন সরাসরি ওয়েবসাইট থেকে।
              </p>

              <!-- Price Box -->
              <div style="background-color: #f8fafc; border-radius: 14px; padding: 14px; margin-bottom: 24px; display: inline-block; min-width: 200px; border: 1px solid #e2e8f0;">
                <span style="font-size: 12px; color: #64748b; display: block;">Special Price</span>
                <span style="font-size: 24px; font-weight: 800; color: #059669;">৳${Number(currentPrice).toLocaleString()}</span>
                ${oldPrice ? `<span style="font-size: 14px; color: #94a3b8; text-decoration: line-through; margin-left: 8px;">৳${Number(oldPrice).toLocaleString()}</span>` : ''}
              </div>

              <!-- CTA Button -->
              <div>
                <a href="${productUrl || 'https://rmartofficial.shop'}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #052e16; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  View Product & Order Now &rarr;
                </a>
              </div>

              <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; display: flex; justify-content: center; gap: 16px;">
                <span>✓ Cash on Delivery</span>
                <span>✓ Fast Nationwide Shipping</span>
                <span>✓ 7-Day Easy Returns</span>
              </div>
            </td>
          </tr>

          <!-- Anti-Spam & CAN-SPAM Compliant Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">R Mart Official Marketplace • Bangladesh</p>
              <p style="margin: 0 0 6px 0;">House #24, Road #03, Mirpur DOHS, Dhaka-1216</p>
              <p style="margin: 0 0 10px 0; font-size: 10px; color: #94a3b8;">
                You received this promotional broadcast because you have an account or placed an order on R Mart.
              </p>
              <p style="margin: 0; font-size: 11px;">
                <a href="${productUrl ? productUrl.split('#')[0] : 'https://rmartofficial.shop'}/account?unsubscribe=true" style="color: #059669; text-decoration: underline; font-weight: 600;">Unsubscribe from promotional emails</a> &nbsp;•&nbsp; 
                <a href="${productUrl ? productUrl.split('#')[0] : 'https://rmartofficial.shop'}/terms" style="color: #64748b; text-decoration: none;">Terms & Privacy</a> &nbsp;•&nbsp; 
                <a href="${productUrl ? productUrl.split('#')[0] : 'https://rmartofficial.shop'}/contact" style="color: #64748b; text-decoration: none;">Help Center</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const plainText = [
      defaultSubject,
      '',
      `Product: ${productName}`,
      `Category: ${category || 'General'}`,
      `Price: ৳${Number(currentPrice).toLocaleString()}${oldPrice ? ` (Regular: ৳${Number(oldPrice).toLocaleString()})` : ''}`,
      '',
      `Our new collection is now live on R Mart. Order with fast nationwide delivery & Cash on Delivery across Bangladesh.`,
      '',
      `Order Link: ${productUrl || 'https://rmartofficial.shop'}`,
      '',
      `----------------------------------------`,
      `R Mart Official Online Store`,
      `House #24, Road #03, Mirpur DOHS, Dhaka-1216, Bangladesh`,
      `Helpline: 01619415744`,
      `To unsubscribe from marketing emails, visit: ${productUrl ? productUrl.split('#')[0] : 'https://rmartofficial.shop'}/account?unsubscribe=true`,
    ].join('\n');

    return res.json({
      success: true,
      subject: defaultSubject,
      html,
      text: plainText,
    });
  });

  // 7. AI Generator: Catchy Product Titles & SEO Suggestions
  app.post('/api/ai/suggest-titles', async (req, res) => {
    const { keyword, category, brand } = req.body;
    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Product keyword or draft title is required' });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `You are an expert e-commerce catalog optimizer for R Mart Bangladesh.
Generate 5 high-converting, attractive product title variations for:
Keyword/Idea: "${keyword}"
Category: "${category || 'General'}"
Brand: "${brand || 'R Mart'}"

Requirements:
- Mix of premium, descriptive, and seasonal/offer-oriented titles
- Optimized for Bangladeshi online shoppers (Clear, attractive, trustworthy)
- Also suggest 3 trending SEO search tags
Return ONLY valid JSON with format:
{
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "tags": ["tag1", "tag2", "tag3"]
}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.titles) {
            return res.json({ success: true, titles: parsed.titles, tags: parsed.tags || [] });
          }
        }
      } catch (err: any) {
        console.warn('AI title generator notice:', err?.message || err);
      }
    }

    // High quality fallback titles
    const cleanWord = keyword.trim();
    const brandPrefix = brand ? `${brand} ` : '';
    const fallbackTitles = [
      `Premium ${brandPrefix}${cleanWord} - Exclusive Edition`,
      `Official ${brandPrefix}${cleanWord} (100% Original Guarantee)`,
      `Trending ${brandPrefix}${cleanWord} with Fast Delivery`,
      `Luxury Handcrafted ${brandPrefix}${cleanWord} for Everyday Comfort`,
      `Super Saver ${brandPrefix}${cleanWord} - Best Price in BD`,
    ];
    return res.json({
      success: true,
      titles: fallbackTitles,
      tags: [cleanWord.toLowerCase(), 'premium', 'bangladesh-shopping'],
    });
  });

  // 8. AI Generator: Smart Pricing & Profit Margin Calculator
  app.post('/api/ai/suggest-pricing', async (req, res) => {
    const { costPrice, targetMargin = 30 } = req.body;
    const cost = Number(costPrice) || 500;
    const margin = Math.min(Math.max(10, Number(targetMargin) || 30), 80);

    // Calculate smart psychological retail price in BDT
    const baseSelling = cost / (1 - margin / 100);
    // Round to attractive e-commerce ends (e.g., 90, 50, 00)
    const roundedSelling = Math.ceil(baseSelling / 10) * 10;
    const suggestedRegularPrice = Math.ceil((roundedSelling * 1.25) / 50) * 50; // Show higher regular price for discount effect
    const suggestedSalePrice = roundedSelling;
    const discountPercent = Math.round(((suggestedRegularPrice - suggestedSalePrice) / suggestedRegularPrice) * 100);
    const estimatedProfit = suggestedSalePrice - cost;

    return res.json({
      success: true,
      pricing: {
        costPrice: cost,
        suggestedRegularPrice,
        suggestedSalePrice,
        discountPercent,
        estimatedProfit,
        profitMarginPercent: Math.round((estimatedProfit / suggestedSalePrice) * 100),
      },
    });
  });

  // Store Settings Persistence APIs
  app.get('/api/settings', (_req, res) => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return res.json({ success: true, settings: parsed });
      }
    } catch (err: any) {
      console.warn('[Server] Error reading settings file:', err?.message);
    }
    return res.json({ success: true, settings: null });
  });

  app.post('/api/settings', (req, res) => {
    try {
      const incoming = req.body;
      if (incoming && typeof incoming === 'object') {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(incoming, null, 2), 'utf-8');
        return res.json({ success: true, message: 'Settings saved successfully' });
      }
      return res.status(400).json({ success: false, error: 'Invalid settings payload' });
    } catch (err: any) {
      console.error('[Server] Error writing settings file:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to save settings' });
    }
  });

  // AI Generator: High-Converting Banner Prompt & Marketing Copy from Coupon
  app.post('/api/ai/generate-banner-prompt', async (req, res) => {
    const { couponCode, discountText, campaignTheme, category, audience } = req.body;
    const code = (couponCode || 'SPECIAL').toUpperCase().trim();
    const discount = discountText || 'Special Discount';
    const theme = campaignTheme || 'Mega Marketplace Sale';

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `You are a creative marketing director for R Mart (rmartofficial.shop), Bangladesh's premier multi-category e-commerce marketplace.
We are launching a new promotional hero banner for the homepage.
Promotion Details:
- Coupon Code: "${code}"
- Discount Offer: "${discount}"
- Campaign Theme: "${theme}"
- Category: "${category || 'All Categories'}"
- Target Audience: "${audience || 'Bangladeshi online shoppers looking for quality and great deals'}"

Generate:
1. "prompt": A highly descriptive, cinematic commercial AI image generation prompt (in English) describing a modern, ultra-luxurious 16:9 widescreen e-commerce advertisement banner. Include floating 3D elements, premium lighting, elegant typography spaces, vibrant colors, product showcases, and a festive atmosphere.
2. "title": A punchy, attractive Bengali/English promotional headline (max 6 words). E.g. "মেগা ডিসকাউন্ট অফার!" or "Exclusive Mega Sale"
3. "subtitle": A compelling subheadline highlighting the coupon code and savings (e.g., "Use Coupon Code ${code} at checkout to get ${discount}").
4. "buttonText": High-converting Call-to-Action button text (e.g., "কুপন ব্যবহার করুন" or "Shop with ${code}").
5. "tagline": Short promotional badge text (e.g., "Limited Time Offer" or "Special Eid Deal").

Return ONLY valid JSON matching this schema:
{
  "prompt": "string",
  "title": "string",
  "subtitle": "string",
  "buttonText": "string",
  "tagline": "string"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        return res.json({ success: true, ...parsed });
      } catch (err: any) {
        console.warn('[Server AI] Notice generating banner prompt with Gemini:', err?.message);
      }
    }

    // High quality template fallback if AI client unavailable
    const fallbackPrompts: Record<string, string> = {
      eid: `Ultra-luxurious 16:9 commercial promotional banner for R Mart Bangladesh. Celebratory Eid festive atmosphere with elegant crescent moon, golden lanterns, floating wrapped gift boxes, emerald and gold silk ribbons, sparkling dust, high-end studio lighting, cinematic 3D render, ample clean space on left for typography 'EID SPECIAL - Code ${code}'.`,
      electronics: `Modern futuristic 16:9 e-commerce advertising banner for R Mart electronics. Showcasing sleek wireless earbuds, smartwatches, ultra-thin smartphones floating in zero-gravity with neon cyan and emerald glowing trails, clean tech aesthetic, cinematic studio lighting, commercial 4K render for discount code ${code}.`,
      fashion: `Vibrant trendy 16:9 fashion campaign hero banner for R Mart. Premium fabrics, stylish modern apparel, luxury shopping bags, floating discount tags, warm studio photography, elegant magazine layout with clean typography space for coupon ${code} (${discount}).`,
      default: `Striking 16:9 commercial e-commerce advertising banner for R Mart. High-energy promotional atmosphere with vibrant floating shopping bags, 3D golden percentage badges, sparkling confetti particles, deep emerald and golden luxury palette, studio lighting, advertising photography with clear space for headline and promo code ${code} (${discount}).`,
    };

    const chosenPrompt = theme.toLowerCase().includes('eid')
      ? fallbackPrompts.eid
      : theme.toLowerCase().includes('tech') || theme.toLowerCase().includes('electronic')
      ? fallbackPrompts.electronics
      : theme.toLowerCase().includes('fashion')
      ? fallbackPrompts.fashion
      : fallbackPrompts.default;

    return res.json({
      success: true,
      prompt: chosenPrompt,
      title: `${theme} - ${discount}`,
      subtitle: `Use Coupon Code: ${code} at checkout for instant savings!`,
      buttonText: `Shop with ${code}`,
      tagline: `Exclusive Promo • Code ${code}`,
    });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'R Mart Store Engine', timestamp: new Date().toISOString() });
  });

  // Client IP detection endpoint for security tracking & IP ban verification
  app.get('/api/client-ip', (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || '103.145.22.45';
    res.json({ ip });
  });

  // Mount Vite middleware in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R Mart] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[R Mart] Failed to start server:', err);
  process.exit(1);
});
