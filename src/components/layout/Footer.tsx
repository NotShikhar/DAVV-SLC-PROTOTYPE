import { Crest } from "@/components/shared/Logo";
import { INSTITUTE } from "@/lib/domain/constants";

export function Footer() {
  return (
    <footer className="mt-10 bg-navy text-white/80">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Crest className="size-10" />
            <div className="leading-tight">
              <p className="font-heading font-bold text-white">{INSTITUTE.shortName}</p>
              <p className="text-xs text-white/60">{INSTITUTE.university}</p>
            </div>
          </div>
          <p className="font-serif-accent mt-3 text-sm text-gold">{INSTITUTE.motto}</p>
          <p className="mt-1 text-xs text-white/60">{INSTITUTE.mottoTranslation}</p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="hover:text-gold" href="https://www.ietdavv.edu.in" target="_blank" rel="noreferrer">Institute website</a></li>
            <li><a className="hover:text-gold" href="https://www.dauniv.ac.in/student-services" target="_blank" rel="noreferrer">Student services (CBA)</a></li>
            <li><a className="hover:text-gold" href="https://davv.mponline.gov.in" target="_blank" rel="noreferrer">DAVV SIS portal</a></li>
            <li><a className="hover:text-gold" href="https://dte.mponline.gov.in" target="_blank" rel="noreferrer">DTE MP counselling</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Contact</h3>
          <address className="mt-3 space-y-1 text-sm not-italic text-white/70">
            <p>{INSTITUTE.campus}</p>
            <p>{INSTITUTE.phone}</p>
            <p>{INSTITUTE.email}</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-4 text-xs text-white/50">
          <p>
            Campus photo by Lifeisshubh (CC BY-SA 4.0). DAVV / IET names and emblems are trademarks of
            their owners, shown here for a demonstration prototype only.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {INSTITUTE.university}, Indore — prototype for demonstration only.</p>
            <p>Accessibility · Privacy · Website policy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
