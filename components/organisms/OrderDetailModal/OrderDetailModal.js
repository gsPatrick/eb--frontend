import Modal from '@/components/molecules/Modal';
import Badge from '@/components/atoms/Badge';
import Icon from '@/components/atoms/Icon';
import { ORDER_STATUS } from '@/constants/adminMockData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import styles from './OrderDetailModal.module.css';

function MapPreview({ lat, lng, label, variant = 'property' }) {
  if (lat == null || lng == null) {
    return (
      <div className={styles.mapCard}>
        <div className={styles.mapEmpty}>
          <Icon name="map" size={22} />
          <span>Sem coordenadas GPS</span>
        </div>
        <span className={`${styles.mapLabel} ${styles[`mapLabel_${variant}`]}`}>{label}</span>
      </div>
    );
  }

  const delta = 0.004;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  return (
    <div className={styles.mapCard}>
      <iframe
        title={`Mapa ${label}`}
        className={styles.mapFrame}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
      <span className={`${styles.mapLabel} ${styles[`mapLabel_${variant}`]}`}>{label}</span>
    </div>
  );
}

function PhotoPanel({ title, photos, emptyMessage }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {photos?.length ? (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <img key={photo} src={photo} alt={title} className={styles.photo} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyPhotos}>
          <Icon name="info" size={18} />
          <span>{emptyMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order.property} size="xl">
      <div className={styles.content}>
        <div className={styles.subheader}>
          <div className={styles.subheaderMain}>
            <span className={styles.osId}>OS · {order.id.toUpperCase()}</span>
            <p className={styles.address}>{order.propertyAddress}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <span>Prestador</span>
            <strong>{order.provider || 'Não atribuído'}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>Cliente</span>
            <strong>{order.client}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>Agendamento</span>
            <strong>{formatDate(order.scheduledDate)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span>Total</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
        </div>

        <div className={styles.compareGrid}>
          <PhotoPanel
            title="Fotos — Antes"
            photos={order.beforePhotos}
            emptyMessage="Nenhuma foto de check-in registrada."
          />
          <PhotoPanel
            title="Fotos — Depois"
            photos={order.afterPhotos}
            emptyMessage="Aguardando check-out do prestador."
          />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Rastreamento GPS</h3>
          <div className={styles.mapGrid}>
            <MapPreview lat={order.propertyLat} lng={order.propertyLong} label="Propriedade" variant="property" />
            <MapPreview lat={order.checkinLat} lng={order.checkinLong} label="Check-in" variant="checkin" />
            <MapPreview lat={order.checkoutLat} lng={order.checkoutLong} label="Check-out" variant="checkout" />
          </div>
        </section>

        {order.extras?.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Serviços extras</h3>
            <ul className={styles.extrasList}>
              {order.extras.map((extra) => (
                <li key={extra.name}>
                  <span>{extra.name}</span>
                  <strong>{formatCurrency(extra.price)}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
