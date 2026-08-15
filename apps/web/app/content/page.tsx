import type { Metadata } from 'next';

import ContentView from './view';
import './content.css';

export const metadata: Metadata = {
  title: '콘텐츠 — 영상으로 보는 우리의 작업',
  description: '세 채널에서 매주 실전 바이브 코딩 콘텐츠가 올라옵니다.',
};

export default function ContentPage() {
  return <ContentView />;
}
