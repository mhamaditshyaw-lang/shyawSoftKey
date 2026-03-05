import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTranslation } from "react-i18next";
import { Download, Upload, Database, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function BackupRestorePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      setLocation('/access-denied');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg-light dark:bg-dashboard-bg-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-dashboard-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch("/api/backup/download", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create backup' }));
        throw new Error(errorData.message || "Failed to create backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Database backup downloaded successfully!",
      });
    } catch (error: any) {
      console.error("Backup error:", error);
      toast({
        title: "Error",
        description: "Failed to create backup: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a backup file first",
        variant: "destructive",
      });
      return;
    }

    const confirmRestore = window.confirm(
      "WARNING: Restoring a backup will replace ALL current data in the database. This action cannot be undone. Are you sure you want to continue?"
    );

    if (!confirmRestore) {
      return;
    }

    try {
      setIsRestoring(true);
      const backupData = await selectedFile.text();

      const response = await authenticatedRequest("POST", "/api/backup/restore", {
        backupData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to restore backup");
      }

      toast({
        title: "Success",
        description: "Database restored successfully! Please refresh the page.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Restore error:", error);
      toast({
        title: "Error",
        description: "Failed to restore backup: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-dashboard-primary" />
          <div>
            <h1 className="text-3xl font-bold text-dashboard-text-light dark:text-dashboard-text-dark">
              {t("backupRestore")}
            </h1>
            <p className="text-dashboard-secondary dark:text-dashboard-text-dark/60">
              {t("manageDatabaseBackups")}
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            This feature allows you to backup your database to a local file and restore it when needed. 
            This is useful for migrating between servers or creating local backups.
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-dashboard-primary/10 to-dashboard-accent/10">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-dashboard-primary" />
              <CardTitle>{t("downloadBackup")}</CardTitle>
            </div>
            <CardDescription>
              {t("createBackupDatabase")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    {t("safeOperation")}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {t("downloadingDoesNotAffect")}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full bg-dashboard-primary hover:bg-dashboard-primary/90"
                size="lg"
                data-testid="button-download-backup"
              >
                {isBackingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {t("creatingBackup")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    {t("downloadDatabaseBackup")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle>{t("restoreFromBackup")}</CardTitle>
            </div>
            <CardDescription>
              {t("uploadAndRestoreBackup")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Restoring a backup will replace ALL current data in the database. 
                  This action cannot be undone. Make sure to download a current backup before restoring.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="backup-file" className="text-dashboard-text-light dark:text-dashboard-text-dark">
                  {t("selectBackupFileSql")}
                </Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".sql"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  disabled={isRestoring}
                  data-testid="input-backup-file"
                />
                {selectedFile && (
                  <p className="text-sm text-dashboard-secondary dark:text-dashboard-text-dark/60">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleRestore}
                disabled={!selectedFile || isRestoring}
                variant="destructive"
                className="w-full"
                size="lg"
                data-testid="button-restore-backup"
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {t("restoringDatabase")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    {t("restoreDatabaseFromBackup")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{t("bestPractices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-dashboard-secondary dark:text-dashboard-text-dark/80">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-dashboard-primary mt-0.5 flex-shrink-0" />
                <span>{t("backupPractice1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-dashboard-primary mt-0.5 flex-shrink-0" />
                <span>{t("backupPractice2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-dashboard-primary mt-0.5 flex-shrink-0" />
                <span>{t("backupPractice3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-dashboard-primary mt-0.5 flex-shrink-0" />
                <span>{t("backupPractice4")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-dashboard-primary mt-0.5 flex-shrink-0" />
                <span>{t("backupPractice5")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
