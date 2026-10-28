import { Suspense } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { ShootTypeList, ShootTypeListSkeleton } from '@/features/booking/ShootTypeList';
// 첫 화면 안내 창은 잠시 끈다. 다시 쓰려면 아래 import와 <WelcomeModal />의 주석을 푼다.
// import { WelcomeModal } from '@/features/home/WelcomeModal';
import { STUDIO } from '@/lib/labels';

const SECTION = 'mx-auto w-full max-w-[1120px] px-5 sm:px-8';

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className={`${SECTION} pb-20 pt-14 sm:pb-28 sm:pt-24`}>
        <div className="viewfinder mx-2 max-w-full px-4 py-8 text-center sm:mx-auto sm:w-fit sm:px-14 sm:py-14">
          <h1
            id="hero-title"
            className="font-display text-[2.25rem] font-bold leading-[1.25] tracking-[-0.04em] sm:text-[3.75rem]"
          >
            찍을 시간을
            <br />
            미리 잡아 두세요.
          </h1>
        </div>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3">
          <ButtonLink href="/book" size="lg">
            예약하기
          </ButtonLink>
          <ButtonLink href="/my" variant="secondary" size="lg">
            예약 확인하기
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="about-title" className="border-t border-line bg-mist">
        <div className={`${SECTION} grid gap-10 py-16 sm:grid-cols-2 sm:py-24`}>
          <h2 id="about-title" className="font-display text-heading font-semibold sm:text-[2rem]">
            {STUDIO.name}
          </h2>
          <div className="flex flex-col gap-8">
            <p className="max-w-[40ch] text-lead">
              증명사진과 가족사진, 프로필사진을 찍는 동네 사진관이에요. 원하는 시간에 예약하고 방문해 주세요.
            </p>
            <dl className="grid grid-cols-[5.5rem_1fr] gap-y-2 text-body">
              <dt className="text-ink-soft">영업시간</dt>
              <dd>{STUDIO.hours}</dd>
              <dt className="text-ink-soft">점심시간</dt>
              <dd>{STUDIO.lunch.replace('점심 ', '')}</dd>
              <dt className="text-ink-soft">휴무</dt>
              <dd>{STUDIO.closed.replace(' 휴무', '')}</dd>
              <dt className="text-ink-soft">전화</dt>
              <dd>{STUDIO.phone}</dd>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="programs-title" className={`${SECTION} py-16 sm:py-24`}>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="programs-title" className="font-display text-heading font-semibold sm:text-[2rem]">
            촬영 종류와 가격
          </h2>
          <p className="text-small text-ink-faint">* 결제는 촬영 당일 현장에서 해요.</p>
        </div>
        <Suspense fallback={<ShootTypeListSkeleton />}>
          <ShootTypeList />
        </Suspense>
      </section>

      {/* <WelcomeModal /> */}
    </>
  );
}
