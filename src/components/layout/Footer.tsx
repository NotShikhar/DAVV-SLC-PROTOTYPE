import { Crest } from "@/components/shared/Logo";
import { INSTITUTE } from "@/lib/domain/constants";

export function Footer() {
  return (
    <footer className="bg-navy bg-navy-gradient mt-10 border-t-2 border-gold text-[rgba(243,231,211,0.8)]">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Crest className="size-11" />
            <div className="leading-tight">
              <p className="font-heading text-[17px] font-semibold text-[#f3e7d3]">{INSTITUTE.shortName}</p>
              <p className="text-xs text-[rgba(243,231,211,0.55)]">{INSTITUTE.university}</p>
            </div>
          </div>
          <p className="font-serif-accent mt-3 text-sm text-gold-bright">{INSTITUTE.motto}</p>
          <p className="mt-1 text-xs text-[rgba(243,231,211,0.55)]">{INSTITUTE.mottoTranslation}</p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-[#f3e7d3]">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="hover:text-gold-bright" href="https://www.ietdavv.edu.in" target="_blank" rel="noreferrer">Institute website</a></li>
            <li><a className="hover:text-gold-bright" href="https://www.dauniv.ac.in/student-services" target="_blank" rel="noreferrer">Student services (CBA)</a></li>
            <li><a className="hover:text-gold-bright" href="https://davv.mponline.gov.in" target="_blank" rel="noreferrer">DAVV SIS portal</a></li>
            <li><a className="hover:text-gold-bright" href="https://dte.mponline.gov.in" target="_blank" rel="noreferrer">DTE MP counselling</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-[#f3e7d3]">Contact</h3>
          <address className="mt-3 space-y-1 text-sm text-[rgba(243,231,211,0.7)] not-italic">
            <p>{INSTITUTE.campus}</p>
            <p>{INSTITUTE.phone}</p>
            <p>{INSTITUTE.email}</p>
          </address>
        </div>
      </div>

      <div className="border-t border-[rgba(226,184,119,0.18)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-4 text-xs text-[rgba(243,231,211,0.5)]">
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
