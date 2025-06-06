
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


