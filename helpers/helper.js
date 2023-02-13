const axios = require('axios');

const fetchCryptoPrice = async ( offers ) => {
	for ( const offer of offers ) {
		const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${offer.preferredCurrency}&order=market_cap_desc&per_page=3&page=1&sparkline=false`);
		const margin = (response.data[0].current_price / 100) * offer.offerMargin;
		offer.Value = response.data[0].current_price + margin;
	}
	return offers;
};
const slugify = ( string ) => {
	return string
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}
module.exports = {
	fetchCryptoPrice,
	slugify
};
