import Skeleton from '@/components/atoms/Skeleton';
import EmptyState from '@/components/molecules/EmptyState';
import styles from './DataTable.module.css';
import { cn } from '@/utils/cn';

export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  footer,
}) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={styles.th}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className={styles.empty}>
        <EmptyState icon="info" title={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn(styles.th, col.align === 'right' && styles.alignRight)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id || index}
                className={cn(styles.tr, onRowClick && styles.clickable)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn(styles.td, col.align === 'right' && styles.alignRight)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
