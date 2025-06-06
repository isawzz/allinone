
function drawPointStar(p1, d, sz) {
	let starSizes = [1, .4, 1, 1, 1, .8, 1, .6, 1]; //,.3,.2,.25,.4,.2,.1,.2,.1,1];
	let itype = p1.type % starSizes.length; //console.log('itype',itype);
	p1.sz = sz = 30 * starSizes[itype]; //console.log('sz',sz);
	let img = p1.div = cloneImage(M.starImages[itype], d, p1.x, p1.y, sz, sz);
	img.id = p1.id = `p${p1.x}_${p1.y}`;

}
function leinwand(w = 500, h = 500, bg = '#242430') {
	let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
	let [margin, padding, border] = [25, 0, 7]; //25;
	let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg, margin, padding, className: 'lensBorder' }, { id: 'dCanvas' });
	return d;
}
async function loadStarImages() {
	let list = [];
	let names = ['bl1', 'bl2', 'bl3', 'bl4', 'bl7', 'bl8', 'bl9', 'bl6', 'bl5'];
	for (const name of names) {		list.push(`../assets/icons/stars/${name}.png`);	}
	// for (let i = 0; i < 9; i++) {
	// 	for (const name of ['blue', 'bl', 'blu']) {
	// 		list.push(`../assets/icons/stars/${name}${i + 1}.png`);
	// 	}
	// }
	// let list1 = range(1, 9).map(n => `../assets/icons/stars/blue${n}.png`);
	// let list2 = range(1, 9).map(n => `../assets/icons/stars/blu${n}.png`);
	// let list3 = range(1, 9).map(n => `../assets/icons/stars/new${n}.png`);
	// let list = list1.concat(list2, list3);
	//list = [`../assets/icons/stars/blue${3}.png`,`../assets/icons/stars/new${3}.png`]
	let starImages = await preloadImages(list); //console.log('starImages', starImages);
	M.starImages = starImages;
	return starImages;
}



