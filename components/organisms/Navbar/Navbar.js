'use client';

import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import FigmaIcon from '@/components/atoms/FigmaIcon';
import Icon from '@/components/atoms/Icon';
import Dropdown from '@/components/molecules/Dropdown';
import SearchField from '@/components/molecules/SearchField';
import { FIGMA_ASSETS } from '@/constants/figmaAssets';
import styles from './Navbar.module.css';

export default function Navbar({ title, subtitle, onMenuClick, searchValue, onSearchChange, showSearch = true }) {
  const userMenuItems = [
    { label: 'Meu perfil', icon: 'users', onClick: () => {} },
    { label: 'Configurações', icon: 'settings', onClick: () => {} },
    { label: 'Sair', icon: 'logout', onClick: () => {}, danger: true },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} onClick={onMenuClick} aria-label="Menu">
          <Icon name="menu" size={20} />
        </button>
        <div>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {showSearch && (
        <div className={styles.center}>
          <SearchField value={searchValue} onChange={onSearchChange} placeholder="Search..." className={styles.search} />
        </div>
      )}

      <div className={styles.right}>
        <button type="button" className={styles.iconBtn} aria-label="Notificações">
          <Icon name="bell" size={20} />
          <Badge variant="error" size="sm" className={styles.badge}>3</Badge>
        </button>

        <Dropdown
          align="right"
          trigger={
            <button type="button" className={styles.userBtn}>
              <Avatar name="Thalita Admin" size="sm" />
              <span className={styles.userName}>Thalita</span>
              <FigmaIcon src={FIGMA_ASSETS.icons.chevronDown} size={8} alt="" />
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
