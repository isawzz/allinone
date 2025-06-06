const fs = require('fs');
const path = require('path');

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
	const readStream = fs.createReadStream(inputFilePath, { encoding: 'utf8' });
	let leftover = '';
	let chunk = [];
	let chunkCounter = 0;
	let pageCount = 0;

	readStream.on('data', async (data) => {
		const combinedData = leftover + data;
		const pages = combinedData.split(/<\/page>/); // Split by closing </page> tag

		leftover = pages.pop(); // Last part may be incomplete

		for (let page of pages) {
			page += '</page>'; // Add the closing tag back
			chunk.push(page);
			pageCount++;

			if (pageCount >= pagesPerChunk) {
				chunkCounter++;
				await writeChunkToFile(chunk, chunkCounter, outputDir)
					.then((filename) => {
						console.log(`Chunk ${chunkCounter} written to ${filename}`);
						chunk = [];
						pageCount = 0;
					})
					.catch(err => console.error('Error writing chunk:', err));
			}
		}
	});

	readStream.on('end', async () => {
		// Write any remaining pages as the last chunk
		if (chunk.length > 0) {
			chunkCounter++;
			await writeChunkToFile(chunk, chunkCounter, outputDir)
				.then((filename) => {
					console.log(`Chunk ${chunkCounter} written to ${filename}`);
				})
				.catch(err => console.error('Error writing chunk:', err));
		}
		console.log('Finished processing XML file.');
	});

	readStream.on('error', (err) => {
		console.error('Error reading XML file:', err);
	});
}

// Example usage
const voyagePath = path.join(__dirname, '..', 'enwikivoyage-20240220-pages-meta-current.xml');
const inputFilePath = voyagePath;
const outputDir = path.join(__dirname, '..', 'wikisaves/chunkxml1'); // Directory to save the chunks
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}
splitLargeXML(inputFilePath, outputDir).catch(console.error);
