// Import required modules
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to download and save image
async function downloadImage(url, destPath) {
	try {
		const response = await axios({
			method: 'GET',
			url: url,
			responseType: 'stream'
		});

		// Pipe the image data to the file
		response.data.pipe(fs.createWriteStream(destPath));

		return new Promise((resolve, reject) => {
			response.data.on('end', () => {
				resolve();
			});

			response.data.on('error', (err) => {
				reject(err);
			});
		});
	} catch (err) {
		throw new Error(`Failed to download image: ${err.message}`);
	}
}

// Example usage
const imageUrl = 'https://example.com/image.jpg'; // Replace with your image URL
const savePath = path.join(__dirname, 'images', 'downloaded_image.jpg'); // Replace with desired save path

downloadImage(imageUrl, savePath)
	.then(() => {
		console.log(`Image downloaded successfully to: ${savePath}`);
	})
	.catch((err) => {
		console.error('Error downloading image:', err);
	});
