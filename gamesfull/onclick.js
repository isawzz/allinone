function test_start_ferro(mode = 'multi') {
	let game = 'ferro';
	// let playernames = ['felix', 'lauren', 'mimi'];
	let playernames = ['mimi', 'lauren', 'felix'];
	let playmodes = ['human', 'human', 'human'];
	let strategies = ['random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	// let i = 0; let players = playernames.map(x => ({ name: x, playmode: playmodes[i++] }));
	let options = { mode: mode, thinking_time: 20 };
	startgame(game, players, options);
}
function test_start_aristo(n = 3, mode = 'multi') {
	let game = 'aristo';
	// let playernames = ['felix', 'lauren', 'mimi'];
	let playernames = arrTake(['mimi', 'felix', 'amanda', 'lauren', 'gul', 'nasi'], n);
	let playmodes = ['human', 'human', 'human', 'human', 'human', 'human'];
	let strategies = ['random', 'random', 'random', 'random', 'random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	// let i = 0; let players = playernames.map(x => ({ name: x, playmode: playmodes[i++] }));
	let options = { mode: mode, commission: 'no' };
	startgame(game, players, options);
}

function onclick_ack() {
	if (nundef(Z) || nundef(Z.func.clear_ack)) return;

	Z.func.clear_ack();
	//if (!is_sending) take_turn_single();
}
function onclick_advanced_menu() { DA.showTestButtons = toggle_visibility('dTestButtons'); }
function onclick_advanced_test() {
	DA.showTestButtons = toggle_visibility('dTestButtons');
	style_advanced_button();
}
function style_advanced_button(){
	let b = mBy('dAdvancedUI').children[0];
	if (DA.showTestButtons) { b.innerHTML = ' '; mStyle(b, { bg:GREEN,opacity:1 });} //fg: 'green' }) }
	else { b.innerHTML = ' '; mStyle(b, { bg:'silver',opacity:.5 });} //fg: 'black' }) }

}
function onclick_advanced_mode() { Clientdata.mode = toggle_mode(); } //onclick_reload(); }
function onclick_by_rank() {

	//console.log('onclick_by_rank');

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	//console.log('sorting for', uplayer);
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = 'rank'; //{ n: items.length, by: 'rank' };
	//lookupSetOverride(Clientdata,['handsorting',uplayer],pl.handsorting);
	Clientdata.handsorting = pl.handsorting;
	localStorage.setItem('handsorting', Clientdata.handsorting);
	//console.log('h ui', h);
	//console.log('items', items);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());

	//console.log('rankstr', Z.func.rankstr);//console.log('rankstr',Z.func.rankstr);
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //window[Z.game.toUpperCase()].rankstr); //'23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_by_suit() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	Clientdata.handsorting = pl.handsorting = 'suit'; //{ n: items.length, by: 'suit' };
	localStorage.setItem('handsorting', Clientdata.handsorting);
	//console.log('h ui', h);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //'23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_cancelmenu() { hide('dMenu'); }
function onclick_experience() {
	//muss sagen wieviel und zu wem
	//muss auch checken ob ueberhaupt experience habe!
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let plnames = get_other_players();
	let nums = range(1, fen.players[uplayer].experience);
	if (isEmpty(nums)) { show_special_message('you dont have any experience points!'); return; }

	//console.log('plnames',plnames,'nums',nums)
	show_special_popup('select player and number of experience points to gift:', send_experience_points, {}, plnames, nums);
	//mQuestionPopup()
}
function onclick_game_menu_item(ev) { show_game_menu(ev_to_gname(ev)); }
function onclick_home() { stopgame(); start_with_assets(); }
function onclick_logout() {
	mFadeClearShow('dAdminRight', 300);
	mClear('dAdminMiddle');
	stopgame();
	clear_screen();
	U = null;
	show_users();
}
function onclick_random() {
	//console.log('====>onclick_random');
	if (uiActivated && !DA.ai_is_moving) ai_move(300);
	else if (!uiActivated) console.log('NOP: ui not activated...');
	else if (DA.ai_is_moving) console.log('NOP: ai is (or was already) moving...');
	else console.log('NOP: unknown...');
}
//function onclick_random() { bluff_ai();}
function onclick_reload_after_switching() { DA.pollCounter = 0; DA.reloadColor = rColor(); onclick_reload(); }

function onclick_reload() {
	//console.log('onclick_reload')
	if (isdef(Z)) {
		// bei einem timed game mit schachuhr, muss ich die zeit abziehen!!!
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			take_turn_fen();

		} else {
			FORCE_REDRAW = true; send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: false }, 'table');
		}

	} else if (U) { onclick_tables(); }
	else { show_users(); }
}
function onclick_remove_host() {
	let [role, host, game, fen, uplayer, turn, stage] = [Z.role, Z.host, Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];

	//im notfall koennte auch host wandern lassen zu anderem player?
	//if ()
	// if host 's
	//if ()
}
function onclick_restart() {
	//old code: nur die fen wird resettet
	let [game, fen, plorder, host] = [Z.game, Z.fen, Z.plorder, Z.host];
	Z.scoring = {};
	if (nundef(fen.original_players)) fen.original_players = fen.players;
	//if (isdef(fen.original_players)) plorder=fen.original_players;
	let playernames = [host].concat(get_keys(fen.original_players).filter(x => x != host));
	let playmodes = playernames.map(x => fen.original_players[x].playmode);
	let strategies = playernames.map(x => fen.original_players[x].strategy);

	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, Z.options);

	//console.log('playernames',playernames,'playmodes',playmodes)
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.plorder, Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.plorder, fen.stage, fen.turn, 1, 1, fen.phase];

	if (DA.TESTSTART1) Z.turn = fen.turn = [Z.host];

	let i = 0; playernames.map(x => { let pl = fen.players[x]; pl.name = x; pl.strategy = strategies[i]; pl.playmode = playmodes[i++]; });

	take_turn_fen_clear();
}
function onclick_restart_move() { clear_transaction(); onclick_reload(); }
function onclick_reset_all() { stopgame(); phpPost({ app: 'simple' }, 'delete_tables'); }
function onclick_skip() {
	//removeInPlace(Z.turn,Z.uplayer);
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	if (game == 'spotit') return;
	else if (game == 'bluff' && stage == 1 || game == 'ferro' && stage == 'auto_ack') { onclick_ack(); }
	else if (game == 'aristo') {
		Z.uplayer = Z.turn[0];
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		ai_move();
	} else {
		let plskip = Z.turn[0];
		Z.turn = [get_next_player(Z, plskip)];
		Z.uplayer = plskip;
		take_turn_fen();
	}
}
function onclick_skip_membership_selection() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: rChoose(pl.hand) };
	}

	relegate_to_host(Z.playerdata);
	//accuse_evaluate_votes();
	// let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	// for (const plname in fen.players) {
	// 	fen.players[plname].membership = '2Hn';
	// }
	// //fen.policies = ['QHn'];
	// start_new_poll();

}
function onclick_vote_empty() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		pld.state = { item: '' };
	}

	relegate_to_host(Z.playerdata);
	//accuse_evaluate_votes();
}
function onclick_vote_president() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pls = rChoose(Z.turn, 2);
	let pld0 = Z.playerdata.find(x => x.name == pls[0]);
	let pld1 = Z.playerdata.find(x => x.name == pls[1]);
	pld0.state = { item: get_random_ballot_card() };
	pld1.state = { item: get_random_ballot_card() };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_random() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: (coin() ? '' : rChoose(pl.hand)) };
	}
	relegate_to_host(Z.playerdata);
	//accuse_evaluate_votes();
}
function onclick_vote_1() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pld = Z.playerdata.filter(x => !isDict(x.state));
	let pld1 = rChoose(pld);
	pld1.state = { item: rChoose(fen.players[pld1.name].hand) };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_red() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		let list = pl.hand.filter(x => get_color_of_card(x) == 'red');
		pld.state = { item: isEmpty(list) ? '' : rChoose(list) };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_start_spotit() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	Z.stage = 'move';
	Z.turn = jsCopy(Z.plorder);
	take_turn_fen();

}
function onclick_status() { query_status(); }
function onclick_table(tablename) {
	//console.log('onclick_table', tablename);
	//ensure_polling();
	send_or_sim({ friendly: tablename, uname: U.name }, 'table');
}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_tithe_all() {

	//each player must get tithes={val:x};
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.tithes)) { continue; }
		pl.tithes = { val: rNumber(8, 10) };
	}

	proceed_to_newcards_selection();
}
function onclick_user(uname) {
	//console.log('onclick_user',uname);
	U = firstCond(Serverdata.users, x => x.name == uname);
	localStorage.setItem('uname', U.name);
	DA.secretuser = U.name;
	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
	let img = elem.children[0];

	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
	mFadeClear('dUsers', 300);

}
function onclick_view_buildings() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	let buildings = UI.players[uplayer].buildinglist;

	for (const b of buildings) b.items.map(x => face_up(x));
	TO.buildings = setTimeout(hide_buildings, 5000);
	//console.log('buildings',buildings);
}

function toggle_select(item, funcs) {
	let params = [...arguments];
	//console.log('pic', item, 'list', params[2]);
	let ifunc = (valf(item.ifunc, 0) + 1) % funcs.length; let f = funcs[ifunc]; f(item, ...params.slice(2));
}
function style_not_playing(item, game, list) {
	//console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: 'transparent', fg: 'black' });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 0; item.playmode = 'none'; removeInPlace(list, item);
	item.isSelected = false;
}
function style_playing_as_human(item, game, list) {
	//console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: get_user_color(uname), fg: colorIdealText(get_user_color(uname)) });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 1; item.playmode = 'human'; list.push(item);
	item.isSelected = true;

}
function style_playing_as_bot(item, game, list) {
	//console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username'); let bg = get_game_color(game);
	mStyle(ui, { bg: bg, fg: colorIdealText(bg) });
	arrLast(arrChildren(ui)).innerHTML = uname.substring(0, 3) + 'bot';
	item.ifunc = 2; item.playmode = 'bot';
	item.isSelected = true;

}













