'use client';

import { useState } from 'react';
import ProfileForm from '@/components/organisms/ProfileForm';
import ProfileLayout from '@/components/templates/ProfileLayout';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { CURRENT_PROVIDER } from '@/constants/providerMockData';
import { loadProfileUser } from '@/utils/profileHelpers';
import { formatDate } from '@/utils/formatters';

export default function ProviderProfilePage() {
  const [user, setUser] = useState(CURRENT_PROVIDER);

  const stats = [
    { label: 'Prestador', value: 'Ativo' },
    { label: 'Avaliação média', value: `${CURRENT_PROVIDER.averageRating} ★` },
    { label: formatDate(user.lastLoginAt), value: 'Último acesso' },
  ];

  return (
    <ProviderLayout>
      <ProfileLayout user={user} homeHref="/provider/schedule" stats={stats}>
        <ProfileForm fallbackUser={loadProfileUser(CURRENT_PROVIDER)} onUserChange={setUser} />
      </ProfileLayout>
    </ProviderLayout>
  );
}
