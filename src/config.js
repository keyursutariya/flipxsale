/**
 * Global Application Configuration (src/config.js)
 *
 * Central configuration module for payment gateways, UPI, and analytics tracking.
 * - Reads build-time environment variables from Vite (import.meta.env)
 * - Automatically fetches and merges runtime environment variables from /api/settings or /settings.json
 * - Accessible throughout the entire project
 */

// Default configuration with build-time Vite environment variable fallbacks
const initialConfig = {
  // Razorpay Gateway
  razorpayKeyId:
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    import.meta.env.RAZORPAY_KEY_ID ||
    "rzp_live_T5YEpYQVLQJfpN",
  razorpayKeySecret:
    import.meta.env.VITE_RAZORPAY_KEY_SECRET ||
    import.meta.env.RAZORPAY_KEY_SECRET ||
    "54feYtdXQGRcRkCEbEOS07IC",

  // UPI Direct Payments
  upiId:
    import.meta.env.VITE_UPI_ID ||
    import.meta.env.UPI_ID ||
    "paytm.s3vx0km@pty",

  // Meta Pixel / Facebook Ads
  facebookPixelId:
    import.meta.env.VITE_FACEBOOK_PIXEL_ID ||
    import.meta.env.VITE_META_PIXEL_ID ||
    import.meta.env.FACEBOOK_PIXEL_ID ||
    "1817752779373183",

  // Google Ads, Analytics & Tag Manager
  googleAdsId:
    import.meta.env.VITE_GOOGLE_ADS_ID ||
    import.meta.env.GOOGLE_ADS_ID ||
    "AW-17983064076",
  googleAnalyticsId:
    import.meta.env.VITE_GOOGLE_ANALYTICS_ID ||
    import.meta.env.GOOGLE_ANALYTICS_ID ||
    "",
  googleTagManagerId:
    import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID ||
    import.meta.env.GOOGLE_TAG_MANAGER_ID ||
    "",
};

// Singleton config object accessible everywhere
export const config = { ...initialConfig };

// Listeners for dynamic updates
const listeners = new Set();

export const onConfigChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Fetch dynamic runtime configuration from service /api/settings (with fallback to /settings.json)
let fetchPromise = null;

export const loadConfig = async () => {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      let data = null;

      // 1. Try dynamic backend API settings first (reflects service .env in real time)
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        // API offline or static deployment
      }

      // 2. Fallback to static settings.json if API is not accessible
      if (!data) {
        const resStatic = await fetch("/settings.json");
        if (resStatic.ok) {
          data = await resStatic.json();
        }
      }

      if (data) {
        if (data.razorpayKeyId) config.razorpayKeyId = data.razorpayKeyId;
        if (data.razorpayKeySecret) config.razorpayKeySecret = data.razorpayKeySecret;
        if (data.upiId) config.upiId = data.upiId;
        if (data.facebookPixelId) config.facebookPixelId = data.facebookPixelId;
        if (data.googleAdsId) config.googleAdsId = data.googleAdsId;
        if (data.googleAnalyticsId) config.googleAnalyticsId = data.googleAnalyticsId;
        if (data.googleTagManagerId) config.googleTagManagerId = data.googleTagManagerId;

        listeners.forEach((callback) => {
          try {
            callback(config);
          } catch (err) {
            console.error("Config update listener error:", err);
          }
        });
      }
    } catch (err) {
      console.error("[Config] Error fetching remote settings:", err);
    }
    return config;
  })();

  return fetchPromise;
};

// Helper getter
export const getConfig = () => config;

export default config;

