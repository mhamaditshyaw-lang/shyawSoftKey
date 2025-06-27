import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

interface GlassTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  onRowClick?: (row: any) => void;
}

export function GlassTable({ columns, data, className, onRowClick }: GlassTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className={cn("glass-card rounded-2xl overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/20 dark:border-white/20">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-sm font-semibold text-black dark:text-white",
                    column.sortable && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "w-3 h-3 transition-colors duration-200",
                            sortColumn === column.key && sortDirection === "asc" 
                              ? "text-black dark:text-white" 
                              : "text-black/30 dark:text-white/30"
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            "w-3 h-3 -mt-1 transition-colors duration-200",
                            sortColumn === column.key && sortDirection === "desc" 
                              ? "text-black dark:text-white" 
                              : "text-black/30 dark:text-white/30"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-black/10 dark:border-white/10 transition-colors duration-200",
                  onRowClick && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-black/80 dark:text-white/80">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}