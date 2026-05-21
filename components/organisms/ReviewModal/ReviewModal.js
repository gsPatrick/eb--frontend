'use client';

import { useState } from 'react';
import Button from '@/components/atoms/Button';
import Textarea from '@/components/atoms/Textarea';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import styles from './ReviewModal.module.css';

export default function ReviewModal({ isOpen, onClose, service, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!service) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit?.({ rating, comment: comment.trim() });
    setLoading(false);
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Avaliar serviço"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Enviar avaliação</Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.meta}>
          <strong>{service.property}</strong>
          <span>{service.provider ? `Prestador: ${service.provider}` : 'Prestador não informado'}</span>
        </p>

        <FormField label="Nota" htmlFor="review-rating">
          <div className={styles.starRow} id="review-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.starButton} ${value <= rating ? styles.starButtonActive : ''}`}
                onClick={() => setRating(value)}
                aria-label={`${value} estrela(s)`}
              >
                ★
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Comentário" htmlFor="review-comment">
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Conte como foi a limpeza..."
            rows={4}
          />
        </FormField>
      </form>
    </Modal>
  );
}
