import { useLocation } from "wouter";
import { MENU_PARTITIONS, getPartitionByPage, getPageTitle } from "@/lib/menu-partitions";

export function usePagePartition() {
  const [location] = useLocation();
  
  const partition = getPartitionByPage(location);
  const pageTitle = getPageTitle(location);
  
  return {
    partition,
    pageTitle,
    partitionTitle: partition?.title,
    partitionIcon: partition?.icon,
    partitionDescription: partition?.description,
  };
}
