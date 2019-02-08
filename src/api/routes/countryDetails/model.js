// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all countryDetail
   * @param {integer} id ID of event to filter countryDetail by
	 */
    all: (body) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT *
			FROM ${config.TABLE_COUNTRY_DETAILS}
			WHERE country_code = ANY($1::VARCHAR[]) `; // xor
        let values = [body.countries];
        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),
    /**
	 * Create a new report
	 * @param {object} body Body of request with report details
	 */
    createDetail: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_COUNTRY_DETAILS}
			(country, country_code, category, type, metadata, created)
			VALUES ($1, $2, $3, $4, $5, now())
			RETURNING id, country, country_code, category, type, metadata, created`;

        // Setup values
        let values = [ body.country, body.country_code, body.category, body.type, body.metadata];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, country: data.country, country_code:data.country_code, category:data.category, type:data.type, metadata:data.metadata, created: data.created }))
            .catch((err) => reject(err));
    }),

    /**
	 * Update a report status
	 * @param {integer} id ID of report
	 * @param {object} body Body of request with event details
	 */
    updateDetail: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_COUNTRY_DETAILS}
			SET metadata = $1,
			updated = now()
			WHERE id = $2
			RETURNING id, country, country_code, category, type, metadata, updated`;

        // Setup values
        let values = [body.metadata, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), country: data.country, country_code:data.country_code, category: data.category, type: data.type, metadata:data.metadata, updated: data.updated}))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE an countryDetail from the database
    * @param {integer} id ID of contact
    */
    deleteDetail: (id) => new Promise((resolve, reject) => {
        // Setup query
        let query = `DELETE FROM ${config.TABLE_COUNTRY_DETAILS} WHERE id = $1`;
        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
