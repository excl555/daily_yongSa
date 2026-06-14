import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '하루 용사',
  description: '현실의 작은 행동을 일일퀘스트로 바꾸는 생활형 자기관리 노트'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
