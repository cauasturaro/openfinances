import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { JSX } from "react/jsx-runtime";
import { Loader2 } from "lucide-react";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}