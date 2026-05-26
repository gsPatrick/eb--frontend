'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import Card from '@/components/molecules/Card';
import CardGridSkeleton from '@/components/molecules/CardGridSkeleton';
import EmptyState from '@/components/molecules/EmptyState';
import FormField from '@/components/molecules/FormField';
import LocationLabel from '@/components/molecules/LocationLabel';
import Modal from '@/components/molecules/Modal';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useToast } from '@/hooks/useToast';
import Select from '@/components/atoms/Select';
import { geocodingApi, propertiesApi, usersApi } from '@/src/services/api';
import styles from '@/styles/admin.module.css';

const EMPTY_PROPERTY_FORM = {
  name: '',
  address: '',
  clientId: '',
  icalUrl: '',
  defaultCleaningPrice: '',
  latitude: '',
  longitude: '',
};

export default function PropertiesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { data: properties = [], loading, refetch, setData } = useApiQuery(
    () => propertiesApi.list({ search: search.trim() || undefined, limit: 200 }).then((response) => response.items),
    [search],
    { initialData: [] }
  );
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_PROPERTY_FORM);
  const [syncingId, setSyncingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ address: '', latitude: '', longitude: '' });
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { paginatedItems, paginationProps } = usePagination(properties);
  const { data: clients = [] } = useApiQuery(
    () => usersApi.list({ role: 'client', limit: 200 }).then((response) => response.items),
    [],
    { initialData: [] }
  );
  const { label: resolvedAddress } = useReverseGeocode(
    form.latitude ? Number(form.latitude) : null,
    form.longitude ? Number(form.longitude) : null,
    Boolean(editing)
  );

  const openEdit = (property) => {
    setEditing(property);
    setSearchResults([]);
    setForm({
      address: property.address || '',
      latitude: property.latitude ?? '',
      longitude: property.longitude ?? '',
    });
  };

  const openCreate = () => {
    setCreateForm(EMPTY_PROPERTY_FORM);
    setCreating(true);
  };

  const handleSync = async (property) => {
    setSyncingId(property.id);
    try {
      await propertiesApi.syncCalendar(property.id);
      toast.success(
        t('toast.calendarSynced'),
        t('toast.calendarSyncedMessage', { name: property.name })
      );
      await refetch({ force: true });
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSyncingId(null);
    }
  };

  const handleCreateProperty = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await propertiesApi.create({
        name: createForm.name.trim(),
        address: createForm.address.trim(),
        clientId: createForm.clientId,
        icalUrl: createForm.icalUrl.trim() || null,
        defaultCleaningPrice: createForm.defaultCleaningPrice
          ? Number(createForm.defaultCleaningPrice)
          : 0,
        latitude: createForm.latitude ? Number(createForm.latitude) : undefined,
        longitude: createForm.longitude ? Number(createForm.longitude) : undefined,
      });
      setData((prev) => [created, ...prev]);
      toast.success(t('toast.propertyCreated'), created.name);
      setCreating(false);
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('toast.actionBlocked'), t('admin.properties.locationError'));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        toast.success(t('toast.geofenceUpdated'), t('admin.properties.locationCaptured'));
        setLocating(false);
      },
      () => {
        toast.error(t('toast.actionBlocked'), t('admin.properties.locationError'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSearchAddress = async () => {
    if (!form.address.trim() || form.address.trim().length < 3) {
      toast.warning(t('toast.actionBlocked'), t('location.searchPlaceholder'));
      return;
    }

    setSearching(true);
    try {
      const results = await geocodingApi.search(form.address.trim());
      setSearchResults(results);
      if (!results.length) {
        toast.warning(t('toast.actionBlocked'), t('location.unknownAddress'));
      }
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePickSearchResult = (result) => {
    setForm({
      address: result.address || result.label,
      latitude: Number(result.latitude).toFixed(6),
      longitude: Number(result.longitude).toFixed(6),
    });
    setSearchResults([]);
  };

  useEffect(() => {
    if (!editing) {
      setSearchResults([]);
    }
  }, [editing]);

  const handleSaveGeo = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const updated = await propertiesApi.update(editing.id, {
        address: form.address.trim() || editing.address,
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
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('admin.properties.title')}
            subtitle={t('admin.properties.subtitle')}
            actions={
              <Button onClick={openCreate}>
                <Icon name="plus" size={16} />
                {t('admin.properties.newProperty')}
              </Button>
            }
          />
        )}

        <div className={styles.toolbar} style={{ marginBottom: '1rem' }}>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.properties.searchPlaceholder')}
          />
        </div>

        <div className={styles.listSection}>
          <div className={styles.listBody}>
            {loading ? (
              <CardGridSkeleton variant="property" count={3} />
            ) : properties.length === 0 ? (
              <EmptyState icon="properties" title={t('common.emptyNoRecords')} />
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
          {!loading && properties.length > 0 && (
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
              label={t('admin.properties.addressLabel')}
              htmlFor="geo-address"
              hint={t('location.searchHint')}
              className={styles.geoAddressField}
            >
              <div className={styles.geoAddressRow}>
                <Input
                  id="geo-address"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder={t('admin.properties.addressPlaceholder')}
                />
                <Button type="button" variant="secondary" loading={searching} onClick={handleSearchAddress}>
                  {t('location.searchAddress')}
                </Button>
              </div>
            </FormField>

            {searchResults.length > 0 ? (
              <ul className={styles.geoSearchResults}>
                {searchResults.map((result) => (
                  <li key={`${result.latitude}-${result.longitude}-${result.label}`}>
                    <button type="button" onClick={() => handlePickSearchResult(result)}>
                      <strong>{result.label}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <Button
              type="button"
              variant="secondary"
              loading={locating}
              onClick={handleUseMyLocation}
            >
              <Icon name="map" size={16} />
              {t('admin.properties.useMyLocation')}
            </Button>

            {form.latitude && form.longitude ? (
              <LocationLabel
                latitude={Number(form.latitude)}
                longitude={Number(form.longitude)}
                address={resolvedAddress || form.address}
                className={styles.geoResolved}
              />
            ) : null}
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

        <Modal
          isOpen={creating}
          onClose={() => setCreating(false)}
          title={t('admin.properties.createModalTitle')}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCreating(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreateProperty} loading={saving}>
                {t('common.create')}
              </Button>
            </>
          }
        >
          <form className={styles.formGrid} onSubmit={handleCreateProperty}>
            <FormField label={t('admin.properties.form.name')} htmlFor="prop-name">
              <Input
                id="prop-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t('admin.properties.form.namePlaceholder')}
                required
              />
            </FormField>
            <FormField label={t('admin.properties.addressLabel')} htmlFor="prop-address">
              <Input
                id="prop-address"
                value={createForm.address}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder={t('admin.properties.addressPlaceholder')}
                required
              />
            </FormField>
            <FormField label={t('admin.properties.form.client')} htmlFor="prop-client">
              <Select
                id="prop-client"
                value={createForm.clientId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, clientId: e.target.value }))}
                required
              >
                <option value="">{t('admin.properties.form.clientPlaceholder')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} — {client.email}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label={t('admin.properties.form.icalUrl')} htmlFor="prop-ical">
              <Input
                id="prop-ical"
                value={createForm.icalUrl}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, icalUrl: e.target.value }))}
                placeholder={t('admin.properties.form.icalPlaceholder')}
              />
            </FormField>
            <FormField label={t('admin.properties.form.defaultPrice')} htmlFor="prop-price">
              <Input
                id="prop-price"
                type="number"
                min="0"
                step="0.01"
                value={createForm.defaultCleaningPrice}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, defaultCleaningPrice: e.target.value }))
                }
              />
            </FormField>
          </form>
        </Modal>
      </div>
  );
}
