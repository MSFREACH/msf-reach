require('dotenv').config({silent: true});

var types = 'armed_conflict,disease_outbreak,displacement,malnutrition,natural_disaster,search_and_rescue,other';
types = types.split(',');

//get all possible combinations of types in correct order
function powerSet( list ){
    var set = [],
        listSize = list.length,
        combinationsCount = (1 << listSize);

    for (var i = 1; i < combinationsCount ; i++ ){
        var combination = [];
        for (var j=0;j<listSize;j++){
            if ((i & (1 << j))){
                combination.push(list[j]);
            }
        }
        set.push(combination.join());
    }
    return set;
}

export default {
    ARCGIS_TOKEN: process.env.ARCGIS_TOKEN || '',
    AUTH: process.env.AUTH === 'true' || false,
    AZURE_AD_TENANT_NAME: process.env.AZURE_AD_TENANT_NAME || '',
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID || '',
    AZURE_AD_RETURN_URL: process.env.AZURE_AD_RETURN_URL || '',
    AZURE_AD_OPERATORS_GROUP_ID: process.env.AZURE_AD_OPERATORS_GROUP_ID || '',
    APP_NAME: process.env.APP_NAME || 'msf-reach',
    API_KEY: process.env.API_KEY || '',
    VIZALYTICS_API_KEY: process.env.VIZALYTICS_API_KEY || '',
    API_REPORTS_TIME_WINDOW: process.env.API_REPORTS_TIME_WINDOW || 3600,
    API_REPORTS_TIME_WINDOW_MAX: process.env.API_REPORTS_TIME_WINDOW_MAX || 604800, // 1w
    // API_EVENTS_LIMIT: process.env.API_EVENTS_LIMIT,
    API_EVENT_STATUS_TYPES: (process.env.API_EVENT_STATUS_TYPES || 'active,inactive').split(','),
    API_MSF_RESPONSE_TYPES: (process.env.API_MSF_RESPONSE_TYPES || 'direct_activities,remote_activities,coordination,donations').split(','),
    API_EVENT_TYPES: powerSet(types),
    API_REPORT_STATUS_TYPES: (process.env.API_REPORT_STATUS_TYPES || 'unconfirmed,confirmed,ignored').split(','),
    AWS_COGNITO_PEM: (process.env.AWS_COGNITO_PEM || 'public_key').replace(/,/g,'\n'),
    AWS_COGNITO_ALGORITHM: process.env.AWS_COGNITO_ALGORITHM || 'RS256',
    AWS_S3_REGION: process.env.AWS_S3_REGION || 'ap-southeast-1',
    AWS_S3_BUCKETNAME: process.env.AWS_S3_BUCKETNAME || 'msf-reach-file-uploads',
    BODY_LIMIT: process.env.BODY_LIMIT || '100kb',
    CACHE: process.env.CACHE === 'true' || false,
    CACHE_DURATION_CARDS: process.env.CACHE_DURATION_CARDS || '1 minute',
    COMPRESS: process.env.COMPRESS === 'true' || false,
    CORS: process.env.CORS === 'true' || false,
    CORS_HEADERS: process.env.CORS_HEADERS || ['Link'],
    CORSANYWHERE_WHITELIST: process.env.CORSANYWHERE_WHITELIST || '',
    DEFAULT_EVENT_SEARCH_DISTANCE: process.env.DEFAULT_EVENT_SEARCH_DISTANCE || 1000000,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    PEER_GUID_TIMEOUT: process.env.PEER_GUID_TIMEOUT || 7890000,
    PGHOST: process.env.PGHOST || '127.0.0.1',
    PGDATABASE: process.env.PGDATABASE || 'msf_reach',
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
    LOG_LEVEL: process.env.LOG_LEVEL || 'error',
    LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || 1024 * 1024 * 100,
    LOG_MAX_FILES: process.env.LOG_MAX_FILES || 10,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 8001,
    BOT_HANDLER_ARN: process.env.BOT_HANDLER_ARN || '',
    BASE_URL: process.env.BASE_URL || 'http://localhost:8001/',
    REDIRECT_HTTP: process.env.REDIRECT_HTTP === 'true' || false,
    RESPONSE_TIME: process.env.RESPONSE_TIME === 'true' || false,
    SECURE_AUTH0: process.env.SECURE_AUTH0 === 'true' || false,
    SESSION_SECRET: process.env.SESSION_SECRET || 'you should change this',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    STATIC_PATH: process.env.STATIC_PATH || 'public',
    STATIC_AUTH_PATH: process.env.STATIC_AUTH_PATH || 'public/login',
    STATIC_AUTH_RETURN_PATH: process.env.STATIC_AUTH_RETURN_PATH || 'public/authreturn',
    STATIC_REPORT_PATH: process.env.STATIC_REPORT_PATH || 'public/report',
    STATIC_CONTACT_PATH: process.env.STATIC_CONTACT_PATH || 'public/contact',
    STATIC_RESOURCES_PATH: process.env.STATIC_RESOURCES_PATH || 'public/resources',
    STATIC_UNSUBSCRIBE_PATH: process.env.STATIC_UNSUBSCRIBE_PATH || 'public/unsubscribe',
    STATIC_LIB_PATH: process.env.STATIC_LIB_PATH || 'public/lib',
    TABLE_GRASP_CARDS: process.env.TABLE_GRASP_CARDS || 'grasp.cards',
    TABLE_GRASP_LOG: process.env.TABLE_GRASP_LOG || 'grasp.log',
    TABLE_REPORTS: process.env.TABLE_REPORTS || 'cognicity.reports',
    TABLE_EVENTS: process.env.TABLE_EVENTS || 'cognicity.events',
    TABLE_EVENT_NOTIFICATIONS: process.env.TABLE_EVENT_NOTIFICATIONS || 'cognicity.event_notifications',
    TABLE_MSF_RESPONSES: process.env.TABLE_MSF_RESPONSES || 'cognicity.msf_responses',
    TABLE_SITREPS: process.env.TABLE_SITREPS || 'cognicity.sitreps',
    TABLE_MISSIONS: process.env.TABLE_MISSIONS || 'cognicity.missions',
    TABLE_CONTACTS: process.env.TABLE_CONTACTS || 'cognicity.contacts',
    TABLE_BOOKMARKS: process.env.TABLE_BOOKMARKS || 'cognicity.bookmarks',
    TABLE_COUNTRY_LINKS: process.env.TABLE_COUNTRY_LINKS || 'cognicity.country_links',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
    TWITTER_ACCESS_KEY: process.env.TWITTER_ACCESS_KEY,
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET
};
