const axios = require('axios');
const cheerio = require('cheerio');

async function getPageContent(pageTitle) {
	const URL = 'https://en.wikivoyage.org/w/api.php';
	const PARAMS = {
		action: 'parse',
		page: pageTitle,
		format: 'json',
		prop: 'text',
	};

	try {
		const response = await axios.get(URL, { params: PARAMS });
		const html = response.data.parse.text["*"];
		//console.log(html)
		return html;
	} catch (error) {
		console.error('Error fetching page content:', error);
		return null;
	}
}

function extractBreadcrumbs(html) {



	const $ = cheerio.load(html);
	const breadcrumbs = [];

	// The breadcrumb navigation is often within a div with class 'breadcrumb'
	$('#mw-content-subtitle').each((index, element) => {
		breadcrumbs.push(element.innerHTML);
		// const title = $(element).text();
		// const href = $(element).attr('href');
		// breadcrumbs.push({ title, href: `https://en.wikivoyage.org${href}` });
	});

	return breadcrumbs;
}
function extractBreadcrumbs(html) {
	const $ = cheerio.load(html);
	const breadcrumbs = [];

	// The breadcrumb navigation is often within a div with class 'breadcrumb'
	$('div.breadcrumb a').each((index, element) => {
		const title = $(element).text();
		const href = $(element).attr('href');
		breadcrumbs.push({ title, href: `https://en.wikivoyage.org${href}` });
	});

	return breadcrumbs;
}
function extractBreadcrumbs(html,title) {
	let parts = html.split('mw-content'); //title); //'breadcrumb'); //mw-content-subtitle');
	console.log('parts',parts.length);
	return parts;//.map(x=>x.substring(0,10)); //parts.length > 1 ? [parts[1].substring(0, 100)] : [];
}
async function fetchAndPrintBreadcrumbs(pageTitle) {
	const html = await getPageContent(pageTitle);

	if (html) {
		const breadcrumbs = extractBreadcrumbs(html,pageTitle);
		if (breadcrumbs.length==1){
			console.log(breadcrumbs[0]);
		} else if (breadcrumbs.length > 0) {
			console.log('Breadcrumbs hierarchy:');
			breadcrumbs.slice(0,20).forEach((breadcrumb, index) => {
				// console.log(`${index + 1}. ${breadcrumb.title} - ${breadcrumb.href}`);
				console.log(`${breadcrumb.substring(0,40)}`);
			});
		} else {
			console.log('No breadcrumbs found.');
		}
	}
}

const pageTitle = 'Vienna'; // Replace with the desired WikiVoyage page title
fetchAndPrintBreadcrumbs(pageTitle).catch(console.error);
