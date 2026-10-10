import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

const tabs = [
  { id: "complaints", label: "Complaints", icon: "🎫" },
  { id: "requests", label: "Service Requests", icon: "⚙" },
  { id: "appointments", label: "Appointments", icon: "📅" },
  { id: "feedback", label: "Feedback", icon: "★" },
  { id: "chat", label: "Live Chat", icon: "💬" },
];

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (
    value === "RESOLVED" ||
    value === "COMPLETED" ||
    value === "CLOSED"
  ) {
    return "admin-status-success";
  }

  if (
    value === "IN_PROGRESS" ||
    value === "PROCESSING"
  ) {
    return "admin-status-progress";
  }

  if (
    value === "CANCELLED" ||
    value === "REJECTED"
  ) {
    return "admin-status-danger";
  }

  return "admin-status-open";
};

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

function AdminCustomerSupport() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("adminTheme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("adminTheme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const [activeTab, setActiveTab] =
    useState("complaints");

  const [complaints, setComplaints] = useState([]);
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [complaintStatus, setComplaintStatus] =
    useState("IN_PROGRESS");

  const [assignedTo, setAssignedTo] =
    useState("Customer Support Executive");

  const [resolutionNote, setResolutionNote] =
    useState("");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [requestStatus, setRequestStatus] =
    useState("IN_PROGRESS");

  const [responseNote, setResponseNote] =
    useState("");

  const [chatCustomerId, setChatCustomerId] =
    useState("");

  const [chatSessionId, setChatSessionId] =
    useState("CHAT-001");

  const [chatInput, setChatInput] =
    useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  const apiRequest = async (
    path,
    options = {}
  ) => {
    const response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers: {
          ...authHeaders,
          ...(options.headers || {}),
        },
      }
    );

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

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "Admin access required. Please login with an authorized staff account."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Unable to process request."
      );
    }

    return data;
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    if (!token) {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    try {
      setLoading(true);
      clearAlerts();

      const [
        complaintData,
        requestData,
        appointmentData,
        feedbackData,
      ] = await Promise.all([
        apiRequest(
          "/admin/support/complaints"
        ),
        apiRequest(
          "/admin/support/service-requests"
        ),
        apiRequest(
          "/admin/support/appointments"
        ),
        apiRequest(
          "/admin/support/feedback"
        ),
      ]);

      setComplaints(
        Array.isArray(complaintData)
          ? complaintData
          : []
      );

      setRequests(
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
    } catch (err) {
      console.error(
        "Admin Customer Support Error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // UPDATE COMPLAINT
  // =====================================================

  const updateComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      setActionLoading(true);
      clearAlerts();

      const params = new URLSearchParams();

      params.append(
        "status",
        complaintStatus
      );

      params.append(
        "assignedTo",
        assignedTo.trim()
      );

      if (resolutionNote.trim()) {
        params.append(
          "resolutionNote",
          resolutionNote.trim()
        );
      }

      await apiRequest(
        `/admin/support/complaints/${selectedComplaint.id}?${params.toString()}`,
        {
          method: "PUT",
        }
      );

      setSuccess(
        "Complaint updated successfully."
      );

      setSelectedComplaint(null);
      setResolutionNote("");

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // UPDATE SERVICE REQUEST
  // =====================================================

  const updateRequest = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      clearAlerts();

      const params = new URLSearchParams();

      params.append(
        "status",
        requestStatus
      );

      if (responseNote.trim()) {
        params.append(
          "responseNote",
          responseNote.trim()
        );
      }

      await apiRequest(
        `/admin/support/service-requests/${selectedRequest.id}?${params.toString()}`,
        {
          method: "PUT",
        }
      );

      setSuccess(
        "Service request updated successfully."
      );

      setSelectedRequest(null);
      setResponseNote("");

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // UPDATE APPOINTMENT
  // =====================================================

  const updateAppointmentStatus = async (
    id,
    status
  ) => {
    try {
      setActionLoading(true);
      clearAlerts();

      await apiRequest(
        `/admin/support/appointments/${id}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
        }
      );

      setSuccess(
        "Appointment status updated."
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CHAT
  // =====================================================

  const loadChat = async () => {
    if (
      !chatCustomerId.trim() ||
      !chatSessionId.trim()
    ) {
      return;
    }

    try {
      const data = await apiRequest(
        `/admin/support/chat/${chatCustomerId}/history/${encodeURIComponent(
          chatSessionId
        )}`
      );

      setChatMessages(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Admin chat history:",
        err
      );
    }
  };

  const sendSupportReply = async (e) => {
    e.preventDefault();

    if (
      !chatCustomerId.trim() ||
      !chatSessionId.trim() ||
      !chatInput.trim()
    ) {
      setError(
        "Customer ID, session ID and message are required."
      );
      return;
    }

    try {
      setActionLoading(true);
      clearAlerts();

      await apiRequest(
        `/admin/support/chat/${chatCustomerId}/reply`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionId:
              chatSessionId.trim(),
            message:
              chatInput.trim(),
          }),
        }
      );

      setChatInput("");

      await loadChat();

      setSuccess(
        "Support reply sent successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{adminStyles}</style>

        <div className="admin-support-loading" data-theme={darkMode ? "dark" : "light"}>
          <div className="admin-support-loader"></div>

          <h2>
            Loading Customer Support
          </h2>

          <p>
            Loading tickets and support
            operations...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminStyles}</style>

      <div className="admin-support-page" data-theme={darkMode ? "dark" : "light"}>
        <div className="admin-support-container">

          {/* HEADER */}

          <header className="admin-support-header">

            <div>
              <div className="admin-support-eyebrow">
                AVANI BANK • CUSTOMER SUPPORT
              </div>

              <h1>
                Customer Support Operations
              </h1>

              <p>
                Manage customer complaints,
                service requests, appointments,
                feedback and live support.
              </p>
            </div>

            <button
              className="admin-dashboard-button"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              ← Admin Dashboard
            </button>

          </header>

          {/* ALERTS */}

          {error && (
            <div className="admin-alert error">
              <strong>!</strong>
              {error}
            </div>
          )}

          {success && (
            <div className="admin-alert success">
              <strong>✓</strong>
              {success}
            </div>
          )}

          {/* KPI */}

          <div className="admin-support-kpis">

            <div>
              <span>Complaints</span>
              <strong>
                {complaints.length}
              </strong>
            </div>

            <div>
              <span>Service Requests</span>
              <strong>
                {requests.length}
              </strong>
            </div>

            <div>
              <span>Appointments</span>
              <strong>
                {appointments.length}
              </strong>
            </div>

            <div>
              <span>Feedback</span>
              <strong>
                {feedback.length}
              </strong>
            </div>

          </div>

          {/* TABS */}

          <div className="admin-support-tabs">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                {tab.icon} {tab.label}
              </button>
            ))}

          </div>

          {/* =================================================
              COMPLAINTS
          ================================================= */}

          {activeTab === "complaints" && (
            <section className="admin-section">

              <div className="admin-section-heading">
                <div>
                  <h2>
                    Complaint & Ticket Management
                  </h2>

                  <p>
                    Review and resolve customer
                    complaints.
                  </p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadData}
                >
                  ↻ Refresh
                </button>
              </div>

              <div className="admin-table-card">

                {complaints.length === 0 ? (
                  <div className="admin-empty">
                    No complaints available.
                  </div>
                ) : (
                  <div className="admin-table-wrapper">

                    <table>
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Subject</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>

                        {complaints.map(
                          (item) => (
                            <tr key={item.id}>

                              <td>
                                <strong>
                                  {item.ticketNumber ||
                                    `#${item.id}`}
                                </strong>
                              </td>

                              <td>
                                <strong>
                                  {item.subject}
                                </strong>

                                <small>
                                  {item.description}
                                </small>
                              </td>

                              <td>
                                {item.category}
                              </td>

                              <td>
                                {item.priority}
                              </td>

                              <td>
                                <span
                                  className={`admin-status ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              <td>
                                {formatDate(
                                  item.createdAt
                                )}
                              </td>

                              <td>
                                <button
                                  className="action-button"
                                  onClick={() => {
                                    setSelectedComplaint(
                                      item
                                    );

                                    setComplaintStatus(
                                      item.status ||
                                        "IN_PROGRESS"
                                    );

                                    setAssignedTo(
                                      item.assignedTo ||
                                        "Customer Support Executive"
                                    );

                                    setResolutionNote(
                                      item.resolutionNote ||
                                        ""
                                    );
                                  }}
                                >
                                  Manage
                                </button>
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>
                    </table>

                  </div>
                )}

              </div>

            </section>
          )}

          {/* =================================================
              SERVICE REQUESTS
          ================================================= */}

          {activeTab === "requests" && (
            <section className="admin-section">

              <div className="admin-section-heading">
                <div>
                  <h2>
                    Service Request Management
                  </h2>

                  <p>
                    Process customer banking
                    service requests.
                  </p>
                </div>
              </div>

              <div className="admin-table-card">

                <div className="admin-table-wrapper">

                  <table>
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {requests.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="table-empty"
                          >
                            No service requests.
                          </td>
                        </tr>
                      ) : (
                        requests.map(
                          (item) => (
                            <tr key={item.id}>

                              <td>
                                <strong>
                                  {item.requestNumber ||
                                    `#${item.id}`}
                                </strong>
                              </td>

                              <td>
                                {String(
                                  item.requestType ||
                                    ""
                                ).replaceAll(
                                  "_",
                                  " "
                                )}
                              </td>

                              <td>
                                <small>
                                  {item.description}
                                </small>
                              </td>

                              <td>
                                <span
                                  className={`admin-status ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              <td>
                                {formatDate(
                                  item.createdAt
                                )}
                              </td>

                              <td>
                                <button
                                  className="action-button"
                                  onClick={() => {
                                    setSelectedRequest(
                                      item
                                    );

                                    setRequestStatus(
                                      item.status ||
                                        "IN_PROGRESS"
                                    );

                                    setResponseNote(
                                      item.responseNote ||
                                        ""
                                    );
                                  }}
                                >
                                  Manage
                                </button>
                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>
                  </table>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              APPOINTMENTS
          ================================================= */}

          {activeTab === "appointments" && (
            <section className="admin-section">

              <div className="admin-section-heading">
                <div>
                  <h2>
                    Branch Appointments
                  </h2>

                  <p>
                    Monitor and update customer
                    branch appointments.
                  </p>
                </div>
              </div>

              <div className="admin-table-card">

                <div className="admin-table-wrapper">

                  <table>
                    <thead>
                      <tr>
                        <th>Appointment</th>
                        <th>Branch</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {appointments.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="table-empty"
                          >
                            No appointments.
                          </td>
                        </tr>
                      ) : (
                        appointments.map(
                          (item) => (
                            <tr key={item.id}>

                              <td>
                                <strong>
                                  {item.appointmentNumber ||
                                    `#${item.id}`}
                                </strong>
                              </td>

                              <td>
                                <strong>
                                  {item.branchName}
                                </strong>

                                <small>
                                  {item.branchCode}
                                </small>
                              </td>

                              <td>
                                {item.appointmentDate}
                              </td>

                              <td>
                                {item.appointmentTime}
                              </td>

                              <td>
                                {item.purpose}
                              </td>

                              <td>
                                <span
                                  className={`admin-status ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              <td>
                                <select
                                  className="status-select"
                                  value={
                                    item.status ||
                                    "BOOKED"
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  onChange={(e) =>
                                    updateAppointmentStatus(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="BOOKED">
                                    BOOKED
                                  </option>

                                  <option value="COMPLETED">
                                    COMPLETED
                                  </option>

                                  <option value="CANCELLED">
                                    CANCELLED
                                  </option>
                                </select>
                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>
                  </table>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              FEEDBACK
          ================================================= */}

          {activeTab === "feedback" && (
            <section className="admin-section">

              <div className="admin-section-heading">
                <div>
                  <h2>
                    Customer Feedback
                  </h2>

                  <p>
                    Review customer experience
                    feedback.
                  </p>
                </div>
              </div>

              <div className="feedback-admin-grid">

                {feedback.length === 0 ? (
                  <div className="admin-empty">
                    No feedback available.
                  </div>
                ) : (
                  feedback.map(
                    (item) => (
                      <div
                        className="feedback-admin-card"
                        key={item.id}
                      >

                        <div className="feedback-admin-top">

                          <div className="admin-stars">
                            {"★".repeat(
                              Number(
                                item.rating || 0
                              )
                            )}

                            <span>
                              {"★".repeat(
                                5 -
                                  Number(
                                    item.rating || 0
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

                        <p>
                          {item.comments ||
                            "No comments provided."}
                        </p>

                      </div>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* =================================================
              CHAT
          ================================================= */}

          {activeTab === "chat" && (
            <section className="admin-section">

              <div className="admin-section-heading">
                <div>
                  <h2>
                    Live Chat Support
                  </h2>

                  <p>
                    Open a customer session and
                    respond as support.
                  </p>
                </div>
              </div>

              <div className="admin-chat-card">

                <div className="admin-chat-controls">

                  <div>
                    <label>
                      Customer ID
                    </label>

                    <input
                      value={chatCustomerId}
                      onChange={(e) =>
                        setChatCustomerId(
                          e.target.value
                        )
                      }
                      placeholder="Enter customer ID"
                    />
                  </div>

                  <div>
                    <label>
                      Session ID
                    </label>

                    <input
                      value={chatSessionId}
                      onChange={(e) =>
                        setChatSessionId(
                          e.target.value
                        )
                      }
                      placeholder="CHAT-001"
                    />
                  </div>

                  <button
                    className="load-chat-button"
                    onClick={loadChat}
                  >
                    Load Chat
                  </button>

                </div>

                <div className="admin-chat-messages">

                  {chatMessages.length === 0 ? (
                    <div className="admin-empty">
                      Enter customer ID and session
                      ID to load conversation.
                    </div>
                  ) : (
                    chatMessages.map(
                      (item) => (
                        <div
                          className={
                            String(
                              item.senderType
                            ).toUpperCase() ===
                            "SUPPORT"
                              ? "admin-chat-row support"
                              : "admin-chat-row customer"
                          }
                          key={item.id}
                        >
                          <div className="admin-chat-bubble">

                            <strong>
                              {item.senderType}
                            </strong>

                            <p>
                              {item.message}
                            </p>

                            <small>
                              {formatDate(
                                item.createdAt
                              )}
                            </small>

                          </div>
                        </div>
                      )
                    )
                  )}

                </div>

                <form
                  className="admin-chat-input"
                  onSubmit={
                    sendSupportReply
                  }
                >

                  <input
                    value={chatInput}
                    onChange={(e) =>
                      setChatInput(
                        e.target.value
                      )
                    }
                    placeholder="Type support response..."
                    maxLength={5000}
                  />

                  <button
                    disabled={actionLoading}
                  >
                    Send Reply →
                  </button>

                </form>

              </div>

            </section>
          )}

          {/* =================================================
              COMPLAINT MODAL
          ================================================= */}

          {selectedComplaint && (
            <div
              className="admin-modal-overlay"
              onClick={() =>
                setSelectedComplaint(null)
              }
            >
              <div
                className="admin-modal"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <div className="admin-modal-header">

                  <div>
                    <h2>
                      Manage Complaint
                    </h2>

                    <p>
                      {selectedComplaint.ticketNumber}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedComplaint(null)
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="admin-detail-box">

                  <strong>
                    {selectedComplaint.subject}
                  </strong>

                  <p>
                    {selectedComplaint.description}
                  </p>

                </div>

                <div className="admin-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={complaintStatus}
                    onChange={(e) =>
                      setComplaintStatus(
                        e.target.value
                      )
                    }
                  >
                    <option value="OPEN">
                      OPEN
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="RESOLVED">
                      RESOLVED
                    </option>

                    <option value="CLOSED">
                      CLOSED
                    </option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    Assigned To
                  </label>

                  <input
                    value={assignedTo}
                    onChange={(e) =>
                      setAssignedTo(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    Resolution Note
                  </label>

                  <textarea
                    value={resolutionNote}
                    onChange={(e) =>
                      setResolutionNote(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Enter resolution or internal response"
                  />
                </div>

                <div className="admin-modal-actions">

                  <button
                    className="modal-cancel"
                    onClick={() =>
                      setSelectedComplaint(null)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="modal-save"
                    disabled={actionLoading}
                    onClick={updateComplaint}
                  >
                    {actionLoading
                      ? "Updating..."
                      : "Update Complaint"}
                  </button>

                </div>

              </div>
            </div>
          )}

          {/* =================================================
              REQUEST MODAL
          ================================================= */}

          {selectedRequest && (
            <div
              className="admin-modal-overlay"
              onClick={() =>
                setSelectedRequest(null)
              }
            >
              <div
                className="admin-modal"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <div className="admin-modal-header">

                  <div>
                    <h2>
                      Manage Service Request
                    </h2>

                    <p>
                      {selectedRequest.requestNumber}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedRequest(null)
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="admin-detail-box">

                  <strong>
                    {String(
                      selectedRequest.requestType ||
                        ""
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </strong>

                  <p>
                    {selectedRequest.description}
                  </p>

                </div>

                <div className="admin-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={requestStatus}
                    onChange={(e) =>
                      setRequestStatus(
                        e.target.value
                      )
                    }
                  >
                    <option value="REQUESTED">
                      REQUESTED
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="COMPLETED">
                      COMPLETED
                    </option>

                    <option value="CANCELLED">
                      CANCELLED
                    </option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    Response Note
                  </label>

                  <textarea
                    value={responseNote}
                    onChange={(e) =>
                      setResponseNote(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Enter response to customer"
                  />
                </div>

                <div className="admin-modal-actions">

                  <button
                    className="modal-cancel"
                    onClick={() =>
                      setSelectedRequest(null)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="modal-save"
                    disabled={actionLoading}
                    onClick={updateRequest}
                  >
                    {actionLoading
                      ? "Updating..."
                      : "Update Request"}
                  </button>

                </div>

              </div>
            </div>
          )}

          <footer className="admin-support-footer">
            <span>
              Avani Bank • Customer Support Operations
            </span>

            <span>
              🔒 Authorized staff access
            </span>
          </footer>

        </div>
      </div>
    </>
  );
}

const adminStyles = `
* {
  box-sizing: border-box;
}

.admin-support-page {
  min-height: 100vh;
  padding: 30px 28px 45px;
  background:
    linear-gradient(
      180deg,
      #f4f7fc,
      #f8faff
    );
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
  color: #172033;
}

.admin-support-container {
  max-width: 1250px;
  margin: 0 auto;
}

.admin-support-header {
  max-height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 20px;
  padding: 28px 33px;
  border-radius: 20px;
  color: white;
  background:
    linear-gradient(
      135deg,
      #10275d,
      #173f98 52%,
      #2860cf
    );
  box-shadow:
    0 16px 36px
    rgba(20,58,135,.20);
}

.admin-support-eyebrow {
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: .72;
}

.admin-support-header h1 {
  margin: 0;
  font-size: 29px;
}

.admin-support-header p {
  margin: 7px 0 0;
  color: rgba(255,255,255,.75);
  font-size: 12px;
}

.admin-dashboard-button {
  padding: 11px 17px;
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 10px;
  background: #ffff;
  color: rgba(27, 65, 201, 0.92);
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
}

.admin-alert {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 15px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 650;
}

.admin-alert strong {
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.admin-alert.error {
  color: #b42318;
  background: #fff2f2;
  border: 1px solid #fecaca;
}

.admin-alert.error strong {
  background: #ffe0e0;
}

.admin-alert.success {
  color: #117a45;
  background: #ecfdf3;
  border: 1px solid #b9ebcd;
}

.admin-alert.success strong {
  background: #d9f8e6;
}

.admin-support-kpis {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.admin-support-kpis > div {
  padding: 18px;
  background: white;
  border: 1px solid #e4eaf2;
  border-radius: 15px;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.admin-support-kpis span {
  display: block;
  color: #8490a8;
  font-size: 10px;
}

.admin-support-kpis strong {
  display: block;
  margin-top: 5px;
  color: #243452;
  font-size: 23px;
}

.admin-support-tabs {
  display: flex;
  gap: 5px;
  padding: 6px;
  margin-bottom: 23px;
  overflow-x: auto;
  background: white;
  border: 1px solid #e3eaf3;
  border-radius: 15px;
}

.admin-support-tabs button {
  flex: 1;
  min-width: 130px;
  padding: 11px 13px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #71809a;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
}

.admin-support-tabs button.active {
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
}

.admin-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
}

.admin-section-heading h2 {
  margin: 0;
  color: #243452;
  font-size: 20px;
}

.admin-section-heading p {
  margin: 5px 0 0;
  color: #8490a8;
  font-size: 10px;
}

.refresh-button,
.action-button {
  border: 1px solid #d8e2f1;
  border-radius: 8px;
  background: white;
  color: #2563eb;
  padding: 8px 11px;
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
}

.admin-table-card {
  overflow: hidden;
  background: white;
  border: 1px solid #e3eaf3;
  border-radius: 17px;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.admin-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.admin-table-wrapper table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.admin-table-wrapper th {
  padding: 13px 14px;
  text-align: left;
  background: #f8fbff;
  border-bottom: 1px solid #e8edf4;
  color: #71809a;
  font-size: 9px;
  font-weight: 800;
}

.admin-table-wrapper td {
  padding: 14px;
  border-bottom: 1px solid #edf1f5;
  color: #526078;
  font-size: 9px;
  vertical-align: middle;
}

.admin-table-wrapper tr:last-child td {
  border-bottom: none;
}

.admin-table-wrapper td strong {
  display: block;
  color: #273650;
  font-size: 10px;
}

.admin-table-wrapper td small {
  display: block;
  max-width: 240px;
  margin-top: 3px;
  color: #8993a8;
  font-size: 8px;
  line-height: 1.5;
}

.admin-status {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 7px;
  font-weight: 800;
}

.admin-status-success {
  color: #16875a;
  background: #ecfdf5;
}

.admin-status-progress {
  color: #8a6500;
  background: #fff8df;
}

.admin-status-danger {
  color: #b42318;
  background: #fff1f1;
}

.admin-status-open {
  color: #2563eb;
  background: #edf4ff;
}

.status-select {
  height: 32px;
  border: 1px solid #dbe3ed;
  border-radius: 7px;
  padding: 0 7px;
  color: #526078;
  background: white;
  font-size: 8px;
  outline: none;
}

.table-empty,
.admin-empty {
  padding: 60px 20px !important;
  text-align: center;
  color: #8993a8;
  font-size: 11px;
}

.feedback-admin-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.feedback-admin-card {
  padding: 18px;
  border: 1px solid #e3eaf3;
  border-radius: 15px;
  background: white;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.feedback-admin-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.feedback-admin-top small {
  color: #9aa4b6;
  font-size: 7px;
}

.admin-stars {
  color: #f4b63e;
  font-size: 13px;
  letter-spacing: 1px;
}

.admin-stars span {
  color: #d9dee7;
}

.feedback-admin-card > strong {
  color: #273650;
  font-size: 10px;
}

.feedback-admin-card p {
  margin: 7px 0 0;
  color: #718096;
  font-size: 10px;
  line-height: 1.6;
}

.admin-chat-card {
  overflow: hidden;
  border: 1px solid #e3eaf3;
  border-radius: 17px;
  background: white;
  box-shadow:
    0 6px 22px
    rgba(24,43,83,.035);
}

.admin-chat-controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid #e8edf4;
}

.admin-chat-controls div,
.admin-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-chat-controls label,
.admin-form-group label {
  color: #526078;
  font-size: 9px;
  font-weight: 750;
}

.admin-chat-controls input,
.admin-form-group input,
.admin-form-group select,
.admin-form-group textarea {
  border: 1px solid #dbe3ed;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color: #273650;
  font-size: 10px;
}

.admin-chat-controls input,
.admin-form-group input,
.admin-form-group select {
  height: 39px;
  padding: 0 10px;
}

.admin-form-group textarea {
  padding: 10px;
  resize: vertical;
}

.admin-chat-controls input:focus,
.admin-form-group input:focus,
.admin-form-group select:focus,
.admin-form-group textarea:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px
    rgba(37,99,235,.08);
}

.load-chat-button {
  align-self: end;
  height: 39px;
  padding: 0 15px;
  border: none;
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  color: white;
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
}

.admin-chat-messages {
  height: 430px;
  overflow-y: auto;
  padding: 20px;
  background:
    linear-gradient(
      180deg,
      #f8faff,
      #f4f7fc
    );
}

.admin-chat-row {
  display: flex;
  margin-bottom: 12px;
}

.admin-chat-row.customer {
  justify-content: flex-start;
}

.admin-chat-row.support {
  justify-content: flex-end;
}

.admin-chat-bubble {
  max-width: 68%;
  padding: 11px 13px;
  border-radius: 12px;
}

.admin-chat-row.customer
.admin-chat-bubble {
  background: white;
  border: 1px solid #e3eaf3;
  color: #273650;
  border-bottom-left-radius: 4px;
}

.admin-chat-row.support
.admin-chat-bubble {
  color: white;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  border-bottom-right-radius: 4px;
}

.admin-chat-bubble strong {
  font-size: 8px;
}

.admin-chat-bubble p {
  margin: 5px 0;
  font-size: 10px;
  line-height: 1.5;
}

.admin-chat-bubble small {
  font-size: 7px;
  opacity: .65;
}

.admin-chat-input {
  display: flex;
  gap: 9px;
  padding: 14px;
  border-top: 1px solid #e8edf4;
}

.admin-chat-input input {
  flex: 1;
  height: 45px;
  padding: 0 12px;
  border: 1px solid #dbe3ed;
  border-radius: 9px;
  outline: none;
  font-family: inherit;
  font-size: 11px;
}

.admin-chat-input button {
  padding: 0 16px;
  border: none;
  border-radius: 9px;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  color: white;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}

.admin-chat-input button:disabled {
  opacity: .6;
}

.admin-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(10,22,48,.48);
}

.admin-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 23px;
  border-radius: 17px;
  background: white;
  box-shadow:
    0 25px 70px
    rgba(12,32,72,.25);
}

.admin-modal-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.admin-modal-header h2 {
  margin: 0;
  color: #243452;
  font-size: 18px;
}

.admin-modal-header p {
  margin: 4px 0 0;
  color: #8993a8;
  font-size: 9px;
}

.admin-modal-header button {
  width: 31px;
  height: 31px;
  border: none;
  border-radius: 8px;
  background: #f1f4f8;
  color: #526078;
  font-size: 20px;
  cursor: pointer;
}

.admin-detail-box {
  margin-bottom: 17px;
  padding: 13px;
  border-radius: 10px;
  background: #f7faff;
  border: 1px solid #e0e8f6;
}

.admin-detail-box strong {
  color: #273650;
  font-size: 11px;
}

.admin-detail-box p {
  margin: 7px 0 0;
  color: #718096;
  font-size: 10px;
  line-height: 1.6;
}

.admin-form-group {
  margin-bottom: 15px;
}

.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 20px;
}

.modal-cancel,
.modal-save {
  height: 40px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}

.modal-cancel {
  border: 1px solid #dbe3ed;
  background: white;
  color: #526078;
}

.modal-save {
  border: none;
  background:
    linear-gradient(
      135deg,
      #173b8c,
      #2563eb
    );
  color: white;
}

.admin-support-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 5px 0;
  color: #8a96aa;
  font-size: 8px;
}

.admin-support-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
  font-family: Inter, Arial, sans-serif;
}

.admin-support-loading h2 {
  margin: 13px 0 4px;
  color: #25314d;
  font-size: 17px;
}

.admin-support-loading p {
  margin: 0;
  color: #8993a8;
  font-size: 10px;
}

.admin-support-loader {
  width: 29px;
  height: 29px;
  border: 3px solid #dfe6f2;
  border-top: 3px solid #2457c6;
  border-radius: 50%;
  animation: adminSupportSpin .8s linear infinite;
}

@keyframes adminSupportSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .admin-support-kpis {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .feedback-admin-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .admin-chat-controls {
    grid-template-columns: 1fr 1fr;
  }

  .load-chat-button {
    grid-column: span 2;
  }
}

@media (max-width: 700px) {
  .admin-support-page {
    padding: 14px 10px 30px;
    overflow-x: hidden;
  }

  .admin-support-header {
    max-height: none;
    align-items: stretch;
    flex-direction: column;
    gap: 15px;
    padding: 22px 18px;
    border-radius: 15px;
  }

  .admin-support-header h1 {
    font-size: 23px;
    line-height: 1.25;
  }

  .admin-support-header p {
    line-height: 1.55;
  }

  .admin-dashboard-button {
    width: 100%;
    min-height: 40px;
  }

  .admin-alert {
    align-items: flex-start;
    line-height: 1.45;
  }

  .admin-support-tabs {
    margin-bottom: 18px;
    padding: 5px;
    scrollbar-width: thin;
  }

  .admin-support-tabs button {
    flex: 0 0 auto;
    min-width: 125px;
  }

  .admin-section-heading {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .refresh-button {
    width: 100%;
    min-height: 38px;
  }

  .admin-table-card {
    border-radius: 13px;
  }

  .admin-table-wrapper {
    -webkit-overflow-scrolling: touch;
  }

  .admin-table-wrapper table {
    min-width: 760px;
  }

  .admin-table-wrapper th,
  .admin-table-wrapper td {
    padding: 11px 10px;
  }

  .feedback-admin-grid {
    grid-template-columns: 1fr;
  }

  .feedback-admin-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-chat-controls {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .load-chat-button {
    grid-column: auto;
    width: 100%;
  }

  .admin-chat-messages {
    height: 360px;
    padding: 14px;
  }

  .admin-chat-bubble {
    max-width: 88%;
  }

  .admin-chat-input {
    flex-direction: column;
    padding: 12px;
  }

  .admin-chat-input input {
    width: 100%;
  }

  .admin-chat-input button {
    width: 100%;
    min-height: 42px;
  }

  .admin-modal-overlay {
    align-items: flex-end;
    padding: 8px;
  }

  .admin-modal {
    max-height: 92vh;
    padding: 18px;
    border-radius: 16px 16px 10px 10px;
  }

  .admin-modal-header {
    gap: 12px;
  }

  .admin-modal-actions {
    flex-direction: column-reverse;
  }

  .modal-cancel,
  .modal-save {
    width: 100%;
  }

  .admin-support-footer {
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.5;
  }
}

@media (max-width: 500px) {
  .admin-support-kpis {
    grid-template-columns: 1fr;
  }

  .admin-support-header {
    padding: 19px 15px;
  }

  .admin-support-header h1 {
    font-size: 20px;
  }

  .admin-support-eyebrow {
    font-size: 8px;
    letter-spacing: 1.1px;
  }

  .admin-support-tabs button {
    min-width: 118px;
    padding: 10px 11px;
  }

  .admin-section-heading h2 {
    font-size: 18px;
  }

  .admin-table-wrapper table {
    min-width: 700px;
  }

  .admin-chat-messages {
    height: 320px;
  }

  .admin-chat-bubble {
    max-width: 94%;
  }

  .admin-modal {
    padding: 15px;
  }
}

/* Admin dashboard theme integration */
.admin-support-page[data-theme="dark"],
.admin-support-loading[data-theme="dark"] { background: #0b1220; color: #e5eaf3; }
.admin-support-page[data-theme="dark"] .admin-support-kpis > div,
.admin-support-page[data-theme="dark"] .admin-support-tabs,
.admin-support-page[data-theme="dark"] .admin-table-card,
.admin-support-page[data-theme="dark"] .feedback-admin-card,
.admin-support-page[data-theme="dark"] .admin-chat-card,
.admin-support-page[data-theme="dark"] .admin-modal,
.admin-support-page[data-theme="dark"] .admin-chat-row.customer .admin-chat-bubble {
  background: #151f30; border-color: #2b394e; color: #e5eaf3;
}
.admin-support-page[data-theme="dark"] .admin-support-kpis strong,
.admin-support-page[data-theme="dark"] .admin-section-heading h2,
.admin-support-page[data-theme="dark"] .admin-table-wrapper td strong,
.admin-support-page[data-theme="dark"] .feedback-admin-card > strong,
.admin-support-page[data-theme="dark"] .admin-modal-header h2,
.admin-support-page[data-theme="dark"] .admin-detail-box strong { color: #edf3ff; }
.admin-support-page[data-theme="dark"] .admin-support-kpis span,
.admin-support-page[data-theme="dark"] .admin-section-heading p,
.admin-support-page[data-theme="dark"] .admin-table-wrapper td,
.admin-support-page[data-theme="dark"] .admin-table-wrapper td small,
.admin-support-page[data-theme="dark"] .feedback-admin-card p,
.admin-support-page[data-theme="dark"] .admin-modal-header p,
.admin-support-page[data-theme="dark"] .admin-detail-box p,
.admin-support-page[data-theme="dark"] .admin-chat-controls label,
.admin-support-page[data-theme="dark"] .admin-form-group label { color: #a7b4c8; }
.admin-support-page[data-theme="dark"] .admin-support-tabs button { color: #b7c4d8; }
.admin-support-page[data-theme="dark"] .admin-table-wrapper th {
  background: #1b293d; border-color: #2b394e; color: #b7c4d8;
}
.admin-support-page[data-theme="dark"] .admin-table-wrapper td { border-color: #27354a; }
.admin-support-page[data-theme="dark"] .refresh-button,
.admin-support-page[data-theme="dark"] .action-button,
.admin-support-page[data-theme="dark"] .status-select,
.admin-support-page[data-theme="dark"] .admin-chat-controls input,
.admin-support-page[data-theme="dark"] .admin-form-group input,
.admin-support-page[data-theme="dark"] .admin-form-group select,
.admin-support-page[data-theme="dark"] .admin-form-group textarea,
.admin-support-page[data-theme="dark"] .admin-chat-input input,
.admin-support-page[data-theme="dark"] .modal-cancel {
  background: #101a2a; border-color: #35445b; color: #e5eaf3;
}
.admin-support-page[data-theme="dark"] .admin-detail-box {
  background: #1b293d; border-color: #35445b;
}
.admin-support-page[data-theme="dark"] .admin-chat-controls,
.admin-support-page[data-theme="dark"] .admin-chat-input { border-color: #2b394e; }
.admin-support-page[data-theme="dark"] .admin-chat-messages {
  background: linear-gradient(180deg, #101a2a, #0f1725);
}
.admin-support-page[data-theme="dark"] .admin-modal-header button {
  background: #263449; color: #e5eaf3;
}
.admin-support-page[data-theme="dark"] .admin-support-footer { color: #8796ad; }
.admin-support-page[data-theme="dark"] .admin-alert.error {
  background: #351e29; border-color: #713344; color: #ffb8c0;
}
.admin-support-page[data-theme="dark"] .admin-alert.success {
  background: #15352d; border-color: #28614e; color: #9ce8c5;
}
.admin-support-loading[data-theme="dark"] h2 { color: #edf3ff; }
.admin-support-loading[data-theme="dark"] p { color: #a7b4c8; }

`;

export default AdminCustomerSupport;