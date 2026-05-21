'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from '@/components/atoms/Select';
import Card from '@/components/molecules/Card';
import Skeleton from '@/components/atoms/Skeleton';
import Icon from '@/components/atoms/Icon';
import { formatCurrency } from '@/utils/formatters';
import styles from './BillingChart.module.css';
import { cn } from '@/utils/cn';

function normalizeDataByYear(dataByYear) {
  const normalized = {};

  Object.entries(dataByYear || {}).forEach(([year, months]) => {
    normalized[Number(year)] = (months || [])
      .map((item) => ({
        month: Number(item.month),
        value: Number(item.value) || 0,
      }))
      .sort((a, b) => a.month - b.month);
  });

  return normalized;
}

function getYearOptions(dataByYear) {
  const years = Object.keys(dataByYear).map(Number);
  const currentYear = new Date().getFullYear();

  if (!years.includes(currentYear)) {
    years.push(currentYear);
  }

  return years.sort((a, b) => b - a);
}

function getMonthLabel(monthIndex, locale, style = 'short') {
  return new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2024, monthIndex, 1));
}

function buildYearChart(yearData, locale) {
  const byMonth = Object.fromEntries((yearData || []).map((item) => [item.month, item.value]));

  return Array.from({ length: 12 }, (_, month) => ({
    month,
    value: byMonth[month] ?? 0,
    label: getMonthLabel(month, locale, 'short'),
  }));
}

function formatChange(current, previous, label) {
  if (previous == null || previous === 0) return null;

  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toLocaleString(undefined, { maximumFractionDigits: 1 })}% ${label}`;
}

export default function BillingChart({ dataByYear = {}, loading = false, className }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'pt-BR';
  const normalizedData = useMemo(() => normalizeDataByYear(dataByYear), [dataByYear]);
  const yearOptions = useMemo(() => getYearOptions(normalizedData), [normalizedData]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    setYear((current) => (yearOptions.includes(current) ? current : yearOptions[0]));
  }, [yearOptions]);

  const yearData = normalizedData[year] || [];
  const chartData = useMemo(() => buildYearChart(yearData, locale), [yearData, locale]);
  const selectedPoint = chartData.find((item) => item.month === month) || chartData[month] || chartData[0];
  const previousPoint = chartData.find((item) => item.month === month - 1);
  const changeLabel = selectedPoint
    ? formatChange(selectedPoint.value, previousPoint?.value, t('admin.dashboard.billingChart.vsPreviousMonth'))
    : null;
  const max = Math.max(...chartData.map((item) => item.value), 1);
  const hasAnyBilling = useMemo(
    () => Object.values(normalizedData).some((entries) => entries.some((item) => item.value > 0)),
    [normalizedData]
  );
  const isChartEmpty = !hasAnyBilling || chartData.every((item) => item.value === 0);

  const handleYearChange = (event) => {
    setYear(Number(event.target.value));
  };

  if (loading) {
    return (
      <Card variant="default" padding="md" className={cn(styles.card, className)}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="title" className={styles.skeletonChart} />
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className={cn(styles.card, className)}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <p className={styles.label}>{t('admin.dashboard.billingChart.title')}</p>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label htmlFor="billing-month">{t('admin.dashboard.billingChart.month')}</label>
                <Select
                  id="billing-month"
                  className={styles.filterSelect}
                  value={String(month)}
                  onChange={(event) => setMonth(Number(event.target.value))}
                >
                  {chartData.map((item) => (
                    <option key={item.month} value={String(item.month)}>
                      {getMonthLabel(item.month, locale, 'long')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="billing-year">{t('admin.dashboard.billingChart.year')}</label>
                <Select
                  id="billing-year"
                  className={styles.filterSelect}
                  value={String(year)}
                  onChange={handleYearChange}
                >
                  {yearOptions.map((item) => (
                    <option key={item} value={String(item)}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <p className={styles.value}>{formatCurrency(selectedPoint?.value || 0, locale)}</p>
          <p className={styles.period}>
            {getMonthLabel(selectedPoint?.month ?? month, locale, 'long')} · {year}
          </p>
        </div>
        {changeLabel && (
          <span
            className={cn(
              styles.badge,
              selectedPoint?.value >= (previousPoint?.value || 0) ? styles.badgeUp : styles.badgeDown
            )}
          >
            {changeLabel}
          </span>
        )}
      </div>

      <div className={styles.chartWrap}>
        {isChartEmpty && (
          <div className={styles.emptyOverlay}>
            <span className={styles.emptyIcon}>
              <Icon name="billing" size={28} />
            </span>
            <p className={styles.emptyTitle}>{t('admin.dashboard.billingChart.emptyTitle')}</p>
            <p className={styles.emptyDescription}>{t('admin.dashboard.billingChart.emptyDescription')}</p>
          </div>
        )}

        <div
          className={cn(styles.chart, isChartEmpty && styles.chartMuted)}
          style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
        >
          {chartData.map((item) => (
            <button
              key={`${year}-${item.month}`}
              type="button"
              className={cn(styles.barGroup, item.month === month && styles.barGroupActive)}
              onClick={() => setMonth(item.month)}
              aria-label={`${item.label} ${year}: ${formatCurrency(item.value, locale)}`}
            >
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ height: `${(item.value / max) * 100}%` }}
                />
              </div>
              <span className={styles.month}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
