import Header from "./header";
import PartitionMenuBar from "@/components/navigation/partition-menu-bar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  onMenuClick?: () => void;
}

export default function ProtectedLayout({ children, onMenuClick }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuClick={onMenuClick} />
      <PartitionMenuBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
