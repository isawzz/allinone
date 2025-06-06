
function calculateGoodColors(bg, fg) {
	let fgIsLight = isdef(fg) ? colorIdealText(fg) == 'black' : colorIdealText(bg) == 'white';
	let bgIsDark = colorIdealText(bg) == 'white';
	if (nundef(fg)) fg = colorIdealText(bg);
	let bgNav = bg;
	fg = colorToHex79(fg);
	if (fgIsLight) {
		if (isEmpty(U.texture)) { bgNav = '#00000040'; }
		else if (bgIsDark) { bgNav = colorTrans(bg, .8); }
		else { bgNav = colorTrans(colorDark(bg, 50), .8); }
	} else {
		if (isEmpty(U.texture)) { bgNav = '#ffffff40'; }
		else if (!bgIsDark) { bgNav = colorTrans(bg, .8); }
		else { bgNav = colorTrans(colorLight(bg, 50), .8); }
	}
	let realBg = bg;
	if (bgNav == realBg) bgNav = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
	let bgContrast = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
	let fgContrast = fgIsLight ? '#ffffff80' : '#00000080';
	return [realBg, bgContrast, bgNav, fg, fgContrast];
}
function clearMessage(remove=false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }); }

function msElapsedSince(msStart) { return Date.now() - msStart; }

function multiSort(properties) {
	// Example usage:
	// const data = [
	// 	{ name: "Alice", age: 30, city: "New York" },
	// 	{ name: "bob", age: null, city: "los angeles" },
	// 	{ name: null, age: 25, city: "Chicago" },
	// 	{ name: "alice", age: 25, city: "Los Angeles" },
	// 	{ name: "Bob", age: 30, city: null },
	// ];

	// data.sort(multiSort(['name', 'age', 'city']));

	// console.log(data);
	return function (a, b) {
		for (let prop of properties) {
			let propA = a[prop];
			let propB = b[prop];

			// Handle null or undefined values
			if (propA == null && propB == null) continue;
			if (propA == null) return -1;
			if (propB == null) return 1;

			// Compare numbers
			if (typeof propA === 'number' && typeof propB === 'number') {
				if (propA < propB) return -1;
				if (propA > propB) return 1;
				continue;
			}

			// Compare strings case-insensitively
			if (typeof propA === 'string' && typeof propB === 'string') {
				propA = propA.toLowerCase();
				propB = propB.toLowerCase();
				if (propA < propB) return -1;
				if (propA > propB) return 1;
				continue;
			}

			// For other types (including mixed types), compare as strings
			propA = String(propA);
			propB = String(propB);
			if (propA < propB) return -1;
			if (propA > propB) return 1;
		}
		return 0;
	};
}
//#region old obsolete sort functions
function sortBy(arr, key) { arr.sort((a, b) => isEmpty(a[key]) || (a[key] < b[key] ? -1 : 1)); return arr; }

function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }
//#endregion






















