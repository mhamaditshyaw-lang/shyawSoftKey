import StructuredNavigation from "@/components/navigation/structured-navigation";

export default function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-6 pb-4 pt-20">
        <StructuredNavigation />
      </div>
    </div>
  );
}
