'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import ProfileForm from '@/components/organisms/ProfileForm';
import ProfileLayout from '@/components/templates/ProfileLayout';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { CURRENT_PROVIDER } from '@/constants/providerMockData';
import { loadProfileUser } from '@/utils/profileHelpers';
import { formatDate } from '@/utils/formatters';
import styles from '@/styles/provider.module.css';

const PROFILE_LINKS = [
  { href: '/provider/inventory', labelKey: 'nav.providerInventory', icon: 'inventory' },
  { href: '/provider/settings', labelKey: 'nav.settings', icon: 'settings' },
];

export default function ProviderProfilePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState(CURRENT_PROVIDER);

  const stats = [
    { label: t('roles.provider'), value: t('common.active') },
    { label: formatDate(user.lastLoginAt), value: t('profile.lastAccess') },
  ];

  return (
    <ProviderLayout>
      <ProfileLayout user={user} homeHref="/provider/schedule" stats={stats}>
        <div className={styles.profileLinks}>
          {PROFILE_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.profileLinkRow}>
              <Icon name={item.icon} size={20} />
              <span>{t(item.labelKey)}</span>
            </Link>
          ))}
        </div>
        <ProfileForm fallbackUser={loadProfileUser(CURRENT_PROVIDER)} onUserChange={setUser} />
      </ProfileLayout>
    </ProviderLayout>
  );
}
