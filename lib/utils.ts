export const merge = (...args) => {
  const isObject = obj => obj && typeof obj === 'object';

  return args.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = merge(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {})
}

export const asc = field => (current, next) => current[field] > next[field] ? 1 : -1

export const desc = field => (current, next) => current[field] > next[field] ? -1 : 1

export const datetime = date => new Date(new Date(date).toLocaleString(
  globalThis.navigator ? globalThis.navigator.language : 'en-US',
  {
    timeZone: globalThis.navigator ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York'
  }
))