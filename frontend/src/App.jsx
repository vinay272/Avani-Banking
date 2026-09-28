import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransferMoney from "./pages/TransferMoney";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import TransactionHistory from "./pages/TransactionHistory";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Nominee from "./pages/Nominee";
import KYC from "./pages/KYC";
import CustomerRiskProfile from "./pages/CustomerRiskProfile";
import AddressVerification from "./pages/AddressVerification";
import DuplicateKyc from "./pages/DuplicateKyc";
import JointAccount from "./pages/JointAccount";
import CustomerRelationshipHistory from "./pages/CustomerRelationshipHistory";
import BiometricVerification from "./pages/BiometricVerification";
import AmlCheck from "./pages/AmlCheck";
import Beneficiary from "./pages/Beneficiary";
import AccountManagement from "./pages/AccountManagement";
import AccountDetails from "./pages/AccountDetails";
import AccountStatement from "./pages/AccountStatement";
import MiniStatement from "./pages/MiniStatement";
import BalanceInquiry from "./pages/BalanceInquiry";
import InterestCalculation from "./pages/InterestCalculation";
import FixedDeposit from "./pages/FixedDeposit";
import RecurringDeposit from "./pages/RecurringDeposit";
import Payments from "./pages/Payments";
import LoanManagement from "./pages/LoanManagement";
import Cards from "./pages/Cards";
import InvestmentDashboard from "./pages/InvestmentDashboard";
import MutualFund from "./pages/MutualFund"; 
import SIPManagement from "./pages/SIPManagement";
import BondManagement from "./pages/BondManagement";
import GoldInvestment from "./pages/GoldInvestment";
import PortfolioDashboard from "./pages/PortfolioDashboard";
import InvestmentReports from "./pages/InvestmentReports";
import ProfitLossAnalysis from "./pages/ProfitLossAnalysis";
import DividendTracking from "./pages/DividendTracking";
import SecurityCenter from "./pages/SecurityCenter";
import AdminFraudDashboard from "./pages/AdminFraudDashboard";
import AdminLogin from "./pages/AdminLogin";
import CustomerServicePortal from "./pages/CustomerServicePortal";
import AdminCustomerSupport from "./pages/AdminCustomerSupport";
import ComplianceAuditDashboard from "./pages/ComplianceAuditDashboard";
import BranchManagement from "./pages/BranchManagement";
import Notifications from "./pages/Notifications";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />

        {/* =========================
            PROTECTED ROUTES
        ========================= */}
        {/* <Route path="/" element={<RoleSelection />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/security-center"element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>}/>  
        <Route path="/transfer"element={<ProtectedRoute><TransferMoney /></ProtectedRoute>}/>
        <Route path="/payments"element={<ProtectedRoute><Payments /></ProtectedRoute>}/>
        <Route path="/transactions"element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>}/>
        <Route path="/profile"element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/nominee"element={<ProtectedRoute><Nominee /></ProtectedRoute>}/>
        <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
        <Route path="/risk-profile" element={<ProtectedRoute><CustomerRiskProfile /></ProtectedRoute>} />
        <Route path="/address-verification" element={<ProtectedRoute><AddressVerification /></ProtectedRoute>} />
        <Route path="/duplicate-kyc" element={<ProtectedRoute><DuplicateKyc /></ProtectedRoute>} />
        <Route path="/joint-account" element={<ProtectedRoute><JointAccount /></ProtectedRoute>} />
        <Route path="/customer-relationship-history"element={<CustomerRelationshipHistory />}/>
        <Route path="/aml-check" element={<ProtectedRoute><AmlCheck /></ProtectedRoute>} />
        <Route path="/biometric-verification"element={<BiometricVerification />} />
        <Route path="/settings"element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
        <Route path="/loans"element={<ProtectedRoute><LoanManagement /></ProtectedRoute>}/>
        <Route path="/beneficiaries"element={<ProtectedRoute><Beneficiary /></ProtectedRoute>}/>
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/accounts/statements"element={<ProtectedRoute><AccountStatement /></ProtectedRoute>}/>
        <Route path="/accounts"element={<ProtectedRoute><AccountManagement /></ProtectedRoute>}/>
        <Route path="/investments"element={<ProtectedRoute><InvestmentDashboard /></ProtectedRoute>}/>
        <Route path="/investments/mutual-funds"element={<ProtectedRoute><MutualFund /></ProtectedRoute>}/> 
        <Route path="/investments/sip"element={<ProtectedRoute><SIPManagement /></ProtectedRoute>}/>
        <Route path="/investments/bonds"element={<ProtectedRoute><BondManagement /></ProtectedRoute>}/>
        <Route path="/investments/gold"element={<ProtectedRoute><GoldInvestment /></ProtectedRoute>}/>
        <Route path="/investments/portfolio"element={<ProtectedRoute><PortfolioDashboard /></ProtectedRoute>}/>
        <Route path="/investments/reports"element={<ProtectedRoute><InvestmentReports /></ProtectedRoute>}/>
        <Route path="/investments/profit-loss"element={<ProtectedRoute><ProfitLossAnalysis /></ProtectedRoute>}/>
        <Route path="/investments/dividends"element={<ProtectedRoute><DividendTracking /></ProtectedRoute>}/>
        <Route path="/accounts/mini-statement"element={<ProtectedRoute><MiniStatement /></ProtectedRoute>}/>
        <Route path="/accounts/mini-statement"element={<ProtectedRoute><MiniStatement /></ProtectedRoute>}/>
        <Route path="/accounts/balance"element={<ProtectedRoute><BalanceInquiry /></ProtectedRoute>}/>
        <Route path="/accounts/interest"element={<ProtectedRoute><InterestCalculation /></ProtectedRoute>}/>
        <Route path="/accounts/:id/statement"element={<ProtectedRoute><AccountStatement /></ProtectedRoute>}/>
        <Route path="/accounts/:id"element={<ProtectedRoute><AccountDetails /></ProtectedRoute>}/>
        <Route path="/accounts/fixed-deposit"element={<ProtectedRoute><FixedDeposit /></ProtectedRoute>}/>
        <Route path="/accounts/recurring-deposit"element={<RecurringDeposit />}/>
        <Route path="/admin/login"element={<AdminLogin />}/>
        <Route path="/admin/dashboard"element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path="/admin/fraud"element={<ProtectedRoute><AdminFraudDashboard /></ProtectedRoute>}/>
        <Route path="/customer-service"element={<ProtectedRoute><CustomerServicePortal /></ProtectedRoute>}/>
        <Route path="/admin/compliance"element={<ProtectedRoute><ComplianceAuditDashboard /></ProtectedRoute>}/>
        <Route path="/admin/customer-support"element={<ProtectedRoute><AdminCustomerSupport /></ProtectedRoute>}/>
        <Route path="/notifications"element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
        <Route path="/admin/reports"element={<ProtectedRoute><ExecutiveDashboard /></ProtectedRoute>}/>
        <Route path="/admin/branch-management"element={<ProtectedRoute><BranchManagement /></ProtectedRoute>}/>

        {/* =========================
            UNKNOWN ROUTE
        ========================= */}

        <Route path="*" element={<Navigate to="/login" replace  />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
