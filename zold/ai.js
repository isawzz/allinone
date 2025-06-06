const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

async function getCityData() {
	const cities = {};

	const URL = "https://en.wikivoyage.org/w/api.php";
	const PARAMS = {
		action: "query",
		format: "json",
		list: "categorymembers",
		cmtitle: "Category:Cities",
		cmlimit: "max"
	};

	let continueToken = '';
	do {
		const response = await axios.get(URL, { params: { ...PARAMS, cmcontinue: continueToken } });
		const data = response.data;
		for (const city of data.query.categorymembers) {
			const cityData = await getCityDetails(city.title);
			if (cityData) {
				if (!cities[city.title]) {
					cities[city.title] = [];
				}
				cities[city.title].push(cityData);
			}
		}
		continueToken = data.continue ? data.continue.cmcontinue : '';
	} while (continueToken);

	const yamlStr = yaml.dump(cities);
	fs.writeFileSync('cities.yaml', yamlStr, 'utf8');
	console.log('YAML file saved successfully');
}

async function getCityDetails(cityName) {
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

	if (!page) return null;

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
}

getCityData().catch(console.error);
