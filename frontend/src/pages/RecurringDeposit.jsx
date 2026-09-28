import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const RecurringDeposit = () => {
    const navigate = useNavigate();

    const [rds, setRds] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        accountId: "",
        monthlyInstallment: "",
        interestRate: "",
        tenureMonths: ""
    });

    const token = localStorage.getItem("token");

    // =====================================================
    // GET MY RDS
    // =====================================================

    const fetchRDs = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/recurring-deposits`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch recurring deposits"
                );
            }

            const data = await response.json();

            setRds(data);

        } catch (error) {
            console.error("RD FETCH ERROR:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // GET ACCOUNTS
    // =====================================================

    const fetchAccounts = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/accounts`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch accounts"
                );
            }

            const data = await response.json();

            setAccounts(data);

        } catch (error) {
            console.error("ACCOUNT FETCH ERROR:", error);
            alert(error.message);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        if (!token) {
            alert("Please login again");
            return;
        }

        fetchRDs();
        fetchAccounts();
    }, []);

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // =====================================================
    // CREATE RD
    // =====================================================

    const createRD = async (e) => {
        e.preventDefault();

        if (!form.accountId) {
            alert("Please select an account");
            return;
        }

        if (
            !form.monthlyInstallment ||
            Number(form.monthlyInstallment) <= 0
        ) {
            alert("Enter a valid monthly installment");
            return;
        }

        if (
            !form.interestRate ||
            Number(form.interestRate) < 0
        ) {
            alert("Enter a valid interest rate");
            return;
        }

        if (
            !form.tenureMonths ||
            Number(form.tenureMonths) <= 0
        ) {
            alert("Enter a valid tenure");
            return;
        }

        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.append(
                "accountId",
                form.accountId
            );

            params.append(
                "monthlyInstallment",
                form.monthlyInstallment
            );

            params.append(
                "interestRate",
                form.interestRate
            );

            params.append(
                "tenureMonths",
                form.tenureMonths
            );

            const response = await fetch(
                `${API_BASE_URL}/api/recurring-deposits?${params.toString()}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to create recurring deposit"
                );
            }

            alert(
                "Recurring Deposit created successfully!"
            );

            setForm({
                accountId: "",
                monthlyInstallment: "",
                interestRate: "",
                tenureMonths: ""
            });

            setShowCreate(false);

            await fetchRDs();
            await fetchAccounts();

        } catch (error) {
            console.error(
                "CREATE RD ERROR:",
                error
            );

            alert(error.message);

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CLOSE RD
    // =====================================================

    const closeRD = async (rdId) => {
        const confirmed = window.confirm(
            "Are you sure you want to close this Recurring Deposit?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/recurring-deposits/${rdId}/close`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to close RD"
                );
            }

            alert(
                "Recurring Deposit closed successfully!"
            );

            await fetchRDs();

        } catch (error) {
            console.error(
                "CLOSE RD ERROR:",
                error
            );

            alert(error.message);

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = (amount) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(amount || 0);
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div style={styles.page}>

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div style={styles.headerLeft}>

                    <div style={styles.bankIcon}>
                        🏦
                    </div>

                    <div>
                        <div style={styles.bankName}>
                            AVANI BANK
                        </div>

                        <div style={styles.headerSubtitle}>
                            Account Details
                        </div>
                    </div>

                </div>

                <button
                    type="button"
                    style={styles.backButton}
                    onClick={() => navigate("/accounts")}
                >
                    <span style={styles.backArrow}>
                        ←
                    </span>

                    Back to Accounts
                </button>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main style={styles.main}>

                {/* =================================================
                    PAGE INTRO
                ================================================= */}

                <section style={styles.heroSection}>

                    <div>

                        <div style={styles.eyebrow}>
                            SAVINGS & INVESTMENT
                        </div>

                        <h1 style={styles.pageTitle}>
                            Recurring Deposit
                        </h1>

                        <p style={styles.pageSubtitle}>
                            Save a fixed amount every month
                            and grow your money securely.
                        </p>

                    </div>

                    <button
                        type="button"
                        style={styles.createButton}
                        onClick={() =>
                            setShowCreate(true)
                        }
                    >
                        <span style={styles.plusIcon}>
                            +
                        </span>

                        Create RD
                    </button>

                </section>


                {/* =================================================
                    INFO CARDS
                ================================================= */}

                <section style={styles.infoGrid}>

                    <div style={styles.infoCard}>

                        <div style={styles.infoIcon}>
                            💰
                        </div>

                        <div>
                            <span style={styles.infoLabel}>
                                Monthly Saving
                            </span>

                            <strong style={styles.infoValue}>
                                Fixed Installment
                            </strong>
                        </div>

                    </div>


                    <div style={styles.infoCard}>

                        <div style={styles.infoIcon}>
                            📈
                        </div>

                        <div>
                            <span style={styles.infoLabel}>
                                Interest
                            </span>

                            <strong style={styles.infoValue}>
                                Competitive Returns
                            </strong>
                        </div>

                    </div>


                    <div style={styles.infoCard}>

                        <div style={styles.infoIcon}>
                            🔒
                        </div>

                        <div>
                            <span style={styles.infoLabel}>
                                Security
                            </span>

                            <strong style={styles.infoValue}>
                                Secure Banking
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    CREATE RD MODAL
                ================================================= */}

                {showCreate && (

                    <div style={styles.overlay}>

                        <div style={styles.modal}>

                            {/* MODAL HEADER */}

                            <div style={styles.modalHeader}>

                                <div>

                                    <div style={styles.modalEyebrow}>
                                        NEW INVESTMENT
                                    </div>

                                    <h2 style={styles.modalTitle}>
                                        Create Recurring Deposit
                                    </h2>

                                    <p style={styles.modalSubtitle}>
                                        Set up your monthly savings plan.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    style={styles.closeButton}
                                    onClick={() =>
                                        setShowCreate(false)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* FORM */}

                            <form onSubmit={createRD}>

                                {/* ACCOUNT */}

                                <div style={styles.formGroup}>

                                    <label style={styles.label}>
                                        Debit Account
                                    </label>

                                    <select
                                        name="accountId"
                                        value={form.accountId}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    >

                                        <option value="">
                                            Select Account
                                        </option>

                                        {accounts.map(
                                            (account) => (

                                                <option
                                                    key={account.id}
                                                    value={account.id}
                                                >
                                                    {account.accountNumber}
                                                    {" - "}
                                                    {formatMoney(
                                                        account.balance
                                                    )}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* MONTHLY INSTALLMENT */}

                                <div style={styles.formGroup}>

                                    <label style={styles.label}>
                                        Monthly Installment
                                    </label>

                                    <div style={styles.inputWrapper}>

                                        <span style={styles.inputPrefix}>
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            name="monthlyInstallment"
                                            placeholder="Enter monthly amount"
                                            value={
                                                form.monthlyInstallment
                                            }
                                            onChange={handleChange}
                                            style={
                                                styles.inputWithPrefix
                                            }
                                            min="1"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* INTEREST RATE */}

                                <div style={styles.formGroup}>

                                    <label style={styles.label}>
                                        Interest Rate
                                    </label>

                                    <div style={styles.inputWrapper}>

                                        <input
                                            type="number"
                                            name="interestRate"
                                            placeholder="Enter interest rate"
                                            value={
                                                form.interestRate
                                            }
                                            onChange={handleChange}
                                            style={
                                                styles.inputWithSuffix
                                            }
                                            min="0"
                                            step="0.01"
                                            required
                                        />

                                        <span style={styles.inputSuffix}>
                                            % p.a.
                                        </span>

                                    </div>

                                </div>


                                {/* TENURE */}

                                <div style={styles.formGroup}>

                                    <label style={styles.label}>
                                        Tenure
                                    </label>

                                    <div style={styles.inputWrapper}>

                                        <input
                                            type="number"
                                            name="tenureMonths"
                                            placeholder="Enter tenure"
                                            value={
                                                form.tenureMonths
                                            }
                                            onChange={handleChange}
                                            style={
                                                styles.inputWithSuffix
                                            }
                                            min="1"
                                            required
                                        />

                                        <span style={styles.inputSuffix}>
                                            Months
                                        </span>

                                    </div>

                                </div>


                                {/* FORM ACTIONS */}

                                <div style={styles.formButtons}>

                                    <button
                                        type="button"
                                        style={styles.cancelButton}
                                        onClick={() =>
                                            setShowCreate(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        style={{
                                            ...styles.submitButton,
                                            ...(loading
                                                ? styles.disabledButton
                                                : {})
                                        }}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Creating..."
                                            : "Create Recurring Deposit"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* =================================================
                    RD LIST
                ================================================= */}

                <section style={styles.listSection}>

                    <div style={styles.sectionHeader}>

                        <div>

                            <div style={styles.sectionEyebrow}>
                                YOUR INVESTMENTS
                            </div>

                            <h2 style={styles.sectionTitle}>
                                My Recurring Deposits
                            </h2>

                        </div>

                        <span style={styles.rdCount}>
                            {rds.length} RD
                            {rds.length !== 1 ? "s" : ""}
                        </span>

                    </div>


                    {/* LOADING */}

                    {loading && rds.length === 0 ? (

                        <div style={styles.empty}>
                            <div style={styles.loadingIcon}>
                                ⏳
                            </div>

                            <h3 style={styles.emptyTitle}>
                                Loading recurring deposits...
                            </h3>

                            <p style={styles.emptyText}>
                                Please wait while we fetch
                                your investment details.
                            </p>
                        </div>

                    ) : rds.length === 0 ? (

                        /* EMPTY */

                        <div style={styles.empty}>

                            <div style={styles.emptyIcon}>
                                💰
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No Recurring Deposit
                            </h3>

                            <p style={styles.emptyText}>
                                Start saving monthly to
                                build your future.
                            </p>

                            <button
                                type="button"
                                style={styles.emptyCreateButton}
                                onClick={() =>
                                    setShowCreate(true)
                                }
                            >
                                Create Your First RD
                            </button>

                        </div>

                    ) : (

                        /* RD CARDS */

                        <div style={styles.cardsContainer}>

                            {rds.map((rd) => (

                                <div
                                    key={rd.id}
                                    style={styles.card}
                                >

                                    {/* CARD TOP */}

                                    <div style={styles.cardHeader}>

                                        <div
                                            style={
                                                styles.cardHeaderLeft
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.rdIcon
                                                }
                                            >
                                                💰
                                            </div>

                                            <div>

                                                <h3
                                                    style={
                                                        styles.cardTitle
                                                    }
                                                >
                                                    Recurring Deposit
                                                    {" #"}
                                                    {rd.id}
                                                </h3>

                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...(rd.status ===
                                                        "ACTIVE"
                                                            ? styles.active
                                                            : rd.status ===
                                                              "MATURED"
                                                            ? styles.matured
                                                            : styles.closed)
                                                    }}
                                                >
                                                    {rd.status}
                                                </span>

                                            </div>

                                        </div>


                                        {rd.status ===
                                            "ACTIVE" && (

                                            <button
                                                type="button"
                                                style={
                                                    styles.closeRDButton
                                                }
                                                onClick={() =>
                                                    closeRD(
                                                        rd.id
                                                    )
                                                }
                                            >
                                                Close RD
                                            </button>

                                        )}

                                    </div>


                                    {/* ACCOUNT */}

                                    <div style={styles.accountInfo}>

                                        <span>
                                            Debit Account
                                        </span>

                                        <strong>
                                            {rd.account?.accountNumber ||
                                                "-"}
                                        </strong>

                                    </div>


                                    {/* DETAILS */}

                                    <div
                                        style={
                                            styles.detailsGrid
                                        }
                                    >

                                        <div
                                            style={
                                                styles.detailBox
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Monthly Installment
                                            </span>

                                            <strong
                                                style={
                                                    styles.detailValue
                                                }
                                            >
                                                {formatMoney(
                                                    rd.monthlyInstallment
                                                )}
                                            </strong>

                                        </div>


                                        <div
                                            style={
                                                styles.detailBox
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Interest Rate
                                            </span>

                                            <strong
                                                style={
                                                    styles.detailValue
                                                }
                                            >
                                                {rd.interestRate}%
                                            </strong>

                                        </div>


                                        <div
                                            style={
                                                styles.detailBox
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Tenure
                                            </span>

                                            <strong
                                                style={
                                                    styles.detailValue
                                                }
                                            >
                                                {rd.tenureMonths}
                                                {" Months"}
                                            </strong>

                                        </div>


                                        <div
                                            style={
                                                styles.detailBox
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Installments Paid
                                            </span>

                                            <strong
                                                style={
                                                    styles.detailValue
                                                }
                                            >
                                                {rd.installmentsPaid}
                                                {" / "}
                                                {rd.tenureMonths}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* PROGRESS */}

                                    <div
                                        style={
                                            styles.progressSection
                                        }
                                    >

                                        <div
                                            style={
                                                styles.progressTop
                                            }
                                        >

                                            <span>
                                                Saving Progress
                                            </span>

                                            <strong>
                                                {Math.min(
                                                    100,
                                                    Math.round(
                                                        (
                                                            rd.installmentsPaid /
                                                            rd.tenureMonths
                                                        ) * 100
                                                    )
                                                )}
                                                %
                                            </strong>

                                        </div>


                                        <div
                                            style={
                                                styles.progressBackground
                                            }
                                        >

                                            <div
                                                style={{
                                                    ...styles.progressBar,
                                                    width: `${Math.min(
                                                        100,
                                                        (
                                                            rd.installmentsPaid /
                                                            rd.tenureMonths
                                                        ) * 100
                                                    )}%`
                                                }}
                                            />

                                        </div>

                                    </div>


                                    {/* AMOUNTS */}

                                    <div
                                        style={
                                            styles.amountSection
                                        }
                                    >

                                        <div>

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Total Deposited
                                            </span>

                                            <strong
                                                style={
                                                    styles.amount
                                                }
                                            >
                                                {formatMoney(
                                                    rd.totalDeposited
                                                )}
                                            </strong>

                                        </div>


                                        <div
                                            style={
                                                styles.amountRight
                                            }
                                        >

                                            <span
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                Expected Maturity
                                            </span>

                                            <strong
                                                style={
                                                    styles.maturity
                                                }
                                            >
                                                {formatMoney(
                                                    rd.maturityAmount
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* DATES */}

                                    <div
                                        style={
                                            styles.dateSection
                                        }
                                    >

                                        <div>
                                            <span>
                                                Started
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    rd.createdAt
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Next Installment
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    rd.nextInstallmentDate
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Maturity
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    rd.maturityDate
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer style={styles.footer}>

                <span>
                    © 2026 Avani Bank
                </span>

                <span>
                    Secure Banking • Privacy • Terms
                </span>

            </footer>

        </div>
    );
};


// =====================================================
// STYLES
// =====================================================

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif",
        color: "#172033"
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
        minHeight: "92px",
        width: "100%",
        boxSizing: "border-box",
        padding: "18px 42px",
        background:
            "linear-gradient(135deg, #173b8f 0%, #245dcc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        boxShadow:
            "0 4px 18px rgba(24, 58, 135, 0.18)"
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "13px"
    },

    bankIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.24)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "23px",
        boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)"
    },

    bankName: {
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        lineHeight: "1.2"
    },

    headerSubtitle: {
        marginTop: "5px",
        color: "rgba(255,255,255,0.78)",
        fontSize: "11px",
        fontWeight: "500"
    },

    backButton: {
        border:
            "1px solid rgba(255,255,255,0.30)",
        background:
            "rgba(255,255,255,0.12)",
        color: "#ffffff",
        padding: "10px 16px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        transition: "all 0.2s ease"
    },

    backArrow: {
        fontSize: "16px",
        lineHeight: "1"
    },

    // =================================================
    // MAIN
    // =================================================

    main: {
        width: "100%",
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "32px 28px 45px",
        boxSizing: "border-box"
    },

    heroSection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "25px",
        marginBottom: "25px"
    },

    eyebrow: {
        color: "#64748b",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.7px",
        marginBottom: "7px"
    },

    pageTitle: {
        margin: 0,
        color: "#15213a",
        fontSize: "30px",
        lineHeight: "1.2",
        fontWeight: "800",
        letterSpacing: "-0.6px"
    },

    pageSubtitle: {
        margin: "8px 0 0",
        color: "#71809a",
        fontSize: "13px",
        lineHeight: "1.5"
    },

    createButton: {
        border: "none",
        background:
            "linear-gradient(135deg, #1f56c4, #286bdc)",
        color: "#ffffff",
        padding: "13px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "800",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow:
            "0 7px 18px rgba(37,99,235,0.20)",
        whiteSpace: "nowrap"
    },

    plusIcon: {
        fontSize: "19px",
        lineHeight: "1"
    },

    // =================================================
    // INFO CARDS
    // =================================================

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "15px",
        marginBottom: "32px"
    },

    infoCard: {
        background: "#ffffff",
        border: "1px solid #e7ebf2",
        borderRadius: "13px",
        padding: "17px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow:
            "0 4px 15px rgba(20,35,70,0.04)"
    },

    infoIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px"
    },

    infoLabel: {
        display: "block",
        color: "#7a879c",
        fontSize: "10px",
        fontWeight: "600",
        marginBottom: "4px"
    },

    infoValue: {
        color: "#1d2a42",
        fontSize: "13px",
        fontWeight: "750"
    },

    // =================================================
    // LIST
    // =================================================

    listSection: {
        marginTop: "5px"
    },

    sectionHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "15px"
    },

    sectionEyebrow: {
        color: "#71809a",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "5px"
    },

    sectionTitle: {
        margin: 0,
        color: "#18243b",
        fontSize: "20px",
        fontWeight: "800"
    },

    rdCount: {
        color: "#2457c6",
        background: "#eef4ff",
        border: "1px solid #dce8ff",
        padding: "7px 11px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "800"
    },

    cardsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "17px"
    },

    // =================================================
    // RD CARD
    // =================================================

    card: {
        width: "100%",
        boxSizing: "border-box",
        padding: "22px",
        background: "#ffffff",
        border: "1px solid #e5e9f0",
        borderRadius: "16px",
        boxShadow:
            "0 6px 22px rgba(20,35,70,0.055)"
    },

    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "17px"
    },

    cardHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    rdIcon: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px"
    },

    cardTitle: {
        margin: "0 0 7px",
        color: "#17233a",
        fontSize: "16px",
        fontWeight: "800"
    },

    status: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "20px",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.5px"
    },

    active: {
        background: "#dcfce7",
        color: "#15803d"
    },

    matured: {
        background: "#dbeafe",
        color: "#1d4ed8"
    },

    closed: {
        background: "#f1f5f9",
        color: "#64748b"
    },

    closeRDButton: {
        border: "1px solid #fecaca",
        background: "#fff7f7",
        color: "#dc2626",
        padding: "9px 13px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "750"
    },

    accountInfo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 13px",
        background: "#f8fafc",
        borderRadius: "9px",
        marginBottom: "15px",
        fontSize: "11px"
    },

    // =================================================
    // DETAILS
    // =================================================

    detailsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "11px",
        marginBottom: "20px"
    },

    detailBox: {
        background: "#f8fafc",
        border: "1px solid #edf0f5",
        borderRadius: "10px",
        padding: "13px"
    },

    detailLabel: {
        display: "block",
        color: "#758198",
        fontSize: "10px",
        fontWeight: "600",
        marginBottom: "6px"
    },

    detailValue: {
        color: "#1b2942",
        fontSize: "14px",
        fontWeight: "800"
    },

    // =================================================
    // PROGRESS
    // =================================================

    progressSection: {
        marginBottom: "18px"
    },

    progressTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
        color: "#5d6b82",
        fontSize: "11px",
        fontWeight: "700"
    },

    progressBackground: {
        width: "100%",
        height: "7px",
        background: "#e8edf5",
        borderRadius: "20px",
        overflow: "hidden"
    },

    progressBar: {
        height: "100%",
        background:
            "linear-gradient(90deg, #2457c6, #4e8df7)",
        borderRadius: "20px",
        transition: "width 0.4s ease"
    },

    // =================================================
    // AMOUNTS
    // =================================================

    amountSection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "17px 0",
        borderTop: "1px solid #e9edf3",
        borderBottom: "1px solid #e9edf3"
    },

    amountRight: {
        textAlign: "right"
    },

    amount: {
        display: "block",
        color: "#17233a",
        fontSize: "19px",
        fontWeight: "800",
        marginTop: "3px"
    },

    maturity: {
        display: "block",
        color: "#2457c6",
        fontSize: "19px",
        fontWeight: "800",
        marginTop: "3px"
    },

    // =================================================
    // DATES
    // =================================================

    dateSection: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "15px",
        paddingTop: "15px"
    },

    dateSection: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "15px",
        paddingTop: "15px"
    },

    // =================================================
    // EMPTY
    // =================================================

    empty: {
        textAlign: "center",
        padding: "60px 25px",
        background: "#ffffff",
        border: "1px dashed #cbd5e1",
        borderRadius: "16px"
    },

    emptyIcon: {
        width: "55px",
        height: "55px",
        margin: "0 auto 13px",
        borderRadius: "15px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px"
    },

    loadingIcon: {
        fontSize: "30px",
        marginBottom: "10px"
    },

    emptyTitle: {
        margin: "0 0 7px",
        color: "#1c2940",
        fontSize: "17px",
        fontWeight: "800"
    },

    emptyText: {
        margin: "0 0 20px",
        color: "#7a879c",
        fontSize: "12px"
    },

    emptyCreateButton: {
        border: "none",
        background: "#2457c6",
        color: "#ffffff",
        padding: "11px 17px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "750"
    },

    // =================================================
    // MODAL
    // =================================================

    overlay: {
        position: "fixed",
        inset: 0,
        background:
            "rgba(10, 22, 45, 0.58)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        boxSizing: "border-box"
    },

    modal: {
        width: "100%",
        maxWidth: "560px",
        maxHeight: "92vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "18px",
        padding: "28px",
        boxSizing: "border-box",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.20)"
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "26px"
    },

    modalEyebrow: {
        color: "#2457c6",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "6px"
    },

    modalTitle: {
        margin: 0,
        color: "#18243b",
        fontSize: "22px",
        fontWeight: "800"
    },

    modalSubtitle: {
        margin: "6px 0 0",
        color: "#7b879a",
        fontSize: "11px"
    },

    closeButton: {
        width: "34px",
        height: "34px",
        border: "1px solid #e5e9f0",
        background: "#f8fafc",
        color: "#536176",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "22px",
        lineHeight: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    // =================================================
    // FORM
    // =================================================

    formGroup: {
        marginBottom: "18px"
    },

    label: {
        display: "block",
        color: "#293750",
        fontSize: "12px",
        fontWeight: "800",
        marginBottom: "7px"
    },

    input: {
        width: "100%",
        height: "48px",
        boxSizing: "border-box",
        padding: "0 14px",
        border: "1px solid #d8dee9",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1c2940",
        fontSize: "13px",
        outline: "none",
        boxShadow:
            "0 2px 7px rgba(20,35,70,0.03)"
    },

    inputWrapper: {
        width: "100%",
        height: "48px",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        border: "1px solid #d8dee9",
        borderRadius: "10px",
        background: "#ffffff",
        overflow: "hidden",
        boxShadow:
            "0 2px 7px rgba(20,35,70,0.03)"
    },

    inputPrefix: {
        paddingLeft: "14px",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "800"
    },

    inputSuffix: {
        paddingRight: "14px",
        color: "#64748b",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap"
    },

    inputWithPrefix: {
        flex: 1,
        height: "100%",
        border: "none",
        outline: "none",
        padding: "0 12px 0 7px",
        background: "#ffffff",
        color: "#1c2940",
        fontSize: "13px"
    },

    inputWithSuffix: {
        flex: 1,
        height: "100%",
        border: "none",
        outline: "none",
        padding: "0 12px 0 14px",
        background: "#ffffff",
        color: "#1c2940",
        fontSize: "13px"
    },

    // =================================================
    // FORM BUTTONS
    // =================================================

    formButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px",
        paddingTop: "20px",
        borderTop: "1px solid #edf0f4"
    },

    cancelButton: {
        border: "1px solid #d5dce7",
        background: "#ffffff",
        color: "#475569",
        padding: "11px 18px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700"
    },

    submitButton: {
        border: "none",
        background:
            "linear-gradient(135deg, #2457c6, #286bdc)",
        color: "#ffffff",
        padding: "11px 20px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "800",
        boxShadow:
            "0 5px 14px rgba(37,99,235,0.18)"
    },

    disabledButton: {
        opacity: 0.65,
        cursor: "not-allowed"
    },

    // =================================================
    // FOOTER
    // =================================================

    footer: {
        minHeight: "58px",
        borderTop: "1px solid #e5e9f0",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 35px",
        boxSizing: "border-box",
        color: "#8490a3",
        fontSize: "10px"
    }
};

export default RecurringDeposit;