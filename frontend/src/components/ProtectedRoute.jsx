import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

const ProtectedRoute = ({ children }) => {
  const { state } = useApp();

  if (!state.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
