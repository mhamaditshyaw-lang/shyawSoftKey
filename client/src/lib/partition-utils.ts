import { MENU_PARTITIONS } from "./menu-partitions";

export function getAllPages() {
  const pages: any[] = [];
  MENU_PARTITIONS.forEach((partition) => {
    partition.items.forEach((item) => {
      pages.push({
        ...item,
        partition: partition.title,
        partitionIcon: partition.icon,
      });
    });
  });
  return pages;
}

export function getPagesByPartition(partitionTitle: string) {
  const partition = MENU_PARTITIONS.find((p) => p.title === partitionTitle);
  return partition?.items || [];
}

export function searchPages(query: string) {
  return getAllPages().filter(
    (page) =>
      page.label.toLowerCase().includes(query.toLowerCase()) ||
      page.description?.toLowerCase().includes(query.toLowerCase()) ||
      page.partition.toLowerCase().includes(query.toLowerCase())
  );
}

export function getPageBreadcrumb(path: string) {
  const partition = MENU_PARTITIONS.find((p) =>
    p.items.some((item) => item.path === path)
  );
  
  if (!partition) return null;
  
  const page = partition.items.find((item) => item.path === path);
  
  return {
    partition: {
      title: partition.title,
      icon: partition.icon,
    },
    page: {
      title: page?.label,
      description: page?.description,
    },
  };
}
