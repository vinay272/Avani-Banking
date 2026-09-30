import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function ExecutiveDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState(null);

  const [reports, setReports] = useState({
    transactions: null,
    customers: null,
    loans: null,
    investments: null,
    fraud: null,
    branches: null,
    compliance: null,
  });

  const [activeSection, setActiveSection] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate, token]);

  // =========================================================
  // LOAD EXECUTIVE DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, chartsResponse] =
        await Promise.all([
          fetch(`${API_BASE}/admin/reports/dashboard`, {
            headers,
          }),

          fetch(`${API_BASE}/admin/reports/charts`, {
            headers,
          }),
        ]);

      if (
        dashboardResponse.status === 401 ||
        dashboardResponse.status === 403 ||
        chartsResponse.status === 401 ||
        chartsResponse.status === 403
      ) {
        setError(
          "Admin access required. Please login with SUPER_ADMIN or BANK_ADMIN."
        );
        return;
      }

      if (!dashboardResponse.ok) {
        throw new Error("Unable to load dashboard metrics.");
      }

      if (!chartsResponse.ok) {
        throw new Error("Unable to load dashboard charts.");
      }

      const dashboardData =
        await dashboardResponse.json();

      const chartsData =
        await chartsResponse.json();

      setDashboard(dashboardData);
      setCharts(chartsData);
    } catch (err) {
      console.error("Executive Dashboard Error:", err);

      setError(
        err.message ||
          "Unable to load executive dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD REPORT
  // =========================================================

  const loadReport = async (reportName) => {
    try {
      setReportLoading(true);
      setError("");

      const endpoints = {
        transactions:
          "/admin/reports/transactions",

        customers:
          "/admin/reports/customers",

        loans:
          "/admin/reports/loans",

        investments:
          "/admin/reports/investments",

        fraud:
          "/admin/reports/fraud",

        branches:
          "/admin/reports/branches",

        compliance:
          "/admin/reports/compliance",
      };

      const response = await fetch(
        `${API_BASE}${endpoints[reportName]}`,
        {
          headers,
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Admin access required."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load ${reportName} report.`
        );
      }

      const data = await response.json();

      setReports((previous) => ({
        ...previous,
        [reportName]: data,
      }));
    } catch (err) {
      console.error(
        `${reportName} report error:`,
        err
      );

      setError(
        err.message ||
          `Unable to load ${reportName} report.`
      );
    } finally {
      setReportLoading(false);
    }
  };

  // =========================================================
  // SECTION CHANGE
  // =========================================================

  const changeSection = (section) => {
    setActiveSection(section);

    const reportSections = [
      "transactions",
      "customers",
      "loans",
      "investments",
      "fraud",
      "branches",
      "compliance",
    ];

    if (reportSections.includes(section)) {
      if (!reports[section]) {
        loadReport(section);
      }
    }
  };

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // MAX VALUE FOR BAR CHARTS
  // =========================================================

  const getMax = (data, key) => {
    if (!Array.isArray(data) || data.length === 0) {
      return 1;
    }

    const max = Math.max(
      ...data.map((item) =>
        Number(item?.[key] || 0)
      )
    );

    return max > 0 ? max : 1;
  };

  // =========================================================
  // KPI CARD
  // =========================================================

  const KpiCard = ({
    icon,
    title,
    value,
    description,
  }) => (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <div style={styles.kpiIcon}>
          {icon}
        </div>

        <span style={styles.kpiLabel}>
          {title}
        </span>
      </div>

      <div className="kpiValue" style={styles.kpiValue}>
        {value}
      </div>

      {description && (
        <div style={styles.kpiDescription}>
          {description}
        </div>
      )}
    </div>
  );

  // =========================================================
  // CHART CARD
  // =========================================================

  const ChartCard = ({
    title,
    subtitle,
    children,
  }) => (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <div>
          <h3 style={styles.chartTitle}>
            {title}
          </h3>

          {subtitle && (
            <p style={styles.chartSubtitle}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </div>
  );

  // =========================================================
  // BAR
  // =========================================================

  const Bar = ({
    label,
    value,
    max,
    displayValue,
  }) => {
    const width =
      Math.max(
        4,
        Math.min(
          100,
          (Number(value || 0) / max) * 100
        )
      );

    return (
      <div style={styles.barRow}>
        <div className="barLabel" style={styles.barLabel}>
          <span>{label}</span>

          <strong>
            {displayValue ??
              Number(value || 0).toLocaleString(
                "en-IN"
              )}
          </strong>
        </div>

        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${width}%`,
            }}
          />
        </div>
      </div>
    );
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderOverview = () => {
    if (!dashboard || !charts) {
      return null;
    }

    const revenueData =
      charts.revenueTrend || [];

    const transactionData =
      charts.transactionVolume || [];

    const loanData =
      charts.loanDistribution || [];

    const depositData =
      charts.depositGrowth || [];

    const fraudData =
      charts.fraudAnalysis || [];

    const customerData =
      charts.customerGrowth || [];

    return (
      <>
        {/* =================================================
            KPI SECTION
        ================================================= */}

        <section>
          <div className="executive-section-heading" style={styles.sectionHeading}>
            <div>
              <h2 className="sectionTitle" style={styles.sectionTitle}>
                Executive Overview
              </h2>

              <p style={styles.sectionSubtitle}>
                Real-time banking performance and
                operational metrics.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="executive-kpi-grid" style={styles.kpiGrid}>
            <KpiCard
              icon="👥"
              title="Total Customers"
              value={formatNumber(
                dashboard.totalCustomers
              )}
              description="Registered customers"
            />

            <KpiCard
              icon="💰"
              title="Total Deposits"
              value={formatCurrency(
                dashboard.totalDeposits
              )}
              description="Active account balances"
            />

            <KpiCard
              icon="🏦"
              title="Total Loans"
              value={formatCurrency(
                dashboard.totalLoans
              )}
              description="Approved loan portfolio"
            />

            <KpiCard
              icon="⇄"
              title="Daily Transactions"
              value={formatNumber(
                dashboard.dailyTransactions
              )}
              description="Transactions processed today"
            />

            <KpiCard
              icon="📈"
              title="Loan Recovery"
              value={`${Number(
                dashboard.loanRecoveryRate || 0
              ).toFixed(2)}%`}
              description="Paid EMI recovery rate"
            />

            <KpiCard
              icon="🛡️"
              title="Fraud Cases"
              value={formatNumber(
                dashboard.fraudCases
              )}
              description="Fraud alerts recorded"
            />

            <KpiCard
              icon="💳"
              title="Active Cards"
              value={formatNumber(
                dashboard.activeCards
              )}
              description="Currently active cards"
            />

            <KpiCard
              icon="📊"
              title="Investment Portfolio"
              value={formatCurrency(
                dashboard.investmentPortfolio
              )}
              description="Active investment value"
            />

            <KpiCard
              icon="₹"
              title="Revenue"
              value={formatCurrency(
                dashboard.revenue
              )}
              description="Realized loan interest"
            />

            <KpiCard
              icon="🏢"
              title="Branches"
              value={formatNumber(
                dashboard.branchPerformance
                  ?.length || 0
              )}
              description="Branches with appointment activity"
            />
          </div>
        </section>

        {/* =================================================
            CHARTS
        ================================================= */}

        <section style={styles.chartsSection}>
          <div className="executive-section-heading" style={styles.sectionHeading}>
            <div>
              <h2 className="sectionTitle" style={styles.sectionTitle}>
                Business Analytics
              </h2>

              <p style={styles.sectionSubtitle}>
                Visual analysis of banking activity.
              </p>
            </div>
          </div>

          <div className="executive-chart-grid" style={styles.chartGrid}>
            {/* REVENUE */}

            <ChartCard
              title="Revenue Trend"
              subtitle="Realized loan interest by month"
            >
              {revenueData.length === 0 ? (
                <EmptyChart text="No revenue data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {revenueData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={item.month}
                        value={item.revenue}
                        max={getMax(
                          revenueData,
                          "revenue"
                        )}
                        displayValue={formatCurrency(
                          item.revenue
                        )}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>

            {/* TRANSACTIONS */}

            <ChartCard
              title="Transaction Volume"
              subtitle="Monthly transaction activity"
            >
              {transactionData.length === 0 ? (
                <EmptyChart text="No transaction data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {transactionData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={item.month}
                        value={
                          item.transactionCount
                        }
                        max={getMax(
                          transactionData,
                          "transactionCount"
                        )}
                        displayValue={formatNumber(
                          item.transactionCount
                        )}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>

            {/* LOANS */}

            <ChartCard
              title="Loan Distribution"
              subtitle="Loans grouped by type"
            >
              {loanData.length === 0 ? (
                <EmptyChart text="No loan data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {loanData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={formatLabel(
                          item.loanType
                        )}
                        value={item.loanCount}
                        max={getMax(
                          loanData,
                          "loanCount"
                        )}
                        displayValue={`${formatNumber(
                          item.loanCount
                        )} loans`}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>

            {/* DEPOSITS */}

            <ChartCard
              title="Deposit Growth"
              subtitle="Active account deposit growth"
            >
              {depositData.length === 0 ? (
                <EmptyChart text="No deposit data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {depositData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={item.month}
                        value={
                          item.cumulativeDeposit
                        }
                        max={getMax(
                          depositData,
                          "cumulativeDeposit"
                        )}
                        displayValue={formatCurrency(
                          item.cumulativeDeposit
                        )}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>

            {/* FRAUD */}

            <ChartCard
              title="Fraud Analysis"
              subtitle="Risk-level distribution"
            >
              {fraudData.length === 0 ? (
                <EmptyChart text="No fraud data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {fraudData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={formatLabel(
                          item.riskLevel
                        )}
                        value={item.caseCount}
                        max={getMax(
                          fraudData,
                          "caseCount"
                        )}
                        displayValue={formatNumber(
                          item.caseCount
                        )}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>

            {/* CUSTOMERS */}

            <ChartCard
              title="Customer Growth"
              subtitle="Customer registration growth"
            >
              {customerData.length === 0 ? (
                <EmptyChart text="No customer growth data available." />
              ) : (
                <div className="chartBody" style={styles.chartBody}>
                  {customerData.map(
                    (item, index) => (
                      <Bar
                        key={index}
                        label={item.month}
                        value={
                          item.totalCustomers
                        }
                        max={getMax(
                          customerData,
                          "totalCustomers"
                        )}
                        displayValue={formatNumber(
                          item.totalCustomers
                        )}
                      />
                    )
                  )}
                </div>
              )}
            </ChartCard>
          </div>
        </section>

        {/* =================================================
            BRANCH PERFORMANCE
        ================================================= */}

        <section>
          <div className="executive-section-heading" style={styles.sectionHeading}>
            <div>
              <h2 className="sectionTitle" style={styles.sectionTitle}>
                Branch Performance
              </h2>

              <p style={styles.sectionSubtitle}>
                Appointment activity by branch.
              </p>
            </div>
          </div>

          <DataTable
            columns={[
              ["Branch", "branchName"],
              ["Code", "branchCode"],
              ["Total", "totalAppointments"],
              ["Booked", "bookedAppointments"],
              [
                "Completed",
                "completedAppointments",
              ],
              [
                "Cancelled",
                "cancelledAppointments",
              ],
            ]}
            data={
              dashboard.branchPerformance || []
            }
          />
        </section>
      </>
    );
  };

  // =========================================================
  // EMPTY CHART
  // =========================================================

  const EmptyChart = ({ text }) => (
    <div style={styles.emptyChart}>
      <div style={styles.emptyIcon}>
        📊
      </div>

      <span>{text}</span>
    </div>
  );

  // =========================================================
  // GENERIC DATA TABLE
  // =========================================================

  const DataTable = ({
    columns,
    data,
  }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div style={styles.emptyTable}>
          No data available.
        </div>
      );
    }

    return (
      <div className="executive-table-wrapper" style={styles.tableWrapper}>
        <table className="executive-table" style={styles.table}>
          <thead>
            <tr>
              {columns.map(
                ([label], index) => (
                  <th
                    key={index}
                    style={styles.th}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(
                  ([, key], columnIndex) => (
                    <td
                      key={columnIndex}
                      style={styles.td}
                    >
                      {formatTableValue(
                        row[key],
                        key
                      )}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // =========================================================
  // TABLE VALUE FORMAT
  // =========================================================

  const formatTableValue = (
    value,
    key
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (
      key.toLowerCase().includes("amount") ||
      key.toLowerCase().includes("balance") ||
      key.toLowerCase().includes("revenue") ||
      key.toLowerCase().includes("deposit") ||
      key.toLowerCase().includes("portfolio")
    ) {
      return formatCurrency(value);
    }

    if (
      key.toLowerCase().includes("date") ||
      key === "createdAt" ||
      key === "detectedAt" ||
      key === "updatedAt"
    ) {
      return formatDate(value);
    }

    if (
      typeof value === "object"
    ) {
      return JSON.stringify(value);
    }

    return formatLabel(value);
  };

  // =========================================================
  // REPORT RENDERER
  // =========================================================

  const renderReport = (
    reportName,
    title,
    subtitle
  ) => {
    const report =
      reports[reportName];

    if (reportLoading && !report) {
      return (
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />

          <h3 style={styles.loadingTitle}>
            Loading {title}
          </h3>

          <p style={styles.loadingText}>
            Fetching the latest report data...
          </p>
        </div>
      );
    }

    if (!report) {
      return null;
    }

    return (
      <section>
        <div className="executive-section-heading" style={styles.sectionHeading}>
          <div>
            <h2 className="sectionTitle" style={styles.sectionTitle}>
              {title}
            </h2>

            <p style={styles.sectionSubtitle}>
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadReport(reportName)
            }
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>
        </div>

        <ReportSummary
          report={report}
          reportName={reportName}
        />

        <ReportData
          report={report}
          reportName={reportName}
        />
      </section>
    );
  };

  // =========================================================
  // REPORT SUMMARY
  // =========================================================

  const ReportSummary = ({
    report,
    reportName,
  }) => {
    const summaries = [];

    Object.entries(report).forEach(
      ([key, value]) => {
        if (
          typeof value === "number" &&
          summaries.length < 6
        ) {
          summaries.push({
            key,
            value,
          });
        }
      }
    );

    return (
      <div className="executive-summary-grid" style={styles.reportSummaryGrid}>
        {summaries.map(
          ({ key, value }) => (
            <div
              key={key}
              style={styles.reportSummaryCard}
            >
              <span
                style={styles.reportSummaryLabel}
              >
                {formatLabel(key)}
              </span>

              <strong
                style={styles.reportSummaryValue}
              >
                {key
                  .toLowerCase()
                  .includes("amount") ||
                key
                  .toLowerCase()
                  .includes("rate")
                  ? Number(value).toFixed(2)
                  : formatNumber(value)}
              </strong>
            </div>
          )
        )}
      </div>
    );
  };

  // =========================================================
  // REPORT DATA
  // =========================================================

  const ReportData = ({
    report,
    reportName,
  }) => {
    const preferredKeys = {
      transactions: "transactions",
      customers: "customers",
      loans: "loans",
      investments: "investments",
      fraud: "fraudCases",
      branches: "branches",
      compliance: "complianceIssues",
    };

    const dataKey =
      preferredKeys[reportName];

    const data =
      Array.isArray(report[dataKey])
        ? report[dataKey]
        : [];

    if (data.length === 0) {
      return (
        <div className="reportCard" style={styles.reportCard}>
          <h3 style={styles.reportCardTitle}>
            Report Details
          </h3>

          <div style={styles.emptyTable}>
            No detailed records available.
          </div>
        </div>
      );
    }

    const firstRow = data[0];

    const keys = Object.keys(
      firstRow
    ).filter(
      (key) =>
        typeof firstRow[key] !==
        "object"
    );

    const selectedKeys =
      keys.slice(0, 10);

    return (
      <div className="reportCard" style={styles.reportCard}>
        <div style={styles.reportCardHeader}>
          <div>
            <h3 style={styles.reportCardTitle}>
              Report Details
            </h3>

            <p style={styles.reportCardSubtitle}>
              {data.length} record
              {data.length !== 1
                ? "s"
                : ""} found
            </p>
          </div>
        </div>

        <DataTable
          columns={selectedKeys.map(
            (key) => [
              formatLabel(key),
              key,
            ]
          )}
          data={data}
        />
      </div>
    );
  };

  // =========================================================
  // REPORT SECTION
  // =========================================================

  const renderActiveSection = () => {
    if (
      activeSection === "overview"
    ) {
      return renderOverview();
    }

    const reportConfig = {
      transactions: [
        "Transaction Report",
        "Complete transaction activity and status summary.",
      ],

      customers: [
        "Customer Report",
        "Customer registration, KYC and account information.",
      ],

      loans: [
        "Loan Report",
        "Loan applications, approvals and financial distribution.",
      ],

      investments: [
        "Investment Report",
        "Executive investment portfolio and investment activity.",
      ],

      fraud: [
        "Fraud Report",
        "Fraud alerts, risk levels and suspicious activity analysis.",
      ],

      branches: [
        "Branch Performance Report",
        "Branch appointment and operational activity.",
      ],

      compliance: [
        "Compliance Report",
        "KYC, transaction, fraud and access compliance indicators.",
      ],
    };

    const config =
      reportConfig[activeSection];

    if (!config) {
      return null;
    }

    return renderReport(
      activeSection,
      config[0],
      config[1]
    );
  };

  // =========================================================
  // LOADING PAGE
  // =========================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingPage}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>
              🏦
            </div>

            <h2 style={styles.loadingTitle}>
              Loading Executive Dashboard
            </h2>

            <p style={styles.loadingText}>
              Preparing Avani Bank analytics...
            </p>

            <div style={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="executive-responsive" style={styles.page}>
      <style>{`
        .executive-responsive {
          overflow-x: hidden;
        }

        .executive-responsive .executive-container {
          width: min(1440px, 100%) !important;
        }

        .executive-responsive .executive-navigation-scroll {
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 1000px) {
          .executive-responsive .executive-container {
            padding: 20px 18px 35px !important;
          }

          .executive-responsive .executive-header {
            max-height: none !important;
            padding: 25px !important;
          }

          .executive-responsive .executive-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .executive-responsive .executive-chart-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .executive-responsive .executive-summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 700px) {
          .executive-responsive .executive-container {
            padding: 12px 12px 28px !important;
          }

          .executive-responsive .executive-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            padding: 20px !important;
            border-radius: 16px !important;
          }

          .executive-responsive .executive-header h1 {
            font-size: 23px !important;
            line-height: 1.2 !important;
          }

          .executive-responsive .executive-header p {
            max-width: none !important;
          }

          .executive-responsive .executive-header > button {
            width: 100% !important;
            text-align: center !important;
          }

          .executive-responsive .executive-navigation {
            margin-bottom: 17px !important;
            padding: 6px !important;
          }

          .executive-responsive .executive-navigation-scroll {
            gap: 4px !important;
          }

          .executive-responsive .executive-navigation-scroll button {
            flex: 0 0 auto !important;
            padding: 9px 12px !important;
            font-size: 11px !important;
          }

          .executive-responsive .executive-section-heading {
            align-items: stretch !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .executive-responsive .executive-section-heading button {
            width: 100% !important;
          }

          .executive-responsive .executive-kpi-grid,
          .executive-responsive .executive-chart-grid,
          .executive-responsive .executive-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .executive-responsive .executive-kpi-grid > div {
            min-height: auto !important;
            padding: 15px !important;
          }

          .executive-responsive .executive-chart-grid > div {
            min-height: auto !important;
            padding: 16px !important;
          }

          .executive-responsive .executive-table-wrapper {
            max-width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .executive-responsive .executive-table {
            min-width: 680px !important;
          }

          .executive-responsive .executive-error {
            align-items: flex-start !important;
            flex-wrap: wrap !important;
          }

          .executive-responsive .executive-error button {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .executive-responsive .executive-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }

          .executive-responsive .chartBody {
            overflow: hidden;
          }

          .executive-responsive .barLabel {
            gap: 8px !important;
          }

          .executive-responsive .reportCard {
            padding: 15px !important;
          }
        }

        @media (max-width: 380px) {
          .executive-responsive .executive-container {
            padding: 8px 8px 22px !important;
          }

          .executive-responsive .executive-header {
            padding: 16px !important;
          }

          .executive-responsive .executive-header h1 {
            font-size: 20px !important;
          }

          .executive-responsive .executive-header p {
            font-size: 11px !important;
          }

          .executive-responsive .executive-navigation-scroll button {
            padding: 8px 10px !important;
          }

          .executive-responsive .sectionTitle {
            font-size: 17px !important;
          }

          .executive-responsive .kpiValue {
            font-size: 19px !important;
          }
        }
      `}</style>
      <div className="executive-container" style={styles.container}>
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="executive-header" style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              AVANI BANK • EXECUTIVE MANAGEMENT
            </p>

            <h1 style={styles.title}>
              Reports & Executive Dashboard
            </h1>

            <p style={styles.subtitle}>
              Monitor banking performance,
              financial activity, risk and
              operational intelligence from one
              central dashboard.
            </p>
          </div>

          <button
            type="button"
            style={styles.dashboardButton}
            onClick={() =>
              navigate("/admin/dashboard")}
          >
            ← Admin Dashboard
          </button>
        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="executive-error" style={styles.errorBox}>
            <strong>⚠</strong>

            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                setError("");
                loadDashboard();
              }}
              style={styles.errorButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="executive-navigation" style={styles.navigationCard}>
          <div className="executive-navigation-scroll" style={styles.navigationScroll}>
            <NavButton
              active={
                activeSection === "overview"
              }
              onClick={() =>
                changeSection("overview")
              }
            >
              Overview
            </NavButton>

            <NavButton
              active={
                activeSection ===
                "transactions"
              }
              onClick={() =>
                changeSection("transactions")
              }
            >
              Transactions
            </NavButton>

            <NavButton
              active={
                activeSection ===
                "customers"
              }
              onClick={() =>
                changeSection("customers")
              }
            >
              Customers
            </NavButton>

            <NavButton
              active={
                activeSection === "loans"
              }
              onClick={() =>
                changeSection("loans")
              }
            >
              Loans
            </NavButton>

            <NavButton
              active={
                activeSection ===
                "investments"
              }
              onClick={() =>
                changeSection("investments")
              }
            >
              Investments
            </NavButton>

            <NavButton
              active={
                activeSection === "fraud"
              }
              onClick={() =>
                changeSection("fraud")
              }
            >
              Fraud
            </NavButton>

            <NavButton
              active={
                activeSection === "branches"
              }
              onClick={() =>
                changeSection("branches")
              }
            >
              Branches
            </NavButton>

            <NavButton
              active={
                activeSection ===
                "compliance"
              }
              onClick={() =>
                changeSection("compliance")
              }
            >
              Compliance
            </NavButton>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main>
          {renderActiveSection()}
        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="executive-footer" style={styles.footer}>
          <span>
            © 2026 Avani Bank • Executive
            Management System
          </span>

          <span>
            🔒 Secure banking analytics
          </span>
        </footer>
      </div>
    </div>
  );
}

// =========================================================
// NAV BUTTON
// =========================================================

function NavButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.navButton,
        ...(active
          ? styles.navButtonActive
          : {}),
      }}
    >
      {children}
    </button>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily:
      "Inter, Arial, sans-serif",
    color: "#172033",
  },

  container: {
    width: "min(1440px, 100%)",
    margin: "0 auto",
    padding: "28px 24px 40px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    maxHeight: "100px",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    padding: "32px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #173b8c 0%, #2457c6 55%, #3478e5 100%)",
    color: "#ffffff",
    boxShadow:
      "0 14px 35px rgba(23, 59, 140, 0.18)",
    marginBottom: "20px",
  },

  eyebrow: {
    margin: "0 0 9px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    opacity: 0.9,
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin:
      "10px 0 0",
    maxWidth: "760px",
    fontSize: "13px",
    lineHeight: 1.6,
    opacity: 0.9,
  },

  dashboardButton: {
    border: "1px solid #dfe5ef",
    background: "#fff",
    color: "#35527f",
    borderRadius: "9px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  navigationCard: {
    background: "#ffffff",
    border:
      "1px solid #e2e8f2",
    borderRadius: "16px",
    padding: "9px",
    marginBottom: "22px",
    boxShadow:
      "0 5px 18px rgba(23, 59, 140, 0.05)",
  },

  navigationScroll: {
    display: "flex",
    gap: "7px",
    overflowX: "auto",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#65738b",
    borderRadius: "10px",
    padding: "11px 15px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  navButtonActive: {
    background: "#edf4ff",
    color: "#2457c6",
    boxShadow:
      "inset 0 0 0 1px #d7e5ff",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "14px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
    color: "#172033",
  },

  sectionSubtitle: {
    margin:
      "5px 0 0",
    color: "#71809a",
    fontSize: "12px",
  },

  refreshButton: {
    border: "1px solid #d6e2f4",
    background: "#ffffff",
    color: "#2457c6",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "13px",
  },

  kpiCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8f3",
    borderRadius: "15px",
    padding: "18px",
    minHeight: "132px",
    boxSizing: "border-box",
    boxShadow:
      "0 5px 18px rgba(23, 59, 140, 0.045)",
  },

  kpiTop: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  kpiIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#edf4ff",
    color: "#2457c6",
    fontSize: "16px",
  },

  kpiLabel: {
    color: "#71809a",
    fontSize: "11px",
    fontWeight: "700",
  },

  kpiValue: {
    marginTop: "17px",
    color: "#172033",
    fontSize: "21px",
    fontWeight: "800",
    overflowWrap: "anywhere",
  },

  kpiDescription: {
    marginTop: "5px",
    color: "#94a0b3",
    fontSize: "10px",
  },

  chartsSection: {
    marginTop: "30px",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(330px, 1fr))",
    gap: "16px",
  },

  chartCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8f3",
    borderRadius: "16px",
    padding: "20px",
    minHeight: "270px",
    boxShadow:
      "0 5px 18px rgba(23, 59, 140, 0.045)",
    boxSizing: "border-box",
  },

  chartHeader: {
    marginBottom: "20px",
  },

  chartTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
  },

  chartSubtitle: {
    margin:
      "5px 0 0",
    color: "#8490a3",
    fontSize: "11px",
  },

  chartBody: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  barRow: {
    width: "100%",
  },

  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "7px",
    color: "#637188",
    fontSize: "10px",
  },

  barTrack: {
    height: "8px",
    background: "#edf1f7",
    borderRadius: "999px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2457c6, #4a8cf0)",
    transition:
      "width 0.4s ease",
  },

  emptyChart: {
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    color: "#8b97a9",
    fontSize: "12px",
  },

  emptyIcon: {
    fontSize: "28px",
    opacity: 0.6,
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border:
      "1px solid #e1e8f3",
    borderRadius: "13px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
    fontSize: "11px",
  },

  th: {
    padding: "13px 12px",
    textAlign: "left",
    background: "#f8fbff",
    color: "#52627a",
    fontWeight: "800",
    borderBottom:
      "1px solid #e1e8f3",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px",
    color: "#475569",
    borderBottom:
      "1px solid #edf1f6",
    whiteSpace: "nowrap",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  reportSummaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },

  reportSummaryCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8f3",
    borderRadius: "13px",
    padding: "15px",
  },

  reportSummaryLabel: {
    display: "block",
    color: "#78859a",
    fontSize: "10px",
    fontWeight: "700",
    marginBottom: "8px",
  },

  reportSummaryValue: {
    color: "#172033",
    fontSize: "18px",
    fontWeight: "800",
  },

  reportCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8f3",
    borderRadius: "16px",
    padding: "20px",
    boxShadow:
      "0 5px 18px rgba(23, 59, 140, 0.045)",
  },

  reportCardHeader: {
    marginBottom: "15px",
  },

  reportCardTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
  },

  reportCardSubtitle: {
    margin:
      "5px 0 0",
    color: "#8591a5",
    fontSize: "11px",
  },

  emptyTable: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#8a96a8",
    background: "#f8fbff",
    border:
      "1px dashed #d9e2ef",
    borderRadius: "12px",
    fontSize: "12px",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    padding: "13px 15px",
    borderRadius: "12px",
    background: "#fff1f1",
    border:
      "1px solid #ffd0d0",
    color: "#a92727",
    fontSize: "12px",
  },

  errorButton: {
    marginLeft: "auto",
    border: "none",
    background: "#a92727",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "7px 11px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  loadingPage: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    background: "#ffffff",
    border:
      "1px solid #e1e8f3",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 10px 30px rgba(23, 59, 140, 0.07)",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  loadingText: {
    margin:
      "7px 0 18px",
    color: "#7d899c",
    fontSize: "12px",
  },

  spinner: {
    width: "30px",
    height: "30px",
    margin: "0 auto",
    border:
      "4px solid #e4ebf5",
    borderTop:
      "4px solid #2457c6",
    borderRadius: "50%",
    animation:
      "executiveSpin 0.8s linear infinite",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "30px",
    padding:
      "18px 4px 0",
    borderTop:
      "1px solid #e1e7f0",
    color: "#8994a7",
    fontSize: "10px",
  },
};

export default ExecutiveDashboard;