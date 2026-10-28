import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { STUDIO } from '@/lib/labels';
import './globals.css';

const DESCRIPTION = '증명사진, 가족사진, 프로필사진 촬영 예약';

export const metadata: Metadata = {
  title: { default: `${STUDIO.name} 촬영 예약`, template: `%s | ${STUDIO.name}` },
  description: DESCRIPTION,
  openGraph: { title: STUDIO.name, description: DESCRIPTION, locale: 'ko_KR', type: 'website' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
