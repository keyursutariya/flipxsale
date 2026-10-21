import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const settingsPath = path.join(__dirname, 'settings.json');
const productsPath = path.join(__dirname, 'api', 'products.json');

// Helper to get settings
function getSettings() {
  if (fs.existsSync(settingsPath)) {
    try {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading settings.json", e);
    }
  }
  return {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_live_T5YEpYQVLQJfpN",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "54feYtdXQGRcRkCEbEOS07IC",
    facebookPixelId: "",
    googleAnalyticsId: "",
    googleAdsId: "",
    googleTagManagerId: "",
    upiId: process.env.UPI_ID || "paytm.s3vx0km@pty"
  };
}

// Helper to get ALLOW_TEST_AMOUNT
function getAllowTestAmount() {
  try {
    const dotenvPath = path.join(__dirname, '.env');
    if (fs.existsSync(dotenvPath)) {
      const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
      const match = dotenvContent.match(/ALLOW_TEST_AMOUNT\s*=\s*(\w+)/);
      if (match) {
        return match[1].trim() === 'true';
      }
    }
  } catch (e) {
    console.error("Error reading .env in getAllowTestAmount", e);
  }
  return process.env.ALLOW_TEST_AMOUNT === 'true';
}

// 1. GET /api/settings
app.get('/api/settings', (req, res) => {
  const config = getSettings();
  res.json({
    razorpayKeyId: config.razorpayKeyId,
    facebookPixelId: config.facebookPixelId || "",
    googleAnalyticsId: config.googleAnalyticsId || "",
    googleAdsId: config.googleAdsId || "",
    googleTagManagerId: config.googleTagManagerId || "",
    upiId: config.upiId || "paytm.s3vx0km@pty"
  });
});

// 1b. GET /api/admin/settings (Expose full settings including secrets to Admin UI)
app.get('/api/admin/settings', (req, res) => {
  const config = getSettings();
  res.json({
    razorpayKeyId: config.razorpayKeyId,
    razorpayKeySecret: config.razorpayKeySecret,
    facebookPixelId: config.facebookPixelId || "",
    googleAnalyticsId: config.googleAnalyticsId || "",
    googleAdsId: config.googleAdsId || "",
    googleTagManagerId: config.googleTagManagerId || "",
    upiId: config.upiId || "paytm.s3vx0km@pty"
  });
});

// 2. POST /api/admin/settings
app.post('/api/admin/settings', (req, res) => {
  const { razorpayKeyId, razorpayKeySecret, facebookPixelId, googleAnalyticsId, googleAdsId, googleTagManagerId, upiId } = req.body;
  const newConfig = {
    razorpayKeyId: (razorpayKeyId || "").trim(),
    razorpayKeySecret: (razorpayKeySecret || "").trim(),
    facebookPixelId: (facebookPixelId || "").trim(),
    googleAnalyticsId: (googleAnalyticsId || "").trim(),
    googleAdsId: (googleAdsId || "").trim(),
    googleTagManagerId: (googleTagManagerId || "").trim(),
    upiId: (upiId || "paytm.s3vx0km@pty").trim()
  };
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, message: "Settings saved successfully", settings: newConfig });
  } catch (err) {
    res.status(500).json({ error: "Failed to write settings file" });
  }
});

// 2b. POST /api/payment/process (Save payment transaction log)
app.post('/api/payment/process', (req, res) => {
  const { orderNumber, payType, upiAddress, amount } = req.body;
  const paymentsPath = path.join(__dirname, 'payments.json');
  
  let payments = [];
  if (fs.existsSync(paymentsPath)) {
    try {
      const data = fs.readFileSync(paymentsPath, 'utf8');
      payments = JSON.parse(data);
    } catch (e) {
      console.error("Error reading payments.json", e);
    }
  }

  const newPayment = {
    orderNumber,
    payType,
    upiAddress,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  payments.push(newPayment);

  try {
    fs.writeFileSync(paymentsPath, JSON.stringify(payments, null, 2));
    res.json({ success: true, message: "Payment logged successfully", payment: newPayment });
  } catch (err) {
    console.error("Failed to write payments.json", err);
    res.status(500).json({ error: "Failed to log payment transaction" });
  }
});


// 3. GET /api/payment/config
app.get('/api/payment/config', (req, res) => {
  res.json({
    allowTestAmount: getAllowTestAmount()
  });
});

// 4. POST /api/payment/order (creates Razorpay Payment Link)
app.post('/api/payment/order', async (req, res) => {
  try {
    const { cartProducts, amount, origin } = req.body;
    if (!cartProducts || Object.keys(cartProducts).length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Use amount sent from React frontend directly (matches working direct payment flow)
    const calculatedTotal = amount !== undefined ? parseFloat(amount) : 0;

    const amountInPaise = Math.round(calculatedTotal * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({ error: "Invalid order amount" });
    }

    const config = getSettings();
    const keyId = config.razorpayKeyId;
    const keySecret = config.razorpayKeySecret;

    // Use Razorpay REST API or SDK to create payment links
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const receiptId = 'rcpt_' + Date.now();
    
    // Construct local callback URL pointing directly to the React verify route, preserving client host (e.g., mobile IP)
    let clientOrigin = origin;
    if (!clientOrigin) {
      const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      const protocol = proto.includes('://') ? proto : proto + '://';
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5000';
      let clientHost = host;
      if (clientHost.includes('5000')) {
        clientHost = clientHost.replace('5000', '5173');
      } else if (clientHost.includes('5001')) {
        clientHost = clientHost.replace('5001', '5173');
      }
      clientOrigin = `${protocol}${clientHost}`;
    }
    const callbackUrl = `${clientOrigin}/checkout/verify?receipt=${receiptId}`;

    const paymentLink = await rzp.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: "Order Payment " + receiptId,
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      callback_url: callbackUrl,
      callback_method: "get"
    });

    res.json({
      success: true,
      paymentLink: paymentLink.short_url
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(505).json({
      error: "Razorpay payment link creation failed",
      details: error.message || error
    });
  }
});

// 5. GET /api/razorpay_verify.php and /razorpay_verify.php (handles redirect check)
app.get(['/api/razorpay_verify.php', '/razorpay_verify.php'], (req, res) => {
  const paymentId = req.query.razorpay_payment_id || '';
  const paymentLinkStatus = req.query.razorpay_payment_link_status || '';

  const host = req.get('host') || 'localhost:5000';
  // Redirect back to Vite dev server port 5173
  let redirectBase = `http://${host}`;
  if (host.includes('5000')) {
    redirectBase = `http://${host.replace('5000', '5173')}`;
  } else if (host.includes('5001')) {
    redirectBase = `http://${host.replace('5001', '5173')}`;
  }

  if (!paymentId || paymentLinkStatus !== 'paid') {
    return res.redirect(`${redirectBase}/checkout/payment?status=failed`);
  }

  res.redirect(`${redirectBase}/success`);
});

// 6. POST /api/payment/verify (legacy, kept for safety)
app.post('/api/payment/verify', (req, res) => {
  res.json({ success: true, message: "Legacy verify placeholder" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
