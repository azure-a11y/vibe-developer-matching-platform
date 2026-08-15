import type { Metadata } from 'next';

import SubmitView from './view';
import './submit.css';

export const metadata: Metadata = {
  title: '문의 접수 완료',
  robots: { index: false },
};

export default function SubmitPage() {
  return <SubmitView />;
}
