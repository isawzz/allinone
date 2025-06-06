
function downloadAsCode(obj,fname) {
	function convertObjectToCode(obj) {
		if (typeof obj === 'object' && !Array.isArray(obj)) {
			const entries = Object.entries(obj)
				.map(([key, value]) => `${key}: ${convertObjectToCode(value)}`)
				.join(',\n');
			return `{\n${entries}\n}`;
		} else if (Array.isArray(obj)) {
			return `[${obj.map(convertObjectToCode).join(', ')}]`;
		} else if (typeof obj === 'string') {
			return `"${obj}"`;  // wrap strings in quotes
		} else {
			return obj;  // numbers, booleans, etc. don't need quotes
		}
	}
	// Convert the JS object to a code string with unquoted keys
	const objectAsCode = `const O = ${convertObjectToCode(obj)};`;

	// Create a blob with the code as text
	const blob = new Blob([objectAsCode], { type: 'text/javascript' });

	// Create a download link for the file
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fname+'.js'; // Name of the file to be downloaded

	// Trigger the download
	document.body.appendChild(link);
	link.click();

	// Clean up by removing the link
	document.body.removeChild(link);
}
function filterColorsByFunc(colors, func) {
	let filteredColors = [];
	for (let color of colors) {
		if (func(color)) {
			filteredColors.push(color);
		}
	}
	return filteredColors;
}
function mapColorsByFunc(colors, func) {
	let mappedColors = [];
	for (let color of colors) {
		mappedColors.push(func(color));
	}
	return mappedColors;
}
function mPaletteTrans() {
	let palette = paletteTransWhiteBlack(arguments.length); //console.log(palette);
	for (const did of arguments) {
		let d = toElem(did);
		mStyle(d, { bg: palette.pop(), fg: 'contrast', family: 'opensans', wbox: true, padding: 10 });
	}
}
function oceanLayout(d, bg, level = 0) {
	let d0 = toElem(d)
	mStyle(d0, { bg, padding: 0, margin: 0, wbox:true });
	mClear(d0);
	dTop = mDomid(d0, 'dTop' + level);
	dMiddle = mDom(d0, { classes: 'colsAutoFrAuto' }, { id: 'dMiddle' + level });
	dSidebar = mDomid(dMiddle, 'dSidebar' + level);
	dTable = mDomid(dMiddle, 'dTable' + level); 
	let divs = [dTop, dSidebar, dTable];
	mPaletteTrans(...divs);
	divs.map(x => mStyle(x, {wbox:true}, { html: x.id }))

	//let dTable = mBy('dTable0'); 	
	mStyle(dTable, { overy: 'scroll', hmax: dTable.offsetHeight, wbox: true });

}
function sortColorsByFunc(colors, func) {
	return colors.sort(func);
}



