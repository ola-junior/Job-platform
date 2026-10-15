const ADMIN_EMAILS = new Set([
  'yxngalhaji02@gmail.com',
  'abdullahakinkunmi26@gmail.com',
]);

export const isAllowedAdminEmail = (email) =>
  ADMIN_EMAILS.has(String(email || '').trim().toLowerCase());