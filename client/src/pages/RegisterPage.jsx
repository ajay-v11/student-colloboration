import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await register({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password
      });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border shadow-xl backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                placeholder="John" 
                required 
                className={fieldErrors.name ? "border-red-500" : ""}
              />
              {fieldErrors.name && (
                <span className="text-sm text-red-500">{fieldErrors.name}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" placeholder="Doe" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && (
              <span className="text-sm text-red-500">{fieldErrors.email}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className={fieldErrors.password ? "border-red-500" : ""}
            />
            {fieldErrors.password && (
              <span className="text-sm text-red-500">{fieldErrors.password}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
