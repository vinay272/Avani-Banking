import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api/admin";

const STAFF_ROLES = [
  "SUPER_ADMIN",
  "BANK_ADMIN",
  "BRANCH_MANAGER",
  "CASHIER",
  "RELATIONSHIP_MANAGER",
  "LOAN_OFFICER",
  "CUSTOMER_SUPPORT",
  "AUDITOR",
];

const BranchManagement = () => {
  const navigate = useNavigate();

  // =========================================================
  // MAIN STATES
  // =========================================================
  const [activeTab, setActiveTab] = useState("branches");

  // =========================================================
  // BRANCH STATES
  // =========================================================
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const emptyBranchForm = {
    branchCode: "",
    branchName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    managerName: "",
    status: "ACTIVE",
  };

  const [branchFormData, setBranchFormData] = useState(emptyBranchForm);

  // =========================================================
  // EMPLOYEE STATES
  // =========================================================
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [employeeSuccess, setEmployeeSuccess] = useState("");

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState("ALL");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("ALL");

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailLoading, setEmployeeDetailLoading] = useState(false);

  const emptyEmployeeForm = {
    employeeCode: "",
    fullName: "",
    email: "",
    password: "",
    role: "",
    branchCode: "",
  };

  const [employeeFormData, setEmployeeFormData] = useState(emptyEmployeeForm);

  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================
  // CASH COUNTER STATES
  // =========================================================
  const [cashCounters, setCashCounters] = useState([]);
  const [cashCounterLoading, setCashCounterLoading] = useState(false);
  const [cashCounterSaving, setCashCounterSaving] = useState(false);
  const [cashCounterError, setCashCounterError] = useState("");
  const [cashCounterSuccess, setCashCounterSuccess] = useState("");
  const [cashCounterSearch, setCashCounterSearch] = useState("");
  const [cashCounterBranchFilter, setCashCounterBranchFilter] = useState("ALL");
  const [cashCounterStatusFilter, setCashCounterStatusFilter] = useState("ALL");

  const [showCashCounterForm, setShowCashCounterForm] = useState(false);
  const [editingCashCounter, setEditingCashCounter] = useState(null);

  const [showCashCounterDetails, setShowCashCounterDetails] = useState(false);
  const [selectedCashCounter, setSelectedCashCounter] = useState(null);
  const [cashCounterDetailLoading, setCashCounterDetailLoading] =
    useState(false);

  const [showCashierAssignForm, setShowCashierAssignForm] = useState(false);
  const [cashierAssignCounter, setCashierAssignCounter] = useState(null);
  const [cashierAssignEmployeeCode, setCashierAssignEmployeeCode] =
    useState("");
  const [cashierAssignSaving, setCashierAssignSaving] = useState(false);

  const emptyCashCounterForm = {
    counterCode: "",
    counterName: "",
    branchCode: "",
    assignedEmployeeCode: "",
    openingBalance: "",
  };

  const [cashCounterFormData, setCashCounterFormData] =
    useState(emptyCashCounterForm);

  // =========================================================
  // ATM STATES
  // =========================================================
  const [atms, setAtms] = useState([]);
  const [atmLoading, setAtmLoading] = useState(false);
  const [atmSaving, setAtmSaving] = useState(false);
  const [atmError, setAtmError] = useState("");
  const [atmSuccess, setAtmSuccess] = useState("");

  const [atmSearch, setAtmSearch] = useState("");
  const [atmBranchFilter, setAtmBranchFilter] = useState("ALL");
  const [atmStatusFilter, setAtmStatusFilter] = useState("ALL");

  const [showAtmForm, setShowAtmForm] = useState(false);
  const [editingAtm, setEditingAtm] = useState(null);

  const [showAtmDetails, setShowAtmDetails] = useState(false);
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atmDetailLoading, setAtmDetailLoading] = useState(false);

  const emptyAtmForm = {
    atmCode: "",
    atmName: "",
    branchCode: "",
    location: "",
    cashBalance: "",
  };

  const [atmFormData, setAtmFormData] = useState(emptyAtmForm);

  // =========================================================
  // VAULT STATES
  // =========================================================
  const [vaults, setVaults] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultSaving, setVaultSaving] = useState(false);
  const [vaultError, setVaultError] = useState("");
  const [vaultSuccess, setVaultSuccess] = useState("");
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultBranchFilter, setVaultBranchFilter] = useState("ALL");
  const [vaultStatusFilter, setVaultStatusFilter] = useState("ALL");
  const [showVaultForm, setShowVaultForm] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [showVaultDetails, setShowVaultDetails] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [vaultDetailLoading, setVaultDetailLoading] = useState(false);
  const emptyVaultForm = {
    vaultCode: "",
    vaultName: "",
    branchCode: "",
    totalCapacity: "",
  };
  const [vaultFormData, setVaultFormData] = useState(emptyVaultForm);

  // =========================================================
  // DAILY CLOSING STATES
  // =========================================================
  const [dailyReports, setDailyReports] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailySaving, setDailySaving] = useState(false);
  const [dailyError, setDailyError] = useState("");
  const [dailySuccess, setDailySuccess] = useState("");
  const [dailyBranchFilter, setDailyBranchFilter] = useState("ALL");
  const [dailyStatusFilter, setDailyStatusFilter] = useState("ALL");
  const [dailySearch, setDailySearch] = useState("");
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [selectedDailyReport, setSelectedDailyReport] = useState(null);
  const [showDailyDetails, setShowDailyDetails] = useState(false);
  const [dailyDetailLoading, setDailyDetailLoading] = useState(false);
  const emptyDailyForm = {
    branchCode: "",
    closingDate: "",
    openingCash: "",
    cashReceived: "",
    cashPaid: "",
    totalTransactions: "",
    closedByEmployeeCode: "",
  };
  const [dailyFormData, setDailyFormData] = useState(emptyDailyForm);

  // =========================================================
  // BRANCH ANALYTICS STATES
  // =========================================================
  const [analyticsBranch, setAnalyticsBranch] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  // =========================================================
  // AUTH HEADER
  // =========================================================
  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchBranches();
    fetchEmployees();
    fetchCashCounters();
    fetchATMs();
    fetchVaults();
    fetchDailyReports();
  }, []);

  // =========================================================
  // COMMON MESSAGE CLEAR
  // =========================================================
  const clearMessages = () => {
    setError("");
    setSuccess("");
    setEmployeeError("");
    setEmployeeSuccess("");
    setCashCounterError("");
    setCashCounterSuccess("");
    setAtmError("");
    setAtmSuccess("");
    setVaultError("");
    setVaultSuccess("");
    setDailyError("");
    setDailySuccess("");
    setAnalyticsError("");
  };

  // =========================================================
  // BRANCH - GET ALL
  // =========================================================
  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/branches`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load branches.");
      }

      const data = await response.json();

      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BRANCH - INPUT CHANGE
  // =========================================================
  const handleBranchChange = (e) => {
    const { name, value } = e.target;

    setBranchFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // BRANCH - OPEN ADD FORM
  // =========================================================
  const openAddBranchForm = () => {
    clearMessages();
    setEditingBranch(null);
    setBranchFormData(emptyBranchForm);
    setShowBranchForm(true);
  };

  // =========================================================
  // BRANCH - OPEN EDIT FORM
  // =========================================================
  const openEditBranchForm = (branch) => {
    clearMessages();

    setEditingBranch(branch);

    setBranchFormData({
      branchCode: branch.branchCode || "",
      branchName: branch.branchName || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      pincode: branch.pincode || "",
      phone: branch.phone || "",
      email: branch.email || "",
      managerName: branch.managerName || "",
      status: branch.status || "ACTIVE",
    });

    setShowBranchForm(true);
  };

  // =========================================================
  // BRANCH - SAVE
  // =========================================================
  const handleBranchSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const url = editingBranch
        ? `${API_BASE}/branches/${editingBranch.id}`
        : `${API_BASE}/branches`;

      const method = editingBranch ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(branchFormData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to save branch.",
        );
      }

      setSuccess(
        editingBranch
          ? "Branch updated successfully."
          : "Branch created successfully.",
      );

      setShowBranchForm(false);
      setEditingBranch(null);
      setBranchFormData(emptyBranchForm);

      await fetchBranches();
    } catch (err) {
      setError(err.message || "Failed to save branch.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EMPLOYEE - GET ALL
  // =========================================================
  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError("");

      const response = await fetch(`${API_BASE}/employees`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load employees.");
      }

      const data = await response.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setEmployeeError(err.message || "Failed to load employees.");
    } finally {
      setEmployeeLoading(false);
    }
  };

  // =========================================================
  // EMPLOYEE - INPUT CHANGE
  // =========================================================
  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;

    setEmployeeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // EMPLOYEE - OPEN ADD
  // =========================================================
  const openAddEmployeeForm = () => {
    setEmployeeError("");
    setEmployeeSuccess("");
    setEditingEmployee(null);
    setShowPassword(false);
    setEmployeeFormData(emptyEmployeeForm);
    setShowEmployeeForm(true);
  };

  // =========================================================
  // EMPLOYEE - OPEN EDIT
  // =========================================================
  const openEditEmployeeForm = (employee) => {
    setEmployeeError("");
    setEmployeeSuccess("");
    setEditingEmployee(employee);
    setShowPassword(false);

    setEmployeeFormData({
      employeeCode: employee.employeeCode || "",
      fullName: employee.fullName || "",
      email: employee.email || "",
      password: "",
      role: employee.role || "",
      branchCode: employee.branchCode || "",
    });

    setShowEmployeeForm(true);
  };

  // =========================================================
  // EMPLOYEE - SAVE
  // =========================================================
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    try {
      setEmployeeSaving(true);
      setEmployeeError("");
      setEmployeeSuccess("");

      if (!employeeFormData.employeeCode.trim()) {
        throw new Error("Employee code is required.");
      }

      if (!employeeFormData.fullName.trim()) {
        throw new Error("Full name is required.");
      }

      if (!employeeFormData.email.trim()) {
        throw new Error("Email is required.");
      }

      if (!employeeFormData.role) {
        throw new Error("Please select employee role.");
      }

      if (!employeeFormData.branchCode) {
        throw new Error("Please select branch.");
      }

      if (!editingEmployee && !employeeFormData.password) {
        throw new Error("Password is required for new employee.");
      }

      let payload = {
        employeeCode: employeeFormData.employeeCode.trim(),
        fullName: employeeFormData.fullName.trim(),
        email: employeeFormData.email.trim(),
        role: employeeFormData.role,
        branchCode: employeeFormData.branchCode,
      };

      /*
       * Password is required during creation.
       * During edit it is sent only when the admin enters
       * a new password.
       */
      if (!editingEmployee || employeeFormData.password.trim()) {
        payload.password = employeeFormData.password;
      }

      const url = editingEmployee
        ? `${API_BASE}/employees/${editingEmployee.id}`
        : `${API_BASE}/employees`;

      const method = editingEmployee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to save employee.",
        );
      }

      setEmployeeSuccess(
        editingEmployee
          ? "Employee updated successfully."
          : "Employee created successfully.",
      );

      setShowEmployeeForm(false);
      setEditingEmployee(null);
      setEmployeeFormData(emptyEmployeeForm);

      await fetchEmployees();
    } catch (err) {
      setEmployeeError(err.message || "Failed to save employee.");
    } finally {
      setEmployeeSaving(false);
    }
  };

  // =========================================================
  // EMPLOYEE - STATUS CHANGE
  // =========================================================
  const handleEmployeeStatusChange = async (employee) => {
    const newStatus =
      String(employee.status).toUpperCase() === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const confirmMessage =
      newStatus === "ACTIVE"
        ? `Activate employee ${employee.employeeCode}?`
        : `Deactivate employee ${employee.employeeCode}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setEmployeeError("");
      setEmployeeSuccess("");

      const response = await fetch(
        `${API_BASE}/employees/${employee.id}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to change employee status.",
        );
      }

      setEmployeeSuccess(`Employee ${newStatus.toLowerCase()} successfully.`);

      await fetchEmployees();
    } catch (err) {
      setEmployeeError(err.message || "Failed to change employee status.");
    }
  };

  // =========================================================
  // EMPLOYEE - VIEW DETAILS
  // =========================================================
  const handleViewEmployee = async (employee) => {
    try {
      setEmployeeDetailLoading(true);
      setSelectedEmployee(null);
      setShowEmployeeDetails(true);

      const response = await fetch(`${API_BASE}/employees/${employee.id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load employee details.",
        );
      }

      setSelectedEmployee(data);
    } catch (err) {
      setEmployeeError(err.message || "Failed to load employee details.");
      setShowEmployeeDetails(false);
    } finally {
      setEmployeeDetailLoading(false);
    }
  };

  // =========================================================
  // EMPLOYEE FILTERING
  // =========================================================
  const filteredEmployees = employees.filter((employee) => {
    const search = employeeSearch.toLowerCase().trim();

    const matchesSearch =
      !search ||
      String(employee.employeeCode || "")
        .toLowerCase()
        .includes(search) ||
      String(employee.fullName || "")
        .toLowerCase()
        .includes(search) ||
      String(employee.email || "")
        .toLowerCase()
        .includes(search) ||
      String(employee.branchCode || "")
        .toLowerCase()
        .includes(search);

    const matchesRole =
      employeeRoleFilter === "ALL" || employee.role === employeeRoleFilter;

    const matchesStatus =
      employeeStatusFilter === "ALL" ||
      String(employee.status || "").toUpperCase() === employeeStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // =========================================================
  // CASH COUNTER - GET ALL
  // =========================================================
  const fetchCashCounters = async () => {
    try {
      setCashCounterLoading(true);
      setCashCounterError("");

      const response = await fetch(`${API_BASE}/cash-counters`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load cash counters.",
        );
      }

      setCashCounters(Array.isArray(data) ? data : []);
    } catch (err) {
      setCashCounterError(err.message || "Failed to load cash counters.");
    } finally {
      setCashCounterLoading(false);
    }
  };

  // =========================================================
  // CASH COUNTER - INPUT
  // =========================================================
  const handleCashCounterChange = (e) => {
    const { name, value } = e.target;

    setCashCounterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CASH COUNTER - ADD
  // =========================================================
  const openAddCashCounterForm = () => {
    clearMessages();
    setEditingCashCounter(null);
    setCashCounterFormData(emptyCashCounterForm);
    setShowCashCounterForm(true);
  };

  // =========================================================
  // CASH COUNTER - EDIT
  // =========================================================
  const openEditCashCounterForm = (counter) => {
    clearMessages();
    setEditingCashCounter(counter);

    setCashCounterFormData({
      counterCode: counter.counterCode || "",
      counterName: counter.counterName || "",
      branchCode: counter.branchCode || "",
      assignedEmployeeCode: counter.assignedEmployeeCode || "",
      openingBalance:
        counter.openingBalance !== null && counter.openingBalance !== undefined
          ? String(counter.openingBalance)
          : "",
    });

    setShowCashCounterForm(true);
  };

  // =========================================================
  // CASH COUNTER - SAVE
  // =========================================================
  const handleCashCounterSubmit = async (e) => {
    e.preventDefault();

    try {
      setCashCounterSaving(true);
      setCashCounterError("");
      setCashCounterSuccess("");

      if (!cashCounterFormData.counterCode.trim()) {
        throw new Error("Counter code is required.");
      }

      if (!cashCounterFormData.counterName.trim()) {
        throw new Error("Counter name is required.");
      }

      if (!cashCounterFormData.branchCode) {
        throw new Error("Please select branch.");
      }

      if (
        cashCounterFormData.openingBalance === "" ||
        Number.isNaN(Number(cashCounterFormData.openingBalance)) ||
        Number(cashCounterFormData.openingBalance) < 0
      ) {
        throw new Error("Opening balance must be a valid non-negative amount.");
      }

      const payload = {
        counterCode: cashCounterFormData.counterCode.trim(),
        counterName: cashCounterFormData.counterName.trim(),
        branchCode: cashCounterFormData.branchCode,
        assignedEmployeeCode: cashCounterFormData.assignedEmployeeCode || "",
        openingBalance: Number(cashCounterFormData.openingBalance),
      };

      const url = editingCashCounter
        ? `${API_BASE}/cash-counters/${editingCashCounter.id}`
        : `${API_BASE}/cash-counters`;

      const method = editingCashCounter ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to save cash counter.",
        );
      }

      setCashCounterSuccess(
        editingCashCounter
          ? "Cash counter updated successfully."
          : "Cash counter created successfully.",
      );

      setShowCashCounterForm(false);
      setEditingCashCounter(null);
      setCashCounterFormData(emptyCashCounterForm);

      await fetchCashCounters();
    } catch (err) {
      setCashCounterError(err.message || "Failed to save cash counter.");
    } finally {
      setCashCounterSaving(false);
    }
  };

  // =========================================================
  // CASH COUNTER - DETAILS
  // =========================================================
  const handleViewCashCounter = async (counter) => {
    try {
      setCashCounterDetailLoading(true);
      setCashCounterError("");
      setSelectedCashCounter(null);
      setShowCashCounterDetails(true);

      const response = await fetch(`${API_BASE}/cash-counters/${counter.id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load cash counter details.",
        );
      }

      setSelectedCashCounter(data);
    } catch (err) {
      setCashCounterError(
        err.message || "Failed to load cash counter details.",
      );
      setShowCashCounterDetails(false);
    } finally {
      setCashCounterDetailLoading(false);
    }
  };

  // =========================================================
  // CASH COUNTER - STATUS
  // =========================================================
  const handleCashCounterStatusChange = async (counter) => {
    const currentStatus = String(counter.status || "").toUpperCase();
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmMessage =
      newStatus === "ACTIVE"
        ? `Activate cash counter ${counter.counterCode}?`
        : `Deactivate cash counter ${counter.counterCode}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setCashCounterError("");
      setCashCounterSuccess("");

      const response = await fetch(
        `${API_BASE}/cash-counters/${counter.id}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to change cash counter status.",
        );
      }

      setCashCounterSuccess(
        `Cash counter ${newStatus.toLowerCase()} successfully.`,
      );

      await fetchCashCounters();
    } catch (err) {
      setCashCounterError(
        err.message || "Failed to change cash counter status.",
      );
    }
  };

  // =========================================================
  // CASH COUNTER - ASSIGN CASHIER
  // =========================================================
  const getCashiersForBranch = (branchCode) => {
    return employees.filter(
      (employee) =>
        String(employee.role || "").toUpperCase() === "CASHIER" &&
        String(employee.status || "").toUpperCase() === "ACTIVE" &&
        String(employee.branchCode || "").toUpperCase() ===
          String(branchCode || "").toUpperCase(),
    );
  };

  const openAssignCashierForm = (counter) => {
    clearMessages();
    setCashierAssignCounter(counter);
    setCashierAssignEmployeeCode(counter.assignedEmployeeCode || "");
    setShowCashierAssignForm(true);
  };

  const handleAssignCashier = async (e) => {
    e.preventDefault();

    if (!cashierAssignCounter) {
      return;
    }

    try {
      setCashierAssignSaving(true);
      setCashCounterError("");
      setCashCounterSuccess("");

      const response = await fetch(
        `${API_BASE}/cash-counters/${cashierAssignCounter.id}/assign?employeeCode=${encodeURIComponent(
          cashierAssignEmployeeCode,
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to assign cashier.",
        );
      }

      setCashCounterSuccess(
        cashierAssignEmployeeCode
          ? "Cashier assigned successfully."
          : "Cashier unassigned successfully.",
      );

      setShowCashierAssignForm(false);
      setCashierAssignCounter(null);
      setCashierAssignEmployeeCode("");

      await fetchCashCounters();
    } catch (err) {
      setCashCounterError(err.message || "Failed to assign cashier.");
    } finally {
      setCashierAssignSaving(false);
    }
  };

  // =========================================================
  // CASH COUNTER - FILTER
  // =========================================================
  const filteredCashCounters = cashCounters.filter((counter) => {
    const search = cashCounterSearch.toLowerCase().trim();

    const matchesSearch =
      !search ||
      String(counter.counterCode || "")
        .toLowerCase()
        .includes(search) ||
      String(counter.counterName || "")
        .toLowerCase()
        .includes(search) ||
      String(counter.branchCode || "")
        .toLowerCase()
        .includes(search) ||
      String(counter.assignedEmployeeCode || "")
        .toLowerCase()
        .includes(search);

    const matchesBranch =
      cashCounterBranchFilter === "ALL" ||
      counter.branchCode === cashCounterBranchFilter;

    const matchesStatus =
      cashCounterStatusFilter === "ALL" ||
      String(counter.status || "").toUpperCase() === cashCounterStatusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // =========================================================
  // CASH COUNTER - HELPERS
  // =========================================================
  const formatCurrency = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0.00";
    }

    return number.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  // =========================================================
  // ATM - GET ALL
  // =========================================================
  const fetchATMs = async () => {
    try {
      setAtmLoading(true);
      setAtmError("");

      const response = await fetch(`${API_BASE}/atms`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to load ATMs.");
      }

      setAtms(Array.isArray(data) ? data : []);
    } catch (err) {
      setAtmError(err.message || "Failed to load ATMs.");
    } finally {
      setAtmLoading(false);
    }
  };

  // =========================================================
  // ATM - INPUT
  // =========================================================
  const handleAtmChange = (e) => {
    const { name, value } = e.target;

    setAtmFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // ATM - ADD
  // =========================================================
  const openAddAtmForm = () => {
    clearMessages();
    setEditingAtm(null);
    setAtmFormData(emptyAtmForm);
    setShowAtmForm(true);
  };

  // =========================================================
  // ATM - EDIT
  // =========================================================
  const openEditAtmForm = (atm) => {
    clearMessages();
    setEditingAtm(atm);

    setAtmFormData({
      atmCode: atm.atmCode || "",
      atmName: atm.atmName || "",
      branchCode: atm.branchCode || "",
      location: atm.location || "",
      cashBalance:
        atm.cashBalance !== null && atm.cashBalance !== undefined
          ? String(atm.cashBalance)
          : "0",
    });

    setShowAtmForm(true);
  };

  // =========================================================
  // ATM - SAVE
  // =========================================================
  const handleAtmSubmit = async (e) => {
    e.preventDefault();

    try {
      setAtmSaving(true);
      setAtmError("");
      setAtmSuccess("");

      if (!atmFormData.atmCode.trim()) {
        throw new Error("ATM code is required.");
      }

      if (!atmFormData.atmName.trim()) {
        throw new Error("ATM name is required.");
      }

      if (!atmFormData.branchCode) {
        throw new Error("Please select branch.");
      }

      if (!atmFormData.location.trim()) {
        throw new Error("ATM location is required.");
      }

      if (
        atmFormData.cashBalance === "" ||
        Number.isNaN(Number(atmFormData.cashBalance)) ||
        Number(atmFormData.cashBalance) < 0
      ) {
        throw new Error("Cash balance must be a valid non-negative amount.");
      }

      const payload = {
        atmCode: atmFormData.atmCode.trim(),
        atmName: atmFormData.atmName.trim(),
        branchCode: atmFormData.branchCode,
        location: atmFormData.location.trim(),
        cashBalance: Number(atmFormData.cashBalance),
      };

      const url = editingAtm
        ? `${API_BASE}/atms/${editingAtm.id}`
        : `${API_BASE}/atms`;

      const method = editingAtm ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to save ATM.");
      }

      setAtmSuccess(
        editingAtm ? "ATM updated successfully." : "ATM created successfully.",
      );

      setShowAtmForm(false);
      setEditingAtm(null);
      setAtmFormData(emptyAtmForm);

      await fetchATMs();
    } catch (err) {
      setAtmError(err.message || "Failed to save ATM.");
    } finally {
      setAtmSaving(false);
    }
  };

  // =========================================================
  // ATM - DETAILS
  // =========================================================
  const handleViewAtm = async (atm) => {
    try {
      setAtmDetailLoading(true);
      setAtmError("");
      setSelectedAtm(null);
      setShowAtmDetails(true);

      const response = await fetch(`${API_BASE}/atms/${atm.id}`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load ATM details.",
        );
      }

      setSelectedAtm(data);
    } catch (err) {
      setAtmError(err.message || "Failed to load ATM details.");
      setShowAtmDetails(false);
    } finally {
      setAtmDetailLoading(false);
    }
  };

  // =========================================================
  // ATM - STATUS
  // =========================================================
  const handleAtmStatusChange = async (atm) => {
    const currentStatus = String(atm.status || "").toUpperCase();

    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmMessage =
      newStatus === "ACTIVE"
        ? `Activate ATM ${atm.atmCode}?`
        : `Deactivate ATM ${atm.atmCode}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setAtmError("");
      setAtmSuccess("");

      const response = await fetch(
        `${API_BASE}/atms/${atm.id}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to change ATM status.",
        );
      }

      setAtmSuccess(`ATM ${newStatus.toLowerCase()} successfully.`);

      await fetchATMs();
    } catch (err) {
      setAtmError(err.message || "Failed to change ATM status.");
    }
  };

  // =========================================================
  // ATM - MAINTENANCE
  // =========================================================
  const handleAtmMaintenance = async (atm) => {
    if (!window.confirm(`Record maintenance for ATM ${atm.atmCode}?`)) {
      return;
    }

    try {
      setAtmError("");
      setAtmSuccess("");

      const response = await fetch(`${API_BASE}/atms/${atm.id}/maintenance`, {
        method: "PUT",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to record ATM maintenance.",
        );
      }

      setAtmSuccess(`Maintenance recorded for ${atm.atmCode}.`);

      await fetchATMs();
    } catch (err) {
      setAtmError(err.message || "Failed to record ATM maintenance.");
    }
  };

  // =========================================================
  // ATM - FILTER
  // =========================================================
  const filteredAtms = atms.filter((atm) => {
    const search = atmSearch.toLowerCase().trim();

    const matchesSearch =
      !search ||
      String(atm.atmCode || "")
        .toLowerCase()
        .includes(search) ||
      String(atm.atmName || "")
        .toLowerCase()
        .includes(search) ||
      String(atm.branchCode || "")
        .toLowerCase()
        .includes(search) ||
      String(atm.location || "")
        .toLowerCase()
        .includes(search);

    const matchesBranch =
      atmBranchFilter === "ALL" || atm.branchCode === atmBranchFilter;

    const matchesStatus =
      atmStatusFilter === "ALL" ||
      String(atm.status || "").toUpperCase() === atmStatusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // =========================================================
  // VAULT - API
  // =========================================================
  const fetchVaults = async () => {
    try {
      setVaultLoading(true);
      setVaultError("");
      const response = await fetch(`${API_BASE}/vaults`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to load vaults.",
        );
      setVaults(Array.isArray(data) ? data : []);
    } catch (err) {
      setVaultError(err.message || "Failed to load vaults.");
    } finally {
      setVaultLoading(false);
    }
  };

  const openAddVaultForm = () => {
    clearMessages();
    setEditingVault(null);
    setVaultFormData(emptyVaultForm);
    setShowVaultForm(true);
  };
  const openEditVaultForm = (vault) => {
    clearMessages();
    setEditingVault(vault);
    setVaultFormData({
      vaultCode: vault.vaultCode || "",
      vaultName: vault.vaultName || "",
      branchCode: vault.branchCode || "",
      totalCapacity: vault.totalCapacity ?? "",
    });
    setShowVaultForm(true);
  };
  const handleVaultSubmit = async (e) => {
    e.preventDefault();
    try {
      setVaultSaving(true);
      setVaultError("");
      setVaultSuccess("");
      if (!vaultFormData.vaultCode.trim())
        throw new Error("Vault code is required.");
      if (!vaultFormData.vaultName.trim())
        throw new Error("Vault name is required.");
      if (!vaultFormData.branchCode) throw new Error("Please select branch.");
      if (
        vaultFormData.totalCapacity === "" ||
        Number.isNaN(Number(vaultFormData.totalCapacity)) ||
        Number(vaultFormData.totalCapacity) < 0
      )
        throw new Error("Total capacity must be a valid non-negative amount.");
      const payload = {
        vaultCode: vaultFormData.vaultCode.trim(),
        vaultName: vaultFormData.vaultName.trim(),
        branchCode: vaultFormData.branchCode,
        totalCapacity: Number(vaultFormData.totalCapacity),
      };
      const url = editingVault
        ? `${API_BASE}/vaults/${editingVault.id}`
        : `${API_BASE}/vaults`;
      const response = await fetch(url, {
        method: editingVault ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to save vault.",
        );
      setVaultSuccess(
        editingVault
          ? "Vault updated successfully."
          : "Vault created successfully.",
      );
      setShowVaultForm(false);
      setEditingVault(null);
      setVaultFormData(emptyVaultForm);
      await fetchVaults();
    } catch (err) {
      setVaultError(err.message || "Failed to save vault.");
    } finally {
      setVaultSaving(false);
    }
  };
  const handleViewVault = async (vault) => {
    try {
      setVaultDetailLoading(true);
      setVaultError("");
      setSelectedVault(null);
      setShowVaultDetails(true);
      const response = await fetch(`${API_BASE}/vaults/${vault.id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to load vault details.",
        );
      setSelectedVault(data);
    } catch (err) {
      setVaultError(err.message || "Failed to load vault details.");
      setShowVaultDetails(false);
    } finally {
      setVaultDetailLoading(false);
    }
  };
  const handleVaultStatusChange = async (vault) => {
    const current = String(vault.status || "").toUpperCase();
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (
      !window.confirm(
        `${next === "ACTIVE" ? "Activate" : "Deactivate"} vault ${vault.vaultCode}?`,
      )
    )
      return;
    try {
      setVaultError("");
      setVaultSuccess("");
      const response = await fetch(
        `${API_BASE}/vaults/${vault.id}/status?status=${next}`,
        { method: "PUT", headers: getHeaders() },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to change vault status.",
        );
      setVaultSuccess(`Vault ${next.toLowerCase()} successfully.`);
      await fetchVaults();
    } catch (err) {
      setVaultError(err.message || "Failed to change vault status.");
    }
  };
  const handleVaultAudit = async (vault) => {
    if (!window.confirm(`Record audit for vault ${vault.vaultCode}?`)) return;
    try {
      setVaultError("");
      setVaultSuccess("");
      const response = await fetch(`${API_BASE}/vaults/${vault.id}/audit`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to record vault audit.",
        );
      setVaultSuccess(`Audit recorded for ${vault.vaultCode}.`);
      await fetchVaults();
    } catch (err) {
      setVaultError(err.message || "Failed to record vault audit.");
    }
  };
  const filteredVaults = vaults.filter((vault) => {
    const q = vaultSearch.toLowerCase().trim();
    return (
      (!q ||
        [vault.vaultCode, vault.vaultName, vault.branchCode].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q),
        )) &&
      (vaultBranchFilter === "ALL" || vault.branchCode === vaultBranchFilter) &&
      (vaultStatusFilter === "ALL" ||
        String(vault.status || "").toUpperCase() === vaultStatusFilter)
    );
  });

  // =========================================================
  // DAILY CLOSING - API
  // =========================================================
  const fetchDailyReports = async () => {
    try {
      setDailyLoading(true);
      setDailyError("");
      const response = await fetch(`${API_BASE}/daily-closing`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load daily closing reports.",
        );
      setDailyReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setDailyError(err.message || "Failed to load daily closing reports.");
    } finally {
      setDailyLoading(false);
    }
  };
  const openAddDailyForm = () => {
    clearMessages();
    setDailyFormData({
      ...emptyDailyForm,
      closingDate: new Date().toISOString().slice(0, 10),
    });
    setShowDailyForm(true);
  };
  const handleDailyChange = (e) => {
    const { name, value } = e.target;
    setDailyFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    try {
      setDailySaving(true);
      setDailyError("");
      setDailySuccess("");
      if (!dailyFormData.branchCode) throw new Error("Please select branch.");
      if (!dailyFormData.closingDate)
        throw new Error("Closing date is required.");
      for (const [key, label] of [
        ["openingCash", "Opening cash"],
        ["cashReceived", "Cash received"],
        ["cashPaid", "Cash paid"],
        ["totalTransactions", "Total transactions"],
      ]) {
        if (
          dailyFormData[key] === "" ||
          Number.isNaN(Number(dailyFormData[key])) ||
          Number(dailyFormData[key]) < 0
        )
          throw new Error(`${label} must be a valid non-negative value.`);
      }
      const payload = {
        branchCode: dailyFormData.branchCode,
        closingDate: dailyFormData.closingDate,
        openingCash: Number(dailyFormData.openingCash),
        cashReceived: Number(dailyFormData.cashReceived),
        cashPaid: Number(dailyFormData.cashPaid),
        totalTransactions: Number(dailyFormData.totalTransactions),
        closedByEmployeeCode: dailyFormData.closedByEmployeeCode.trim() || null,
      };
      const response = await fetch(`${API_BASE}/daily-closing`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to create daily closing report.",
        );
      setDailySuccess("Daily closing report created successfully.");
      setShowDailyForm(false);
      setDailyFormData(emptyDailyForm);
      await fetchDailyReports();
    } catch (err) {
      setDailyError(err.message || "Failed to create daily closing report.");
    } finally {
      setDailySaving(false);
    }
  };
  const handleViewDailyReport = async (report) => {
    try {
      setDailyDetailLoading(true);
      setDailyError("");
      setSelectedDailyReport(null);
      setShowDailyDetails(true);
      const response = await fetch(`${API_BASE}/daily-closing/${report.id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to load report details.",
        );
      setSelectedDailyReport(data);
    } catch (err) {
      setDailyError(err.message || "Failed to load report details.");
      setShowDailyDetails(false);
    } finally {
      setDailyDetailLoading(false);
    }
  };
  const filteredDailyReports = dailyReports.filter((report) => {
    const q = dailySearch.toLowerCase().trim();
    return (
      (!q ||
        [
          report.branchCode,
          report.closedByEmployeeCode,
          report.closingDate,
        ].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q),
        )) &&
      (dailyBranchFilter === "ALL" ||
        report.branchCode === dailyBranchFilter) &&
      (dailyStatusFilter === "ALL" ||
        String(report.status || "").toUpperCase() === dailyStatusFilter)
    );
  });

  // =========================================================
  // BRANCH ANALYTICS - API
  // =========================================================
  const fetchBranchAnalytics = async (branchCode = analyticsBranch) => {
    if (!branchCode) {
      setAnalytics(null);
      return;
    }
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      const response = await fetch(
        `${API_BASE}/branch-analytics/${encodeURIComponent(branchCode)}`,
        { method: "GET", headers: getHeaders() },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.message || data?.error || "Unable to load branch analytics.",
        );
      setAnalytics(data);
    } catch (err) {
      setAnalytics(null);
      setAnalyticsError(err.message || "Failed to load branch analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = () => {
    navigate("/admin/login");
  };

  // =========================================================
  // HELPERS
  // =========================================================
  const getStatusClass = (status) => {
    return String(status || "").toUpperCase() === "ACTIVE"
      ? styles.statusActive
      : styles.statusInactive;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // RESPONSIVE VIEW
  // =========================================================
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" && window.innerWidth <= 1000
  );

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 700
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= 1000);
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =========================================================
  // STYLES
  // =========================================================
  const styles = {
    page: {
      minHeight: "100vh",
      padding: "25px 32px",
      background: "#f4f7fb",
      color: "#172033",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    header: {
      height: "80px",
      borderRadius: "18px",
      background:
        "linear-gradient(135deg, #0756c9 0%, #0b74e8 55%, #1d8cf5 100%)",
      color: "#fff",
      padding: "18px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "20px",
      boxShadow: "0 8px 25px rgba(10, 91, 190, 0.18)",
    },

    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },

    headerIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      background: "rgba(255,255,255,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    },

    headerTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 750,
      letterSpacing: "-0.3px",
    },

    headerSubtitle: {
      margin: "4px 0 0",
      fontSize: "13px",
      opacity: 0.85,
    },

    dashboardButton: {
      border: "1px solid rgba(255,255,255,0.35)",
      background: "#ffffff",
      color: "#3e64e1",
      padding: "10px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 650,
      fontSize: "13px",
    },

    container: {
      width: "100%",
      maxWidth: "1500px",
      margin: "0 auto",
      padding: "24px",
      boxSizing: "border-box",
    },

    tabs: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      background: "#fff",
      padding: "8px",
      borderRadius: "14px",
      boxShadow: "0 5px 20px rgba(30, 60, 100, 0.07)",
      marginBottom: "20px",
    },

    tab: {
      border: "none",
      background: "transparent",
      color: "#64748b",
      padding: "11px 16px",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: 650,
      fontSize: "13px",
      transition: "0.2s",
    },

    activeTab: {
      background: "linear-gradient(135deg, #0866d7, #1986f5)",
      color: "#fff",
      boxShadow: "0 5px 14px rgba(9, 103, 215, 0.22)",
    },

    section: {
      background: "#fff",
      borderRadius: "16px",
      padding: "22px",
      boxShadow: "0 7px 25px rgba(30, 60, 100, 0.07)",
      marginBottom: "20px",
    },

    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "15px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },

    sectionEyebrow: {
      color: "#0b72df",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "5px",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: 750,
      color: "#16243a",
    },

    sectionDescription: {
      margin: "5px 0 0",
      color: "#718096",
      fontSize: "13px",
    },

    primaryButton: {
      border: "none",
      background: "linear-gradient(135deg, #075ecf, #1688f5)",
      color: "#fff",
      padding: "11px 15px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "13px",
      boxShadow: "0 6px 16px rgba(9, 100, 210, 0.2)",
    },

    secondaryButton: {
      border: "1px solid #c00821",
      background: "#fff",
      color: "#c00821",
      padding: "10px 15px",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: 650,
      fontSize: "13px",
    },

    dangerButton: {
      border: "none",
      background: "#fff1f2",
      color: "#c62828",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "12px",
    },

    successButton: {
      border: "none",
      background: "#ecfdf3",
      color: "#16804b",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "12px",
    },

    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      border: "1px solid #e6edf5",
      borderRadius: "12px",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "850px",
    },

    th: {
      textAlign: "left",
      padding: "13px 14px",
      background: "#f7f9fc",
      borderBottom: "1px solid #e4eaf2",
      color: "#52627a",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      fontWeight: 800,
    },

    td: {
      padding: "14px",
      borderBottom: "1px solid #edf1f6",
      color: "#27364d",
      fontSize: "13px",
      verticalAlign: "middle",
    },

    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexWrap: "wrap",
    },

    statusActive: {
      display: "inline-flex",
      padding: "5px 9px",
      borderRadius: "20px",
      background: "#e9f9f0",
      color: "#15804a",
      fontSize: "11px",
      fontWeight: 800,
    },

    statusInactive: {
      display: "inline-flex",
      padding: "5px 9px",
      borderRadius: "20px",
      background: "#fff0f1",
      color: "#c62828",
      fontSize: "11px",
      fontWeight: 800,
    },

    alertSuccess: {
      background: "#ecfdf3",
      border: "1px solid #b9efd0",
      color: "#167345",
      padding: "11px 14px",
      borderRadius: "10px",
      marginBottom: "16px",
      fontSize: "13px",
      fontWeight: 600,
    },

    alertError: {
      background: "#fff1f2",
      border: "1px solid #ffc8ce",
      color: "#b4232d",
      padding: "11px 14px",
      borderRadius: "10px",
      marginBottom: "16px",
      fontSize: "13px",
      fontWeight: 600,
    },

    filterBar: {
      display: "grid",
      gridTemplateColumns:
        "minmax(240px, 1fr) minmax(170px, 200px) minmax(170px, 200px)",
      gap: "10px",
      marginBottom: "18px",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d8e1ec",
      background: "#fff",
      color: "#172033",
      padding: "10px 12px",
      borderRadius: "9px",
      outline: "none",
      fontSize: "13px",
    },

    select: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d8e1ec",
      background: "#fff",
      color: "#172033",
      padding: "10px 12px",
      borderRadius: "9px",
      outline: "none",
      fontSize: "13px",
      cursor: "pointer",
    },

    label: {
      display: "block",
      color: "#34445c",
      fontSize: "12px",
      fontWeight: 700,
      marginBottom: "6px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "14px",
    },

    formGroup: {
      minWidth: 0,
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 28, 48, 0.48)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      //padding: "24px",
      boxSizing: "border-box",
      zIndex: 1000,
    },

    modal: {
      width: "100%",
      maxWidth: "900px",
      background: "#fff",
      borderRadius: "18px",
      boxShadow: "0 25px 70px rgba(0,0,0,0.2)",
      padding: "20px",
      boxSizing: "border-box",
      maxHeight: "95vh",
      overflow: "visible",
    },

    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      marginBottom: "2px",
    },

    modalTitle: {
      margin: 0,
      fontSize: "19px",
      color: "#17243a",
      fontWeight: 750,
    },

    closeButton: {
      width: "34px",
      height: "34px",
      borderRadius: "9px",
      border: "1px solid #dce4ed",
      background: "#fff",
      color: "#342b2c",
      cursor: "pointer",
      fontSize: "18px",
    },

    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      paddingTop: "10px",
      borderTop: "1px solid #edf1f6",
    },

    detailGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "12px",
      },

    detailItem: {
      background: "#f8fafc",
      border: "1px solid #e7edf4",
      borderRadius: "10px",
      padding: "12px",
    },

    detailLabel: {
      fontSize: "10px",
      color: "#718096",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      fontWeight: 800,
      marginBottom: "4px",
    },

    detailValue: {
      fontSize: "13px",
      color: "#1d2a3d",
      fontWeight: 650,
      wordBreak: "break-word",
    },

    emptyState: {
      padding: "35px",
      textAlign: "center",
      color: "#758298",
      border: "1px dashed #dce4ed",
      borderRadius: "12px",
    },
    mutedSmall: { marginTop: "4px", color: "#718096", fontSize: "11px" },
    analyticsSelector: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: "10px",
      marginBottom: "20px",
      alignItems: "center",
    },
    analyticsHero: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      padding: "18px",
      borderRadius: "14px",
      background: "linear-gradient(135deg,#f4f8ff,#eef6ff)",
      border: "1px solid #dcecff",
      marginBottom: "16px",
    },
    analyticsCode: {
      color: "#0866d7",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "1px",
    },
    analyticsHeroTitle: { margin: "3px 0", fontSize: "19px", fontWeight: 750 },
    analyticsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3,minmax(0,1fr))",
      gap: "12px",
    },
    analyticsCard: {
      padding: "15px",
      background: "#f8fafc",
      border: "1px solid #e5ebf3",
      borderRadius: "12px",
    },
    analyticsValue: {
      fontSize: "18px",
      fontWeight: 800,
      color: "#172a46",
      marginTop: "6px",
    },
    placeholderIcon: {
      fontSize: "38px",
      marginBottom: "10px",
    },

    placeholderTitle: {
      margin: "0 0 6px",
      fontSize: "18px",
      color: "#24334a",
    },

    placeholderText: {
      margin: 0,
      color: "#758298",
      fontSize: "13px",
    },

    cashCounterDetailGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "10px",
    },

    cashCounterDetailItem: {
      background: "#f8fafc",
      border: "1px solid #e4ebf3",
      borderRadius: "10px",
      padding: "11px 13px",
      minHeight: "62px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxSizing: "border-box",
    },

    moneyValue: {
      color: "#102a56",
      fontWeight: 750,
      whiteSpace: "nowrap",
    },

    infoNote: {
      gridColumn: "1 / -1",
      background: "#f0f7ff",
      border: "1px solid #cfe4fb",
      color: "#315b88",
      padding: "10px 12px",
      borderRadius: "9px",
      fontSize: "12px",
      lineHeight: 1.5,
    },

    atmDetailGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    },

    atmHealthCard: {
      background: "#f8fbff",
      border: "1px solid #e3edf8",
      borderRadius: "12px",
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },

    maintenanceText: {
      color: "#52627a",
      fontSize: "12px",
      fontWeight: 650,
    },
  };

  // =========================================================
  // RESPONSIVE STYLE OVERRIDES
  // =========================================================
  const responsiveStyles = {
    ...styles,

    page: {
      ...styles.page,
      ...(isTablet ? { padding: "18px 20px" } : {}),
      ...(isMobile ? { padding: "10px" } : {}),
    },

    header: {
      ...styles.header,
      ...(isTablet
        ? {
            height: "auto",
            minHeight: "80px",
            flexWrap: "wrap",
            padding: "16px 20px",
          }
        : {}),
      ...(isMobile
        ? {
            borderRadius: "14px",
            padding: "14px",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "14px",
          }
        : {}),
    },

    headerLeft: {
      ...styles.headerLeft,
      ...(isMobile ? { width: "100%" } : {}),
    },

    headerIcon: {
      ...styles.headerIcon,
      ...(isMobile
        ? { width: "42px", height: "42px", fontSize: "21px" }
        : {}),
    },

    headerTitle: {
      ...styles.headerTitle,
      ...(isMobile ? { fontSize: "18px" } : {}),
    },

    headerSubtitle: {
      ...styles.headerSubtitle,
      ...(isMobile ? { fontSize: "11px", lineHeight: 1.4 } : {}),
    },

    dashboardButton: {
      ...styles.dashboardButton,
      ...(isMobile ? { width: "100%", minHeight: "44px" } : {}),
    },

    container: {
      ...styles.container,
      ...(isTablet ? { padding: "18px" } : {}),
      ...(isMobile ? { padding: "14px 0 30px" } : {}),
    },

    tabs: {
      ...styles.tabs,
      ...(isMobile
        ? {
            flexWrap: "nowrap",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "7px",
            gap: "6px",
          }
        : {}),
    },

    tab: {
      ...styles.tab,
      ...(isMobile
        ? {
            flexShrink: 0,
            whiteSpace: "nowrap",
            padding: "10px 13px",
            fontSize: "12px",
          }
        : {}),
    },

    section: {
      ...styles.section,
      ...(isMobile
        ? {
            padding: "15px",
            borderRadius: "13px",
          }
        : {}),
    },

    sectionHeader: {
      ...styles.sectionHeader,
      ...(isMobile
        ? {
            alignItems: "stretch",
            flexDirection: "column",
            gap: "12px",
          }
        : {}),
    },

    sectionTitle: {
      ...styles.sectionTitle,
      ...(isMobile ? { fontSize: "18px" } : {}),
    },

    sectionDescription: {
      ...styles.sectionDescription,
      ...(isMobile ? { lineHeight: 1.5 } : {}),
    },

    primaryButton: {
      ...styles.primaryButton,
      ...(isMobile ? { width: "100%", minHeight: "44px" } : {}),
    },

    secondaryButton: {
      ...styles.secondaryButton,
      ...(isMobile ? { minHeight: "42px" } : {}),
    },

    formGrid: {
      ...styles.formGrid,
      ...(isTablet
        ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
        : {}),
      ...(isMobile
        ? { gridTemplateColumns: "1fr", gap: "11px" }
        : {}),
    },

    filterBar: {
      ...styles.filterBar,
      ...(isTablet
        ? {
            gridTemplateColumns: "minmax(180px, 1fr) minmax(150px, 1fr)",
          }
        : {}),
      ...(isMobile
        ? {
            gridTemplateColumns: "1fr",
            gap: "9px",
          }
        : {}),
    },

    analyticsGrid: {
      ...styles.analyticsGrid,
      ...(isTablet
        ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
        : {}),
      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
    },

    detailGrid: {
      ...styles.detailGrid,
      ...(isTablet
        ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
        : {}),
      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
    },

    atmDetailGrid: {
      ...styles.atmDetailGrid,
      ...(isTablet
        ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
        : {}),
      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
    },

    cashCounterDetailGrid: {
      ...styles.cashCounterDetailGrid,
      ...(isTablet
        ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
        : {}),
      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
    },

    tableWrapper: {
      ...styles.tableWrapper,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    },

    table: {
      ...styles.table,
      minWidth: isMobile ? "780px" : isTablet ? "820px" : styles.table.minWidth,
    },

    actionGroup: {
      ...styles.actionGroup,
      ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}),
    },

    modalOverlay: {
      ...styles.modalOverlay,
      ...(isMobile
        ? {
            alignItems: "flex-end",
            padding: "8px",
          }
        : {}),
    },

    modal: {
      ...styles.modal,
      ...(isTablet ? { maxHeight: "92vh", overflowY: "auto" } : {}),
      ...(isMobile
        ? {
            width: "100%",
            maxWidth: "100%",
            maxHeight: "92vh",
            borderRadius: "16px 16px 10px 10px",
            padding: "15px",
            overflowY: "auto",
          }
        : {}),
    },

    modalHeader: {
      ...styles.modalHeader,
      ...(isMobile ? { alignItems: "flex-start" } : {}),
    },

    modalTitle: {
      ...styles.modalTitle,
      ...(isMobile ? { fontSize: "17px" } : {}),
    },

    modalFooter: {
      ...styles.modalFooter,
      ...(isMobile
        ? {
            flexDirection: "column",
            alignItems: "stretch",
          }
        : {}),
    },

    closeButton: {
      ...styles.closeButton,
      ...(isMobile ? { flexShrink: 0 } : {}),
    },
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="branch-management-page" style={responsiveStyles.page}>
      <style>{`
        .branch-management-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        .branch-management-page * {
          box-sizing: border-box;
        }
        @media (max-width: 700px) {
          .branch-management-page input,
          .branch-management-page select,
          .branch-management-page textarea {
            max-width: 100%;
          }
          .branch-management-page table {
            white-space: nowrap;
          }
        }
      `}</style>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header style={responsiveStyles.header}>
        <div style={responsiveStyles.headerLeft}>
          <div style={responsiveStyles.headerIcon}>🏦</div>

          <div>
            <h1 style={responsiveStyles.headerTitle}>Branch Management</h1>

            <p style={responsiveStyles.headerSubtitle}>
              Manage branches, employees and branch operations
            </p>
          </div>
        </div>

        <button
          style={responsiveStyles.dashboardButton}
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Admin Dashboard
        </button>
      </header>

      <main style={responsiveStyles.container}>
        {/* ===================================================
            TABS
        =================================================== */}
        <div style={responsiveStyles.tabs}>
          {[
            ["branches", "🏦 Branches"],
            ["employees", "👥 Employees"],
            ["cash-counters", "💵 Cash Counters"],
            ["atms", "🏧 ATMs"],
            ["vault", "🔐 Vault"],
            ["daily-closing", "📊 Daily Closing"],
            ["analytics", "📈 Analytics"],
          ].map(([key, label]) => (
            <button
              key={key}
              style={{
                ...styles.tab,
                ...(activeTab === key ? styles.activeTab : {}),
              }}
              onClick={() => {
                setActiveTab(key);
                clearMessages();
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===================================================
            SUCCESS / ERROR
        =================================================== */}
        {success && <div style={responsiveStyles.alertSuccess}>✓ {success}</div>}

        {error && <div style={responsiveStyles.alertError}>⚠ {error}</div>}

        {/* ===================================================
            BRANCH MANAGEMENT
        =================================================== */}
        {activeTab === "branches" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Branch Network</div>

                <h2 style={responsiveStyles.sectionTitle}>All Branches</h2>

                <p style={responsiveStyles.sectionDescription}>
                  Create, update and manage Avani Bank branches.
                </p>
              </div>

              <button style={responsiveStyles.primaryButton} onClick={openAddBranchForm}>
                + Add Branch
              </button>
            </div>

            {loading && (
              <div style={{ padding: "20px", color: "#64748b" }}>
                Loading branches...
              </div>
            )}

            {!loading && branches.length === 0 && (
              <div
                style={{
                  padding: "35px",
                  textAlign: "center",
                  color: "#758298",
                }}
              >
                No branches found.
              </div>
            )}

            {!loading && branches.length > 0 && (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>Branch Code</th>
                      <th style={responsiveStyles.th}>Branch Name</th>
                      <th style={responsiveStyles.th}>Location</th>
                      <th style={responsiveStyles.th}>Phone</th>
                      <th style={responsiveStyles.th}>Manager</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.id}>
                        <td style={responsiveStyles.td}>
                          <strong>{branch.branchCode || "—"}</strong>
                        </td>

                        <td style={responsiveStyles.td}>{branch.branchName || "—"}</td>

                        <td style={responsiveStyles.td}>
                          {[branch.city, branch.state]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>

                        <td style={responsiveStyles.td}>{branch.phone || "—"}</td>

                        <td style={responsiveStyles.td}>{branch.managerName || "—"}</td>

                        <td style={responsiveStyles.td}>
                          <span style={getStatusClass(branch.status)}>
                            {branch.status || "—"}
                          </span>
                        </td>

                        <td style={responsiveStyles.td}>
                          <div style={responsiveStyles.actionGroup}>
                            <button
                              style={responsiveStyles.secondaryButton}
                              onClick={() => openEditBranchForm(branch)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            EMPLOYEE MANAGEMENT
        =================================================== */}
        {activeTab === "employees" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Staff Administration</div>

                <h2 style={responsiveStyles.sectionTitle}>Employee Management</h2>

                <p style={responsiveStyles.sectionDescription}>
                  Manage employee accounts, roles, branches and account status.
                </p>
              </div>

              <button
                style={responsiveStyles.primaryButton}
                onClick={openAddEmployeeForm}
              >
                + Add Employee
              </button>
            </div>

            {employeeSuccess && (
              <div style={responsiveStyles.alertSuccess}>✓ {employeeSuccess}</div>
            )}

            {employeeError && (
              <div style={responsiveStyles.alertError}>⚠ {employeeError}</div>
            )}

            {/* FILTERS */}
            <div style={responsiveStyles.filterBar}>
              <input
                type="text"
                placeholder="Search employee, email, code or branch..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                style={responsiveStyles.input}
              />

              <select
                value={employeeRoleFilter}
                onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                style={responsiveStyles.select}
              >
                <option value="ALL">All Roles</option>

                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={employeeStatusFilter}
                onChange={(e) => setEmployeeStatusFilter(e.target.value)}
                style={responsiveStyles.select}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* EMPLOYEE TABLE */}
            {employeeLoading && (
              <div style={{ padding: "20px", color: "#64748b" }}>
                Loading employees...
              </div>
            )}

            {!employeeLoading && filteredEmployees.length === 0 && (
              <div
                style={{
                  padding: "35px",
                  textAlign: "center",
                  color: "#758298",
                  border: "1px dashed #dce4ed",
                  borderRadius: "12px",
                }}
              >
                No employees found.
              </div>
            )}

            {!employeeLoading && filteredEmployees.length > 0 && (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>Employee</th>
                      <th style={responsiveStyles.th}>Email</th>
                      <th style={responsiveStyles.th}>Role</th>
                      <th style={responsiveStyles.th}>Branch</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee) => {
                      const isActive =
                        String(employee.status || "").toUpperCase() ===
                        "ACTIVE";

                      return (
                        <tr key={employee.id}>
                          <td style={responsiveStyles.td}>
                            <div
                              style={{
                                fontWeight: 750,
                                color: "#1e2d43",
                              }}
                            >
                              {employee.fullName || "—"}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#7a8799",
                                marginTop: "3px",
                              }}
                            >
                              {employee.employeeCode || "—"}
                            </div>
                          </td>

                          <td style={responsiveStyles.td}>{employee.email || "—"}</td>

                          <td style={responsiveStyles.td}>
                            <span
                              style={{
                                display: "inline-flex",
                                background: "#eef5ff",
                                color: "#1261bf",
                                borderRadius: "7px",
                                padding: "5px 8px",
                                fontSize: "10px",
                                fontWeight: 800,
                              }}
                            >
                              {employee.role || "—"}
                            </span>
                          </td>

                          <td style={responsiveStyles.td}>
                            {employee.branchCode || "—"}
                          </td>

                          <td style={responsiveStyles.td}>
                            <span style={getStatusClass(employee.status)}>
                              {employee.status || "—"}
                            </span>
                          </td>

                          <td style={responsiveStyles.td}>
                            <div style={responsiveStyles.actionGroup}>
                              <button
                                style={responsiveStyles.secondaryButton}
                                onClick={() => handleViewEmployee(employee)}
                              >
                                View
                              </button>

                              <button
                                style={responsiveStyles.secondaryButton}
                                onClick={() => openEditEmployeeForm(employee)}
                              >
                                Edit
                              </button>

                              <button
                                style={
                                  isActive
                                    ? styles.dangerButton
                                    : styles.successButton
                                }
                                onClick={() =>
                                  handleEmployeeStatusChange(employee)
                                }
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            CASH COUNTERS
        =================================================== */}

        {activeTab === "cash-counters" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Branch Operations</div>
                <h2 style={responsiveStyles.sectionTitle}>Cash Counter Management</h2>
                <p style={responsiveStyles.sectionDescription}>
                  Manage branch cash counters, balances and cashier assignments.
                </p>
              </div>
              <button
                type="button"
                style={responsiveStyles.primaryButton}
                onClick={openAddCashCounterForm}
              >
                + Add Cash Counter
              </button>
            </div>

            {cashCounterSuccess && (
              <div style={responsiveStyles.alertSuccess}>{cashCounterSuccess}</div>
            )}
            {cashCounterError && (
              <div style={responsiveStyles.alertError}>{cashCounterError}</div>
            )}

            <div style={responsiveStyles.filterBar}>
              <input
                style={responsiveStyles.input}
                value={cashCounterSearch}
                onChange={(e) => setCashCounterSearch(e.target.value)}
                placeholder="Search counter, branch or cashier..."
              />
              <select
                style={responsiveStyles.select}
                value={cashCounterBranchFilter}
                onChange={(e) => setCashCounterBranchFilter(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.branchCode}>
                    {branch.branchCode} - {branch.branchName}
                  </option>
                ))}
              </select>
              <select
                style={responsiveStyles.select}
                value={cashCounterStatusFilter}
                onChange={(e) => setCashCounterStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {cashCounterLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px",
                  color: "#718096",
                }}
              >
                Loading cash counters...
              </div>
            ) : filteredCashCounters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "45px" }}>
                <div style={responsiveStyles.placeholderIcon}>💵</div>
                <h3 style={responsiveStyles.placeholderTitle}>No Cash Counters Found</h3>
                <p style={responsiveStyles.placeholderText}>
                  Create a cash counter to start managing branch cash
                  operations.
                </p>
              </div>
            ) : (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>Counter</th>
                      <th style={responsiveStyles.th}>Branch</th>
                      <th style={responsiveStyles.th}>Cashier</th>
                      <th style={responsiveStyles.th}>Opening Balance</th>
                      <th style={responsiveStyles.th}>Current Balance</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCashCounters.map((counter) => (
                      <tr key={counter.id}>
                        <td style={responsiveStyles.td}>
                          <strong>{counter.counterCode}</strong>
                          <div
                            style={{
                              marginTop: "3px",
                              color: "#718096",
                              fontSize: "12px",
                            }}
                          >
                            {counter.counterName}
                          </div>
                        </td>
                        <td style={responsiveStyles.td}>{counter.branchCode || "—"}</td>
                        <td style={responsiveStyles.td}>
                          {counter.assignedEmployeeCode || "Not Assigned"}
                        </td>
                        <td style={responsiveStyles.td}>
                          <span style={responsiveStyles.moneyValue}>
                            {formatCurrency(counter.openingBalance)}
                          </span>
                        </td>
                        <td style={responsiveStyles.td}>
                          <span style={responsiveStyles.moneyValue}>
                            {formatCurrency(counter.currentBalance)}
                          </span>
                        </td>
                        <td style={responsiveStyles.td}>
                          <span style={getStatusClass(counter.status)}>
                            {String(counter.status || "UNKNOWN").toUpperCase()}
                          </span>
                        </td>
                        <td style={responsiveStyles.td}>
                          <div style={responsiveStyles.actionGroup}>
                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => handleViewCashCounter(counter)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => openEditCashCounterForm(counter)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => openAssignCashierForm(counter)}
                            >
                              Assign
                            </button>
                            {String(counter.status || "").toUpperCase() ===
                            "ACTIVE" ? (
                              <button
                                type="button"
                                style={responsiveStyles.dangerButton}
                                onClick={() =>
                                  handleCashCounterStatusChange(counter)
                                }
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                style={responsiveStyles.successButton}
                                onClick={() =>
                                  handleCashCounterStatusChange(counter)
                                }
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            ATM MONITORING
        =================================================== */}
        {activeTab === "atms" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>ATM Operations</div>
                <h2 style={responsiveStyles.sectionTitle}>ATM Monitoring</h2>
                <p style={responsiveStyles.sectionDescription}>
                  Monitor ATM status, cash availability and maintenance.
                </p>
              </div>

              <button
                type="button"
                style={responsiveStyles.primaryButton}
                onClick={openAddAtmForm}
              >
                + Add ATM
              </button>
            </div>

            {atmSuccess && (
              <div style={responsiveStyles.alertSuccess}>✓ {atmSuccess}</div>
            )}

            {atmError && <div style={responsiveStyles.alertError}>⚠ {atmError}</div>}

            <div style={responsiveStyles.filterBar}>
              <input
                style={responsiveStyles.input}
                value={atmSearch}
                onChange={(e) => setAtmSearch(e.target.value)}
                placeholder="Search ATM, branch or location..."
              />

              <select
                style={responsiveStyles.select}
                value={atmBranchFilter}
                onChange={(e) => setAtmBranchFilter(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.branchCode}>
                    {branch.branchCode} - {branch.branchName}
                  </option>
                ))}
              </select>

              <select
                style={responsiveStyles.select}
                value={atmStatusFilter}
                onChange={(e) => setAtmStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {atmLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px",
                  color: "#718096",
                }}
              >
                Loading ATMs...
              </div>
            ) : filteredAtms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "45px" }}>
                <div style={responsiveStyles.placeholderIcon}>🏧</div>
                <h3 style={responsiveStyles.placeholderTitle}>No ATMs Found</h3>
                <p style={responsiveStyles.placeholderText}>
                  Add an ATM to start monitoring branch ATM operations.
                </p>
              </div>
            ) : (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>ATM</th>
                      <th style={responsiveStyles.th}>Branch</th>
                      <th style={responsiveStyles.th}>Location</th>
                      <th style={responsiveStyles.th}>Cash Balance</th>
                      <th style={responsiveStyles.th}>Maintenance</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAtms.map((atm) => (
                      <tr key={atm.id}>
                        <td style={responsiveStyles.td}>
                          <strong>{atm.atmCode}</strong>
                          <div
                            style={{
                              marginTop: "3px",
                              color: "#718096",
                              fontSize: "12px",
                            }}
                          >
                            {atm.atmName}
                          </div>
                        </td>

                        <td style={responsiveStyles.td}>{atm.branchCode || "—"}</td>

                        <td style={responsiveStyles.td}>{atm.location || "—"}</td>

                        <td style={responsiveStyles.td}>
                          <span style={responsiveStyles.moneyValue}>
                            {formatCurrency(atm.cashBalance)}
                          </span>
                        </td>

                        <td style={responsiveStyles.td}>
                          <span style={responsiveStyles.maintenanceText}>
                            {formatDate(atm.lastMaintenanceAt)}
                          </span>
                        </td>

                        <td style={responsiveStyles.td}>
                          <span style={getStatusClass(atm.status)}>
                            {String(atm.status || "UNKNOWN").toUpperCase()}
                          </span>
                        </td>

                        <td style={responsiveStyles.td}>
                          <div style={responsiveStyles.actionGroup}>
                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => handleViewAtm(atm)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => openEditAtmForm(atm)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              style={responsiveStyles.secondaryButton}
                              onClick={() => handleAtmMaintenance(atm)}
                            >
                              Maintenance
                            </button>

                            {String(atm.status || "").toUpperCase() ===
                            "ACTIVE" ? (
                              <button
                                type="button"
                                style={responsiveStyles.dangerButton}
                                onClick={() => handleAtmStatusChange(atm)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                style={responsiveStyles.successButton}
                                onClick={() => handleAtmStatusChange(atm)}
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            VAULT
        =================================================== */}
        {activeTab === "vault" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Security Operations</div>
                <h2 style={responsiveStyles.sectionTitle}>Vault Management</h2>
                <p style={responsiveStyles.sectionDescription}>
                  Manage branch vaults, capacity, status and audit records.
                </p>
              </div>
              <button style={responsiveStyles.primaryButton} onClick={openAddVaultForm}>
                + Add Vault
              </button>
            </div>
            {vaultSuccess && (
              <div style={responsiveStyles.alertSuccess}>✓ {vaultSuccess}</div>
            )}
            {vaultError && <div style={responsiveStyles.alertError}>⚠ {vaultError}</div>}
            <div style={responsiveStyles.filterBar}>
              <input
                style={responsiveStyles.input}
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                placeholder="Search vault, code or branch..."
              />
              <select
                style={responsiveStyles.select}
                value={vaultBranchFilter}
                onChange={(e) => setVaultBranchFilter(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.branchCode}>
                    {b.branchCode}
                  </option>
                ))}
              </select>
              <select
                style={responsiveStyles.select}
                value={vaultStatusFilter}
                onChange={(e) => setVaultStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            {vaultLoading ? (
              <div style={{ padding: "20px", color: "#64748b" }}>
                Loading vaults...
              </div>
            ) : filteredVaults.length === 0 ? (
              <div style={responsiveStyles.emptyState}>No vaults found.</div>
            ) : (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>Vault</th>
                      <th style={responsiveStyles.th}>Branch</th>
                      <th style={responsiveStyles.th}>Capacity</th>
                      <th style={responsiveStyles.th}>Balance</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Last Audit</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVaults.map((v) => (
                      <tr key={v.id}>
                        <td style={responsiveStyles.td}>
                          <strong>{v.vaultCode || "—"}</strong>
                          <div style={responsiveStyles.mutedSmall}>
                            {v.vaultName || "—"}
                          </div>
                        </td>
                        <td style={responsiveStyles.td}>{v.branchCode || "—"}</td>
                        <td style={responsiveStyles.td}>
                          {formatCurrency(v.totalCapacity)}
                        </td>
                        <td style={responsiveStyles.td}>
                          {formatCurrency(v.currentBalance ?? v.vaultBalance)}
                        </td>
                        <td style={responsiveStyles.td}>
                          <span style={getStatusClass(v.status)}>
                            {v.status || "—"}
                          </span>
                        </td>
                        <td style={responsiveStyles.td}>
                          {formatDate(v.lastAuditAt || v.updatedAt)}
                        </td>
                        <td style={responsiveStyles.td}>
                          <div style={responsiveStyles.actionGroup}>
                            <button
                              style={responsiveStyles.secondaryButton}
                              onClick={() => handleViewVault(v)}
                            >
                              View
                            </button>
                            <button
                              style={responsiveStyles.secondaryButton}
                              onClick={() => openEditVaultForm(v)}
                            >
                              Edit
                            </button>
                            <button
                              style={responsiveStyles.secondaryButton}
                              onClick={() => handleVaultAudit(v)}
                            >
                              Audit
                            </button>
                            {String(v.status || "").toUpperCase() ===
                            "ACTIVE" ? (
                              <button
                                style={responsiveStyles.dangerButton}
                                onClick={() => handleVaultStatusChange(v)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                style={responsiveStyles.successButton}
                                onClick={() => handleVaultStatusChange(v)}
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* =================================================== DAILY CLOSING */}
        {activeTab === "daily-closing" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Daily Operations</div>
                <h2 style={responsiveStyles.sectionTitle}>Daily Closing Reports</h2>
                <p style={responsiveStyles.sectionDescription}>
                  Create and review branch end-of-day cash closing reports.
                </p>
              </div>
              <button style={responsiveStyles.primaryButton} onClick={openAddDailyForm}>
                + Create Closing Report
              </button>
            </div>
            {dailySuccess && (
              <div style={responsiveStyles.alertSuccess}>✓ {dailySuccess}</div>
            )}
            {dailyError && <div style={responsiveStyles.alertError}>⚠ {dailyError}</div>}
            <div style={responsiveStyles.filterBar}>
              <input
                style={responsiveStyles.input}
                value={dailySearch}
                onChange={(e) => setDailySearch(e.target.value)}
                placeholder="Search branch, employee or date..."
              />
              <select
                style={responsiveStyles.select}
                value={dailyBranchFilter}
                onChange={(e) => setDailyBranchFilter(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.branchCode}>
                    {b.branchCode}
                  </option>
                ))}
              </select>
              <select
                style={responsiveStyles.select}
                value={dailyStatusFilter}
                onChange={(e) => setDailyStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            {dailyLoading ? (
              <div style={{ padding: "20px", color: "#64748b" }}>
                Loading reports...
              </div>
            ) : filteredDailyReports.length === 0 ? (
              <div style={responsiveStyles.emptyState}>
                No daily closing reports found.
              </div>
            ) : (
              <div style={responsiveStyles.tableWrapper}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr>
                      <th style={responsiveStyles.th}>Date</th>
                      <th style={responsiveStyles.th}>Branch</th>
                      <th style={responsiveStyles.th}>Opening Cash</th>
                      <th style={responsiveStyles.th}>Received</th>
                      <th style={responsiveStyles.th}>Paid</th>
                      <th style={responsiveStyles.th}>Transactions</th>
                      <th style={responsiveStyles.th}>Status</th>
                      <th style={responsiveStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailyReports.map((r) => (
                      <tr key={r.id}>
                        <td style={responsiveStyles.td}>{r.closingDate || "—"}</td>
                        <td style={responsiveStyles.td}>{r.branchCode || "—"}</td>
                        <td style={responsiveStyles.td}>
                          {formatCurrency(r.openingCash)}
                        </td>
                        <td style={responsiveStyles.td}>
                          {formatCurrency(r.cashReceived)}
                        </td>
                        <td style={responsiveStyles.td}>{formatCurrency(r.cashPaid)}</td>
                        <td style={responsiveStyles.td}>{r.totalTransactions ?? "—"}</td>
                        <td style={responsiveStyles.td}>
                          {r.status ? (
                            <span style={getStatusClass(r.status)}>
                              {r.status}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={responsiveStyles.td}>
                          <button
                            style={responsiveStyles.secondaryButton}
                            onClick={() => handleViewDailyReport(r)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* =================================================== ANALYTICS */}
        {activeTab === "analytics" && (
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Branch Intelligence</div>
                <h2 style={responsiveStyles.sectionTitle}>Branch Analytics</h2>
                <p style={responsiveStyles.sectionDescription}>
                  View operational metrics for a selected branch.
                </p>
              </div>
            </div>
            {analyticsError && (
              <div style={responsiveStyles.alertError}>⚠ {analyticsError}</div>
            )}
            <div style={responsiveStyles.analyticsSelector}>
              <select
                style={responsiveStyles.select}
                value={analyticsBranch}
                onChange={(e) => setAnalyticsBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.branchCode}>
                    {b.branchCode} - {b.branchName}
                  </option>
                ))}
              </select>
              <button
                style={responsiveStyles.primaryButton}
                disabled={!analyticsBranch || analyticsLoading}
                onClick={() => fetchBranchAnalytics()}
              >
                {analyticsLoading ? "Loading..." : "Load Analytics"}
              </button>
            </div>
            {!analytics && !analyticsLoading && (
              <div style={responsiveStyles.analyticsEmpty}>
                <div style={responsiveStyles.placeholderIcon}>📈</div>
                <h3 style={responsiveStyles.placeholderTitle}>Select a branch</h3>
                <p style={responsiveStyles.placeholderText}>
                  Choose a branch above to load its latest analytics.
                </p>
              </div>
            )}
            {analyticsLoading && (
              <div style={responsiveStyles.emptyState}>Loading branch analytics...</div>
            )}
            {analytics && !analyticsLoading && (
              <>
                <div style={responsiveStyles.analyticsHero}>
                  <div>
                    <div style={responsiveStyles.analyticsCode}>
                      {analytics.branchCode || "—"}
                    </div>
                    <h3>{analytics.branchName || "Branch"}</h3>
                    <p>
                      {[analytics.city, analytics.state]
                        .filter(Boolean)
                        .join(", ") || "Location unavailable"}
                    </p>
                  </div>
                  <span style={getStatusClass(analytics.status)}>
                    {analytics.status || "—"}
                  </span>
                </div>
                <div style={responsiveStyles.analyticsGrid}>
                  {[
                    ["Total Employees", analytics.totalEmployees],
                    ["Active Employees", analytics.activeEmployees],
                    [
                      "Cash Counters",
                      `${analytics.activeCashCounters ?? 0} / ${analytics.totalCashCounters ?? 0}`,
                    ],
                    [
                      "ATMs",
                      `${analytics.activeATMs ?? 0} / ${analytics.totalATMs ?? 0}`,
                    ],
                    [
                      "Vaults",
                      `${analytics.activeVaults ?? 0} / ${analytics.totalVaults ?? 0}`,
                    ],
                    [
                      "Vault Capacity",
                      formatCurrency(analytics.totalVaultCapacity),
                    ],
                    [
                      "Vault Balance",
                      formatCurrency(analytics.totalVaultBalance),
                    ],
                    [
                      "Latest Closing Cash",
                      formatCurrency(analytics.latestClosingCash),
                    ],
                    [
                      "Latest Transactions",
                      analytics.latestTransactionCount ?? "—",
                    ],
                  ].map(([label, value]) => (
                    <div style={responsiveStyles.analyticsCard} key={label}>
                      <div style={responsiveStyles.detailLabel}>{label}</div>
                      <div style={responsiveStyles.analyticsValue}>{value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* =====================================================
          VAULT FORM MODAL
      ===================================================== */}
      {showVaultForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={responsiveStyles.modal}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Security Operations</div>
                <h3 style={responsiveStyles.modalTitle}>
                  {editingVault ? "Edit Vault" : "Add Vault"}
                </h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowVaultForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleVaultSubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Vault Code *</label>
                  <input
                    style={responsiveStyles.input}
                    name="vaultCode"
                    value={vaultFormData.vaultCode}
                    onChange={(e) =>
                      setVaultFormData((p) => ({
                        ...p,
                        vaultCode: e.target.value,
                      }))
                    }
                    required
                    placeholder="e.g. VLT-001"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Vault Name *</label>
                  <input
                    style={responsiveStyles.input}
                    name="vaultName"
                    value={vaultFormData.vaultName}
                    onChange={(e) =>
                      setVaultFormData((p) => ({
                        ...p,
                        vaultName: e.target.value,
                      }))
                    }
                    required
                    placeholder="Main Branch Vault"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch *</label>
                  <select
                    style={responsiveStyles.select}
                    name="branchCode"
                    value={vaultFormData.branchCode}
                    onChange={(e) =>
                      setVaultFormData((p) => ({
                        ...p,
                        branchCode: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.branchCode}>
                        {b.branchCode} - {b.branchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Total Capacity *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    name="totalCapacity"
                    value={vaultFormData.totalCapacity}
                    onChange={(e) =>
                      setVaultFormData((p) => ({
                        ...p,
                        totalCapacity: e.target.value,
                      }))
                    }
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              {vaultError && (
                <div
                  style={{
                    ...styles.alertError,
                    marginTop: "16px",
                    marginBottom: 0,
                  }}
                >
                  {vaultError}
                </div>
              )}
              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => setShowVaultForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={vaultSaving}
                >
                  {vaultSaving
                    ? "Saving..."
                    : editingVault
                      ? "Update Vault"
                      : "Create Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== DAILY CLOSING FORM */}
      {showDailyForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: "920px" }}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Daily Operations</div>
                <h3 style={responsiveStyles.modalTitle}>Create Daily Closing Report</h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowDailyForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleDailySubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch Code *</label>
                  <select
                    style={responsiveStyles.select}
                    name="branchCode"
                    value={dailyFormData.branchCode}
                    onChange={handleDailyChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.branchCode}>
                        {b.branchCode} - {b.branchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Closing Date *</label>
                  <input
                    style={responsiveStyles.input}
                    type="date"
                    name="closingDate"
                    value={dailyFormData.closingDate}
                    onChange={handleDailyChange}
                    required
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Opening Cash *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    name="openingCash"
                    value={dailyFormData.openingCash}
                    onChange={handleDailyChange}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Cash Received *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    name="cashReceived"
                    value={dailyFormData.cashReceived}
                    onChange={handleDailyChange}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Cash Paid *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    name="cashPaid"
                    value={dailyFormData.cashPaid}
                    onChange={handleDailyChange}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Total Transactions *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    min="0"
                    step="1"
                    name="totalTransactions"
                    value={dailyFormData.totalTransactions}
                    onChange={handleDailyChange}
                    required
                    placeholder="0"
                  />
                </div>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Closed By Employee Code</label>
                  <input
                    style={responsiveStyles.input}
                    name="closedByEmployeeCode"
                    value={dailyFormData.closedByEmployeeCode}
                    onChange={handleDailyChange}
                    placeholder="e.g. AVN-EMP-001"
                  />
                </div>
              </div>
              {dailyError && (
                <div
                  style={{
                    ...styles.alertError,
                    marginTop: "16px",
                    marginBottom: 0,
                  }}
                >
                  {dailyError}
                </div>
              )}
              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => setShowDailyForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={dailySaving}
                >
                  {dailySaving ? "Saving..." : "Create Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== VAULT DETAILS */}
      {showVaultDetails && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: "850px" }}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Vault</div>
                <h3 style={responsiveStyles.modalTitle}>Vault Details</h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowVaultDetails(false)}
              >
                ×
              </button>
            </div>
            {vaultDetailLoading ? (
              <div style={responsiveStyles.emptyState}>Loading details...</div>
            ) : selectedVault ? (
              <div style={responsiveStyles.detailGrid}>
                {[
                  ["Vault Code", selectedVault.vaultCode],
                  ["Vault Name", selectedVault.vaultName],
                  ["Branch", selectedVault.branchCode],
                  [
                    "Total Capacity",
                    formatCurrency(selectedVault.totalCapacity),
                  ],
                  [
                    "Vault Balance",
                    formatCurrency(
                      selectedVault.currentBalance ??
                        selectedVault.vaultBalance,
                    ),
                  ],
                  ["Status", selectedVault.status],
                  ["Last Audit", formatDate(selectedVault.lastAuditAt)],
                  ["Created At", formatDate(selectedVault.createdAt)],
                  ["Updated At", formatDate(selectedVault.updatedAt)],
                ].map(([l, v]) => (
                  <div style={responsiveStyles.detailItem} key={l}>
                    <div style={responsiveStyles.detailLabel}>{l}</div>
                    <div style={responsiveStyles.detailValue}>
                      {l === "Status" ? (
                        <span style={getStatusClass(v)}>{v || "—"}</span>
                      ) : (
                        v || "—"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={responsiveStyles.emptyState}>Vault details unavailable.</div>
            )}
            <div style={responsiveStyles.modalFooter}>
              <button
                type="button"
                style={responsiveStyles.secondaryButton}
                onClick={() => setShowVaultDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== DAILY DETAILS */}
      {showDailyDetails && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: "850px" }}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Daily Closing</div>
                <h3 style={responsiveStyles.modalTitle}>Report Details</h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowDailyDetails(false)}
              >
                ×
              </button>
            </div>
            {dailyDetailLoading ? (
              <div style={responsiveStyles.emptyState}>Loading details...</div>
            ) : selectedDailyReport ? (
              <div style={responsiveStyles.detailGrid}>
                {[
                  ["Branch", selectedDailyReport.branchCode],
                  ["Closing Date", selectedDailyReport.closingDate],
                  [
                    "Opening Cash",
                    formatCurrency(selectedDailyReport.openingCash),
                  ],
                  [
                    "Cash Received",
                    formatCurrency(selectedDailyReport.cashReceived),
                  ],
                  ["Cash Paid", formatCurrency(selectedDailyReport.cashPaid)],
                  ["Total Transactions", selectedDailyReport.totalTransactions],
                  ["Closed By", selectedDailyReport.closedByEmployeeCode],
                  ["Status", selectedDailyReport.status],
                  [
                    "Closing Cash",
                    formatCurrency(
                      selectedDailyReport.closingCash ??
                        selectedDailyReport.closingBalance,
                    ),
                  ],
                  ["Created At", formatDate(selectedDailyReport.createdAt)],
                ].map(([l, v]) => (
                  <div style={responsiveStyles.detailItem} key={l}>
                    <div style={responsiveStyles.detailLabel}>{l}</div>
                    <div style={responsiveStyles.detailValue}>
                      {l === "Status" && v ? (
                        <span style={getStatusClass(v)}>{v}</span>
                      ) : (
                        (v ?? "—")
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={responsiveStyles.emptyState}>Report details unavailable.</div>
            )}
            <div style={responsiveStyles.modalFooter}>
              <button
                type="button"
                style={responsiveStyles.secondaryButton}
                onClick={() => setShowDailyDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ATM FORM MODAL
      ===================================================== */}
      {showAtmForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={responsiveStyles.modal}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>ATM Operations</div>
                <h3 style={responsiveStyles.modalTitle}>
                  {editingAtm ? "Edit ATM" : "Add ATM"}
                </h3>
              </div>

              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => {
                  setShowAtmForm(false);
                  setEditingAtm(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAtmSubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>ATM Code *</label>
                  <input
                    style={responsiveStyles.input}
                    name="atmCode"
                    value={atmFormData.atmCode}
                    onChange={handleAtmChange}
                    placeholder="e.g. ATM-001"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>ATM Name *</label>
                  <input
                    style={responsiveStyles.input}
                    name="atmName"
                    value={atmFormData.atmName}
                    onChange={handleAtmChange}
                    placeholder="Main Branch ATM"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch *</label>
                  <select
                    style={responsiveStyles.select}
                    name="branchCode"
                    value={atmFormData.branchCode}
                    onChange={handleAtmChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.branchCode}>
                        {branch.branchCode} - {branch.branchName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Location *</label>
                  <input
                    style={responsiveStyles.input}
                    name="location"
                    value={atmFormData.location}
                    onChange={handleAtmChange}
                    placeholder="Ground Floor, Main Entrance"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Cash Balance *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    name="cashBalance"
                    min="0"
                    step="0.01"
                    value={atmFormData.cashBalance}
                    onChange={handleAtmChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div style={responsiveStyles.infoNote}>
                  New ATMs are created as ACTIVE by the backend. Status can be
                  changed separately using Activate / Deactivate.
                </div>
              </div>

              {atmError && (
                <div
                  style={{
                    ...styles.alertError,
                    marginTop: "16px",
                    marginBottom: 0,
                  }}
                >
                  {atmError}
                </div>
              )}

              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => {
                    setShowAtmForm(false);
                    setEditingAtm(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={atmSaving}
                >
                  {atmSaving
                    ? "Saving..."
                    : editingAtm
                      ? "Update ATM"
                      : "Create ATM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ATM DETAILS MODAL
      ===================================================== */}
      {showAtmDetails && (
        <div style={responsiveStyles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              maxWidth: "920px",
              padding: "20px",
            }}
          >
            <div
              style={{
                ...styles.modalHeader,
                marginBottom: "14px",
              }}
            >
              <div>
                <div style={responsiveStyles.sectionEyebrow}>ATM Operations</div>
                <h3 style={responsiveStyles.modalTitle}>ATM Details</h3>
              </div>

              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowAtmDetails(false)}
              >
                ×
              </button>
            </div>

            {atmDetailLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "35px",
                  color: "#718096",
                }}
              >
                Loading details...
              </div>
            ) : selectedAtm ? (
              <div style={responsiveStyles.atmDetailGrid}>
                {[
                  ["ATM Code", selectedAtm.atmCode || "—"],
                  ["ATM Name", selectedAtm.atmName || "—"],
                  ["Branch", selectedAtm.branchCode || "—"],
                  ["Location", selectedAtm.location || "—"],
                  ["Cash Balance", formatCurrency(selectedAtm.cashBalance)],
                  [
                    "Last Maintenance",
                    formatDate(selectedAtm.lastMaintenanceAt),
                  ],
                  ["Created At", formatDate(selectedAtm.createdAt)],
                  ["Updated At", formatDate(selectedAtm.updatedAt)],
                ].map(([label, value]) => (
                  <div style={responsiveStyles.detailItem} key={label}>
                    <div style={responsiveStyles.detailLabel}>{label}</div>
                    <div style={responsiveStyles.detailValue}>{value}</div>
                  </div>
                ))}

                <div style={responsiveStyles.detailItem}>
                  <div style={responsiveStyles.detailLabel}>Status</div>
                  <div style={responsiveStyles.detailValue}>
                    <span style={getStatusClass(selectedAtm.status)}>
                      {String(selectedAtm.status || "UNKNOWN").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#718096",
                }}
              >
                ATM details unavailable.
              </div>
            )}

            <div style={responsiveStyles.modalFooter}>
              <button
                type="button"
                style={responsiveStyles.secondaryButton}
                onClick={() => setShowAtmDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BRANCH FORM MODAL
      ===================================================== */}
      {showBranchForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={responsiveStyles.modal}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Branch Management</div>

                <h2 style={responsiveStyles.modalTitle}>
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h2>
              </div>

              <button
                style={responsiveStyles.closeButton}
                onClick={() => {
                  setShowBranchForm(false);
                  setEditingBranch(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBranchSubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch Code *</label>

                  <input
                    name="branchCode"
                    value={branchFormData.branchCode}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="e.g. AVN-VNS-001"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch Name *</label>

                  <input
                    name="branchName"
                    value={branchFormData.branchName}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="Branch name"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Phone</label>

                  <input
                    name="phone"
                    value={branchFormData.phone}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="Branch phone"
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={branchFormData.email}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="branch@avanibank.com"
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>City *</label>

                  <input
                    name="city"
                    value={branchFormData.city}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="City"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>State *</label>

                  <input
                    name="state"
                    value={branchFormData.state}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="State"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Pincode</label>

                  <input
                    name="pincode"
                    value={branchFormData.pincode}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="Pincode"
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Manager Name</label>

                  <input
                    name="managerName"
                    value={branchFormData.managerName}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="Branch manager"
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Status</label>

                  <select
                    name="status"
                    value={branchFormData.status}
                    onChange={handleBranchChange}
                    style={responsiveStyles.select}
                  >
                    <option value="ACTIVE">ACTIVE</option>

                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div
                  style={{
                    ...styles.formGroup,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={responsiveStyles.label}>Address</label>

                  <input
                    name="address"
                    value={branchFormData.address}
                    onChange={handleBranchChange}
                    style={responsiveStyles.input}
                    placeholder="Complete branch address"
                  />
                </div>
              </div>

              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => {
                    setShowBranchForm(false);
                    setEditingBranch(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingBranch
                      ? "Update Branch"
                      : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPLOYEE FORM MODAL
      ===================================================== */}
      {showEmployeeForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={responsiveStyles.modal}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Staff Administration</div>

                <h2 style={responsiveStyles.modalTitle}>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h2>
              </div>

              <button
                style={responsiveStyles.closeButton}
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                  setEmployeeFormData(emptyEmployeeForm);
                }}
              >
                ×
              </button>
            </div>

            {employeeError && (
              <div style={responsiveStyles.alertError}>⚠ {employeeError}</div>
            )}

            <form onSubmit={handleEmployeeSubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Employee Code *</label>

                  <input
                    name="employeeCode"
                    value={employeeFormData.employeeCode}
                    onChange={handleEmployeeChange}
                    style={responsiveStyles.input}
                    placeholder="AVN-EMP-001"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Full Name *</label>

                  <input
                    name="fullName"
                    value={employeeFormData.fullName}
                    onChange={handleEmployeeChange}
                    style={responsiveStyles.input}
                    placeholder="Employee full name"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Email *</label>

                  <input
                    type="email"
                    name="email"
                    value={employeeFormData.email}
                    onChange={handleEmployeeChange}
                    style={responsiveStyles.input}
                    placeholder="employee@avanibank.com"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Role *</label>

                  <select
                    name="role"
                    value={employeeFormData.role}
                    onChange={handleEmployeeChange}
                    style={responsiveStyles.select}
                    required
                  >
                    <option value="">Select Role</option>

                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch *</label>

                  <select
                    name="branchCode"
                    value={employeeFormData.branchCode}
                    onChange={handleEmployeeChange}
                    style={responsiveStyles.select}
                    required
                  >
                    <option value="">Select Branch</option>

                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.branchCode}>
                        {branch.branchCode}
                        {branch.branchName ? ` — ${branch.branchName}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>
                    {editingEmployee ? "New Password" : "Password *"}
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={employeeFormData.password}
                      onChange={handleEmployeeChange}
                      style={{
                        ...styles.input,
                        paddingRight: "70px",
                      }}
                      placeholder={
                        editingEmployee
                          ? "Leave blank to keep current"
                          : "Enter password"
                      }
                      required={!editingEmployee}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        position: "absolute",
                        right: "6px",
                        top: "5px",
                        border: "none",
                        background: "#f2f5f9",
                        color: "#52627a",
                        padding: "7px 9px",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "15px",
                  background: "#f7faff",
                  border: "1px solid #dbeafe",
                  borderRadius: "10px",
                  padding: "11px 13px",
                  color: "#52627a",
                  fontSize: "12px",
                }}
              >
                <strong>Security:</strong> Passwords are handled by the backend
                using secure password hashing. Passwords are never displayed in
                the employee table.
              </div>

              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                    setEmployeeFormData(emptyEmployeeForm);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={employeeSaving}
                >
                  {employeeSaving
                    ? "Saving..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          CASH COUNTER FORM MODAL
      ===================================================== */}
      {showCashCounterForm && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={responsiveStyles.modal}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Branch Operations</div>
                <h3 style={responsiveStyles.modalTitle}>
                  {editingCashCounter
                    ? "Edit Cash Counter"
                    : "Add Cash Counter"}
                </h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => {
                  setShowCashCounterForm(false);
                  setEditingCashCounter(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCashCounterSubmit}>
              <div style={responsiveStyles.formGrid}>
                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Counter Code *</label>
                  <input
                    style={responsiveStyles.input}
                    name="counterCode"
                    value={cashCounterFormData.counterCode}
                    onChange={handleCashCounterChange}
                    placeholder="e.g. CC-001"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Counter Name *</label>
                  <input
                    style={responsiveStyles.input}
                    name="counterName"
                    value={cashCounterFormData.counterName}
                    onChange={handleCashCounterChange}
                    placeholder="Main Cash Counter"
                    required
                  />
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Branch *</label>
                  <select
                    style={responsiveStyles.select}
                    name="branchCode"
                    value={cashCounterFormData.branchCode}
                    onChange={(e) => {
                      handleCashCounterChange(e);
                      setCashCounterFormData((prev) => ({
                        ...prev,
                        assignedEmployeeCode: "",
                      }));
                    }}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.branchCode}>
                        {branch.branchCode} - {branch.branchName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Assign Cashier</label>
                  <select
                    style={responsiveStyles.select}
                    name="assignedEmployeeCode"
                    value={cashCounterFormData.assignedEmployeeCode}
                    onChange={handleCashCounterChange}
                  >
                    <option value="">No Cashier Assigned</option>
                    {getCashiersForBranch(cashCounterFormData.branchCode).map(
                      (employee) => (
                        <option key={employee.id} value={employee.employeeCode}>
                          {employee.employeeCode} - {employee.fullName}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div style={responsiveStyles.formGroup}>
                  <label style={responsiveStyles.label}>Opening Balance *</label>
                  <input
                    style={responsiveStyles.input}
                    type="number"
                    name="openingBalance"
                    min="0"
                    step="0.01"
                    value={cashCounterFormData.openingBalance}
                    onChange={handleCashCounterChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div style={responsiveStyles.infoNote}>
                  Current balance is initialized by the backend from the opening
                  balance. Status is managed separately.
                </div>
              </div>

              {cashCounterError && (
                <div
                  style={{
                    ...styles.alertError,
                    marginTop: "16px",
                    marginBottom: 0,
                  }}
                >
                  {cashCounterError}
                </div>
              )}

              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => {
                    setShowCashCounterForm(false);
                    setEditingCashCounter(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={cashCounterSaving}
                >
                  {cashCounterSaving
                    ? "Saving..."
                    : editingCashCounter
                      ? "Update Counter"
                      : "Create Counter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ASSIGN CASHIER MODAL
      ===================================================== */}
      {showCashierAssignForm && cashierAssignCounter && (
        <div style={responsiveStyles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: "620px" }}>
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Cash Counter</div>
                <h3 style={responsiveStyles.modalTitle}>Assign Cashier</h3>
              </div>
              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowCashierAssignForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssignCashier}>
              <div style={responsiveStyles.detailGrid}>
                <div style={responsiveStyles.detailItem}>
                  <div style={responsiveStyles.detailLabel}>Counter</div>
                  <div style={responsiveStyles.detailValue}>
                    {cashierAssignCounter.counterCode}
                  </div>
                </div>
                <div style={responsiveStyles.detailItem}>
                  <div style={responsiveStyles.detailLabel}>Branch</div>
                  <div style={responsiveStyles.detailValue}>
                    {cashierAssignCounter.branchCode}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={responsiveStyles.label}>Active Cashier</label>
                <select
                  style={responsiveStyles.select}
                  value={cashierAssignEmployeeCode}
                  onChange={(e) => setCashierAssignEmployeeCode(e.target.value)}
                >
                  <option value="">No Cashier Assigned</option>
                  {getCashiersForBranch(cashierAssignCounter.branchCode).map(
                    (employee) => (
                      <option key={employee.id} value={employee.employeeCode}>
                        {employee.employeeCode} - {employee.fullName}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {getCashiersForBranch(cashierAssignCounter.branchCode).length ===
                0 && (
                <div style={{ ...styles.infoNote, marginTop: "14px" }}>
                  No active CASHIER is available in this branch.
                </div>
              )}

              <div style={responsiveStyles.modalFooter}>
                <button
                  type="button"
                  style={responsiveStyles.secondaryButton}
                  onClick={() => setShowCashierAssignForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={responsiveStyles.primaryButton}
                  disabled={cashierAssignSaving}
                >
                  {cashierAssignSaving ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          CASH COUNTER DETAILS MODAL
      ===================================================== */}
      {showCashCounterDetails && (
        <div style={responsiveStyles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              maxWidth: "920px",
              padding: "20px",
            }}
          >
            <div style={{ ...styles.modalHeader, marginBottom: "14px" }}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Cash Counter</div>
                <h3 style={responsiveStyles.modalTitle}>Cash Counter Details</h3>
              </div>

              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={() => setShowCashCounterDetails(false)}
              >
                ×
              </button>
            </div>
            <hr style={{ border: 'none', borderTop: '2px solid #4d6ed9', margin: '20px 0' }} />

            {cashCounterDetailLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "35px",
                  color: "#718096",
                }}
              >
                Loading details...
              </div>
            ) : selectedCashCounter ? (
              <div style={responsiveStyles.cashCounterDetailGrid}>
                {[
                  ["Counter Code", selectedCashCounter.counterCode || "—"],
                  ["Counter Name", selectedCashCounter.counterName || "—"],
                  ["Branch", selectedCashCounter.branchCode || "—"],
                  [
                    "Assigned Cashier",
                    selectedCashCounter.assignedEmployeeCode || "Not Assigned",
                  ],
                  [
                    "Opening Balance",
                    formatCurrency(selectedCashCounter.openingBalance),
                  ],
                  [
                    "Current Balance",
                    formatCurrency(selectedCashCounter.currentBalance),
                  ],
                  ["Created At", formatDate(selectedCashCounter.createdAt)],
                  ["Updated At", formatDate(selectedCashCounter.updatedAt)],
                ].map(([label, value]) => (
                  <div style={responsiveStyles.cashCounterDetailItem} key={label}>
                    <div style={responsiveStyles.detailLabel}>{label}</div>
                    <div style={responsiveStyles.detailValue}>{value}</div>
                  </div>
                ))}

                <div style={responsiveStyles.cashCounterDetailItem}>
                  <div style={responsiveStyles.detailLabel}>Status</div>
                  <div style={responsiveStyles.detailValue}>
                    <span style={getStatusClass(selectedCashCounter.status)}>
                      {String(
                        selectedCashCounter.status || "UNKNOWN",
                      ).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#718096",
                }}
              >
                Cash counter details unavailable.
              </div>
            )}

            <div
              style={{
                ...styles.modalFooter,
                marginTop: "14px",
                paddingTop: "12px",
              }}
            >
              <button
                type="button"
                style={responsiveStyles.secondaryButton}
                onClick={() => setShowCashCounterDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPLOYEE DETAILS MODAL
      ===================================================== */}
      {showEmployeeDetails && (
        <div style={responsiveStyles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              maxWidth: "700px",
            }}
          >
            <div style={responsiveStyles.modalHeader}>
              <div>
                <div style={responsiveStyles.sectionEyebrow}>Employee Profile</div>

                <h2 style={responsiveStyles.modalTitle}>Employee Details</h2>
              </div>

              <button
                style={responsiveStyles.closeButton}
                onClick={() => setShowEmployeeDetails(false)}
              >
                ×
              </button>
            </div>

            {employeeDetailLoading && (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading employee details...
              </div>
            )}

            {!employeeDetailLoading && selectedEmployee && (
              <>
                <div style={responsiveStyles.detailGrid}>
                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Employee Code</div>

                    <div style={responsiveStyles.detailValue}>
                      {selectedEmployee.employeeCode || "—"}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Full Name</div>

                    <div style={responsiveStyles.detailValue}>
                      {selectedEmployee.fullName || "—"}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Email</div>

                    <div style={responsiveStyles.detailValue}>
                      {selectedEmployee.email || "—"}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Role</div>

                    <div style={responsiveStyles.detailValue}>
                      {selectedEmployee.role || "—"}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Branch</div>

                    <div style={responsiveStyles.detailValue}>
                      {selectedEmployee.branchCode || "—"}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Status</div>

                    <div style={responsiveStyles.detailValue}>
                      <span style={getStatusClass(selectedEmployee.status)}>
                        {selectedEmployee.status || "—"}
                      </span>
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Created At</div>

                    <div style={responsiveStyles.detailValue}>
                      {formatDate(selectedEmployee.createdAt)}
                    </div>
                  </div>

                  <div style={responsiveStyles.detailItem}>
                    <div style={responsiveStyles.detailLabel}>Updated At</div>

                    <div style={responsiveStyles.detailValue}>
                      {formatDate(selectedEmployee.updatedAt)}
                    </div>
                  </div>
                </div>

                <div style={responsiveStyles.modalFooter}>
                  <button
                    style={responsiveStyles.secondaryButton}
                    onClick={() => {
                      setShowEmployeeDetails(false);
                      openEditEmployeeForm(selectedEmployee);
                    }}
                  >
                    Edit Employee
                  </button>

                  <button
                    style={responsiveStyles.primaryButton}
                    onClick={() => setShowEmployeeDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
