import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import productsData from "../../api/products.json";
import { AppContext } from "../context/AppContext";

export const OrderSummary = () => {
  const navigate = useNavigate();
  const {
    cart,
    addresses,
    selectedAddressId,
    updateCartQty,
    removeFromCart,
    addToCart
  } = useContext(AppContext);

  const [priceDetailsExpanded, setPriceDetailsExpanded] = useState(true);
  const carouselRef = useRef(null);

  const productList = Object.entries(cart.products).map(([id, p]) => ({
    id,
    ...p
  }));

  const activeAddress = addresses.list && selectedAddressId
    ? addresses.list[selectedAddressId]
    : null;

  // Redirect to Home if cart is empty
  useEffect(() => {
    if (productList.length === 0) {
      navigate("/");
    }
  }, [productList, navigate]);

  // Recommended products list matching original page IDs
  const recommendedIds = ["362", "438", "144", "50", "28", "145", "251", "75", "43", "425", "446", "440"];
  const recommendedProducts = productsData.filter((p) =>
    recommendedIds.includes(String(p.id))
  );

  // Totals calculations
  let totalMrp = 0;
  productList.forEach((p) => {
    const qty = Number(p.quantity || 1);
    const mrp = Number(p.mrp || p.price);
    totalMrp += mrp * qty;
  });

  const totalDiscount = totalMrp - cart.totalPrice;
  const finalPayable = cart.totalPrice;

  // Save details to localStorage to share with Payments page
  useEffect(() => {
    localStorage.setItem("orderSummaryFinalTotal", String(finalPayable));
    localStorage.setItem("orderSummaryTotalMrp", String(totalMrp));
  }, [finalPayable, totalMrp]);

  // Smooth Auto Scrolling recommendation carousel using requestAnimationFrame
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || carousel.children.length === 0) return;

    let animationFrameId = null;
    const scrollSpeed = 0.6;

    const scrollStep = () => {
      if (!carousel) return;
      carousel.scrollLeft += scrollSpeed;
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft -= carousel.scrollWidth / 2;
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    const startScrolling = () => {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(scrollStep);
      }
    };

    const stopScrolling = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    carousel.addEventListener("mouseenter", stopScrolling);
    carousel.addEventListener("mouseleave", startScrolling);
    carousel.addEventListener("touchstart", stopScrolling);
    carousel.addEventListener("touchend", startScrolling);

    startScrolling();

    return () => {
      stopScrolling();
      if (carousel) {
        carousel.removeEventListener("mouseenter", stopScrolling);
        carousel.removeEventListener("mouseleave", startScrolling);
        carousel.removeEventListener("touchstart", stopScrolling);
        carousel.removeEventListener("touchend", startScrolling);
      }
    };
  }, [recommendedProducts]);

  return (
    <main className="bg-gray-100 pb-24 min-h-screen">
      {/* Step Indicator */}
      <section className="bg-white">
        <div className="flex items-center text-sm">
          <img
            className="w-full mt-2 object-contain"
            src="/images/address-1.png"
            alt="Step - 2"
          />
        </div>
      </section>

      {/* Address Card */}
      <section className="py-2 bg-gray-100">
        <div className="px-4 py-3 bg-white shadow-sm">
          <div className="flex items-start justify-between py-1">
            <div className="flex-1 address-block">
              <p className="text-gray-500 text-xs font-semibold">Deliver to:</p>
              {activeAddress ? (
                <div className="mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[14px] font-bold text-gray-900">{activeAddress.name}</span>
                    {activeAddress.type && (
                      <span className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {activeAddress.type}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-800 mt-1 leading-relaxed">
                    {activeAddress.house}, {activeAddress.road}, {activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-semibold">{activeAddress.number}</div>
                </div>
              ) : (
                <div className="mt-1">
                  <span className="text-[14px] font-bold text-gray-900">No address selected</span>
                  <div className="text-xs text-gray-400 mt-1">Please choose or add an address.</div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/checkout/change-address")}
              className="text-flip-blue border border-gray-200 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-50 bg-white ml-4"
            >
              Change
            </button>
          </div>
        </div>
      </section>

      {/* Product Summary */}
      <section className="py-2 bg-gray-100">
        <div className="bg-white" id="summaryItems">
          {productList.map((p) => (
            <div key={p.id} className="flex items-start gap-3 px-4 py-4 border-b border-gray-100">
              <img
                src={p.thumbnail}
                className="w-20 h-20 object-contain border border-gray-200 rounded-md"
                alt={p.name}
              />
              <div className="flex-1">
                <p
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 cursor-pointer hover:text-flip-blue m-0"
                  style={{ minHeight: "36px" }}
                >
                  {p.name}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">â‚¹{Math.round(p.price).toLocaleString("en-IN")}</span>
                    <span className="text-gray-400 line-through text-xs font-semibold">â‚¹{Math.round(p.mrp).toLocaleString("en-IN")}</span>
                    <span className="text-green-600 font-bold text-xs">{p.discount} off</span>
                  </div>

                  <div className="flex items-center gap-4 mt-1">
                    <div className="relative w-[76px]">
                      <select
                        value={p.quantity}
                        onChange={(e) => updateCartQty(p.id, e.target.value)}
                        className="qtySelect w-full text-[13px] border border-[#d3d3d3] rounded-[4px] py-0.5 appearance-none bg-white outline-none pl-[34px] pr-[16px] text-[#212121] font-semibold"
                        style={{ height: "26px" }}
                      >
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[12px] text-[#878787]">
                        Qty:
                      </span>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#878787] text-[8px]">
                        â–¼
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(p.id)}
                      className="text-red-500 text-xs font-bold uppercase hover:underline border-none bg-transparent cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for You */}
      {recommendedProducts.length > 0 && (
        <section className="compact-showcase-section mt-2">
          <div className="compact-section-header">
            <p className="font-bold text-sm m-0">Recommended for You</p>
            <p className="text-gray-400 text-[11px]">Best Deals</p>
          </div>
          <div className="compact-carousel-container mt-2">
            <div ref={carouselRef} className="compact-carousel">
              {/* Render twice for infinite marquee scrolling */}
              {[...recommendedProducts, ...recommendedProducts].map((p, idx) => (
                <div key={idx} className="compact-product-card">
                  <div className="cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                    <div className="compact-image-wrapper">
                      <img
                        src={p.img1 || "https://magndsakurti.info/assets/images/no-img.png"}
                        alt={p.name}
                        className="product-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="compact-info-wrapper">
                      <p className="product-name text-[11px] font-medium leading-tight line-clamp-2 h-8">
                        {p.name}
                      </p>
                      <div className="price-line flex items-baseline gap-1 mt-1">
                        <span className="font-bold text-black text-xs">â‚¹{Math.round(p.selling_price)}</span>
                        <del className="text-[10px] text-gray-400">â‚¹{Math.round(p.mrp)}</del>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="compact-add-to-cart-btn border-none cursor-pointer w-full text-center block text-xs"
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Price Details */}
      <section className="bg-gray-100 py-1">
        <div className="mt-4 border border-gray-200 rounded-xl bg-white mx-4 p-3 shadow-sm">
          {/* Header */}
          <div
            className="flex justify-between items-center mb-1 cursor-pointer"
            onClick={() => setPriceDetailsExpanded(!priceDetailsExpanded)}
          >
            <p className="font-semibold text-sm text-gray-900 m-0">Price Details</p>
            <span
              className={`material-icons text-gray-400 text-lg transition-transform duration-300 ${
                priceDetailsExpanded ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </div>

          {/* Collapsible content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              priceDetailsExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <hr className="w-full border-t border-gray-200 border-dotted my-2" />

            <div className="flex justify-between text-xs text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                Price ({cart.totalCount} item{cart.totalCount === 1 ? "" : "s"})
              </span>
              <span>â‚¹{totalMrp.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs text-green-600 font-semibold mb-2">
              <span>Discount</span>
              <span>- â‚¹{totalDiscount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-700 mb-2">
              <span>Platform Fee</span>
              <span>â‚¹0</span>
            </div>
          </div>

          {/* Always visible */}
          <div className="flex justify-between font-bold text-sm text-gray-900 mt-2 border-t border-gray-200 pt-2">
            <span>Total Amount</span>
            <span>â‚¹{finalPayable.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-green-50 text-green-700 text-[11px] p-2.5 rounded-lg mt-2 font-medium">
            You will save â‚¹{totalDiscount.toLocaleString("en-IN")} on this order
          </div>
        </div>
      </section>

      {/* Terms Disclaimer */}
      <div className="px-4 py-4 text-[11px] text-gray-400 leading-normal mb-8">
        By continuing with the order, you confirm that you are above 18 years of age, and you agree to the Online Bazar's{" "}
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Terms of Use</span> and{" "}
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
      </div>

      {/* Bottom Continue Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-between items-center max-w-[480px] mx-auto z-35 shadow-lg">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 line-through">â‚¹{totalMrp.toLocaleString("en-IN")}</span>
          <span className="text-[17px] font-bold text-[#111112] flex items-center gap-0.5">
            <span>â‚¹{finalPayable.toLocaleString("en-IN")}</span>
            <span className="material-icons text-gray-400 text-xs" style={{ fontSize: "14px" }}>info</span>
          </span>
        </div>
        <button
          onClick={() => navigate(`/checkout/payment`)}
          className="bg-yellow-400 border-none text-[#111112] px-10 py-3 rounded-lg font-bold hover:bg-yellow-500 cursor-pointer text-sm shadow-sm transition"
        >
          Continue
        </button>
      </div>
    </main>
  );
};

