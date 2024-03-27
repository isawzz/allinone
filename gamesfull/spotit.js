function spotit() {
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), turn: [players[0]], stage: 'init', phase: '' };
		for (const plname of players) {
			fen.players[plname] = {
				score: 0, name: plname, color: get_user_color(plname),
			};
		}
		fen.items = spotit_item_fen(options);
		if (nundef(options.mode)) options.mode = 'multi';

		//console.log('fen', fen)
		return fen;
	}
	function check_gameover() {
		for (const uname of Z.plorder) {
			let cond = get_player_score(uname) >= Z.options.winning_score;
			if (cond) { Z.fen.winners = [uname]; return Z.fen.winners; }
		}
		return false;
	}
	function state_info(dParent) { spotit_state(dParent); }
	function present(dParent) { spotit_present(dParent); }
	function stats(dParent) { spotit_stats(dParent); }
	function activate_ui() { spotit_activate(); }
	return { setup, activate_ui, check_gameover, present, state_info, stats };
}

function spotit_activate() {
	// nein das ist falsch!!!!!!
	//wenn ich der host bin, und es gibt bots, waehle 1 bot und setze timeout
	let [stage, uplayer, host, plorder, fen] = [Z.stage, Z.uplayer, Z.host, Z.plorder, Z.fen];

	if (stage == 'move' && uplayer == host && get_player_score(host) >= 1) {
		let bots = plorder.filter(x => fen.players[x].playmode == 'bot');
		if (isEmpty(bots)) return;
		let bot = rChoose(bots);
		TO.main = setTimeout(() => spotit_move(bot, true), rNumber(2000, 9000));
	}
}
function spotit_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);

	//let pldata = Z.playerdata;
	spotit_read_all_scores();

	let dt = dOpenTable; clearElement(dt); mCenterFlex(dt);

	spotit_stats(dt);

	mLinebreak(dt, 10);

	//console.log('fen.items', fen.items); //ex.: 'bird:0.5 shark:0.75 rat:0.75 dragon:0.5 bat:0.5 tomato:0.5 basket:1.2,crown:1.2 rocket:0.75 shark:1 tangerine:1 ladybug:1 owl:1.2 fly:1.2'
	let ks_for_cards = fen.items.split(',');
	let numCards = ks_for_cards.length;
	let items = Z.items = [];
	Items = [];
	let i = 0;
	for (const s of ks_for_cards) {
		let ks_list = s.split(' ');
		let item = {};
		item.keys = ks_list.map(x => stringBefore(x, ':'));
		item.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
		item.index = i; i++;
		let n = item.numSyms = item.keys.length;
		let [rows, cols, colarr] = calc_syms(item.numSyms);
		item.colarr = colarr;
		item.rows = rows;
		items.push(item);
	}

	Z.cards = [];
	let is_adaptive = Z.options.adaptive == 'yes';
	let nsyms = is_adaptive ? cal_num_syms_adaptive() : Z.options.num_symbols;

	for (const item of items) {
		//an item is a card

		//adaptive mode
		if (is_adaptive) { modify_item_for_adaptive(item, items, nsyms); }

		let card = spotit_card(item, dt, { margin: 20, padding: 10 }, spotit_interact);
		Z.cards.push(card);

		if (Z.stage == 'init') {
			face_down(card, GREEN, 'food');

			// let d=iDiv(card);
			// //cover div d with a div with black background
			// let dCover = card.live.dCover = mDiv(d,{background:GREEN,rounding:'50%',position:'absolute',width:'100%',height:'100%',left:0,top:0});
			// dCover.style.backgroundImage = 'url(/./base/assets/images/textures/food.png)';
			// //dCover.style.backgroundSize = '100% 100%';
			// dCover.style.backgroundRepeat = 'repeat';
			// //mStyle(iDiv(card),{opacity:.1,transition: 'opacity .5s' });
		}
		//console.log('card', card)
	}
	mLinebreak(dt, 10);


}
function spotit_stats(d) {
	let players = Z.fen.players;
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		//let border = onturn ? plname == Z.uplayer ? 'solid 5px lime' : 'solid 5px red' : 'solid medium white';
		// let border = plname == Z.uplayer ? 'solid 5px lime' : 0;
		// let border = plname == Z.uplayer ?pl.playmode == 'bot'? 'double 5px lime':'solid 5px lime' : 0;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}
function spotit_state(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	let msg = Z.stage == 'init' ? `getting ready...` : `player: ${user_html}`;
	dParent.innerHTML = `Round ${Z.round}:&nbsp;${msg} `;
}

//#region score
function ensure_score(plname) {
	let sc = 0;
	//console.log('ensure_score',Z.playerdata)
	if (isdef(Z.playerdata)) {
		//console.log('Z.playerdata', Z.playerdata);		
		let pldata = valf(firstCond(Z.playerdata, x => x.name == plname), { name: plname, state: { score: 0 } });
		//console.log('state for player', pldata.name, pldata.state);
		sc = isdef(pldata.state)?pldata.state.score:0;
	} else Z.playerdata = Z.plorder.map(x=>[{name:x,state:{score:0}}]);
	lookupSet(Z.fen, ['players', plname, 'score'], sc);
}
function get_player_score(plname) { ensure_score(plname); return Z.fen.players[plname].score; }
function inc_player_score(plname) { ensure_score(plname); return Z.fen.players[plname].score += 1; }

//#_endregion



//#region internal
function calc_syms(numSyms) {
	//should return [rows,cols,colarr]
	let n = numSyms, rows, realrows, colarr;
	if (n == 3) { rows = 2; realrows = 1; colarr = [1, 2]; }
	else if (n == 4) { rows = 2; realrows = 2; colarr = [2, 2]; }
	else if (n == 5) { rows = 3; realrows = 3; colarr = [1, 3, 1]; }
	else if (n == 6) { rows = 3.3; realrows = 3; colarr = [2, 3, 1]; }
	else if (n == 7) { rows = 3; realrows = 3; colarr = [2, 3, 2]; } //default
	else if (n == 8) { rows = 3.8; realrows = 4; colarr = [1, 3, 3, 1]; }
	else if (n == 9) { rows = 4; realrows = 4; colarr = [2, 3, 3, 1]; }
	else if (n == 10) { rows = 4; realrows = 4; colarr = [2, 3, 3, 2]; }
	else if (n == 11) { rows = 4.5; realrows = 4; colarr = [2, 3, 4, 2]; }
	else if (n == 12) { rows = 5; realrows = 5; colarr = [1, 3, 4, 3, 1]; }
	else if (n == 13) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 1]; }
	else if (n == 14) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 2]; }
	else if (n == 15) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 3, 2]; }
	else if (n == 16) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 4, 2]; }
	else if (n == 17) { rows = 5.5; realrows = 5; colarr = [2, 4, 5, 4, 2]; } //17
	else if (n == 18) { rows = 5.8; realrows = 5; colarr = [2, 4, 5, 4, 3]; } //18

	// // console.log('...numSyms,rows,cols', numSyms, rows, cols);
	// if (![9,11,13].includes(n)) colarr = _calc_hex_col_array(rows, realrows);

	// //correction for certain perCard outcomes:
	// if (rows == 3 && realrows == 1) { colarr = [1, 3, 1]; } //5
	// else if (rows == 2 && realrows == 1) { colarr = [1, 2]; } //3
	// else if (rows == 4 && realrows == 1) { rows = 3.3; colarr = [2, 3, 1]; } //6
	// else if (rows == 5 && realrows == 1) { rows = 4; realrows = 1; colarr = [1, 3, 3, 1]; } //8
	// else if (rows == 5 && realrows == 3) { rows = 5; realrows = 1; colarr = [1, 3, 4, 3, 1]; } //12
	// else if (rows == 6 && realrows == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; } //17
	// else if (rows == 6 && realrows == 3) { rows = 5.8; colarr = [2, 4, 5, 4, 3]; } //18

	// console.log('colarr',jsCopy(colarr));
	return [rows, realrows, colarr];
}
function cal_num_syms_adaptive() {
	let [uplayer, fen] = [Z.uplayer, Z.fen];
	let pl = fen.players[uplayer];
	pl.score = get_player_score(pl.name);

	//sort players by score
	let by_score = dict2list(fen.players);
	for (const pl of by_score) { pl.score = get_player_score(pl.name); }

	//calculate average score in by_score array
	let avg_score = 0;
	for (const pl of by_score) { avg_score += pl.score; }
	avg_score /= by_score.length;

	let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };

	let baseline = valf(di[uplayer], 0);
	let dn = baseline + Math.floor(pl.score - avg_score);

	//console.log('uplayer',uplayer,'baseline', baseline, 'avg', avg_score, 'pl.score', pl.score, 'dn', dn);

	let n = Z.options.num_symbols;

	//n+dn should be at least 4 and at most 14
	let nfinal = Math.max(4, Math.min(14, dn + n));
	return nfinal;
	//if (n + dn < 4) { dn = 4 - n; }
}
function find_shared_keys(keylist, keylists) {
	let shared = [];
	for (const keylist2 of keylists) {
		for (const key of keylist) {
			if (keylist2.includes(key)) {
				shared.push(key);
			}
		}
	}
	return shared;
}
function modify_item_for_adaptive(item, items, n) {

	item.numSyms = n;
	[item.rows, item.cols, item.colarr] = calc_syms(item.numSyms);

	//need to find shared symbol
	let other_items = items.filter(x => x != item);
	let shared_syms = find_shared_keys(item.keys, other_items.map(x => x.keys));
	let other_symbols = item.keys.filter(x => !shared_syms.includes(x));
	item.keys = shared_syms;
	let num_missing = item.numSyms - item.keys.length;
	item.keys = item.keys.concat(rChoose(other_symbols, num_missing));
	shuffle(item.keys);
	item.scales = item.keys.map(x => rChoose([1, .75, 1.2, .9, .8]));
}
function spotit_card(info, dParent, cardStyles, onClickSym) {
	Card.sz = 300;
	copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
	let card = cRound(dParent, cardStyles, info.id);

	addKeys(info, card);
	card.faceUp = true;
	//console.log('card', card);
	//let d = iDiv(card);
	let zipped = [];
	for (let i = 0; i < card.keys.length; i++) {
		zipped.push({ key: card.keys[i], scale: card.scales[i] });
	}
	card.pattern = fillColarr(card.colarr, zipped);

	// symSize: abhaengig von rows
	let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };

	let syms = [];
	mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		//console.log('key', key,'sym',sym);
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
	}

	return card;
}
function spotit_create_sample(numCards, numSyms, vocab, lang, min_scale, max_scale) {
	lang = valf(lang, 'E');
	let [rows, cols, colarr] = calc_syms(numSyms);

	//from here on, rows ONLY determines symbol size! colarr is used for placing elements

	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;
	let nMin = numKeysNeeded + 3;
	//lang = 'D';
	let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
	//console.log('keys', keypool);

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
		//console.log('card unique keys:',card.keys);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
		infos.push(info);
	}

	let iShared = 0;
	for (let i = 0; i < numCards; i++) {
		for (let j = i + 1; j < numCards; j++) {
			let c1 = infos[i];
			let c2 = infos[j];
			let dupl = dupls[iShared++];
			c1.keys.push(dupl);
			c1.shares[c2.id] = dupl;
			c2.shares[c1.id] = dupl;
			c2.keys.push(dupl);
			//each gets a shared card
		}
	}

	for (const info of infos) { shuffle(info.keys); }

	//for each key make a scale factor
	//console.log('min_scale',min_scale,'max_scale',max_scale);
	for (const info of infos) {

		// info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
		info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.2]));

		//chooseRandom([.5, .75, 1, 1.25]);
		//info.scales = info.scales.map(x=>coin()?x:-x);
	}

	//console.log(card.scales);
	for (const info of infos) {
		let zipped = [];
		for (let i = 0; i < info.keys.length; i++) {
			zipped.push({ key: info.keys[i], scale: info.scales[i] });
		}
		info.pattern = fillColarr(info.colarr, zipped);
	}

	return infos;
}
function spotit_find_shared(card, keyClicked) {
	let success = false, othercard = null;
	for (const c of Z.cards) {
		if (c == card) continue;
		if (c.keys.includes(keyClicked)) { success = true; othercard = c; }
	}
	return [success, othercard];
}
function spotit_item_fen(options) {
	let o = {
		num_cards: valf(options.num_cards, 2),
		num_symbols: options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
		vocab: valf(options.vocab, 'lifePlus'),
		lang: 'E',
		min_scale: valf(options.min_scale, 0.75),
		max_scale: valf(options.max_scale, 1.25),
	};

	let items = spotit_create_sample(o.num_cards, o.num_symbols, o.vocab, o.lang, o.min_scale, o.max_scale);
	let item_fens = [];
	for (const item of items) {
		let arr = arrFlatten(item.pattern);
		let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
		item_fens.push(ifen);
	}

	let res = item_fens.join(',');
	//console.log('res', res);
	return res;

}
function spotit_interact(ev, key) {
	ev.cancelBubble = true;
	if (!uiActivated) { console.log('ui NOT activated'); return; }

	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);

	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		let dsym = ev.target;
		let card = Items[id];

		//find if symbol is shared!
		let [success, othercard] = spotit_find_shared(card, keyClicked);
		spotit_move(Z.uplayer, success);
	}
}
function spotit_move(uplayer, success) {
	//console.log('g',g,'uname',uname,'success',success)
	if (success) {
		//console.log('success!',jsCopy(g.expected));
		inc_player_score(uplayer);
		//integrate all playerdata into fen!

		//fen score von diesem player sollte jetzt 1 sein
		assertion(get_player_score(uplayer) >= 1, 'player score should be >= 1');

		Z.fen.items = spotit_item_fen(Z.options);
		Z.state = { score: get_player_score(uplayer) };
		take_turn_spotit();

	} else {
		let d = mShield(dTable, { bg: '#000000aa', fg: 'red', fz: 60, align: 'center' });
		d.innerHTML = 'NOPE!!! try again!';
		TO.spotit_penalty = setTimeout(() => d.remove(), 2000);
	}
}
function spotit_read_all_scores() {
	if (nundef(Z.playerdata)) {
		Z.playerdata = [];
		for (const pl in Z.fen.players) {
			Z.playerdata.push({
				name: pl,
				state: { score: 0 },
			});
		}
	}
	for (const pldata of Z.playerdata) {
		let plname = pldata.name;
		let state = pldata.state;
		let score = !isEmpty(state) ? state.score : 0;
		let fenscore = lookupSet(Z.fen, ['players', plname, 'score'], score);
		//console.log('fenscore',fenscore,'pldata',pldata);
		Z.fen.players[plname].score = Math.max(fenscore, score);
	}

}



