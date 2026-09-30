import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function ComplianceAuditDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [auditLogs, setAuditLogs] = useState([]);
  const [regulatory, setRegulatory] = useState(null);
  const [aml, setAml] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [transactionMonitoring, setTransactionMonitoring] =
    useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [accessLogs, setAccessLogs] = useState(null);
  const [retentionPolicies, setRetentionPolicies] = useState([]);

  const [retentionForm, setRetentionForm] = useState({
    policyName: "",
    dataType: "AUDIT_LOG",
    retentionDays: "365",
    retentionAction: "ARCHIVE",
    status: "ACTIVE",
    description: "",
  });

  const [dryRunForm, setDryRunForm] = useState({
    dataType: "AUDIT_LOG",
    retentionDays: "365",
  });

  const [dryRunResult, setDryRunResult] = useState(null);
  const [retentionSaving, setRetentionSaving] = useState(false);

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // =====================================================
  // AUTH ERROR
  // =====================================================

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/admin/login", {
      replace: true,
    });
  };

  // =====================================================
  // API HELPER
  // =====================================================

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error("Admin session expired.");
    }

    const text = await response.text();

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: text,
        };
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Unable to load compliance data."
      );
    }

    return data;
  };

  // =====================================================
  // LOAD ALL COMPLIANCE DATA
  // =====================================================

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        auditData,
        regulatoryData,
        amlData,
        kycData,
        transactionData,
        activityData,
        accessData,
        retentionData,
      ] = await Promise.all([
        fetchJson(`${API_BASE}/admin/audit/logs`),
        fetchJson(`${API_BASE}/admin/compliance/regulatory`),
        fetchJson(`${API_BASE}/admin/compliance/aml`),
        fetchJson(`${API_BASE}/admin/compliance/kyc`),
        fetchJson(`${API_BASE}/admin/compliance/transactions`),
        fetchJson(`${API_BASE}/admin/compliance/user-activity`),
        fetchJson(`${API_BASE}/admin/compliance/access-logs`),
        fetchJson(
          `${API_BASE}/admin/compliance/retention/policies`
        ),
      ]);

      setAuditLogs(
        Array.isArray(auditData) ? auditData : []
      );

      setRegulatory(regulatoryData || null);
      setAml(amlData || null);
      setKyc(kycData || null);
      setTransactionMonitoring(
        transactionData || null
      );
      setUserActivity(activityData || null);
      setAccessLogs(accessData || null);

      setRetentionPolicies(
        Array.isArray(retentionData)
          ? retentionData
          : []
      );
    } catch (err) {
      console.error(
        "Compliance Dashboard Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load compliance dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  // =====================================================
  // SAFE NUMBER
  // =====================================================

  const numberValue = (value) => {
    const number = Number(value || 0);

    return Number.isFinite(number) ? number : 0;
  };

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {
    return `₹${numberValue(value).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN");
  };

  // =====================================================
  // FORMAT LABEL
  // =====================================================

  const formatLabel = (value) => {
    return String(value || "UNKNOWN")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =====================================================
  // AUDIT STATS
  // =====================================================

  const auditStats = useMemo(() => {
    const total = auditLogs.length;

    const success = auditLogs.filter(
      (log) =>
        String(log.status || "").toUpperCase() ===
        "SUCCESS"
    ).length;

    const failed = auditLogs.filter((log) => {
      const status = String(
        log.status || ""
      ).toUpperCase();

      return (
        status === "FAILED" ||
        status === "FAILURE"
      );
    }).length;

    return {
      total,
      success,
      failed,
    };
  }, [auditLogs]);

  // =====================================================
  // RETENTION POLICY CREATE
  // =====================================================

  const handleRetentionCreate = async (event) => {
    event.preventDefault();

    try {
      setRetentionSaving(true);
      setError("");

      await fetchJson(
        `${API_BASE}/admin/compliance/retention/policies`,
        {
          method: "POST",
          body: JSON.stringify({
            ...retentionForm,
            retentionDays: Number(
              retentionForm.retentionDays
            ),
          }),
        }
      );

      setRetentionForm({
        policyName: "",
        dataType: "AUDIT_LOG",
        retentionDays: "365",
        retentionAction: "ARCHIVE",
        status: "ACTIVE",
        description: "",
      });

      await loadComplianceData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to create retention policy."
      );
    } finally {
      setRetentionSaving(false);
    }
  };

  // =====================================================
  // RETENTION DRY RUN
  // =====================================================

  const handleDryRun = async () => {
    try {
      setRetentionSaving(true);
      setError("");

      const data = await fetchJson(
        `${API_BASE}/admin/compliance/retention/dry-run`,
        {
          method: "POST",
          body: JSON.stringify({
            dataType: dryRunForm.dataType,
            retentionDays: Number(
              dryRunForm.retentionDays
            ),
          }),
        }
      );

      setDryRunResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to perform retention dry run."
      );
    } finally {
      setRetentionSaving(false);
    }
  };

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: "📋",
    },
    {
      id: "regulatory",
      label: "Regulatory",
      icon: "🏛️",
    },
    {
      id: "aml",
      label: "AML",
      icon: "💰",
    },
    {
      id: "kyc",
      label: "KYC",
      icon: "🪪",
    },
    {
      id: "transactions",
      label: "Transaction Monitoring",
      icon: "💳",
    },
    {
      id: "activity",
      label: "User Activity",
      icon: "👤",
    },
    {
      id: "access",
      label: "Access Logs",
      icon: "🔐",
    },
    {
      id: "retention",
      label: "Data Retention",
      icon: "🗄️",
    },
  ];

  // =====================================================
  // OVERVIEW DATA
  // =====================================================

  const overviewCards = [
    {
      label: "Total Customers",
      value: regulatory?.totalCustomers ?? 0,
      icon: "👥",
    },
    {
      label: "KYC Compliance",
      value: `${numberValue(
        regulatory?.kycComplianceRate
      ).toFixed(2)}%`,
      icon: "🪪",
    },
    {
      label: "Transactions",
      value:
        regulatory?.totalTransactions ?? 0,
      icon: "💳",
    },
    {
      label: "Fraud Cases",
      value:
        regulatory?.totalFraudCases ?? 0,
      icon: "🚨",
    },
    {
      label: "AML Cases",
      value:
        aml?.totalAmlCases ?? 0,
      icon: "💰",
    },
    {
      label: "Audit Actions",
      value:
        regulatory?.totalAuditLogs ??
        auditStats.total,
      icon: "📋",
    },
    {
      label: "Login Activities",
      value:
        userActivity?.totalLoginActivities ??
        0,
      icon: "👤",
    },
    {
      label: "Access Logs",
      value:
        accessLogs?.totalAccessLogs ??
        0,
      icon: "🔐",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="compliance-audit-dashboard" style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header style={styles.header}>

        <div style={styles.brandArea}>

          <div style={styles.brandIcon}>🛡️</div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Compliance & Audit Management
            </div>
          </div>

        </div>

        <div style={styles.headerActions}>

          <span style={styles.adminBadge}>
            ADMIN COMPLIANCE PANEL
          </span>

          <button
            type="button"
            style={styles.backButton}
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Admin Dashboard
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main style={styles.container}>

        <section style={styles.hero}>

          <div>

            <div style={styles.eyebrow}>
              COMPLIANCE OPERATIONS
            </div>

            <h1 style={styles.title}>
              Compliance & Audit
            </h1>

            <p style={styles.subtitle}>
              Monitor regulatory compliance, audit
              activity, transaction risks, KYC,
              AML and data retention policies.
            </p>

          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={loadComplianceData}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh Data"}
          </button>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>

            <span>{error}</span>

            <button
              type="button"
              style={styles.errorButton}
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            TABS
        ================================================= */}

        <div style={styles.tabsWrapper}>

          <div style={styles.tabs}>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id
                    ? styles.activeTab
                    : {}),
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

          </div>

        </div>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <section>

            <div style={styles.sectionHeading}>
              <div>
                <div style={styles.sectionEyebrow}>
                  MANAGEMENT OVERVIEW
                </div>

                <h2 style={styles.sectionTitle}>
                  Compliance Health
                </h2>
              </div>
            </div>

            <div style={styles.cardGrid}>

              {overviewCards.map((card) => (
                <div
                  key={card.label}
                  style={styles.kpiCard}
                >
                  <div style={styles.kpiIcon}>
                    {card.icon}
                  </div>

                  <div>
                    <div style={styles.kpiLabel}>
                      {card.label}
                    </div>

                    <div style={styles.kpiValue}>
                      {card.value}
                    </div>
                  </div>
                </div>
              ))}

            </div>

            <div style={styles.twoColumnGrid}>

              <div style={styles.panel}>

                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>
                      KYC Status
                    </h3>

                    <p style={styles.panelSubtitle}>
                      Customer KYC compliance
                    </p>
                  </div>

                  <span style={styles.panelIcon}>
                    🪪
                  </span>
                </div>

                <div style={styles.progressRow}>
                  <span>Verified</span>
                  <strong>
                    {kyc?.verifiedKycCustomers ??
                      regulatory?.verifiedKycCustomers ??
                      0}
                  </strong>
                </div>

                <div style={styles.progressRow}>
                  <span>Pending</span>
                  <strong>
                    {kyc?.pendingKycCustomers ??
                      regulatory?.pendingKycCustomers ??
                      0}
                  </strong>
                </div>

                <div style={styles.progressRow}>
                  <span>Rejected</span>
                  <strong>
                    {kyc?.rejectedKycCustomers ??
                      regulatory?.rejectedKycCustomers ??
                      0}
                  </strong>
                </div>

              </div>

              <div style={styles.panel}>

                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>
                      Fraud & AML
                    </h3>

                    <p style={styles.panelSubtitle}>
                      Current compliance risk indicators
                    </p>
                  </div>

                  <span style={styles.panelIcon}>
                    🚨
                  </span>
                </div>

                <div style={styles.progressRow}>
                  <span>Total Fraud Cases</span>
                  <strong>
                    {regulatory?.totalFraudCases ??
                      0}
                  </strong>
                </div>

                <div style={styles.progressRow}>
                  <span>Open Fraud Cases</span>
                  <strong>
                    {regulatory?.openFraudCases ??
                      0}
                  </strong>
                </div>

                <div style={styles.progressRow}>
                  <span>AML Cases</span>
                  <strong>
                    {aml?.totalAmlCases ?? 0}
                  </strong>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            AUDIT LOGS
        ================================================= */}

        {activeTab === "audit" && (
          <ReportSection
            title="Audit Logs"
            eyebrow="AUDIT TRAIL"
            description="Review recorded administrative and system audit activities."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="📋"
                label="Total Logs"
                value={auditStats.total}
              />

              <MetricCard
                icon="✅"
                label="Successful"
                value={auditStats.success}
              />

              <MetricCard
                icon="❌"
                label="Failed"
                value={auditStats.failed}
              />

            </div>

            <DataTable
              columns={[
                "ID",
                "Actor",
                "Action",
                "Module",
                "Method",
                "Path",
                "Status",
                "Created At",
              ]}
              rows={auditLogs.map((log) => [
                log.id,
                log.actorEmail ||
                  log.actorType ||
                  "—",
                formatLabel(log.action),
                formatLabel(log.module),
                log.requestMethod || "—",
                log.requestPath || "—",
                log.status || "—",
                formatDate(log.createdAt),
              ])}
              emptyText="No audit logs available."
            />

          </ReportSection>
        )}

        {/* =================================================
            REGULATORY
        ================================================= */}

        {activeTab === "regulatory" && (
          <ReportSection
            title="RBI / Regulatory Compliance"
            eyebrow="REGULATORY REPORTING"
            description="Compliance indicators consolidated from customer, transaction, fraud, audit and login records."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="👥"
                label="Customers"
                value={
                  regulatory?.totalCustomers ?? 0
                }
              />

              <MetricCard
                icon="🪪"
                label="KYC Compliance"
                value={`${numberValue(
                  regulatory?.kycComplianceRate
                ).toFixed(2)}%`}
              />

              <MetricCard
                icon="💳"
                label="Transactions"
                value={
                  regulatory?.totalTransactions ?? 0
                }
              />

              <MetricCard
                icon="💰"
                label="Transaction Amount"
                value={formatMoney(
                  regulatory?.totalTransactionAmount
                )}
              />

              <MetricCard
                icon="🚨"
                label="Fraud Cases"
                value={
                  regulatory?.totalFraudCases ?? 0
                }
              />

              <MetricCard
                icon="📋"
                label="Audit Logs"
                value={
                  regulatory?.totalAuditLogs ?? 0
                }
              />

              <MetricCard
                icon="🔐"
                label="Login Activities"
                value={
                  regulatory?.totalLoginActivities ??
                  0
                }
              />

            </div>

            <SummaryMap
              title="Compliance Summary"
              data={{
                "Verified KYC":
                  regulatory?.verifiedKycCustomers ??
                  0,
                "Pending KYC":
                  regulatory?.pendingKycCustomers ??
                  0,
                "Rejected KYC":
                  regulatory?.rejectedKycCustomers ??
                  0,
                "Successful Transactions":
                  regulatory?.successfulTransactions ??
                  0,
                "Failed Transactions":
                  regulatory?.failedTransactions ??
                  0,
                "Open Fraud Cases":
                  regulatory?.openFraudCases ?? 0,
                "Resolved Fraud Cases":
                  regulatory?.resolvedFraudCases ??
                  0,
                "High Risk Cases":
                  regulatory?.highRiskCases ?? 0,
                "Critical Risk Cases":
                  regulatory?.criticalRiskCases ?? 0,
              }}
            />

          </ReportSection>
        )}

        {/* =================================================
            AML
        ================================================= */}

        {activeTab === "aml" && (
          <ReportSection
            title="AML Report"
            eyebrow="ANTI-MONEY LAUNDERING"
            description="Monitor money-laundering related fraud alerts and risk indicators."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="💰"
                label="Total AML Cases"
                value={
                  aml?.totalAmlCases ?? 0
                }
              />

              <MetricCard
                icon="🔓"
                label="Open Cases"
                value={
                  aml?.openAmlCases ?? 0
                }
              />

              <MetricCard
                icon="✅"
                label="Resolved Cases"
                value={
                  aml?.resolvedAmlCases ?? 0
                }
              />

              <MetricCard
                icon="🔴"
                label="Critical Cases"
                value={
                  aml?.criticalAmlCases ?? 0
                }
              />

              <MetricCard
                icon="🟠"
                label="High Risk Cases"
                value={
                  aml?.highRiskAmlCases ?? 0
                }
              />

              <MetricCard
                icon="₹"
                label="Suspicious Amount"
                value={formatMoney(
                  aml?.totalSuspiciousAmount
                )}
              />

            </div>

            <SummaryMap
              title="AML Alert Types"
              data={
                aml?.alertTypeSummary || {}
              }
            />

            <DataTable
              columns={[
                "ID",
                "Customer",
                "Alert Type",
                "Risk",
                "Score",
                "Transaction",
                "Status",
                "Detected",
              ]}
              rows={(
                aml?.amlCases || []
              ).map((item) => [
                item.id,
                item.customerName ||
                  item.customerId ||
                  "—",
                formatLabel(item.alertType),
                item.riskLevel || "—",
                item.riskScore ?? "—",
                item.transactionType || "—",
                item.status || "—",
                formatDate(item.detectedAt),
              ])}
              emptyText="No AML cases available."
            />

          </ReportSection>
        )}

        {/* =================================================
            KYC
        ================================================= */}

        {activeTab === "kyc" && (
          <ReportSection
            title="KYC Compliance Report"
            eyebrow="KNOW YOUR CUSTOMER"
            description="Monitor customer KYC verification status and compliance coverage."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="👥"
                label="Total Customers"
                value={
                  kyc?.totalCustomers ?? 0
                }
              />

              <MetricCard
                icon="✅"
                label="Verified"
                value={
                  kyc?.verifiedKycCustomers ?? 0
                }
              />

              <MetricCard
                icon="⏳"
                label="Pending"
                value={
                  kyc?.pendingKycCustomers ?? 0
                }
              />

              <MetricCard
                icon="❌"
                label="Rejected"
                value={
                  kyc?.rejectedKycCustomers ?? 0
                }
              />

              <MetricCard
                icon="📈"
                label="Compliance Rate"
                value={`${numberValue(
                  kyc?.kycComplianceRate
                ).toFixed(2)}%`}
              />

            </div>

            <SummaryMap
              title="KYC Status Summary"
              data={kyc?.kycStatusSummary || {}}
            />

            <DataTable
              columns={[
                "ID",
                "Customer",
                "Email",
                "Phone",
                "Account",
                "KYC Status",
                "Status",
                "Created",
              ]}
              rows={(
                kyc?.customerKycRecords || []
              ).map((item) => [
                item.id,
                item.fullName || "—",
                item.email || "—",
                item.phone || "—",
                item.accountNumber || "—",
                item.kycStatus || "—",
                item.status || "—",
                formatDate(item.createdAt),
              ])}
              emptyText="No KYC records available."
            />

          </ReportSection>
        )}

        {/* =================================================
            TRANSACTION MONITORING
        ================================================= */}

        {activeTab === "transactions" && (
          <ReportSection
            title="Transaction Monitoring"
            eyebrow="TRANSACTION SURVEILLANCE"
            description="Monitor transaction volume, failures, high-value transactions and fraud-linked transactions."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="💳"
                label="Total Transactions"
                value={
                  transactionMonitoring?.totalTransactions ??
                  0
                }
              />

              <MetricCard
                icon="✅"
                label="Successful"
                value={
                  transactionMonitoring?.successfulTransactions ??
                  0
                }
              />

              <MetricCard
                icon="❌"
                label="Failed"
                value={
                  transactionMonitoring?.failedTransactions ??
                  0
                }
              />

              <MetricCard
                icon="₹"
                label="Total Amount"
                value={formatMoney(
                  transactionMonitoring?.totalTransactionAmount
                )}
              />

              <MetricCard
                icon="⚠️"
                label="High Value"
                value={
                  transactionMonitoring?.highValueTransactions ??
                  0
                }
              />

              <MetricCard
                icon="🚨"
                label="Fraud Linked"
                value={
                  transactionMonitoring?.fraudLinkedTransactions ??
                  0
                }
              />

            </div>

            <SummaryMap
              title="Transaction Types"
              data={
                transactionMonitoring?.transactionTypeSummary ||
                {}
              }
            />

            <DataTable
              columns={[
                "ID",
                "Sender",
                "Receiver",
                "Amount",
                "Type",
                "Status",
                "Transaction Date",
              ]}
              rows={(
                transactionMonitoring?.transactionRecords ||
                []
              ).map((item) => [
                item.id,
                item.senderAccountNumber || "—",
                item.receiverAccountNumber || "—",
                formatMoney(item.amount),
                formatLabel(item.transactionType),
                item.status || "—",
                formatDate(item.transactionDate),
              ])}
              emptyText="No transaction monitoring records available."
            />

          </ReportSection>
        )}

        {/* =================================================
            USER ACTIVITY
        ================================================= */}

        {activeTab === "activity" && (
          <ReportSection
            title="User Activity Logs"
            eyebrow="USER ACTIVITY"
            description="Review login activity, customer access patterns and unusual location activity."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="👤"
                label="Login Activities"
                value={
                  userActivity?.totalLoginActivities ??
                  0
                }
              />

              <MetricCard
                icon="👥"
                label="Unique Customers"
                value={
                  userActivity?.uniqueCustomers ??
                  0
                }
              />

              <MetricCard
                icon="🌐"
                label="Unique IPs"
                value={
                  userActivity?.uniqueIpAddresses ??
                  0
                }
              />

              <MetricCard
                icon="⚠️"
                label="Location Activities"
                value={
                  userActivity?.unusualLocationActivities ??
                  0
                }
              />

            </div>

            <SummaryMap
              title="Location Summary"
              data={
                userActivity?.locationSummary || {}
              }
            />

            <DataTable
              columns={[
                "ID",
                "Customer",
                "Email",
                "IP Address",
                "Device",
                "Country",
                "Region",
                "City",
                "Login Time",
              ]}
              rows={(
                userActivity?.activities || []
              ).map((item) => [
                item.id,
                item.customerName ||
                  item.customerId ||
                  "—",
                item.customerEmail || "—",
                item.ipAddress || "—",
                item.userAgent || "—",
                item.country || "—",
                item.region || "—",
                item.city || "—",
                formatDate(item.loginAt),
              ])}
              emptyText="No user activity records available."
            />

          </ReportSection>
        )}

        {/* =================================================
            ACCESS LOGS
        ================================================= */}

        {activeTab === "access" && (
          <ReportSection
            title="Access Logs"
            eyebrow="SYSTEM ACCESS MONITORING"
            description="Monitor administrative access, request paths, HTTP methods and access status."
          >

            <div style={styles.cardGrid}>

              <MetricCard
                icon="🔐"
                label="Total Access Logs"
                value={
                  accessLogs?.totalAccessLogs ??
                  0
                }
              />

              <MetricCard
                icon="✅"
                label="Successful"
                value={
                  accessLogs?.successfulAccesses ??
                  0
                }
              />

              <MetricCard
                icon="❌"
                label="Failed"
                value={
                  accessLogs?.failedAccesses ??
                  0
                }
              />

              <MetricCard
                icon="🌐"
                label="Unique IPs"
                value={
                  accessLogs?.uniqueIpAddresses ??
                  0
                }
              />

            </div>

            <SummaryMap
              title="HTTP Method Summary"
              data={
                accessLogs?.requestMethodSummary ||
                {}
              }
            />

            <SummaryMap
              title="Access Status Summary"
              data={
                accessLogs?.statusSummary || {}
              }
            />

            <DataTable
              columns={[
                "ID",
                "Actor",
                "Action",
                "Module",
                "IP Address",
                "Method",
                "Request Path",
                "Status",
                "Created",
              ]}
              rows={(
                accessLogs?.accessLogs || []
              ).map((item) => [
                item.id,
                item.actorEmail ||
                  item.actorType ||
                  "—",
                formatLabel(item.action),
                formatLabel(item.module),
                item.ipAddress || "—",
                item.requestMethod || "—",
                item.requestPath || "—",
                item.status || "—",
                formatDate(item.createdAt),
              ])}
              emptyText="No access logs available."
            />

          </ReportSection>
        )}

        {/* =================================================
            DATA RETENTION
        ================================================= */}

        {activeTab === "retention" && (
          <ReportSection
            title="Data Retention Policies"
            eyebrow="DATA GOVERNANCE"
            description="Configure retention policies and safely evaluate eligible records through dry-run analysis."
          >

            <div style={styles.twoColumnGrid}>

              {/* CREATE POLICY */}

              <div style={styles.panel}>

                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>
                      Create Retention Policy
                    </h3>

                    <p style={styles.panelSubtitle}>
                      Configure an administrative retention rule.
                    </p>
                  </div>

                  <span style={styles.panelIcon}>
                    🗄️
                  </span>
                </div>

                <form
                  onSubmit={handleRetentionCreate}
                  style={styles.form}
                >

                  <label style={styles.label}>
                    Policy Name
                  </label>

                  <input
                    style={styles.input}
                    type="text"
                    value={
                      retentionForm.policyName
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        policyName:
                          event.target.value,
                      })
                    }
                    placeholder="Audit Log Retention Policy"
                    required
                  />

                  <label style={styles.label}>
                    Data Type
                  </label>

                  <select
                    style={styles.input}
                    value={
                      retentionForm.dataType
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        dataType:
                          event.target.value,
                      })
                    }
                  >
                    <option value="AUDIT_LOG">
                      Audit Logs
                    </option>
                  </select>

                  <label style={styles.label}>
                    Retention Days
                  </label>

                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    value={
                      retentionForm.retentionDays
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        retentionDays:
                          event.target.value,
                      })
                    }
                    required
                  />

                  <label style={styles.label}>
                    Retention Action
                  </label>

                  <select
                    style={styles.input}
                    value={
                      retentionForm.retentionAction
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        retentionAction:
                          event.target.value,
                      })
                    }
                  >
                    <option value="ARCHIVE">
                      Archive
                    </option>

                    <option value="DELETE">
                      Delete
                    </option>
                  </select>

                  <label style={styles.label}>
                    Status
                  </label>

                  <select
                    style={styles.input}
                    value={
                      retentionForm.status
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        status:
                          event.target.value,
                      })
                    }
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>

                  <label style={styles.label}>
                    Description
                  </label>

                  <textarea
                    style={{
                      ...styles.input,
                      minHeight: "90px",
                      resize: "vertical",
                    }}
                    value={
                      retentionForm.description
                    }
                    onChange={(event) =>
                      setRetentionForm({
                        ...retentionForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Describe the purpose of this retention policy."
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={retentionSaving}
                  >
                    {retentionSaving
                      ? "Saving..."
                      : "Create Policy"}
                  </button>

                </form>

              </div>

              {/* DRY RUN */}

              <div style={styles.panel}>

                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>
                      Retention Dry Run
                    </h3>

                    <p style={styles.panelSubtitle}>
                      Check eligible records without deleting anything.
                    </p>
                  </div>

                  <span style={styles.panelIcon}>
                    🔍
                  </span>
                </div>

                <div style={styles.form}>

                  <label style={styles.label}>
                    Data Type
                  </label>

                  <select
                    style={styles.input}
                    value={
                      dryRunForm.dataType
                    }
                    onChange={(event) =>
                      setDryRunForm({
                        ...dryRunForm,
                        dataType:
                          event.target.value,
                      })
                    }
                  >
                    <option value="AUDIT_LOG">
                      Audit Logs
                    </option>
                  </select>

                  <label style={styles.label}>
                    Retention Days
                  </label>

                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    value={
                      dryRunForm.retentionDays
                    }
                    onChange={(event) =>
                      setDryRunForm({
                        ...dryRunForm,
                        retentionDays:
                          event.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={handleDryRun}
                    disabled={retentionSaving}
                  >
                    {retentionSaving
                      ? "Checking..."
                      : "Run Dry Run"}
                  </button>

                </div>

                {dryRunResult && (
                  <div style={styles.dryRunBox}>

                    <div style={styles.dryRunTitle}>
                      Dry Run Result
                    </div>

                    <div style={styles.progressRow}>
                      <span>Data Type</span>
                      <strong>
                        {formatLabel(
                          dryRunResult.dataType
                        )}
                      </strong>
                    </div>

                    <div style={styles.progressRow}>
                      <span>Retention Days</span>
                      <strong>
                        {dryRunResult.retentionDays}
                      </strong>
                    </div>

                    <div style={styles.progressRow}>
                      <span>Eligible Records</span>
                      <strong>
                        {dryRunResult.eligibleRecords ??
                          0}
                      </strong>
                    </div>

                    <div style={styles.safeNotice}>
                      ✓ No records were deleted or
                      modified.
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* POLICY TABLE */}

            <div style={styles.panel}>

              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>
                    Configured Policies
                  </h3>

                  <p style={styles.panelSubtitle}>
                    Current data retention configuration.
                  </p>
                </div>

                <span style={styles.policyCount}>
                  {retentionPolicies.length} policies
                </span>
              </div>

              <DataTable
                columns={[
                  "ID",
                  "Policy Name",
                  "Data Type",
                  "Retention",
                  "Action",
                  "Status",
                  "Created",
                ]}
                rows={retentionPolicies.map(
                  (policy) => [
                    policy.id,
                    policy.policyName || "—",
                    formatLabel(
                      policy.dataType
                    ),
                    `${policy.retentionDays ?? 0} days`,
                    formatLabel(
                      policy.retentionAction
                    ),
                    policy.status || "—",
                    formatDate(
                      policy.createdAt
                    ),
                  ]
                )}
                emptyText="No retention policies configured."
              />

            </div>

          </ReportSection>
        )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer style={styles.footer}>
        <span>
          AVANI BANK • Compliance & Audit
        </span>

        <span>
          Secure • Monitored • Auditable
        </span>
      </footer>

    </div>
  );
}

// =========================================================
// REPORT SECTION
// =========================================================

function ReportSection({
  title,
  eyebrow,
  description,
  children,
}) {
  return (
    <section>

      <div style={styles.sectionHeading}>

        <div>

          <div style={styles.sectionEyebrow}>
            {eyebrow}
          </div>

          <h2 style={styles.sectionTitle}>
            {title}
          </h2>

          <p style={styles.sectionDescription}>
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

// =========================================================
// METRIC CARD
// =========================================================

function MetricCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.kpiCard}>

      <div style={styles.kpiIcon}>
        {icon}
      </div>

      <div>

        <div style={styles.kpiLabel}>
          {label}
        </div>

        <div style={styles.kpiValue}>
          {value}
        </div>

      </div>

    </div>
  );
}

// =========================================================
// SUMMARY MAP
// =========================================================

function SummaryMap({
  title,
  data,
}) {
  const entries =
    data && typeof data === "object"
      ? Object.entries(data)
      : [];

  return (
    <div style={styles.panel}>

      <div style={styles.panelHeader}>

        <div>
          <h3 style={styles.panelTitle}>
            {title}
          </h3>

          <p style={styles.panelSubtitle}>
            Summary generated from backend data.
          </p>
        </div>

        <span style={styles.panelIcon}>
          📊
        </span>

      </div>

      {entries.length === 0 ? (
        <div style={styles.emptyState}>
          No summary data available.
        </div>
      ) : (
        <div style={styles.summaryGrid}>

          {entries.map(([key, value]) => (
            <div
              key={key}
              style={styles.summaryItem}
            >
              <span>
                {formatSummaryLabel(key)}
              </span>

              <strong>
                {value}
              </strong>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

// =========================================================
// SUMMARY LABEL
// =========================================================

function formatSummaryLabel(value) {
  return String(value || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

// =========================================================
// DATA TABLE
// =========================================================

function DataTable({
  columns,
  rows,
  emptyText,
}) {
  return (
    <div style={styles.tableWrapper}>

      {rows.length === 0 ? (
        <div style={styles.emptyState}>
          {emptyText}
        </div>
      ) : (
        <div style={styles.tableScroll}>

          <table style={styles.table}>

            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    style={styles.th}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>

                  {row.map(
                    (cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={styles.td}
                      >
                        {cell ?? "—"}
                      </td>
                    )
                  )}

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, Arial, sans-serif",
    padding: "25px 32px",
  },

  header: {
    //height:"100px",
    background:"linear-gradient(135deg, #0b2f7a 0%, #1769e0 100%)",
    borderRadius:"18px",
    color: "#ffffff",
    padding: "18px 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 8px 30px rgba(18, 65, 145, 0.18)",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  brandIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    background:
      "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  brandName: {
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  brandSubtitle: {
    fontSize: "12px",
    opacity: 0.82,
    marginTop: "3px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  adminBadge: {
    padding: "8px 12px",
    borderRadius: "20px",
    background:
      "rgba(255,255,255,0.14)",
    border:
      "1px solid rgba(255,255,255,0.24)",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.3)",
    background: "#ffffff",
    color: "#171cb5",
    borderRadius: "9px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    width: "92%",
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "34px 0 60px",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "25px",
    marginBottom: "26px",
  },

  eyebrow: {
    color: "#2463d4",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.3px",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.15,
    color: "#12244d",
  },

  subtitle: {
    margin:
      "10px 0 0",
    color: "#6d7890",
    fontSize: "14px",
    lineHeight: 1.6,
    maxWidth: "760px",
  },

  refreshButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #1769e0, #2457c6)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
    boxShadow:
      "0 8px 18px rgba(36,87,198,0.18)",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    borderRadius: "12px",
    fontSize: "13px",
  },

  errorButton: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#be123c",
    fontSize: "20px",
    cursor: "pointer",
  },

  tabsWrapper: {
    background: "#ffffff",
    borderRadius: "15px",
    padding: "8px",
    marginBottom: "28px",
    boxShadow:
      "0 8px 30px rgba(31,55,100,0.06)",
    border: "1px solid #e8edf5",
    overflowX: "auto",
  },

  tabs: {
    display: "flex",
    gap: "6px",
    minWidth: "max-content",
  },

  tab: {
    border: "none",
    background: "transparent",
    color: "#68758c",
    padding: "11px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "650",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },

  activeTab: {
    background:
      "linear-gradient(135deg, #1769e0, #2457c6)",
    color: "#ffffff",
    boxShadow:
      "0 7px 16px rgba(36,87,198,0.18)",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
  },

  sectionEyebrow: {
    color: "#2463d4",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.1px",
    marginBottom: "5px",
  },

  sectionTitle: {
    margin: 0,
    color: "#17294f",
    fontSize: "24px",
  },

  sectionDescription: {
    margin:
      "8px 0 0",
    color: "#78849a",
    fontSize: "13px",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  kpiCard: {
  background: "#ffffff",
  border: "1px solid #e8edf5",
  borderRadius: "15px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minHeight: "88px",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "hidden",
  boxShadow:
    "0 7px 25px rgba(31,55,100,0.05)",
},

  kpiIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#edf4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  kpiLabel: {
    color: "#7a879d",
    fontSize: "11px",
    fontWeight: "650",
    marginBottom: "5px",
  },

  kpiValue: {
  color: "#17294f",
  fontSize: "20px",
  fontWeight: "800",
  lineHeight: "1.15",
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
},

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e8edf5",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow:
      "0 7px 25px rgba(31,55,100,0.045)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "18px",
  },

  panelTitle: {
    margin: 0,
    color: "#17294f",
    fontSize: "16px",
  },

  panelSubtitle: {
    margin:
      "5px 0 0",
    color: "#8792a5",
    fontSize: "12px",
  },

  panelIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#edf4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  policyCount: {
    background: "#edf4ff",
    color: "#2457c6",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding:
      "11px 0",
    borderBottom:
      "1px solid #edf0f5",
    color: "#657188",
    fontSize: "13px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },

  summaryItem: {
    background: "#f7f9fd",
    border: "1px solid #edf1f7",
    borderRadius: "11px",
    padding: "13px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#66738a",
    fontSize: "12px",
  },

  tableWrapper: {
    background: "#ffffff",
    border: "1px solid #e8edf5",
    borderRadius: "16px",
    marginBottom: "20px",
    overflow: "hidden",
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    background: "#f6f8fc",
    color: "#65728a",
    fontSize: "11px",
    fontWeight: "800",
    padding: "13px 14px",
    borderBottom:
      "1px solid #e5eaf2",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 14px",
    borderBottom:
      "1px solid #edf0f5",
    color: "#45536b",
    fontSize: "12px",
    verticalAlign: "top",
  },

  emptyState: {
    padding: "35px",
    textAlign: "center",
    color: "#8792a5",
    fontSize: "13px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#56647c",
    fontSize: "12px",
    fontWeight: "700",
    marginTop: "6px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #dce3ee",
    background: "#ffffff",
    color: "#25334e",
    borderRadius: "9px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "13px",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #1769e0, #2457c6)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px",
  },

  secondaryButton: {
    border:
      "1px solid #2457c6",
    background: "#edf4ff",
    color: "#2457c6",
    borderRadius: "9px",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px",
  },

  dryRunBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f7faff",
    border:
      "1px solid #dce8ff",
  },

  dryRunTitle: {
    color: "#173b8c",
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "5px",
  },

  safeNotice: {
    marginTop: "13px",
    padding: "10px",
    borderRadius: "8px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "650",
  },

  footer: {
    borderTop:
      "1px solid #e5eaf2",
    background: "#ffffff",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#8792a5",
    fontSize: "11px",
    flexWrap: "wrap",
  },
};


export const complianceAuditResponsiveStyles = `
.compliance-audit-dashboard {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.compliance-audit-dashboard * {
  box-sizing: border-box;
}

@media (max-width: 1000px) {
  .compliance-audit-dashboard {
    padding: 18px 20px !important;
  }

  .compliance-audit-dashboard header {
    flex-wrap: wrap !important;
    align-items: center !important;
  }

  .compliance-audit-dashboard .headerActions {
    margin-left: auto;
  }

  .compliance-audit-dashboard .hero {
    align-items: stretch !important;
  }

  .compliance-audit-dashboard .cardGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .compliance-audit-dashboard .twoColumnGrid {
    grid-template-columns: 1fr !important;
  }

  .compliance-audit-dashboard .summaryGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .compliance-audit-dashboard .tableScroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 700px) {
  .compliance-audit-dashboard {
    padding: 12px !important;
  }

  .compliance-audit-dashboard header {
    padding: 16px !important;
    border-radius: 14px !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 14px !important;
  }

  .compliance-audit-dashboard .brandArea {
    width: 100%;
  }

  .compliance-audit-dashboard .brandSubtitle {
    line-height: 1.4;
  }

  .compliance-audit-dashboard .headerActions {
    width: 100%;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }

  .compliance-audit-dashboard .adminBadge,
  .compliance-audit-dashboard .backButton {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .compliance-audit-dashboard .container {
    width: 100% !important;
    padding: 22px 0 35px !important;
  }

  .compliance-audit-dashboard .hero {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 15px !important;
    margin-bottom: 20px !important;
  }

  .compliance-audit-dashboard .title {
    font-size: 26px !important;
  }

  .compliance-audit-dashboard .subtitle {
    font-size: 13px !important;
  }

  .compliance-audit-dashboard .refreshButton {
    width: 100% !important;
  }

  .compliance-audit-dashboard .tabsWrapper {
    margin-bottom: 20px !important;
    border-radius: 12px !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  .compliance-audit-dashboard .tabs {
    min-width: max-content !important;
  }

  .compliance-audit-dashboard .tab {
    padding: 10px 12px !important;
  }

  .compliance-audit-dashboard .cardGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .compliance-audit-dashboard .kpiCard {
    padding: 14px !important;
    min-height: 78px !important;
  }

  .compliance-audit-dashboard .kpiIcon {
    width: 40px !important;
    height: 40px !important;
    font-size: 18px !important;
  }

  .compliance-audit-dashboard .kpiValue {
    font-size: 17px !important;
  }

  .compliance-audit-dashboard .sectionTitle {
    font-size: 21px !important;
  }

  .compliance-audit-dashboard .sectionDescription {
    line-height: 1.5;
  }

  .compliance-audit-dashboard .panel {
    padding: 16px !important;
    border-radius: 13px !important;
  }

  .compliance-audit-dashboard .panelHeader {
    align-items: flex-start !important;
  }

  .compliance-audit-dashboard .summaryGrid {
    grid-template-columns: 1fr !important;
  }

  .compliance-audit-dashboard .tableWrapper,
  .compliance-audit-dashboard .tableScroll {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  .compliance-audit-dashboard .table {
    min-width: 850px !important;
  }

  .compliance-audit-dashboard .input {
    width: 100% !important;
    min-height: 42px;
  }

  .compliance-audit-dashboard .primaryButton,
  .compliance-audit-dashboard .secondaryButton {
    width: 100% !important;
    min-height: 44px;
  }

  .compliance-audit-dashboard .dryRunBox {
    padding: 13px !important;
  }

  .compliance-audit-dashboard footer {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 16px 4% !important;
  }
}

@media (max-width: 480px) {
  .compliance-audit-dashboard {
    padding: 8px !important;
  }

  .compliance-audit-dashboard header {
    padding: 13px !important;
    border-radius: 12px !important;
  }

  .compliance-audit-dashboard .brandIcon {
    width: 40px !important;
    height: 40px !important;
  }

  .compliance-audit-dashboard .brandName {
    font-size: 16px !important;
  }

  .compliance-audit-dashboard .brandSubtitle {
    font-size: 10px !important;
  }

  .compliance-audit-dashboard .container {
    padding-top: 18px !important;
  }

  .compliance-audit-dashboard .title {
    font-size: 23px !important;
  }

  .compliance-audit-dashboard .eyebrow {
    font-size: 10px !important;
  }

  .compliance-audit-dashboard .cardGrid {
    grid-template-columns: 1fr !important;
  }

  .compliance-audit-dashboard .kpiCard {
    min-height: 72px !important;
  }

  .compliance-audit-dashboard .sectionTitle {
    font-size: 19px !important;
  }

  .compliance-audit-dashboard .panel {
    padding: 13px !important;
  }

  .compliance-audit-dashboard .panelHeader {
    gap: 10px !important;
  }

  .compliance-audit-dashboard .panelIcon {
    width: 34px !important;
    height: 34px !important;
    font-size: 16px !important;
  }

  .compliance-audit-dashboard .progressRow {
    gap: 10px !important;
    align-items: flex-start !important;
  }

  .compliance-audit-dashboard .table {
    min-width: 780px !important;
  }

  .compliance-audit-dashboard .th,
  .compliance-audit-dashboard .td {
    padding: 10px !important;
  }

  .compliance-audit-dashboard footer {
    font-size: 10px !important;
  }
}
`;

export default ComplianceAuditDashboard;