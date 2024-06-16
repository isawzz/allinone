
async function onclickCardAusButton96(table, item, items) {
	mShield('dTable', { bg: 'transparent' });

	//highlight clicked card
	let d = iDiv(item);
	let ms = rChoose(range(300, 400));
	mClass(d, 'framedPicture'); TO.hallo = setTimeout(() => mClassRemove(d, 'framedPicture'), ms);
	try { await mSleep(ms); } catch (err) { return; } //console.log("ERR", err); 

	let id = table.id;
	let name = getUname();
	let move = item.feno;
	let step = table.step;
	let olist = [			{ keys: ['pending'], val: { name, move } },		];
	if (isdef(DA.pendingChanges)) {
		for (const klist of DA.pendingChanges) {
			olist.push({ keys: klist, val: lookup(table, klist) });
		}
	}

	let o = { id, name, olist, step };
	let best = arrMinMax(table.fen.cards).min;

	if (move == best) o.stepIfValid = step + 1; // nur 1 kann punkt kriegen pro runde

	let res = await mPostRoute('olist', o); //console.log(res);
}
async function setOnclickCard(item, items, direct = false) {
	if (checkInterrupt(items)) { console.log('!!!onclick card!!!'); return; }
	else if (direct) stopAutobot();
	else if (!direct && item.isSelected) { console.log('already clicked!'); return; }
	else if (DA.stopAutobot == true) { assertion(!direct, 'direct and autobot true'); return; }
	toggleItemSelection(item);
	let selitems = items.filter(x => x.isSelected);
	let [keys, m] = [selitems.map(x => x.key), selitems.length];
	let olist = [];
	if (m == 3) {
		clearEvents();
		mShield(dOpenTable, { bg: '#00000000' }); //disable ui
		let [me, table] = [getUname(), T];
		let [fen, pl] = [table.fen, table.players[me]];
		let isSet = setCheckIfSet(keys);
		if (isSet) {
			assertion(fen.cards.length >= table.options.numCards || isEmpty(fen.deck), `LOGISCHER IRRTUM SET REPLENISH ${fen.cards.length}, deck:${fen.deck.length}`)
			let toomany = Math.max(0, fen.cards.length - table.options.numCards);
			let need = Math.max(0, 3 - toomany);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i])
			olist.push({ keys: ['fen', 'cards'], val: table.fen.cards });
			olist.push({ keys: ['fen', 'deck'], val: table.fen.deck });
			pl.score++;
			pl.incScore = 1;
		} else {
			pl.score--;
			pl.incScore = -1;
		}
		olist.push({ keys: ['players', me, 'score'], val: pl.score });
		if (pl.playmode == 'bot') {
			await mSleep(500);
			if (checkInterrupt(items)) { console.log('!!!onclick card!!!'); return; }
		}
		let res = await sendMergeTable({ id: table.id, name: me, olist }); // console.log('res', res)
	}
}

async function setOnclickCardNEW(table, item, items) {
	toggleItemSelection(item);
	let selitems = items.filter(x => x.isSelected);
	let [keys, m] = [selitems.map(x => x.key), selitems.length];
	if (m == 3) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let id = table.id;
		let name = getUname();
		let move = keys;
		let step = table.step;
		let olist = [{ keys: ['pending'], val: { name, move } },];
		if (isdef(DA.pendingChanges)) {
			for (const klist of DA.pendingChanges) {
				olist.push({ keys: klist, val: lookup(table, klist) });
			}
		}
		let o = { id, name, olist, step };

		let isSet = setCheckIfSet(keys);
		if (isSet) o.stepIfValid = step + 1;

		let res = await mPostRoute('olist', o); //console.log(res);
	}
}

