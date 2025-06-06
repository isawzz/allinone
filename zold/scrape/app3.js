const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

async function getFromWebPage(city) {
	const url = `https://en.wikivoyage.org/wiki/${encodeURIComponent(city)}`;
	try {
		const { data } = await axios.get(url);
		//const lines = data.split('\n').slice(0, 200).join('\n');
		return data;
	} catch (error) {
		console.error(`Error fetching the page for ${city}:`, error);
		return null;
	}
}
async function processToPageText(filePath) {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
		const rl = readline.createInterface({
			input: readStream,
			crlfDelay: Infinity
		});

		let lineNumber = 0;
		let pages = {}, page, title;
		let inpage = false;
		rl.on('line', (line) => {
			let l = trimWhitespace(line);
			if (l.startsWith('</mediawiki')) {
				saveYaml(pages, 'pages.yaml');
			} else if (l.startsWith('</page')) {
				inpage = false;
			} else if (inpage) {
				//page.lines += line;
				page += l + '\n';
				if (l.startsWith('<title')) title = stringBetween(l, '<title>', '</title>').trim();
			} else if (l.startsWith('<page')) {
				pages[title] = page;
				page = '';
				inpage = true;
			} else console.log(`ERROR line# ${lineNumber}`);
			// Process each line here
			lineNumber++;
			//console.log(line);
		});

		rl.on('close', () => {
			console.log('Finished reading file.');
			parsingComplete = true;
			resolve(pages);
		});

		rl.on('error', (error) => {
			console.error(`Error reading file: ${error.message}`);
			reject(error);
		});

		readStream.on('error', (error) => {
			console.error(`Error reading stream: ${error.message}`);
			reject(error);
		});
	});
}
function trimWhitespace(line) { return line.replace(/\s+/g, ''); }

// Define a route to get the first 200 lines of a city's page
app.get('/citynew/:city/first200lines', async (req, res) => {
	const city = req.params.city;
	const first200Lines = await getFromWebPage(city);

	if (first200Lines) {
		res.send(first200Lines);
	} else {
		res.status(404).json({ message: 'City not found or error fetching data' });
	}
});
app.get('/city', async (req, res) => {
	const { city } = req.query;
	console.log('==> get city',city);
	const result = await getFromWebPage(city);
	res.json(result);
});

async function init() {
	//Session.voyageData = await processToPageText(voyagePath);

	app.listen(port, () => { console.log(`Server running at http://localhost:${port}/`); });

}
init();
