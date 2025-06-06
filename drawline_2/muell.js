
function tt0(ev) {
	let [x, y] = [ev.clientX, ev.clientY];
	mDom('container', { w: 3, h: 3, left: x - 1, top: y - 1, bg: 'blue', position: 'absolute' });


}
function testCircle2(ev) {
	let sz = 20;
	let container = mBy('container');
	let r = getRect(container); console.log(r);

	let [x, y] = [ev.clientX - r.l - sz / 2, ev.clientY - r.t - sz / 2];
	let elem = mDom(container, { position: 'absolute', border: 'black', w: sz, h: sz, x, y });


	let p1 = { x: x, y: y };
	let p2 = { x: x + sz, y: y };
	let p3 = { x: x + sz, y: y + sz };
	let p4 = { x: x, y: y + sz };
	let epsilon = 2;
	for (let i = 0; i < DA.circles.length - 1; i++) {
		for (let j = i + 1; j < DA.circles.length; j++) {
			let [c1, c2] = [DA.circles[i], DA.circles[j]];
			if (c1 == c2) continue;

			drawLinesBetweenCircles([c1.div, c2.div], 'canvas1')

			let rad = c1.rad; console.log('rad', rad)
			let [pc1, pc2] = [{ x: c1.x + rad, y: c1.y + rad }, { x: c2.x + rad, y: c2.y + rad }];

			let yes = doLineSegmentsAlmostIntersect(p1, p2, pc1, pc2, epsilon);
			yes = yes || doLineSegmentsAlmostIntersect(p2, p3, pc1, pc2, epsilon);
			yes = yes || doLineSegmentsAlmostIntersect(p3, p4, pc1, pc2, epsilon);
			yes = yes || doLineSegmentsAlmostIntersect(p1, p4, pc1, pc2, epsilon);

			//let coll = doesLineTouchElement(p1, p2, circle.div);
			console.log('they intersect?', yes);
			//drawLineIfCollinear(, 'canvas1');
		}
	}
}

function testCircle1(ev) {
	let sz = 20;
	let container = mBy('container');
	let r = getRect(container);
	let [x, y] = [ev.clientX - r.l - sz / 2, ev.clientY - r.t - sz / 2];
	let elem = mDom(container, { position: 'absolute', border: 'black', w: sz, h: sz, x, y });


	let p1 = { x: x, y: y };
	let p2 = { x: x + sz, y: y };
	let p3 = { x: x + sz, y: y + sz };
	let p4 = { x: x, y: y + sz };
	let eps = 1;
	for (let i = 0; i < DA.circles.length - 1; i++) {
		for (let j = i + 1; j < DA.circles.length; j++) {
			let [c1, c2] = [DA.circles[i], DA.circles[j]];
			if (c1 == c2) continue;
			let rad = c1.rad; console.log('rad', rad)
			let [pc1, pc2] = [{ x: c1.x + rad, y: c1.y + rad }, { x: c2.x + rad, y: c2.y + rad }];

			let yes = doLineSegmentsIntersect(pc1, pc2, p1, p2);
			yes = yes || doLineSegmentsIntersect(pc1, pc2, p2, p3);
			yes = yes || doLineSegmentsIntersect(pc1, pc2, p3, p4);
			yes = yes || doLineSegmentsIntersect(pc1, pc2, p4, p1);

			//let coll = doesLineTouchElement(p1, p2, circle.div);
			console.log('they intersect?', yes);
			//drawLineIfCollinear(, 'canvas1');
		}
	}
}
function testCircle(ev) {
	let [x, y] = [ev.clientX - 10, ev.clientY - 10];
	let container = mBy('container');
	let circle = placeCircle(container, x, y, 20, 'green');
	let eps = 1;
	for (let i = 0; i < DA.circles.length - 1; i++) {
		for (let j = i + 1; j < DA.circles.length; j++) {
			let [c1, c2] = [DA.circles[i], DA.circles[j]];
			if (c1 == c2) continue;
			let [p1, p2, p3] = [{ x: c1.x, y: c1.y }, { x: c2.x, y: c2.y }, { x, y }];
			let coll = doesLineTouchElement(p1, p2, circle.div);
			console.log('coll', coll);
			//drawLineIfCollinear(, 'canvas1');
		}
	}
}
function doLineSegmentsAlmostIntersect(p1, p2, p3, p4, epsilon = 10) {
	// Function to compute the orientation of the triplet (a, b, c)
	function orientation(a, b, c) {
		const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
		if (val === 0) return 0;  // Collinear
		return (val > 0) ? 1 : 2; // Clock or counterclockwise
	}

	// Function to check if point q lies on segment pr when p, q, r are collinear
	function onSegment(p, q, r) {
		return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
			q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
	}

	// Function to calculate the distance from a point to a line segment
	function distanceToSegment(px, py, ax, ay, bx, by) {
		const A = px - ax;
		const B = py - ay;
		const C = bx - ax;
		const D = by - ay;

		const dot = A * C + B * D;
		const len_sq = C * C + D * D;
		let param = (len_sq !== 0) ? dot / len_sq : -1;

		let xx, yy;

		if (param < 0) {
			xx = ax;
			yy = ay;
		} else if (param > 1) {
			xx = bx;
			yy = by;
		} else {
			xx = ax + param * C;
			yy = ay + param * D;
		}

		const dx = px - xx;
		const dy = py - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Function to check if two line segments intersect
	function segmentsIntersect() {
		const o1 = orientation(p1, p2, p3);
		const o2 = orientation(p1, p2, p4);
		const o3 = orientation(p3, p4, p1);
		const o4 = orientation(p3, p4, p2);

		if (o1 !== o2 && o3 !== o4) return true;

		if (o1 === 0 && onSegment(p1, p3, p2)) return true;
		if (o2 === 0 && onSegment(p1, p4, p2)) return true;
		if (o3 === 0 && onSegment(p3, p1, p4)) return true;
		if (o4 === 0 && onSegment(p3, p2, p4)) return true;

		return false;
	}

	// Check if segments intersect normally
	if (segmentsIntersect()) {
		return true;
	}

	// Check if segments almost intersect within the epsilon
	if (distanceToSegment(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y) <= epsilon ||
		distanceToSegment(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y) <= epsilon ||
		distanceToSegment(p3.x, p3.y, p1.x, p1.y, p2.x, p2.y) <= epsilon ||
		distanceToSegment(p4.x, p4.y, p1.x, p1.y, p2.x, p2.y) <= epsilon) {
		return true;
	}

	return false;
}
function doLineSegmentsIntersect(p1, p2, p3, p4) {
	// Function to compute the orientation of the triplet (a, b, c)
	// 0 -> a, b and c are collinear
	// 1 -> Clockwise
	// 2 -> Counterclockwise
	function orientation(a, b, c) {
		const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
		if (val === 0) return 0;  // Collinear
		return (val > 0) ? 1 : 2; // Clock or counterclockwise
	}

	// Function to check if point q lies on segment pr when p, q, r are collinear
	function onSegment(p, q, r) {
		return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
			q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
	}

	// Find the four orientations needed for general and special cases
	const o1 = orientation(p1, p2, p3);
	const o2 = orientation(p1, p2, p4);
	const o3 = orientation(p3, p4, p1);
	const o4 = orientation(p3, p4, p2);

	// General case
	if (o1 !== o2 && o3 !== o4) {
		return true;
	}

	// Special Cases
	// p1, p2 and p3 are collinear and p3 lies on segment p1p2
	if (o1 === 0 && onSegment(p1, p3, p2)) return true;

	// p1, p2 and p4 are collinear and p4 lies on segment p1p2
	if (o2 === 0 && onSegment(p1, p4, p2)) return true;

	// p3, p4 and p1 are collinear and p1 lies on segment p3p4
	if (o3 === 0 && onSegment(p3, p1, p4)) return true;

	// p3, p4 and p2 are collinear and p2 lies on segment p3p4
	if (o4 === 0 && onSegment(p3, p2, p4)) return true;

	// Doesn't fall in any of the above cases
	return false;
}
function doesLineTouchElement(p1, p2, elem) {
	// Get the bounding box of the element
	const rect = elem.getBoundingClientRect();
	const topLeft = { x: rect.left, y: rect.top };
	const topRight = { x: rect.right, y: rect.top };
	const bottomLeft = { x: rect.left, y: rect.bottom };
	const bottomRight = { x: rect.right, y: rect.bottom };

	// Function to check if a point is on the line
	function isPointOnLine(px, py) {
		return (p2.x - p1.x) * (py - p1.y) === (p2.y - p1.y) * (px - p1.x);
	}

	// Check if any of the rectangle's corners are on the line
	if (isPointOnLine(topLeft.x, topLeft.y) ||
		isPointOnLine(topRight.x, topRight.y) ||
		isPointOnLine(bottomLeft.x, bottomLeft.y) ||
		isPointOnLine(bottomRight.x, bottomRight.y)) {
		return true;
	}

	// Function to check if two line segments intersect
	function doLinesIntersect(a1, a2, b1, b2) {
		const det = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
		if (det === 0) return false; // Parallel lines

		const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
		const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;

		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
	}

	// Check if the line between p1 and p2 intersects any of the edges of the rectangle
	if (doLinesIntersect(p1, p2, topLeft, topRight) ||
		doLinesIntersect(p1, p2, topRight, bottomRight) ||
		doLinesIntersect(p1, p2, topLeft, bottomRight) ||
		doLinesIntersect(p1, p2, topRight, bottomLeft) ||
		doLinesIntersect(p1, p2, bottomRight, bottomLeft) ||
		doLinesIntersect(p1, p2, bottomLeft, topLeft)) {
		return true;
	}

	return false;
}
function isCollinear(p1, p2, p3) {
	console.log(p1, p2, p3)
	let dx1 = p2.x - p1.x;
	let dx2 = p3.x - p1.x;
	let dy1 = p2.y - p1.y;
	let dy2 = p3.y - p1.y;
	let m1 = dy1 / dx1;
	let m2 = dy2 / dx2;
	console.log('m1', m1, 'm2', m2);
	let epsilon = 5;
	return Math.abs(m1 - m2) <= epsilon;
}
function drawLineIfCollinear(p1, p2, p3, canvasId) {
	const canvas = document.getElementById(canvasId);
	if (!canvas.getContext) {
		console.error("Canvas is not supported by your browser.");
		return;
	}

	const ctx = canvas.getContext('2d');

	// Check if p3 is collinear with p1 and p2
	// const isCollinear = (p2.x - p1.x) * (p3.y - p1.y) === (p2.y - p1.y) * (p3.x - p1.x);
	console.log(p1, p2, p3)
	let dx1 = p2.x - p1.x;
	let dx2 = p3.x - p1.x;
	let dy1 = p2.y - p1.y;
	let dy2 = p3.y - p1.y;
	let m1 = dy1 / dx1;
	let m2 = dy2 / dx2;
	console.log('m1', m1, 'm2', m2);
	let epsilon = 5;
	let isCollinear = Math.abs(m1 - m2) <= epsilon;

	//const isCollinear = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)) <= 5;

	if (isCollinear) {
		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw the line connecting p1 and p2
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.stroke();
		console.log("YES!");

	} else {
		console.log("p3 is not on the line defined by p1 and p2.");
	}
}
function placeCircle(container, x, y, sz, color) {
	const circleRadius = isdef(sz) ? sz / 2 : Math.min(10, 10 * 40 / n); // Radius of the circles to be placed
	let o = { x, y, rad: circleRadius };

	// Create and position the circle
	const circle = document.createElement('div');
	circle.classList.add('circle');
	circle.style.width = `${circleRadius * 2}px`;
	circle.style.height = `${circleRadius * 2}px`;
	circle.style.left = `${x - circleRadius}px`;
	circle.style.top = `${y - circleRadius}px`;
	circle.style.backgroundColor = valf(color, 'red');
	container.appendChild(circle);

	o.div = circle;
	return o;
}
function placeCircles(container, n, sz, color) {
	const width = container.clientWidth;
	const height = container.clientHeight;
	const radiusX = width / 2;
	const radiusY = height / 2;

	const circleRadius = isdef(sz) ? sz / 2 : Math.min(10, 10 * 40 / n); // Radius of the circles to be placed
	const minDistance = 40;//circleRadius * 2; // Minimum distance between circles
	const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Approx. 137.5 degrees in radians

	// Clear existing circles
	//while (container.firstChild) { container.removeChild(container.firstChild); }

	const circles = [];

	let maxcount = 1000, cnt = 0;;
	// Generate points with slight randomness for more varied distribution
	for (let i = 0; i < n; i++) {
		let valid = false;
		let x, y;

		while (!valid && cnt++ < maxcount) {

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
		circle.style.backgroundColor = valf(color, 'red');
		container.appendChild(circle);

		o.div = circle;
		circles.push(o);

	}
	return circles;
}
function isLineIntersectingCircle(x1, y1, x2, y2, circle, radius) {
	const distToCircle = distanceToLineSegment(x1, y1, x2, y2, circle.x, circle.y);
	return distToCircle < radius;
}
function distanceToLineSegment(x1, y1, x2, y2, px, py) {
	const lineLength = Math.hypot(x2 - x1, y2 - y1);
	if (lineLength === 0) return Math.hypot(px - x1, py - y1);

	const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / Math.pow(lineLength, 2);
	const closestX = x1 + t * (x2 - x1);
	const closestY = y1 + t * (y2 - y1);

	return Math.hypot(px - closestX, py - closestY);
}
function isClearLine_NOPE(circle1, circle2) {
	const { x: x1, y: y1 } = getCenter(circle1);
	const { x: x2, y: y2 } = getCenter(circle2);
	const radius = parseInt(window.getComputedStyle(circle1).width) / 2;

	return !circles.some(circle => {
		if (circle === circle1 || circle === circle2) return false;
		const { x, y } = getCenter(circle);
		return isLineIntersectingCircle(x1, y1, x2, y2, { x, y }, radius);
	});
}
function isClearLine(circle1, circle2, circles) {
	const { x: x1, y: y1 } = getCenter(circle1);
	const { x: x2, y: y2 } = getCenter(circle2);
	const radius = parseInt(window.getComputedStyle(circle1).width) / 2;

	return !circles.some(circle => {
		if (circle === circle1 || circle === circle2) return false;
		const { x, y } = getCenter(circle);
		const circleRadius = parseInt(window.getComputedStyle(circle).width) / 2;
		return isLineIntersectingCircle(x1, y1, x2, y2, x, y, circleRadius);
	});
}
function drawLinesBetweenCircles(circles, canvasId) {
	const canvas = document.getElementById(canvasId);
	const ctx = canvas.getContext('2d');

	// Resize canvas to fit the container
	canvas.width = canvas.parentElement.clientWidth;
	canvas.height = canvas.parentElement.clientHeight;

	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines between circles
	for (let i = 0; i < circles.length; i++) {
		for (let j = i + 1; j < circles.length; j++) {
			const circle1 = circles[i];
			const circle2 = circles[j];
			if (isClearLine(circle1, circle2, circles)) {
				const { x: x1, y: y1 } = getCenter(circle1);
				const { x: x2, y: y2 } = getCenter(circle2);

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.stroke();
			}
		}
	}
}

