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

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponsiveStyle = (name) => ({
    ...(styles[name] || {}),
    ...(isMobile ? responsiveStyles[name] || {} : {}),
  });

  return (
    <div style={getResponsiveStyle("page")}>
      {/* Header */}
      <div style={getResponsiveStyle("header")}>
        <div style={getResponsiveStyle("headerLeft")}>
          <div style={getResponsiveStyle("headerIcon")}>₹</div>

          <div>
            <h1 style={getResponsiveStyle("title")}>Dividend Tracking</h1>

            <p style={getResponsiveStyle("subtitle")}>
              Track your dividend income and history
            </p>
          </div>
        </div>

        <button
          style={getResponsiveStyle("backButton")}
          onClick={() => navigate("/investments")}
        >
          ← Investment Page
        </button>
      </div>

      <div style={getResponsiveStyle("content")}>
        {/* Error */}
        {error && <div style={getResponsiveStyle("errorBox")}>{error}</div>}

        {/* Summary Cards */}
        <div style={getResponsiveStyle("summaryGrid")}>
          <div style={getResponsiveStyle("summaryCard")}>
            <div style={getResponsiveStyle("cardIcon")}>₹</div>

            <div>
              <p style={getResponsiveStyle("cardLabel")}>Total Dividend</p>

              <h2 style={getResponsiveStyle("cardValue")}>
                {formatCurrency(summary?.totalDividend ?? totalDividend)}
              </h2>
            </div>
          </div>

          <div style={getResponsiveStyle("summaryCard")}>
            <div style={getResponsiveStyle("cardIcon")}>✓</div>

            <div>
              <p style={getResponsiveStyle("cardLabel")}>Dividends Received</p>

              <h2 style={getResponsiveStyle("cardValue")}>
                {summary?.totalRecords ?? receivedCount}
              </h2>
            </div>
          </div>

          <div style={getResponsiveStyle("summaryCard")}>
            <div style={getResponsiveStyle("cardIcon")}>↗</div>

            <div>
              <p style={getResponsiveStyle("cardLabel")}>Latest Dividend</p>

              <h2 style={getResponsiveStyle("cardValueSmall")}>
                {latestDividend
                  ? formatCurrency(latestDividend.dividendAmount)
                  : "₹0.00"}
              </h2>

              {latestDividend && (
                <span style={getResponsiveStyle("smallDate")}>
                  {formatDate(latestDividend.dividendDate)}
                </span>
              )}
            </div>
          </div>

          <div style={getResponsiveStyle("summaryCard")}>
            <div style={getResponsiveStyle("cardIcon")}>📅</div>

            <div>
              <p style={getResponsiveStyle("cardLabel")}>This Month</p>

              <h2 style={getResponsiveStyle("cardValue")}>
                {formatCurrency(summary?.currentMonthDividend)}
              </h2>

              <span style={getResponsiveStyle("smallDate")}>
                Current month dividend income
              </span>
            </div>
          </div>
        </div>

        {/* Dividend Analytics */}

<div style={getResponsiveStyle("analyticsCard")}>

    <div style={getResponsiveStyle("analyticsHeader")}>
        <div>
            <h2 style={getResponsiveStyle("sectionTitle")}>
                Dividend by Investment
            </h2>

            <p style={getResponsiveStyle("sectionSubtitle")}>
                Distribution of your received dividend income
            </p>
        </div>
    </div>

    <div style={getResponsiveStyle("analyticsGrid")}>

        <div style={getResponsiveStyle("analyticsItem")}>
            <div style={getResponsiveStyle("analyticsItemTop")}>
                <span>📈 Mutual Funds</span>

                <strong>
                    {formatCurrency(
                        summary?.mutualFundDividend
                    )}
                </strong>
            </div>

            <div style={getResponsiveStyle("analyticsTrack")}>
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


        <div style={getResponsiveStyle("analyticsItem")}>
            <div style={getResponsiveStyle("analyticsItemTop")}>
                <span>🔄 SIP</span>

                <strong>
                    {formatCurrency(
                        summary?.sipDividend
                    )}
                </strong>
            </div>

            <div style={getResponsiveStyle("analyticsTrack")}>
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


        <div style={getResponsiveStyle("analyticsItem")}>
            <div style={getResponsiveStyle("analyticsItemTop")}>
                <span>📜 Bonds</span>

                <strong>
                    {formatCurrency(
                        summary?.bondDividend
                    )}
                </strong>
            </div>

            <div style={getResponsiveStyle("analyticsTrack")}>
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


        <div style={getResponsiveStyle("analyticsItem")}>
            <div style={getResponsiveStyle("analyticsItemTop")}>
                <span>🪙 Gold</span>

                <strong>
                    {formatCurrency(
                        summary?.goldDividend
                    )}
                </strong>
            </div>

            <div style={getResponsiveStyle("analyticsTrack")}>
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


        <div style={getResponsiveStyle("analyticsItem")}>
            <div style={getResponsiveStyle("analyticsItemTop")}>
                <span>🏦 Fixed Deposits</span>

                <strong>
                    {formatCurrency(
                        summary?.fixedDepositDividend
                    )}
                </strong>
            </div>

            <div style={getResponsiveStyle("analyticsTrack")}>
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
        <div style={getResponsiveStyle("historyCard")}>
          <div style={getResponsiveStyle("historyHeader")}>
            <div>
              <h2 style={getResponsiveStyle("sectionTitle")}>Dividend History</h2>

              <p style={getResponsiveStyle("sectionSubtitle")}>
                Your received dividend transactions
              </p>
            </div>

            <div style={getResponsiveStyle("headerActions")}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={getResponsiveStyle("select")}
              >
                <option value="ALL">All Investments</option>

                <option value="MUTUAL_FUND">Mutual Fund</option>

                <option value="SIP">SIP</option>

                <option value="BOND">Bond</option>

                <option value="GOLD">Gold</option>

                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
              </select>

              <button
                style={getResponsiveStyle("refreshButton")}
                onClick={fetchDividends}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={getResponsiveStyle("emptyState")}>
              <div style={getResponsiveStyle("loader")}></div>

              <p>Loading dividend history...</p>
            </div>
          ) : filteredDividends.length === 0 ? (
            <div style={getResponsiveStyle("emptyState")}>
              <div style={getResponsiveStyle("emptyIcon")}>₹</div>

              <h3>No Dividend Records</h3>

              <p>Your received dividend history will appear here.</p>
            </div>
          ) : (
            <div style={getResponsiveStyle("tableWrapper")}>
              <table style={getResponsiveStyle("table")}>
                <thead>
                  <tr>
                    <th style={getResponsiveStyle("th")}>Investment</th>

                    <th style={getResponsiveStyle("th")}>Type</th>

                    <th style={getResponsiveStyle("th")}>Dividend Date</th>

                    <th style={getResponsiveStyle("th")}>Units</th>

                    <th style={getResponsiveStyle("th")}>Per Unit</th>

                    <th style={getResponsiveStyle("th")}>Dividend Amount</th>

                    <th style={getResponsiveStyle("th")}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDividends.map((dividend) => (
                    <tr key={dividend.id}>
                      <td style={getResponsiveStyle("td")}>
                        <div style={getResponsiveStyle("investmentName")}>
                          {dividend.investmentName}
                        </div>

                        <div style={getResponsiveStyle("idText")}>Dividend #{dividend.id}</div>
                      </td>

                      <td style={getResponsiveStyle("td")}>
                        <span style={getResponsiveStyle("typeBadge")}>
                          {formatInvestmentType(dividend.investmentType)}
                        </span>
                      </td>

                      <td style={getResponsiveStyle("td")}>
                        {formatDate(dividend.dividendDate)}
                      </td>

                      <td style={getResponsiveStyle("td")}>{dividend.units ?? "-"}</td>

                      <td style={getResponsiveStyle("td")}>
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

                      <td style={getResponsiveStyle("td")}>
                        <span style={getResponsiveStyle("statusBadge")}>
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
        <div style={getResponsiveStyle("infoCard")}>
          <div style={getResponsiveStyle("infoIcon")}>i</div>

          <div>
            <h3 style={getResponsiveStyle("infoTitle")}>Dividend Income</h3>

            <p style={getResponsiveStyle("infoText")}>
              Dividends received from eligible investments are credited to your
              linked account and recorded here for tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const responsiveStyles = {
  page: {
    padding: "12px",
  },
  header: {
    minHeight: "auto",
    padding: "16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
    borderRadius: "14px",
  },
  headerLeft: {
    gap: "11px",
    alignItems: "flex-start",
  },
  headerIcon: {
    width: "42px",
    height: "42px",
    fontSize: "20px",
    flexShrink: 0,
  },
  title: {
    fontSize: "20px",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "12px",
    lineHeight: 1.4,
  },
  backButton: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "13px",
  },
  content: {
    padding: "18px 0 0",
    maxWidth: "100%",
  },
  errorBox: {
    padding: "12px 14px",
    fontSize: "13px",
  },
  summaryGrid: {
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginBottom: "18px",
  },
  summaryCard: {
    padding: "16px",
    gap: "12px",
    minWidth: 0,
  },
  cardIcon: {
    width: "40px",
    height: "40px",
    flexShrink: 0,
  },
  cardLabel: {
    fontSize: "12px",
  },
  cardValue: {
    fontSize: "20px",
    wordBreak: "break-word",
  },
  cardValueSmall: {
    fontSize: "18px",
    wordBreak: "break-word",
  },
  smallDate: {
    fontSize: "10px",
  },
  analyticsCard: {
    padding: "17px 15px",
    marginTop: "18px",
    marginBottom: "18px",
  },
  analyticsHeader: {
    marginBottom: "14px",
  },
  analyticsGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },
  analyticsItem: {
    padding: "12px",
  },
  analyticsItemTop: {
    gap: "8px",
    fontSize: "11px",
    flexWrap: "wrap",
  },
  analyticsTrack: {
    height: "6px",
  },
  historyCard: {
    borderRadius: "13px",
  },
  historyHeader: {
    padding: "17px 15px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "13px",
  },
  sectionTitle: {
    fontSize: "17px",
  },
  sectionSubtitle: {
    fontSize: "12px",
    lineHeight: 1.5,
  },
  headerActions: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "8px",
  },
  select: {
    width: "100%",
    minHeight: "40px",
    fontSize: "13px",
  },
  refreshButton: {
    width: "100%",
    minHeight: "40px",
    padding: "9px 14px",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    minWidth: "760px",
  },
  th: {
    padding: "12px 14px",
    fontSize: "11px",
  },
  td: {
    padding: "13px 14px",
    fontSize: "12px",
  },
  investmentName: {
    fontSize: "12px",
  },
  idText: {
    fontSize: "10px",
  },
  typeBadge: {
    padding: "4px 8px",
    fontSize: "10px",
  },
  statusBadge: {
    padding: "4px 8px",
    fontSize: "10px",
  },
  emptyState: {
    minHeight: "220px",
    padding: "24px 15px",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    fontSize: "20px",
  },
  loader: {
    width: "23px",
    height: "23px",
  },
  infoCard: {
    marginTop: "15px",
    padding: "14px",
    gap: "10px",
  },
  infoIcon: {
    width: "25px",
    height: "25px",
  },
  infoTitle: {
    fontSize: "13px",
  },
  infoText: {
    fontSize: "11px",
    lineHeight: "1.55",
  },
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
