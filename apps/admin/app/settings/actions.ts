'use server';

import { revalidatePath } from 'next/cache';
import { getSiteSettingsRepository } from '@orca/content';

import { requireMenuPermission } from '@/lib/permissions';

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireMenuPermission('settings', 'edit_approve');

  await getSiteSettingsRepository().save({
    brandName: text(formData, 'brandName'),
    domain: text(formData, 'domain'),
    pluugFormUrl: text(formData, 'pluugFormUrl'),
    companyName: text(formData, 'companyName'),
    ceoName: text(formData, 'ceoName'),
    businessRegistrationNumber: text(formData, 'businessRegistrationNumber'),
    operatedBy: text(formData, 'operatedBy'),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath('/settings');
}
