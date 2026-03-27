import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

const AdminRoute = ({ children }) => {
  const { state } = useApp();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!state.isLoggedIn || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
