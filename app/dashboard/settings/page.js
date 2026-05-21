'use client';

import SettingsForm from '@/components/organisms/SettingsForm';
import DashboardLayout from '@/components/templates/DashboardLayout';

export default function AdminSettingsPage() {
  return (
    <DashboardLayout>
      <SettingsForm homeHref="/dashboard" />
    </DashboardLayout>
  );
}
