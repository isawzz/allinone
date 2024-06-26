
/* Thanks
 * Color Thief v2.4.0
 * by Lokesh Dhakar - http://www.lokeshdhakar.com
 *
 * Thanks
 * ------
 * Lokesh Dhakar - For creating colorthief.js
 * Nick Rabinowitz - For creating quantize.js.
*/

//from quantize.js
if (!pppvvv) {
	var pppvvv = {
		map: function map(array, f) {
			var o = {};
			return f ? array.map(function (d, i) {
				o.index = i;
				return f.call(o, d);
			}) : array.slice();
		},
		naturalOrder: function naturalOrder(a, b) {
			return a < b ? -1 : a > b ? 1 : 0;
		},
		sum: function sum(array, f) {
			var o = {};
			return array.reduce(f ? function (p, d, i) {
				o.index = i;
				return p + f.call(o, d);
			} : function (p, d) {
				return p + d;
			}, 0);
		},
		max: function max(array, f) {
			return Math.max.apply(null, f ? pppvvv.map(array, f) : array);
		}
	};
}
var MMCQ = function () {
	// private constants
	var sigbits = 5,
		rshift = 8 - sigbits,
		maxIterations = 1000,
		fractByPopulations = 0.75;

	// get reduced-space color index for a pixel

	function getColorIndex(r, g, b) {
		return (r << 2 * sigbits) + (g << sigbits) + b;
	}

	// Simple priority queue
	function PQueue(comparator) {
		var contents = [],
			sorted = false;
		function sort() {
			contents.sort(comparator);
			sorted = true;
		}
		return {
			push: function push(o) {
				contents.push(o);
				sorted = false;
			},
			peek: function peek(index) {
				if (!sorted) sort();
				if (index === undefined) index = contents.length - 1;
				return contents[index];
			},
			pop: function pop() {
				if (!sorted) sort();
				return contents.pop();
			},
			size: function size() {
				return contents.length;
			},
			map: function map(f) {
				return contents.map(f);
			},
			debug: function debug() {
				if (!sorted) sort();
				return contents;
			}
		};
	}

	// 3d color space box
	function VBox(r1, r2, g1, g2, b1, b2, histo) {
		var vbox = this;
		vbox.r1 = r1;
		vbox.r2 = r2;
		vbox.g1 = g1;
		vbox.g2 = g2;
		vbox.b1 = b1;
		vbox.b2 = b2;
		vbox.histo = histo;
	}
	VBox.prototype = {
		volume: function volume(force) {
			var vbox = this;
			if (!vbox._volume || force) {
				vbox._volume = (vbox.r2 - vbox.r1 + 1) * (vbox.g2 - vbox.g1 + 1) * (vbox.b2 - vbox.b1 + 1);
			}
			return vbox._volume;
		},
		count: function count(force) {
			var vbox = this,
				histo = vbox.histo;
			if (!vbox._count_set || force) {
				var npix = 0,
					i,
					j,
					k,
					index;
				for (i = vbox.r1; i <= vbox.r2; i++) {
					for (j = vbox.g1; j <= vbox.g2; j++) {
						for (k = vbox.b1; k <= vbox.b2; k++) {
							index = getColorIndex(i, j, k);
							npix += histo[index] || 0;
						}
					}
				}
				vbox._count = npix;
				vbox._count_set = true;
			}
			return vbox._count;
		},
		copy: function copy() {
			var vbox = this;
			return new VBox(vbox.r1, vbox.r2, vbox.g1, vbox.g2, vbox.b1, vbox.b2, vbox.histo);
		},
		avg: function avg(force) {
			var vbox = this,
				histo = vbox.histo;
			if (!vbox._avg || force) {
				var ntot = 0,
					mult = 1 << 8 - sigbits,
					rsum = 0,
					gsum = 0,
					bsum = 0,
					hval,
					i,
					j,
					k,
					histoindex;
				for (i = vbox.r1; i <= vbox.r2; i++) {
					for (j = vbox.g1; j <= vbox.g2; j++) {
						for (k = vbox.b1; k <= vbox.b2; k++) {
							histoindex = getColorIndex(i, j, k);
							hval = histo[histoindex] || 0;
							ntot += hval;
							rsum += hval * (i + 0.5) * mult;
							gsum += hval * (j + 0.5) * mult;
							bsum += hval * (k + 0.5) * mult;
						}
					}
				}
				if (ntot) {
					vbox._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
				} else {
					//console.log('empty box');
					vbox._avg = [~~(mult * (vbox.r1 + vbox.r2 + 1) / 2), ~~(mult * (vbox.g1 + vbox.g2 + 1) / 2), ~~(mult * (vbox.b1 + vbox.b2 + 1) / 2)];
				}
			}
			return vbox._avg;
		},
		contains: function contains(pixel) {
			var vbox = this,
				rval = pixel[0] >> rshift;
			gval = pixel[1] >> rshift;
			bval = pixel[2] >> rshift;
			return rval >= vbox.r1 && rval <= vbox.r2 && gval >= vbox.g1 && gval <= vbox.g2 && bval >= vbox.b1 && bval <= vbox.b2;
		}
	};

	// Color map
	function CMap() {
		this.vboxes = new PQueue(function (a, b) {
			return pppvvv.naturalOrder(a.vbox.count() * a.vbox.volume(), b.vbox.count() * b.vbox.volume());
		});
	}
	CMap.prototype = {
		push: function push(vbox) {
			this.vboxes.push({
				vbox: vbox,
				color: vbox.avg()
			});
		},
		palette: function palette() {
			return this.vboxes.map(function (vb) {
				return vb.color;
			});
		},
		size: function size() {
			return this.vboxes.size();
		},
		map: function map(color) {
			var vboxes = this.vboxes;
			for (var i = 0; i < vboxes.size(); i++) {
				if (vboxes.peek(i).vbox.contains(color)) {
					return vboxes.peek(i).color;
				}
			}
			return this.nearest(color);
		},
		nearest: function nearest(color) {
			var vboxes = this.vboxes,
				d1,
				d2,
				pColor;
			for (var i = 0; i < vboxes.size(); i++) {
				d2 = Math.sqrt(Math.pow(color[0] - vboxes.peek(i).color[0], 2) + Math.pow(color[1] - vboxes.peek(i).color[1], 2) + Math.pow(color[2] - vboxes.peek(i).color[2], 2));
				if (d2 < d1 || d1 === undefined) {
					d1 = d2;
					pColor = vboxes.peek(i).color;
				}
			}
			return pColor;
		},
		forcebw: function forcebw() {
			// XXX: won't  work yet
			var vboxes = this.vboxes;
			vboxes.sort(function (a, b) {
				return pppvvv.naturalOrder(pppvvv.sum(a.color), pppvvv.sum(b.color));
			});

			// force darkest color to black if everything < 5
			var lowest = vboxes[0].color;
			if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5) vboxes[0].color = [0, 0, 0];

			// force lightest color to white if everything > 251
			var idx = vboxes.length - 1,
				highest = vboxes[idx].color;
			if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251) vboxes[idx].color = [255, 255, 255];
		}
	};

	// histo (1-d array, giving the number of pixels in
	// each quantized region of color space), or null on error
	function getHisto(pixels) {
		var histosize = 1 << 3 * sigbits,
			histo = new Array(histosize),
			index,
			rval,
			gval,
			bval;
		pixels.forEach(function (pixel) {
			rval = pixel[0] >> rshift;
			gval = pixel[1] >> rshift;
			bval = pixel[2] >> rshift;
			index = getColorIndex(rval, gval, bval);
			histo[index] = (histo[index] || 0) + 1;
		});
		return histo;
	}
	function vboxFromPixels(pixels, histo) {
		var rmin = 1000000,
			rmax = 0,
			gmin = 1000000,
			gmax = 0,
			bmin = 1000000,
			bmax = 0,
			rval,
			gval,
			bval;
		// find min/max
		pixels.forEach(function (pixel) {
			rval = pixel[0] >> rshift;
			gval = pixel[1] >> rshift;
			bval = pixel[2] >> rshift;
			if (rval < rmin) rmin = rval; else if (rval > rmax) rmax = rval;
			if (gval < gmin) gmin = gval; else if (gval > gmax) gmax = gval;
			if (bval < bmin) bmin = bval; else if (bval > bmax) bmax = bval;
		});
		return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
	}
	function medianCutApply(histo, vbox) {
		if (!vbox.count()) return;
		var rw = vbox.r2 - vbox.r1 + 1,
			gw = vbox.g2 - vbox.g1 + 1,
			bw = vbox.b2 - vbox.b1 + 1,
			maxw = pppvvv.max([rw, gw, bw]);
		// only one pixel, no split
		if (vbox.count() == 1) {
			return [vbox.copy()];
		}
		/* Find the partial sum arrays along the selected axis. */
		var total = 0,
			partialsum = [],
			lookaheadsum = [],
			i,
			j,
			k,
			sum,
			index;
		if (maxw == rw) {
			for (i = vbox.r1; i <= vbox.r2; i++) {
				sum = 0;
				for (j = vbox.g1; j <= vbox.g2; j++) {
					for (k = vbox.b1; k <= vbox.b2; k++) {
						index = getColorIndex(i, j, k);
						sum += histo[index] || 0;
					}
				}
				total += sum;
				partialsum[i] = total;
			}
		} else if (maxw == gw) {
			for (i = vbox.g1; i <= vbox.g2; i++) {
				sum = 0;
				for (j = vbox.r1; j <= vbox.r2; j++) {
					for (k = vbox.b1; k <= vbox.b2; k++) {
						index = getColorIndex(j, i, k);
						sum += histo[index] || 0;
					}
				}
				total += sum;
				partialsum[i] = total;
			}
		} else {
			/* maxw == bw */
			for (i = vbox.b1; i <= vbox.b2; i++) {
				sum = 0;
				for (j = vbox.r1; j <= vbox.r2; j++) {
					for (k = vbox.g1; k <= vbox.g2; k++) {
						index = getColorIndex(j, k, i);
						sum += histo[index] || 0;
					}
				}
				total += sum;
				partialsum[i] = total;
			}
		}
		partialsum.forEach(function (d, i) {
			lookaheadsum[i] = total - d;
		});
		function doCut(color) {
			var dim1 = color + '1',
				dim2 = color + '2',
				left,
				right,
				vbox1,
				vbox2,
				d2,
				count2 = 0;
			for (i = vbox[dim1]; i <= vbox[dim2]; i++) {
				if (partialsum[i] > total / 2) {
					vbox1 = vbox.copy();
					vbox2 = vbox.copy();
					left = i - vbox[dim1];
					right = vbox[dim2] - i;
					if (left <= right) d2 = Math.min(vbox[dim2] - 1, ~~(i + right / 2)); else d2 = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
					// avoid 0-count boxes
					while (!partialsum[d2]) d2++;
					count2 = lookaheadsum[d2];
					while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
					// set dimensions
					vbox1[dim2] = d2;
					vbox2[dim1] = vbox1[dim2] + 1;
					// console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
					return [vbox1, vbox2];
				}
			}
		}
		// determine the cut planes
		return maxw == rw ? doCut('r') : maxw == gw ? doCut('g') : doCut('b');
	}
	function quantize(pixels, maxcolors) {
		// short-circuit
		if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
			// console.log('wrong number of maxcolors');
			return false;
		}

		// XXX: check color content and convert to grayscale if insufficient

		var histo = getHisto(pixels);
		histo.forEach(function () {
		});

		// get the beginning vbox from the colors
		var vbox = vboxFromPixels(pixels, histo),
			pq = new PQueue(function (a, b) {
				return pppvvv.naturalOrder(a.count(), b.count());
			});
		pq.push(vbox);

		// inner function to do the iteration

		function iter(lh, target) {
			var ncolors = lh.size(),
				niters = 0,
				vbox;
			while (niters < maxIterations) {
				if (ncolors >= target) return;
				if (niters++ > maxIterations) {
					// console.log("infinite loop; perhaps too few pixels!");
					return;
				}
				vbox = lh.pop();
				if (!vbox.count()) {
					/* just put it back */
					lh.push(vbox);
					niters++;
					continue;
				}
				// do the cut
				var vboxes = medianCutApply(histo, vbox),
					vbox1 = vboxes[0],
					vbox2 = vboxes[1];
				if (!vbox1) {
					// console.log("vbox1 not defined; shouldn't happen!");
					return;
				}
				lh.push(vbox1);
				if (vbox2) {
					/* vbox2 can be null */
					lh.push(vbox2);
					ncolors++;
				}
			}
		}

		// first set of colors, sorted by population
		iter(pq, fractByPopulations * maxcolors);
		// console.log(pq.size(), pq.debug().length, pq.debug().slice());

		// Re-sort by the product of pixel occupancy times the size in color space.
		var pq2 = new PQueue(function (a, b) {
			return pppvvv.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
		});
		while (pq.size()) {
			pq2.push(pq.pop());
		}

		// next set - generate the median cuts using the (npix * vol) sorting.
		iter(pq2, maxcolors);

		// calculate the actual colors
		var cmap = new CMap();
		while (pq2.size()) {
			cmap.push(pq2.pop());
		}
		return cmap;
	}
	return {
		quantize: quantize
	};
}();
var quantize = MMCQ.quantize;

//from code.js
function coreCreatePixelArray(imgData, pixelCount, quality) {
	const pixels = imgData;
	const pixelArray = [];

	for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
		offset = i * 4;
		r = pixels[offset + 0];
		g = pixels[offset + 1];
		b = pixels[offset + 2];
		a = pixels[offset + 3];

		// If pixel is mostly opaque and not white
		if (typeof a === 'undefined' || a >= 125) {
			if (!(r > 250 && g > 250 && b > 250)) {
				pixelArray.push([r, g, b]);
			}
		}
	}
	return pixelArray;
}
function coreValidateOptions(options) {
	let { colorCount, quality } = options;

	if (typeof colorCount === 'undefined' || !Number.isInteger(colorCount)) {
		colorCount = 10;
	} else if (colorCount === 1) {
		throw new Error('colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()');
	} else {
		colorCount = Math.max(colorCount, 2);
		colorCount = Math.min(colorCount, 20);
	}

	if (typeof quality === 'undefined' || !Number.isInteger(quality) || quality < 1) {
		quality = 10;
	}

	return {
		colorCount,
		quality
	}
}

/*
 * CanvasImage Class
 * Class that wraps the html image element and canvas.
 * It also simplifies some of the canvas context manipulation
 * with a set of helper functions.
 * */
const CanvasImage = function (image) {
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.width = this.canvas.width = image.naturalWidth;
	this.height = this.canvas.height = image.naturalHeight;
	this.context.drawImage(image, 0, 0, this.width, this.height);
};

CanvasImage.prototype.getImageData = function () {
	return this.context.getImageData(0, 0, this.width, this.height);
};

var ColorThief = function () { };

/*
 * getColor(sourceImage[, quality])
 * returns {r: num, g: num, b: num}
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar
 * colors and return the base color from the largest cluster.
 *
 * Quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster a color will be returned but the greater the likelihood that it will not be the visually
 * most dominant color.
 *
 * */
ColorThief.prototype.getColor = function (sourceImage, quality = 10) {
	const palette = this.getPalette(sourceImage, 5, quality);
	const dominantColor = palette[0];
	return dominantColor;
};

/*
 * getPalette(sourceImage[, colorCount, quality])
 * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar colors.
 *
 * colorCount determines the size of the palette; the number of colors returned. If not set, it
 * defaults to 10.
 *
 * quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster the palette generation but the greater the likelihood that colors will be missed.
 *
 *
 */
ColorThief.prototype.getPalette = function (sourceImage, colorCount, quality) {
	const options = coreValidateOptions({
		colorCount,
		quality
	});

	// Create custom CanvasImage object
	const image = new CanvasImage(sourceImage);
	const imageData = image.getImageData();
	const pixelCount = image.width * image.height;

	const pixelArray = coreCreatePixelArray(imageData.data, pixelCount, options.quality);

	// Send array to quantize function which clusters values
	// using median cut algorithm
	const cmap = quantize(pixelArray, options.colorCount);
	const palette = cmap ? cmap.palette() : null;

	return palette;
};

ColorThief.prototype.getColorFromUrl = function (imageUrl, callback, quality) {
	const sourceImage = document.createElement("img");

	sourceImage.addEventListener('load', () => {
		const palette = this.getPalette(sourceImage, 5, quality);
		const dominantColor = palette[0];
		callback(dominantColor, imageUrl);
	});
	sourceImage.src = imageUrl
};

ColorThief.prototype.getImageData = function (imageUrl, callback) {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', imageUrl, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function () {
		if (this.status == 200) {
			let uInt8Array = new Uint8Array(this.response);
			i = uInt8Array.length;
			let binaryString = new Array(i);
			for (let i = 0; i < uInt8Array.length; i++) {
				binaryString[i] = String.fromCharCode(uInt8Array[i]);
			}
			let data = binaryString.join('');
			let base64 = window.btoa(data);
			callback('data:image/png;base64,' + base64);
		}
	}
	xhr.send();
};

ColorThief.prototype.getColorAsync = function (imageUrl, callback, quality) {
	const thief = this;
	this.getImageData(imageUrl, function (imageData) {
		const sourceImage = document.createElement("img");
		sourceImage.addEventListener('load', function () {
			const palette = thief.getPalette(sourceImage, 5, quality);
			const dominantColor = palette[0];
			callback(dominantColor, this);
		});
		sourceImage.src = imageData;
	});
};

