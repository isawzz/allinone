
function lacunaPresent1(points, w, h, sz) {
	let d = clearDiv();
	let [dParent, cv] = mArea(10, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, cv, w, h, sz, points };

	let result = findIsolatedPairs(points, sz); //console.log(result);
	let di = {};
	let allPixels = [];
	for (const pair of result.isolatedPairs) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		[x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => x + sz / 2);
		let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		for (const pix of pixels) {
			allPixels.push(pix);
			let key = getPixelKey(pix);
			let l = lookup(di, [key]);
			lookupAddIfToList(di, [key], `${p1.id},${p2.id}`)
		}
		drawLineOnCanvas(cv, x1, y1, x2, y2, 2);
	}
	let di1 = DA.info.di = clusterize(di, 10);	//console.log(Object.keys(di1).length); //return;
	dParent.onmousemove = alertOnPointHoverPairHandler;
	dParent.onclick = alertOnPointClickPairHandler;
}
function laDrawPoints(d, points, w, h, sz) {
	mClear(d); mStyle(d, { margin: rNumber(10, 50) });
	let [dParent, cv] = mArea(0, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, cv, w, h, sz, points };
	return points;
}
function lacunaSelectPoint(div, divs) {
	console.log('click!!!',div.id);
	let id = div.id;
	let list = lookupAddIfToList(DA,['selectedPairIds'],id); console.log(list);
	if (list.length == 2) {
		lacunaRemovePair(list.join(','));
	} else {
		console.log('select another point')
	}
}
function lacunaRemovePair(pair) {
	let { dParent, cv, w, h, sz, points } = DA.info;

	let ids = pair.split(',');
	for (const id of ids) {
		let o = Items[id];//remove the div
		o.div.remove();
		points = points.filter(x => x.id != id);//remove from points
		delete Items[id];//remove from items
	}

	mRemove(cv);
	mRemove(dParent);

	lacunaPresent1(points, w, h, sz);
}
function lacunaHighlightEndpoints(ev, p) {
	//console.log('___click',p.x,p.y);
	//console.log(p.pairs);
	if (!DA.hotspotsActive) return;
	for (const pair of p.pairs) {
		//highlight the end points corresponding to this pair
		let [pStart, pEnd] = pair.split(',').map(x => mBy(x));
		mClass(pStart, 'pulseFastInfinite');
		mClass(pEnd, 'pulseFastInfinite');
		//pStart.div.onclick = ev => lacunaSelectPair(ev, p.pairs, pStart)
		//pEnd.div.onclick = ev => lacunaSelectPair(ev, p.pairs, pEnd)
	}
}
function lacunaUnHighlightEndpoints(ev, p) {
	//console.log('___click',p.x,p.y);
	//console.log(p.pairs);
	if (!DA.hotspotsActive) return;
	for (const pair of p.pairs) {
		//highlight the end points corresponding to this pair
		let [pstart, pend] = pair.split(',').map(x => mBy(x));
		mClassRemove(pstart, 'pulseFastInfinite');
		mClassRemove(pend, 'pulseFastInfinite');
	}
}
function placeCircleHere(ev,endpoints) {
	if (!DA.hotspotsActive) return;
	DA.hotspotsActive = false;

	let p = null, d = null, x = 0, y = 0;
	evNoBubble(ev);
	if (isdef(DA.hotspotDict[ev.target.id])) {
		p = DA.hotspotDict[ev.target.id];
		d = p.div.parentNode;
		x = ev.clientX - d.offsetLeft - DA.sz / 2;;
		y = ev.clientY - d.offsetTop - DA.sz / 2;;
	} else {
		d = ev.target;
		x = ev.clientX - d.offsetLeft - DA.sz / 2;
		y = ev.clientY - d.offsetTop - DA.sz / 2;
	}

	console.log('placeMaxerlHere:', x, y)
	if (isdef(Items[d.id])) {
		p = Items[d.id];
		d = d.parentNode;
		x -= d.OffsetLeft;
		y -= d.OffsetTop;
	}
	console.log('set maxerl:', x, y, d)
	drawPoints(d, [{ x, y, sz: 20, bg: 'red', id: getUID() }]);

	let eps = Array.from(document.getElementsByClassName('pulseFastInfinite')); console.log(eps);

	if (isEmpty(eps)) return;
	//showMessage('click on an endpoint');
	for(const ep of eps) {
		ep.onclick = ev => lacunaSelectPoint(ep, eps);
		//mClassRemove(ep, 'pulseFastInfinite');
		//mStyle(ep,{border:'5px solid red'});
		//mClass(ep,'cursorGrab');
		ep.style.cursor='grab';
		//mStyle(ep, {cursor:'hand !important'});
		console.log('ep',ep)
	}
	//hier muss alle pulseFastInfinite entfernt werden.
	//eps.map(x=>mClassRemove(x, 'pulseFastInfinite'));

	//jetzt muessen die mouse events deactivated werden!


}

