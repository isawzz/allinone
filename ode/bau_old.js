
function filterIsolatedPairs(pairs, blockers, threshold = 10) {
	//console.log(pairs, blockers);
	let newPairs = [];
	for (const pair of pairs) {
		const [ax, ay] = [pair[0].x, pair[0].y];
		const [bx, by] = [pair[1].x, pair[1].y];
		let isIsolated = true;
		for (const blocker of blockers) {
			const [px, py] = [blocker.x, blocker.y];
			const distance = pointToLineDistance(px, py, ax, ay, bx, by);
			if (distance < threshold) {
				isIsolated = false;
				break;
			}
		}
		if (isIsolated) {
			newPairs.push(pair);
		}
	}
	return newPairs;
}
function findClosestMeeple(p){
	//console.log('p', p);
	let fen = T.fen;
	let dist = 9999999;
	let closestMeeple = null;
	for (const meeple of fen.meeples) {
		//console.log('meeple', meeple);
		let d = getDistanceBetweenCenters(mBy(p.id),mBy(meeple.id)); //getDistanceBetweenPoints(p, meeple);
		//console.log('d', d);
		if (d < dist) {
			dist = d;
			closestMeeple = meeple;
		}
	}
	return closestMeeple;
}
function findPlayerWithMeeplesLeft(name) {
	let pnamesWithMeeplesLeft = [];
	for (const pname of T.playerNames) {
		let meeplesOfThatPlayer = T.fen.meeples.filter(x => x.owner == pname);
		if (meeplesOfThatPlayer.length < T.options.numMeeples) pnamesWithMeeplesLeft.push(pname);
	}
	if (pnamesWithMeeplesLeft.length == 0) return null;
	let nextPlayer = null;
	while (!nextPlayer) {
		nextPlayer = arrNext(T.plorder, name);
		if (!pnamesWithMeeplesLeft.includes(nextPlayer)) { name = nextPlayer; nextPlayer = null; }
	}
	return nextPlayer;
}
function generateHotspots(dParent, pointPairs, sz = 20, color = 'red') {
	let t = getNow();
	let hotspots = [];
	let linesByPair = {};
	for (const pair of pointPairs) {

		unlockLengthyProcess();

		let ids = pair.map(x => x.id); //console.log(ids);
		let key = ids.join(',');
		let [pStart, pEnd] = [B.diPoints[ids[0]], B.diPoints[ids[1]]];
		let line = getEquidistantPoints(pStart, pEnd, sz / 2);
		for (const p of line) {
			p.bg = color;
			p.sz = sz;
			p.start = ids[0];
			p.end = ids[1];
			p.startX = pStart.x;
			p.endX = pEnd.x;
			p.startY = pStart.y;
			p.endY = pEnd.y;
			p.id = getUID();
			p.pairs = [key];
			hotspots.push(p);
		}
		linesByPair[key] = line;
	}
	//t = showTimeSince(t); 
	let dihotspots = lacunaDrawPoints(dParent, hotspots);
	if (color == 'transparent') hotspots.map(x => mStyle(x.div, { opacity: 0 }))
	let [c1, c2, c3, c4, c5, c6] = [0, 0, 0, 0, 0, 0];
	for (const p1 of hotspots) {
		assertion(p1.startX <= p1.endX, "NOT SORTED!!!!!")
		for (const p2 of hotspots) {

			unlockLengthyProcess();
			
			if (p1 == p2) { c3++; continue; }
			if (p1.startX > p2.endX) { c1++; continue; }
			if (p2.startX > p1.endX) { c2++; continue; }
			if (p1.start == p2.start && p1.end == p2.end) { c4++; continue; }
			if (p1.start == p2.end && p1.end == p2.start) { c5++; continue; }
			let miny1 = Math.min(p1.startY, p1.endY);
			let maxy1 = Math.max(p1.startY, p1.endY);
			let miny2 = Math.min(p2.startY, p2.endY);
			let maxy2 = Math.max(p2.startY, p2.endY);
			if (miny1 > maxy2 || miny2 > maxy1) { c5++; continue; }
			c6++;
			let dist = getDistanceBetweenPoints(p1, p2);
			if (dist < sz / 3) {
				let newlist = new Set(p1.pairs.concat(p2.pairs));
				p1.pairs = Array.from(newlist);
				p2.pairs = Array.from(newlist);
				if (color != 'transparent') {
					p1.bg = 'blue'; mStyle(p1.div, { bg: 'blue' });
					p2.bg = 'blue'; mStyle(p2.div, { bg: 'blue' });
				}
			}
		}
	}
	//t = showTimeSince(t); 
	return [hotspots, linesByPair];
}
function getDistanceBetweenPoints(p1, p2) {
	if (isString(p1)) p1 = B.diPoints[p1];
	if (isString(p2)) p2 = B.diPoints[p2];
	return getDistanceBetweenCenters(p1.div, p2.div);
}
function highlightHotspots(ev) {
	let [x, y] = [ev.clientX, ev.clientY];
	let els = allElementsFromPoint(x, y);
	let endPoints = [], possiblePairs = [];
	for (const elem of els) {
		let p = B.hotspotDict[elem.id]; //console.log(p)
		if (isdef(p)) {
			addIf(endPoints, p.start);
			addIf(endPoints, p.end);
			let pair = [p.start, p.end]; pair.sort();
			addIf(possiblePairs, pair.join(','));
		}
	}
	stopPulsing(endPoints);
	startPulsing(endPoints);
	B.endPoints = endPoints;
	B.selectedPoints = [];
	B.possiblePairs = possiblePairs;
}
function lacunaColor(name) {
	let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
	return clist[name];
}
function lacunaColorName(val) {
	let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
	for (const k in clist) {
		if (val == clist[k]) return k;
	}
	return 'unknown';
}
function lacunaColors() {
	let clist = { red: 'crimson', green: "#00ff00", blue: "#0000ff", cyan: "#00ffff", yellow: "#FFD166", pink: "#FF80AB", orange: "#F4A261", purple: "#9D4EDD", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080", magenta: "#D81159" };
	return Object.values(clist);
}
function lacunaDrawPoints(dParent, points, addLabel = true) {
	let items = [];
	for (const p of points) {
		let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase():''; //p.id.substring(1) : ''
		let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
		d1.style.cursor = 'default';
		if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
		let rect = getRect(d1);
		p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
		p.xPage = rect.x; p.yPage = rect.y;
		p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
		items[p.id] = p;
	}
	return items;
}
async function lacunaGameover() {
	showMessage('Game over');
	console.log('Game over');

	//for each point remaining on the board, calculate closest meeple
	let [fen,players] = [T.fen, T.players];
	
	for(const p of fen.points) {
		let closestMeeple = findClosestMeeple(p);
		if(closestMeeple) {
			//console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
			let owner = closestMeeple.owner;
			players[owner].flowers[p.bg] += 1;
			p.owner = owner;
			//draw a line between meeple and point
			//let d=mBy(p.id);
			//console.log('d',d);
			//d.classList.add('pulseFastInfinite');
			//mBy(p.id).innerHTML = owner[0].toUpperCase();

			//drawInteractiveLine(p, closestMeeple);
		}
		//break;
	}


	for(const plname of T.playerNames) {
		let pl = T.players[plname];
		for(const f in pl.flowers) pl.score += pl.flowers[f];
	}
	let table = T;
  table.winners = getPlayersWithMaxScore(table);
  table.status = 'over';
  table.turn = [];
  let id = table.id;
  let name = getUname();
  let step = table.step;
  let o = { id, name, step, table };
  let res = await mPostRoute('table', o); //console.log(res);

}
function lacunaGeneratePoints(w, h, n = 49, neach = 7, sz = 10, rand = .7, round = false) {
	let clist = lacunaColors();
	let points = round ? generateRandomPointsRound(n, w, h, rand) : generateRandomPointsRect(n, w, h, rand);
	let colors = generateRepeatedColors(n, neach, clist); arrShuffle(colors);
	for (let i = 0; i < n; i++) { points[i].bg = colors[i]; points[i].sz = sz; points[i].id = getUID(); }
	return points;
}
function lacunaGeneratePointsMargin(w, h, margin, n = 49, neach = 7, sz = 10, rand = .7, round = false) {
	let points = lacunaGeneratePoints(w - 2 * margin, h - 2 * margin, n, neach, sz, rand, round);
	for (let i = 0; i < n; i++) { points[i].x += margin; points[i].y += margin; }
	return points;
}
function lacunaMakeSelectableME() {
	for (const id of B.endPoints) {
		let div = mBy(id);
		mClass(div, 'selectable')
		div.onclick = ev => lacunaSelectPointME(ev);
	}
}
async function lacunaMoveCompletedME(idlist) {
	let [fen, players, me, table] = [T.fen, T.players, T.players[getUname()], T]
	B.endPoints.map(x => lacunaUnselectable(x));
	showMessage("________Move completed, removing", idlist);
	assertion(idlist.length == 2 || idlist.length == 0, `WTF3!!! ${idlist.length}`);
	if (idlist.length == 2) {
		fen.points = fen.points.filter(x => x.id != idlist[0] && x.id != idlist[1]);
		let color = B.diPoints[idlist[0]].bg; //console.log('color', color);
		let flower = lacunaColorName(color); //console.log('flower', flower);
		let n = lookup(me, ['flowers', color]);
		lookupSetOverride(me, ['flowers', color], n ? n + 2 : 2);
	}

	//table.turn=[arrNext(table.plorder,getUname())]; //console.log('turn changed to',table.turn);
	let nextPlayer = findPlayerWithMeeplesLeft(getUname()); console.log('nextPlayer', nextPlayer);
	if (nextPlayer) {
		table.turn = [nextPlayer];
		let o = { id: table.id, name: me, step: table.step + 1, table };
		let res = await mPostRoute('table', o); //console.log(res);
	} else await lacunaGameover();


}
async function lacunaSelectPointME(ev) {
	let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
	let id = evToId(ev);
	let p = B.diPoints[id];
	//console.log('selecting point', p.id);
	lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
	assertion(B.selectedPoints.length >= 1, "WTF");
	if (B.selectedPoints.length == 1) {
		let eps = [];
		//console.log('possiblePairs', B.possiblePairs);
		for (const pair of B.possiblePairs.map(x => x.split(',').map(x => B.diPoints[x]))) {
			let p1 = pair[0];
			let p2 = pair[1];
			if (p1.id != id && p2.id != id) continue;
			if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);
		}
		let unselect = B.endPoints.filter(x => !eps.includes(x));
		unselect.map(x => lacunaUnselectable(x));
		B.endPoints = eps; //console.log('endPoints remaining', B.endPoints);
		if (B.endPoints.length < 2) {
			B.selectedPoints.push(B.endPoints[0]);
			await lacunaMoveCompletedME(B.selectedPoints);
		}
	} else {
		assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
		await lacunaMoveCompletedME(B.selectedPoints);
	}
}
function lacunaStartMove() {
	lockForLengthyProcess();
	let t = getNow();
	h = { meeples: B.meeples, dParent: B.dParent, points: B.points, sz: B.sz };

	let [points, dParent, sz] = [B.points, B.dParent, B.sz];
	let result = findIsolatedPairs(points, sz*1.2); //console.log(result);

	//console.log('isolated', showPairs(result.isolatedPairs), result.isolatedPairs.length);
	let isolated = B.isolatedPairs = filterIsolatedPairs(result.isolatedPairs, B.meeples, 15);
	//console.log('isolated', showPairs(isolated), isolated.length);

	//t = showTimeSince(t, 'vor generateHotspots')

	let [hotspots, linesByPair] = generateHotspots(dParent, isolated, sz, 'transparent');

	B.hotspots=hotspots;
	B.linesByPair = linesByPair;
	B.pairs = linesByPair; //console.log(B.pairs)
	B.hotspotList = hotspots;
	B.hotspotDict = list2dict(hotspots, 'id');

	dParent.onmousemove = highlightHotspots;
	dParent.onclick = placeYourMeepleME;
	//t = showTimeSince(t, 'move');
	unlock();
}
function lacunaUnselectable(id) {
	let div = mBy(id); //console.log('unselecting', id)
	mClassRemove(div, 'selectable');
	div.onclick = null;
}
function lockForLengthyProcess(){
	DA.LengthyProcessRunning = true;
	console.log('LOCK!!!!!!!!!!!!!!!!!!!!!!');
}
async function onchangeAutoSwitch(){
	if (DA.autoSwitch === true){
		DA.autoSwitch = false
	} else {
		DA.autoSwitch = true
	}
}
async function placeYourMeepleME(ev) {
	let [fen,players,pl]=[T.fen,T.players,T.players[getUname()]]
	stopPulsing();
	d = mBy('dCanvas');
	d.onmousemove = null;
	d.onclick = null;
	for (const p of B.hotspotList) { mStyle(p.div, { z: 0 }) }
	for (const p of B.points) { p.div.style.zIndex = 1000; }
	let sz = 20;
	x = ev.clientX - d.offsetLeft - d.parentNode.offsetLeft;
	y = ev.clientY - d.offsetTop - d.parentNode.offsetTop;
	let pMeeple = { x: x - sz / 2, y: y - sz / 2, sz, bg: 'black', border:getPlayerProp('color'), id: getUID(), owner: getUname() };

	fen.meeples.push(jsCopy(pMeeple));//**** */

	showMeeple(d,pMeeple);
	B.meeples.push(pMeeple); //console.log('B.meeples', B.meeples);
	//TODO: if only 2 points are selectable, just grab them and finish move!
	if (B.endPoints.length == 0) {
		//finish move without grabbing any flowers
		await lacunaMoveCompletedME([]);

	} else if (B.endPoints.length == 2) {
		//grab those flowers and finish move
		B.selectedPoints.push(B.endPoints[0]);
		B.selectedPoints.push(B.endPoints[1]);
		await lacunaMoveCompletedME(B.selectedPoints);

	} else lacunaMakeSelectableME();
}
function showMeeple(d,pMeeple){
	//console.log(pMeeple.owner)
	lacunaDrawPoints(d, [pMeeple], false);

	let color = getPlayerProp('color',pMeeple.owner); //console.log('color', color)
	let letter = pMeeple.owner[0].toUpperCase();
	
	mStyle(iDiv(pMeeple), { border: `${color} 5px solid` });
	iDiv(pMeeple).innerHTML = letter;
}
function startPulsing(idlist) {
	idlist.map(x => B.diPoints[x].div.classList.add('pulseFastInfinite'));
}
function stopPulsing(idExcept = []) {
	let drem = document.querySelectorAll('.pulseFastInfinite');
	for (const d of drem) {
		if (idExcept.includes(d.id)) continue;
		d.classList.remove('pulseFastInfinite');
	}
}
function unlock(){
	DA.LengthyProcessRunning = false;
	console.log('UNLOCK!!!!!!!!!!!!!!!!!!!!!!');
}
function unlockLengthyProcess(){
	try{
		if (DA.Interrupt === true && DA.LengthyProcessRunning === true) {
			DA.LengthyProcessRunning = false;  
			
			console.log('INTERRUPT!!!!!!!!!!!!!!!!!!!!!!');
			throw 1;
		}
	}
	catch(err){}
}



//#region  showTable und lacuna game
function lacuna() {
	function setup(table) {
		let opts = table.options;

		opts = { numPoints: 10, numColors: 2, numMeeples: 1 };

		let n = opts.numPoints;
		let neach = opts.numPoints / opts.numColors;

		let points = lacunaGenerateFenPoints(n, neach, 1000, 1000); // 243_500_1_felix, (x,y E [0,1000] und type E [1,numColors] hat, ?owner)
		//es ist auch simpel, wenn ich die points auf ein extra layer am document mache, alle coords absolute

		let fen = { points }; console.log('points',points)

		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
			pl.positions = [];
			pl.flowers = {};
			for (const c of range(opts.numColors)) { pl.flowers[c] = 0; }
		}

		fen.meeples = [];
		table.plorder = jsCopy(table.playerNames);
		table.turn = [rChoose(table.playerNames)];
		return fen;
	}

	function stats(table) {
		let [me, players] = [getUname(), table.players];
		let style = { patop: 8, mabottom: 20, wmin: 80, bg: 'beige', fg: 'contrast' };
		let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'colflex', style)
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item); mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);


			for (const c in pl.flowers) {
				let n = pl.flowers[c];
				playerStatCount(c, n, d); //, {}, {id:`stat_${plname}_score`});	
			}


			if (table.turn.includes(plname)) { mDom(d, { position: 'absolute', left: -3, top: 0 }, { html: getWaitingHtml() }); }
		}

	}

	function present(table) {
		let fen = table.fen; console.log(fen);

		console.log(table.fen,table.players); 
		B = {};
		let dTable = presentBgaRoundTable(); 

		B.points = lacunaPresentPoints(fen.points,dTable);
		// let rect=getRect(dTable); 
		// let [w,h,xoff,yoff] = [rect.w,rect.h,rect.x,rect.y];console.log(w,h,xoff,yoff)
		// let pdiv=mDom(dTable,{position:'absolute',w:10,h:10,left:100+xoff,top:100+yoff,bg:rColor(),round:true},{'data-type':1});

		// B.points = [];

		// for(const p of fen.points){
		// 	B.points.push(pointFromFen(p,dTable,20))
		// };
		
	}
	function muell(table){
		let [w, h, sz, n, neach, points, meeples] = [fen.w, fen.h, fen.sz, fen.n, fen.neach, jsCopy(fen.points), jsCopy(fen.meeples)];
		let padding = 20;
		mStyle(dTable, { bg: 'midnight_purple', position: 'relative', padding, wmin: w + 2 * padding, hmin: h + 2 * padding });
		let dParent = B.dParent = mDom(dTable, { w, h, position: 'absolute', left: 2 * padding, top: 2 * padding }, { id: 'dCanvas' });
		B.points = points; //console.log(points);
		B.sz = sz;
		B.diPoints = lacunaDrawPoints(dParent, points);
		B.meeples = meeples;
		B.diMeeples = lacunaDrawPoints(dParent, meeples);
		//meeples.map(x=>showMeeple(dParent,x));
		return B.points;
	}

	async function activate(table, items) {
		if (!isMyTurn(table)) return;
		//console.log('activate', table, items);
		setInstruction('must place a meeple'); //browser tab and instruction if any
		console.log('AAAAAAAAAAAAAAAA')
		return;
		setTimeout(() => lacunaStartMove(), 10);
	}

	return { setup, present, stats, activate, hasInstruction:true };
}
async function showTable(id) {
	let me = getUname(); //console.log('_________showTable', id)
	let table = await mGetRoute('table', { id });  //console.log('table',table)
	if (!table) { showMessage('table deleted!'); return await showTables('showTable'); }

	//if (DA.autoSwitch && table.turn.length > 0 && !table.turn.includes(me)) {await switchToUser(table.turn[0]); return;}

	DA.Interrupt = true; //console.log('lengthy',DA.LengthyProcessRunning);
	while (DA.LengthyProcessRunning === true) { await mSleep(100); }
	DA.Interrupt = false;
	//console.log('____________showTable', table);

	let func = DA.funcs[table.game];
	T = table;
	clearMain(); mClassRemove('dExtra', 'p10hide');	

	showTitleGame(table);
	if (func.hasInstruction) prepInstruction(table);

	let items = func.present(table);
	func.stats(table);
	if (table.status == 'over') { showGameover(table, 'dTitle'); return; }
	assertion(table.status == 'started', `showTable status ERROR ${table.status}`);
	await updateTestButtonsLogin(table.playerNames);
	func.activate(table, items);
}
//#endregion showTable und lacuna game









