import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, searchQuery, setSearchQuery, setIsSidebarOpen } = useContext(AppContext);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const path = location.pathname;

  // Determine header type based on path
  const isHome = path === "/";
  const isInfo = path.startsWith("/info/");
  const isCategory = path.startsWith("/category/");
  const isProduct = path.startsWith("/product/");
  const isCart = path === "/cart";
  const isAddress = path === "/checkout/address";
  const isChangeAddress = path === "/checkout/change-address";
  const isSummary = path === "/checkout/summary";
  const isPayment = path === "/checkout/payment";
  const isSuccess = path === "/success" || path === "/checkout/success";

  const isCheckout = isCart || isAddress || isChangeAddress || isSummary || isPayment || isSuccess;

  // Extract category name if on category page
  let categoryTitle = "";
  if (isCategory) {
    const parts = path.split("/");
    categoryTitle = decodeURIComponent(parts[parts.length - 1] || "");
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    } else {
      navigate("/");
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  // 1. HOME HEADER / INFO HEADER
  if (isHome || isInfo) {
    return (
      <div className="sticky top-0 z-30 bg-white" style={{ marginBottom: "6px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.1)" }}>
        <header id="index-header" className="flex items-center justify-between" style={{ padding: "8px 16px" }}>
          <div className="flex items-center gap-[2px]">
            <button className="rounded-lg hover:bg-gray-100 p-1" aria-label="Menu" onClick={() => setIsSidebarOpen(true)}>
              <span className="text-lg">
                <i className="bi bi-list" style={{ color: "#212121", fontSize: "24px" }}></i>
              </span>
            </button>
            <img
              aria-label="Home"
              onClick={() => navigate("/")}
              src="/images/online-bazar-text.png"
              alt="Online Bazar"
              style={{ height: "44px" }}
              className="w-auto block object-contain ml-[8px] cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <button aria-label="Cart" onClick={() => navigate("/cart")} className="p-1 rounded-lg hover:bg-gray-100 relative">
              <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#212121">
                <path d="M0 0h24v24H0V0z" fill="none"></path>
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17h12v-2H6.5c-.25 0-.42-.21-.38-.45l.93-1.68h7.45z"></path>
              </svg>
              {cart.totalCount > 0 && (
                <span id="cartCount" className="flex items-center justify-center text-center right-1 top-1 text-[8px] w-[15px] h-[15px] text-white font-bold absolute bg-red-500 rounded-full">
                  {cart.totalCount}
                </span>
              )}
            </button>
          </div>
        </header>
        {isHome && (
          <form onSubmit={handleSearchSubmit} role="search">
            <div style={{ padding: "10px 16px", backgroundColor: "white" }}>
              <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
                <input type="text" placeholder="Search for Products" value={searchInput} onChange={handleSearchChange} />
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }

  // 2. CATEGORY HEADER
  if (isCategory) {
    return (
      <header id="product-header" className="sticky top-0 z-30 flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Back" onClick={() => navigate("/")}>
            <span className="text-lg">
              <span className="material-icons">arrow_back</span>
            </span>
          </button>
          <img src="/images/online-bazar-icon.png" alt="Online Bazar" className="h-6 object-contain" style={{ width: "32px", height: "32px" }} />
          <h1 className="header-title">{categoryTitle}</h1>
        </div>

        <div className="flex items-center gap-1" id="right-icons">
          <button aria-label="Cart" onClick={() => navigate("/cart")} className="p-1 rounded-lg hover:bg-gray-100 relative">
            <span className="text-lg">
              <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#212121">
                <path d="M0 0h24v24H0V0z" fill="none"></path>
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17h12v-2H6.5c-.25 0-.42-.21-.38-.45l.93-1.68h7.45z"></path>
              </svg>
            </span>
            {cart.totalCount > 0 && (
              <span id="cartCount" className="flex items-center justify-center text-center right-1 top-1 text-[8px] w-[15px] h-[15px] text-white font-bold absolute bg-red-500 rounded-full">
                {cart.totalCount}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }

  // 3. PRODUCT DETAIL HEADER
  if (isProduct) {
    return (
      <header id="product-header" className="sticky top-0 z-30 flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Back" onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back</span>
          </button>
          <img src="/images/online-bazar-icon.png" alt="Online Bazar" className="h-6 w-auto object-contain cursor-pointer" onClick={() => navigate("/")} style={{ height: "40px", width: "40px" }} />
        </div>

        <div className="flex items-center gap-1" id="right-icons">
          <button className="p-1 rounded-lg hover:bg-gray-100" aria-label="Search" onClick={() => navigate("/")}>
            <span className="text-lg">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </button>
          <button aria-label="Cart" onClick={() => navigate("/cart")} className="p-1 rounded-lg hover:bg-gray-100 relative">
            <span className="text-lg">
              <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#212121">
                <path d="M0 0h24v24H0V0z" fill="none"></path>
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17h12v-2H6.5c-.25 0-.42-.21-.38-.45l.93-1.68h7.45z"></path>
              </svg>
            </span>
            {cart.totalCount > 0 && (
              <span id="cartCount" className="flex items-center justify-center text-center right-1 top-1 text-[8px] w-[15px] h-[15px] text-white font-bold absolute bg-red-500 rounded-full">
                {cart.totalCount}
              </span>
            )}
          </button>
          <button className="p-1 rounded-lg hover:bg-gray-100">
            <span className="text-lg">
              <i className="fa-regular fa-circle-user"></i>
            </span>
          </button>
        </div>
      </header>
    );
  }

  // 4. CHECKOUT / CART HEADERS
  let headerTitle = "My Cart";
  if (isAddress) {
    const searchParams = new URLSearchParams(location.search);
    headerTitle = searchParams.has("edit") ? "Edit delivery address" : "Add delivery address";
  }
  if (isChangeAddress) headerTitle = `Select Address (${cart.totalCount})`; // or address length
  if (isSummary) headerTitle = "Order Summary";
  if (isPayment) headerTitle = "Payments";
  if (isSuccess) headerTitle = "Order Successful";

  return (
    <header id="product-header" className="sticky top-0 z-30 flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button className="p-1 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Back" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left text-xl text-[#212121]"></i>
        </button>
        {isCart && (
          <img 
            src="/images/online-bazar-icon.png" 
            alt="Online Bazar" 
            className="w-[28px] h-[28px] object-contain cursor-pointer ml-1" 
            onClick={() => navigate("/")} 
          />
        )}
        <span className={`text-[16px] font-medium ${isCart ? "text-[#212121]" : "text-gray-900"} ml-1`}>
          {headerTitle}
        </span>
      </div>

      {/* Checkout pages hide the right-side icons as per original CSS */}
      <div className="hidden" id="right-icons"></div>
    </header>
  );
};
