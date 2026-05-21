'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import PageHeader from '@/components/molecules/PageHeader';
import ProviderLayout from '@/components/templates/ProviderLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/useToast';
import * as inventoryApi from '@/src/services/api/inventory';
import styles from '@/styles/provider.module.css';

export default function ProviderInventoryPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    const { items } = await inventoryApi.list();
    return items;
  }, []);

  const { data: items, loading, setData: setItems } = useApiQuery(fetchInventory, []);

  const handleChange = (id) => (event) => {
    const quantity = Number(event.target.value) || 0;
    setItems((prev) =>
      (prev || []).map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!items?.length) return;

    setSaving(true);
    try {
      await Promise.all(items.map((item) => inventoryApi.updateQuantity(item.id, item.quantity)));
      toast.success('Estoque atualizado', 'Quantidades reportadas com sucesso.');
    } catch (err) {
      toast.error('Erro ao salvar', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProviderLayout>
      <div className={styles.page}>
        <PageHeader
          title="Atualização de Estoque"
          subtitle="Reporte rapidamente quanto sobrou de cada produto nas casas em serviço."
        />

        <form className={styles.inventoryQuickGrid} onSubmit={handleSave}>
          {(items || []).map((item) => (
            <article key={item.id} className={styles.inventoryQuickCard}>
              <div className={styles.inventoryQuickHeader}>
                <strong>{item.item}</strong>
                <span>{item.property}</span>
              </div>
              <div className={styles.quantityRow}>
                <label htmlFor={`qty-${item.id}`}>Quantidade ({item.unit})</label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={handleChange(item.id)}
                  disabled={loading || saving}
                />
              </div>
              <span className={styles.panelHint}>
                Mínimo esperado: {item.minQuantity} {item.unit}
              </span>
            </article>
          ))}

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={saving} disabled={loading || !items?.length}>
              Salvar quantidades
            </Button>
          </div>
        </form>
      </div>
    </ProviderLayout>
  );
}
