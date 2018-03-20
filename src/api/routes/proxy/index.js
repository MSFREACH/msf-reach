import { Router } from 'express';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated } from '../../../lib/util';

import {createServer} from 'cors-anywhere';

export default ({ config, logger }) => {
    let api = Router();

    let proxy = createServer({
        originWhitelist: [config.CORSANYWHERE_WHITELIST], // Allow all origins
        requireHeaders: [], // Do not require any headers.
        removeHeaders: [] // Do not remove any headers.
    });

    /* Attach our cors proxy to the existing API on the /proxy endpoint. */
    api.get('/:proxyUrl*', ensureAuthenticated, cacheResponse('1 minute'), (req, res, next) => {
        req.url = req.url.replace('/api/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
        proxy.emit('request', req, res);
    });

    return api;
};
