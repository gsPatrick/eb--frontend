'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileForm from '@/components/organisms/ProfileForm';
import ProfileLayout from '@/components/templates/ProfileLayout';
import { CURRENT_ADMIN } from '@/constants/adminMockData';
import { useLocale } from '@/context/I18nProvider';
import { loadProfileUser } from '@/utils/profileHelpers';
import { formatDate } from '@/utils/formatters';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { intlLocale } = useLocale();
  const fallbackUser = useMemo(() => loadProfileUser(CURRENT_ADMIN), []);
  const [user, setUser] = useState(fallbackUser);

  const stats = [
    { label: t('roles.admin'), value: t('profile.fullAccess') },
    { label: t('common.active'), value: t('profile.verifiedAccount') },
    { label: formatDate(user.lastLoginAt, intlLocale), value: t('profile.lastAccess') },
  ];

  return (
      <ProfileLayout user={user} homeHref="/dashboard" stats={stats}>
        <ProfileForm fallbackUser={fallbackUser} onUserChange={setUser} />
      </ProfileLayout>
  );
}
