/*
 * model.js - database models for CogniCity MSF Server missions data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    get: (oid) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT markdown
     FROM ${config.TABLE_BOOKMARKS}
     WHERE oid is $1`;
        let values = [ oid ];

        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    post: (oid, markdownText) => new Promise((resolve, reject) => {
        // Setup query
        let query = `UPDATE ${config.TABLE_BOOKMARKS}
     SET markdown = $2
     WHERE oid is $1`;
        let values = [ oid, markdownText ];

        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),



});
