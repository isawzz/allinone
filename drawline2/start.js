
onload = start;
async function start() { await loadAssets(); await test32(); }

async function test32() {
	let [w, h, sz, margin, n, neach] = [900, 600, 20, 30, 49, 7];
	DA.sz = sz;
	let points = DA.points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); //console.log(jsCopy(points[0]));
	let d = clearDiv();
	let dParent = DA.dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' }, { id: 'dCanvas' });
	Items = drawPoints(dParent, points); //console.log(Items)
	DA.meeples = [];

	lacunaStartMove();
}
function showPairs(pairlist) {
	let s='';
	for(const pair of pairlist){
		s+=`${pair[0].id},${pair[1].id} `; //pair[0].id+','+pair[1].id;
	}
	return s;
}
function lacunaStartMove() {
	let t = getNow();
	DA = { meeples: DA.meeples, dParent: DA.dParent, points: DA.points, sz: DA.sz };

	let [points, dParent, sz] = [DA.points, DA.dParent, DA.sz];
	let result = findIsolatedPairs(points, sz); //console.log(result);

	console.log('isolated', showPairs(result.isolatedPairs), result.isolatedPairs.length);
	let isolated = DA.isolatedPairs = filterIsolatedPairs(result.isolatedPairs, DA.meeples,15);
	console.log('isolated', showPairs(isolated), isolated.length);

	let [hotspots, linesByPair] = generateHotspots(dParent, isolated, sz, 'transparent');
	DA.pairs = linesByPair; //console.log(DA.pairs)
	DA.hotspotList = hotspots;
	DA.hotspotDict = list2dict(hotspots, 'id');

	dParent.onmousemove = highlightHotspots;
	dParent.onclick = placeYourMeeple;
	t = showTimeSince(t, 'move')
}

async function test31_perftest() {
	let ms0 = 0; let ms1 = 0;
	let t = getNow(); let ms;
	for (const i of range(10)) {
		test31_nooutput(generateHotspots);
	}
	t = showTimeSince(t, 'bessere')
	for (const i of range(10)) {
		test31_nooutput(generateHotspotsNOY);
	}
	showTimeSince(t, 'bessere')
}
async function test31_nooutput(hotspotFunc) {
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 49, 7];
	DA.sz = sz;
	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); //console.log(jsCopy(points[0]));
	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, w, h, sz, points, n, neach };
	let result = findIsolatedPairs(points, sz / 1.5); //console.log(result);
	let [hotspots, linesByPair] = hotspotFunc(dParent, result.isolatedPairs, sz, 'green');
	DA.pairs = linesByPair;
	DA.hotspotDict = list2dict(hotspots, 'id');
}
async function test31(hotspotFunc) {
	let t = getNow(); let ms;
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 49, 7];
	DA.sz = sz;
	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); console.log(jsCopy(points[0]));
	let d = clearDiv();
	t = showTimeSince(t, 'generate points')
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)
	t = showTimeSince(t, 'draw points')
	let info = DA.info = { dParent, w, h, sz, points, n, neach };
	let result = findIsolatedPairs(points, sz / 1.5); console.log(result);
	t = showTimeSince(t, 'findIsolatedPairs');
	console.log(result.isolatedPairs)
	let [hotspots, linesByPair] = hotspotFunc(dParent, result.isolatedPairs, sz, 'green');
	t = showTimeSince(t, 'generateHotSpots')
	DA.pairs = linesByPair;
	DA.hotspotDict = list2dict(hotspots, 'id'); console.log(DA.hotspotDict);
	t = showTimeSince(t);
	dParent.onclick = highlightHotspots;
}
async function test30() {
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 49, 7];
	DA.sz = sz;
	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); console.log(jsCopy(points[0]));
	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, w, h, sz, points, n, neach };
	let result = findIsolatedPairs(points, sz / 1.5); console.log(result);
	let [hotspots, linesByPair] = generateHotspots(dParent, points, result, sz); DA.pairs = linesByPair;
	DA.hotspotDict = list2dict(hotspots, 'id');

	for (const p of hotspots) {
		let d = p.div;
		d.onmouseover = ev => lacunaHighlightEndpoints(ev, p)
		d.onmouseout = ev => lacunaUnHighlightEndpoints(ev, p)
		d.onclick = ev => placeMaxerlHere(ev);
	}

	dParent.onclick = placeMaxerlHere;

	mButton('activateHotspots', () => DA.hotspotsActive = true, d);
	DA.hotspotsActive = true

}
async function test29() {
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 49, 7];
	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); console.log(jsCopy(points[0]));
	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, w, h, sz, points, n, neach };
	let result = findIsolatedPairs(points, sz); console.log(result);
	let hotspots = [];
	let linesByPair = {};
	for (const pair of result.isolatedPairs) {
		let ids = pair.map(x => x.id); //split(',');
		let key = ids.join(',');
		let line = getEquidistantPoints(Items[ids[0]], Items[ids[1]], sz / 2);
		for (const p of line) {
			p.bg = 'red';
			p.sz = sz;
			p.start = ids[0];
			p.end = ids[1];
			p.id = getUID();
			p.pairs = [key];
			hotspots.push(p);
			//console.log(p)

		}
		linesByPair[key] = line;
		//line.map(x=>hotspots.push({p1:ids[0],p2:ids[1],p:x));
	}
	// console.log('hotspots',hotspots);
	DA.hotspots = drawPoints(dParent, hotspots);
	console.log(DA.hotspots);

	for (const p1 of hotspots) {
		for (const p2 of hotspots) {
			let dist = getDistanceBetweenPoints(p1, p2);
			if (dist < sz / 3) {
				if (p1.start == p2.start && p1.end == p2.end) continue; //console.log(p1,p2,dist,=)
				if (p1.start == p2.end && p1.end == p2.start) continue; //console.log(p1,p2,dist,=)
				let newlist = new Set(p1.pairs.concat(p2.pairs));
				p1.pairs = Array.from(newlist);
				p2.pairs = Array.from(newlist);
				p1.bg = 'blue'; mStyle(p1.div, { bg: 'blue' });
				p2.bg = 'blue'; mStyle(p2.div, { bg: 'blue' });
			}
		}
	}

	for (const p of hotspots) {
		let d = p.div;
		d.onclick = ev => lacunaHighlightEndpoints(ev, p, hotspots)
	}

	DA.hotspotsActive = true;
}
async function test28() {
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 49, 7];
	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); console.log(jsCopy(points[0]));
	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, w, h, sz, points, n, neach };
	let result = findIsolatedPairs(points, sz); console.log(result);
	let hotspots = [];
	for (const pair of result.isolatedPairs) {
		let ids = pair.map(x => x.id); //split(',');
		let line = getEquidistantPoints(Items[ids[0]], Items[ids[1]], sz / 2);
		line.map(x => hotspots.push(x));
	}

	hotspots.map(x => { x.sz = sz; x.bg = 'red'; x.id = getUID() });
	console.log('hotspots', hotspots);
	DA.hotspots = drawPoints(dParent, hotspots);
	console.log(DA.hotspots);

}
async function test27() {
	let p1 = { x: 0, y: 0, bg: '#06D6A0', sz: 20, id: getUID() };
	let p2 = { x: 100, y: 100, bg: '#06D6A0', sz: 20, id: getUID() };
	let points = getEquidistantPoints(p1, p2, 10);
	console.log(points);

	for (const p of points) { p.bg = 'blue'; p.sz = 20; p.id = getUID(); }

	// points.push(p1);
	// points.push(p2);

	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 9, 3];
	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	Items = drawPoints(dParent, points); //console.log(Items)

	for (const p of points) {
		let div = p.div;
		div.onclick = () => { div.remove(); points = points.filter(x => x.id != p.id) }
	}

}
async function test26() {
	let [w, h, sz, margin, n, neach] = [700, 400, 20, 30, 9, 3];

	let points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); console.log(jsCopy(points[0]));

	let d = clearDiv();
	let dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' });
	//console.log(dParent);

	Items = drawPoints(dParent, points); //console.log(Items)
	let info = DA.info = { dParent, w, h, sz, points, n, neach };

	// for (let i = 0; i < 2; i++) {
	// 	await mSleep(2000);
	// 	mStyle(dParent,{margin:rNumber(10,50)});
	// 	drawPoints(dParent, points);console.log(points[0]);
	// }

	let result = findIsolatedPairs(points, sz); //console.log(result);

}
async function test25_mArea() {
	let [w, h, sz] = [600, 400, 20];
	let d = clearDiv(); mClear(d); mStyle(d, { margin: rNumber(10, 50) });
	let [dParent, cv] = mArea(0, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });

}
async function test24() {
	let [w, h, sz] = [900, 400, 20];
	let points = lacunaGeneratePoints(w, h, 6, 3, sz, .6); console.log(jsCopy(points[0]));

	let d = clearDiv();
	points = laDrawPoints(d, points, w, h, sz); console.log(points[0]);

	for (let i = 0; i < 10; i++) {
		await mSleep(2000);
		points = laDrawPoints(d, points, w, h, sz); console.log(points[0]);
	}

	//hier hab ich schon DA.info!
	let result = findIsolatedPairs(points, sz); //console.log(result);


	//lacunaPresent1(points,w,h,sz);

}
async function test23() {
	let [w, h, sz] = [900, 400, 20];
	let points = lacunaGeneratePoints(w, h, 6, 3, sz, .6);
	console.log(points[0]);

	lacunaPresent1(points, w, h, sz);

}
async function test22() {
	lacunaPresent();
}
async function test21_pairs() {
	let d = clearDiv();
	let [w, h, sz] = [900, 400, 20];
	let [dParent, cv] = mArea(10, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });

	let points = mLacunaCirles(dParent, 49, 7, sz, .6); console.log(points); return;

	Items = drawPoints(dParent, points); //console.log(Items)

	//console.log(points[0], Items[points[0].id]);
	dParent.onclick = ev => { for (const el of arrChildren(dParent)) { mRemove(el); } DA.points = arrTake(DA.points, DA.points.length - 2); Items = drawPoints(dParent, DA.points); }

	DA.info = { dParent, cv, w, h, sz, points };
	lacunaCalculate();
}
async function test20() {
	let d = clearDiv();
	let [w, h, dx, dy, sz] = [900, 400, 50, 120, 20];
	let [dParent, cv] = mArea(10, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	let points = mLacunaCirles(dParent, 49, 7, sz, .6);
	Items = drawPoints(dParent, points); console.log(Items)
	let result = findIsolatedPairs(points, sz); //console.log(result);
	let pixelsByPair = [];
	let di = {};
	let allPixels = [];
	for (const pair of result.isolatedPairs) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		[x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => x + sz / 2);
		let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		//pixelsByPair.push({ x1, y1, x2, y2, p1, p2, pixels }); //console.log('pixels', pixels);

		for (const pix of pixels) {
			allPixels.push(pix);
			let key = getPixelKey(pix);
			let l = lookup(di, [key]);
			lookupAddIfToList(di, [key], p1.id)
			lookupAddIfToList(di, [key], p2.id)
			//if (l) console.log(pix.x,pix.y,lookup(di, [key]));
		}

		drawLineOnCanvas(cv, x1, y1, x2, y2, 2);
	}

	let di1 = clusterize(di); //console.log(di1,Object.keys(di1)); return;

	//console.log(di);
	alertOnPointHover(dParent, di1);
	alertOnPointClick(dParent, di1);

}
async function test19() {
	let d = clearDiv();
	let [w, h, dx, dy, sz] = [900, 400, 50, 120, 20];
	let [dParent, cv] = mArea(10, d, { w, h, bg: '#eee' }); //mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	let points = mLacunaCirles(dParent, 6, 3, sz, .6);
	Items = drawPoints(dParent, points);
	let result = findIsolatedPairs(points, sz); //console.log(result);
	let pixelsByPair = [];
	let di = {};
	let allPixels = [];
	for (const pair of result.isolatedPairs) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		[x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => x + sz / 2);
		let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		//pixelsByPair.push({ x1, y1, x2, y2, p1, p2, pixels }); //console.log('pixels', pixels);

		for (const pix of pixels) {
			allPixels.push(pix);
			let l = lookup(di, [pix.x, pix.y]);
			lookupAddIfToList(di, [pix.x, pix.y], p1.id)
			lookupAddIfToList(di, [pix.x, pix.y], p2.id)
			if (l) console.log(pix.x, pix.y, lookup(di, [pix.x, pix.y]));
		}

		drawLineOnCanvas(cv, x1, y1, x2, y2, 2);
	}

	//console.log(di);
	alertOnPointHover(dParent, di);
	return { d, cv, points, pixelsByPair, isolatedPairs: result.isolatedPairs, obstaclePairs: result.obstaclePairs };

}
async function test18() {
	let d = clearDiv();
	let [w, h, dx, dy, sz] = [800, 400, 50, 120, 30];
	let dParent = mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	let points = mLacunaCirles(dParent, 4, 2, sz);
	Items = drawPoints(dParent, points)
	let result = findIsolatedPairs(points, 10); console.log(result);
	//console.log(result);
	return;
	let pixelsByPair = [];
	for (const pair of result.isolatedPairs) {

		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		pixelsByPair.push({ x1, y1, x2, y2, p1, p2, pixels }); //console.log('pixels', pixels);
		drawLineOnCanvas(cv, x1, y1, x2, y2, 2);
	}
	return { d, cv, points, pixelsByPair, isolatedPairs: result.isolatedPairs, obstaclePairs: result.obstaclePairs };

}
async function test17_simple() {
	var counter = 0;
	function drawFullLine(o1, o2, height, color) {
		let [p1, p2] = [o1.center, o2.center];
		const line = document.createElement('div');// mDom(d);

		// Calculate the distance and angle between the points
		const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
		const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

		// Style the line
		line.style.position = 'absolute';
		line.style.transformOrigin = '0 0';
		line.style.transform = `rotate(${angle}deg)`;
		line.style.height = `${height}px`; //'2px';
		//line.style.border = 'solid black 11px';
		line.style.width = `${distance}px`;
		line.style.backgroundColor = color;
		line.style.left = `${p1.x}px`;
		line.style.top = `${p1.y}px`;
		line.setAttribute('endpoints', `${o1.div.id},${o2.div.id}`);

		// Add mouseover event
		line.addEventListener('mouseover', () => {
			// line.style.backgroundColor = 'red';
			console.log('mouseover', counter++);
			let endpoints = line.getAttribute('endpoints');//console.log(endpoints);
			let ep = endpoints.split(',');
			//console.log(ep);
			for (let i = 0; i < ep.length; i++) {
				let id = ep[i];
				mStyle(id, { rounding: 0 });
				//mBy(ep[i]).style.backgroundColor = 'red';
			}
		});

		line.addEventListener('mouseout', () => {
			console.log('OUT', counter++);
			let endpoints = line.getAttribute('endpoints');//console.log(endpoints);
			let ep = endpoints.split(',');
			//console.log(ep);
			for (let i = 0; i < ep.length; i++) {
				let id = ep[i];
				mStyle(id, { rounding: '50%' });
				//mBy(id).style.backgroundColor = Items[id].bg;

			}
			// line.style.backgroundColor = color;
		});

		// Append the line to the body or a specific container
		document.body.appendChild(line);

		return line;
	}
	let d = clearDiv();
	let [w, h, dx, dy, sz] = [800, 400, 50, 120, 30];
	let dParent = mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	let points = mLacunaCirles(dParent, 4, 2, sz);

	for (const p of points) {
		let d1 = p.div = mDom(dParent, { left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg }, { id: getUID() });
		let p1 = getRect(d1); p1.x += sz / 2;//p1.y+=sz/2; 
		p.center = p1;
		Items[d1.id] = p;
	}
	for (let i = 0; i < points.length - 1; i++) {
		for (let j = i + 1; j < points.length; j++) {
			// let p1=//{x:x1,y:y1};
			// let p2=getRect(points[j].div); p2.x+=sz/2;p2.y+=sz/2 //{x:x2,y:y2};
			drawFullLine(points[i], points[j], sz, 'black'); //getCenter(divs[i],dParent), getCenter(divs[j],dParent));
			console.log(points[i]);//return;
		}

	}
	//let result=findPairsByProp(points,'bg'); console.log(result); //return;
}
async function test16_simple() {
	let d = clearDiv();
	let [w, h, dx, dy, sz] = [800, 400, 50, 20, 30];
	let dParent = mDom(d, { w, h, position: 'absolute', left: dx, top: dy, bg: 'yellow' });
	let points = mLacunaCirles(dParent, 4, 2, sz);

	let divs = [];
	for (const p of points) {
		let d1 = mDom(dParent, { left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg });
		divs.push(d1);
	}
	for (let i = 0; i < divs.length - 1; i++) {
		for (let j = i + 1; j < divs.length; j++) {
			let p1 = getRect(divs[i]); p1.x += sz / 2; p1.y += sz / 2//{x:x1,y:y1};
			let p2 = getRect(divs[j]); p2.x += sz / 2; p2.y += sz / 2 //{x:x2,y:y2};
			drawInteractiveLine(dParent, p1, p2); //getCenter(divs[i],dParent), getCenter(divs[j],dParent));
		}

	}
	//let result=findPairsByProp(points,'bg'); console.log(result); //return;
}
function muell() {
	let buck = groupByProperty(points, 'bg'); console.log(buck);
	let result = findPairsByProp(points, 'bg'); console.log(result); //return;
	for (const pair of result) {
		let [p1, p2] = [pair[0], pair[1]];
		// let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		//let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		//pixelsByPair.push({x1,y1,x2,y2,p1,p2,pixels}); //console.log('pixels', pixels);
		drawInteractiveLine(d, getCenter(p1.div), getCenter(p2.div)); return;
	}
}
async function test15_simple() {
	let d = clearDiv();
	let [w, h] = [800, 400];
	let dParent = mDom(d, { w, h, position: 'absolute', left: 20, top: 20, bg: 'yellow' });
	let d1 = mDom(dParent, { left: 10, top: 10, w: 20, h: 20, position: 'absolute', bg: 'red' });
	let d2 = mDom(dParent, { left: 100, top: 100, w: 20, h: 20, position: 'absolute', bg: 'blue' });

	let p1 = getCenter(d1, d), p2 = getCenter(d2, d); //p1={x:0,y:0},p2={x:100,y:100};
	console.log(p1, p2);
	// Draw the interactive line
	drawInteractiveLine(dParent, p1, p2);
}
async function test14_simple() {
	let d0 = document.body; d0.innerHTML = ''; mStyle(d0, { padding: 0, margin: 0, position: 'relative' });

	//let d=mDiv(d0)
	//mIfNotRelative(d);
	let d = d0;
	let dParent = mDom(d, { w: 400, h: 400, position: 'absolute', left: 10, top: 100 });
	let d1 = mDom(dParent, { left: 0, top: 0, w: 20, h: 20, position: 'absolute', bg: 'red' });
	let d2 = mDom(dParent, { left: 100, top: 100, w: 20, h: 20, position: 'absolute', bg: 'blue' });

	let p1 = getCenter(d1, d), p2 = getCenter(d2, d); //p1={x:0,y:0},p2={x:100,y:100};
	console.log(p1, p2)
	// Draw the interactive line
	drawInteractiveLine(dParent, p1, p2);
}
async function test13_linediv() {
	let [w, h] = [800, 400];
	let { d, points } = lacunaCirclesDiv(w, h, 4, 2, 20);
	console.log(d);
	let result = findPairsByProp(points, 'bg'); console.log(result); //return;
	//let pixelsByPair = [];
	for (const pair of result) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		//let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		//pixelsByPair.push({x1,y1,x2,y2,p1,p2,pixels}); //console.log('pixels', pixels);
		drawInteractiveLine(d, p1, p2);
	}
}
async function test12_lines() {
	let { d, cv, points, pixelsByPair, isolatedPairs, obstaclePairs } = await test11_lines();
	console.log(pixelsByPair);

	//d.onmousemove=ev=>testMouseMove(ev, pixelsByPair);
}
async function test11_lines() {
	let [w, h] = [800, 400];
	let [x, y] = [w / 2, h / 2];
	let { d, cv, points } = lacunaCircles(w, h, 49, 7, 20);
	let result = findIsolatedPairs(points, 10);
	//console.log(result);
	let pixelsByPair = [];
	for (const pair of result.isolatedPairs) {

		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		let pixels = getLinePixels(x1, y1, x2, y2); //console.log('pixels', pixels);
		pixelsByPair.push({ x1, y1, x2, y2, p1, p2, pixels }); //console.log('pixels', pixels);
		drawLineOnCanvas(cv, x1, y1, x2, y2, 2);
	}
	return { d, cv, points, pixelsByPair, isolatedPairs: result.isolatedPairs, obstaclePairs: result.obstaclePairs };
}
async function test10_lines() {
	let [w, h] = [800, 400];
	let [x, y] = [w / 2, h / 2];
	let { d, cv, points } = lacunaCircles(w, h);
	drawEllipseOnCanvas(cv, x, y, 20, 20, 'violet');
	let buck = groupByProperty(points, 'bg');
	let list = buck.find(x => x[0].bg === "#06D6A0");
	let result = findClosePairs(list, x, y, 10);
	console.log('result', result);
	for (const pair of result) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		let pixels = getLinePixels(x1, y1, x2, y2);
		drawLineOnCanvas(cv, x1, y1, x2, y2, 2); console.log('pixels', pixels);
	}
}
async function test9_ellipse() {
	let d = clearFlex();
	let [w, h, n, neach, rand] = [500, 500, 49, 7, .8];
	let [d1, cv1] = mArea(30, d, { w, h, bg: '#eee', position: 'relative' });
	drawEllipseOnCanvas(cv1, 100, 100, 200, 200, 'violet');
}
async function test9_bufferZone() {
	let d = clearFlex();
	let [w, h, n, neach, rand] = [500, 500, 49, 7, .8];
	let [d1, cv1] = mArea(30, d, { w, h, bg: '#eee', position: 'relative' });
	let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
	clist = Object.values(clist);
	let points1 = generateRandomPointsRect(n, w, h, rand);
	let colors = generateRepeatedColors(n, neach, clist);
	arrShuffle(colors);
	for (let i = 0; i < n; i++) { points1[i].bg = colors[i]; points1[i].sz = 20; }
	for (const p of points1) {
		drawCircleOnCanvas(cv1, p.x, p.y, p.sz, p.bg);
	}
	//build buckets of points of same color
	let buck1 = groupByProperty(points1, 'bg');

	let pCenter = { x: 200, y: 200 };
	drawCircleOnCanvas(cv1, pCenter.x, pCenter.y, 20, 'black');

	let result = findClosePairs(buck1[0], 200, 200, 10);
	console.log('result', result);
	for (const pair of result) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		let pixels = getLinePixels(x1, y1, x2, y2);
		drawLineOnCanvas(cv1, x1, y1, x2, y2, 2); console.log('pixels', pixels); return;

	}
	return;

	for (const pts of buck1) {
		for (let i = 0; i < pts.length - 1; i++) {
			for (let j = i + 1; j < pts.length; j++) {
				let [p1, p2] = [pts[i], pts[j]];
				let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
				let pixels = getLinePixels(x1, y1, x2, y2);
				drawLineOnCanvas(cv1, x1, y1, x2, y2, 2); console.log('pixels', pixels); return;
			}
		}
		return;
	}
}
async function test8_bufferZone() {
	let d = clearFlex();
	let [w, h, n, neach, rand] = [500, 500, 49, 7, .8];
	let [d1, cv1] = mArea(30, d, { w, h, bg: '#eee', position: 'relative' });
	let [d2, cv2] = mArea(30, d, { w, h, bg: '#ddd', position: 'relative' });
	let clist = { "Red": "#E63946", "Green": "#06D6A0", "Blue": "#118AB2", "Cyan": "#0F4C75", "Magenta": "#D81159", "Yellow": "#FFD166", "Orange": "#F4A261", "Purple": "#9D4EDD", "Pink": "#FF80AB", "Brown": "#8D6E63", "Lime": "#A7FF83", "Indigo": "#3A0CA3", "Violet": "#B5838D", "Gold": "#F5C518", "Teal": "#008080" };
	clist = Object.values(clist);
	let points1 = generateRandomPointsRect(n, w, h, rand);
	let points2 = generateRandomPointsRound(n, w, h, rand);
	let colors = generateRepeatedColors(n, neach, clist);
	arrShuffle(colors);
	for (let i = 0; i < n; i++) {
		points1[i].bg = points2[i].bg = colors[i];
		points1[i].sz = points2[i].sz = 20;
	}
	//drawPoints(d1, points1);
	for (const p of points1) {
		drawCircleOnCanvas(cv1, p.x, p.y, p.sz / 2, p.bg);
	}
	drawPoints(d2, points2);

	//build buckets of points of same color
	let buck1 = groupByProperty(points1, 'bg');
	let buck2 = groupByProperty(points2, 'bg');

	let pCenter = { x: 200, y: 200 };
	drawCircleOnCanvas(cv1, pCenter.x, pCenter.y, 20, 'black');

	let result = findClosePairs(buck1[0], 200, 200, 10);
	console.log('result', result);
	for (const pair of result) {
		let [p1, p2] = [pair[0], pair[1]];
		let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
		let pixels = getLinePixels(x1, y1, x2, y2);
		drawLineOnCanvas(cv1, x1, y1, x2, y2, 2); console.log('pixels', pixels); return;

	}
	return;

	for (const pts of buck1) {
		for (let i = 0; i < pts.length - 1; i++) {
			for (let j = i + 1; j < pts.length; j++) {
				let [p1, p2] = [pts[i], pts[j]];
				let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
				let pixels = getLinePixels(x1, y1, x2, y2);
				drawLineOnCanvas(cv1, x1, y1, x2, y2, 2); console.log('pixels', pixels); return;
			}
		}
		return;
	}
}
async function test7() {
	let d = clearFlex();
	let [w, h, n, neach, rand] = [500, 500, 49, 7, .8];
	let d1 = mDom(d, { w, h, bg: '#eee', position: 'relative' });
	let d2 = mDom(d, { w, h, bg: '#ddd', position: 'relative' });
	let clist = { "Red": "#E63946", "Green": "#06D6A0", "Blue": "#118AB2", "Cyan": "#0F4C75", "Magenta": "#D81159", "Yellow": "#FFD166", "Orange": "#F4A261", "Purple": "#9D4EDD", "Pink": "#FF80AB", "Brown": "#8D6E63", "Lime": "#A7FF83", "Indigo": "#3A0CA3", "Violet": "#B5838D", "Gold": "#F5C518", "Teal": "#008080" };
	clist = Object.values(clist);
	let points1 = generateRandomPointsRect(n, w, h, rand);
	let points2 = generateRandomPointsRound(n, w, h, rand);
	let colors = generateRepeatedColors(n, neach, clist);
	arrShuffle(colors);
	for (let i = 0; i < n; i++) {
		points1[i].bg = points2[i].bg = colors[i];
		points1[i].sz = points2[i].sz = 20;
	}
	drawPoints(d1, points1);
	drawPoints(d2, points2);
}
function test0_starter() {
	let [w, h, n] = [800, 800, 2];
	mStyle(document.body, { padding: 0, margin: 10 });
	mStyle('container', { position: 'relative', w, h, bg: '#eee' });
}
async function test6() {
	test0_starter();
	let dParent = mBy('container');
	let [w, h, n, neach] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h'), 49, 7];
	let clist = { "Red": "#E63946", "Green": "#06D6A0", "Blue": "#118AB2", "Cyan": "#0F4C75", "Magenta": "#D81159", "Yellow": "#FFD166", "Orange": "#F4A261", "Purple": "#9D4EDD", "Pink": "#FF80AB", "Brown": "#8D6E63", "Lime": "#A7FF83", "Indigo": "#3A0CA3", "Violet": "#B5838D", "Gold": "#F5C518", "Teal": "#008080" };
	clist = Object.values(clist)
	let points = generateRandomPointsRect(n, w, h, .8);
	let colors = generateRepeatedColors(n, neach, clist);
	arrShuffle(colors)
	for (let i = 0; i < n; i++) {
		points[i].bg = colors[i];
		points[i].sz = 20;
	}
	drawPoints(dParent, points);
}
async function test5() {
	test0_starter();
	let dParent = mBy('container');
	let [w, h] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h')];
	let points = generateRandomPointsRect(25, w, h, .8);
	drawPoints(dParent, points);
}
async function test4() {
	test0_starter();
	let dParent = mBy('container');
	let [w, h] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h')];
	let points = generateRandomPoints(25, w, h);
	drawPoints(dParent, points);
}
async function test3() {
	let [w, h] = [400, 300];
	let dParent = mDom('container', { bg: '#ddd', w, h });
	let points = generateRandomPoints(25, w, h);
	drawPoints(dParent, points);
}
async function test2() {
	DA.circles = placeCirclesRandom('container', 70, 20, 'green', .15);
}
async function test1() {
	DA.circles = placeCircles('container', 25, 20, 'green');
}
async function test0() {
	let c = placeCircle('container', 5, 5, 10, 'red'); console.log(c, getCenter(c.div));
}
