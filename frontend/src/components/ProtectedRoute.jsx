import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  // Token nahi hai → Login par bhejo
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Token available hai → Page allow karo
  return children;
}

export default ProtectedRoute;