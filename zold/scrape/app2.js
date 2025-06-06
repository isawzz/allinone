const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

// Function to scrape a city's page from Wikivoyage
async function scrape2(city) {
	const url = `https://en.wikivoyage.org/wiki/${encodeURIComponent(city)}`;

	try {
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);

		// Extract the title
		const title = $('h1.firstHeading').text();

		// Extract the banner image
		const bannerImage = $('.banner .image img').attr('src');

		// Extract another image (if available)
		const otherImage = $('#mw-content-text .thumbimage').first().attr('src');

		// Extract a short paragraph about the history
		let history = '';
		$('#History').parent().nextUntil('h2').each((i, element) => {
			if (i === 0) {
				history = $(element).text();
			}
		});

		// Extract a list of 3 activities to do in the city
		const activities = [];
		$('#mw-content-text ul').each((i, element) => {
			if (activities.length < 3) {
				$(element).find('li').each((j, li) => {
					if (activities.length < 3) {
						activities.push($(li).text());
					}
				});
			}
		});

		return {
			title,
			bannerImage: bannerImage ? `https:${bannerImage}` : null,
			otherImage: otherImage ? `https:${otherImage}` : null,
			history: history.trim(),
			activities
		};

	} catch (error) {
		console.error(`Error fetching the page for ${city}:`, error);
		return null;
	}
}

// Define a route to get city data
app.get('/city/:city', async (req, res) => {
	const city = req.params.city;
	const cityData = await scrape2(city);

	if (cityData) {
		res.json(cityData);
	} else {
		res.status(404).json({ message: 'City not found' });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
