//#region transaction
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	//let t = { cmd: cmd, fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn };
	DA.transactionlist.push(cmd);
	//console.log('added transaction', cmd, DA);
}
function start_transaction() {
	if (DA.simulate) return;
	DA.simulate = true;
	DA.snapshot = { fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn }; //brauch ich eigentlich nicht
	DA.transactionlist = [];
}
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
function pack_table(o) {
	for (const k of ['players', 'fen', 'state', 'player_status', 'options', 'scoring', 'notes', 'turn']) {
		let val = o[k];
		if (isdef(val)) o[k] = JSON.stringify(val);
	}
	return JSON.stringify({ table: o, playerdata: JSON.stringify(o.playerdata) });
}

//#region select
function clear_selection() {

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (nundef(Z.A) || isEmpty(A.selected)) return;

	//console.log('selected', A.selected);
	let selitems = A.selected.map(x => A.items[x]);
	for (const item of selitems) { ari_make_unselected(item); }
	A.selected = [];
}
function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect = false) { //, show_submit_button=true) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	//console.log('A.level', A.level)
	show_progress();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	// dInstruction.innerHTML = '<div>' + ((Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You </span>` : `${Z.uplayer} `)) + "&nbsp;" + instruction; // + '</div>';
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction; // + '</div>';
	//console.log('A',A)
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); } //console.log('triggered!!!') }
	//prep items and link to ui
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA.items',items,A.items); //return;

	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : is_player(item.a)? 'player': isdef(item.o) ? 'container' : is_color(item.a)? 'color' : 'string'; // nundef(item.submit_on_click) ? 'string' : 'submit';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string' || type == 'color') { //make button for this item!
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
			if (type == 'color') mStyle(item.div,{bg:item.a,fg:'contrast'});
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev); 
			ui.id = id;
		}
	}

	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }

	let show_restart_button = A.level > 1; 
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }

	//now, mark all items for selection
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }

	//activate ui or automatic selection
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min); //TODO: sollte das passieren, check in ari_pre_action die mins!!!
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		//all items need to be selected!
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (A.autosubmit) {
			//console.log('items.length==min und autosubmit!!!!!!!!!!!!!!!!!!')
			loader_on();
			//console.log('autosubmit because item.length == min items (so would have to select all items anyway)')
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		//console.log('ist ein BOT!!!');
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			//console.log('test end');
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					//this is a command!
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					//console.log('idx of', el, 'is', idx)
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			//console.log('DA.testing: selection', selection);
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}
function select_confirm_weiter(callback) {
	select_add_items(ui_get_string_items(['weiter']), callback, 'may click to continue', 1, 1, Z.mode == 'multi');
}
function select_last(item, callback, ev) {
	//console.log('clicked',ev.target)
	//console.log('haaaaaaaaaaaaaaaaaaaalllllllllllllllllooooooooooooooooo')
	if (isdef(ev)) evNoBubble(ev);
	Z.A.last_selected = item; callback(item, ev);
}
function select_clear_previous_level() {
	//console.log('select_clear_previous_level', Z.A.items)
	let A = Z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });

		let dsel = Z.game == 'accuse'?mBy(`dTitleMiddle`):mBy(`dSelections1`); // mBy(`dSelections${A.level}`)
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 });
		//return;
		for (const item of A.items) {
			//console.log('item', item);
			ari_make_unselectable(item);
			if (A.keep_selection) continue;
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itemtype == 'card') {
				//a miniature of this item is added to 
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding: 2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itemtype == 'container') {
				//a miniature of this item is added to 
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itemtype == 'string') {
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'color') {
				let db = mDiv(dsel, { bg: item.a, fg: 'contrast', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'player') {
				let db = mDiv(dsel, {  }, item.id, `<span style="color:${get_user_color(item.a)};font-weight:bold"> ${item.a} </span>`);
			}
		}
	}
}
function select_toggle() { //item,ev) {
	//console.log('clicked',ev.target)
	//evNoBubble(ev);
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;

	let item = A.last_selected;
	//console.log('last_selected', item)
	//let id = evToId(ev); let item = A.di[id];

	//console.log('click id', id, 'item', item);
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {

		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }

		A.selected.push(item.index);
		ari_make_selected(item);

		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && A.autosubmit) {
			//console.log('autosubmitting in _select_toggle with 1 sec delay because cannot select more -  max reached!');
			setTimeout(() => A.callback(), 100);
		}
	}
	//console.log('selected', A.selected);

	// if (!isEmpty(A.selected) && isdef(mBy('bClearSelection'))) { show('bClearSelection'); }
	// else if (isEmpty(A.selected) && isdef(mBy('bClearSelection'))) { hide('bClearSelection'); }
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;

	//soll ich die selected items unselected machen? nein, weil user sonst nicht weiß, was er gewählt hat 
	if (A.maxselected == 1 && A.selected.length > 0) {
		//console.log('last_selected', A.last_selected, 'selected', A.selected);
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
		//unselect A.items[A.selected[0]]
	} else if (A.selected.length == 2) {
		//make second item unselected
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';

	} else {
		//autoclose
		TO.error = setTimeout(continue_after_error, 3000);
	}
}
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function select_highlight() { let A = Z.A; for (const i of A.selected) { let a = A.items[i]; ari_make_selected(a, true); } }//console.log('a', a); } }
function remove_from_selection(card) {
	if (nundef(Z.A)) return;
	let A = Z.A;
	//console.log('A.items',A.items);
	//console.log("A.selected",A.selected);
	//console.log('card',card);
	let item = firstCond(A.items, x => x.id == card.id);
	//console.log('====>item',item);
	if (isdef(item)) {
		let idx = item.index;
		A.items.splice(item.index, 1);
		removeInPlace(A.selected, item.index);
		//console.log('A.selected',A.selected);
		//console.log('A.items',A.items);
		make_card_unselectable(item);
		make_card_unselected(item);
		reindex_items(A.items);
	}

}
function restart_selection_process() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	if (Z.game != 'ferro') {
		console.log('attempt to restart selection process in non-ferro game!!!');
		return;
	}
	//all selectedCards are made unselected
	A.selectedCards.map(x => ari_make_unselected(x));
	mClear('dSelections0');
	Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };

	Z.stage = 'card_selection';
	ferro_pre_action();

}
function select_timer(ms, callback) {
	let d = mBy('dSelections0');
	let dtimer = mDiv(d, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, 'dTimer');

	//start_user_timer(dtimer, 1000, null, ms, callback); //(dtimer, msInterval, onTick, msTotal, onElapsed)
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, 1000, null, ms, callback);
	timer.start();
	return dtimer;
}
function stop_timer() {
	if (isdef(DA.timer)) {
		let res = DA.timer.clear();
		DA.timer = null;
		//console.log('time left in stop timer', res)
		return isNumber(res) ? res : 0;
	}
	return 0;
}

//#-endregion

//#region making things selectable or selected
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	//console.log('itemtype', item.itemtype);
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'player': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'player': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_selected(item) {
	//console.log('item',item)
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'player': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}

}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'player': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}

}
// card
function make_card_selectable(item) { 
	let d = iDiv(item.o); 
	mClass(d, 'selectable'); 
	//console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
	if (Z.game != 'aristo') { spread_hand(item.path, .3); } 
	//console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
	mClass(d.parentNode, 'selectable_parent'); 
}

function make_card_unselectable(item) { let d = iDiv(item.o); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d.parentNode, 'selectable_parent'); spread_hand(item.path); }
function make_card_selected(item) {
	//selection color can be set bei game!
	let color = isdef(Z.func.get_selection_color) ? Z.func.get_selection_color(item) : 'red';
	set_card_border(item, 13, color);
	if (DA.magnify_on_select) mClass(iDiv(item.o), 'mag');
}
function make_card_unselected(item) { set_card_border(item); if (DA.magnify_on_select) mClassRemove(iDiv(item.o), 'mag'); }

//container
function make_container_selectable(item) { let d = iDiv(item); mClass(d, 'selectable'); mClass(d, 'selectable_parent'); }
function make_container_unselectable(item) { let d = iDiv(item); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d, 'selectable_parent'); }
function make_container_selected(item) { let d = iDiv(item); mClass(d, 'selected_parent'); }
function make_container_unselected(item) { let d = iDiv(item); mClassRemove(d, 'selected_parent'); }

function make_string_selectable(item) { let d = mBy(item.id); mClass(d, 'selectable_button'); }
function make_string_unselectable(item) { let d = mBy(item.id); d.onclick = null; mClassRemove(d, 'selectable_button'); }
function make_string_selected(item) { let d = mBy(item.id); item.bg = mGetStyle(d, 'bg'); item.fg = mGetStyle(d, 'fg'); mStyle(d, { bg: 'yellow', fg: 'black' }); } //console.log('item', item, 'd', d); 
function make_string_unselected(item) { let d = mBy(item.id); mStyle(d, { bg: item.bg, fg: item.fg }); } //mClassRemove(d, 'string_selected'); }

function make_hand_selectable(item) { }
function make_hand_unselectable(item) { }
function make_hand_selected(item) { }
function make_hand_unselected(item) { }

function make_market_selectable(item) { }
function make_market_unselectable(item) { }
function make_market_selected(item) { }
function make_market_unselected(item) { }

function make_deck_selectable(item) { }
function make_deck_unselectable(item) { }
function make_deck_selected(item) { }
function make_deck_unselected(item) { }

//#-endregion

