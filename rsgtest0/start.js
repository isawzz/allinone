onload = start; function start() { test0(); }

async function test0() {
	await loadAssetsStatic();
	//const galleryElement = document.getElementById('galleryRoot');
	let elems = mLayoutLM('dPage'); mStyle('dMain', { overy: 'auto' }); mCenterFlex('dMain');
	let dLeft = mBy('dLeft');
	let family = "'Noto Sans', sans-serif"; // "Arial Unicode MS"; //'"Segoe UI", "DejaVu Sans", "Arial Unicode MS", sans-serif'
	let styles = { family, fz: 48, sz: 100, bg: 'white', fg: 'black' };

	// let dParent = mDom('dMain', { display: 'flex', wrap: true, w:500 }, { id: "table", });
	let dParent = mDom('dMain', { display: 'flex', wrap: true, w100: true, box: true }, { id: "table", });

	const sampleItems = M.byCollection.emo.map(x => M.superdi[x]); console.log('sampleItems', sampleItems);
	for (let i = 0; i < sampleItems.length; i++) sampleItems[i].key = M.byCollection.emo[i];
	console.log(sampleItems[0])


	displayImageGallery(dParent, sampleItems, {sz:100}, {showLabels:true, prefer:'img'});
}

