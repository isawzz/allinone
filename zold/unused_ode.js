
//#region anfang in ode:

function drawCircleOnCanvas(ctx, x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = 'blue';
	ctx.fill();
	ctx.stroke();
}
function placeCircles1(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radius = Math.min(width, height) / 2;

	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 3; // Minimum distance between circles
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	const circles = [];

	// Generate points with slight randomness for more varied distribution
	for (let i = 0; i < n; i++) {
		let valid = false;
		let x, y;

		while (!valid) {
			const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * 0.2;
			const distance = radius * Math.sqrt(i / n) + (Math.random() - 0.5) * radius * 0.1;

			x = radius + distance * Math.cos(angle);
			y = radius + distance * Math.sin(angle);

			valid = true;
			for (const circle of circles) {
				const dx = circle.x - x;
				const dy = circle.y - y;
				if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
					valid = false;
					break;
				}
			}
		}

		circles.push({ x, y });

		// Create and position the circle
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	}
}
function placeCircles1(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radiusX = width / 2;
	const radiusY = height / 2;

	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 2; // Minimum distance between circles
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	const circles = [];

	// Generate points with slight randomness for more varied distribution
	for (let i = 0; i < n; i++) {
		let valid = false;
		let x, y;

		while (!valid) {
			const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * 0.2;
			const distance = Math.sqrt(i / n);

			// Calculate x and y within the ellipse
			x = radiusX + distance * radiusX * Math.cos(angle);
			y = radiusY + distance * radiusY * Math.sin(angle);

			valid = true;
			for (const circle of circles) {
				const dx = circle.x - x;
				const dy = circle.y - y;
				if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
					valid = false;
					break;
				}
			}
		}

		circles.push({ x, y });

		// Create and position the circle
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	}
}
function placeCircles(canvas, n) {
	// // Example usage
	// const canvas = document.getElementById('canvas');
	// placeCircles(canvas, 20);

	const ctx = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;

	const rows = Math.floor(Math.sqrt(n));
	const cols = Math.ceil(n / rows);

	const cellWidth = width / cols;
	const cellHeight = height / rows;

	const radius = Math.min(cellWidth, cellHeight) / 5;

	ctx.clearRect(0, 0, width, height);

	for (let i = 0; i < n; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;

		const x = col * cellWidth + (Math.random() * (cellWidth - 2 * radius) + radius);
		const y = row * cellHeight + (Math.random() * (cellHeight - 2 * radius) + radius);

		drawCircleOnCanvas(ctx, x, y, radius);
	}
}
function rPositions(width, height, n) {
	const rows = Math.floor(Math.sqrt(n));
	const cols = Math.ceil(n / rows);
	const cellWidth = width / cols;
	const cellHeight = height / rows;
	const radius = Math.min(cellWidth, cellHeight) / 5;

	let list = [];
	for (let i = 0; i < n; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;
		const x = col * cellWidth + (Math.random() * (cellWidth - 2 * radius) + radius);
		const y = row * cellHeight + (Math.random() * (cellHeight - 2 * radius) + radius);
		list.push({ x, y });
	}
	return { list, radius };
}
function siebenVonJederFarbe() {
	let colors = {
		"Red": "#E63946",
		"Green": "#06D6A0",
		"Blue": "#118AB2",
		"Cyan": "#0F4C75",
		"Magenta": "#D81159",
		"Yellow": "#FFD166",
		"Orange": "#F4A261",
		"Purple": "#9D4EDD",
		"Pink": "#FF80AB",
		"Brown": "#8D6E63",
		"Lime": "#A7FF83",
		"Indigo": "#3A0CA3",
		"Violet": "#B5838D",
		"Gold": "#F5C518",
		"Teal": "#008080"
	}
	let list = [];
	for (const c of rChoose(Object.values(colors), 7)) {
		for (const i of range(7)) list.push(c);
	}
	arrShuffle(list);

	return list;
}



//#endregion

function mCanvas(dParent, styles = {}, bstyles = {}, play = null, pause = null, origin = 'tl') {
	let cv = mCreate('canvas');
	mAppend(toElem(dParent), cv);
	addKeys({ w: 500, h: 500, bg: '#222', rounding: 10 }, styles);
	mStyle(cv, styles);
	let [w, h] = [cv.width, cv.height] = [styles.w, styles.h];
	return cv;
}
async function mOnclick(menu) {
	UI.nav.activate(menu);
	if (isdef(menu)) await window[`onclick${capitalize(menu)}`](); //eval(`onclick${capitalize(menu)}()`);}
}
async function onclickHome() { UI.nav.activate(); await showDashboard(); }

