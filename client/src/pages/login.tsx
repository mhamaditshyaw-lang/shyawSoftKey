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
import shyawLogo from "@assets/471475240_947707180790302_4939073619779254090_n_1758617373531.jpg";
import productImage from "@assets/528057878_1108486178045734_3322076440828669630_n_1758617373530.jpg";

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

      {/* Left Panel - Product Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${productImage})`,
            backgroundColor: '#3c2446'
          }}
        >
          {/* Overlay for brand consistency */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 relative min-h-0">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Logo at top of form - Desktop only */}
        <div className="hidden lg:block mb-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <img src={shyawLogo} alt="Shyaw Logo" className="h-32 w-auto" />
          </div>
        </div>

        <div className="w-full max-w-md">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Mobile Logo in form - only visible on mobile */}
              <div className="lg:hidden flex justify-center">
                <div className="p-3 bg-white rounded-full shadow-lg">
                  <img src={shyawLogo} alt="Shyaw Logo" className="w-32 h-auto" />
                </div>
              </div>
              <CardTitle 
                className="text-2xl sm:text-3xl font-bold" 
                style={{ color: '#3c2446' }}
              >
                {t("welcomeBackTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className="flex items-center space-x-2 text-sm font-medium"
                    style={{ color: '#3c2446' }}
                  >
                    <User className="w-4 h-4" />
                    <span>{t("username")}</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="h-12 border-gray-300 focus:border-[#3c2446] focus:ring-[#3c2446] transition-all duration-300 text-base"
                    data-testid="input-username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="flex items-center space-x-2 text-sm font-medium"
                    style={{ color: '#3c2446' }}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t("password")}</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-12 border-gray-300 focus:border-[#3c2446] focus:ring-[#3c2446] transition-all duration-300 text-base"
                    data-testid="input-password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-white transition-all duration-300 shadow-lg hover:shadow-xl text-base font-medium touch-manipulation hover:opacity-90" 
                  style={{ backgroundColor: '#3c2446' }}
                  data-testid="button-login"
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