const axios = require('axios');

async function getPageDetails(titles) {
	const URL = "https://en.wikivoyage.org/w/api.php";
	const PARAMS = {
		action: "query",
		format: "json",
		titles: titles.join('|'),
		prop: "categories|extracts",
		cllimit: "max",
		exintro: true,
		explaintext: true,
		redirects: true
	};

	try {
		const response = await axios.get(URL, { params: PARAMS });
		const pages = response.data.query.pages;

		const results = Object.values(pages).map(page => {
			const isCity = page.categories.some(category => category.title === "Category:Cities");
			const statusCategories = ["Category:Star_articles", "Category:Guide_articles", "Category:Usable_articles"];
			const status = statusCategories.find(category =>
				page.categories.some(cat => cat.title === category)
			) || "None";

			return {
				title: page.title,
				isCity: isCity,
				status: status.replace("Category:", "").replace("_articles", "").toLowerCase(),
				extract: page.extract || "No extract available"
			};
		});

		return results;
	} catch (error) {
		console.error('Error fetching page details:', error);
		return null;
	}
}

async function fetchAndPrintDetails() {
	const titles = [
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

	const details = await getPageDetails(titles);

	if (details) {
		details.forEach(detail => {
			console.log(`Title: ${detail.title}`);
			console.log(`Is City: ${detail.isCity}`);
			console.log(`Status: ${detail.status}`);
			console.log(`Extract: ${detail.extract}`);
			console.log('--------------------');
		});
	}
}

fetchAndPrintDetails().catch(console.error);
