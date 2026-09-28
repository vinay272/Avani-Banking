import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchNotifications();
  }, [navigate]);

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8080/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load notifications.");
      }

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification Error:", err);
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "UNREAD") {
      return unreadNotifications;
    }

    return notifications;
  }, [notifications, unreadNotifications, activeFilter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "LOGIN_ALERT":
        return "🔐";

      case "DEBIT_ALERT":
        return "💸";

      case "CREDIT_ALERT":
        return "💰";

      case "LOAN_EMI_REMINDER":
        return "🏦";

      case "LOW_BALANCE_ALERT":
        return "⚠️";

      case "CARD_USAGE_ALERT":
        return "💳";

      case "SUSPICIOUS_ACTIVITY_ALERT":
        return "🛡️";

      case "INVESTMENT_MATURITY_ALERT":
        return "📈";

      default:
        return "🔔";
    }
  };

  const getNotificationIconStyle = (type) => {
    switch (type) {
      case "DEBIT_ALERT":
        return {
          background: "#fff1f1",
          color: "#d63c3c",
        };

      case "CREDIT_ALERT":
        return {
          background: "#ecfdf5",
          color: "#119463",
        };

      case "SUSPICIOUS_ACTIVITY_ALERT":
      case "LOW_BALANCE_ALERT":
        return {
          background: "#fff8e7",
          color: "#9a6700",
        };

      case "CARD_USAGE_ALERT":
        return {
          background: "#f3f0ff",
          color: "#6847c7",
        };

      case "INVESTMENT_MATURITY_ALERT":
        return {
          background: "#eef7f5",
          color: "#16806b",
        };

      default:
        return {
          background: "#eef4ff",
          color: "#2457c6",
        };
    }
  };

  const formatType = (type) => {
    if (!type) return "Bank Notification";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = async (id) => {
    try {
      setActionLoading(id);

      const response = await fetch(
        `http://localhost:8080/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to mark notification as read.");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Mark Read Error:", err);
      setError(err.message || "Unable to update notification.");
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadNotifications.length === 0) return;

    try {
      setActionLoading("ALL");

      const response = await fetch(
        "http://localhost:8080/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to mark all notifications as read.");
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (err) {
      console.error("Mark All Read Error:", err);
      setError(err.message || "Unable to update notifications.");
    } finally {
      setActionLoading(null);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setActionLoading("CLEAR_ALL");
      setError("");

      const response = await fetch("http://localhost:8080/api/notifications", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to clear notifications.");
      }

      setNotifications([]);
      setActiveFilter("ALL");
      setClearConfirm(false);
    } catch (err) {
      console.error("Clear Notifications Error:", err);
      setError(err.message || "Unable to clear notifications.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🔔</div>

          <h2 style={styles.loadingTitle}>Loading notifications</h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your latest banking alerts...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>🔔</div>

          <div>
            <div style={styles.headerBrand}>AVANI BANK • DIGITAL BANKING</div>

            <h1 style={styles.headerTitle}>Notifications</h1>

            <p style={styles.headerSubtitle}>
              Stay updated with important banking alerts, transactions and
              security notifications.
            </p>
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* ================= SUMMARY ================= */}

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                background: "#eef4ff",
                color: "#2457c6",
              }}
            >
              🔔
            </div>

            <div>
              <p style={styles.summaryLabel}>TOTAL NOTIFICATIONS</p>

              <h2 style={styles.summaryValue}>{notifications.length}</h2>

              <p style={styles.summaryText}>All banking alerts</p>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                background: "#fff8e7",
                color: "#9a6700",
              }}
            >
              ●
            </div>

            <div>
              <p style={styles.summaryLabel}>UNREAD</p>

              <h2 style={styles.summaryValue}>{unreadNotifications.length}</h2>

              <p style={styles.summaryText}>Require your attention</p>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                background: "#ecfdf5",
                color: "#119463",
              }}
            >
              ✓
            </div>

            <div>
              <p style={styles.summaryLabel}>READ</p>

              <h2 style={styles.summaryValue}>
                {notifications.length - unreadNotifications.length}
              </h2>

              <p style={styles.summaryText}>Already reviewed</p>
            </div>
          </div>
        </section>

        {/* ================= CONTROLS ================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>ALERT CENTER</p>

              <h2 style={styles.sectionTitle}>Your Notifications</h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                disabled={
                  unreadNotifications.length === 0 || actionLoading === "ALL"
                }
                onClick={markAllAsRead}
                style={{
                  ...styles.markAllButton,
                  opacity:
                    unreadNotifications.length === 0 || actionLoading === "ALL"
                      ? 0.55
                      : 1,
                  cursor:
                    unreadNotifications.length === 0 || actionLoading === "ALL"
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {actionLoading === "ALL" ? "Updating..." : "✓ Mark All as Read"}
              </button>

              <button
                type="button"
                disabled={
                  notifications.length === 0 || actionLoading === "CLEAR_ALL"
                }
                onClick={() => setClearConfirm(true)}
                style={{
                  ...styles.clearAllButton,
                  opacity:
                    notifications.length === 0 || actionLoading === "CLEAR_ALL"
                      ? 0.55
                      : 1,
                  cursor:
                    notifications.length === 0 || actionLoading === "CLEAR_ALL"
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                🗑 Clear All
              </button>
            </div>
          </div>

          <div style={styles.filterBar}>
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              style={{
                ...styles.filterButton,
                ...(activeFilter === "ALL" ? styles.filterButtonActive : {}),
              }}
            >
              All
              <span style={styles.filterCount}>{notifications.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("UNREAD")}
              style={{
                ...styles.filterButton,
                ...(activeFilter === "UNREAD" ? styles.filterButtonActive : {}),
              }}
            >
              Unread
              <span style={styles.filterCount}>
                {unreadNotifications.length}
              </span>
            </button>
          </div>
        </section>

        {/* ================= NOTIFICATIONS ================= */}

        <section style={styles.notificationList}>
          {filteredNotifications.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                {activeFilter === "UNREAD" ? "✓" : "🔔"}
              </div>

              <h3 style={styles.emptyTitle}>
                {activeFilter === "UNREAD"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </h3>

              <p style={styles.emptyText}>
                {activeFilter === "UNREAD"
                  ? "There are no unread notifications requiring your attention."
                  : "Your banking alerts and important updates will appear here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const iconStyle = getNotificationIconStyle(
                notification.notificationType,
              );

              return (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationCard,
                    ...(notification.read ? {} : styles.unreadCard),
                  }}
                >
                  <div
                    style={{
                      ...styles.notificationIcon,
                      ...iconStyle,
                    }}
                  >
                    {getNotificationIcon(notification.notificationType)}
                  </div>

                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTop}>
                      <div>
                        <span style={styles.notificationType}>
                          {formatType(notification.notificationType)}
                        </span>

                        {!notification.read && (
                          <span style={styles.unreadBadge}>NEW</span>
                        )}
                      </div>

                      <span style={styles.channelBadge}>
                        {notification.channel || "IN_APP"}
                      </span>
                    </div>

                    <h3 style={styles.notificationTitle}>
                      {notification.title || "Avani Bank Notification"}
                    </h3>

                    <p style={styles.notificationMessage}>
                      {notification.message ||
                        "You have a new notification from Avani Bank."}
                    </p>

                    <div style={styles.notificationBottom}>
                      <span style={styles.notificationDate}>
                        {formatDate(notification.createdAt)}

                        {formatTime(notification.createdAt) &&
                          ` • ${formatTime(notification.createdAt)}`}
                      </span>

                      {!notification.read && (
                        <button
                          type="button"
                          disabled={actionLoading === notification.id}
                          style={{
                            ...styles.readButton,
                            opacity:
                              actionLoading === notification.id ? 0.6 : 1,
                          }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {actionLoading === notification.id
                            ? "Updating..."
                            : "Mark as Read"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {clearConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(12, 24, 52, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "390px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "25px",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(18, 35, 70, 0.2)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fff1f1",
                color: "#c73535",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "21px",
                marginBottom: "14px",
              }}
            >
              🗑
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                fontSize: "17px",
                color: "#202b45",
              }}
            >
              Clear all notifications?
            </h3>

            <p
              style={{
                margin: 0,
                color: "#7b8497",
                fontSize: "11px",
                lineHeight: "1.5",
              }}
            >
              This will permanently remove all your notifications from the
              notification panel. This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => setClearConfirm(false)}
                disabled={actionLoading === "CLEAR_ALL"}
                style={{
                  border: "1px solid #dce4f2",
                  background: "#ffffff",
                  color: "#59657b",
                  borderRadius: "9px",
                  padding: "9px 14px",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={clearAllNotifications}
                disabled={actionLoading === "CLEAR_ALL"}
                style={{
                  border: "none",
                  background: "#c73535",
                  color: "#ffffff",
                  borderRadius: "9px",
                  padding: "9px 14px",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor:
                    actionLoading === "CLEAR_ALL" ? "not-allowed" : "pointer",
                  opacity: actionLoading === "CLEAR_ALL" ? 0.65 : 1,
                }}
              >
                {actionLoading === "CLEAR_ALL" ? "Clearing..." : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= FOOTER ================= */}

      <footer style={styles.footer}>
        <div>© {new Date().getFullYear()} Avani Bank</div>

        <div>Secure • Reliable • Digital Banking</div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
    padding: "25px 32px",
  },

  header: {
    maxHeight: "100px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    padding: "28px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(18,51,120,0.14)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "left",
    gap: "16px",
    minWidth: 0,
  },

  headerIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
    marginTop: "12px",
  },

  headerBrand: {
    fontSize: "9px",
    letterSpacing: "1.6px",
    fontWeight: "800",
    color: "#bfcdf0",
    marginBottom: "5px",
  },

  headerTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: "1.15",
    letterSpacing: "-0.5px",
  },

  headerSubtitle: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#d1dcfa",
    lineHeight: "1.45",
    maxWidth: "620px",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.24)",
    background: "#ffffff",
    color: "#173b8c",
    borderRadius: "10px",
    padding: "10px 15px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "30px 24px 50px",
    boxSizing: "border-box",
  },

  errorBox: {
    background: "#fff1f1",
    border: "1px solid #f2cccc",
    color: "#b42323",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 6px 22px rgba(24,43,83,0.04)",
    boxSizing: "border-box",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
    flexShrink: 0,
  },

  summaryLabel: {
    margin: 0,
    fontSize: "9px",
    letterSpacing: "1px",
    color: "#8b94a7",
    fontWeight: "800",
  },

  summaryValue: {
    margin: "4px 0 2px",
    fontSize: "23px",
    color: "#182440",
    fontWeight: "800",
  },

  summaryText: {
    margin: 0,
    fontSize: "10px",
    color: "#9aa2b2",
  },

  section: {
    marginTop: "30px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "13px",
  },

  sectionEyebrow: {
    margin: 0,
    fontSize: "9px",
    color: "#5572af",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "21px",
    color: "#17233f",
  },

  markAllButton: {
    border: "1px solid #dce4f2",
    background: "#ffffff",
    color: "#2457c6",
    borderRadius: "9px",
    padding: "9px 13px",
    fontSize: "10px",
    fontWeight: "700",
  },

  filterBar: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "12px",
    padding: "5px",
    display: "inline-flex",
    gap: "4px",
  },

  filterButton: {
    border: "none",
    background: "transparent",
    color: "#778197",
    borderRadius: "8px",
    padding: "8px 13px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  filterButtonActive: {
    background: "#eef4ff",
    color: "#2457c6",
  },

  filterCount: {
    marginLeft: "6px",
    fontSize: "9px",
    opacity: 0.8,
  },

  notificationList: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  notificationCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "15px",
    padding: "17px",
    display: "flex",
    gap: "14px",
    boxShadow: "0 5px 18px rgba(24,43,83,0.035)",
    boxSizing: "border-box",
  },

  unreadCard: {
    borderLeft: "3px solid #2457c6",
    boxShadow: "0 7px 22px rgba(36,87,198,0.08)",
  },

  notificationIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  notificationTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  notificationType: {
    fontSize: "9px",
    color: "#5572af",
    fontWeight: "800",
    letterSpacing: "0.7px",
    textTransform: "uppercase",
  },

  unreadBadge: {
    marginLeft: "7px",
    padding: "3px 6px",
    borderRadius: "7px",
    background: "#eef4ff",
    color: "#2457c6",
    fontSize: "7px",
    fontWeight: "800",
  },

  channelBadge: {
    background: "#f5f7fb",
    color: "#7d879b",
    padding: "4px 7px",
    borderRadius: "7px",
    fontSize: "7px",
    fontWeight: "800",
    flexShrink: 0,
  },

  notificationTitle: {
    margin: "7px 0 4px",
    fontSize: "14px",
    color: "#1d2944",
    fontWeight: "750",
  },

  notificationMessage: {
    margin: 0,
    color: "#69758b",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  notificationBottom: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  notificationDate: {
    color: "#9aa2b2",
    fontSize: "9px",
  },

  readButton: {
    border: "1px solid #dce4f2",
    background: "#ffffff",
    color: "#2457c6",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "9px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
    boxSizing: "border-box",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
  },

  emptyTitle: {
    margin: "14px 0 5px",
    fontSize: "16px",
    color: "#25314d",
  },

  emptyText: {
    margin: 0,
    maxWidth: "430px",
    color: "#929bad",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  footer: {
    borderTop: "1px solid #e5e9f0",
    background: "#ffffff",
    padding: "18px 6%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#939baa",
    fontSize: "9px",
    boxSizing: "border-box",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb, #edf2fb)",
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
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
    boxSizing: "border-box",
  },

  loadingIcon: {
    fontSize: "42px",
  },

  loadingTitle: {
    margin: "15px 0 6px",
    fontSize: "18px",
    color: "#1c2947",
  },

  loadingText: {
    margin: 0,
    color: "#8993a8",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "20px auto 0",
    animation: "spin 0.8s linear infinite",
  },

  markAllButton: {
    border: "1px solid #dce4f2",
    background: "#ffffff",
    color: "#2457c6",
    borderRadius: "9px",
    padding: "9px 13px",
    fontSize: "10px",
    fontWeight: "700",
  },

  clearAllButton: {
    border: "1px solid #f0caca",
    background: "#fff7f7",
    color: "#c73535",
    borderRadius: "9px",
    padding: "9px 13px",
    fontSize: "10px",
    fontWeight: "700",
  },
};

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 800px) {
    .notification-responsive {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 650px) {
    .notification-mobile {
      flex-direction: column;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Notifications;
