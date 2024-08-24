async function getImageUrls(wikitravelUrl) {
	// // Example usage
	// const wikitravelUrl = 'https://wikitravel.org/en/Paris'; // Replace with the actual URL of the Wikitravel page
	// getImageUrls(wikitravelUrl).then(imgUrls => {
	// 	// Print the image URLs
	// 	imgUrls.forEach(url => console.log(url));
	// });

	try {
			// Fetch the HTML content of the Wikitravel page
			const response = await fetch(wikitravelUrl, {
					headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					}
			});

			// Check if the response is ok
			if (!response.ok) {
					throw new Error(`Failed to retrieve the webpage. Status code: ${response.status}`);
			}

			// Get the text content from the response
			const htmlText = await response.text();

			// Parse the HTML content
			const parser = new DOMParser();
			const doc = parser.parseFromString(htmlText, 'text/html');

			// Find all img tags
			const imgTags = doc.querySelectorAll('img');

			// Extract the URLs from the src attribute of each img tag
			const imgUrls = Array.from(imgTags).map(img => img.src);

			return imgUrls;
	} catch (error) {
			console.error('Error:', error);
			return [];
	}
}

