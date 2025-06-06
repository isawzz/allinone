const fs = require('fs');
const path = require('path');
const sax = require('sax');

// Function to write a chunk to a file
function writeChunkToFile(chunk, chunkCounter, outputDir) {
	const chunkFileName = path.join(outputDir, `chunk_${chunkCounter}.xml`);
	const fileContent = `<root>\n${chunk.join('\n')}\n</root>`;
	return new Promise((resolve, reject) => {
		fs.writeFile(chunkFileName, fileContent, 'utf8', (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(chunkFileName);
			}
		});
	});
}

// Main function to process the XML file
async function splitLargeXML(inputFilePath, outputDir, pagesPerChunk = 1000) {
	const parser = sax.createStream(true, { trim: true });
	let chunk = [];
	let chunkCounter = 0;
	let pageCount = 0;

	parser.on('opentag', (node) => {
		if (node.name === 'page') {
			chunk.push('<page>');
		}
	});

	parser.on('closetag', (node) => {
		if (node === 'page') {
			chunk.push('</page>');
			pageCount++;
			if (pageCount >= pagesPerChunk) {
				chunkCounter++;
				writeChunkToFile(chunk, chunkCounter, outputDir)
					.then((filename) => {
						console.log(`Chunk ${chunkCounter} written to ${filename}`);
						chunk = [];
						pageCount = 0;
					})
					.catch(err => console.error('Error writing chunk:', err));
			}
		}
	});

	parser.on('text', (text) => {
		if (chunk.length > 0) {
			chunk[chunk.length - 1] += text;
		}
	});

	parser.on('cdata', (cdata) => {
		if (chunk.length > 0) {
			chunk[chunk.length - 1] += cdata;
		}
	});

	parser.on('end', async () => {
		if (chunk.length > 0) {
			chunkCounter++;
			await writeChunkToFile(chunk, chunkCounter, outputDir);
			console.log(`Chunk ${chunkCounter} written to ${chunkFileName}`);
		}
		console.log('Finished processing XML file.');
	});

	fs.createReadStream(inputFilePath)
		.pipe(parser)
		.on('error', (err) => {
			console.error('Error reading XML file:', err);
		});
}

// Example usage
const voyagePath = path.join(__dirname, '..', 'enwikivoyage-20240220-pages-meta-current.xml');
const inputFilePath = voyagePath;
const outputDir = path.join(__dirname, '..', 'wikisaves/chunkxml'); // Directory to save the chunks
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}
splitLargeXML(inputFilePath, outputDir).catch(console.error);
