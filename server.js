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
const envPath = path.join(__dirname, '.env');

// Helper to read .env file dynamically on each request so service changes take effect immediately
function parseEnvFile() {
  const envVars = {};
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          envVars[key] = val;
        }
      }
    } catch (e) {
      console.error("Error reading .env dynamically", e);
    }
  }
  return envVars;
}

// Helper to get settings (environment variables take highest priority)
function getSettings() {
  const fileEnv = parseEnvFile();

  let fileConfig = {};
  if (fs.existsSync(settingsPath)) {
    try {
      const data = fs.readFileSync(settingsPath, 'utf8');
      fileConfig = JSON.parse(data);
    } catch (e) {
      console.error("Error reading settings.json", e);
    }
  }

  const razorpayKeyId = fileEnv.RAZORPAY_KEY_ID ||
                        fileEnv.VITE_RAZORPAY_KEY_ID ||
                        process.env.RAZORPAY_KEY_ID ||
                        process.env.VITE_RAZORPAY_KEY_ID ||
                        fileConfig.razorpayKeyId ||
                        "rzp_live_T5YEpYQVLQJfpN";

  const razorpayKeySecret = fileEnv.RAZORPAY_KEY_SECRET ||
                            fileEnv.VITE_RAZORPAY_KEY_SECRET ||
                            process.env.RAZORPAY_KEY_SECRET ||
                            process.env.VITE_RAZORPAY_KEY_SECRET ||
                            fileConfig.razorpayKeySecret ||
                            "54feYtdXQGRcRkCEbEOS07IC";

  const upiId = fileEnv.UPI_ID ||
                fileEnv.VITE_UPI_ID ||
                process.env.UPI_ID ||
                process.env.VITE_UPI_ID ||
                fileConfig.upiId ||
                "paytm.s3vx0km@pty";

  const fbPixel = fileEnv.FACEBOOK_PIXEL_ID ||
                  fileEnv.META_PIXEL_ID ||
                  fileEnv.VITE_FACEBOOK_PIXEL_ID ||
                  fileEnv.VITE_META_PIXEL_ID ||
                  process.env.FACEBOOK_PIXEL_ID ||
                  process.env.META_PIXEL_ID ||
                  process.env.VITE_FACEBOOK_PIXEL_ID ||
                  process.env.VITE_META_PIXEL_ID ||
                  fileConfig.facebookPixelId ||
                  "1817752779373183";

  return {
    razorpayKeyId,
    razorpayKeySecret,
    facebookPixelId: fbPixel,
    googleAnalyticsId: fileEnv.GOOGLE_ANALYTICS_ID || fileEnv.VITE_GOOGLE_ANALYTICS_ID || process.env.GOOGLE_ANALYTICS_ID || process.env.VITE_GOOGLE_ANALYTICS_ID || fileConfig.googleAnalyticsId || "",
    googleAdsId: fileEnv.GOOGLE_ADS_ID || fileEnv.VITE_GOOGLE_ADS_ID || process.env.GOOGLE_ADS_ID || process.env.VITE_GOOGLE_ADS_ID || fileConfig.googleAdsId || "",
    googleTagManagerId: fileEnv.GOOGLE_TAG_MANAGER_ID || fileEnv.VITE_GOOGLE_TAG_MANAGER_ID || process.env.GOOGLE_TAG_MANAGER_ID || process.env.VITE_GOOGLE_TAG_MANAGER_ID || fileConfig.googleTagManagerId || "",
    upiId: upiId || "paytm.s3wd4g4@pty"
  };
}

// Helper to get ALLOW_TEST_AMOUNT
function getAllowTestAmount() {
  const fileEnv = parseEnvFile();
  if (fileEnv.ALLOW_TEST_AMOUNT !== undefined) {
    return fileEnv.ALLOW_TEST_AMOUNT === 'true';
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
    upiId: config.upiId || "paytm.s3wd4g4@pty"
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
    upiId: config.upiId || "paytm.s3wd4g4@pty"
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
    upiId: (upiId || "paytm.s3wd4g4@pty").trim()
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
