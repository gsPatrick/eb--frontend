'use client';

import SettingsForm from '@/components/organisms/SettingsForm';
import ProviderLayout from '@/components/templates/ProviderLayout';

export default function ProviderSettingsPage() {
  return (
    <ProviderLayout>
      <SettingsForm homeHref="/provider/schedule" />
    </ProviderLayout>
  );
}
