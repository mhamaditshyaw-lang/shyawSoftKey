import { MENU_PARTITIONS, type MenuPartition } from "@/lib/menu-partitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DepartmentPartitionProps {
  departments: { [key: string]: any };
}

export default function DepartmentPartitions({ departments }: DepartmentPartitionProps) {
  return (
    <div className="space-y-6">
      {MENU_PARTITIONS.map((partition) => {
        const deptInPartition = Object.values(departments).filter((dept: any) => 
          dept.partition === partition.title || (dept.category === partition.title)
        );

        return (
          <div key={partition.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{partition.icon}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {partition.title}
              </h2>
              <Badge variant="outline">{deptInPartition.length} department(s)</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deptInPartition.length > 0 ? (
                deptInPartition.map((dept: any) => (
                  <Card key={dept.name} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>Manager: {dept.manager?.firstName || "Unassigned"}</p>
                        <p className="mt-1">Members: {dept.employees.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">
                  No departments in this partition
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
