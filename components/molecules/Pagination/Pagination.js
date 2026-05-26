'use client';

import { useTranslation } from 'react-i18next';
import Icon from '@/components/atoms/Icon';
import styles from './Pagination.module.css';
import { cn } from '@/utils/cn';

const DEFAULT_PAGE_SIZES = [5, 10, 15, 20];

export default function Pagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  embedded = false,
  className,
}) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn(styles.root, embedded && styles.embedded, className)}>
      <div className={styles.pageSize}>
        <label htmlFor="page-size">{t('common.pagination.show')}</label>
        <select
          id="page-size"
          className={styles.select}
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>{t('common.pagination.perPage')}</span>
      </div>

      <div className={styles.controls}>
        <span className={styles.summary}>
          {totalItems > 0
            ? t('common.pagination.range', { start, end, total: totalItems })
            : t('common.pagination.empty')}
        </span>

        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label={t('common.pagination.previousPage')}
          >
            <Icon name="chevronLeft" size={16} />
          </button>

          <span className={styles.pageInfo}>
            {t('common.pagination.pageOf', { current: currentPage, total: totalPages })}
          </span>

          <button
            type="button"
            className={styles.navButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label={t('common.pagination.nextPage')}
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
