import React from "react";
import { Navigate } from "react-router-dom";

export default function CreateOpportunity() {
  return <Navigate to="/enabler/opportunities-posted?new=true" replace />;
}
