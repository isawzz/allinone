function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radius = Math.min(width, height) / 2;

	const circles = [];
	const circleRadius = 10; // Radius of the circles to be placed

	// Generate evenly distributed points within a circular area
	for (let i = 0; i < n; i++) {
		let angle = Math.random() * Math.PI * 2;
		let distance = Math.sqrt(Math.random()) * radius;

		let x = radius + distance * Math.cos(angle);
		let y = radius + distance * Math.sin(angle);

		circles.push({ x, y });
	}

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Place circles in the container
	circles.forEach(({ x, y }) => {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	});
}

function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radius = Math.min(width, height) / 2;

	const circleRadius = 10; // Radius of the circles to be placed
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate evenly distributed points using the Fibonacci lattice method
	for (let i = 0; i < n; i++) {
		const angle = i * goldenAngle;
		const distance = radius * Math.sqrt(i / n);

		const x = radius + distance * Math.cos(angle);
		const y = radius + distance * Math.sin(angle);

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
	const radius = Math.min(width, height) / 2;

	const circleRadius = 10; // Radius of the circles to be placed
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points with slight randomness for more varied distribution
	for (let i = 0; i < n; i++) {
		const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * 0.2;
		const distance = radius * Math.sqrt(i / n) + (Math.random() - 0.5) * radius * 0.1;

		const x = radius + distance * Math.cos(angle);
		const y = radius + distance * Math.sin(angle);

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

function poissonDiscSampler(width, height, radius) {
	const k = 30; // Maximum number of samples before rejection
	const radius2 = radius * radius;
	const R = 3 * radius2;
	const cellSize = radius * Math.SQRT1_2;

	const gridWidth = Math.ceil(width / cellSize);
	const gridHeight = Math.ceil(height / cellSize);
	const grid = new Array(gridWidth * gridHeight);

	const queue = [];
	const samplePoints = [];

	function insert(x, y) {
		const sample = [x, y];
		queue.push(sample);
		samplePoints.push(sample);
		grid[Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridWidth] = sample;
		return sample;
	}

	function far(x, y) {
		const i = Math.floor(x / cellSize);
		const j = Math.floor(y / cellSize);
		const i0 = Math.max(i - 2, 0);
		const j0 = Math.max(j - 2, 0);
		const i1 = Math.min(i + 3, gridWidth);
		const j1 = Math.min(j + 3, gridHeight);
		for (let j = j0; j < j1; ++j) {
			for (let i = i0; i < i1; ++i) {
				const s = grid[i + j * gridWidth];
				if (s) {
					const dx = s[0] - x;
					const dy = s[1] - y;
					if (dx * dx + dy * dy < radius2) return false;
				}
			}
		}
		return true;
	}

	insert(Math.random() * width, Math.random() * height);

	while (queue.length) {
		const i = Math.random() * queue.length | 0;
		const s = queue[i];

		for (let j = 0; j < k; ++j) {
			const a = 2 * Math.PI * Math.random();
			const r = Math.sqrt(Math.random() * R + radius2);
			const x = s[0] + r * Math.cos(a);
			const y = s[1] + r * Math.sin(a);

			if (x >= 0 && x < width && y >= 0 && y < height && far(x, y)) {
				insert(x, y);
				continue;
			}
		}

		queue.splice(i, 1);
	}

	return samplePoints;
}

function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const containerRadius = Math.min(width, height) / 2;
	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 1.5;

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points using Poisson-disc sampling
	const points = poissonDiscSampler(2 * containerRadius, 2 * containerRadius, minDistance);

	// Filter points to fit within the circular container
	const filteredPoints = points.filter(([x, y]) => {
		const dx = x - containerRadius;
		const dy = y - containerRadius;
		return dx * dx + dy * dy <= containerRadius * containerRadius;
	}).slice(0, n); // Limit to n points

	// Place circles in the container
	filteredPoints.forEach(([x, y]) => {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	});
}

function poissonDiscSampler(width, height, minDistance, k = 30) {
	const radius2 = minDistance * minDistance;
	const R = 3 * radius2;
	const cellSize = minDistance / Math.SQRT2;

	const gridWidth = Math.ceil(width / cellSize);
	const gridHeight = Math.ceil(height / cellSize);
	const grid = new Array(gridWidth * gridHeight);

	const queue = [];
	const samplePoints = [];

	function insert(x, y) {
		const sample = [x, y];
		queue.push(sample);
		samplePoints.push(sample);
		grid[Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridWidth] = sample;
		return sample;
	}

	function far(x, y) {
		const i = Math.floor(x / cellSize);
		const j = Math.floor(y / cellSize);
		const i0 = Math.max(i - 2, 0);
		const j0 = Math.max(j - 2, 0);
		const i1 = Math.min(i + 3, gridWidth);
		const j1 = Math.min(j + 3, gridHeight);
		for (let j = j0; j < j1; ++j) {
			for (let i = i0; i < i1; ++i) {
				const s = grid[i + j * gridWidth];
				if (s) {
					const dx = s[0] - x;
					const dy = s[1] - y;
					if (dx * dx + dy * dy < radius2) return false;
				}
			}
		}
		return true;
	}

	insert(Math.random() * width, Math.random() * height);

	while (queue.length) {
		const i = Math.random() * queue.length | 0;
		const s = queue[i];

		for (let j = 0; j < k; ++j) {
			const a = 2 * Math.PI * Math.random();
			const r = Math.sqrt(Math.random() * R + radius2);
			const x = s[0] + r * Math.cos(a);
			const y = s[1] + r * Math.sin(a);

			if (x >= 0 && x < width && y >= 0 && y < height && far(x, y)) {
				insert(x, y);
				continue;
			}
		}

		queue.splice(i, 1);
	}

	return samplePoints;
}

function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const containerRadius = Math.min(width, height) / 2;
	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 1.5; // Minimum distance between circles

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points using Poisson-disc sampling
	const points = poissonDiscSampler(2 * containerRadius, 2 * containerRadius, minDistance);

	// Filter points to fit within the circular container
	const filteredPoints = points.filter(([x, y]) => {
		const dx = x - containerRadius;
		const dy = y - containerRadius;
		return dx * dx + dy * dy <= containerRadius * containerRadius;
	}).slice(0, n); // Limit to n points

	// Place circles in the container
	filteredPoints.forEach(([x, y]) => {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	});
}

function poissonDiscSampler(width, height, minDistance, k = 30) {
	const radius2 = minDistance * minDistance;
	const R = 3 * radius2;
	const cellSize = minDistance / Math.SQRT2;

	const gridWidth = Math.ceil(width / cellSize);
	const gridHeight = Math.ceil(height / cellSize);
	const grid = new Array(gridWidth * gridHeight);

	const queue = [];
	const samplePoints = [];

	function insert(x, y) {
		const sample = [x, y];
		queue.push(sample);
		samplePoints.push(sample);
		grid[Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridWidth] = sample;
		return sample;
	}

	function far(x, y) {
		const i = Math.floor(x / cellSize);
		const j = Math.floor(y / cellSize);
		const i0 = Math.max(i - 2, 0);
		const j0 = Math.max(j - 2, 0);
		const i1 = Math.min(i + 3, gridWidth);
		const j1 = Math.min(j + 3, gridHeight);
		for (let j = j0; j < j1; ++j) {
			for (let i = i0; i < i1; ++i) {
				const s = grid[i + j * gridWidth];
				if (s) {
					const dx = s[0] - x;
					const dy = s[1] - y;
					if (dx * dx + dy * dy < radius2) return false;
				}
			}
		}
		return true;
	}

	insert(Math.random() * width, Math.random() * height);

	while (queue.length) {
		const i = Math.random() * queue.length | 0;
		const s = queue[i];

		for (let j = 0; j < k; ++j) {
			const a = 2 * Math.PI * Math.random();
			const r = Math.sqrt(Math.random() * R + radius2);
			const x = s[0] + r * Math.cos(a);
			const y = s[1] + r * Math.sin(a);

			if (x >= 0 && x < width && y >= 0 && y < height && far(x, y)) {
				insert(x, y);
				continue;
			}
		}

		queue.splice(i, 1);
	}

	return samplePoints;
}

function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const containerRadius = Math.min(width, height) / 2;
	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 1.5; // Minimum distance between circles

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points using Poisson-disc sampling
	const points = poissonDiscSampler(2 * containerRadius, 2 * containerRadius, minDistance);

	// Filter points to fit within the circular container
	const filteredPoints = points.filter(([x, y]) => {
		const dx = x - containerRadius;
		const dy = y - containerRadius;
		return dx * dx + dy * dy <= containerRadius * containerRadius;
	}).slice(0, n); // Limit to n points

	// Adjust points to fit within the container and place circles
	filteredPoints.forEach(([x, y]) => {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x}px`;
		circle.style.top = `${y}px`;
		container.appendChild(circle);
	});
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePoints(n, radius, minDistance) {
	const points = [];
	const cellSize = minDistance;

	const grid = [];
	const gridWidth = Math.ceil(2 * radius / cellSize);
	const gridHeight = Math.ceil(2 * radius / cellSize);

	for (let i = 0; i < gridWidth; i++) {
		grid[i] = [];
		for (let j = 0; j < gridHeight; j++) {
			grid[i][j] = null;
		}
	}

	const insertPoint = (point) => {
		const gx = Math.floor(point.x / cellSize);
		const gy = Math.floor(point.y / cellSize);
		grid[gx][gy] = point;
		points.push(point);
	};

	for (let i = 0; i < n; i++) {
		let point;
		let found = false;

		for (let attempts = 0; attempts < 30; attempts++) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * radius;
			const x = radius + r * Math.cos(angle);
			const y = radius + r * Math.sin(angle);

			if (x >= 0 && x < 2 * radius && y >= 0 && y < 2 * radius) {
				const gx = Math.floor(x / cellSize);
				const gy = Math.floor(y / cellSize);
				let valid = true;

				for (let dx = -1; dx <= 1; dx++) {
					for (let dy = -1; dy <= 1; dy++) {
						const nx = gx + dx;
						const ny = gy + dy;

						if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
							const neighbor = grid[nx][ny];
							if (neighbor) {
								const distance = Math.hypot(neighbor.x - x, neighbor.y - y);
								if (distance < minDistance) {
									valid = false;
									break;
								}
							}
						}
					}
					if (!valid) break;
				}

				if (valid) {
					point = { x, y };
					found = true;
					break;
				}
			}
		}

		if (found) {
			insertPoint(point);
		}
	}

	return points;
}

function placeCircles(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const containerRadius = Math.min(width, height) / 2;
	const circleRadius = 10; // Radius of the circles to be placed
	const minDistance = circleRadius * 1.5; // Minimum distance between circles

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points
	const points = generatePoints(n, containerRadius, minDistance);

	// Place circles in the container
	points.forEach(({ x, y }) => {
		const circle = document.createElement('div');
		circle.classList.add('circle');
		circle.style.width = `${circleRadius * 2}px`;
		circle.style.height = `${circleRadius * 2}px`;
		circle.style.left = `${x - circleRadius}px`;
		circle.style.top = `${y - circleRadius}px`;
		container.appendChild(circle);
	});
}

function placeCircles1(container, n) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radius = Math.min(width, height) / 2;

	const circleRadius = 10; // Radius of the circles to be placed
	let cr = circleRadius / 3;
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Generate points with slight randomness for more varied distribution
	for (let i = 0; i < n; i++) {
		const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * 0.2;
		const distance = radius * Math.sqrt(i / n) + (Math.random() - 0.5) * radius * 0.1;

		const x = radius + distance * Math.cos(angle);
		const y = radius + distance * Math.sin(angle);

		// Create and position the circle
		const circle = document.createElement('div');
		circle.classList.add('circle');

		circle.style.width = `${cr * 2}px`;
		circle.style.height = `${cr * 2}px`;
		circle.style.left = `${x - cr}px`;
		circle.style.top = `${y - cr}px`;
		container.appendChild(circle);
	}
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

//#region mist
function findCirclePairs(circles, position) {
	const result = [];

	for (let i = 0; i < circles.length; i++) {
		for (let j = i + 1; j < circles.length; j++) {
			const circle1 = circles[i];
			const circle2 = circles[j];

			// Check if the line between circle1 and circle2 passes through the given position
			if (isPointOnLineSegment(circle1, circle2, position)) {
				// Check if the line is not interrupted by another circle
				let interrupted = false;
				for (let k = 0; k < circles.length; k++) {
					if (k !== i && k !== j) {
						if (isCircleInterruptingLine(circle1, circle2, circles[k])) {
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

function isPointOnLineSegment(circle1, circle2, point) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: px, y: py } = point;

	// Check if point (px, py) is on the line defined by (x1, y1) and (x2, y2)
	const crossProduct = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
	if (Math.abs(crossProduct) > 1e-7) {
		return false; // Not on the line
	}

	// Check if the point is within the segment bounds
	const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
	if (dotProduct < 0 || dotProduct > Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) {
		return false; // Not within segment bounds
	}

	return true;
}

function isCircleInterruptingLine(circle1, circle2, circle) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = circle;
	const radius = size / 2;

	// Distance from the circle center to the line defined by (x1, y1) and (x2, y2)
	const distance = Math.abs((y2 - y1) * cx - (x2 - x1) * cy + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

	// Check if the circle is interrupting the line
	if (distance < radius) {
		return true;
	}

	return false;
}

function findCirclePairs(circles, position) {
	const result = [];

	for (let i = 0; i < circles.length; i++) {
		for (let j = i + 1; j < circles.length; j++) {
			const circle1 = circles[i];
			const circle2 = circles[j];

			// Check if the line between circle1 and circle2 passes through the given position
			if (isPointOnLineSegment(circle1, circle2, position)) {
				// Check if the line is not interrupted by another circle
				let interrupted = false;
				for (let k = 0; k < circles.length; k++) {
					if (k !== i && k !== j) {
						if (isCircleInterruptingLine(circle1, circle2, circles[k])) {
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

function isPointOnLineSegment(circle1, circle2, point) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: px, y: py } = point;

	// Check if point (px, py) is on the line defined by (x1, y1) and (x2, y2)
	const crossProduct = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
	if (Math.abs(crossProduct) > 1e-7) {
		return false; // Not on the line
	}

	// Check if the point is within the segment bounds
	const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
	if (dotProduct < 0 || dotProduct > Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) {
		return false; // Not within segment bounds
	}

	return true;
}

function isCircleInterruptingLine(circle1, circle2, circle) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = circle;
	const radius = size / 2;

	// Find the closest point on the line segment from circle center to the line
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	const projection = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / (lineLength * lineLength);
	const closestX = x1 + projection * (x2 - x1);
	const closestY = y1 + projection * (y2 - y1);

	// Check if the closest point is within the segment bounds
	const isClosestPointOnSegment = projection >= 0 && projection <= 1;

	// Calculate distance from circle center to closest point
	const distX = cx - closestX;
	const distY = cy - closestY;
	const distance = Math.sqrt(distX * distX + distY * distY);

	// Check if the circle is interrupting the line segment
	return isClosestPointOnSegment && distance < radius;
}

function findCirclePairs(circles, goalCircle) {
	const result = [];

	for (let i = 0; i < circles.length; i++) {
		for (let j = i + 1; j < circles.length; j++) {
			const circle1 = circles[i];
			const circle2 = circles[j];

			// Check if the line between circle1 and circle2 intersects the goal circle
			if (doesLinePassThroughCircle(circle1, circle2, goalCircle)) {
				// Check if the line is not interrupted by another circle
				let interrupted = false;
				for (let k = 0; k < circles.length; k++) {
					if (k !== i && k !== j && k !== goalCircle.index) {
						if (isCircleInterruptingLine(circle1, circle2, circles[k])) {
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

function isCircleInterruptingLine(circle1, circle2, circle) {
	const { x: x1, y: y1 } = circle1;
	const { x: x2, y: y2 } = circle2;
	const { x: cx, y: cy, size } = circle;
	const radius = size / 2;

	// Find the closest point on the line segment from circle center to the line
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	const projection = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / (lineLength * lineLength);
	const closestX = x1 + projection * (x2 - x1);
	const closestY = y1 + projection * (y2 - y1);

	// Check if the closest point is within the segment bounds
	const isClosestPointOnSegment = projection >= 0 && projection <= 1;

	// Calculate distance from circle center to closest point
	const distX = cx - closestX;
	const distY = cy - closestY;
	const distance = Math.sqrt(distX * distX + distY * distY);

	// Check if the circle is interrupting the line segment
	return isClosestPointOnSegment && distance < radius;
}
//#endregion


