import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Shield, Users, Settings, UserCheck, Database, Eye, EyeOff } from "lucide-react";

interface MultilingualRoleDemoProps {
  className?: string;
}

export function MultilingualRoleDemo({ className }: MultilingualRoleDemoProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showRoleDetails, setShowRoleDetails] = useState(false);

  // Sample data that changes based on role and language
  const rolePermissions = {
    admin: [
      { key: "userManagement", action: t("users"), allowed: true },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: true },
      { key: "archive", action: t("archive"), allowed: true },
      { key: "systemSettings", action: t("settings"), allowed: true }
    ],
    manager: [
      { key: "userManagement", action: t("users"), allowed: false },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: true },
      { key: "archive", action: t("archive"), allowed: true },
      { key: "systemSettings", action: t("settings"), allowed: false }
    ],
    security: [
      { key: "userManagement", action: t("users"), allowed: false },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: false },
      { key: "archive", action: t("archive"), allowed: false },
      { key: "systemSettings", action: t("settings"), allowed: false }
    ],
    secretary: [
      { key: "userManagement", action: t("users"), allowed: false },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: true },
      { key: "archive", action: t("archive"), allowed: true },
      { key: "systemSettings", action: t("settings"), allowed: false }
    ],
    office: [
      { key: "userManagement", action: t("users"), allowed: false },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: true },
      { key: "archive", action: t("archive"), allowed: true },
      { key: "systemSettings", action: t("settings"), allowed: false }
    ],
    office_team: [
      { key: "userManagement", action: t("users"), allowed: true },
      { key: "dataView", action: t("dataView"), allowed: true },
      { key: "reports", action: t("reports"), allowed: true },
      { key: "archive", action: t("archive"), allowed: true },
      { key: "systemSettings", action: t("settings"), allowed: false }
    ]
  };

  const currentUserRole = user?.role || 'security';
  const userPermissions = rolePermissions[currentUserRole as keyof typeof rolePermissions] || rolePermissions.security;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'manager': return <Users className="w-4 h-4" />;
      case 'security': return <UserCheck className="w-4 h-4" />;
      case 'secretary': return <Settings className="w-4 h-4" />;
      case 'office': return <Database className="w-4 h-4" />;
      case 'office_team': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'security': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'secretary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'office': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'office_team': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className={className}>
      {/* Language and Role Status Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {t("systemTitle")} - {t("language")} & {t("role")} Demo
              </CardTitle>
              <CardDescription>
                {i18n.language === 'ku' 
                  ? "ئەم نمونەیە پیشاندانی سیستەمی زمان و ڕۆڵی بەکارهێنەر دەدات"
                  : "This demo showcases multilingual support and role-based access control"}
              </CardDescription>
            </div>
            <LanguageSwitcher />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Language */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">{t("language")}</h3>
              <div className="mt-2">
                <Badge variant="outline" className="text-sm">
                  {i18n.language === 'ku' ? 'کوردی (Kurdish)' : 'English'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {i18n.language === 'ku' 
                  ? "زمانی ئێستا"
                  : "Current Language"}
              </p>
            </div>

            {/* Current User Role */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">{t("role")}</h3>
              <div className="mt-2">
                <Badge className={`text-sm ${getRoleColor(currentUserRole)}`}>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(currentUserRole)}
                    {t(currentUserRole)}
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {i18n.language === 'ku' 
                  ? "ڕۆڵی ئێستا"
                  : "Current Role"}
              </p>
            </div>

            {/* User Info */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">{t("username")}</h3>
              <div className="mt-2">
                <Badge variant="secondary" className="text-sm">
                  {user?.username || 'demo-user'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {i18n.language === 'ku' 
                  ? "بەکارهێنەری چالاک"
                  : "Active User"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Permissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {i18n.language === 'ku' 
                  ? "مافەکانی ڕۆڵ" 
                  : "Role-Based Permissions"}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'ku' 
                  ? "ئەم خشتەیە پیشاندانی مافەکانی جیاواز بەپێی ڕۆڵەکە دەدات"
                  : "This table shows different permissions based on your current role"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleDetails(!showRoleDetails)}
            >
              {showRoleDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showRoleDetails ? (i18n.language === 'ku' ? "شاردنەوە" : "Hide") : (i18n.language === 'ku' ? "پیشاندان" : "Show")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {i18n.language === 'ku' ? "کردار" : "Action"}
                </TableHead>
                <TableHead>
                  {i18n.language === 'ku' ? "مافی دەستگەیشتن" : "Access Permission"}
                </TableHead>
                {showRoleDetails && (
                  <TableHead>
                    {i18n.language === 'ku' ? "وردەکاری" : "Details"}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPermissions.map((permission, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {permission.action}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={permission.allowed ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {permission.allowed ? (i18n.language === 'ku' ? "ڕێگەپێدراو" : "Allowed") : (i18n.language === 'ku' ? "قەدەغە" : "Denied")}
                    </Badge>
                  </TableCell>
                  {showRoleDetails && (
                    <TableCell className="text-sm text-muted-foreground">
                      {permission.allowed 
                        ? (i18n.language === 'ku' 
                            ? `ڕۆڵی ${t(currentUserRole)} دەتوانێت ئەم کردارە ئەنجام بدات`
                            : `${t(currentUserRole)} role can perform this action`)
                        : (i18n.language === 'ku' 
                            ? `ڕۆڵی ${t(currentUserRole)} ناتوانێت ئەم کردارە ئەنجام بدات`
                            : `${t(currentUserRole)} role cannot perform this action`)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Language Switch Demo */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {i18n.language === 'ku' ? "نمونەی گۆڕینی زمان" : "Language Switch Demo"}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'ku' ? "بۆ گۆڕینی زمان لە سەرەوە کلیک بکە" : "Click the language switcher above to see real-time translation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">
                {i18n.language === 'ku' ? "ڕەنگەکان:" : "Colors:"}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>{i18n.language === 'ku' ? "سوور" : "Red"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>{i18n.language === 'ku' ? "شین" : "Blue"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>{i18n.language === 'ku' ? "سەوز" : "Green"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">
                {i18n.language === 'ku' ? "ژمارەکان:" : "Numbers:"}
              </h4>
              <div className="space-y-2">
                <div>{i18n.language === 'ku' ? "یەک (1)" : "One (1)"}</div>
                <div>{i18n.language === 'ku' ? "دوو (2)" : "Two (2)"}</div>
                <div>{i18n.language === 'ku' ? "سێ (3)" : "Three (3)"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MultilingualRoleDemo;