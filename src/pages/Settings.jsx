import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

export const Settings = () => {
  const navigate = useNavigate();
  const [razorpayKeyId, setRazorpayKeyId] = useState(config.razorpayKeyId || "");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(config.razorpayKeySecret || "");
  const [facebookPixelId, setFacebookPixelId] = useState(config.facebookPixelId || "");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(config.googleAnalyticsId || "");
  const [googleAdsId, setGoogleAdsId] = useState(config.googleAdsId || "");
  const [googleTagManagerId, setGoogleTagManagerId] = useState(config.googleTagManagerId || "");
  const [upiId, setUpiId] = useState(config.upiId || "");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Fetch settings on mount
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        setRazorpayKeyId(data.razorpayKeyId || "");
        setRazorpayKeySecret(data.razorpayKeySecret || "");
        setFacebookPixelId(data.facebookPixelId || "");
        setGoogleAnalyticsId(data.googleAnalyticsId || "");
        setGoogleAdsId(data.googleAdsId || "");
        setGoogleTagManagerId(data.googleTagManagerId || "");
        setUpiId(data.upiId || "");
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load system settings. Please try again." });
        setFetching(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpayKeyId,
        razorpayKeySecret,
        facebookPixelId,
        googleAnalyticsId,
        googleAdsId,
        googleTagManagerId,
        upiId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save settings");
        return res.json();
      })
      .then(() => {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to save settings. Please try again." });
        setLoading(false);
      });
  };

  if (fetching) {
    return (
      <main className="max-w-[480px] mx-auto pb-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-flip-blue text-5xl animate-spin">
            sync
          </span>
          <p className="text-gray-500 text-xs mt-2">Loading configurations...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[480px] mx-auto pb-20 bg-gray-50 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100 flex items-center justify-center border-0 bg-transparent cursor-pointer">
          <span className="material-icons text-xl text-gray-800">arrow_back</span>
        </button>
        <span className="text-[16px] font-semibold text-gray-900">System Configurations</span>
      </div>

      <div className="p-4">
        {/* Status Messages */}
        {message.text && (
          <div className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span className="material-icons text-base">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Razorpay Section */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="material-icons text-base text-flip-blue">payments</span>
              Razorpay Payments Gateway
            </h2>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rzp_live_XXXXXX"
                  className="w-full h-11 border border-gray-300 rounded-[4px] px-3 text-xs outline-none focus:border-flip-blue transition bg-white"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  required
                  placeholder="e.g. 54feYtdXQGR..."
                  className="w-full h-11 border border-gray-300 rounded-[4px] px-3 text-xs outline-none focus:border-flip-blue transition bg-white"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Marketing & Tracking Section */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="material-icons text-base text-green-600">analytics</span>
              Analytics & Tracking Pixels
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Google Analytics Code / ID</label>
                <textarea
                  placeholder="Paste your Google Analytics Measurement ID (e.g. G-XXXXX) or full script code block here"
                  className="w-full h-20 border border-gray-300 rounded-[4px] p-3 text-xs outline-none focus:border-flip-blue transition bg-white resize-none"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Google Ads Tag / ID</label>
                <input
                  type="text"
                  placeholder="Paste your Google Ads Tag ID (e.g. AW-17983064076)"
                  className="w-full h-11 border border-gray-300 rounded-[4px] px-3 text-xs outline-none focus:border-flip-blue transition bg-white"
                  value={googleAdsId}
                  onChange={(e) => setGoogleAdsId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Google Tag Manager Container ID</label>
                <input
                  type="text"
                  placeholder="Paste your Google Tag Manager ID (e.g. GTM-XXXXXXX)"
                  className="w-full h-11 border border-gray-300 rounded-[4px] px-3 text-xs outline-none focus:border-flip-blue transition bg-white"
                  value={googleTagManagerId}
                  onChange={(e) => setGoogleTagManagerId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Facebook Pixel Code / ID</label>
                <textarea
                  placeholder="Paste your Facebook Pixel ID (e.g. 123456789) or full script code block here"
                  className="w-full h-20 border border-gray-300 rounded-[4px] p-3 text-xs outline-none focus:border-flip-blue transition bg-white resize-none"
                  value={facebookPixelId}
                  onChange={(e) => setFacebookPixelId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* UPI Direct Payments Section */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="material-icons text-base text-flip-blue">qr_code_scanner</span>
              Direct UPI Payments
            </h2>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Receiver UPI Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chintanchovatiya@ybl"
                  className="w-full h-11 border border-gray-300 rounded-[4px] px-3 text-xs outline-none focus:border-flip-blue transition bg-white"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                  Payments from PhonePe, GPay, and Paytm will be routed directly to this UPI ID.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3 rounded-lg text-sm bg-orange-500 hover:bg-orange-600 transition shadow-sm uppercase tracking-wider cursor-pointer border-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-icons text-base animate-spin">sync</span>
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <span className="material-icons text-base">save</span>
                <span>Save Settings</span>
              </>
            )}
          </button>

        </form>
      </div>
    </main>
  );
};
