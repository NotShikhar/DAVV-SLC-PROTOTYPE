import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

/** Shown when an admin opens a section their role can't access. */
export function NoAccess() {
  return (
    <Card className="mt-6">
      <EmptyState
        icon={Lock}
        title="No access"
        description="Your admin role doesn't have permission for this section. Ask a Super Admin to grant it under Roles & Permissions."
      />
    </Card>
  );
}
