
async function showGamesAndTables() {
	async function showGames(dParent) {
		mText(`<h2>games</h2>`, dParent, { maleft: 12 });
		let d = mDom(dParent, { fg: 'white' }, { id: 'game_menu' }); mCenterCenterFlex(d); //mFlexWrap(d);
		let gamelist = DA.gamelist;
		for (const gname of gamelist) {
			let g = MGetGame(gname);
			let bg = g.color;
			let d1 = mDom(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 10, w: 140, height: 100, bg, position: 'relative' }, { id: g.id });
			d1.setAttribute('gamename', gname);
			d1.onclick = onclickGameMenuItem;
			mCenterFlex(d1);
			let o = M.superdi[g.logo];
			let fg = colorIdealText(bg);
			let el = mDom(d1, { matop: 0, mabottom: 6, fz: 65, hline: 65, family: 'emoNoto', fg, display: 'inline-block' }, { html: o.text });
			mLinebreak(d1);
			mDom(d1, { fz: 18, align: 'center', fg }, { html: capitalize(g.friendly) });
		}
	}
	async function showTables(dParent, tables, me) {
		mText(`<h2>tables</h2>`, dParent, { maleft: 12 });
		if (isEmpty(tables)) { mDom(dParent, { maleft: 12, fz: 24, fg: 'blue' }, { html: 'no active game tables' }); return; }
		let t = UI.tables = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'playerNames'], 'tables', false);
		mTableCommandify(t.rowitems.filter(ri => ri.o.status != 'open'), {
			0: (item, val) => hFunc(val, 'onclickTable', item.o.id, item.id),
		});
		mTableStylify(t.rowitems.filter(ri => ri.o.status == 'open'), { 0: { fg: 'blue' }, });
		let d = iDiv(t);
		for (const ri of t.rowitems) {
			let r = iDiv(ri);
			let id = ri.o.id;
			if (ri.o.prior == 1) mDom(r, {}, { tag: 'td', html: getWaitingHtml(24) });
			if (ri.o.status == 'open') {
				let playerNames = ri.o.playerNames;
				if (playerNames.includes(me)) {
					if (ri.o.owner != me) {
						let h1 = hFunc('leave', 'onclickTableLeave', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
					}
				} else {
					let h1 = hFunc('join', 'onclickTableJoin', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
				}
			}
			if (ri.o.owner != me) continue;
			let h = hFunc('delete', 'onclickTableDelete', id); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
			if (ri.o.status == 'open') { let h1 = hFunc('start', 'onclickTableStart', id); let c1 = mAppend(r, mCreate('td')); c1.innerHTML = h1; }
		}
		return tables;
	}
	let dParent = mBy('dTableList');
	if (nundef(dParent)) { mClear('dMain'); dParent = mDom('dMain', {}, { className: 'section', id: 'dTableList' }); }
	await loadTables();
	let tables = dict2list(M.tables);
	let me = UGetName();
	tables.map(x => x.prior = x.status == 'open' ? 0 : x.turn.includes(me) ? 1 : x.playerNames.includes(me) ? 2 : 3);
	sortBy(tables, 'prior');
	tables.map(x => x.game_friendly = capitalize(MGetGameFriendly(x.game)));
	let changes = deepCompare(DA.tableList, tables);
	DA.tableList = tables;
	if (changes) {
		console.log('changes', changes)
		mClear(dParent);
		await showTables(dParent, tables, me);
	} else console.log('tables: no change', changes);

	dParent = mBy('dGameList');
	if (isdef(dParent)) { mClear(dParent); }
	else { dParent = mDom('dMain', {}, { className: 'section', id: 'dGameList' }); }
	await showGames(dParent);
}
async function showStateButtons(d) {
	//uiState manual or auto
	let styles = { rounding: 6, maleft: 10, h: 24, bg: 'dimgray', fg: 'white', padding: 5 };

	let label = 'ui:';
	DA.dControlUiState = mToggleButton(d, styles, { label, key: 'hand', onclick: uiManual }, { label, key: 'display', onclick: uiAuto })

	label = 'menu:';
	DA.dControlUiState = mToggleButton(d, styles, { label, key: 'list', onclick: menuLobby }, { label, key: 'round_table', onclick: menuTable })

	label = 'table:';
	DA.dControlUiState = mToggleButton(d, styles,
		{ label: `${label} none`, key: null, onclick: tableNone },
		{ label: `${label} open`, key: null, onclick: tableOpen },
		{ label: `${label} me`, key: null, onclick: tableMyMove },
		{ label: `${label} wait`, key: null, onclick: tableOtherMove },
		{ label: `${label} over`, key: null, onclick: tableGameover },
	);
	label = 'system:';
	DA.dControlUiState = mToggleButton(d, styles,
		{ label: `${label} idle`, key: null, onclick: sysIdle },
		{ label: `${label} busy`, key: null, onclick: sysBusy },
		{ label: `${label} polling`, key: null, onclick: sysPolling },
	);

}
function showState() {
	
	console.log('uiState:', DA.uiState, firstVisibleChild(DA.dControlUiState).innerHTML);
}