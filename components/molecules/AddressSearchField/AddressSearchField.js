'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@/components/atoms/Input';
import { geocodingApi } from '@/src/services/api';
import styles from './AddressSearchField.module.css';

const EMPTY_VALUE = { address: '', latitude: null, longitude: null };

export default function AddressSearchField({
  id,
  value = EMPTY_VALUE,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value.address || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(
    value.latitude != null && value.longitude != null
  );
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    setQuery(value.address || '');
    setConfirmed(value.latitude != null && value.longitude != null);
  }, [value.address, value.latitude, value.longitude]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runSearch = useCallback(async (text) => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setSearching(true);
    try {
      const items = await geocodingApi.search(trimmed);
      setResults(items);
      setOpen(items.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (event) => {
    const text = event.target.value;
    setQuery(text);
    setConfirmed(false);
    onChange?.({ address: text, latitude: null, longitude: null });

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 400);
  };

  const handlePick = (result) => {
    const next = {
      address: result.address || result.label,
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };
    setQuery(next.address);
    setConfirmed(true);
    setResults([]);
    setOpen(false);
    onChange?.(next);
  };

  const showError = required && query.trim().length > 0 && !confirmed;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <Input
        id={id}
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />
      {searching ? <span className={styles.status}>{t('common.loading')}</span> : null}
      {!searching && confirmed ? (
        <span className={styles.statusOk}>{t('location.addressSelected')}</span>
      ) : null}
      {showError ? <span className={styles.statusError}>{t('location.selectAddressHint')}</span> : null}
      {open && results.length > 0 ? (
        <ul className={styles.dropdown} role="listbox">
          {results.map((result) => (
            <li key={`${result.latitude}-${result.longitude}-${result.label}`}>
              <button type="button" onClick={() => handlePick(result)}>
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
