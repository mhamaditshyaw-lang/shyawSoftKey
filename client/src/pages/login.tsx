import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Users, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginForm.username, loginForm.password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-emerald-400/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-green-400/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-300/5 rounded-full"></div>
        
        <div className="text-center text-white relative z-10">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <Leaf className="w-16 h-16 text-green-200" />
            <Users className="w-12 h-12 text-emerald-200" />
            <CheckCircle className="w-10 h-10 text-green-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">ManageFlow</h1>
          <p className="text-xl text-green-100 mb-2">Professional Management System</p>
          <p className="text-green-200">Streamline your workflow with role-based management</p>
          
          {/* Feature highlights */}
          <div className="mt-8 space-y-3 text-left max-w-sm">
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Secure Role-Based Access</span>
            </div>
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Task & Project Management</span>
            </div>
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Real-time Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 md:bg-none">
        <div className="w-full max-w-md">
          <Card className="border-green-100 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-800">Welcome Back</CardTitle>
              <CardDescription className="text-green-600">Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-green-700">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-green-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mobile-button touch-target bg-green-600 hover:bg-green-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-green-600">
                  Contact your administrator to create a new account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
