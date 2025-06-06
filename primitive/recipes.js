function recipesLayout(d1) {
	let [dTop, dMainTop, dFooter] = mGridRows(d1, 'auto 1fr auto');
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	let [dSideLeft, dUpper] = mGridCols(dMainTop, 'auto 1fr');
	let divs = [dSideLeft, dUpper, dFooter, dTop];
	let names = ['dSideLeft', 'dUpper', 'dFooter', 'dTop'];
	let palette = paletteTransWhiteBlack(divs.length + 2); //console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' },{id:names[i]}));
	let sidebar = mSidebar(dSymLeft, dSideLeft); console.log(sidebar);
	mStyle(dUpper, { margin: 0, padding:0 })
	mCenterFlex(dUpper);
	return divs;

}