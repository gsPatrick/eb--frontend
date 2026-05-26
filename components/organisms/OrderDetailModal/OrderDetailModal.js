'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/molecules/Modal';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import LocationLabel from '@/components/molecules/LocationLabel';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { API_ORIGIN } from '@/src/services/api/api-client';
import { formatEstimatedDuration, getCleaningTypeLabel } from '@/utils/cleaningTypes';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { ordersApi } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import styles from './OrderDetailModal.module.css';

const COMMISSION_RATE = 0.33;
const PHOTOS_PER_PAGE = 2;

function PhotoCarousel({ title, photos, emptyMessage }) {
  const [page, setPage] = useState(0);
  const photoList = photos || [];
  const totalPages = Math.max(1, Math.ceil(photoList.length / PHOTOS_PER_PAGE));
  const pagePhotos = photoList.slice(page * PHOTOS_PER_PAGE, page * PHOTOS_PER_PAGE + PHOTOS_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [photoList.length]);

  if (!photoList.length) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>{title}</h3>
        <div className={styles.emptyPhotos}>
          <Icon name="info" size={18} />
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.carouselHeader}>
        <h3 className={styles.panelTitle}>{title}</h3>
        {photoList.length > PHOTOS_PER_PAGE ? (
          <div className={styles.carouselControls}>
            <button
              type="button"
              className={styles.carouselBtn}
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              aria-label="Previous photos"
            >
              <Icon name="chevronLeft" size={16} />
            </button>
            <span className={styles.carouselCounter}>
              {page + 1}/{totalPages}
            </span>
            <button
              type="button"
              className={styles.carouselBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              aria-label="Next photos"
            >
              <Icon name="chevronRight" size={16} />
            </button>
          </div>
        ) : null}
      </div>
      <div className={styles.carouselGrid}>
        {pagePhotos.map((photo) => (
          <img key={photo} src={photo} alt={title} className={styles.photo} />
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  providers = [],
  onAssigned,
  onUpdated,
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [clientPaymentStatus, setClientPaymentStatus] = useState('pending');
  const [providerPaymentStatus, setProviderPaymentStatus] = useState('pending');
  const [savingPayments, setSavingPayments] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    setSelectedProviderId(order?.providerId || '');
    setClientPaymentStatus(order?.clientPaymentStatus || 'pending');
    setProviderPaymentStatus(order?.providerPaymentStatus || 'pending');
  }, [order?.id, order?.providerId, order?.clientPaymentStatus, order?.providerPaymentStatus]);

  const status = useMemo(
    () => (order ? getOrderStatusBadge(order.status, t) : null),
    [order, t]
  );

  const canAssign = order && ['pending', 'in_progress'].includes(order.status);
  const activeProviders = useMemo(
    () => providers.filter((user) => user.role === 'provider' && user.active),
    [providers]
  );
  const appliedCommissionRate = useMemo(() => {
    const total = Number(order?.totalPrice || 0);
    const commission = Number(order?.commissionAmount || 0);
    if (total <= 0) return COMMISSION_RATE;
    return commission / total;
  }, [order?.totalPrice, order?.commissionAmount]);

  const handleAssign = async () => {
    if (!order || !selectedProviderId) return;

    setAssigning(true);
    try {
      const updated = await ordersApi.assign(order.id, selectedProviderId);
      toast.success(t('admin.orders.assignSuccess'), t('admin.orders.assignSuccessMessage'));
      onAssigned?.(updated);
    } catch (error) {
      toast.error(t('common.error'), error.message || t('admin.orders.assignError'));
    } finally {
      setAssigning(false);
    }
  };

  const handleSavePayments = async () => {
    if (!order) return;
    const wasProviderPending = order.providerPaymentStatus !== 'paid';
    const markingProviderPaid = providerPaymentStatus === 'paid' && wasProviderPending;

    setSavingPayments(true);
    try {
      const updated = await ordersApi.updatePayments(order.id, {
        clientPaymentStatus,
        providerPaymentStatus,
      });

      if (markingProviderPaid) {
        toast.success(
          t('admin.orders.receiptSentToInbox'),
          t('admin.orders.receiptSentToInboxMessage', {
            name: order.provider || t('admin.orders.unassigned'),
          })
        );
      } else {
        toast.success(t('admin.orders.paymentsUpdated'), t('admin.orders.paymentsUpdatedMessage'));
      }

      onUpdated?.(updated);
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSavingPayments(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    setGeneratingInvoice(true);
    try {
      const result = await ordersApi.createInvoice(order.id);
      toast.success(
        t('admin.orders.invoiceGenerated'),
        t('admin.orders.invoiceSentToInboxMessage', { name: order.client })
      );
      onUpdated?.(result.order);
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleSendReminder = async () => {
    if (!order) return;
    setSendingReminder(true);
    try {
      await ordersApi.sendReminder(order.id);
      toast.success(
        t('admin.orders.reminderSent'),
        t('admin.orders.reminderSentToInboxMessage', { name: order.client })
      );
    } catch (error) {
      toast.error(t('common.error'), error.message);
    } finally {
      setSendingReminder(false);
    }
  };

  const openDocument = (url) => {
    if (!url) return;
    const href = url.startsWith('http') ? url : `${API_ORIGIN}${url}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order.property} size="xl">
      <div className={styles.content}>
        <div className={styles.subheader}>
          <div className={styles.subheaderMain}>
            <span className={styles.osId}>OS · {order.id.toUpperCase()}</span>
            <p className={styles.address}>{order.propertyAddress}</p>
          </div>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.provider')}</span>
            <strong>{order.provider || t('admin.orders.unassigned')}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.client')}</span>
            <strong>{order.client}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.date')}</span>
            <strong>{formatDate(order.scheduledDate)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.cleaningType')}</span>
            <strong>{getCleaningTypeLabel(order.cleaningType, t)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.estimatedTime')}</span>
            <strong>{formatEstimatedDuration(order.estimatedDurationMinutes, t)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.columns.total')}</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.commissionEb')}</span>
            <div className={styles.commissionValue}>
              <strong>{formatCurrency(order.commissionAmount)}</strong>
              <Badge variant="info">{t('admin.orders.commissionRateBadge', { rate: Math.round(appliedCommissionRate * 100) })}</Badge>
            </div>
          </div>
          <div className={styles.metaCard}>
            <span>{t('admin.orders.providerPayout')}</span>
            <strong>{formatCurrency(order.providerPayoutAmount)}</strong>
          </div>
        </div>

        <section className={styles.financeSection}>
          <h3 className={styles.sectionTitle}>{t('admin.orders.financeSection')}</h3>
          <div className={styles.financeToolbar}>
            <div className={styles.financeGroup}>
              <FormField label={t('admin.orders.clientPayment')} htmlFor="client-payment">
                <Select
                  id="client-payment"
                  value={clientPaymentStatus}
                  onChange={(event) => setClientPaymentStatus(event.target.value)}
                >
                  <option value="pending">{t('admin.orders.paymentPending')}</option>
                  <option value="paid">{t('admin.orders.paymentPaid')}</option>
                </Select>
              </FormField>
              <FormField label={t('admin.orders.providerPayment')} htmlFor="provider-payment">
                <Select
                  id="provider-payment"
                  value={providerPaymentStatus}
                  onChange={(event) => setProviderPaymentStatus(event.target.value)}
                >
                  <option value="pending">{t('admin.orders.paymentPending')}</option>
                  <option value="paid">{t('admin.orders.paymentPaid')}</option>
                </Select>
              </FormField>
            </div>

            <div className={styles.financeDivider} aria-hidden="true" />

            <div className={styles.financeGroup}>
              <Button variant="secondary" loading={generatingInvoice} onClick={handleGenerateInvoice}>
                {t('admin.orders.generateInvoice')}
              </Button>
              {order.status === 'pending' ? (
                <Button variant="secondary" loading={sendingReminder} onClick={handleSendReminder}>
                  {t('admin.orders.sendReminder')}
                </Button>
              ) : null}
              <Button variant="primary" loading={savingPayments} onClick={handleSavePayments}>
                {t('admin.orders.savePayments')}
              </Button>
            </div>

            {(order.invoiceUrl || order.receiptUrl) ? (
              <>
                <div className={styles.financeDivider} aria-hidden="true" />
                <div className={styles.financeGroup}>
                  {order.invoiceUrl ? (
                    <Button variant="ghost" size="sm" onClick={() => openDocument(order.invoiceUrl)}>
                      {t('admin.orders.downloadInvoice')}
                    </Button>
                  ) : null}
                  {order.receiptUrl ? (
                    <Button variant="ghost" size="sm" onClick={() => openDocument(order.receiptUrl)}>
                      {t('admin.orders.downloadReceipt')}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
          <p className={styles.assignHint}>{t('admin.orders.financeHint')}</p>
        </section>

        {canAssign && (
          <section className={styles.assignSection}>
            <div className={styles.assignHeader}>
              <h3 className={styles.sectionTitle}>{t('admin.orders.assignProvider')}</h3>
              <p className={styles.assignHint}>{t('admin.orders.assignProviderHint')}</p>
            </div>
            <div className={styles.assignRow}>
              <Select
                id="order-provider"
                value={selectedProviderId}
                onChange={(event) => setSelectedProviderId(event.target.value)}
                className={styles.assignSelect}
              >
                <option value="">{t('admin.orders.selectProvider')}</option>
                {activeProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="primary"
                disabled={!selectedProviderId || assigning}
                onClick={handleAssign}
              >
                {assigning ? t('common.loading') : t('admin.orders.assignButton')}
              </Button>
            </div>
          </section>
        )}

        <div className={styles.sectionDivider} />

        <div className={styles.compareGrid}>
          <PhotoCarousel
            title={t('admin.orders.beforePhotos')}
            photos={order.beforePhotos}
            emptyMessage={t('admin.orders.noBeforePhotos')}
          />
          <PhotoCarousel
            title={t('admin.orders.afterPhotos')}
            photos={order.afterPhotos}
            emptyMessage={t('admin.orders.noAfterPhotos')}
          />
        </div>

        <div className={styles.sectionDivider} />

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('admin.orders.gpsTracking')}</h3>
          <div className={styles.mapGrid}>
            <LocationLabel
              title={t('admin.orders.propertyLocation')}
              latitude={order.propertyLat}
              longitude={order.propertyLong}
              address={order.propertyAddress}
              variant="property"
              mapOverlay
              emptyLabel={t('admin.orders.noGps')}
            />
            <LocationLabel
              title={t('admin.orders.checkinLocation')}
              latitude={order.checkinLat}
              longitude={order.checkinLong}
              variant="checkin"
              mapOverlay
              emptyLabel={t('admin.orders.noGps')}
            />
            <LocationLabel
              title={t('admin.orders.checkoutLocation')}
              latitude={order.checkoutLat}
              longitude={order.checkoutLong}
              variant="checkout"
              mapOverlay
              emptyLabel={t('admin.orders.noGps')}
            />
          </div>
        </section>

        {order.extras?.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('admin.orders.extrasSection')}</h3>
            <ul className={styles.extrasList}>
              {order.extras.map((extra) => (
                <li key={extra.name}>
                  <span>
                    {extra.name}
                    {extra.source === 'client_request' ? (
                      <Badge variant="info">{t('admin.orders.extraClientRequest')}</Badge>
                    ) : null}
                  </span>
                  <strong>{formatCurrency(extra.defaultPrice ?? extra.price ?? 0)}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
