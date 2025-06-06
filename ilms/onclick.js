
function createOpenTable(gamename, players, options) {
	let me = UGetName();
	let playerNames = [me]; console.log('me', me)
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(),
		fen: null,
		game: gamename,
		owner: playerNames[0],
		friendly: generateTableName(playerNames.length, []),
		players,
		playerNames: playerNames,
		options
	};
	return table;
}
async function startGame(gamename, players, options) {
	let table = createOpenTable(gamename, players, options);
	table = setTableToStarted(table);
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('mox0', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	return table;
}
function unselectPlayerItem(item) { mStyle(iDiv(item), { bg: 'transparent', fg: 'black', border: `transparent` }); }

async function onclickOpenToJoinGame() {
	sysBusy();
	let options = collectOptions();
	let players = collectPlayers();
	mRemove('dGameMenu');
	let table = createOpenTable(DA.gamename, players, options);
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('mox0', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	//await showGamesAndTables();
	sysIdle();
	return table;
	// let t = await tableCreate(DA.gamename, players, options);
}
async function onclickStartGame() {
	sysBusy();
	await saveDataFromPlayerOptionsUI(DA.gamename);
	let options = collectOptions();
	let players = collectPlayers();
	let table = await startGame(DA.gamename, players, options);
	sysIdle();
}
async function onclickTableStart(id) {
	sysBusy();
	let tData = M.tables[id];
	if (!tData) { showMessage('table deleted!'); return await showGamesAndTables(); }
	tData = setTableToStarted(tData);
	let res = await mPhpPost('mox0', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
	//await showGamesAndTables();
	sysIdle();
}
async function onclickTable(id) {
	showTable(id);
}
async function onclickTableDelete(id) {
	sysBusy();
	let res = await mPhpPost('mox0', { action: 'deletey', file: `tables/${id}` });
	console.log('res', res);
	sysIdle();
}
async function onclickTableJoin(id) {
	sysBusy();
	let tData = jsCopy(M.tables[id]);
	let me = UGetName(); console.log('me', me)
	assertion(tData.status == 'open', 'too late to join! game has already started!')
	assertion(!tData.playerNames.includes(me), `${me} already joined!!!`);
	tData.players[me] = createGamePlayer(me, tData.game);
	tData.playerNames.push(me);
	let res = await mPhpPost('mox0', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
	sysIdle();
}
async function onclickTableLeave(id) {
	sysBusy();
	let tData = jsCopy(M.tables[id]);
	let me = UGetName();
	assertion(tData.status == 'open', 'too late to leave! game has already started!')
	assertion(tData.playerNames.includes(me), `${me} NOT in joined players!!!!`);
	delete tData.players[me];
	removeInPlace(tData.playerNames, me);
	let res = await mPhpPost('mox0', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
	sysIdle();
}


