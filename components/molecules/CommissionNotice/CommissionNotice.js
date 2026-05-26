'use client';

import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import { formatCurrency } from '@/utils/formatters';
import styles from './CommissionNotice.module.css';

const COMMISSION_RATE = 0.33;

export default function CommissionNotice({ amount }) {
  const { t } = useTranslation();
  const total = Number(amount || 0);

  if (total <= 0) {
    return (
      <div className={styles.notice}>
        <Icon name="info" size={18} />
        <p>{t('admin.orders.form.commissionHint')}</p>
      </div>
    );
  }

  const commission = total * COMMISSION_RATE;
  const payout = total - commission;

  return (
    <div className={styles.notice}>
      <Icon name="info" size={18} />
      <div>
        <p>{t('admin.orders.form.commissionHint')}</p>
        <p className={styles.breakdown}>
          {t('admin.orders.form.commissionBreakdown', {
            total: formatCurrency(total),
            commission: formatCurrency(commission),
            payout: formatCurrency(payout),
          })}
        </p>
      </div>
    </div>
  );
}
