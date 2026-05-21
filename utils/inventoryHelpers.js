export const INVENTORY_STOCK_STATUS = {
  OK: 'ok',
  REVIEW: 'review',
  CRITICAL: 'critical',
};

const REVIEW_THRESHOLD_MULTIPLIER = 1.5;

export function resolveInventoryStockStatus(quantity, minQuantity) {
  const qty = Number(quantity) || 0;
  const min = Number(minQuantity) || 0;

  if (qty <= min) {
    return INVENTORY_STOCK_STATUS.CRITICAL;
  }

  if (qty <= min * REVIEW_THRESHOLD_MULTIPLIER) {
    return INVENTORY_STOCK_STATUS.REVIEW;
  }

  return INVENTORY_STOCK_STATUS.OK;
}

export function summarizeInventoryStock(items = []) {
  return items.reduce(
    (summary, item) => {
      const status =
        item.status || resolveInventoryStockStatus(item.quantity, item.minQuantity);

      summary[status] = (summary[status] || 0) + 1;
      return summary;
    },
    { ok: 0, review: 0, critical: 0 }
  );
}

export function getStockSeverity(status) {
  if (status === INVENTORY_STOCK_STATUS.CRITICAL) return 0;
  if (status === INVENTORY_STOCK_STATUS.REVIEW) return 1;
  return 2;
}

export function getStockBadgeVariant(status) {
  if (status === INVENTORY_STOCK_STATUS.CRITICAL) return 'error';
  if (status === INVENTORY_STOCK_STATUS.REVIEW) return 'warning';
  return 'success';
}

export function getStockLabel(status, t) {
  if (status === INVENTORY_STOCK_STATUS.CRITICAL) {
    return t('common.criticalStock');
  }

  if (status === INVENTORY_STOCK_STATUS.REVIEW) {
    return t('common.reviewStock');
  }

  return t('common.okStock');
}
