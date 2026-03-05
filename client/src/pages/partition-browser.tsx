import { MENU_PARTITIONS } from "@/lib/menu-partitions";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function PartitionBrowserPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("pagePartitions")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("browseAllPages")}
          </p>
        </div>

        {MENU_PARTITIONS.map((partition) => (
          <div key={partition.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{partition.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {partition.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {partition.description}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {partition.items.length} {t("pagesCount")}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {partition.items.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-gray-500 dark:text-gray-400">
                        {item.path}
                      </code>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
