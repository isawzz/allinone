const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape a city's page from Wikivoyage
async function scrapeCity(city) {
	const url = `https://en.wikivoyage.org/wiki/${encodeURIComponent(city)}`;

	try {
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);

		// Extract the title
		const title = $('h1.firstHeading').text();

		// Extract the introduction paragraph
		let introduction = '';
		$('#mw-content-text p').each((i, element) => {
			if (i === 0) {
				introduction = $(element).text();
			}
		});

		// Extract the history section
		let history = '';
		$('#History').parent().nextUntil('h2').each((i, element) => {
			history += $(element).text() + '\n';
		});

		return {
			title,
			introduction,
			history: history.trim()
		};

	} catch (error) {
		console.error(`Error fetching the page for ${city}:`, error);
	}
}

// Test the scraping function
(async () => {
	const city = 'Paris';
	const cityData = await scrapeCity(city);
	console.log(cityData);
})();
