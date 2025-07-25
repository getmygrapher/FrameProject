import React from "react";
import { useAdmin } from "../hooks/useAdmin";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const { admin, logout, loading } = useAdmin();

  if (!admin) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      // Force page reload to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
      >
        <LogOut size={16} />
        {loading ? "Logging out..." : "Admin Logout"}
      </button>
    </div>
  );
}
