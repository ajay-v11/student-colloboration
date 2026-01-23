import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
      <Toaster position="top-right" />
    </div>
  );
}
