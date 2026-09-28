import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DividendTracking = () => {
  const navigate = useNavigate();

  const [dividends, setDividends] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const fetchDividends = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const [dividendResponse, summaryResponse] = await Promise.all([
        fetch("http://localhost:8080/api/dividends", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),

        fetch("http://localhost:8080/api/dividends/summary", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (
        dividendResponse.status === 401 ||
        dividendResponse.status === 403 ||
        summaryResponse.status === 401 ||
        summaryResponse.status === 403
      ) {
        throw new Error("Session expired. Please login again.");
      }

      if (!dividendResponse.ok) {
        throw new Error("Failed to fetch dividend data");
      }

      if (!summaryResponse.ok) {
        throw new Error("Failed to fetch dividend summary");
      }

      const data = await dividendResponse.json();
      const summaryData = await summaryResponse.json();

      setDividends(Array.isArray(data) ? data : []);

      setSummary(summaryData);
    } catch (err) {
      console.error("Dividend fetch error:", err);
      setError("Unable to load dividend information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividends();
  }, []);

  const totalDividend = useMemo(() => {
    return dividends
      .filter((item) => item.status === "RECEIVED")
      .reduce((total, item) => total + Number(item.dividendAmount || 0), 0);
  }, [dividends]);

  const receivedCount = useMemo(() => {
    return dividends.filter((item) => item.status === "RECEIVED").length;
  }, [dividends]);

  const latestDividend = dividends.length ? dividends[0] : null;

  const filteredDividends = useMemo(() => {
    if (filterType === "ALL") {
      return dividends;
    }

    return dividends.filter((item) => item.investmentType === filterType);
  }, [dividends, filterType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatInvestmentType = (type) => {
    if (!type) return "-";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>₹</div>

          <div>
            <h1 style={styles.title}>Dividend Tracking</h1>

            <p style={styles.subtitle}>
              Track your dividend income and history
            </p>
          </div>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/investments")}
        >
          ← Investment Page
        </button>
      </div>

      <div style={styles.content}>
        {/* Error */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>₹</div>

            <div>
              <p style={styles.cardLabel}>Total Dividend</p>

              <h2 style={styles.cardValue}>
                {formatCurrency(summary?.totalDividend ?? totalDividend)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>✓</div>

            <div>
              <p style={styles.cardLabel}>Dividends Received</p>

              <h2 style={styles.cardValue}>
                {summary?.totalRecords ?? receivedCount}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>↗</div>

            <div>
              <p style={styles.cardLabel}>Latest Dividend</p>

              <h2 style={styles.cardValueSmall}>
                {latestDividend
                  ? formatCurrency(latestDividend.dividendAmount)
                  : "₹0.00"}
              </h2>

              {latestDividend && (
                <span style={styles.smallDate}>
                  {formatDate(latestDividend.dividendDate)}
                </span>
              )}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>📅</div>

            <div>
              <p style={styles.cardLabel}>This Month</p>

              <h2 style={styles.cardValue}>
                {formatCurrency(summary?.currentMonthDividend)}
              </h2>

              <span style={styles.smallDate}>
                Current month dividend income
              </span>
            </div>
          </div>
        </div>

        {/* Dividend Analytics */}

<div style={styles.analyticsCard}>

    <div style={styles.analyticsHeader}>
        <div>
            <h2 style={styles.sectionTitle}>
                Dividend by Investment
            </h2>

            <p style={styles.sectionSubtitle}>
                Distribution of your received dividend income
            </p>
        </div>
    </div>

    <div style={styles.analyticsGrid}>

        <div style={styles.analyticsItem}>
            <div style={styles.analyticsItemTop}>
                <span>📈 Mutual Funds</span>

                <strong>
                    {formatCurrency(
                        summary?.mutualFundDividend
                    )}
                </strong>
            </div>

            <div style={styles.analyticsTrack}>
                <div
                    style={{
                        ...styles.analyticsFill,
                        width: `${
                            summary?.totalDividend > 0
                                ? (
                                      Number(
                                          summary?.mutualFundDividend || 0
                                      ) /
                                      Number(
                                          summary?.totalDividend
                                      )
                                  ) * 100
                                : 0
                        }%`,
                    }}
                />
            </div>
        </div>


        <div style={styles.analyticsItem}>
            <div style={styles.analyticsItemTop}>
                <span>🔄 SIP</span>

                <strong>
                    {formatCurrency(
                        summary?.sipDividend
                    )}
                </strong>
            </div>

            <div style={styles.analyticsTrack}>
                <div
                    style={{
                        ...styles.analyticsFill,
                        width: `${
                            summary?.totalDividend > 0
                                ? (
                                      Number(
                                          summary?.sipDividend || 0
                                      ) /
                                      Number(
                                          summary?.totalDividend
                                      )
                                  ) * 100
                                : 0
                        }%`,
                    }}
                />
            </div>
        </div>


        <div style={styles.analyticsItem}>
            <div style={styles.analyticsItemTop}>
                <span>📜 Bonds</span>

                <strong>
                    {formatCurrency(
                        summary?.bondDividend
                    )}
                </strong>
            </div>

            <div style={styles.analyticsTrack}>
                <div
                    style={{
                        ...styles.analyticsFill,
                        width: `${
                            summary?.totalDividend > 0
                                ? (
                                      Number(
                                          summary?.bondDividend || 0
                                      ) /
                                      Number(
                                          summary?.totalDividend
                                      )
                                  ) * 100
                                : 0
                        }%`,
                    }}
                />
            </div>
        </div>


        <div style={styles.analyticsItem}>
            <div style={styles.analyticsItemTop}>
                <span>🪙 Gold</span>

                <strong>
                    {formatCurrency(
                        summary?.goldDividend
                    )}
                </strong>
            </div>

            <div style={styles.analyticsTrack}>
                <div
                    style={{
                        ...styles.analyticsFill,
                        width: `${
                            summary?.totalDividend > 0
                                ? (
                                      Number(
                                          summary?.goldDividend || 0
                                      ) /
                                      Number(
                                          summary?.totalDividend
                                      )
                                  ) * 100
                                : 0
                        }%`,
                    }}
                />
            </div>
        </div>


        <div style={styles.analyticsItem}>
            <div style={styles.analyticsItemTop}>
                <span>🏦 Fixed Deposits</span>

                <strong>
                    {formatCurrency(
                        summary?.fixedDepositDividend
                    )}
                </strong>
            </div>

            <div style={styles.analyticsTrack}>
                <div
                    style={{
                        ...styles.analyticsFill,
                        width: `${
                            summary?.totalDividend > 0
                                ? (
                                      Number(
                                          summary?.fixedDepositDividend || 0
                                      ) /
                                      Number(
                                          summary?.totalDividend
                                      )
                                  ) * 100
                                : 0
                        }%`,
                    }}
                />
            </div>
        </div>

    </div>
</div>

        {/* Dividend History */}
        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Dividend History</h2>

              <p style={styles.sectionSubtitle}>
                Your received dividend transactions
              </p>
            </div>

            <div style={styles.headerActions}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.select}
              >
                <option value="ALL">All Investments</option>

                <option value="MUTUAL_FUND">Mutual Fund</option>

                <option value="SIP">SIP</option>

                <option value="BOND">Bond</option>

                <option value="GOLD">Gold</option>

                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
              </select>

              <button
                style={styles.refreshButton}
                onClick={fetchDividends}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              <div style={styles.loader}></div>

              <p>Loading dividend history...</p>
            </div>
          ) : filteredDividends.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>₹</div>

              <h3>No Dividend Records</h3>

              <p>Your received dividend history will appear here.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Investment</th>

                    <th style={styles.th}>Type</th>

                    <th style={styles.th}>Dividend Date</th>

                    <th style={styles.th}>Units</th>

                    <th style={styles.th}>Per Unit</th>

                    <th style={styles.th}>Dividend Amount</th>

                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDividends.map((dividend) => (
                    <tr key={dividend.id}>
                      <td style={styles.td}>
                        <div style={styles.investmentName}>
                          {dividend.investmentName}
                        </div>

                        <div style={styles.idText}>Dividend #{dividend.id}</div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.typeBadge}>
                          {formatInvestmentType(dividend.investmentType)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatDate(dividend.dividendDate)}
                      </td>

                      <td style={styles.td}>{dividend.units ?? "-"}</td>

                      <td style={styles.td}>
                        {dividend.dividendPerUnit
                          ? formatCurrency(dividend.dividendPerUnit)
                          : "-"}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          ...styles.amount,
                        }}
                      >
                        +{formatCurrency(dividend.dividendAmount)}
                      </td>

                      <td style={styles.td}>
                        <span style={styles.statusBadge}>
                          {dividend.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information */}
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>i</div>

          <div>
            <h3 style={styles.infoTitle}>Dividend Income</h3>

            <p style={styles.infoText}>
              Dividends received from eligible investments are credited to your
              linked account and recorded here for tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "25px 32px",
    background: "#f6f8fc",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    minHeight: "92px",
    padding: "18px 32px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #0d6efd 0%, #2563eb 55%, #4f46e5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    color: "#ffffff",
    borderRadius: "18px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  headerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "800",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "700",
  },

  subtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    opacity: 0.9,
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.14)",
    color: "#ffffff",
    padding: "10px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px",
    boxSizing: "border-box",
  },

  errorBox: {
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "15px",
    padding: "21px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.05)",
  },

  cardIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "19px",
  },

  cardLabel: {
    margin: 0,
    color: "#667085",
    fontSize: "13px",
  },

  cardValue: {
    margin: "5px 0 0",
    fontSize: "24px",
    fontWeight: "750",
    color: "#000000",
  },

  cardValueSmall: {
    margin: "5px 0 0",
    fontSize: "21px",
    fontWeight: "750",
    color: "#000000",
  },

  smallDate: {
    display: "block",
    marginTop: "3px",
    color: "#98a2b3",
    fontSize: "11px",
  },

  historyCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.05)",
  },

  historyHeader: {
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #edf0f5",
  },

  analyticsCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "15px",
    padding: "22px 24px",
    marginTop: "24px",
    marginBottom: "24px",
    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.05)",
},

analyticsHeader: {
    marginBottom: "20px",
},

analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
},

analyticsItem: {
    padding: "14px",
    border: "1px solid #edf0f5",
    borderRadius: "11px",
    background: "#fafbfc",
},

analyticsItemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    fontSize: "12px",
    color: "#344054",
},

analyticsItemTop: {
    color: "#172033",
    fontSize: "12px",
},

analyticsTrack: {
    width: "100%",
    height: "7px",
    background: "#e9eef5",
    borderRadius: "10px",
    overflow: "hidden",
},

analyticsFill: {
    height: "100%",
    background:
        "linear-gradient(90deg, #0d6efd, #4f46e5)",
    borderRadius: "10px",
    transition: "width 0.4s ease",
},

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
    color: "#000000",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#667085",
    fontSize: "13px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  select: {
    border: "1px solid #d8dee9",
    borderRadius: "9px",
    padding: "9px 12px",
    background: "#ffffff",
    color: "#344054",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },

  refreshButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "14px 18px",
    background: "#f8fafc",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "700",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "16px 18px",
    borderBottom: "1px solid #edf0f5",
    fontSize: "13px",
    color: "#344054",
    whiteSpace: "nowrap",
  },

  investmentName: {
    fontWeight: "650",
    color: "#172033",
  },

  idText: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#98a2b3",
  },

  typeBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#eef4ff",
    color: "#2854c5",
    fontSize: "11px",
    fontWeight: "650",
  },

  amount: {
    color: "#16803c",
    fontWeight: "750",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#ecfdf3",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "700",
  },

  emptyState: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#667085",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "12px",
  },

  loader: {
    width: "25px",
    height: "25px",
    border: "3px solid #dbeafe",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    marginBottom: "12px",
    animation: "spin 0.8s linear infinite",
  },

  infoCard: {
    marginTop: "20px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "13px",
    padding: "17px 20px",
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e40af",
  },

  infoText: {
    margin: "4px 0 0",
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#475569",
  },
};

export default DividendTracking;
