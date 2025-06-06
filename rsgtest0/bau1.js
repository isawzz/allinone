
function mSizeSuccession(styles = {}, szDefault = 100, fromWidth = true) {
	let [w, h] = [styles.w, styles.h];
	if (fromWidth) {
		w = valf(w, styles.sz, h, szDefault);
		h = valf(h, styles.sz, w, szDefault);
	} else {
		h = valf(h, styles.sz, w, szDefault);
		w = valf(w, styles.sz, h, szDefault);
	}
	return [w, h];
}

function displayImageGallery(dParent, items, styles = {}, opts = {}) {
	mClear(dParent);

	let [w, h] = mSizeSuccession(styles); console.log(w, h)
	let dGrid = mDom(dParent, { display: 'flex', wrap: true, gap: 10, w100: true, box: true, bg: 'red', padding: 10 });


	for (const o of items) {
		const cell = mDom(dGrid, { display: 'grid', box: true, w, h, padding: 4, rounding: 4, border: '2px solid pink' }); // {...styles, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' });

		const dImg = mDom(cell, { display: 'grid', justifyContent: 'center' });

		let el = null;

		let srcPath = null;
		let type = valf(opts.prefer, isdef(o.img) ? o.img : isdef(o.text) ? o.text : 'plain');
		if (type == 'img' && isdef(o.img)) srcPath = o.img;
		else if (type == 'photo' && isdef(o.photo)) srcPath = o.photo;
		else srcPath = null;

		let symbolBaseStyle = {};
		let labelStyles = { align: 'center', className: 'ellipsis' };
		if (srcPath) {
			el = mDom(dImg, { 'object-fit': 'cover' }, { tag: 'img', src: srcPath, alt: o.friendly || o.key || 'image' });
		} else if (o.text) {
			let family = o.colls.includes('unicode') ? "'Noto Sans', sans-serif" : 'emoNoto'; // "Arial Unicode MS"; //'"Segoe UI", "DejaVu Sans", "Arial Unicode MS", sans-serif'
			el = mDom(dImg, { family }, { html: o.text });
		} else if (o.fa6) {
			el = mDom(dImg, { ...symbolBaseStyle, fontFamily: 'fa6' }, { html: String.fromCharCode('0x' + o.fa6) });
		} else if (o.fa) {
			el = mDom(dImg, { ...symbolBaseStyle, fontFamily: 'pictoFa' }, { html: String.fromCharCode('0x' + o.fa) });
		} else if (o.ga) {
			el = mDom(dImg, { ...symbolBaseStyle, fontFamily: 'pictoGame' }, { html: String.fromCharCode('0x' + o.ga) });
		} else {
			el = mDom(dImg, { ...symbolBaseStyle, fontSize: styles.imageHeight * 0.2 }, { html: o.friendly || o.key || 'N/A' });
		}

		if (opts.showLabels && o.key) {
			mLinebreak(cell);
			const label = mDom(cell, labelStyles, { html: o.key });
			// mStyle(label, {width: '100%'}); // Already handled by ellipsis class and cell flex props
		}

		if (styles.onClickImage && typeof styles.onClickImage === 'function') {
			cell.style.cursor = 'pointer';
			cell.onclick = (ev) => styles.onClickImage(o, ev);
		}
	}
}



async function showCollection(key, d, styles = {}, opts = {}) {
	mClear(d);
	mClass(d, 'symbolContainer');
	mDom(d, { className: 'symbol' }, { html: '<div class="symbol">&#x2718;</div>' });
	mStyle(document.body, { className: 'symbolContainer' })

	for (const k of M.byCollection[key]) {
		let sym = M.superdi[k];
		let d1 = mDom(d, { margin: 10 });
		//mDom(d1,{},{tag:'pre',html:sym.text});
		mDom(d1, { className: 'symbol' }, { html: `<div class="symbol">${sym.text}</div>` }); //sym.text
		let dimg = await mKey(k, d1, styles, opts);
		let dlabel = mDom(d1, { align: 'center', fz: 12, bg: 'yellow', fg: 'black' }, { html: k });
	}
}