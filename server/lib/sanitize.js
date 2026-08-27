const URL_KEYS = ['url', 'image', 'portrait', 'link'];

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';

const sanitizeUrl = (value) => {
  const next = String(value ?? '').trim();

  if (!next) {
    return '';
  }

  if (/^javascript:/i.test(next)) {
    return '';
  }

  return next;
};

const sanitizeString = (key, value) => {
  const trimmed = String(value ?? '').trim();
  const looksLikeUrl = URL_KEYS.some((token) =>
    key.toLowerCase().includes(token)
  );

  return looksLikeUrl ? sanitizeUrl(trimmed) : trimmed;
};

export const sanitizeDeep = (value, key = '') => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeDeep(entry, key))
      .filter((entry) => entry !== null && entry !== undefined);
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      accumulator[entryKey] = sanitizeDeep(entryValue, entryKey);
      return accumulator;
    }, {});
  }

  if (typeof value === 'string') {
    return sanitizeString(key, value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return value ?? '';
};

export const isPlainRecord = isPlainObject;
