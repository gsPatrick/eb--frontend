'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/atoms/Badge';
import styles from './AlertCarousel.module.css';
import { cn } from '@/utils/cn';

export default function AlertCarousel({ items = [], className, interval = 3500 }) {
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
          {items.map((alert) => (
            <article key={alert.id} className={styles.slide}>
              <span className={styles.text}>
                <strong>{alert.property}</strong> — {alert.item}
              </span>
              <Badge variant="error">
                {alert.quantity}/{alert.minQuantity}
              </Badge>
            </article>
          ))}
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
              aria-label={`Alerta ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
