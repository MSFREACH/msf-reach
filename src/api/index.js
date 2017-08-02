import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import validate from 'celebrate';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import events from './routes/events';
import reports from './routes/reports';
import twitter from './routes/twitter';

export default ({ config, db, logger }) => {
	let api = Router();

	// Return the API version
	api.get('/', (req, res) => {
		res.status(200).json({ version });
	});

	// Mount the various endpoints
	api.use('/events', events({ config, db, logger }));
	api.use('/reports', reports({ config, db, logger }));
	api.use('/twitter', twitter({ config, db, logger}));

	// Handle validation errors (wording of messages can be overridden using err.isJoi)
	api.use(validate.errors());

	// Handle not found errors
	api.use((req, res) => {
		res.status(404).json({ message: 'URL not found', url: req.url });
	});

	// Handle errors gracefully returning nicely formatted json
	api.use(errorHandler());

	return api;
}
