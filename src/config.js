require('dotenv').config({silent:true})

export default {
  APP_NAME: process.env.APP_NAME || 'cognicity_msf-server',
  API_REPORTS_TIME_WINDOW: process.env.API_REPORTS_TIME_WINDOW || 3600,
  API_REPORTS_TIME_WINDOW_MAX: process.env.API_REPORTS_TIME_WINDOW_MAX || 604800, // 1w
// API_EVENTS_LIMIT: process.env.API_EVENTS_LIMIT,
  API_EVENT_STATUS_TYPES: (process.env.API_EVENT_STATUS_TYPES || 'active,inactive').split(','),
  API_EVENT_TYPES: (process.env.API_EVENT_TYPES || 'flood,earthquake,conflict').split(','),
  API_REPORT_STATUS_TYPES: (process.env.API_REPORT_STATUS_TYPES || 'confirmed,verified').split(','),
  AWS_COGNITO_PEM: process.env.AWS_COGNITO_PEM.replace(',','\n') || new Buffer('public_key'),
  AWS_COGNITO_ALGORITHM: process.env.AWS_COGNITO_ALGORITHM || 'HS256',
  BODY_LIMIT: process.env.BODY_LIMIT || '100kb',
  CACHE: process.env.CACHE === 'true' || false,
  CACHE_DURATION_CARDS: process.env.CACHE_DURATION_CARDS || '1 minute',
  COMPRESS: process.env.COMPRESS === 'true' || false,
  CORS: process.env.CORS === 'true' || false,
  CORS_HEADERS: process.env.CORS_HEADERS || ['Link'],
  PGHOST: process.env.PGHOST || '127.0.0.1',
  PGDATABASE: process.env.PGDATABASE || 'cognicity_msf',
  PGPASSWORD: process.env.PGPASSWORD || '',
  PGPORT: process.env.PGPORT || 5432,
  PGSSL: process.env.PGSSL === 'true' || false,
  PGTIMEOUT: process.env.PGTIMEOUT || 10000,
  PGUSER: process.env.PGUSER || 'postgres',
//  FORMAT_DEFAULT: process.env.FORMAT_DEFAULT || 'json',
//  FORMATS: (process.env.FORMATS || 'json').split(','),
  GEO_FORMAT_DEFAULT: process.env.GEO_FORMAT_DEFAULT || 'topojson',
  GEO_FORMATS: (process.env.GEO_FORMATS || 'geojson,topojson').split(','),
  GEO_PRECISION: process.env.GEO_PRECISION || 10,
//  LANGUAGES: (process.env.LANGUAGES || 'en,id').split(','),
  LOG_CONSOLE: process.env.LOG_CONSOLE === 'true' || false,
  LOG_DIR: process.env.LOG_DIR || '',
  LOG_JSON: process.env.LOG_JSON === 'true' || false,
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || 1024 * 1024 * 100,
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8001,
  RESPONSE_TIME: process.env.RESPONSE_TIME === 'true' || false,
  SECURE_AUTH0: process.env.SECURE_AUTH0 === 'true' || false,
  STATIC_PATH: process.env.STATIC_PATH || 'public',
  STATIC_AUTH_PATH: process.env.STATIC_AUTH_PATH || 'public/login',
  STATIC_REPORT_PATH: process.env.STATIC_REPORT_PATH || 'public/report',
  STATIC_RESOURCES_PATH: process.env.STATIC_RESOURCES_PATH || 'public/resources',
  STATIC_LIB_PATH: process.env.STATIC_LIB_PATH || 'public/lib',
  TABLE_GRASP_CARDS: process.env.TABLE_GRASP_CARDS || 'grasp.cards',
  TABLE_GRASP_LOG: process.env.TABLE_GRASP_LOG || 'grasp.log',
  TABLE_REPORTS: process.env.TABLE_REPORTS || 'cognicity.reports',
  TABLE_EVENTS: process.env.TABLE_EVENTS || 'cognicity.events'
}
