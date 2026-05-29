'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import PageHeader from '@/components/molecules/PageHeader';
import PageHeaderSkeleton from '@/components/molecules/PageHeaderSkeleton';
import Pagination from '@/components/molecules/Pagination';
import StatCard from '@/components/molecules/StatCard';
import DataTable from '@/components/organisms/DataTable';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { financialSettingsApi, ordersApi, reportsApi, usersApi } from '@/src/services/api';
import { getOrderStatusBadge } from '@/utils/adminHelpers';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from '@/styles/admin.module.css';

function BillingOrdersTable({ orders, loading, t }) {
  const { paginatedItems, paginationProps } = usePagination(orders);

  const columns = useMemo(
    () => [
      { key: 'property', label: t('admin.billing.columns.property') },
      {
        key: 'provider',
        label: t('admin.billing.columns.provider'),
        render: (row) => row.provider || t('common.notAvailable'),
      },
      {
        key: 'status',
        label: t('admin.billing.columns.status'),
        render: (row) => {
          const status = getOrderStatusBadge(row.status, t);
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        key: 'finishedAt',
        label: t('admin.billing.columns.finishedAt'),
        render: (row) => formatDate(row.finishedAt),
      },
      {
        key: 'totalPrice',
        label: t('admin.billing.columns.total'),
        align: 'right',
        render: (row) => formatCurrency(row.totalPrice),
      },
    ],
    [t]
  );

  return (
    <DataTable
      columns={columns}
      rows={paginatedItems}
      loading={loading}
      emptyMessage={t('common.emptyNoRecords')}
      footer={!loading ? <Pagination {...paginationProps} /> : null}
    />
  );
}

export default function BillingPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: clients = [], loading } = useApiQuery(
    () => usersApi.list().then((response) => response.items.filter((user) => user.role === 'client')),
    [],
    { initialData: [] }
  );
  const { data: financialSummary } = useApiQuery(
    () => ordersApi.getFinancialSummary(),
    [],
    { initialData: null }
  );
  const { data: docSettings, refetch: refetchDocSettings } = useApiQuery(
    () => financialSettingsApi.get(),
    [],
    { initialData: null }
  );
  const [generating, setGenerating] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [templateForm, setTemplateForm] = useState(null);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    clientId: '',
  });

  const generateReport = async (event) => {
    event.preventDefault();
    setGenerating(true);

    try {
      const result = await reportsApi.getBillingReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        clientId: filters.clientId || undefined,
      });

      const client = clients.find((item) => item.id === filters.clientId);
      setReport({
        ...result,
        period: { startDate: filters.startDate, endDate: filters.endDate },
        clientName: client?.name || t('common.allClients'),
        clientId: filters.clientId || null,
      });
      toast.success(t('toast.reportGenerated'), t('toast.reportGeneratedMessage'));
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (docSettings && !templateForm) {
      setTemplateForm(docSettings);
    }
  }, [docSettings, templateForm]);

  const handleSaveTemplates = async (event) => {
    event.preventDefault();
    if (!templateForm) return;
    setSavingTemplates(true);
    try {
      await financialSettingsApi.update(templateForm);
      await refetchDocSettings({ force: true });
      toast.success(t('admin.billing.templatesSaved'), t('admin.billing.templatesSavedMessage'));
    } catch (err) {
      toast.error(t('toast.actionBlocked'), err.message);
    } finally {
      setSavingTemplates(false);
    }
  };

  return (
      <div className={styles.page}>
        {loading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={t('admin.billing.title')}
            subtitle={t('admin.billing.subtitle')}
          />
        )}

        {financialSummary ? (
          <div className={styles.summaryRow}>
            <StatCard
              label={t('admin.billing.clientPending')}
              value={formatCurrency(financialSummary.clientPendingTotal)}
            />
            <StatCard
              label={t('admin.billing.clientPaid')}
              value={formatCurrency(financialSummary.clientPaidTotal)}
            />
            <StatCard
              label={t('admin.billing.commissionEarned')}
              value={formatCurrency(financialSummary.commissionEarnedTotal)}
            />
            <StatCard
              label={t('admin.billing.providerPending')}
              value={formatCurrency(financialSummary.providerPendingTotal)}
            />
          </div>
        ) : null}

        {!loading && (
          <form className={styles.toolbar} onSubmit={generateReport}>
          <div className={styles.filters}>
            <FormField label={t('admin.billing.startDate')} htmlFor="startDate">
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.billing.endDate')} htmlFor="endDate">
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </FormField>
            <FormField label={t('admin.billing.client')} htmlFor="clientId">
              <Select
                id="clientId"
                value={filters.clientId}
                onChange={(e) => setFilters((prev) => ({ ...prev, clientId: e.target.value }))}
              >
                <option value="">{t('common.allClients')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <Button type="submit" loading={generating}>
            {t('admin.billing.generateReport')}
          </Button>
        </form>
        )}

        {report && !loading && (
          <>
            <div className={styles.summaryRow}>
              <StatCard
                label={t('admin.billing.periodTotal')}
                value={formatCurrency(report.totalAmount)}
              />
              <StatCard
                label={t('admin.billing.completedOrders')}
                value={report.orderCount}
              />
              <StatCard
                label={t('admin.billing.client')}
                value={report.clientName}
                change={`${report.period.startDate} → ${report.period.endDate}`}
              />
            </div>

            <div className={styles.cardSection}>
              <div className={styles.toolbar}>
                <h2 className={styles.sectionTitle}>{t('admin.billing.billingDetail')}</h2>
                <Button
                  variant="secondary"
                  onClick={() => toast.info(t('toast.exportTitle'), t('toast.exportMessage'))}
                >
                  {t('admin.billing.exportReport')}
                </Button>
              </div>
              <BillingOrdersTable orders={report.orders} loading={false} t={t} />
            </div>
          </>
        )}

        {templateForm ? (
          <section className={styles.cardSection}>
            <h2 className={styles.sectionTitle}>{t('admin.billing.documentTemplates')}</h2>
            <p className={styles.filterHint}>{t('admin.billing.documentTemplatesHint')}</p>
            <form className={styles.formGrid} onSubmit={handleSaveTemplates}>
              <FormField label={t('admin.billing.companyName')} htmlFor="doc-company">
                <Input
                  id="doc-company"
                  value={templateForm.companyName}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </FormField>
              <FormField label={t('admin.billing.companyEmail')} htmlFor="doc-email">
                <Input
                  id="doc-email"
                  type="email"
                  value={templateForm.companyEmail}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, companyEmail: e.target.value }))}
                />
              </FormField>
              <FormField label={t('admin.billing.companyPhone')} htmlFor="doc-phone">
                <Input
                  id="doc-phone"
                  value={templateForm.companyPhone}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, companyPhone: e.target.value }))}
                />
              </FormField>
              <FormField label={t('admin.billing.zelle')} htmlFor="doc-zelle">
                <Input
                  id="doc-zelle"
                  value={templateForm.zelle}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, zelle: e.target.value }))}
                />
              </FormField>
              <FormField label={t('admin.billing.companyAddress')} htmlFor="doc-address" className={styles.formFullWidth}>
                <Textarea
                  id="doc-address"
                  rows={2}
                  value={templateForm.companyAddress}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, companyAddress: e.target.value }))}
                />
              </FormField>
              <FormField label={t('admin.billing.invoiceFooter')} htmlFor="doc-invoice-footer" className={styles.formFullWidth}>
                <Textarea
                  id="doc-invoice-footer"
                  rows={3}
                  value={templateForm.invoiceFooter}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, invoiceFooter: e.target.value }))}
                />
              </FormField>
              <FormField label={t('admin.billing.receiptFooter')} htmlFor="doc-receipt-footer" className={styles.formFullWidth}>
                <Textarea
                  id="doc-receipt-footer"
                  rows={3}
                  value={templateForm.receiptFooter}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, receiptFooter: e.target.value }))}
                />
              </FormField>
              <div className={styles.formFullWidth}>
                <Button type="submit" loading={savingTemplates}>
                  {t('admin.billing.saveTemplates')}
                </Button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
  );
}
