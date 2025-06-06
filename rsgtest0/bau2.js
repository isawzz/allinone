
function showCollection(dParent,callback, styles={}){
// {	container,	imageUrlCallback,   // function(index) => url	imageWidth = 300,	imageHeight = 200,	bufferPages = 1,	imagesPerRow = 3}) {
	let imageHeight = valf(styles.h,100);
	let imageWidth = valf(styles.w,imageHeight);
	let bufferPages = 1;
	let wParent = mGetStyle(dParent,'w'); console.log('parent width',dParent.clientWidth);
	let imagesPerRow = Math.floor( wParent / imageWidth); console.log(imagesPerRow); //10;
	let page = 0;
	let isLoading = false;
	const imagesPerPage = imagesPerRow * Math.ceil(window.innerHeight / imageHeight);

	function loadImages() {
		if (isLoading) return;
		isLoading = true;

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < imagesPerPage * (1 + bufferPages); i++) {
			const index = page * imagesPerPage + i;
			const img = document.createElement("img");
			img.src = callback(index);
			img.loading = "lazy";
			img.className = "lazy-img";
			img.width = imageWidth;
			img.height = imageHeight;
			fragment.appendChild(img);
		}
		dParent.insertBefore(fragment, sentinel);
		page++;
		isLoading = false;
	}

	// Sentinel element to observe scrolling near bottom
	const sentinel = document.createElement("div");
	sentinel.style.height = "1px";
	dParent.appendChild(sentinel);

	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			loadImages();
		}
	}, {
		rootMargin: "200px"
	});

	observer.observe(sentinel);

	// Initial load
	loadImages();
}


function createLazyImageLoader({
	container,
	imageUrlCallback,   // function(index) => url
	imageWidth = 300,
	imageHeight = 200,
	bufferPages = 1,
	imagesPerRow = 3
}) {
	let page = 0;
	let isLoading = false;
	const imagesPerPage = imagesPerRow * Math.ceil(window.innerHeight / imageHeight);

	function loadImages() {
		if (isLoading) return;
		isLoading = true;

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < imagesPerPage * (1 + bufferPages); i++) {
			const index = page * imagesPerPage + i;
			const img = document.createElement("img");
			img.src = imageUrlCallback(index);
			img.loading = "lazy";
			img.className = "lazy-img";
			img.width = imageWidth;
			img.height = imageHeight;
			fragment.appendChild(img);
		}
		container.insertBefore(fragment, sentinel);
		page++;
		isLoading = false;
	}

	// Sentinel element to observe scrolling near bottom
	const sentinel = document.createElement("div");
	sentinel.style.height = "1px";
	container.appendChild(sentinel);

	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			loadImages();
		}
	}, {
		rootMargin: "200px"
	});

	observer.observe(sentinel);

	// Initial load
	loadImages();
}

function _showCollection(key) {
	const imageContainer = document.getElementById("image-container");
	const imagesPerPage = 20; // Adjust depending on image size/layout
	let page = 0;
	let isLoading = false;

	function loadImages(pageNum) {
		if (isLoading) return;
		isLoading = true;

		// Simulated image URLs (replace with real source or API call)
		const urls = Array.from({ length: imagesPerPage }, (_, i) =>
			`https://picsum.photos/300/200?random=${pageNum * imagesPerPage + i}`
		);

		urls.forEach(url => {
			const img = document.createElement("img");
			img.src = url;
			img.loading = "lazy";
			img.style = "margin: 4px; width: 300px; height: 200px;";
			imageContainer.appendChild(img);
		});

		isLoading = false;
	}

	// Set up observer for triggering load when nearing bottom
	const sentinel = document.createElement("div");
	sentinel.id = "sentinel";
	imageContainer.appendChild(sentinel);

	const observer = new IntersectionObserver(entries => {
		if (entries[0].isIntersecting && !isLoading) {
			page++;
			loadImages(page);
		}
	}, {
		rootMargin: "100px" // Start loading slightly before reaching the bottom
	});

	observer.observe(sentinel);

	// Initial load: just enough to fill viewport + one more page
	function preloadInitial() {
		const viewportHeight = window.innerHeight;
		let imagesLoaded = 0;

		const tempImg = document.createElement("img");
		tempImg.src = "https://picsum.photos/300/200";
		tempImg.style.display = "none";
		document.body.appendChild(tempImg);

		tempImg.onload = () => {
			const imgHeight = tempImg.naturalHeight;
			const imagesPerViewport = Math.ceil(viewportHeight / imgHeight) * 2;

			for (let i = 0; i < imagesPerViewport; i++) {
				const url = `https://picsum.photos/300/200?random=${i}`;
				const img = document.createElement("img");
				img.src = url;
				img.loading = "lazy";
				img.style = "margin: 4px; width: 300px; height: 200px;";
				imageContainer.insertBefore(img, sentinel);
			}

			document.body.removeChild(tempImg);
		};
	}

	preloadInitial();
}





