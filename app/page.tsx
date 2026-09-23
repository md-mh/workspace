import { WorkspaceExplorer } from "@/components/explorer/workspace-explorer";
import { ToastProvider } from "@/components/ui/toast";
import { WorkspaceProvider } from "@/components/workspace-provider";

export default function HomePage() {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <WorkspaceExplorer />
      </WorkspaceProvider>
    </ToastProvider>
  );
}
