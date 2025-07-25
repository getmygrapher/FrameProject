import React from "react";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";

export default function AuthDebug() {
  const authContext = useAuth();
  const adminContext = useAdmin();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>

      <div className="mb-2">
        <strong>User Auth:</strong>
        <div>Loading: {authContext.loading ? "Yes" : "No"}</div>
        <div>Authenticated: {authContext.isAuthenticated ? "Yes" : "No"}</div>
        <div>User: {authContext.user?.email || "None"}</div>
        <div>Error: {authContext.error || "None"}</div>
      </div>

      <div>
        <strong>Admin Auth:</strong>
        <div>Loading: {adminContext.loading ? "Yes" : "No"}</div>
        <div>Authenticated: {adminContext.isAuthenticated ? "Yes" : "No"}</div>
        <div>Admin: {adminContext.admin?.email || "None"}</div>
        <div>Error: {adminContext.error || "None"}</div>
      </div>

      <button
        onClick={() => {
          console.log("Auth Context:", authContext);
          console.log("Admin Context:", adminContext);
        }}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
}
