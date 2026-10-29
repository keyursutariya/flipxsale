import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AppProvider, AppContext } from "./context/AppContext";

// Components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";

// Pages
import { Home } from "./pages/Home";
import { CategoryProducts } from "./pages/CategoryProducts";
import { Search } from "./pages/Search";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { SelectAddress } from "./pages/SelectAddress";
import { AddEditAddress } from "./pages/AddEditAddress";
import { OrderSummary } from "./pages/OrderSummary";
import { Payment } from "./pages/Payment";
import { PaymentVerify } from "./pages/PaymentVerify";
import { OrderSuccess } from "./pages/OrderSuccess";
import { InfoPage } from "./pages/InfoPage";
import { Settings } from "./pages/Settings";
import { loadConfig } from "./config";

// App layout wrapper to handle location-based rendering
const AppContent = () => {
  const location = useLocation();
  const { loadingOverlay } = useContext(AppContext);

  // Dynamic script injection for Analytics and Facebook Pixel
  useEffect(() => {
    loadConfig().then((data) => {
        // 1. Google Analytics & Ads Setup
        const gaIdRaw = data.googleAnalyticsId || "";
        const adsIdRaw = data.googleAdsId || "";
        
        const gaId = gaIdRaw ? (gaIdRaw.match(/(G-[A-Z0-9]+|UA-\d+-\d+|AW-\d+)/i) || [gaIdRaw])[0].trim() : "";
        const adsId = adsIdRaw ? (adsIdRaw.match(/(G-[A-Z0-9]+|UA-\d+-\d+|AW-\d+)/i) || [adsIdRaw])[0].trim() : "";
        
        const primaryId = gaId || adsId;

        if (primaryId && !document.getElementById("google-analytics-script")) {
          const script = document.createElement("script");
          script.id = "google-analytics-script";
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
          document.head.appendChild(script);

          const inlineScript = document.createElement("script");
          inlineScript.id = "google-analytics-inline-script";
          let inlineHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `;
          if (gaId) {
            inlineHTML += `\n            gtag('config', '${gaId}');`;
          }
          if (adsId) {
            inlineHTML += `\n            gtag('config', '${adsId}');`;
          }
          if (gaId) {
            localStorage.setItem("googleAnalyticsId", gaId);
          }
          if (adsId) {
            localStorage.setItem("googleAdsId", adsId);
          }
          inlineScript.innerHTML = inlineHTML;
          document.head.appendChild(inlineScript);
          console.log(`[Analytics] Google gtag initialized with Analytics (${gaId || 'none'}) and Ads (${adsId || 'none'}).`);
        }

        // 1b. Google Tag Manager (GTM) Setup
        if (data.googleTagManagerId) {
          const gtmRaw = data.googleTagManagerId;
          const gtmMatch = gtmRaw.match(/(GTM-[A-Z0-9]+)/i);
          const gtmId = gtmMatch ? gtmMatch[0] : gtmRaw.trim();

          if (gtmId && !document.getElementById("google-tag-manager-script")) {
            const inlineScript = document.createElement("script");
            inlineScript.id = "google-tag-manager-script";
            inlineScript.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&dl='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `;
            document.head.appendChild(inlineScript);
            console.log(`[Analytics] Google Tag Manager (${gtmId}) initialized.`);
          }
        }

        // 2. Facebook Pixel Setup
        if (data.facebookPixelId) {
          const fbRaw = String(data.facebookPixelId);
          const fbMatch = fbRaw.match(/(\d{15,18})/);
          const fbId = fbMatch ? fbMatch[0] : fbRaw.trim();

          if (fbId && window._currentFbPixelId !== fbId) {
            window._currentFbPixelId = fbId;

            if (!window.fbq) {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
            }

            window.fbq('init', fbId);
            window.fbq('track', 'PageView');
            console.log(`[Analytics] Facebook Pixel (${fbId}) initialized from settings.`);
          }
        }
      })
      .catch((err) => console.error("Error loading analytics:", err));
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    if (window.gtag) {
      const gaId = localStorage.getItem("googleAnalyticsId");
      const adsId = localStorage.getItem("googleAdsId");

      if (gaId) {
        window.gtag("event", "page_view", {
          send_to: gaId,
          page_path: location.pathname + location.search,
        });
      }
      if (adsId) {
        window.gtag("event", "page_view", {
          send_to: adsId,
          page_path: location.pathname + location.search,
        });
      }

      if (!gaId && !adsId) {
        window.gtag("event", "page_view", {
          page_path: location.pathname + location.search,
        });
      }
    }
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location]);

  // Hide footer on checkout flow pages to prevent overlap with sticky bottom CTA bars
  const hideFooterPaths = [
    "/cart",
    "/checkout/address",
    "/checkout/change-address",
    "/checkout/summary",
    "/checkout/payment",
    "/checkout/success",
    "/success"
  ];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between max-w-[480px] mx-auto shadow-xl relative">
      {/* Universal Loading Overlay */}
      {loadingOverlay && (
        <div
          id="loading-spinner"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 max-w-[480px] mx-auto"
        >
          <span className="material-icons text-flip-blue text-5xl animate-spin">
            sync
          </span>
        </div>
      )}

      <div>
        {/* Global Header */}
        <Header />

        {/* Global Sidebar (drawer) */}
        <Sidebar />

        {/* Dynamic Route Pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryProducts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/change-address" element={<SelectAddress />} />
          <Route path="/checkout/address" element={<AddEditAddress />} />
          <Route path="/checkout/summary" element={<OrderSummary />} />
          <Route path="/checkout/payment" element={<Payment />} />
          <Route path="/checkout/verify" element={<PaymentVerify />} />
          <Route path="/checkout/success" element={<Navigate to="/success" replace />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/info/:slug" element={<InfoPage />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Routes>
      </div>

      {/* Global Footer */}
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
