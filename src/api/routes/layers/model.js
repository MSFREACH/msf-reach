/*
 * model.js - database models for CogniCity MSF Server events interaction
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
   * Return layer specified by name
   * @param {string} layer of name
   */
    byName: (layerName) => new Promise((resolve, reject) => {

        // Setup query
        let query = `SELECT layer
      FROM cognicity.layers
      WHERE name = $1`;

        // Setup values
        let values = [ layerName ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
