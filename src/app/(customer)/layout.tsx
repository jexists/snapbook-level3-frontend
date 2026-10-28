import { SiteHeader } from '@/components/layout/SiteHeader';
import { STUDIO } from '@/lib/labels';

export default function CustomerLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line bg-mist">
        <div className="mx-auto max-w-[1120px] px-5 py-10 text-small text-ink-soft sm:px-8">
          <div className="flex flex-col gap-1">
            <p className="text-body font-semibold text-ink">{STUDIO.name}</p>
            <p>전화 {STUDIO.phone}</p>
            <p>
              {STUDIO.hours} · {STUDIO.lunch} · {STUDIO.closed}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
