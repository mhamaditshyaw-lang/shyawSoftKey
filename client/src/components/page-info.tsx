import { usePagePartition } from "@/hooks/use-page-partition";

export function PageInfo() {
  const { partition, pageTitle, partitionTitle, partitionIcon } = usePagePartition();
  
  if (!partition) return null;
  
  return (
    <div className="flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <span className="text-2xl">{partitionIcon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
          {partitionTitle}
        </span>
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          {pageTitle}
        </span>
      </div>
    </div>
  );
}
