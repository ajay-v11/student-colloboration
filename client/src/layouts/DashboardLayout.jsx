import { Outlet } from "react-router-dom";
import { FloatingDock } from "../components/FloatingDock";
import { Navbar } from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full relative selection:bg-primary/20">
        {/* Background Ambience */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] animate-[float_10s_infinite]" />
           <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-accent/20 rounded-full blur-[100px] animate-[float_12s_infinite_reverse]" />
           <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-secondary/30 rounded-full blur-[100px] animate-[float_14s_infinite]" />
        </div>

        <div className="flex flex-1 flex-col z-10 w-full">
          <Navbar />
          <main className="flex-1 px-4 md:px-8 pb-28 pt-4 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <Outlet />
          </main>
        </div>
        
        <FloatingDock />
      </div>
    </ProtectedRoute>
  );
}
