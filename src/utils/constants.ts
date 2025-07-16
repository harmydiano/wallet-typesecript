// HTTP Status Codes
export const OK = 200;
export const CREATED = 201;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const INTERNAL_SERVER_ERROR = 500;

// SMS Constants
export const LIMIT = 50;
export const TIME = 24; // hours

// Database Constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Redis Keys
export const REDIS_KEYS = {
  STOP_PREFIX: 'stop_',
  REQUEST_PREFIX: 'request_',
  REQUEST_TIME_PREFIX: 'request_time_'
} as const; 