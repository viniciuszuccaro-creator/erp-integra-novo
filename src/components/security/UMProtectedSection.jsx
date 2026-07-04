import React from "react";
import ProtectedSection from "@/components/security/ProtectedSection";

// UMProtectedSection: alias do ProtectedSection para padronização e consistência
export default function UMProtectedSection(props) {
  return <ProtectedSection {...props} />;
}