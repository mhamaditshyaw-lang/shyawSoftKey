import { usePagePartition } from "@/hooks/use-page-partition";
import { Badge } from "@/components/ui/card";

export function PageInfo() {
  const { partition, pageTitle, partitionTitle, partitionIcon } = usePagePartition();
  
  if (!partition) return null;
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">{partitionIcon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          {partitionTitle}
        </span>
        <span className="text-sm font-medium text-foreground">
          {pageTitle}
        </span>
      </div>
    </div>
  );
}
