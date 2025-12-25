import Header from "./header";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  onMenuClick?: () => void;
}

export default function ProtectedLayout({ children, onMenuClick }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
