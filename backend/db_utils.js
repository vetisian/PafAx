const mkQuery = (sql, pool) => {
    return async (args) => {
        const conn = await pool.getConnection();
        console.log(conn);
        try {
            const [ result, _ ] = await conn.query(sql, args);
            console.log(result);
            return result;
        } catch(e) {
            console.error('ERROR: ', e);
            throw e;
        } finally {
            conn.release();
        }
    };
};

const gameReviews = async (gameId, collection) => {
    console.log(gameId, collection);
};

module.exports = {
    mkQuery, gameReviews
};