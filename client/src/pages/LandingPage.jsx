import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Welcome to StudentFlow</h1>
      <p className="mt-4 text-xl text-muted-foreground">The Student Collaboration Platform</p>
      <div className="mt-8 flex gap-4">
        <Link to="/login">
          <Button size="lg">Login</Button>
        </Link>
        <Link to="/register">
          <Button size="lg" variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}
