'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/atoms/Select';
import Card from '@/components/molecules/Card';
import Skeleton from '@/components/atoms/Skeleton';
import { BILLING_MONTHS, MOCK_BILLING_BY_YEAR } from '@/constants/adminMockData';
import { formatCurrency } from '@/utils/formatters';
import styles from './BillingChart.module.css';
import { cn } from '@/utils/cn';

function getDefaultSelection(dataByYear) {
  const years = Object.keys(dataByYear).map(Number).sort((a, b) => b - a);
  const year = years[0] || new Date().getFullYear();
  const yearData = dataByYear[year] || [];
  const month = yearData[yearData.length - 1]?.month ?? 0;

  return { year, month };
}

function formatChange(current, previous) {
  if (previous == null || previous === 0) return null;

  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% vs mês anterior`;
}

export default function BillingChart({
  dataByYear = MOCK_BILLING_BY_YEAR,
  loading = false,
  className,
}) {
  const defaults = useMemo(() => getDefaultSelection(dataByYear), [dataByYear]);
  const [year, setYear] = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);

  const years = useMemo(
    () => Object.keys(dataByYear).map(Number).sort((a, b) => b - a),
    [dataByYear]
  );

  const yearData = dataByYear[year] || [];
  const chartData = yearData.map((item) => ({
    ...item,
    label: BILLING_MONTHS[item.month]?.short || '',
  }));

  const selectedPoint = yearData.find((item) => item.month === month) || yearData[yearData.length - 1];
  const previousPoint = yearData.find((item) => item.month === (selectedPoint?.month ?? 0) - 1);
  const changeLabel = selectedPoint ? formatChange(selectedPoint.value, previousPoint?.value) : null;
  const max = Math.max(...chartData.map((item) => item.value), 1);

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    setYear(nextYear);

    const nextYearData = dataByYear[nextYear] || [];
    const hasCurrentMonth = nextYearData.some((item) => item.month === month);

    if (!hasCurrentMonth && nextYearData.length) {
      setMonth(nextYearData[nextYearData.length - 1].month);
    }
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
            <p className={styles.label}>Faturamento</p>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label htmlFor="billing-month">Mês</label>
                <Select
                  id="billing-month"
                  className={styles.filterSelect}
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                >
                  {BILLING_MONTHS.map((item) => {
                    const available = yearData.some((entry) => entry.month === item.value);
                    return (
                      <option key={item.value} value={item.value} disabled={!available}>
                        {item.label}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="billing-year">Ano</label>
                <Select
                  id="billing-year"
                  className={styles.filterSelect}
                  value={year}
                  onChange={handleYearChange}
                >
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <p className={styles.value}>{formatCurrency(selectedPoint?.value || 0)}</p>
          <p className={styles.period}>
            {BILLING_MONTHS[selectedPoint?.month ?? month]?.label} · {year}
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

      <div className={styles.chart} style={{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }}>
        {chartData.map((item) => (
          <button
            key={`${year}-${item.month}`}
            type="button"
            className={cn(styles.barGroup, item.month === month && styles.barGroupActive)}
            onClick={() => setMonth(item.month)}
            aria-label={`${item.label} ${year}: ${formatCurrency(item.value)}`}
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
    </Card>
  );
}
