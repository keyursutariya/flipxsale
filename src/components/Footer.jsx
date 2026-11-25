import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="text-white mt-5 bootstrap-scope" style={{ backgroundColor: "#2d3748" }}>
      <div className="container py-4 px-3" style={{ fontSize: "11px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div className="row g-2">
          {/* Column 1: Brand Info */}
          <div className="col-4 mb-3 mb-md-0">
            <h5 className="font-bold text-sm mb-2 text-white">Online Bazar</h5>
            <p className="text-gray-300 leading-relaxed" style={{ fontSize: "10.5px" }}>
              Shop the latest trends in fashion, electronics, and home goods. Experience fast delivery and secure payments with us.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="col-3 mb-3 mb-md-0">
            <h5 className="font-bold text-sm mb-2 text-white">Quick Links</h5>
            <ul className="list-unstyled flex flex-col gap-1.5 p-0 m-0">
              <li><Link to="/info/about-us" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>About Us</Link></li>
              <li><Link to="/info/contact-us" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>Contact Us</Link></li>
              <li><Link to="/info/privacy-policy" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>Privacy Policy</Link></li>
              <li><Link to="/info/terms-conditions" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>Terms &amp; Conditions</Link></li>
              <li><Link to="/info/shipping-policy" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>Shipping Policy</Link></li>
              <li><Link to="/info/return-policy" className="text-gray-300 hover:text-white underline" style={{ fontSize: "10.5px" }}>Return &amp; Refund Policy</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Contact Info */}
          <div className="col-5">
            <h5 className="font-bold text-sm mb-2 text-white">Contact Us</h5>
            <ul className="list-unstyled flex flex-col gap-2 p-0 m-0 text-gray-300" style={{ fontSize: "10.5px" }}>
              <li className="flex items-start gap-1.5">
                <i className="bi bi-geo-alt-fill text-white text-xs mt-0.5"></i> 
                <span className="leading-tight">Shakti Plot Main Rd, near HDFC Bank, Shakti Plot, Sardar Nagar, Morbi, Gujarat 363641</span>
              </li>
              <li className="flex items-start gap-1.5">
                <i className="bi bi-envelope-fill text-white text-xs mt-0.5"></i>
                <span className="break-all">contact@onlinebazar.in</span>
              </li>
              <li className="flex items-center gap-1.5">
                <i className="bi bi-smartphone text-white text-xs"></i>
                <span>+91 94234 56789</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <hr className="mt-4 mb-3" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }} />
        
        {/* Copyright */}
        <div className="text-center text-gray-400" style={{ fontSize: "11px" }}>
          <p className="mb-0">© 2026 Online Bazar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};


