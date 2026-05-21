'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Card from '@/components/molecules/Card';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { propertiesApi } from '@/src/services/api';
import styles from '@/styles/admin.module.css';

export default function PropertiesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: properties = [], loading, refetch, setData } = useApiQuery(
    () => propertiesApi.list().then((response) => response.items),
    [],
    { initialData: [] }
  );
  const [editing, setEditing] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ latitude: '', longitude: '' });
  const { paginatedItems, paginationProps } = usePagination(properties);

  const openEdit = (property) => {
    setEditing(property);
    setForm({
      latitude: property.latitude ?? '',
      longitude: property.longitude ?? '',
    });
  };

  const handleSync = async (property) => {
    setSyncingId(property.id);
    try {
      await propertiesApi.syncCalendar(property.id);
      toast.success(
        t('toast.calendarSynced'),
        t('toast.calendarSyncedMessage', { name: property.name })
      );
      await refetch();
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSaveGeo = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const updated = await propertiesApi.update(editing.id, {
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      setData((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
      toast.success(t('toast.geofenceUpdated'), t('toast.geofenceUpdatedMessage'));
      setEditing(null);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('admin.properties.title')}
            subtitle={t('admin.properties.subtitle')}
          />
        )}

        <div className={styles.listSection}>
          <div className={styles.listBody}>
            {loading ? (
              <CardGridSkeleton variant="property" count={3} />
            ) : (
              <div className={styles.propertyGrid}>
                {paginatedItems.map((property) => (
                  <Card key={property.id} className={styles.propertyCard} padding="sm">
                    <img src={property.photo} alt={property.name} className={styles.propertyImage} />
                    <div className={styles.propertyBody}>
                      <div>
                        <p className={styles.propertyName}>{property.name}</p>
                        <p className={styles.propertyAddress}>{property.address}</p>
                      </div>
                      <div className={styles.propertyMeta}>
                        <Badge variant={property.status === 'active' ? 'success' : 'default'}>
                          {property.status === 'active' ? t('common.active') : t('common.inactive')}
                        </Badge>
                        <Badge variant="info">{property.client}</Badge>
                        {property.latitude ? (
                          <Badge variant="success">{t('admin.properties.geofenceOk')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('admin.properties.noGps')}</Badge>
                        )}
                      </div>
                      <div className={styles.propertyActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={syncingId === property.id}
                          onClick={() => handleSync(property)}
                          disabled={!property.icalUrl}
                        >
                          <Icon name="sync" size={16} />
                          {t('admin.properties.syncAirbnb')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(property)}>
                          <Icon name="edit" size={16} />
                          {t('admin.properties.geofence')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {!loading && (
            <div className={styles.listFooter}>
              <Pagination {...paginationProps} />
            </div>
          )}
        </div>

        <Modal
          isOpen={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={t('admin.properties.geofenceModalTitle', { name: editing?.name || '' })}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveGeo} loading={saving}>
                {t('admin.properties.saveCoordinates')}
              </Button>
            </>
          }
        >
          <form className={styles.geoForm} onSubmit={handleSaveGeo}>
            <FormField
              label={t('admin.properties.form.latitude')}
              htmlFor="latitude"
              hint={t('admin.properties.form.latitudeHint')}
            >
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder={t('admin.properties.form.latitudePlaceholder')}
              />
            </FormField>
            <FormField
              label={t('admin.properties.form.longitude')}
              htmlFor="longitude"
              hint={t('admin.properties.form.longitudeHint')}
            >
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder={t('admin.properties.form.longitudePlaceholder')}
              />
            </FormField>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
