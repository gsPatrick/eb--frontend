'use client';

import styles from './Tabs.module.css';
import { cn } from '@/utils/cn';

export default function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn(styles.tabs, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={cn(styles.tab, activeTab === tab.id && styles.active)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
