import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

interface PortalLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Opens a real external DAVV/MP portal in a new tab. */
export function PortalLink({ href, children, variant = "secondary", size = "sm" }: PortalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={buttonClasses(variant, size)}>
      {children}
      <ExternalLink className="size-3.5" />
    </a>
  );
}
