import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHistoryStore } from "@/lib/store";
import { UploadSection } from "@/components/UploadSection";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

function AppContent() {
  const data = useHistoryStore((s) => s.data);
  return data ? <Dashboard /> : <UploadSection />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <AppContent />
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
