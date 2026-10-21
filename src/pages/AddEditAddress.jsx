import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar Islands",
  "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

export const AddEditAddress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const { addresses, saveAddress, cart } = useContext(AppContext);

  // Redirect to Home if cart is empty
  useEffect(() => {
    if (cart.totalCount === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  // --- Form States ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [house, setHouse] = useState("");
  const [road, setRoad] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // Optional fields toggles
  const [showAltPhone, setShowAltPhone] = useState(false);
  const [showLandmark, setShowLandmark] = useState(false);

  // Floating label active states
  const [focusedField, setFocusedField] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Geolocation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAddressText, setConfirmAddressText] = useState("");
  const [geocodedData, setGeocodedData] = useState(null);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const [showStateModal, setShowStateModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Prefill if editing
  useEffect(() => {
    if (isEditMode && addresses.list && addresses.list[editId]) {
      const a = addresses.list[editId];
      setFullName(a.name || "");
      setPhone(a.number || "");
      setAltPhone(a.alternateNumber || "");
      setPincode(a.pincode || "");
      setState(a.state || "");
      setCity(a.city || "");
      setHouse(a.house || "");
      setRoad(a.road || "");
      setLandmark(a.landmark || "");
      setAddressType(a.type || "Home");

      if (a.alternateNumber) setShowAltPhone(true);
      if (a.landmark) setShowLandmark(true);
    }
  }, [isEditMode, editId, addresses]);

  // Form validator
  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Please provide your full name.";
    if (!/^\d{10}$/.test(phone.trim())) newErrors.phone = "Please provide a valid 10-digit phone number.";
    if (!pincode.trim()) newErrors.pincode = "Please provide pincode.";
    if (!city.trim()) newErrors.city = "Please provide city.";
    if (!state.trim()) newErrors.state = "Please select state.";
    if (!house.trim()) newErrors.house = "Please provide house no / building name.";
    if (!road.trim()) newErrors.road = "Please provide the necessary details.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const addressData = {
      name: fullName,
      number: phone,
      alternateNumber: altPhone,
      pincode,
      state,
      city,
      house,
      road,
      landmark,
      type: addressType
    };

    saveAddress(editId, addressData);
    navigate("/checkout/summary");
  };

  // Reverse Geocoding via Geoapify API
  const handleUseLocation = () => {
    if (!("geolocation" in navigator)) {
      setErrorModalMessage("Your browser does not support location services. Please enter your address manually.");
      setShowErrorModal(true);
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const GEOAPIFY_API_KEY = "9b680eb04e044e2085d0bb90ee2cf3f3";
          const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&type=street&format=json&apiKey=${GEOAPIFY_API_KEY}`;
          
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          const addr = (data && data.results && data.results[0]) ? data.results[0] : {};

          // Format address string
          const parts = [
            addr.house_number,
            addr.street || addr.name,
            addr.suburb || addr.district,
            addr.city || addr.county || addr.town,
            addr.state,
            addr.postcode
          ].filter(Boolean);

          const formatted = parts.join(", ");
          if (!formatted) throw new Error("No address data");

          setConfirmAddressText(formatted);
          setGeocodedData(addr);
          setShowConfirmModal(true);
        } catch (err) {
          setErrorModalMessage("We are unable to fetch your location automatically. Please try entering it manually.");
          setShowErrorModal(true);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        let msg = "We are unable to fetch your location. Please try entering it manually.";
        if (error && error.code === error.PERMISSION_DENIED) {
          msg = "Location permission was denied. Please enter your address manually.";
        }
        setErrorModalMessage(msg);
        setShowErrorModal(true);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmLocation = () => {
    if (geocodedData) {
      setHouse(geocodedData.house_number || "");
      
      const roadName = geocodedData.street || geocodedData.name || "";
      const districtName = geocodedData.suburb || geocodedData.district || "";
      setRoad([roadName, districtName].filter(Boolean).join(", "));
      
      setCity(geocodedData.city || geocodedData.county || geocodedData.town || "");
      setState(geocodedData.state || "");
      setPincode(geocodedData.postcode || "");
    }
    setShowConfirmModal(false);
  };

  const handleStateSelect = (selectedState) => {
    setState(selectedState);
    setShowStateModal(false);
    // Clear validation error if any
    setErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      return next;
    });
  };

  // Helper function to check if input label should float
  const isFloating = (field, value) => {
    return focusedField === field || (value && value.toString().length > 0);
  };

  return (
    <main className="pb-16 bg-white min-h-screen">
      {/* Progress steps banner */}
      <div className="pb-2 shadow-sm bg-white">
        <img
          className="w-full mt-2 object-contain"
          alt="Step progress"
          src="/images/address-1.png"
          style={{ filter: "hue-rotate(-60deg)" }}
        />
      </div>

      <form id="addressForm" onSubmit={handleSubmit} className="space-y-5 p-4 pb-20">
        {/* Full Name */}
        <div className="relative">
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: null }));
            }}
            onFocus={() => setFocusedField("fullName")}
            onBlur={() => setFocusedField(null)}
            className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
              errors.fullName ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
            }`}
          />
          <label
            htmlFor="fullName"
            className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
              isFloating("fullName", fullName) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
            } ${errors.fullName ? "text-red-500" : ""}`}
          >
            Full Name (Required)*
          </label>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Phone */}
        <div className="relative">
          <input
            type="number"
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((p) => ({ ...p, phone: null }));
            }}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
              errors.phone ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
            }`}
          />
          <label
            htmlFor="phone"
            className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
              isFloating("phone", phone) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
            } ${errors.phone ? "text-red-500" : ""}`}
          >
            Phone number (Required)*
          </label>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          
          {!showAltPhone && (
            <button
              type="button"
              onClick={() => setShowAltPhone(true)}
              className="text-flip-blue text-xs mt-1 border-none bg-transparent font-medium cursor-pointer"
            >
              + Add Alternate Phone Number
            </button>
          )}
        </div>

        {/* Alternate Phone */}
        {showAltPhone && (
          <div className="relative animate-fadeIn">
            <input
              type="number"
              id="altPhone"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              onFocus={() => setFocusedField("altPhone")}
              onBlur={() => setFocusedField(null)}
              className="w-full border border-gray-300 rounded-md px-3 py-3.5 text-sm focus:border-flip-blue focus:outline-none transition-all duration-200"
            />
            <label
              htmlFor="altPhone"
              className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                isFloating("altPhone", altPhone) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
              }`}
            >
              Alternate phone number (Optional)
            </label>
          </div>
        )}

        {/* Pincode + Use Location */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              id="pincode"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                if (errors.pincode) setErrors((p) => ({ ...p, pincode: null }));
              }}
              onFocus={() => setFocusedField("pincode")}
              onBlur={() => setFocusedField(null)}
              className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
                errors.pincode ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
              }`}
            />
            <label
              htmlFor="pincode"
              className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                isFloating("pincode", pincode) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
              } ${errors.pincode ? "text-red-500" : ""}`}
            >
              Pincode (Required)*
            </label>
          </div>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={loadingLocation}
            className="px-3 py-2 text-xs text-white rounded-md flex items-center justify-center gap-1.5 border-none cursor-pointer hover:bg-blue-600 disabled:opacity-75 transition-colors whitespace-nowrap shadow-sm font-medium"
            style={{ backgroundColor: "#2874f0", color: "#ffffff" }}
          >
            <img
              src="//img1a.flixcart.com/www/linchpin/checkout/prod/mylocationAB-ee92a46c.svg"
              width="16"
              height="16"
              alt="Location icon"
              className="inline-block"
            />
            <span>{loadingLocation ? "Locating..." : "Use my location"}</span>
          </button>
        </div>
        {errors.pincode && <p className="text-red-500 text-xs mt-0.5">{errors.pincode}</p>}

        {/* State + City */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="state"
              value={state}
              onClick={() => setShowStateModal(true)}
              readOnly
              className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 bg-white cursor-pointer ${
                errors.state ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
              }`}
            />
            <label
              htmlFor="state"
              className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                isFloating("state", state) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
              } ${errors.state ? "text-red-500" : ""}`}
            >
              State (Required)*
            </label>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((p) => ({ ...p, city: null }));
              }}
              onFocus={() => setFocusedField("city")}
              onBlur={() => setFocusedField(null)}
              className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
                errors.city ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
              }`}
            />
            <label
              htmlFor="city"
              className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                isFloating("city", city) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
              } ${errors.city ? "text-red-500" : ""}`}
            >
              City (Required)*
            </label>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* House */}
        <div className="relative">
          <input
            type="text"
            id="house"
            value={house}
            onChange={(e) => {
              setHouse(e.target.value);
              if (errors.house) setErrors((p) => ({ ...p, house: null }));
            }}
            onFocus={() => setFocusedField("house")}
            onBlur={() => setFocusedField(null)}
            className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
              errors.house ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
            }`}
          />
          <label
            htmlFor="house"
            className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
              isFloating("house", house) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
            } ${errors.house ? "text-red-500" : ""}`}
          >
            House No., Building Name (Required)*
          </label>
          {errors.house && <p className="text-red-500 text-xs mt-1">{errors.house}</p>}
        </div>

        {/* Road */}
        <div className="relative">
          <input
            type="text"
            id="road"
            value={road}
            onChange={(e) => {
              setRoad(e.target.value);
              if (errors.road) setErrors((p) => ({ ...p, road: null }));
            }}
            onFocus={() => setFocusedField("road")}
            onBlur={() => setFocusedField(null)}
            className={`w-full border rounded-md px-3 py-3.5 text-sm focus:outline-none transition-all duration-200 ${
              errors.road ? "border-red-500" : "border-gray-300 focus:border-flip-blue"
            }`}
          />
          <label
            htmlFor="road"
            className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
              isFloating("road", road) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
            } ${errors.road ? "text-red-500" : ""}`}
          >
            Road name, Area, Colony (Required)*
          </label>
          {errors.road && <p className="text-red-500 text-xs mt-1">{errors.road}</p>}

          {!showLandmark && (
            <button
              type="button"
              onClick={() => setShowLandmark(true)}
              className="text-flip-blue text-xs mt-1 border-none bg-transparent font-medium cursor-pointer"
            >
              + Add Nearby Famous Shop/Mall/Landmark
            </button>
          )}
        </div>

        {/* Landmark */}
        {showLandmark && (
          <div className="relative animate-fadeIn">
            <input
              type="text"
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              onFocus={() => setFocusedField("landmark")}
              onBlur={() => setFocusedField(null)}
              className="w-full border border-gray-300 rounded-md px-3 py-3.5 text-sm focus:border-flip-blue focus:outline-none transition-all duration-200"
            />
            <label
              htmlFor="landmark"
              className={`absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none bg-white px-1 ${
                isFloating("landmark", landmark) ? "floating -top-2.5 text-xs text-flip-blue" : "text-gray-500"
              }`}
            >
              Nearby Famous Shop/Mall/Landmark (Optional)
            </label>
          </div>
        )}

        {/* Address Type Selection */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Type of address</p>
          <div className="flex gap-4">
            <div
              onClick={() => setAddressType("Home")}
              className={`address-type-tab ${addressType === "Home" ? "active font-semibold" : ""}`}
            >
              <i className="bi bi-house-door mr-1.5"></i> Home
            </div>
            <div
              onClick={() => setAddressType("Work")}
              className={`address-type-tab ${addressType === "Work" ? "active font-semibold" : ""}`}
            >
              <i className="bi bi-briefcase mr-1.5"></i> Work
            </div>
          </div>
        </div>

        {/* Fixed Save Button at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-[480px] mx-auto z-35 shadow">
          <button
            type="submit"
            className="w-full bg-orange-500 border-none text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition text-sm cursor-pointer"
          >
            Save Address
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div id="confirmModal" className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-sm rounded-lg shadow-lg overflow-hidden animate-fadeIn">
            <div className="p-4">
              <h3 className="text-base font-bold mb-2 text-gray-900">Update with these details?</h3>
              <p id="confirmModalAddress" className="text-xs text-gray-700 break-words leading-relaxed">
                {confirmAddressText}
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-center text-gray-500 border-none bg-transparent hover:bg-gray-50 text-xs font-semibold cursor-pointer"
              >
                CANCEL
              </button>
              <div className="w-px bg-gray-200"></div>
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="flex-1 py-3 text-center text-blue-600 border-none bg-transparent hover:bg-gray-50 text-xs font-bold cursor-pointer"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div id="errorModal" className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-sm rounded-lg shadow-lg overflow-hidden animate-fadeIn">
            <div className="p-4">
              <p id="errorModalMessage" className="text-xs text-gray-800 leading-normal">
                {errorModalMessage}
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="flex-1 py-3 text-center text-blue-600 border-none bg-transparent hover:bg-gray-50 text-xs font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State Picker Modal */}
      {showStateModal && (
        <div id="stateModal" className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-[92%] max-w-sm rounded-lg shadow-lg max-h-[75vh] overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-3.5 border-b border-gray-200 font-bold text-sm text-gray-900">Select State</div>
            <div id="stateList" className="overflow-y-auto flex-grow divide-y divide-gray-100">
              {INDIAN_STATES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleStateSelect(name)}
                  className="w-full flex items-center justify-between px-4 py-3 border-none bg-white hover:bg-gray-50 text-left text-xs font-medium text-gray-700 cursor-pointer"
                >
                  <span>{name}</span>
                  <span className={`w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center ${state === name ? "bg-flip-blue border-flip-blue" : ""}`}>
                    {state === name && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-2 text-right">
              <button
                type="button"
                id="stateClose"
                onClick={() => setShowStateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-blue-600 border-none bg-transparent cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
