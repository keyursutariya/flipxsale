import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import productsData from "../../api/products.json";
import { AppContext } from "../context/AppContext";

export const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);

  // --- Hero Banner Slider State ---
  const banners = [
    "/images/banner1.webp",
    "/images/banner2.webp",
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const autoplayRef = useRef(null);

  // Swipe support refs
  const startXRef = useRef(0);

  // Autoplay slider logic
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [banners.length]);

  const handleDotClick = (index) => {
    setSlideIndex(index);
    // Reset autoplay
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startXRef.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Next slide
        setSlideIndex((prev) => (prev + 1) % banners.length);
      } else {
        // Prev slide
        setSlideIndex((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
  };

  // --- Deals of the Day Timer State ---
  const [timeLeft, setTimeLeft] = useState(5 * 60 + 38); // 5 min 38 sec
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 5 * 60 + 38; // reset
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m < 10 ? "0" + m : m;
    const ss = s < 10 ? "0" + s : s;
    return `${mm}:${ss}`;
  };

  // --- Categories List ---
  const categories = [
    { name: "Mobile", label: "Mobiles", img: "/images/category/mobile.webp" },
    { name: "Electronics", label: "Electronics", img: "/images/category/ele.webp" },
    { name: "Appliances", label: "Appliances", img: "/images/category/kit.webp" },
    { name: "Furniture", label: "Furniture", img: "/images/category/fur.webp" },
    { name: "kurtis", label: "Sarees", img: "/images/category/kur.webp" },
    { name: "Western Wear", label: "Western Wear", img: "/images/category/west.webp" },
    { name: "crocs", label: "Sandals", img: "/images/category/cro.webp" },
    { name: "Shoes", label: "Sport Shoes", img: "/images/category/shoes.webp" },
    { name: "Grocery", label: "Grocery", img: "/images/category/gro.webp" },
    { name: "dryfruit", label: "Dryfruit", img: "/images/category/dryfruit.webp" },
  ];

  // --- Products Pagination / Infinite Scroll State ---
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load next chunk of products
  const loadMoreProducts = () => {
    if (loadingProducts || !hasMore) return;
    setLoadingProducts(true);

    setTimeout(() => {
      setVisibleCount((prev) => {
        const nextCount = prev + 10;
        if (nextCount >= productsData.length) {
          setHasMore(false);
          return productsData.length;
        }
        return nextCount;
      });
      setLoadingProducts(false);
    }, 600);
  };

  // Attach window scroll listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (isAtBottom && !loadingProducts && hasMore) {
        loadMoreProducts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingProducts, hasMore]);

  const displayedProducts = productsData.slice(0, visibleCount);

  return (
    <main className="max-w-[480px] mx-auto pb-6 bg-white">
      {/* Hero Banner Slider */}
      <section className="p-2">
        <div
          className="relative overflow-hidden rounded-2xl h-[160px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((url, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                idx === slideIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={url}
                alt={`Banner ${idx + 1}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center items-center mt-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === slideIndex ? "bg-gray-700 w-8" : "bg-gray-300 w-2.5"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-container my-2">
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.name} className="category-item">
              <a
                href={`/category/${encodeURIComponent(cat.name)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/category/${encodeURIComponent(cat.name)}`);
                }}
              >
                <img src={cat.img} alt={cat.label} />
                <p className="category-label">{cat.label}</p>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Deals of the Day Banner */}
      <div className="deal-banner">
        <div className="deal-left">
          <div className="deal-title">Deals of the Day</div>
          <div className="deal-timer">
            <span className="material-icons">schedule</span>
            <span id="timer">{formatTimer(timeLeft)}</span>
          </div>
        </div>
        <div className="sale-badge">SALE IS LIVE</div>
      </div>

      {/* Dynamic Products Grid */}
      <section id="products-section" className="mb-6 px-1">
        <div id="products-grid" className="grid grid-cols-2 gap-1.5">
          {displayedProducts.map((p) => {
            const sellingPrice = Math.round(Number(p.selling_price) || 0);
            const mrp = Math.round(Number(p.mrp) || sellingPrice);
            const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
            const wowPrice = Math.round(sellingPrice - sellingPrice * 0.05);

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="product-card rounded-lg overflow-hidden border border-gray-100 bg-white cursor-pointer p-2 flex flex-col justify-between"
                style={{ minHeight: "330px" }}
              >
                <div>
                  <div className="relative bg-white flex items-center justify-center h-44 mb-2">
                    <img
                      src={p.img1 || "https://magndsakurti.info/assets/images/no-img.png"}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-xs text-gray-700 leading-snug font-medium product-name line-clamp-2" style={{ height: "36px" }}>
                    {p.name}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[15px] text-black font-semibold">₹{sellingPrice}</span>
                    <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
                    <span className="text-green-600 text-xs font-semibold">{discountPercent}% off</span>
                  </div>

                  <div className="flex items-center gap-1 mb-1">
                    <span style={{ display: "inline-flex", alignItems: "center", background: "linear-gradient(135deg,#2874f0,#0057d8)", color: "#fff", fontWeight: 800, fontSize: "9px", padding: "1px 5px", borderRadius: "3px", letterSpacing: "0.5px" }}>WOW!</span>
                    <span className="wow-price" style={{ fontSize: "12px", marginLeft: "2px" }}>₹{wowPrice}</span>
                    <span className="offer-text" style={{ fontSize: "10px", marginLeft: "2px" }}>with 2 offers</span>
                  </div>

                  <div className="rating-line mt-1.5 justify-between">
                    <div className="rating-stars flex gap-[2px]">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                    </div>
                    
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Infinite Scroll Loader */}
      {loadingProducts && (
        <div id="product-loader" className="text-center py-4">
          <div className="inline-flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <i className="fa-duotone fa-solid fa-spinner-third fa-spin text-flip-blue text-lg"></i>
              <span className="text-gray-600 text-sm">Hang on, loading content...</span>
            </div>
            <div className="flex space-x-1 justify-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && (
        <p className="text-center text-gray-400 text-xs py-4">All products loaded.</p>
      )}
    </main>
  );
};

