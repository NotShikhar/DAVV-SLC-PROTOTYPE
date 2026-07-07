import Link from "next/link";
import { Crest } from "@/components/shared/Logo";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="text-center">
        <Crest className="mx-auto size-16" />
        <p className="mt-6 font-heading text-5xl font-bold text-navy">404</p>
        <p className="mt-2 text-slate">This page could not be found.</p>
        <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
          Back to portal
        </Link>
      </div>
    </div>
  );
}
