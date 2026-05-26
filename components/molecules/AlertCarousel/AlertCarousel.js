'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/atoms/Badge';
import { getStockBadgeVariant, getStockLabel } from '@/utils/inventoryHelpers';
import styles from './AlertCarousel.module.css';
import { cn } from '@/utils/cn';

const BADGE_CLASS = {
  error: styles.badgeCritical,
  warning: styles.badgeReview,
  success: styles.badgeOk,
};

export default function AlertCarousel({ items = [], className, interval = 3500, t }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval, paused]);

  if (!items.length) return null;

  return (
    <div
      className={cn(styles.root, className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((alert) => {
            const badgeVariant = getStockBadgeVariant(alert.status);
            return (
            <article
              key={alert.id}
              className={cn(
                styles.slide,
                alert.status === 'critical' && styles.slideCritical,
                alert.status === 'review' && styles.slideReview
              )}
            >
              <span className={styles.text}>
                <strong>{alert.property}</strong> — {alert.item}
              </span>
              <div className={styles.badges}>
                <Badge variant={badgeVariant} className={BADGE_CLASS[badgeVariant]}>
                  {t ? getStockLabel(alert.status, t) : alert.status}
                </Badge>
                <Badge variant={badgeVariant} className={BADGE_CLASS[badgeVariant]}>
                  {alert.quantity}/{alert.minQuantity}
                </Badge>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      {items.length > 1 && (
        <div className={styles.dots} aria-hidden="true">
          {items.map((alert, index) => (
            <button
              key={alert.id}
              type="button"
              className={cn(styles.dot, index === activeIndex && styles.dotActive)}
              onClick={() => setActiveIndex(index)}
              aria-label={t('common.alertIndex', { index: index + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
