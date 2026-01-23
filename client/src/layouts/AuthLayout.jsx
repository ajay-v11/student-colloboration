import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
         <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
         <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-primary">StudentFlow</h1>
            <p className="text-muted-foreground text-lg">Connect. Collaborate. Excel.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
