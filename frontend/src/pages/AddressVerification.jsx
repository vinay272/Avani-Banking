import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AddressVerification() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [addressData, setAddressData] = useState(null);

  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
// DARK MODE
// =====================================================

const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("avani-theme") === "dark";
});

useEffect(() => {
  const syncTheme = () => {
    setDarkMode(localStorage.getItem("avani-theme") === "dark");
  };

  window.addEventListener("storage", syncTheme);

  // Sync theme whenever page opens
  syncTheme();

  return () => {
    window.removeEventListener("storage", syncTheme);
  };
}, []);

  // Responsive viewport state
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 600
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER + ADDRESS
  // =========================

  useEffect(() => {
    loadAddressVerification();
  }, []);

  const loadAddressVerification = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {
        navigate("/login");
        return;
      }

      // Get logged-in customer
      const customerResponse = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        customerResponse.status === 401 ||
        customerResponse.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!customerResponse.ok) {
        throw new Error("Unable to fetch customer details.");
      }

      const customerData = await customerResponse.json();
      setCustomer(customerData);

      // Get existing address verification
      const addressResponse = await fetch(
        `http://localhost:8080/api/address-verification/customer/${customerData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // No address record yet
      if (addressResponse.status === 404) {
        setAddressData(null);
        return;
      }

      if (
        addressResponse.status === 401 ||
        addressResponse.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!addressResponse.ok) {
        throw new Error("Unable to fetch address verification.");
      }

      const data = await addressResponse.json();

      setAddressData(data);

      setForm({
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch (err) {
      console.error("Address Verification Error:", err);
      setError(
        err.message || "Unable to load address verification."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT / UPDATE
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.address.trim()) {
      setError("Please enter your complete address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!customer?.id) {
      setError("Customer information is unavailable.");
      return;
    }

    try {
      setSaving(true);

      const params = new URLSearchParams();

      params.append("address", form.address.trim());
      params.append("city", form.city.trim());
      params.append("state", form.state.trim());
      params.append("pincode", form.pincode.trim());

      // New submission starts as PENDING.
      // Existing VERIFIED record is also kept VERIFIED
      // unless the customer changes the address.
      const status =
        addressData?.status === "VERIFIED"
          ? "VERIFIED"
          : "PENDING";

      params.append("status", status);

      params.append(
        "remarks",
        addressData?.status === "VERIFIED"
          ? "Address verified successfully"
          : "Address submitted for verification"
      );

      const response = await fetch(
        `http://localhost:8080/api/address-verification/customer/${customer.id}?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          responseText ||
            "Unable to save address verification."
        );
      }

      const data = await response.json();

      setAddressData(data);

      setForm({
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });

      setMessage(
        data.status === "VERIFIED"
          ? "Address details updated successfully."
          : "Address submitted successfully for verification."
      );
    } catch (err) {
      console.error("Address Save Error:", err);

      setError(
        err.message ||
          "Unable to save address verification."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    const normalized = status?.toUpperCase();

    if (normalized === "VERIFIED") {
      return {
        background: "#ecfdf5",
        color: "#15803d",
        border: "1px solid #bbf7d0",
      };
    }

    if (normalized === "PENDING") {
      return {
        background: "#fff8e7",
        color: "#9a6700",
        border: "1px solid #f3dfaa",
      };
    }

    if (normalized === "REJECTED") {
      return {
        background: "#fff1f1",
        color: "#b42318",
        border: "1px solid #fecaca",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#64748b",
      border: "1px solid #e2e8f0",
    };
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
  style={{
    ...styles.loadingPage,
    ...(darkMode ? styles.darkLoadingPage : {}),
  }}
>
        <div
  style={{
    ...styles.loadingCard,
    ...(darkMode ? styles.darkLoadingCard : {}),
  }}
>
          <div style={styles.loadingIcon}>📍</div>

          <h2
  style={{
    ...styles.loadingTitle,
    ...(darkMode ? styles.darkLoadingTitle : {}),
  }}
>
            Loading Address Verification
          </h2>

          <p
  style={{
    ...styles.loadingText,
    ...(darkMode ? styles.darkLoadingText : {}),
  }}
>
            Please wait while we fetch your address details...
          </p>

          <div
  style={{
    ...styles.loader,
    ...(darkMode ? styles.darkLoader : {}),
  }}
></div>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
<div
  style={{
    ...styles.page,
    ...(darkMode ? styles.darkPage : {}),
    ...(isMobile ? styles.mobilePage : {}),
  }}
>      {/* =========================
          HEADER
      ========================= */}

      <header style={{ ...styles.header, ...(isMobile ? styles.mobileHeader : {}) }}>
        <div>
          <div style={styles.brand}>AVANI BANK</div>

          <h1 style={{ ...styles.title, ...(isMobile ? styles.mobileTitle : {}) }}>
            Address Verification
          </h1>

          <p style={{ ...styles.subtitle, ...(isMobile ? styles.mobileSubtitle : {}) }}>
            Submit and manage your registered address.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{ ...styles.dashboardButton, ...(isMobile ? styles.mobileDashboardButton : {}) }}
        >
          ← Dashboard
        </button>
      </header>

      {/* =========================
          CUSTOMER CARD
      ========================= */}

<div
  style={{
    ...styles.customerCard,
    ...(darkMode ? styles.darkCustomerCard : {}),
    ...(isMobile ? styles.mobileCustomerCard : {}),
  }}
>        <div style={styles.customerAvatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={{ ...styles.customerInfo, ...(isMobile ? styles.mobileCustomerInfo : {}) }}>
          <p
  style={{
    ...styles.customerLabel,
    ...(darkMode ? styles.darkCustomerLabel : {}),
  }}
>CUSTOMER</p>

          <h2
  style={{
    ...styles.customerName,
    ...(darkMode ? styles.darkCustomerName : {}),
  }}
>
            {customer?.fullName || "Customer"}
          </h2>

          <p
  style={{
    ...styles.customerEmail,
    ...(darkMode ? styles.darkCustomerEmail : {}),
  }}
>
            {customer?.email || "Email unavailable"}
          </p>
        </div>

<div
  style={{
    ...styles.accountInfo,
    ...(darkMode ? styles.darkAccountInfo : {}),
    ...(isMobile ? styles.mobileAccountInfo : {}),
  }}
>          <p
  style={{
    ...styles.customerLabel,
    ...(darkMode ? styles.darkCustomerLabel : {}),
  }}
>
            ACCOUNT NUMBER
          </p>

          <strong
  style={{
    ...styles.accountNumber,
    ...(darkMode ? styles.darkAccountNumber : {}),
  }}
>
            {customer?.accountNumber || "N/A"}
          </strong>
        </div>
      </div>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div
  style={{
    ...styles.errorMessage,
    ...(darkMode ? styles.darkErrorMessage : {}),
  }}
>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div
  style={{
    ...styles.successMessage,
    ...(darkMode ? styles.darkSuccessMessage : {}),
  }}
>
          ✓ {message}
        </div>
      )}

      {/* =========================
          CURRENT STATUS
      ========================= */}

      {addressData && (
<div
  style={{
    ...styles.statusCard,
    ...(darkMode ? styles.darkStatusCard : {}),
    ...(isMobile ? styles.mobileStatusCard : {}),
  }}
>          <div
  style={{
    ...styles.statusIcon,
    ...(darkMode ? styles.darkStatusIcon : {}),
  }}
>
  ✓
</div>

          <div style={{ ...styles.statusContent, ...(isMobile ? styles.mobileStatusContent : {}) }}>
            <p
  style={{
    ...styles.statusLabel,
    ...(darkMode ? styles.darkStatusLabel : {}),
  }}
>
              VERIFICATION STATUS
            </p>

            <div style={{ ...styles.statusRow, ...(isMobile ? styles.mobileStatusRow : {}) }}>
              <span
                style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(addressData.status),
                }}
              >
                {addressData.status || "PENDING"}
              </span>

              {addressData.updatedAt && (
                <span
  style={{
    ...styles.updatedText,
    ...(darkMode ? styles.darkUpdatedText : {}),
  }}
>
                  Last updated{" "}
                  {new Date(
                    addressData.updatedAt
                  ).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ADDRESS FORM
      ========================= */}

<div
  style={{
    ...styles.formCard,
    ...(darkMode ? styles.darkFormCard : {}),
    ...(isMobile ? styles.mobileFormCard : {}),
  }}
>        <div style={{ ...styles.cardHeader, ...(isMobile ? styles.mobileCardHeader : {}) }}>
          <div>
            <p
  style={{
    ...styles.cardEyebrow,
    ...(darkMode ? styles.darkCardEyebrow : {}),
  }}
>
              ADDRESS DETAILS
            </p>

            <h2
  style={{
    ...styles.cardTitle,
    ...(darkMode ? styles.darkCardTitle : {}),
  }}
>
              Registered Address
            </h2>

            <p
  style={{
    ...styles.cardDescription,
    ...(darkMode ? styles.darkCardDescription : {}),
  }}
>
              Enter the address associated with your bank
              account.
            </p>
          </div>

          <div
  style={{
    ...styles.locationIcon,
    ...(darkMode ? styles.darkLocationIcon : {}),
    ...(isMobile ? styles.mobileLocationIcon : {}),
  }}
>📍</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ADDRESS */}

          <div style={styles.fieldGroup}>
            <label style={{
  ...styles.label,
  ...(darkMode ? styles.darkLabel : {}),
}}>
              Complete Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              rows="3"
              style={{
  ...styles.input,
  ...(darkMode ? styles.darkInput : {}),
  ...styles.textarea,
}}
              disabled={saving}
            />
          </div>

          {/* CITY + STATE */}

          <div style={{ ...styles.twoColumn, ...(isMobile ? styles.mobileTwoColumn : {}) }}>
            <div style={styles.fieldGroup}>
              <label style={{
  ...styles.label,
  ...(darkMode ? styles.darkLabel : {}),
}}>
                City
              </label>

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                style={{
  ...styles.input,
  ...(darkMode ? styles.darkInput : {}),
}}
                disabled={saving}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={{
  ...styles.label,
  ...(darkMode ? styles.darkLabel : {}),
}}>
                State
              </label>

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                style={{
  ...styles.input,
  ...(darkMode ? styles.darkInput : {}),
}}
                disabled={saving}
              />
            </div>
          </div>

          {/* PINCODE */}

          <div style={styles.fieldGroup}>
            <label style={{
  ...styles.label,
  ...(darkMode ? styles.darkLabel : {}),
}}>
              Pincode
            </label>

            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                if (value.length <= 6) {
                  setForm((previous) => ({
                    ...previous,
                    pincode: value,
                  }));
                }
              }}
              placeholder="Enter 6-digit pincode"
              maxLength="6"
              style={{
  ...styles.input,
  ...(darkMode ? styles.darkInput : {}),
}}
              disabled={saving}
            />
          </div>

          {/* SUBMIT */}

<div
  style={{
    ...styles.formFooter,
    ...(darkMode ? styles.darkFormFooter : {}),
    ...(isMobile ? styles.mobileFormFooter : {}),
  }}
>            <p
  style={{
    ...styles.footerNote,
    ...(darkMode ? styles.darkFooterNote : {}),
  }}
>
              Your address will be submitted for bank
              verification.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : addressData
                ? "Update Address"
                : "Submit Address"}
            </button>
          </div>
        </form>
      </div>

      {/* =========================
          REMARKS
      ========================= */}

      {addressData?.remarks && (
<div
  style={{
    ...styles.remarksCard,
    ...(darkMode ? styles.darkRemarksCard : {}),
    ...(isMobile ? styles.mobileRemarksCard : {}),
  }}
>          <div
  style={{
    ...styles.remarksIcon,
    ...(darkMode ? styles.darkRemarksIcon : {}),
  }}
>ℹ️</div>

          <div>
            <h3
  style={{
    ...styles.remarksTitle,
    ...(darkMode ? styles.darkRemarksTitle : {}),
  }}
>
              Verification Remarks
            </h3>

            <p
  style={{
    ...styles.remarksText,
    ...(darkMode ? styles.darkRemarksText : {}),
  }}
>
              {addressData.remarks}
            </p>
          </div>
        </div>
      )}

      {/* =========================
          INFORMATION
      ========================= */}

      <div
  style={{
    ...styles.infoBox,
    ...(darkMode ? styles.darkInfoBox : {}),
    ...(isMobile ? styles.mobileInfoBox : {}),
  }}
>
        <span
  style={{
    ...styles.infoIcon,
    ...(darkMode ? styles.darkInfoIcon : {}),
  }}
>🔒</span>

        <div>
          <strong
  style={{
    ...styles.infoTitle,
    ...(darkMode ? styles.darkInfoTitle : {}),
  }}
>
            Address Verification
          </strong>

          <p
  style={{
    ...styles.infoText,
    ...(darkMode ? styles.darkInfoText : {}),
  }}
>
            Please ensure that the address details
            provided are accurate. Verified address
            information may be used for banking and
            compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb 0%, #eef3f9 100%)",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
  },

  // =====================================================
// DARK MODE
// =====================================================

darkPage: {
  background:
    "linear-gradient(135deg, #0b1220 0%, #0e1728 100%)",
  color: "#e8eef7",
},

// CUSTOMER
darkCustomerCard: {
  background: "#111a2b",
  border: "1px solid #26344b",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
},

darkCustomerLabel: {
  color: "#8795aa",
},

darkCustomerName: {
  color: "#edf3ff",
},

darkCustomerEmail: {
  color: "#8795aa",
},

darkAccountNumber: {
  color: "#b9c8dd",
},

darkAccountInfo: {
  borderLeft: "1px solid #30405a",
  borderTop: "1px solid #30405a",
},

// ERROR / SUCCESS
darkErrorMessage: {
  background: "#351b22",
  border: "1px solid #63303b",
  color: "#ff9da9",
},

darkSuccessMessage: {
  background: "#123323",
  border: "1px solid #245c3c",
  color: "#65d995",
},

// STATUS
darkStatusCard: {
  background: "#111a2b",
  border: "1px solid #26344b",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
},

darkStatusIcon: {
  background: "#172f63",
  color: "#9ebeff",
},

darkStatusLabel: {
  color: "#8795aa",
},

darkUpdatedText: {
  color: "#71809a",
},

// FORM CARD
darkFormCard: {
  background: "#111a2b",
  border: "1px solid #26344b",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
},

darkCardEyebrow: {
  color: "#7fa7f5",
},

darkCardTitle: {
  color: "#edf3ff",
},

darkCardDescription: {
  color: "#8795aa",
},

darkLocationIcon: {
  background: "#192944",
},

// FORM
darkLabel: {
  color: "#b8c4d6",
},

darkInput: {
  background: "#172235",
  border: "1px solid #34445e",
  color: "#e8eef7",
},

darkFormFooter: {
  borderTop: "1px solid #30405a",
},

darkFooterNote: {
  color: "#71809a",
},

// REMARKS
darkRemarksCard: {
  background: "#172235",
  border: "1px solid #30405a",
},

darkRemarksIcon: {
  background: "#1d2c45",
},

darkRemarksTitle: {
  color: "#dce5f1",
},

darkRemarksText: {
  color: "#8795aa",
},

// INFORMATION
darkInfoBox: {
  background: "#172235",
  border: "1px solid #30405a",
},

darkInfoIcon: {
  color: "#9ebeff",
},

darkInfoTitle: {
  color: "#dce5f1",
},

darkInfoText: {
  color: "#8795aa",
},

// LOADING
darkLoadingPage: {
  background:
    "linear-gradient(135deg, #0b1220, #0e1728)",
},

darkLoadingCard: {
  background: "#111a2b",
  boxShadow: "0 20px 50px rgba(0,0,0,0.40)",
},

darkLoadingTitle: {
  color: "#edf3ff",
},

darkLoadingText: {
  color: "#8795aa",
},

darkLoader: {
  border: "3px solid #29384e",
  borderTop: "3px solid #5b91ff",
},

  header: {
    maxHeight: "100px",
    borderRadius:"18px",
    background:"linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    padding: "28px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(18,51,120,0.14)",
  },

  brand: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#64748b",
    marginBottom: "5px",
  },

  title: {
    margin: 0,
    fontSize: "29px",
    fontWeight: "800",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#7a8699",
    fontSize: "13px",
  },

  dashboardButton: {
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    color: "#26344a",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow:
      "0 4px 12px rgba(20,35,60,0.05)",
  },

  customerCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "18px 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:"0 7px 22px rgba(30,45,70,0.05)",
    marginTop: "18px", 
  },


  customerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
    flexShrink: 0,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
  },

  customerLabel: {
    margin: 0,
    color: "#97a0b0",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  customerName: {
    margin: "3px 0 2px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#1d2944",
  },

  customerEmail: {
    margin: 0,
    color: "#7c879a",
    fontSize: "10px",
    overflowWrap: "anywhere",
  },

  accountInfo: {
    textAlign: "right",
    paddingLeft: "20px",
    borderLeft: "1px solid #edf0f5",
  },

  accountNumber: {
    display: "block",
    marginTop: "4px",
    color: "#253453",
    fontSize: "12px",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  errorMessage: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#fff1f1",
    border: "1px solid #ffd0d0",
    color: "#b42318",
    fontSize: "12px",
    fontWeight: "600",
  },

  successMessage: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "600",
  },

  statusCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "16px 18px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 7px 22px rgba(30,45,70,0.05)",
  },

  statusIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#edf4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: "800",
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    margin: 0,
    color: "#97a0b0",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px",
  },

  statusBadge: {
    padding: "6px 9px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  updatedText: {
    color: "#8b95a7",
    fontSize: "10px",
    overflowWrap: "anywhere",
  },

  formCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "23px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  cardEyebrow: {
    margin: 0,
    color: "#5572af",
    fontSize: "8px",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  cardTitle: {
    margin: "4px 0 0",
    fontSize: "19px",
    fontWeight: "800",
    color: "#1d2944",
  },

  cardDescription: {
    margin: "5px 0 0",
    color: "#7c879a",
    fontSize: "11px",
  },

  locationIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  fieldGroup: {
    marginBottom: "17px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#526078",
    fontSize: "10px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    background: "#fbfcfe",
    borderRadius: "9px",
    padding: "11px 12px",
    outline: "none",
    color: "#263550",
    fontSize: "11px",
    fontFamily: "inherit",
  },

  textarea: {
    resize: "vertical",
    minHeight: "82px",
    lineHeight: "1.5",
  },

  formFooter: {
    marginTop: "6px",
    paddingTop: "17px",
    borderTop: "1px solid #edf0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  footerNote: {
    margin: 0,
    color: "#8993a5",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  submitButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow:
      "0 6px 14px rgba(37,99,199,0.2)",
  },

  remarksCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "18px",
    background: "#f7f9fc",
    border: "1px solid #e4eaf2",
    borderRadius: "13px",
    display: "flex",
    gap: "12px",
  },

  remarksIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#e9f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    flexShrink: 0,
  },

  remarksTitle: {
    margin: 0,
    color: "#33435c",
    fontSize: "12px",
  },

  remarksText: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "11px",
    lineHeight: "1.5",
    overflowWrap: "anywhere",
  },

  infoBox: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "15px 17px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#f5f8fc",
    border: "1px solid #e1e8f1",
    borderRadius: "11px",
  },

  infoIcon: {
    fontSize: "15px",
  },

  infoTitle: {
    display: "block",
    color: "#33435a",
    fontSize: "10px",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#778397",
    fontSize: "9px",
    lineHeight: "1.5",
    overflowWrap: "anywhere",
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb, #edf2fb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "380px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    margin: "13px 0 5px",
    fontSize: "18px",
    color: "#25314d",
  },

  loadingText: {
    margin: 0,
    color: "#8993a8",
    fontSize: "11px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "20px auto 0",
    animation: "addressSpin 0.8s linear infinite",
  },

  // =========================
  // RESPONSIVE OVERRIDES
  // =========================

  mobilePage: {
    padding: "12px",
    overflowX: "hidden",
  },

  mobileHeader: {
    minHeight: "auto",
    maxHeight: "none",
    padding: "18px 16px",
    borderRadius: "14px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
  },

  mobileTitle: {
    fontSize: "21px",
    lineHeight: "1.2",
    letterSpacing: "-0.3px",
  },

  mobileSubtitle: {
    fontSize: "11px",
    lineHeight: "1.45",
    marginTop: "5px",
  },

  mobileDashboardButton: {
    width: "100%",
    textAlign: "center",
    padding: "11px 14px",
    fontSize: "11px",
    boxSizing: "border-box",
  },

  mobileCustomerCard: {
    margin: "12px 0 14px",
    padding: "14px",
    borderRadius: "13px",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "11px",
  },

  mobileCustomerInfo: {
    flex: "1 1 calc(100% - 65px)",
    minWidth: "0",
  },

  mobileAccountInfo: {
    width: "100%",
    paddingLeft: "0",
    paddingTop: "11px",
    borderLeft: "none",
    borderTop: "1px solid #edf0f5",
    textAlign: "left",
  },

  mobileStatusCard: {
    padding: "13px 14px",
    borderRadius: "13px",
    alignItems: "flex-start",
    gap: "10px",
  },

  mobileStatusContent: {
    minWidth: "0",
  },

  mobileStatusRow: {
    flexWrap: "wrap",
    alignItems: "center",
    gap: "7px",
  },

  mobileFormCard: {
    padding: "16px 14px",
    borderRadius: "14px",
    marginBottom: "14px",
  },

  mobileCardHeader: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    marginBottom: "17px",
  },

  mobileLocationIcon: {
    width: "38px",
    height: "38px",
    fontSize: "16px",
  },

  mobileTwoColumn: {
    gridTemplateColumns: "1fr",
    gap: "0",
  },

  mobileFormFooter: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "11px",
  },

  mobileFormFooterButton: {
    width: "100%",
  },

  mobileSubmitButton: {
    width: "100%",
    padding: "12px 16px",
  },

  mobileRemarksCard: {
    padding: "14px",
    gap: "10px",
    alignItems: "flex-start",
  },

  mobileInfoBox: {
    padding: "13px 14px",
    gap: "9px",
    marginBottom: "4px",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement = document.createElement("style");

styleElement.innerHTML = `
  @keyframes addressSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

if (!document.head.contains(styleElement)) {
  document.head.appendChild(styleElement);
}

export default AddressVerification;