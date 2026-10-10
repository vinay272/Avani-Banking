import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

const tabs = [
  { id: "overview", icon: "◈", label: "Overview" },
  { id: "tickets", icon: "🎫", label: "My Tickets" },
  { id: "requests", icon: "⚙", label: "Service Requests" },
  { id: "appointment", icon: "📅", label: "Appointment" },
  { id: "chat", icon: "💬", label: "Live Chat" },
  { id: "assistant", icon: "✦", label: "AI Assistant" },
  { id: "feedback", icon: "★", label: "Feedback" },
];

const complaintCategories = [
  "DIGITAL_BANKING",
  "PAYMENT",
  "ACCOUNT",
  "CARD",
  "LOAN",
  "INVESTMENT",
  "KYC",
  "OTHER",
];

const requestTypes = [
  "ADDRESS_UPDATE",
  "PHONE_NUMBER_UPDATE",
  "EMAIL_UPDATE",
  "ACCOUNT_STATEMENT",
  "CHEQUE_BOOK",
  "BANK_CERTIFICATE",
  "KYC_UPDATE",
  "OTHER",
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (
    value === "RESOLVED" ||
    value === "COMPLETED" ||
    value === "CLOSED"
  ) {
    return "status-success";
  }

  if (
    value === "IN_PROGRESS" ||
    value === "PROCESSING"
  ) {
    return "status-progress";
  }

  if (
    value === "CANCELLED" ||
    value === "REJECTED"
  ) {
    return "status-danger";
  }

  return "status-open";
};

function CustomerServicePortal() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };
    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const [activeTab, setActiveTab] = useState("overview");

  const [complaints, setComplaints] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [complaintForm, setComplaintForm] = useState({
    subject: "",
    category: "DIGITAL_BANKING",
    description: "",
    priority: "MEDIUM",
  });

  const [requestForm, setRequestForm] = useState({
    requestType: "ADDRESS_UPDATE",
    description: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    branchCode: "",
    branchName: "",
    appointmentDate: "",
    appointmentTime: "",
    purpose: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    category: "CUSTOMER_SERVICE",
    comments: "",
  });

  const [sessionId] = useState(
    () =>
      `CHAT-${Date.now().toString(36).toUpperCase()}`
  );

  const [chatInput, setChatInput] = useState("");

  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "BOT",
      text:
        "Hello! I'm Avani Assistant. Ask me about UPI, NEFT, RTGS, IMPS, cards, loans, accounts, complaints or other banking services.",
    },
  ]);

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login", {
      replace: true,
    });
  };

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const responseText = await response.text();

    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleAuthError();
      throw new Error("Login session expired.");
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Unable to process your request."
      );
    }

    return data;
  };

  // =====================================================
  // LOAD ALL CUSTOMER DATA
  // =====================================================

  const loadData = async () => {
    if (!token) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const [
        complaintData,
        requestData,
        appointmentData,
        feedbackData,
      ] = await Promise.all([
        apiRequest("/support/complaints"),
        apiRequest("/support/service-requests"),
        apiRequest("/support/appointments"),
        apiRequest("/support/feedback"),
      ]);

      setComplaints(
        Array.isArray(complaintData)
          ? complaintData
          : []
      );

      setServiceRequests(
        Array.isArray(requestData)
          ? requestData
          : []
      );

      setAppointments(
        Array.isArray(appointmentData)
          ? appointmentData
          : []
      );

      setFeedback(
        Array.isArray(feedbackData)
          ? feedbackData
          : []
      );
    } catch (error) {
      console.error(
        "Customer Service Portal Error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to load customer service data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // LIVE CHAT HISTORY
  // =====================================================

  const loadChatHistory = async () => {
    try {
      const data = await apiRequest(
        `/support/chat/${sessionId}`
      );

      setChatMessages(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Chat history error:",
        error
      );
    }
  };

  useEffect(() => {
    if (activeTab !== "chat") {
      return;
    }

    loadChatHistory();

    const interval = setInterval(
      loadChatHistory,
      5000
    );

    return () => clearInterval(interval);
  }, [activeTab, sessionId]);

  // =====================================================
  // COMPLAINT
  // =====================================================

  const handleComplaintChange = (e) => {
    const { name, value } = e.target;

    setComplaintForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessage();
  };

  const submitComplaint = async (e) => {
    e.preventDefault();

    clearMessage();

    if (!complaintForm.subject.trim()) {
      showMessage(
        "Please enter complaint subject.",
        "error"
      );
      return;
    }

    if (!complaintForm.description.trim()) {
      showMessage(
        "Please describe your issue.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest("/support/complaints", {
        method: "POST",
        body: JSON.stringify({
          ...complaintForm,
          subject: complaintForm.subject.trim(),
          description:
            complaintForm.description.trim(),
        }),
      });

      setComplaintForm({
        subject: "",
        category: "DIGITAL_BANKING",
        description: "",
        priority: "MEDIUM",
      });

      showMessage(
        "Complaint registered successfully."
      );

      await loadData();
      setActiveTab("tickets");
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to register complaint.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // SERVICE REQUEST
  // =====================================================

  const submitServiceRequest = async (e) => {
    e.preventDefault();

    clearMessage();

    if (!requestForm.description.trim()) {
      showMessage(
        "Please describe your service request.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest(
        "/support/service-requests",
        {
          method: "POST",
          body: JSON.stringify({
            requestType:
              requestForm.requestType,
            description:
              requestForm.description.trim(),
          }),
        }
      );

      setRequestForm({
        requestType: "ADDRESS_UPDATE",
        description: "",
      });

      showMessage(
        "Service request submitted successfully."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to submit service request.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // APPOINTMENT
  // =====================================================

  const submitAppointment = async (e) => {
    e.preventDefault();

    clearMessage();

    const {
      branchCode,
      branchName,
      appointmentDate,
      appointmentTime,
      purpose,
    } = appointmentForm;

    if (
      !branchCode.trim() ||
      !branchName.trim() ||
      !appointmentDate ||
      !appointmentTime ||
      !purpose.trim()
    ) {
      showMessage(
        "Please complete all appointment fields.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest(
        "/support/appointments",
        {
          method: "POST",
          body: JSON.stringify({
            branchCode: branchCode.trim(),
            branchName: branchName.trim(),
            appointmentDate,
            appointmentTime,
            purpose: purpose.trim(),
          }),
        }
      );

      setAppointmentForm({
        branchCode: "",
        branchName: "",
        appointmentDate: "",
        appointmentTime: "",
        purpose: "",
      });

      showMessage(
        "Branch appointment booked successfully."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to book appointment.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (
      !window.confirm(
        "Do you want to cancel this appointment?"
      )
    ) {
      return;
    }

    try {
      clearMessage();

      await apiRequest(
        `/support/appointments/${id}/cancel`,
        {
          method: "PUT",
        }
      );

      showMessage(
        "Appointment cancelled successfully."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to cancel appointment.",
        "error"
      );
    }
  };

  // =====================================================
  // FEEDBACK
  // =====================================================

  const submitFeedback = async (e) => {
    e.preventDefault();

    clearMessage();

    try {
      setSubmitting(true);

      await apiRequest("/support/feedback", {
        method: "POST",
        body: JSON.stringify({
          rating: Number(feedbackForm.rating),
          category: feedbackForm.category,
          comments:
            feedbackForm.comments.trim(),
        }),
      });

      setFeedbackForm({
        rating: 5,
        category: "CUSTOMER_SERVICE",
        comments: "",
      });

      showMessage(
        "Thank you. Your feedback has been submitted."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to submit feedback.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LIVE CHAT
  // =====================================================

  const sendChatMessage = async (e) => {
    e.preventDefault();

    const text = chatInput.trim();

    if (!text) return;

    try {
      setSubmitting(true);

      await apiRequest(
        "/support/chat/messages",
        {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            message: text,
          }),
        }
      );

      setChatInput("");

      await loadChatHistory();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to send chat message.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // AI ASSISTANT
  // =====================================================

  const askAssistant = async (e) => {
    e.preventDefault();

    const text = assistantInput.trim();

    if (!text) return;

    setAssistantMessages((previous) => [
      ...previous,
      {
        sender: "USER",
        text,
      },
    ]);

    setAssistantInput("");

    try {
      const data = await apiRequest(
        "/support/chatbot",
        {
          method: "POST",
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      setAssistantMessages((previous) => [
        ...previous,
        {
          sender: "BOT",
          text:
            data?.response ||
            data?.message ||
            "I'm unable to answer that right now.",
        },
      ]);
    } catch (error) {
      setAssistantMessages((previous) => [
        ...previous,
        {
          sender: "BOT",
          text:
            error.message ||
            "The banking assistant is temporarily unavailable.",
        },
      ]);
    }
  };

  // =====================================================
  // COUNTERS
  // =====================================================

  const openTickets = useMemo(
    () =>
      complaints.filter(
        (item) =>
          !["RESOLVED", "CLOSED"].includes(
            String(item.status).toUpperCase()
          )
      ).length,
    [complaints]
  );

  const pendingRequests = useMemo(
    () =>
      serviceRequests.filter(
        (item) =>
          !["COMPLETED", "CANCELLED"].includes(
            String(item.status).toUpperCase()
          )
      ).length,
    [serviceRequests]
  );

  const activeAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          !["CANCELLED", "COMPLETED"].includes(
            String(item.status).toUpperCase()
          )
      ).length,
    [appointments]
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{portalStyles}</style>

        <div className={`support-loading-page${darkMode ? " theme-dark" : ""}`}>
          <div className="support-loading-card">
            <div className="support-loader"></div>

            <h2>
              Loading Customer Service
            </h2>

            <p>
              Securely loading your support
              information...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{portalStyles}</style>

      <div className={`support-page${darkMode ? " theme-dark" : ""}`}>
        <div className="support-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="support-header">

            <div className="support-header-content">

              <div>
                <div className="support-eyebrow">
                  AVANI BANK • CUSTOMER SERVICE
                </div>

                <h1>
                  Customer Service Portal
                </h1>

                <p>
                  Get help, manage support tickets,
                  request services and connect with
                  Avani Bank.
                </p>
              </div>

              <button
                className="support-dashboard-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                ← Dashboard
              </button>

            </div>

          </header>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div
              className={`support-message ${
                messageType === "error"
                  ? "support-message-error"
                  : "support-message-success"
              }`}
            >
              <span>
                {messageType === "error"
                  ? "!"
                  : "✓"}
              </span>

              {message}
            </div>
          )}

          {pageError && (
            <div className="support-message support-message-error">
              <span>!</span>
              {pageError}
            </div>
          )}

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="support-tabs">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  activeTab === tab.id
                    ? "support-tab active"
                    : "support-tab"
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

          </div>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    How can we help?
                  </h2>

                  <p>
                    Access all Avani Bank customer
                    support services from one place.
                  </p>
                </div>
              </div>

              <div className="support-stat-grid">

                <div className="support-stat-card">
                  <div className="support-stat-icon blue">
                    🎫
                  </div>

                  <div>
                    <span>Open Tickets</span>
                    <strong>{openTickets}</strong>
                  </div>
                </div>

                <div className="support-stat-card">
                  <div className="support-stat-icon purple">
                    ⚙
                  </div>

                  <div>
                    <span>Pending Requests</span>
                    <strong>
                      {pendingRequests}
                    </strong>
                  </div>
                </div>

                <div className="support-stat-card">
                  <div className="support-stat-icon green">
                    📅
                  </div>

                  <div>
                    <span>Appointments</span>
                    <strong>
                      {activeAppointments}
                    </strong>
                  </div>
                </div>

                <div className="support-stat-card">
                  <div className="support-stat-icon orange">
                    ★
                  </div>

                  <div>
                    <span>Feedback Given</span>
                    <strong>
                      {feedback.length}
                    </strong>
                  </div>
                </div>

              </div>

              <div className="quick-grid">

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("tickets")
                  }
                >
                  <span className="quick-icon">
                    🎫
                  </span>

                  <strong>
                    Raise a Complaint
                  </strong>

                  <p>
                    Report a banking issue and
                    receive a support ticket.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("requests")
                  }
                >
                  <span className="quick-icon">
                    ⚙
                  </span>

                  <strong>
                    Service Request
                  </strong>

                  <p>
                    Submit and track your banking
                    service requests.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("appointment")
                  }
                >
                  <span className="quick-icon">
                    📅
                  </span>

                  <strong>
                    Visit Branch
                  </strong>

                  <p>
                    Book a convenient branch
                    appointment.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("chat")
                  }
                >
                  <span className="quick-icon">
                    💬
                  </span>

                  <strong>
                    Live Support
                  </strong>

                  <p>
                    Connect with Avani Bank
                    customer support.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("assistant")
                  }
                >
                  <span className="quick-icon">
                    ✦
                  </span>

                  <strong>
                    AI Banking Assistant
                  </strong>

                  <p>
                    Get quick answers to common
                    banking questions.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

                <button
                  className="quick-card"
                  onClick={() =>
                    setActiveTab("feedback")
                  }
                >
                  <span className="quick-icon">
                    ★
                  </span>

                  <strong>
                    Share Feedback
                  </strong>

                  <p>
                    Tell us about your Avani Bank
                    experience.
                  </p>

                  <span className="quick-arrow">
                    →
                  </span>
                </button>

              </div>

              <div className="security-note">
                <span>🔒</span>

                <div>
                  <strong>
                    Secure Customer Support
                  </strong>

                  <p>
                    Your support requests are linked
                    to your authenticated banking
                    account. Customer information is
                    never requested manually.
                  </p>
                </div>
              </div>

            </section>
          )}

          {/* =================================================
              TICKETS
          ================================================= */}

          {activeTab === "tickets" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    Complaints & Tickets
                  </h2>

                  <p>
                    Register an issue and track its
                    resolution status.
                  </p>
                </div>
              </div>

              <div className="two-column">

                <form
                  className="support-card"
                  onSubmit={submitComplaint}
                >

                  <div className="card-heading">
                    <div className="heading-icon">
                      🎫
                    </div>

                    <div>
                      <h3>
                        Register Complaint
                      </h3>

                      <p>
                        Tell us what went wrong.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Subject
                    </label>

                    <input
                      name="subject"
                      value={
                        complaintForm.subject
                      }
                      onChange={
                        handleComplaintChange
                      }
                      placeholder="Enter complaint subject"
                      maxLength={100}
                    />
                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>
                        Category
                      </label>

                      <select
                        name="category"
                        value={
                          complaintForm.category
                        }
                        onChange={
                          handleComplaintChange
                        }
                      >
                        {complaintCategories.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item.replaceAll(
                                "_",
                                " "
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Priority
                      </label>

                      <select
                        name="priority"
                        value={
                          complaintForm.priority
                        }
                        onChange={
                          handleComplaintChange
                        }
                      >
                        <option value="LOW">
                          Low
                        </option>

                        <option value="MEDIUM">
                          Medium
                        </option>

                        <option value="HIGH">
                          High
                        </option>
                      </select>
                    </div>

                  </div>

                  <div className="form-group">
                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        complaintForm.description
                      }
                      onChange={
                        handleComplaintChange
                      }
                      placeholder="Describe your issue in detail"
                      rows={6}
                      maxLength={5000}
                    />
                  </div>

                  <button
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Register Complaint →"}
                  </button>

                </form>

                <div className="support-card">

                  <div className="card-heading">
                    <div className="heading-icon blue">
                      📋
                    </div>

                    <div>
                      <h3>
                        Your Tickets
                      </h3>

                      <p>
                        Recent complaint history.
                      </p>
                    </div>
                  </div>

                  <div className="ticket-list">

                    {complaints.length === 0 ? (
                      <div className="empty-state">
                        <span>🎫</span>
                        <strong>
                          No complaints yet
                        </strong>
                        <p>
                          Your registered tickets
                          will appear here.
                        </p>
                      </div>
                    ) : (
                      complaints.map((ticket) => (
                        <div
                          className="ticket-item"
                          key={ticket.id}
                        >

                          <div className="ticket-top">
                            <strong>
                              {ticket.ticketNumber ||
                                `Ticket #${ticket.id}`}
                            </strong>

                            <span
                              className={`status-pill ${statusClass(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                          </div>

                          <h4>
                            {ticket.subject}
                          </h4>

                          <p>
                            {ticket.description}
                          </p>

                          <div className="ticket-meta">
                            <span>
                              {ticket.category}
                            </span>

                            <span>
                              Priority:{" "}
                              {ticket.priority}
                            </span>

                            <span>
                              {formatDate(
                                ticket.createdAt
                              )}
                            </span>
                          </div>

                          {ticket.resolutionNote && (
                            <div className="resolution-box">
                              <strong>
                                Resolution
                              </strong>

                              <p>
                                {
                                  ticket.resolutionNote
                                }
                              </p>
                            </div>
                          )}

                        </div>
                      ))
                    )}

                  </div>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              SERVICE REQUESTS
          ================================================= */}

          {activeTab === "requests" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    Service Requests
                  </h2>

                  <p>
                    Request banking services and
                    track processing status.
                  </p>
                </div>
              </div>

              <div className="two-column">

                <form
                  className="support-card"
                  onSubmit={submitServiceRequest}
                >

                  <div className="card-heading">
                    <div className="heading-icon purple">
                      ⚙
                    </div>

                    <div>
                      <h3>
                        New Service Request
                      </h3>

                      <p>
                        Select the service you need.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Request Type
                    </label>

                    <select
                      value={
                        requestForm.requestType
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (previous) => ({
                            ...previous,
                            requestType:
                              e.target.value,
                          })
                        )
                      }
                    >
                      {requestTypes.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        requestForm.description
                      }
                      onChange={(e) =>
                        setRequestForm(
                          (previous) => ({
                            ...previous,
                            description:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Describe what you need"
                      rows={7}
                      maxLength={5000}
                    />
                  </div>

                  <button
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Request →"}
                  </button>

                </form>

                <div className="support-card">

                  <div className="card-heading">
                    <div className="heading-icon green">
                      📋
                    </div>

                    <div>
                      <h3>
                        Request History
                      </h3>

                      <p>
                        Track your submitted
                        service requests.
                      </p>
                    </div>
                  </div>

                  <div className="request-list">

                    {serviceRequests.length === 0 ? (
                      <div className="empty-state">
                        <span>⚙</span>

                        <strong>
                          No service requests
                        </strong>

                        <p>
                          Submitted requests will
                          appear here.
                        </p>
                      </div>
                    ) : (
                      serviceRequests.map(
                        (item) => (
                          <div
                            className="request-item"
                            key={item.id}
                          >

                            <div className="ticket-top">
                              <strong>
                                {item.requestNumber ||
                                  `Request #${item.id}`}
                              </strong>

                              <span
                                className={`status-pill ${statusClass(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <h4>
                              {String(
                                item.requestType ||
                                  ""
                              ).replaceAll(
                                "_",
                                " "
                              )}
                            </h4>

                            <p>
                              {item.description}
                            </p>

                            <div className="ticket-meta">
                              <span>
                                {formatDate(
                                  item.createdAt
                                )}
                              </span>
                            </div>

                            {item.responseNote && (
                              <div className="resolution-box">
                                <strong>
                                  Bank Response
                                </strong>

                                <p>
                                  {
                                    item.responseNote
                                  }
                                </p>
                              </div>
                            )}

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              APPOINTMENT
          ================================================= */}

          {activeTab === "appointment" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    Branch Appointment
                  </h2>

                  <p>
                    Book a convenient time to visit
                    your Avani Bank branch.
                  </p>
                </div>
              </div>

              <div className="two-column">

                <form
                  className="support-card"
                  onSubmit={submitAppointment}
                >

                  <div className="card-heading">
                    <div className="heading-icon green">
                      📅
                    </div>

                    <div>
                      <h3>
                        Book Appointment
                      </h3>

                      <p>
                        Choose branch, date and time.
                      </p>
                    </div>
                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>
                        Branch Code
                      </label>

                      <input
                        value={
                          appointmentForm.branchCode
                        }
                        onChange={(e) =>
                          setAppointmentForm(
                            (previous) => ({
                              ...previous,
                              branchCode:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Example: LKO-001"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Branch Name
                      </label>

                      <input
                        value={
                          appointmentForm.branchName
                        }
                        onChange={(e) =>
                          setAppointmentForm(
                            (previous) => ({
                              ...previous,
                              branchName:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Branch name"
                      />
                    </div>

                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>
                        Appointment Date
                      </label>

                      <input
                        type="date"
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        value={
                          appointmentForm.appointmentDate
                        }
                        onChange={(e) =>
                          setAppointmentForm(
                            (previous) => ({
                              ...previous,
                              appointmentDate:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Appointment Time
                      </label>

                      <input
                        type="time"
                        value={
                          appointmentForm.appointmentTime
                        }
                        onChange={(e) =>
                          setAppointmentForm(
                            (previous) => ({
                              ...previous,
                              appointmentTime:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                  </div>

                  <div className="form-group">
                    <label>
                      Purpose
                    </label>

                    <input
                      value={
                        appointmentForm.purpose
                      }
                      onChange={(e) =>
                        setAppointmentForm(
                          (previous) => ({
                            ...previous,
                            purpose:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Example: KYC Assistance"
                    />
                  </div>

                  <button
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Booking..."
                      : "Book Appointment →"}
                  </button>

                </form>

                <div className="support-card">

                  <div className="card-heading">
                    <div className="heading-icon blue">
                      🗓
                    </div>

                    <div>
                      <h3>
                        Your Appointments
                      </h3>

                      <p>
                        Upcoming and previous branch
                        appointments.
                      </p>
                    </div>
                  </div>

                  <div className="appointment-list">

                    {appointments.length === 0 ? (
                      <div className="empty-state">
                        <span>📅</span>

                        <strong>
                          No appointments
                        </strong>

                        <p>
                          Your booked appointments
                          will appear here.
                        </p>
                      </div>
                    ) : (
                      appointments.map(
                        (item) => (
                          <div
                            className="appointment-item"
                            key={item.id}
                          >

                            <div className="appointment-date-box">
                              <strong>
                                {item.appointmentDate
                                  ? new Date(
                                      `${item.appointmentDate}T00:00:00`
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                      }
                                    )
                                  : "—"}
                              </strong>

                              <span>
                                {item.appointmentDate
                                  ? new Date(
                                      `${item.appointmentDate}T00:00:00`
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        month: "short",
                                      }
                                    )
                                  : ""}
                              </span>
                            </div>

                            <div className="appointment-info">

                              <div className="ticket-top">
                                <strong>
                                  {item.appointmentNumber ||
                                    `Appointment #${item.id}`}
                                </strong>

                                <span
                                  className={`status-pill ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <h4>
                                {item.branchName}
                              </h4>

                              <p>
                                {item.purpose}
                              </p>

                              <div className="ticket-meta">
                                <span>
                                  {item.branchCode}
                                </span>

                                <span>
                                  {item.appointmentTime}
                                </span>
                              </div>

                              {String(
                                item.status
                              ).toUpperCase() ===
                                "BOOKED" && (
                                <button
                                  className="small-danger-button"
                                  onClick={() =>
                                    cancelAppointment(
                                      item.id
                                    )
                                  }
                                >
                                  Cancel Appointment
                                </button>
                              )}

                            </div>

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              LIVE CHAT
          ================================================= */}

          {activeTab === "chat" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    Live Chat Support
                  </h2>

                  <p>
                    Connect with Avani Bank customer
                    support.
                  </p>
                </div>

                <span className="online-badge">
                  ● Support Available
                </span>
              </div>

              <div className="chat-card">

                <div className="chat-header">
                  <div className="chat-agent-icon">
                    A
                  </div>

                  <div>
                    <strong>
                      Avani Bank Support
                    </strong>

                    <span>
                      Customer Support Executive
                    </span>
                  </div>

                  <div className="chat-session">
                    Session{" "}
                    <strong>{sessionId}</strong>
                  </div>
                </div>

                <div className="chat-messages">

                  {chatMessages.length === 0 ? (
                    <div className="chat-empty">
                      <span>💬</span>

                      <strong>
                        Start a conversation
                      </strong>

                      <p>
                        Send a message to connect
                        with customer support.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map(
                      (item) => {
                        const customerMessage =
                          String(
                            item.senderType
                          ).toUpperCase() ===
                          "CUSTOMER";

                        return (
                          <div
                            key={item.id}
                            className={
                              customerMessage
                                ? "chat-row customer"
                                : "chat-row support"
                            }
                          >
                            <div className="chat-bubble">
                              <p>
                                {item.message}
                              </p>

                              <span>
                                {formatDate(
                                  item.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}

                </div>

                <form
                  className="chat-input-area"
                  onSubmit={sendChatMessage}
                >
                  <input
                    value={chatInput}
                    onChange={(e) =>
                      setChatInput(
                        e.target.value
                      )
                    }
                    placeholder="Type your message..."
                    maxLength={5000}
                  />

                  <button
                    className="chat-send-button"
                    disabled={
                      submitting ||
                      !chatInput.trim()
                    }
                  >
                    →
                  </button>
                </form>

              </div>

            </section>
          )}

          {/* =================================================
              AI ASSISTANT
          ================================================= */}

          {activeTab === "assistant" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    AI Banking Assistant
                  </h2>

                  <p>
                    Get quick answers to common
                    banking questions.
                  </p>
                </div>

                <span className="ai-badge">
                  ✦ AI ASSISTANT
                </span>
              </div>

              <div className="assistant-card">

                <div className="assistant-header">
                  <div className="assistant-avatar">
                    ✦
                  </div>

                  <div>
                    <strong>
                      Avani Banking Assistant
                    </strong>

                    <span>
                      Instant banking guidance
                    </span>
                  </div>
                </div>

                <div className="assistant-messages">

                  {assistantMessages.map(
                    (item, index) => (
                      <div
                        key={`${index}-${item.sender}`}
                        className={
                          item.sender === "USER"
                            ? "assistant-row user"
                            : "assistant-row bot"
                        }
                      >
                        <div className="assistant-bubble">
                          {item.text}
                        </div>
                      </div>
                    )
                  )}

                </div>

                <div className="assistant-suggestions">

                  {[
                    "How can I make a UPI payment?",
                    "What is NEFT?",
                    "How can I block my card?",
                    "How do I register a complaint?",
                  ].map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        setAssistantInput(
                          question
                        )
                      }
                    >
                      {question}
                    </button>
                  ))}

                </div>

                <form
                  className="assistant-input"
                  onSubmit={askAssistant}
                >
                  <input
                    value={assistantInput}
                    onChange={(e) =>
                      setAssistantInput(
                        e.target.value
                      )
                    }
                    placeholder="Ask your banking question..."
                    maxLength={5000}
                  />

                  <button
                    className="primary-button"
                    disabled={
                      !assistantInput.trim()
                    }
                  >
                    Ask Assistant →
                  </button>
                </form>

              </div>

            </section>
          )}

          {/* =================================================
              FEEDBACK
          ================================================= */}

          {activeTab === "feedback" && (
            <section>

              <div className="section-heading">
                <div>
                  <h2>
                    Feedback Management
                  </h2>

                  <p>
                    Help us improve your banking
                    experience.
                  </p>
                </div>
              </div>

              <div className="two-column">

                <form
                  className="support-card feedback-form"
                  onSubmit={submitFeedback}
                >

                  <div className="card-heading">
                    <div className="heading-icon orange">
                      ★
                    </div>

                    <div>
                      <h3>
                        Share Your Feedback
                      </h3>

                      <p>
                        Your feedback matters to us.
                      </p>
                    </div>
                  </div>

                  <div className="rating-selector">

                    <label>
                      Overall Rating
                    </label>

                    <div className="stars">

                      {[1, 2, 3, 4, 5].map(
                        (rating) => (
                          <button
                            key={rating}
                            type="button"
                            className={
                              rating <=
                              Number(
                                feedbackForm.rating
                              )
                                ? "star active"
                                : "star"
                            }
                            onClick={() =>
                              setFeedbackForm(
                                (previous) => ({
                                  ...previous,
                                  rating,
                                })
                              )
                            }
                          >
                            ★
                          </button>
                        )
                      )}

                    </div>

                    <span className="rating-label">
                      {feedbackForm.rating}/5
                    </span>

                  </div>

                  <div className="form-group">
                    <label>
                      Category
                    </label>

                    <select
                      value={
                        feedbackForm.category
                      }
                      onChange={(e) =>
                        setFeedbackForm(
                          (previous) => ({
                            ...previous,
                            category:
                              e.target.value,
                          })
                        )
                      }
                    >
                      <option value="CUSTOMER_SERVICE">
                        Customer Service
                      </option>

                      <option value="DIGITAL_BANKING">
                        Digital Banking
                      </option>

                      <option value="BRANCH">
                        Branch Experience
                      </option>

                      <option value="GENERAL">
                        General
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Comments
                    </label>

                    <textarea
                      value={
                        feedbackForm.comments
                      }
                      onChange={(e) =>
                        setFeedbackForm(
                          (previous) => ({
                            ...previous,
                            comments:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="Tell us about your experience..."
                      rows={7}
                      maxLength={3000}
                    />
                  </div>

                  <button
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Feedback →"}
                  </button>

                </form>

                <div className="support-card">

                  <div className="card-heading">
                    <div className="heading-icon orange">
                      ★
                    </div>

                    <div>
                      <h3>
                        Previous Feedback
                      </h3>

                      <p>
                        Your submitted feedback.
                      </p>
                    </div>
                  </div>

                  <div className="feedback-list">

                    {feedback.length === 0 ? (
                      <div className="empty-state">
                        <span>★</span>

                        <strong>
                          No feedback submitted
                        </strong>

                        <p>
                          Your feedback history will
                          appear here.
                        </p>
                      </div>
                    ) : (
                      feedback.map(
                        (item) => (
                          <div
                            className="feedback-item"
                            key={item.id}
                          >

                            <div className="feedback-top">
                              <div className="feedback-stars">
                                {"★".repeat(
                                  Number(
                                    item.rating || 0
                                  )
                                )}
                                <span>
                                  {"★".repeat(
                                    5 -
                                      Number(
                                        item.rating ||
                                          0
                                      )
                                  )}
                                </span>
                              </div>

                              <small>
                                {formatDate(
                                  item.createdAt
                                )}
                              </small>
                            </div>

                            <strong>
                              {item.category ||
                                "General"}
                            </strong>

                            {item.comments && (
                              <p>
                                {item.comments}
                              </p>
                            )}

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>

              </div>

            </section>
          )}

          <footer className="support-footer">
            <span>
              Avani Bank • Customer Service Portal
            </span>

            <span>
              🔒 Secure authenticated support
            </span>
          </footer>

        </div>
      </div>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const portalStyles = `
* {
  box-sizing: border-box;
}

.support-page {
  min-height: 100vh;
  background:
    linear-gradient(
      180deg,
      #f4f7fc 0%,
      #f8faff 100%
    );
  padding: 25px 32px ;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
  color: #172033;
}

.support-container {
  max-width: 1250px;
  margin: 0 auto;
}

.support-header {
  max-height: 100px;
  
  border-radius: 20px;
  padding: 3px 32px;
  margin-bottom: 20px;
  color: white;
  background:
    linear-gradient(
      135deg,
      #0d47a1 0%,
      #1565c0 52%,
      #1976d2 100%
    );
  box-shadow:
    0 16px 36px
    rgba(20,58,135,0.20);
}



.support-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-bottom: 100px;
}

.support-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: .72;
  margin-bottom: 8px;
}

.support-header h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
}

.support-header p {
  margin: 8px 0 0;
  max-width: 650px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255,255,255,.78);
}

.support-dashboard-button {
  border: 1px solid rgba(255,255,255,.22);
  background: #ffffff;
  color: #173b8c;
  border-radius: 10px;
  padding: 11px 17px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
}

.support-message {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 15px;
  border-radius: 11px;
  margin-bottom: 18px;
  font-size: 12px;
  font-weight: 650;
}

.support-message span {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 900;
}

.support-message-success {
  background: #ecfdf3;
  color: #117a45;
  border: 1px solid #b9ebcd;
}

.support-message-success span {
  background: #d9f8e6;
}

.support-message-error {
  background: #fff2f2;
  color: #b42318;
  border: 1px solid #fecaca;
}

.support-message-error span {
  background: #ffe0e0;
}

.support-tabs {
  display: flex;
  gap: 5px;
  padding: 6px;
  margin-bottom: 25px;
  overflow-x: auto;
  background: white;
  border: 1px solid #e3eaf3;
  border-radius: 15px;
  box-shadow:
    0 5px 18px
    rgba(30,45,80,.035);
}

.support-tab {
  flex: 1;
  min-width: 125px;
  border: none;
  background: transparent;
  color: #71809a;
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
}

.support-tab span {
  margin-right: 6px;
}

.support-tab.active {
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  box-shadow:
    0 6px 14px
    rgba(37,99,235,.18);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 22px;
  color: #172033;
}

.section-heading p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #8490a8;
}

.support-stat-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.support-stat-card {
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
  background: white;
  border: 1px solid #e4eaf2;
  border-radius: 16px;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.support-stat-icon {
  width: 43px;
  height: 43px;
  min-width: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 19px;
}

.support-stat-icon.blue {
  background: #e8f1ff;
}

.support-stat-icon.purple {
  background: #f0ebff;
}

.support-stat-icon.green {
  background: #eaf9f1;
}

.support-stat-icon.orange {
  background: #fff4df;
}

.support-stat-card span {
  display: block;
  color: #8490a8;
  font-size: 10px;
  font-weight: 650;
}

.support-stat-card strong {
  display: block;
  margin-top: 3px;
  color: #172033;
  font-size: 22px;
}

.quick-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.quick-card {
  position: relative;
  min-height: 170px;
  padding: 21px;
  text-align: left;
  border: 1px solid #e3eaf3;
  border-radius: 17px;
  background: white;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
  cursor: pointer;
  transition:
    transform .18s ease,
    box-shadow .18s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px
    rgba(24,43,83,.08);
}

.quick-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 12px;
  background: #edf4ff;
  font-size: 19px;
}

.quick-card strong {
  display: block;
  font-size: 14px;
  color: #243452;
}

.quick-card p {
  max-width: 240px;
  margin: 6px 0 0;
  color: #8490a8;
  font-size: 11px;
  line-height: 1.6;
}

.quick-arrow {
  position: absolute;
  right: 19px;
  bottom: 18px;
  color: #2563eb;
  font-size: 18px;
  font-weight: 800;
}

.security-note {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 17px 19px;
  border-radius: 15px;
  border: 1px solid #dce7fb;
  background:
    linear-gradient(
      145deg,
      #f5f8ff,
      #eef4ff
    );
}

.security-note > span {
  font-size: 21px;
}

.security-note strong {
  display: block;
  font-size: 12px;
}

.security-note p {
  margin: 5px 0 0;
  color: #718096;
  font-size: 11px;
  line-height: 1.6;
}

.two-column {
  display: grid;
  grid-template-columns:
    minmax(0, .9fr)
    minmax(0, 1.1fr);
  gap: 18px;
}

.support-card {
  padding: 24px;
  background: white;
  border: 1px solid #e3eaf3;
  border-radius: 18px;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 21px;
}

.heading-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e8f1ff;
  font-size: 18px;
}

.heading-icon.blue {
  background: #e8f1ff;
}

.heading-icon.purple {
  background: #f0ebff;
}

.heading-icon.green {
  background: #eaf9f1;
}

.heading-icon.orange {
  background: #fff4df;
}

.card-heading h3 {
  margin: 0;
  color: #243452;
  font-size: 16px;
}

.card-heading p {
  margin: 4px 0 0;
  color: #8490a8;
  font-size: 11px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.form-group label {
  color: #526078;
  font-size: 11px;
  font-weight: 750;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  border: 1px solid #dbe3ed;
  border-radius: 10px;
  outline: none;
  background: #fbfcfe;
  color: #172033;
  font-family: inherit;
  font-size: 12px;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.form-group input,
.form-group select {
  height: 47px;
  padding: 0 13px;
}

.form-group textarea {
  min-height: 120px;
  padding: 12px 13px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  background: white;
  box-shadow:
    0 0 0 3px
    rgba(37,99,235,.09);
}

.primary-button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  color: white;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  box-shadow:
    0 8px 18px
    rgba(37,99,235,.20);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.ticket-list,
.request-list,
.appointment-list,
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 3px;
}

.ticket-item,
.request-item,
.feedback-item {
  padding: 15px;
  border: 1px solid #e5ebf3;
  border-radius: 13px;
  background: #fbfcfe;
}

.ticket-top,
.feedback-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ticket-top strong {
  color: #243452;
  font-size: 11px;
}

.ticket-item h4,
.request-item h4 {
  margin: 10px 0 5px;
  color: #273650;
  font-size: 13px;
}

.ticket-item p,
.request-item p,
.feedback-item p {
  margin: 0;
  color: #718096;
  font-size: 11px;
  line-height: 1.6;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 5px 8px;
  font-size: 8px;
  font-weight: 800;
  white-space: nowrap;
}

.status-success {
  color: #16875a;
  background: #ecfdf5;
}

.status-progress {
  color: #8a6500;
  background: #fff8df;
}

.status-danger {
  color: #b42318;
  background: #fff1f1;
}

.status-open {
  color: #2563eb;
  background: #edf4ff;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 11px;
}

.ticket-meta span {
  padding: 4px 7px;
  border-radius: 7px;
  color: #8490a8;
  background: #f1f4f8;
  font-size: 8px;
}

.resolution-box {
  margin-top: 11px;
  padding: 10px;
  border-radius: 9px;
  background: #eef8f2;
  border: 1px solid #d5eddf;
}

.resolution-box strong {
  color: #16875a;
  font-size: 9px;
}

.resolution-box p {
  margin-top: 4px;
}

.empty-state {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 25px;
  color: #8490a8;
}

.empty-state > span {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 15px;
  background: #f1f4f8;
  font-size: 23px;
}

.empty-state strong {
  color: #273650;
  font-size: 13px;
}

.empty-state p {
  margin: 5px 0 0;
  font-size: 10px;
}

.appointment-item {
  display: flex;
  gap: 13px;
  padding: 14px;
  border: 1px solid #e5ebf3;
  border-radius: 13px;
  background: #fbfcfe;
}

.appointment-date-box {
  width: 58px;
  height: 62px;
  min-width: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #edf4ff;
  color: #2563eb;
}

.appointment-date-box strong {
  font-size: 20px;
}

.appointment-date-box span {
  font-size: 9px;
  font-weight: 750;
  text-transform: uppercase;
}

.appointment-info {
  flex: 1;
  min-width: 0;
}

.appointment-info h4 {
  margin: 8px 0 4px;
  font-size: 12px;
  color: #273650;
}

.appointment-info p {
  margin: 0;
  color: #718096;
  font-size: 10px;
}

.small-danger-button {
  margin-top: 10px;
  padding: 7px 10px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff2f2;
  color: #b42318;
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
}

.online-badge,
.ai-badge {
  padding: 7px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.online-badge {
  color: #16875a;
  background: #ecfdf5;
}

.ai-badge {
  color: #6d43c7;
  background: #f2ebff;
}

.chat-card,
.assistant-card {
  overflow: hidden;
  border: 1px solid #e3eaf3;
  border-radius: 18px;
  background: white;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.chat-header,
.assistant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 21px;
  border-bottom: 1px solid #e8edf4;
}

.chat-agent-icon,
.assistant-avatar {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  font-size: 17px;
  font-weight: 850;
}

.assistant-avatar {
  background:
    linear-gradient(
      135deg,
      #7047bd,
      #9a6ce2
    );
}

.chat-header strong,
.assistant-header strong {
  display: block;
  color: #273650;
  font-size: 13px;
}

.chat-header span,
.assistant-header span {
  display: block;
  margin-top: 3px;
  color: #8490a8;
  font-size: 9px;
}

.chat-session {
  margin-left: auto;
  color: #8490a8;
  font-size: 8px;
}

.chat-session strong {
  display: inline;
  font-size: 8px;
}

.chat-messages,
.assistant-messages {
  height: 450px;
  overflow-y: auto;
  padding: 22px;
  background:
    linear-gradient(
      180deg,
      #f8faff,
      #f4f7fc
    );
}

.chat-row {
  display: flex;
  margin-bottom: 13px;
}

.chat-row.customer {
  justify-content: flex-end;
}

.chat-row.support {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 70%;
  padding: 11px 13px;
  border-radius: 13px;
  box-shadow:
    0 3px 10px
    rgba(24,43,83,.04);
}

.chat-row.customer .chat-bubble {
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  border-bottom-right-radius: 4px;
}

.chat-row.support .chat-bubble {
  color: #273650;
  background: white;
  border: 1px solid #e3eaf3;
  border-bottom-left-radius: 4px;
}

.chat-bubble p {
  margin: 0;
  font-size: 11px;
  line-height: 1.55;
}

.chat-bubble span {
  display: block;
  margin-top: 6px;
  font-size: 7px;
  opacity: .65;
}

.chat-input-area {
  display: flex;
  gap: 9px;
  padding: 14px;
  border-top: 1px solid #e8edf4;
}

.chat-input-area input,
.assistant-input input {
  flex: 1;
  height: 45px;
  border: 1px solid #dbe3ed;
  border-radius: 10px;
  padding: 0 13px;
  outline: none;
  font-family: inherit;
  font-size: 12px;
}

.chat-input-area input:focus,
.assistant-input input:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px
    rgba(37,99,235,.08);
}

.chat-send-button {
  width: 45px;
  border: none;
  border-radius: 10px;
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  font-size: 18px;
  cursor: pointer;
}

.chat-send-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.chat-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8490a8;
  text-align: center;
}

.chat-empty span {
  font-size: 32px;
  margin-bottom: 10px;
}

.chat-empty strong {
  color: #273650;
  font-size: 14px;
}

.chat-empty p {
  margin: 5px 0 0;
  font-size: 10px;
}

.assistant-messages {
  height: 420px;
}

.assistant-row {
  display: flex;
  margin-bottom: 12px;
}

.assistant-row.user {
  justify-content: flex-end;
}

.assistant-row.bot {
  justify-content: flex-start;
}

.assistant-bubble {
  max-width: 70%;
  padding: 12px 14px;
  border-radius: 13px;
  color: #273650;
  background: white;
  border: 1px solid #e3eaf3;
  font-size: 11px;
  line-height: 1.6;
}

.assistant-row.user .assistant-bubble {
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
}

.assistant-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 14px;
  border-top: 1px solid #e8edf4;
}

.assistant-suggestions button {
  border: 1px solid #dbe5f4;
  border-radius: 20px;
  background: #f7faff;
  color: #3159a3;
  padding: 7px 10px;
  font-size: 9px;
  cursor: pointer;
}

.assistant-input {
  display: flex;
  gap: 9px;
  padding: 14px;
  border-top: 1px solid #e8edf4;
}

.assistant-input .primary-button {
  width: auto;
  min-width: 145px;
  padding: 0 17px;
}

.rating-selector {
  margin-bottom: 20px;
}

.rating-selector > label {
  display: block;
  color: #526078;
  font-size: 11px;
  font-weight: 750;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  gap: 4px;
}

.star {
  border: none;
  background: transparent;
  color: #d9dee7;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
}

.star.active {
  color: #f4b63e;
}

.rating-label {
  display: block;
  margin-top: 4px;
  color: #8490a8;
  font-size: 9px;
}

.feedback-item {
  background: #fbfcfe;
}

.feedback-top {
  margin-bottom: 9px;
}

.feedback-stars {
  color: #f4b63e;
  letter-spacing: 1px;
  font-size: 12px;
}

.feedback-stars span {
  color: #d9dee7;
}

.feedback-top small {
  color: #9aa4b6;
  font-size: 8px;
}

.feedback-item > strong {
  display: block;
  color: #273650;
  font-size: 10px;
  margin-bottom: 5px;
}

.support-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 5px 0;
  color: #8a96aa;
  font-size: 9px;
}

.support-loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    linear-gradient(
      135deg,
      #f5f7fb,
      #edf2fb
    );
  font-family:
    Inter,
    Arial,
    sans-serif;
}

.support-loading-card {
  width: 100%;
  max-width: 360px;
  padding: 32px;
  text-align: center;
  border-radius: 18px;
  background: white;
  box-shadow:
    0 15px 40px
    rgba(25,45,85,.08);
}

.support-loading-card h2 {
  margin: 14px 0 5px;
  color: #25314d;
  font-size: 17px;
}

.support-loading-card p {
  margin: 0;
  color: #8993a8;
  font-size: 10px;
}

.support-loader {
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border: 3px solid #dfe6f2;
  border-top: 3px solid #2457c6;
  border-radius: 50%;
  animation: supportSpin .8s linear infinite;
}

@keyframes supportSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1000px) {
  .support-stat-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .quick-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .support-page {
    padding: 20px 15px 35px;
  }

  .support-header-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .support-dashboard-button {
    align-self: flex-end;
  }

  .two-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .support-page {
    padding: 12px 10px 25px;
  }

  .support-header {
    padding: 23px 19px;
    border-radius: 16px;
  }

  .support-header h1 {
    font-size: 26px;
  }

  .support-header p {
    font-size: 11px;
  }

  .support-dashboard-button {
    width: 100%;
  }

  .support-tabs {
    border-radius: 12px;
  }

  .support-tab {
    min-width: 110px;
  }

  .support-stat-grid,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .support-card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .chat-bubble,
  .assistant-bubble {
    max-width: 88%;
  }

  .assistant-input {
    flex-direction: column;
  }

  .assistant-input .primary-button {
    width: 100%;
  }

  .support-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* =====================================================
   ENHANCED MOBILE RESPONSIVE OVERRIDES
   ===================================================== */

@media (max-width: 700px) {
  .support-page {
    padding: 12px 9px 24px;
  }

  .support-container {
    width: 100%;
    max-width: 100%;
  }

  .support-header {
    max-height: none;
    padding: 18px 15px;
    margin-bottom: 14px;
    border-radius: 15px;
  }

  .support-header-content {
    margin-bottom: 0;
    width: 100%;
    gap: 14px;
  }

  .support-header h1 {
    font-size: 23px;
    line-height: 1.25;
  }

  .support-header p {
    max-width: 100%;
    font-size: 11px;
    line-height: 1.55;
  }

  .support-dashboard-button {
    width: 100%;
    align-self: stretch;
    padding: 11px 14px;
  }

  .support-message {
    align-items: flex-start;
    font-size: 11px;
  }

  .support-tabs {
    gap: 4px;
    margin-bottom: 18px;
    padding: 5px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .support-tab {
    flex: 0 0 auto;
    min-width: 112px;
    padding: 10px 11px;
    font-size: 10px;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-heading h2 {
    font-size: 20px;
  }

  .section-heading p {
    font-size: 11px;
    line-height: 1.55;
  }

  .support-stat-grid {
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .support-stat-card {
    min-width: 0;
  }

  .quick-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .quick-card {
    min-height: 120px;
  }

  .security-note {
    padding: 14px;
    gap: 10px;
  }

  .two-column {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .support-card {
    min-width: 0;
    padding: 16px 13px;
    border-radius: 14px;
  }

  .card-heading {
    align-items: flex-start;
    gap: 10px;
  }

  .card-heading h3 {
    font-size: 15px;
  }

  .card-heading p {
    font-size: 10px;
    line-height: 1.5;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 12px;
  }

  .primary-button {
    width: 100%;
  }

  .ticket-list,
  .request-list,
  .appointment-list,
  .feedback-list {
    max-height: none;
    overflow-y: visible;
  }

  .ticket-item,
  .request-item,
  .feedback-item {
    min-width: 0;
    padding: 13px;
  }

  .ticket-top,
  .feedback-top {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .ticket-top strong,
  .ticket-item h4,
  .request-item h4,
  .feedback-item > strong {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .ticket-meta {
    row-gap: 6px;
  }

  .appointment-item {
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .appointment-date-box {
    width: 52px;
    min-width: 52px;
    height: 58px;
  }

  .appointment-info {
    min-width: 0;
  }

  .appointment-info h4,
  .appointment-info p {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .small-danger-button {
    width: 100%;
  }

  .online-badge,
  .ai-badge {
    align-self: flex-start;
  }

  .chat-header,
  .assistant-header {
    flex-wrap: wrap;
    padding: 15px;
  }

  .chat-session {
    width: 100%;
    margin-left: 54px;
    overflow-wrap: anywhere;
  }

  .chat-messages,
  .assistant-messages {
    height: 360px;
    padding: 14px 11px;
  }

  .chat-bubble,
  .assistant-bubble {
    max-width: 90%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .chat-input-area,
  .assistant-input {
    gap: 7px;
    padding: 10px;
  }

  .chat-input-area input,
  .assistant-input input {
    min-width: 0;
  }

  .assistant-suggestions {
    max-height: 125px;
    overflow-y: auto;
    padding: 10px;
  }

  .assistant-input {
    flex-direction: column;
  }

  .assistant-input .primary-button {
    width: 100%;
    min-width: 0;
    height: 45px;
  }

  .stars {
    flex-wrap: wrap;
  }

  .star {
    font-size: 25px;
  }

  .support-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
    padding: 15px 3px 0;
    line-height: 1.5;
  }
}

@media (max-width: 380px) {
  .support-page {
    padding-left: 7px;
    padding-right: 7px;
  }

  .support-header {
    padding: 16px 13px;
  }

  .support-header h1 {
    font-size: 21px;
  }

  .support-tab {
    min-width: 105px;
    padding: 9px 10px;
  }

  .support-card {
    padding: 14px 11px;
  }

  .chat-messages,
  .assistant-messages {
    height: 330px;
  }

  .chat-bubble,
  .assistant-bubble {
    max-width: 94%;
  }
}


/* Improve emoji/icon visibility in dark mode without changing the branded header. */
.theme-dark .support-stat-icon,
.theme-dark .quick-icon,
.theme-dark .heading-icon,
.theme-dark .chat-agent-icon,
.theme-dark .assistant-avatar,
.theme-dark .empty-state > span,
.theme-dark .chat-empty > span {
  filter: saturate(1.45) contrast(1.12);
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.22);
}
.theme-dark .support-stat-icon.purple,
.theme-dark .quick-icon,
.theme-dark .heading-icon.purple {
  background-color: #e0e7ff;
}
.theme-dark .support-stat-icon.blue,
.theme-dark .heading-icon.blue {
  background-color: #dbeafe;
}
.theme-dark .support-stat-icon.green,
.theme-dark .heading-icon.green {
  background-color: #dcfce7;
}
.theme-dark .support-stat-icon.orange,
.theme-dark .heading-icon.orange {
  background-color: #fef3c7;
}

/* Dashboard-synced dark theme */
.support-page.theme-dark {
  background: linear-gradient(180deg, #0b1220 0%, #111827 100%);
  color: #e5e7eb;
}
.support-loading-page.theme-dark {
  background: #0b1220;
  color: #e5e7eb;
}
.theme-dark .support-loading-card,
.theme-dark .support-stat-card,
.theme-dark .quick-card,
.theme-dark .support-card,
.theme-dark .security-note,
.theme-dark .ticket-item,
.theme-dark .request-item,
.theme-dark .appointment-item,
.theme-dark .feedback-item,
.theme-dark .chat-card,
.theme-dark .assistant-card,
.theme-dark .chat-messages,
.theme-dark .assistant-messages {
  background: #172033;
  border-color: #334155;
  color: #e5e7eb;
}
.theme-dark .support-tabs {
  background: #111827;
  border-color: #334155;
}
.theme-dark .support-tab {
  color: #cbd5e1;
}
.theme-dark .support-tab.active {
  background: #1d4ed8;
  color: #ffffff;
}
.theme-dark .section-heading h2,
.theme-dark .support-stat-card strong,
.theme-dark .quick-card strong,
.theme-dark .card-heading h3,
.theme-dark .ticket-item h4,
.theme-dark .request-item h4,
.theme-dark .appointment-info h4,
.theme-dark .feedback-item > strong,
.theme-dark .chat-header strong,
.theme-dark .assistant-header strong,
.theme-dark .empty-state strong,
.theme-dark .chat-empty strong {
  color: #f8fafc;
}
.theme-dark .section-heading p,
.theme-dark .quick-card p,
.theme-dark .support-stat-card span,
.theme-dark .card-heading p,
.theme-dark .ticket-item p,
.theme-dark .request-item p,
.theme-dark .appointment-info p,
.theme-dark .feedback-item p,
.theme-dark .ticket-meta,
.theme-dark .ticket-meta span,
.theme-dark .feedback-top small,
.theme-dark .chat-header span,
.theme-dark .chat-session,
.theme-dark .empty-state p,
.theme-dark .chat-empty p,
.theme-dark .support-footer {
  color: #aab7ca;
}
.theme-dark .form-group label,
.theme-dark .rating-selector label {
  color: #dbe4f0;
}
.theme-dark .form-group input,
.theme-dark .form-group select,
.theme-dark .form-group textarea,
.theme-dark .chat-input-area input,
.theme-dark .assistant-input input {
  background: #0f172a;
  color: #f1f5f9;
  border-color: #475569;
}
.theme-dark .form-group input::placeholder,
.theme-dark .form-group textarea::placeholder,
.theme-dark .chat-input-area input::placeholder,
.theme-dark .assistant-input input::placeholder {
  color: #94a3b8;
}
.theme-dark .form-group select option {
  background: #172033;
  color: #f1f5f9;
}
.theme-dark .empty-state,
.theme-dark .chat-empty {
  background: #111827;
  border-color: #334155;
  color: #cbd5e1;
}
.theme-dark .resolution-box,
.theme-dark .description-box,
.theme-dark .assistant-suggestions {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
}
.theme-dark .chat-bubble,
.theme-dark .assistant-bubble {
  color: #e5e7eb;
}
.theme-dark .chat-row.support .chat-bubble,
.theme-dark .assistant-row.bot .assistant-bubble {
  background: #273449;
}
.theme-dark .appointment-date-box {
  background: #1e3a5f;
  color: #dbeafe;
}
.theme-dark .assistant-suggestions button {
  background: #1e293b;
  border-color: #475569;
  color: #dbeafe;
}
.theme-dark .support-message-success {
  background: #123326;
  color: #86efac;
  border-color: #166534;
}
.theme-dark .support-message-error {
  background: #3b1d26;
  color: #fca5a5;
  border-color: #7f1d1d;
}
/* Keep the branded gradient header and its white dashboard button unchanged. */
`;

export default CustomerServicePortal;