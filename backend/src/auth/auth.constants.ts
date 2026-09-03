export const AUTH_COOKIE = {
  access: 'access_token',
  refresh: 'refresh_token',
  csrf: 'csrf_token',
} as const;

export const AUTH_TTL = {
  accessSeconds: 15 * 60,
  refreshSeconds: 8 * 60 * 60,
  rememberRefreshSeconds: 30 * 24 * 60 * 60,
  csrfSeconds: 60 * 60,
} as const;

export const AUTH_ERROR = {
  invalidCredentials: 'Không thể đăng nhập. Vui lòng kiểm tra thông tin đăng nhập hoặc liên hệ quản trị viên.',
  sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
} as const;
