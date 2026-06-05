'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/atoms/Button';
import Textarea from '@/components/atoms/Textarea';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import styles from './ReviewModal.module.css';

export default function ReviewModal({ isOpen, onClose, service, onSubmit }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!service) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.({ rating, comment: comment.trim() });
      setComment('');
      setRating(5);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('client.history.reviewModalTitle')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {t('client.history.submitReview')}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.meta}>
          <strong>{service.property}</strong>
          <span>
            {service.provider
              ? `${t('client.history.provider')}: ${service.provider}`
              : t('client.history.providerNotInformed')}
          </span>
        </p>

        <FormField label={t('client.history.rating')} htmlFor="review-rating">
          <div className={styles.starRow} id="review-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.starButton} ${value <= rating ? styles.starButtonActive : ''}`}
                onClick={() => setRating(value)}
                aria-label={t('client.history.starLabel', { count: value })}
              >
                ★
              </button>
            ))}
          </div>
        </FormField>

        <FormField label={t('client.history.comment')} htmlFor="review-comment">
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t('client.history.commentPlaceholder')}
            rows={4}
          />
        </FormField>
      </form>
    </Modal>
  );
}
