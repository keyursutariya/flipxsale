import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const InfoPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
      alert("Thank you! Your message has been sent successfully.");
    }, 1000);
  };

  // Render content based on slug
  const renderContent = () => {
    switch (slug) {
      case "about-us":
        return (
          <section className="about-content p-6 leading-relaxed text-gray-700 bg-white">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-4 uppercase">About Online Bazar</h1>
            <p className="mb-4 text-sm">
              Welcome to Online Bazar, your premier destination for online shopping! We are dedicated to providing you
              with the best selection of fashion, electronics, home goods, and much more, all at competitive prices and
              with exceptional service.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">Our Mission</h2>
            <p className="mb-4 text-sm">
              Our mission is to make online shopping easy, enjoyable, and accessible for everyone. We strive to offer a
              diverse range of high-quality products, ensuring that you find exactly what you're looking for, whether it's
              the latest tech gadget, a trendy fashion accessory, or essentials for your home.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">What We Offer</h2>
            <ul className="list-disc pl-5 mb-4 text-sm flex flex-col gap-2">
              <li>
                <strong>Vast Product Selection:</strong> Explore our extensive catalog featuring thousands of products across various
                categories.
              </li>
              <li>
                <strong>Quality Assurance:</strong> We carefully select our suppliers and products to ensure high standards of
                quality.
              </li>
              <li>
                <strong>Competitive Prices:</strong> We work hard to bring you the best deals and value for your money.
              </li>
              <li>
                <strong>Secure Shopping Experience:</strong> Your security is our priority. We use advanced encryption and secure
                payment gateways.
              </li>
              <li>
                <strong>Fast &amp; Reliable Delivery:</strong> We partner with trusted logistics providers to ensure your orders
                reach you quickly and safely.
              </li>
              <li>
                <strong>Customer Satisfaction:</strong> Our dedicated customer support team is always ready to assist you with any
                queries or concerns.
              </li>
            </ul>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">Our Vision</h2>
            <p className="mb-4 text-sm">
              To be the leading online retailer, recognized for our commitment to customer satisfaction, innovation, and a
              seamless shopping experience. We envision a future where everyone can shop with confidence and convenience
              from the comfort of their homes.
            </p>

            <p className="text-sm font-medium mt-6">Thank you for choosing Online Bazar. We look forward to serving you!</p>
          </section>
        );

      case "contact-us":
        return (
          <section className="contact-content p-6 bg-white text-gray-700">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-4 uppercase">Contact Online Bazar</h1>
            <p className="text-center text-xs text-gray-500 mb-6">
              We'd love to hear from you! Please reach out to us with any questions, feedback, or support inquiries.
            </p>

            <div className="contact-info mb-6 bg-gray-50 p-4 border border-gray-100 rounded-xl">
              <h2 className="text-sm font-bold text-gray-950 uppercase mb-3">Our Details</h2>
              <div className="flex flex-col gap-3 text-xs">
                <p className="flex items-start gap-2">
                  <i className="bi bi-geo-alt-fill text-red-500"></i>
                  <span>
                    <strong>Address:</strong> Shakti Plot Main Rd, near HDFC Bank, Shakti Plot, Sardar Nagar, Morbi, Gujarat 363641
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <i className="bi bi-envelope-fill text-red-500"></i>
                  <span>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:contact@Online Bazar.info" className="text-blue-600 font-medium hover:underline">
                      contact@Online Bazar.info
                    </a>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <i className="bi bi-phone-fill text-red-500"></i>
                  <span>
                    <strong>Phone:</strong>{" "}
                    <a href="tel:+91 94234 56789" className="text-blue-600 font-medium hover:underline">
                      +91 94234 56789
                    </a>
                  </span>
                </p>
              </div>
            </div>

            <div className="contact-form">
              <h2 className="text-sm font-bold text-gray-950 uppercase mb-3">Send Us a Message</h2>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="subject" className="text-xs font-bold text-gray-500 uppercase">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="message" className="text-xs font-bold text-gray-500 uppercase">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-700 transition cursor-pointer border-none shadow-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>
        );

      case "shipping-policy":
        return (
          <section className="shipping-content p-6 leading-relaxed text-gray-700 bg-white">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-1 uppercase">Shipping Policy</h1>
            <p className="text-center text-[10px] text-gray-400 mb-6"><em>Last updated: October 3, 2025</em></p>

            <p className="text-sm mb-4">
              At Online Bazar, we are committed to delivering your products to you in a timely and efficient manner. This Shipping Policy outlines our shipping practices, delivery times, and costs.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">1. Shipping Zones</h2>
            <p className="text-sm mb-4">We currently ship to addresses within India. For international shipping inquiries, please contact our customer service.</p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">2. Processing Time</h2>
            <p className="text-sm mb-4">
              Orders are typically processed within <strong>1-3 business days</strong> (Monday to Friday, excluding public holidays) after payment confirmation. During peak seasons or promotional periods, processing times may be slightly longer.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">3. Estimated Delivery Times</h2>
            <p className="text-sm mb-4">Once your order has been processed and shipped, the estimated delivery times are as follows:</p>
            <ul className="list-disc pl-5 mb-4 text-sm flex flex-col gap-1">
              <li><strong>Standard Shipping:</strong> 5-7 business days</li>
              <li><strong>Express Shipping:</strong> 2-4 business days (where available)</li>
            </ul>
            <p className="text-sm mb-4">Please note that these are estimates and actual delivery times may vary due to factors beyond our control, such as courier delays, public holidays, and unforeseen circumstances.</p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">4. Shipping Charges</h2>
            <p className="text-sm mb-4 font-semibold">Example Shipping Rates:</p>
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-gray-200">
                    <th className="p-2 border-r border-gray-200 text-left">Order Value</th>
                    <th className="p-2 border-r border-gray-200 text-left">Standard Shipping</th>
                    <th className="p-2 text-left">Express Shipping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 border-r border-gray-200">Below â‚¹500</td>
                    <td className="p-2 border-r border-gray-200">â‚¹50</td>
                    <td className="p-2">â‚¹100</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 border-r border-gray-200">â‚¹500 - â‚¹1500</td>
                    <td className="p-2 border-r border-gray-200">â‚¹30</td>
                    <td className="p-2">â‚¹80</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-gray-200">Above â‚¹1500</td>
                    <td className="p-2 border-r border-gray-200 text-green-600 font-bold">Free Shipping</td>
                    <td className="p-2">â‚¹50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">5. Order Tracking</h2>
            <p className="text-sm mb-4">Once your order is shipped, you will receive an email notification with a tracking number and a link to track your package's journey. You can also log in to your account on our website to view your order status and tracking information.</p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">6. Shipping Address</h2>
            <p className="text-sm mb-4 font-normal text-gray-600">Please ensure that your shipping address is accurate and complete. We are not responsible for delays or non-delivery resulting from incorrect or incomplete address information provided by the customer.</p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">7. Damage During Transit</h2>
            <p className="text-sm mb-4 text-gray-600">We take great care in packaging your items. However, if you receive a damaged product, please contact our customer service immediately (within 24-48 hours of delivery) with photographic evidence of the damage to the item and packaging. We will assist you with a replacement or refund.</p>
          </section>
        );

      case "return-policy":
        return (
          <section className="return-policy-content p-6 leading-relaxed text-gray-700 bg-white">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-1 uppercase">Return &amp; Refund Policy</h1>
            <p className="text-center text-[10px] text-gray-400 mb-6"><em>Last updated: October 3, 2025</em></p>

            <p className="text-sm mb-4">
              At Online Bazar, we want you to be completely satisfied with your purchase. If for any reason you are not, we offer a straightforward return and exchange policy. Please read the following terms carefully.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">1. Eligibility for Returns &amp; Exchanges</h2>
            <p className="text-sm mb-2">To be eligible for a return or exchange, your item must meet the following conditions:</p>
            <ul className="list-disc pl-5 mb-4 text-sm flex flex-col gap-2">
              <li>The return request must be initiated within <strong>7 days</strong> of the delivery date.</li>
              <li>The item must be unused, unwashed, and in the same condition that you received it.</li>
              <li>It must be in its original packaging with all tags, labels, and accessories intact.</li>
              <li>Items bought during sale events or with special discounts may be subject to different return conditions, which will be specified at the time of purchase.</li>
              <li>Certain items, such as intimate apparel, customized products, or perishable goods, may be non-returnable for hygiene or other reasons. These will be clearly marked as such on the product page.</li>
            </ul>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">2. How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 mb-4 text-sm flex flex-col gap-1.5">
              <li>Log in to your account on our website and go to your "Order History".</li>
              <li>Select the order containing the item(s) you wish to return or exchange.</li>
              <li>Click on the "Return/Exchange" button next to the relevant item(s) and follow instructions.</li>
              <li>If you checked out as a guest, please contact our customer service directly with your order number.</li>
            </ol>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">3. Return Shipping</h2>
            <ul className="list-disc pl-5 mb-4 text-sm flex flex-col gap-1">
              <li>If the return is due to an error on our part (e.g., wrong item, defective), we cover the shipping.</li>
              <li>If due to mind change, customer is responsible for shipping costs.</li>
            </ul>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">4. Refunds</h2>
            <p className="text-sm mb-4">
              If approved, your refund will be processed and applied to your original payment method within <strong>7-10 business days</strong>.
            </p>
          </section>
        );

      case "privacy-policy":
        return (
          <section className="p-6 leading-relaxed text-gray-700 bg-white">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-1 uppercase">Privacy Policy</h1>
            <p className="text-center text-[10px] text-gray-400 mb-6"><em>Last updated: October 3, 2025</em></p>

            <p className="text-sm mb-4">
              Online Bazar respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">1. Information We Collect</h2>
            <p className="text-sm mb-4">
              We may collect, use, store and transfer different kinds of personal data about you, including your Identity, Contact details (address, email, phone), Transaction info, and Technical usage data.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">2. How We Use Your Data</h2>
            <p className="text-sm mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use it to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling orders).
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">3. Data Security</h2>
            <p className="text-sm mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            </p>
          </section>
        );

      case "terms-conditions":
        return (
          <section className="p-6 leading-relaxed text-gray-700 bg-white">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-1 uppercase">Terms &amp; Conditions</h1>
            <p className="text-center text-[10px] text-gray-400 mb-6"><em>Last updated: October 3, 2025</em></p>

            <p className="text-sm mb-4">
              These terms and conditions outline the rules and regulations for the use of Online Bazar's Website.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">1. Acceptance of Terms</h2>
            <p className="text-sm mb-4">
              By accessing this website we assume you accept these terms and conditions. Do not continue to use Online Bazar if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">2. Intellectual Property</h2>
            <p className="text-sm mb-4">
              Unless otherwise stated, Online Bazar and/or its licensors own the intellectual property rights for all material on Online Bazar. All intellectual property rights are reserved.
            </p>

            <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 uppercase">3. Limitation of Liability</h2>
            <p className="text-sm mb-4">
              In no event shall Online Bazar, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.
            </p>
          </section>
        );

      default:
        return (
          <div className="p-6 text-center bg-white min-h-[50vh] flex flex-col items-center justify-center">
            <h1 className="text-lg font-bold text-gray-900">Page Not Found</h1>
            <p className="text-sm text-gray-500 mt-2">The page you are looking for does not exist.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-lg text-xs"
            >
              Go to Home
            </button>
          </div>
        );
    }
  };

  return (
    <main className="bg-white min-h-screen max-w-[480px] mx-auto pb-10 shadow-sm border-x border-gray-100">
      {/* Dynamic Info Body */}
      {renderContent()}
    </main>
  );
};

