import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, User, Lock, Building2 } from "lucide-react";
import shyawLogo from "@assets/shyaw_1757849330148.png";

export default function LoginPage() {
  const { t } = useTranslation();
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



  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header with Logo - Only visible on mobile */}
      <div className="lg:hidden w-full bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <img src={shyawLogo} alt="Shyaw Logo" className="h-20 w-auto" />
        </div>
      </div>

      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex-col justify-center items-center p-8 xl:p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-indigo-700/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-teal-400/10 to-transparent rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-teal-400/10 to-transparent rounded-full translate-y-24 -translate-x-24 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-300/5 rounded-full animate-pulse"></div>

        <div className="text-center text-white relative z-10">
          {/* Shyaw Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <img src={shyawLogo} alt="Shyaw Logo" className="h-28 w-auto hover:scale-105 transition-transform duration-300" />
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 to-white lg:bg-none relative min-h-0">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          <Card className="border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Mobile Logo in form - only visible on mobile */}
              <div className="lg:hidden flex justify-center">
                <div className="p-2 bg-white rounded-full shadow-lg">
                  <img src={shyawLogo} alt="Shyaw Logo" className="w-24 h-auto" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-indigo-800 font-bold">{t("welcomeBackTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-indigo-700 flex items-center space-x-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    <span>{t("username")}</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("enterUsername")}
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-indigo-700 flex items-center space-x-2 text-sm font-medium">
                    <Lock className="w-4 h-4" />
                    <span>{t("password")}</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("enterPassword")}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-12 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 text-base"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl text-base font-medium touch-manipulation" 
                  disabled={isLoading}
                >
                  {isLoading ? t("signingIn") : t("signIn")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}