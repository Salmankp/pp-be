const redis = require('redis');
const DEFAULT_EXPIRATION = 3600;
const client = redis.createClient();

//log error to the console if any occurss
client.connect();
client.on('connect', () => console.log('::> Redis Client Connected'));
client.on('error', ( err ) => console.log('<:: Redis Client Error', err));

const getOrSetCache = async ( key, user ) => {
	client.get(key, async ( error, data ) => {
		if ( error ) {
			return error;
		}
		if ( data != null ) {
			return JSON.parse(data);
		}
	});
	client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(user));
};

module.exports = {
	getOrSetCache
};
