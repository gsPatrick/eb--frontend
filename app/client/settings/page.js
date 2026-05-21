'use client';

import SettingsForm from '@/components/organisms/SettingsForm';
import ClientLayout from '@/components/templates/ClientLayout';

export default function ClientSettingsPage() {
  return (
    <ClientLayout>
      <SettingsForm homeHref="/client/properties" />
    </ClientLayout>
  );
}
