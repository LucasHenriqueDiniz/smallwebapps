import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/tools/tubetrace/native/components/ui/toaster";
import { TooltipProvider } from "@/tools/tubetrace/native/components/ui/tooltip";
import { useHistoryStore } from "@/tools/tubetrace/native/lib/store";
import { UploadSection } from "@/tools/tubetrace/native/components/UploadSection";
import { Dashboard } from "@/tools/tubetrace/native/components/Dashboard";
import { Footer } from "@/tools/tubetrace/native/components/Footer";

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
