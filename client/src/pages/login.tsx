import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CheckCircle, User, Lock } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "secretary",
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(registerForm);
      toast({
        title: "Registration Successful",
        description: "Your account has been created and is pending admin approval.",
      });
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden animate-slide-in">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-red-400/10 to-transparent rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-red-400/10 to-transparent rounded-full translate-y-24 -translate-x-24 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-red-300/5 rounded-full animate-pulse"></div>
        
        <div className="text-center text-white relative z-10 animate-fade-in">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <Shield className="w-16 h-16 text-red-200 animate-pulse-hover" />
            <Users className="w-12 h-12 text-red-200 animate-bounce-hover" />
            <CheckCircle className="w-10 h-10 text-red-300 animate-pulse-hover" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">Administration Shyaw System</h1>
          <p className="text-xl text-red-100 mb-2">Professional Administration Platform</p>
          <p className="text-red-200">Secure and efficient administrative management</p>
          
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
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-red-50 to-white md:bg-none">
        <div className="w-full max-w-md animate-fade-in">
          {isLogin ? (
            <Card className="border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-hover">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full animate-bounce-hover">
                    <User className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-red-800">Welcome Back</CardTitle>
                <CardDescription className="text-red-600">Sign in to Administration Shyaw System</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-red-700 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Username</span>
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="border-red-200 focus:border-red-500 focus:ring-red-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-red-700 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Password</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="border-red-200 focus:border-red-500 focus:ring-red-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mobile-button touch-target bg-red-600 hover:bg-red-700 text-white transition-all duration-300 animate-pulse-hover shadow-lg hover:shadow-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors animate-bounce-hover"
                  >
                    Don't have an account? Register here
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-hover">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full animate-bounce-hover">
                    <Users className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-red-800">Create Account</CardTitle>
                <CardDescription className="text-red-600">Join Administration Shyaw System</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-green-700">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-green-700">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-green-700">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-green-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-green-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-green-700">Requested Role</Label>
                    <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select role to request" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
