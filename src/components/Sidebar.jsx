import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const categories = [
    { name: "Mobile", label: "Mobiles" },
    { name: "Electronics", label: "Electronics" },
    { name: "Appliances", label: "Appliances" },
    { name: "Furniture", label: "Furniture" },
    { name: "kurtis", label: "Sarees" },
    { name: "Western Wear", label: "Western Wear" },
    { name: "crocs", label: "Sandals" },
    { name: "Shoes", label: "Sport Shoes" },
    { name: "Grocery", label: "Grocery" },
    { name: "dryfruit", label: "Dryfruit" }
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        id="sidebar"
        className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header Section with Blue Bar */}
        <div className="bg-flip-blue text-white p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fa-light fa-circle-user text-lg"></i>
              </div>
              <span className="font-medium text-sm">User</span>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src="/images/online-bazar-icon.png"
                alt="Online Bazar Logo"
              />
            </div>
          </div>
        </div>

        {/* Menu Items Content */}
        <div className="py-2 overflow-y-auto flex-grow text-gray-700 text-sm">
          <div className="px-4 py-2">
            <div
              onClick={() => handleLinkClick("/")}
              className="flex items-center gap-3 mt-2 mb-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-house-door-fill text-lg text-gray-600"></i>
              <span className="font-medium">Home</span>
            </div>

            {/* Shop By Category Accordion */}
            <div>
              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <i className="bi bi-grid-fill text-lg text-gray-600"></i>
                  <span className="font-medium">Shop by Category</span>
                </div>
                <i className={`bi bi-chevron-down transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}></i>
              </div>

              {isCategoryOpen && (
                <div className="pl-6 border-l border-gray-100 ml-4 py-1 flex flex-col gap-1.5 animate-fadeIn">
                  {categories.map((cat) => (
                    <div
                      key={cat.name}
                      onClick={() => handleLinkClick(`/category/${encodeURIComponent(cat.name)}`)}
                      className="py-1 px-2 hover:bg-gray-50 rounded cursor-pointer text-gray-600 hover:text-black transition-colors"
                    >
                      {cat.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200">
              <i className="fa-solid fa-circle-bolt text-gray-600"></i>
              <span className="font-medium">SuperCoin Zone</span>
            </div>

            <div className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200">
              <i className="fa-light fa-compass text-gray-600"></i>
              <span className="font-medium">More on Online Bazar</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 mx-4 my-2"></div>

          {/* Policy Links Group */}
          <div className="px-4 py-2">
            <div
              onClick={() => handleLinkClick("/info/about-us")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-info-circle-fill text-lg text-gray-600"></i>
              <span className="font-medium">About Us</span>
            </div>

            <div
              onClick={() => handleLinkClick("/info/contact-us")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-telephone-fill text-lg text-gray-600"></i>
              <span className="font-medium">Contact Us</span>
            </div>

            <div
              onClick={() => handleLinkClick("/info/shipping-policy")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-truck text-lg text-gray-600"></i>
              <span className="font-medium">Shipping Policy</span>
            </div>

            <div
              onClick={() => handleLinkClick("/info/return-policy")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-box-arrow-left text-lg text-gray-600"></i>
              <span className="font-medium">Return Policy</span>
            </div>

            <div
              onClick={() => handleLinkClick("/info/privacy-policy")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-shield-fill-check text-lg text-gray-600"></i>
              <span className="font-medium">Privacy Policy</span>
            </div>
            
            <div
              onClick={() => handleLinkClick("/info/terms-conditions")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200"
            >
              <i className="bi bi-file-earmark-text-fill text-lg text-gray-600"></i>
              <span className="font-medium">Terms &amp; Conditions</span>
            </div>
            
            <div
              onClick={() => handleLinkClick("/admin/settings")}
              className="flex items-center gap-3 mb-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors duration-200 text-gray-800"
            >
              <i className="bi bi-gear-fill text-lg text-gray-600"></i>
              <span className="font-medium">System Settings</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
