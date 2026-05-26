export const CLEANING_TYPES = [
  'deep',
  'regular',
  'post_construction',
  'move_in',
  'move_out',
  'regular_airbnb',
];

export function getCleaningTypeLabel(type, t) {
  if (!type) return t('common.notAvailable');
  const key = `cleaningTypes.${type}`;
  const translated = t(key);
  return translated === key ? type : translated;
}

export function formatEstimatedDuration(minutes, t) {
  if (!minutes) return t('common.notAvailable');
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) {
    return t('cleaningTypes.durationHoursMinutes', { hours, minutes: mins });
  }
  if (hours) {
    return t('cleaningTypes.durationHours', { hours });
  }
  return t('cleaningTypes.durationMinutes', { minutes: mins });
}
