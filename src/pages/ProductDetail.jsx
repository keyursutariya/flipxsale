import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../../api/products.json";
import { AppContext } from "../context/AppContext";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addresses, selectedAddressId } = useContext(AppContext);

  // Helper for dynamic delivery date calculation
  const getDeliveryDateString = (daysAhead = 3) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // --- Fetch Product ---
  const product = productsData.find((p) => String(p.id) === String(id));

  // --- Suggested & Other Products ---
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);

  // Auto-scroll recommendations refs
  const suggestedScrollRef = useRef(null);
  const otherScrollRef = useRef(null);

  // --- Dynamic Random Stats State ---
  const [randomRating, setRandomRating] = useState("4.4");
  const [randomRatingsCount, setRandomRatingsCount] =
    useState("23,411 Ratings");
  const [randomUrgencyCount, setRandomUrgencyCount] = useState(
    "1839 people ordered this in the last 30 minutes",
  );
  const [randomStockCount, setRandomStockCount] = useState(6);

  // Breakdown percentages
  const [r5Percent, setR5Percent] = useState(65);
  const [r4Percent, setR4Percent] = useState(19);
  const [r3Percent, setR3Percent] = useState(9);
  const [r2Percent, setR2Percent] = useState(5);
  const [r1Percent, setR1Percent] = useState(2);

  // Breakdown counts
  const [r5Count, setR5Count] = useState("15,217");
  const [r4Count, setR4Count] = useState("4,448");
  const [r3Count, setR3Count] = useState("2,106");
  const [r2Count, setR2Count] = useState("1,170");
  const [r1Count, setR1Count] = useState("468");

  // --- Sizes State ---
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  // Initialize and randomize stats on product id change
  useEffect(() => {
    if (product) {
      // Reset slide index and scroll window to top
      setSlideIndex(0);
      window.scrollTo(0, 0);

      // 1. Random stats
      const ratingVal = (4.1 + Math.random() * 0.8).toFixed(1);
      const ratingsVal = Math.floor(10000 + Math.random() * 89000);
      const urgencyVal = Math.floor(1000 + Math.random() * 3000);
      const stockVal = Math.floor(2 + Math.random() * 9);

      setRandomRating(ratingVal);
      setRandomRatingsCount(`${ratingsVal.toLocaleString("en-IN")} Ratings`);
      setRandomUrgencyCount(
        `${urgencyVal} people ordered this in the last 30 minutes`,
      );
      setRandomStockCount(stockVal);

      // Randomize breakdown distribution slightly
      const p5 = Math.floor(60 + Math.random() * 10);
      const p4 = Math.floor(15 + Math.random() * 10);
      const p3 = Math.floor(5 + Math.random() * 8);
      const p2 = Math.floor(2 + Math.random() * 5);
      const p1 = Math.max(1, 100 - (p5 + p4 + p3 + p2));

      setR5Percent(p5);
      setR4Percent(p4);
      setR3Percent(p3);
      setR2Percent(p2);
      setR1Percent(p1);

      setR5Count(Math.floor(ratingsVal * (p5 / 100)).toLocaleString("en-IN"));
      setR4Count(Math.floor(ratingsVal * (p4 / 100)).toLocaleString("en-IN"));
      setR3Count(Math.floor(ratingsVal * (p3 / 100)).toLocaleString("en-IN"));
      setR2Count(Math.floor(ratingsVal * (p2 / 100)).toLocaleString("en-IN"));
      setR1Count(Math.floor(ratingsVal * (p1 / 100)).toLocaleString("en-IN"));

      // 2. Load sizes
      const category = (product.category || "").toLowerCase();

      if (category === "shoes" || category === "crocs") {
        const sizeList = ["7", "8", "9", "10", "11"];
        setSizes(sizeList);
        setSelectedSize(sizeList[0]);
      } else if (category === "kurtis" || category === "kurti" || category === "western wear") {
        const sizeList = ["M", "L", "XL", "XXL"];
        setSizes(sizeList);
        setSelectedSize(sizeList[0]);
      } else if (product.size) {
        const sizeList = product.size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSizes(sizeList);
        setSelectedSize(sizeList[0] || "");
      } else {
        setSizes([]);
        setSelectedSize("");
      }

      // 3. Recommended products
      const sameCategory = productsData.filter(
        (p) =>
          p.category === product.category &&
          String(p.id) !== String(product.id),
      );
      const fallbacks = productsData.filter(
        (p) => String(p.id) !== String(product.id),
      );

      const suggestedSlice =
        sameCategory.length >= 8
          ? sameCategory.slice(0, 12)
          : fallbacks.slice(0, 12);
      const otherSlice = fallbacks.slice(12, 24);

      setSuggestedProducts(suggestedSlice);
      setOtherProducts(otherSlice);
    }
  }, [product, id]);

  // Dynamic Document Title
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - - Online Bazar`;
    }
    return () => {
      document.title =
        "Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More. Best Offers!";
    };
  }, [product]);

  // Smooth Auto Scrolling recommendation carousels using requestAnimationFrame
  useEffect(() => {
    const initScroll = (carousel) => {
      if (!carousel || carousel.children.length === 0) return null;

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
    };

    const cleanupSuggested = initScroll(suggestedScrollRef.current);
    const cleanupOther = initScroll(otherScrollRef.current);

    return () => {
      if (cleanupSuggested) cleanupSuggested();
      if (cleanupOther) cleanupOther();
    };
  }, [suggestedProducts, otherProducts]);

  // --- Carousel Swipe State ---
  const [slideIndex, setSlideIndex] = useState(0);
  const swipeStartX = useRef(0);

  if (!product) {
    return (
      <main className="max-w-[480px] mx-auto pb-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Product not found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-flip-blue text-white px-6 py-2 rounded text-xs font-semibold"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  // Get active images
  const images = [
    product.img1,
    product.img2,
    product.img3,
    product.img4,
    product.img5,
  ].filter(Boolean);

  if (images.length === 0) {
    images.push("https://magndsakurti.info/assets/images/no-img.png");
  }

  // Calculations
  const sellingPrice = Math.round(Number(product.selling_price) || 0);
  const mrp = Math.round(Number(product.mrp) || sellingPrice);
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Add to cart package with exact rating and review count from page
  const getProductPayload = () => {
    return {
      ...product,
      rating: randomRating,
      total_reviews: randomRatingsCount.split(" ")[0],
    };
  };

  const handleBuyNow = () => {
    addToCart(getProductPayload()).then(() => {
      const hasAddresses =
        addresses && addresses.list && Object.keys(addresses.list).length > 0;
      if (hasAddresses) {
        navigate("/checkout/summary");
      } else {
        navigate("/checkout/address");
      }
    });
  };

  const handleTouchStart = (e) => {
    swipeStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = swipeStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSlideIndex((prev) => (prev + 1) % images.length);
      } else {
        setSlideIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  return (
    <main
      className="bg-white overflow-x-hidden pb-20"
      style={{ backgroundColor: "#fff" }}
    >
      {/* Product Image Carousel */}
      <div className="w-full bg-white relative">
        <div className="w-full bg-white relative h-96 md:h-[400px] overflow-hidden mt-1">
          <div
            className="product-carousel-images flex w-full h-full"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((img, idx) => (
              <div key={idx} className="product-carousel-item w-full h-full flex-shrink-0 bg-white">
                <img src={img} className="w-full h-full object-contain block" alt={`Product ${idx}`} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows (Subtle chevron controls for desktop/mouse users) */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSlideIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center z-10 hover:bg-white cursor-pointer transition-colors border-0"
                aria-label="Previous image"
              >
                <span className="material-icons text-gray-700 text-lg">chevron_left</span>
              </button>
              <button
                onClick={() => setSlideIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center z-10 hover:bg-white cursor-pointer transition-colors border-0"
                aria-label="Next image"
              >
                <span className="material-icons text-gray-700 text-lg">chevron_right</span>
              </button>
            </>
          )}

          {/* Navigation Indicators */}
          {images.length > 1 && (
            <div className="product-carousel-indicators">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`product-carousel-indicator cursor-pointer ${idx === slideIndex ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <section className="section tight mt-1 bg-white px-4 py-2">
        <div className="urgency-banner">{randomUrgencyCount}</div>
        <div className="stock-alert">
          Only <span className="text-danger">{randomStockCount}</span> Left in
          Stock
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[14px] text-gray-900 font-semibold">
            {product.name}
          </span>
        </div>

        <div className="d-flex align-items-center mt-2">
          <span className="rating-box">
            {randomRating}{" "}
            <i className="material-icons" style={{ fontSize: "12px" }}>
              star
            </i>
          </span>
          <span className="ratings-count">{randomRatingsCount}</span>
        </div>

        

        <div className="price-container mt-3 d-flex align-items-center">
          <span className="final-price">₹{sellingPrice}</span>
          <del className="mrp">₹{mrp}</del>
          <span className="discount">{discountPercent}% Off</span>
        </div>
      </section>

      {/* Dynamic Size Selector */}
      {sizes.length > 0 && (
        <div className="size-selector-container mb-3 px-4">
          <h6 className="fw-bold mb-2">Select Size:</h6>
          <div className="d-flex flex-wrap gap-2">
            {sizes.map((sz) => (
              <div key={sz}>
                <input
                  type="radio"
                  className="btn-check"
                  name="selected_size"
                  id={`size-${sz}`}
                  value={sz}
                  checked={selectedSize === sz}
                  onChange={() => setSelectedSize(sz)}
                />
                <label
                  className="btn btn-outline-secondary"
                  htmlFor={`size-${sz}`}
                >
                  {sz}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Offers */}
      <div className="offers-container">
        <h6 className="fw-bold mb-3">Available offers</h6>
        <div className="offer-item">
          <i className="material-icons offer-icon">sell</i>
          <div className="offer-text">
            <span className="offer-title">Bank Offer</span>
            Get ₹25 instant discount on first UPI txns on order of ₹250 and
            above{" "}
            <a href="#" className="offer-link">
              T&amp;C
            </a>
          </div>
        </div>
        <div className="offer-item">
          <i className="material-icons offer-icon">sell</i>
          <div className="offer-text">
            <span className="offer-title">Bank Offer</span>
            5% Cashback on Axis Bank Card{" "}
            <a href="#" className="offer-link">
              T&amp;C
            </a>
          </div>
        </div>
        <div className="offer-item">
          <i className="material-icons offer-icon">sell</i>
          <div className="offer-text">
            <span className="offer-title">Special Price</span>
            Get extra 15% off (price inclusive of cashback/coupon){" "}
            <a href="#" className="offer-link">
              T&amp;C
            </a>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      <div className="delivery-info">
        <span className="material-icons me-3">local_shipping</span>
        <div className="delivery-text">
          <div>
            <span className="free">FREE Delivery</span>{" "}
            <del className="old-fee text-muted">₹75</del>
          </div>
          <div>
            Delivery by • <span className="fw-bold">{getDeliveryDateString(3)}</span>
          </div>
        </div>
      </div>

      {/* Recommendation Carousels */}
      {/* 1. Suggested for You */}
      {suggestedProducts.length > 0 && (
        <section className="compact-showcase-section">
          <div className="compact-section-header">
            <h5 className="fw-bold">Suggested for You</h5>
            <p className="text-muted small mb-3">Based on Your Activity</p>
          </div>
          <div className="compact-carousel-container">
            <div ref={suggestedScrollRef} className="compact-carousel">
              {[...suggestedProducts, ...suggestedProducts].map((p, idx) => (
                <div key={idx} className="compact-product-card">
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="compact-image-wrapper">
                      <img
                        src={
                          p.img1 ||
                          "https://magndsakurti.info/assets/images/no-img.png"
                        }
                        alt={p.name}
                        className="product-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="compact-info-wrapper">
                      <p className="product-name">{p.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="compact-add-to-cart-btn w-full border-0 cursor-pointer block"
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Lowest Price of the Year */}
      {otherProducts.length > 0 && (
        <section className="compact-showcase-section">
          <div className="compact-section-header">
            <h5 className="fw-bold">Lowest Price of the Year</h5>
            <p className="text-muted small mb-3">Best Deals</p>
          </div>
          <div className="compact-carousel-container">
            <div ref={otherScrollRef} className="compact-carousel">
              {[...otherProducts, ...otherProducts].map((p, idx) => (
                <div key={idx} className="compact-product-card">
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="compact-image-wrapper">
                      <img
                        src={
                          p.img1 ||
                          "https://magndsakurti.info/assets/images/no-img.png"
                        }
                        alt={p.name}
                        className="product-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="compact-info-wrapper">
                      <p className="product-name">{p.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="compact-add-to-cart-btn w-full border-0 cursor-pointer block"
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Details Section (Fully open, static) */}
      <div className="product-description-section bootstrap-scope">
        <h4 className="fw-bold">Product Details</h4>
        <div className="text-muted mt-2">
          {product.features ||
            "High-quality product designed for ultimate durability, style, and satisfaction. Ideal choice for modern households and daily utility usage."}
        </div>
      </div>

      {/* Ratings & Reviews Section (Fully open, static) */}
      <div className="reviews-container bootstrap-scope pb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold m-0">Ratings &amp; Reviews</h3>
          <button
            className="btn btn-outline-secondary btn-sm"
            style={{
              width: "unset",
              height: "unset",
              borderRadius: "0.25rem",
              fontSize: "14px",
              padding: "4px 8px",
              lineHeight: "normal",
            }}
          >
            Rate Product
          </button>
        </div>

        <div className="rating-summary-section">
          <div className="overall-rating text-center">
            <div className="rating-value">
              {randomRating}{" "}
              <i
                className="material-icons align-middle"
                style={{ color: "#388e3c" }}
              >
                star
              </i>
            </div>
            <p className="text-muted small">{randomRatingsCount}</p>
          </div>

          <div className="rating-breakdown flex-grow-1">
            <div className="d-flex align-items-center small mb-1">
              <span>5★</span>
              <div
                className="progress mx-2 flex-grow-1"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${r5Percent}%` }}
                ></div>
              </div>
              <span className="text-muted w-10 text-right">{r5Count}</span>
            </div>
            <div className="d-flex align-items-center small mb-1">
              <span>4★</span>
              <div
                className="progress mx-2 flex-grow-1"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${r4Percent}%` }}
                ></div>
              </div>
              <span className="text-muted w-10 text-right">{r4Count}</span>
            </div>
            <div className="d-flex align-items-center small mb-1">
              <span>3★</span>
              <div
                className="progress mx-2 flex-grow-1"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${r3Percent}%` }}
                ></div>
              </div>
              <span className="text-muted w-10 text-right">{r3Count}</span>
            </div>
            <div className="d-flex align-items-center small mb-1">
              <span>2★</span>
              <div
                className="progress mx-2 flex-grow-1"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${r2Percent}%` }}
                ></div>
              </div>
              <span className="text-muted w-10 text-right">{r2Count}</span>
            </div>
            <div className="d-flex align-items-center small">
              <span>1★</span>
              <div
                className="progress mx-2 flex-grow-1"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${r1Percent}%` }}
                ></div>
              </div>
              <span className="text-muted w-10 text-right">{r1Count}</span>
            </div>
          </div>
        </div>

        <div className="review-list">
          <div className="review-card">
            <div className="d-flex align-items-center mb-2">
              <span className="rating-box me-2">
                4.6{" "}
                <i className="material-icons" style={{ fontSize: "12px" }}>
                  star
                </i>
              </span>
              <h5 className="fw-bold mb-0 small">Value for Money</h5>
            </div>
            <p className="small">
              Good product for the price. Delivery was on time and packaging was
              secure. Satisfied.
            </p>
            <p className="text-muted small m-0">Priya Patel | 16 Nov 2025</p>
          </div>
          <div className="review-card">
            <div className="d-flex align-items-center mb-2">
              <span className="rating-box me-2">
                4.2{" "}
                <i className="material-icons" style={{ fontSize: "12px" }}>
                  star
                </i>
              </span>
              <h5 className="fw-bold mb-0 small">Value for Money</h5>
            </div>
            <p className="small">
              Good product for the price. Delivery was on time and packaging was
              secure. Satisfied.
            </p>
            <p className="text-muted small m-0">Priya Patel | 14 Nov 2025</p>
          </div>
          <div className="review-card">
            <div className="d-flex align-items-center mb-2">
              <span className="rating-box me-2">
                4.5{" "}
                <i className="material-icons" style={{ fontSize: "12px" }}>
                  star
                </i>
              </span>
              <h5 className="fw-bold mb-0 small">Excellent Product!</h5>
            </div>
            <p className="small">
              The quality is amazing, exactly as described. Very happy with the
              purchase. Highly recommended!
            </p>
            <p className="text-muted small m-0">Rohan Sharma | 07 Jan 2026</p>
          </div>
          <div className="review-card">
            <div className="d-flex align-items-center mb-2">
              <span className="rating-box me-2">
                4.6{" "}
                <i className="material-icons" style={{ fontSize: "12px" }}>
                  star
                </i>
              </span>
              <h5 className="fw-bold mb-0 small">Value for Money</h5>
            </div>
            <p className="small">
              Good product for the price. Delivery was on time and packaging was
              secure. Satisfied.
            </p>
            <p className="text-muted small m-0">Priya Patel | 21 Dec 2025</p>
          </div>
          <div className="review-card">
            <div className="d-flex align-items-center mb-2">
              <span className="rating-box me-2">
                4.7{" "}
                <i className="material-icons" style={{ fontSize: "12px" }}>
                  star
                </i>
              </span>
              <h5 className="fw-bold mb-0 small">Value for Money</h5>
            </div>
            <p className="small">
              Good product for the price. Delivery was on time and packaging was
              secure. Satisfied.
            </p>
            <p className="text-muted small m-0">Priya Patel | 01 Jan 2026</p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="footerbuttonbuy d-flex bootstrap-scope max-w-[480px] mx-auto left-0 right-0">
        <button
          onClick={() => addToCart(getProductPayload())}
          className="btn1 btncart w-50 cursor-pointer"
        >
          Add To Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="btn1 btnbuy w-50 cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </main>
  );
};
