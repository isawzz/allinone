const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

// Predefined list of 10 cities
const cityNames = [
	"New York City",
	"London",
	"Tokyo",
	"Paris",
	"Berlin",
	"Sydney",
	"Moscow",
	"Beijing",
	"Rio de Janeiro",
	"Cape Town"
];

async function getCityData() {
	const cities = {};

	for (const cityName of cityNames) {
		console.log(cityName)
		const cityData = await getCityDetails(cityName);
		if (cityData) {
			if (!cities[cityName]) {
				cities[cityName] = [];
			}
			cities[cityName].push(cityData);
		}
	}

	const yamlStr = yaml.dump(cities);
	fs.writeFileSync('cities.yaml', yamlStr, 'utf8');
	console.log('YAML file saved successfully');
}

async function getCityDetails(cityName) {
	try {
		const response = await axios.get("https://en.wikivoyage.org/w/api.php", {
			params: {
				action: "query",
				format: "json",
				titles: cityName,
				prop: "extracts|coordinates|pageprops|info",
				inprop: "url",
				exintro: true,
				explaintext: true,
				redirects: true
			}
		});
		const pages = response.data.query.pages;
		const pageId = Object.keys(pages)[0];
		const page = pages[pageId];

		if (!page || page.missing) return null;

		const cityData = {
			country: "", // Country data might need to be fetched from Wikidata or other sources
			population: "", // Population data might need to be fetched from Wikidata or other sources
			longitude: page.coordinates ? page.coordinates[0].lon : "",
			latitude: page.coordinates ? page.coordinates[0].lat : "",
			language: "English",
			wiki_voyage_link: page.fullurl,
			extract: page.extract
		};

		return cityData;
	} catch (error) {
		console.error(`Error fetching details for ${cityName}:`, error);
		return null;
	}
}

getCityData().catch(console.error);
