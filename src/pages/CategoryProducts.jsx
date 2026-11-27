import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../../api/products.json";

const categoryLabelMap = {
  Mobile: "Mobiles",
  Electronics: "Electronics",
  Appliances: "Appliances",
  Furniture: "Furniture",
  kurtis: "Sarees",
  "Western Wear": "Western Wear",
  crocs: "Sandals",
  Shoes: "Sport Shoes",
  Grocery: "Grocery",
  dryfruit: "Dryfruit"
};

export const CategoryProducts = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // Filter products by category (case-insensitive check)
  const filteredProducts = productsData.filter(
    (p) => (p.category || "").toLowerCase() === (categoryName || "").toLowerCase()
  );

  return (
    <main className="max-w-[480px] mx-auto pb-6 bg-white min-h-screen">
      <section className="p-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filteredProducts.map((p) => {
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
        )}
      </section>
    </main>
  );
};

