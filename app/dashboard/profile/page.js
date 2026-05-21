'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileForm from '@/components/organisms/ProfileForm';
import DashboardLayout from '@/components/templates/DashboardLayout';
import ProfileLayout from '@/components/templates/ProfileLayout';
import { CURRENT_ADMIN } from '@/constants/adminMockData';
import { useLocale } from '@/context/I18nProvider';
import { loadProfileUser } from '@/utils/profileHelpers';
import { formatDate } from '@/utils/formatters';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const [user, setUser] = useState(CURRENT_ADMIN);

  const stats = [
    { label: t('roles.admin'), value: t('profile.fullAccess') },
    { label: t('common.active'), value: t('profile.verifiedAccount') },
    { label: formatDate(user.lastLoginAt, intlLocale), value: t('profile.lastAccess') },
  ];

  return (
    <DashboardLayout>
      <ProfileLayout user={user} homeHref="/dashboard" stats={stats}>
        <ProfileForm fallbackUser={loadProfileUser(CURRENT_ADMIN)} onUserChange={setUser} />
      </ProfileLayout>
    </DashboardLayout>
  );
}
