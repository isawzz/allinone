function drawLineIfCollinear(p1, p2, p3, canvasId) {
	const canvas = document.getElementById(canvasId);
	if (!canvas.getContext) {
			console.error("Canvas is not supported by your browser.");
			return;
	}

	const ctx = canvas.getContext('2d');

	// Check if p3 is collinear with p1 and p2
	const isCollinear = (p2.x - p1.x) * (p3.y - p1.y) === (p2.y - p1.y) * (p3.x - p1.x);

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
	} else {
			console.log("p3 is not on the line defined by p1 and p2.");
	}
}

// // Example usage:
// const p1 = { x: 50, y: 50 };
// const p2 = { x: 150, y: 150 };
// const p3 = { x: 250, y: 250 }; // This point is collinear with p1 and p2
// drawLineIfCollinear(p1, p2, p3, 'myCanvas');


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
			doLinesIntersect(p1, p2, bottomRight, bottomLeft) ||
			doLinesIntersect(p1, p2, bottomLeft, topLeft)) {
			return true;
	}

	return false;
}

// Example usage:
// const p1 = { x: 50, y: 50 };
// const p2 = { x: 300, y: 300 };
// const elem = document.getElementById('myElement');

// if (doesLineTouchElement(p1, p2, elem)) {
// 	console.log("The line touches the element.");
// } else {
// 	console.log("The line does not touch the element.");
// }

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

// // Example usage:
// const p1 = { x: 1, y: 1 };
// const p2 = { x: 10, y: 1 };
// const p3 = { x: 1, y: 2 };
// const p4 = { x: 10, y: 2 };

// const result = doLineSegmentsIntersect(p1, p2, p3, p4);
// console.log(result ? "The segments intersect." : "The segments do not intersect.");

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

// Example usage:
// const p1 = { x: 1, y: 1 };
// const p2 = { x: 10, y: 1 };
// const p3 = { x: 1, y: 2 };
// const p4 = { x: 10, y: 2 };

// const result = doLineSegmentsAlmostIntersect(p1, p2, p3, p4);
// console.log(result ? "The segments almost intersect." : "The segments do not almost intersect.");
