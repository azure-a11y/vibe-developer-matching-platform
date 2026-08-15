import type { Metadata } from 'next';
import { getSiteSettings } from '@orca/content';

import ContactView from './view';
import './contact.css';

export const metadata: Metadata = {
  title: '프로젝트 문의',
  description: '부담 없이 남겨주세요. 하루 안에 확인하고 연락드립니다.',
};

export default function ContactPage() {
  const { settings } = getSiteSettings();
  return <ContactView pluugFormUrl={settings.pluugFormUrl} />;
}
