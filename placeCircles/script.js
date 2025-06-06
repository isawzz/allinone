function placeCircles1(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radiusX = width / 2;
	const radiusY = height / 2;

	const circleRadius = Math.min(10, 10 * 40 / n); // Radius of the circles to be placed
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

		let o = { x, y, rad: circleRadius };

		// Create and position the circle
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);

		o.div = circle;
		circles.push(o);

	}
	return circles;
}

function findValidCirclePairs(circles, goalCircle) {
	const result = [];
	const lineWidth = 1;

	for (let i = 0; i < circles.length; i++) {
		for (let j = i + 1; j < circles.length; j++) {
			const circle1 = circles[i];
			const circle2 = circles[j];

			// Check if the line segment between circle1 and circle2 intersects the goal circle
			if (doesLinePassThroughCircle(circle1, circle2, goalCircle)) {
				// Check if the line of width 3 between circle1 and circle2, passing through goalCircle, is not interrupted by other circles
				let interrupted = false;
				for (let k = 0; k < circles.length; k++) {
					if (k !== i && k !== j && k !== goalCircle.index) {
						if (isCircleTouchingLine(circle1, circle2, circles[k], lineWidth)) {
							interrupted = true;
							break;
						}
					}
				}

				if (!interrupted) {
					result.push([circle1, circle2]);
				}
			}
		}
	}

	return result;
}

function doesLinePassThroughCircle(circle1, circle2, goalCircle) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = goalCircle;
	const radius = size / 2;

	// Use the point-line distance formula to check if the line segment intersects the circle
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	const projection = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / (lineLength * lineLength);
	const closestX = x1 + projection * (x2 - x1);
	const closestY = y1 + projection * (y2 - y1);

	// Check if the closest point is within the segment bounds
	const isClosestPointOnSegment = projection >= 0 && projection <= 1;

	// Calculate distance from the circle center to closest point
	const distX = cx - closestX;
	const distY = cy - closestY;
	const distance = Math.sqrt(distX * distX + distY * distY);

	// Check if the circle is interrupting the line segment
	return isClosestPointOnSegment && distance <= radius;
}

function isCircleTouchingLine(circle1, circle2, circle, lineWidth) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = circle;
	const radius = size / 2;

	// Calculate line segment length
	const lineLength = Math.hypot(x2 - x1, y2 - y1);

	// Function to check if a point is within the line segment bounds
	const isPointOnLineSegment = (px, py) => {
		const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
		return dotProduct >= 0 && dotProduct <= Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
	};

	// Check if circle center is close to the line segment, considering the line width
	const lineToCircleDist = distanceToLine(x1, y1, x2, y2, cx, cy);
	return lineToCircleDist <= radius + lineWidth / 2;
}

// Helper function to compute the distance from a point to a line segment
function distanceToLine(x1, y1, x2, y2, px, py) {
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	if (lineLength === 0) return Math.hypot(px - x1, py - y1);

	const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / Math.pow(lineLength, 2);
	const closestX = x1 + t * (x2 - x1);
	const closestY = y1 + t * (y2 - y1);

	return Math.hypot(px - closestX, py - closestY);
}

function drawLineBetweenDivs(div1, div2, canvasId) {
	const canvas = document.getElementById(canvasId);
	const ctx = canvas.getContext('2d');

	// Resize canvas to fit the container
	canvas.width = canvas.parentElement.clientWidth;
	canvas.height = canvas.parentElement.clientHeight;

	// Get positions and dimensions of the divs
	const rect1 = div1.getBoundingClientRect();
	const rect2 = div2.getBoundingClientRect();
	const containerRect = canvas.parentElement.getBoundingClientRect();

	const x1 = rect1.left - containerRect.left + rect1.width / 2;
	const y1 = rect1.top - containerRect.top + rect1.height / 2;
	const x2 = rect2.left - containerRect.left + rect2.width / 2;
	const y2 = rect2.top - containerRect.top + rect2.height / 2;

	// Draw line
	//ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous lines
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.stroke();
}
function drawLineBetween(div1,div2,container){
	const canvas = mDom(container, { w100: true, h100: true, position: 'absolute', left: 0, top: 0, 'pointer-events': 'none' }, { tag: 'canvas' });
	
}

function findValidCirclePairs(circles, goalCircle) {
	const result = [];
	const lineWidth = 3;

	for (let i = 0; i < circles.length; i++) {
			for (let j = i + 1; j < circles.length; j++) {
					const circle1 = circles[i];
					const circle2 = circles[j];

					// Check if the line segment between circle1 and circle2 intersects the goal circle
					if (doesLinePassThroughCircle(circle1, circle2, goalCircle)) {
							// Check if the line of width 3 between circle1 and circle2, passing through goalCircle, is not interrupted by other circles
							let interrupted = false;
							for (let k = 0; k < circles.length; k++) {
									if (k !== i && k !== j && k !== goalCircle.index) {
											if (isCircleTouchingLine(circle1, circle2, circles[k], lineWidth)) {
													interrupted = true;
													break;
											}
									}
							}

							if (!interrupted) {
									result.push([circle1, circle2]);
							}
					}
			}
	}

	return result;
}

function doesLinePassThroughCircle(circle1, circle2, goalCircle) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = goalCircle;
	const radius = size / 2;

	// Use the point-line distance formula to check if the line segment intersects the circle
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	const projection = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / (lineLength * lineLength);
	const closestX = x1 + projection * (x2 - x1);
	const closestY = y1 + projection * (y2 - y1);

	// Check if the closest point is within the segment bounds
	const isClosestPointOnSegment = projection >= 0 && projection <= 1;

	// Calculate distance from the circle center to closest point
	const distX = cx - closestX;
	const distY = cy - closestY;
	const distance = Math.sqrt(distX * distX + distY * distY);

	// Check if the circle is interrupting the line segment
	return isClosestPointOnSegment && distance <= radius;
}

function isCircleTouchingLine(circle1, circle2, circle, lineWidth) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = circle;
	const radius = size / 2;

	// Calculate line segment length
	const lineLength = Math.hypot(x2 - x1, y2 - y1);

	// Function to check if a point is within the line segment bounds
	const isPointOnLineSegment = (px, py) => {
			const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
			return dotProduct >= 0 && dotProduct <= Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
	};

	// Check if circle center is close to the line segment, considering the line width
	const lineToCircleDist = distanceToLine(x1, y1, x2, y2, cx, cy);
	return lineToCircleDist <= radius + lineWidth / 2;
}

// Helper function to compute the distance from a point to a line segment
function distanceToLine(x1, y1, x2, y2, px, py) {
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	if (lineLength === 0) return Math.hypot(px - x1, py - y1);

	const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / Math.pow(lineLength, 2);
	const closestX = x1 + t * (x2 - x1);
	const closestY = y1 + t * (y2 - y1);

	return Math.hypot(px - closestX, py - closestY);
}

// // Example usage:
// const circles = [
// 	{ x: 100, y: 150, size: 30 },
// 	{ x: 200, y: 250, size: 30 },
// 	{ x: 300, y: 350, size: 30 },
// 	{ x: 400, y: 450, size: 30 }
// ];

// // Goal circle with size 10
// const goalCircle = { x: 250, y: 300, size: 10, index: null };

// const pairs = findValidCirclePairs(circles, goalCircle);
// console.log(pairs);


// Example usage
const container = document.getElementById('container');
let circles = placeCircles1(container, 10);
const canvas = mDom(container, { w100: true, h100: true, position: 'absolute', left: 0, top: 0, 'pointer-events': 'none' }, { tag: 'canvas' });
canvas.id='cv1';

const position = { x: 250, y: 300 };
const goalCircle = { x: 250, y: 300, size: 30, index: null }; //goalCircle = { x: 300, y: 200, size: 20, index: null };

const circle = document.createElement('div');
circle.classList.add('circle');
circle.style.width = `${goalCircle.size}px`;
circle.style.height = `${goalCircle.size}px`;
circle.style.left = `${goalCircle.x}px`;
circle.style.top = `${goalCircle.y}px`;
circle.style.backgroundColor = 'green'
container.appendChild(circle);

const pairs = findValidCirclePairs(circles, goalCircle); //position);
console.log(pairs);

for (const o of circles) {
	for (const p of pairs) {
		if (p.includes(o)) o.div.style.backgroundColor = 'red';
	}
}

for (const p of pairs) {
	let c = rColor();
	let c1 = p[0];
	let c2 = p[1];
	drawLineBetweenDivs(c1.div, c2.div, canvas.id);
	mStyle(c1.div, { bg: c })
	mStyle(c2.div, { bg: c })
	// for (const o of circles) { if (p.includes(o)) { o.div.style.backgroundColor = c; } }
}

