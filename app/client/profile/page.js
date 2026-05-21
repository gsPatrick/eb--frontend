'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileForm from '@/components/organisms/ProfileForm';
import ClientLayout from '@/components/templates/ClientLayout';
import ProfileLayout from '@/components/templates/ProfileLayout';
import { CURRENT_CLIENT } from '@/constants/clientMockData';
import { loadProfileUser } from '@/utils/profileHelpers';
import { formatDate } from '@/utils/formatters';
import { useLocale } from '@/context/I18nProvider';

export default function ClientProfilePage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const [user, setUser] = useState(CURRENT_CLIENT);

  const stats = [
    { label: t('roles.client'), value: t('common.active') },
    { label: t('profile.verifiedAccount'), value: '✓' },
    { label: formatDate(user.lastLoginAt, intlLocale), value: t('profile.lastAccess') },
  ];

  return (
    <ClientLayout>
      <ProfileLayout user={user} homeHref="/client/properties" stats={stats}>
        <ProfileForm fallbackUser={loadProfileUser(CURRENT_CLIENT)} onUserChange={setUser} />
      </ProfileLayout>
    </ClientLayout>
  );
}
