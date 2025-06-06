const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express(); app.use(cors());
const port = 3000;

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
		return null;
	}
}

// Define a route to get city history
app.get('/city/:city', async (req, res) => {
	const city = req.params.city;
	const cityData = await scrapeCity(city);

	if (cityData) {
		res.json(cityData);
	} else {
		res.status(404).json({ message: 'City not found' });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
