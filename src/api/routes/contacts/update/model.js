/*
 * model.js - database models for CogniCity MSF Server contact data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    requestGUID: (email) => new Promise((resolve, reject) => {
        let query = `UPDATE ${config.TABLE_CONTACTS} SET properties = properties ||('{"guid":"'||gen_random_uuid()||'", "guid_timestamp":"'||extract (epoch from now())||'"}')::jsonb WHERE (properties->>'email' = $1 OR properties ->>'email2' = $1) RETURNING properties->>'guid' AS guid`;

        let values = [ email ];

        // Execute query
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    validateGUID: (email, guid) => new Promise((resolve, reject) => {
        let query = `SELECT id, ST_X(the_geom) as lng, ST_Y(the_geom) as lat, properties FROM ${config.TABLE_CONTACTS} WHERE (properties->>'email' = $1 or properties->>'email2' = $2) AND properties->>'guid' = $2 AND (extract(epoch from now()) - (properties->>'guid_timestamp')::real) <= ${config.PEER_GUID_TIMEOUT}`;

        let values = [email, guid];

        // Execture query
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })
});
