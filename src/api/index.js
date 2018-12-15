import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import celebrate from 'celebrate';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import events from './routes/events';
import eventNotifications from './routes/eventNotifications';
import sitreps from './routes/sitreps';
import layers from './routes/layers';
import reports from './routes/reports';
import twitter from './routes/twitter';
import hazards from './routes/hazards';
import bookmarks from './routes/bookmarks';
import utils from './routes/utils';
import missions from './routes/missions';
import contacts from './routes/contacts';
import proxy from './routes/proxy'; // for adding cors
import analytics from './routes/analytics';

export default ({ config, db, logger }) => {
    let api = Router();

    // Return the API version
    api.get('/', (req, res) => {
        res.status(200).json({ version });
    });

    // Mount the various endpoints
    api.use('/events', events({ config, db, logger }));
    api.use('/eventNotifications', eventNotifications({ config, db, logger }));
    api.use('/sitrep', sitrep({ config, db, logger }));
    api.use('/layers', layers({ config, db, logger}));
    api.use('/reports', reports({ config, db, logger }));
    api.use('/twitter', twitter({ logger }));
    api.use('/hazards', hazards({ logger }));
    api.use('/bookmarks', bookmarks({ config, db, logger }));
    api.use('/utils', utils({ config, db, logger }) );
    api.use('/missions', missions({ config, db, logger }));
    api.use('/contacts', contacts({ config, db, logger }));
    api.use('/proxy', proxy({config, logger}));
    api.use('/analytics',analytics({config,logger}));

    // Handle validation errors (wording of messages can be overridden using err.isJoi)
    api.use(celebrate.errors());

    // Handle not found errors
    api.use((req, res) => {
        res.status(404).json({ message: 'URL not found', url: req.url });
    });

    // Handle errors gracefully returning nicely formatted json
    api.use(errorHandler());

    return api;
};
