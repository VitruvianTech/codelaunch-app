export const datetime = date => new Date(new Date(date).toLocaleString(
  globalThis.navigator ? globalThis.navigator.language : 'en-US',
  {
    timeZone: globalThis.navigator ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York'
  }
))