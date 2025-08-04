import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CheckCircle, User, Lock } from "lucide-react";
import shyawLogo from "@assets/shyaw_1754298603480.jpg";

export default function LoginPage() {
  const { t } = useTranslation();
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
    role: "security",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginForm.username, loginForm.password);
      toast({
        title: t("success"),
        description: t("loginSuccess"),
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("loginFailed"),
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
        title: t("registrationSuccessful"),
        description: t("accountCreatedPending"),
      });
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("registrationFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden animate-slide-in">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-indigo-700/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-teal-400/10 to-transparent rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-teal-400/10 to-transparent rounded-full translate-y-24 -translate-x-24 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-300/5 rounded-full animate-pulse"></div>
        
        <div className="text-center text-white relative z-10 animate-fade-in">
          {/* Shyaw Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={shyawLogo} 
              alt="Shyaw Logo" 
              className="h-24 w-auto animate-pulse hover:scale-105 transition-transform duration-300 rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">{t("systemTitle")}</h1>
          <p className="text-xl text-indigo-100 mb-2">{t("professionalPlatform")}</p>
          <p className="text-indigo-200">{t("secureManagement")}</p>
          
          {/* Feature highlights */}
          <div className="mt-8 space-y-3 text-left max-w-sm">
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>{t("secureRoleAccess")}</span>
            </div>
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>{t("taskProjectManagement")}</span>
            </div>
            <div className="flex items-center space-x-3 text-green-100">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>{t("realtimeNotifications")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-indigo-50 to-white md:bg-none relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md animate-fade-in">
          {isLogin ? (
            <Card className="border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-hover">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-2 bg-white rounded-full shadow-lg animate-bounce-hover">
                    <img 
                      src={shyawLogo} 
                      alt="Shyaw Logo" 
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  </div>
                </div>
                <CardTitle className="text-3xl text-indigo-800">{t("welcomeBackTitle")}</CardTitle>
                <CardDescription className="text-indigo-600">{t("signInToSystem")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-indigo-700 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{t("username")}</span>
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("enterUsername")}
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-indigo-700 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>{t("password")}</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("enterPassword")}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mobile-button touch-target bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 animate-pulse-hover shadow-lg hover:shadow-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? t("signingIn") : t("signIn")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors animate-bounce-hover"
                  >
                    {t("dontHaveAccount")}
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-hover">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full animate-bounce-hover">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-indigo-800">{t("createAccount")}</CardTitle>
                <CardDescription className="text-indigo-600">{t("joinSystem")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-indigo-700">{t("firstName")}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-indigo-700">{t("lastName")}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-indigo-700">{t("username")}</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-indigo-700">{t("emailAddress")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-indigo-700">{t("password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("createStrongPassword")}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-indigo-700">{t("requestedRole")}</Label>
                    <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}>
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder={t("selectRoleRequest")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">{t("manager")}</SelectItem>
                        <SelectItem value="security">{t("security")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white mobile-button touch-target transition-all duration-300 animate-pulse-hover shadow-lg hover:shadow-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? t("creatingAccount") : t("createAccount")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors animate-bounce-hover"
                  >
                    {t("alreadyHaveAccount")}
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
