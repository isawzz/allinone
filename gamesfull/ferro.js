
function ferro() {
	const rankstr = '23456789TJQKA*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		options.jokers_per_group = 1;
		fen.allGoals = ['7R', '55', '5', '44', '4', '33', '3'];
		fen.availableGoals = options.maxrounds == 1 ? [rChoose(fen.allGoals)] : options.maxrounds < 7 ? rChoose(fen.allGoals, options.maxrounds) : fen.allGoals;
		//available goals muessen nach schwierigkeit sortiert werden!!!!! 
		fen.availableGoals.sort((a, b) => fen.allGoals.indexOf(a) - fen.allGoals.indexOf(b)); //sorted most difficult first

		//test if availableGoals richtig sortiert!

		fen.roundGoals = arrReverse(fen.availableGoals); //sorted easiest first!
		//console.log('availableGoals', fen.availableGoals);

		//calc how many decks are needed (basically 1 suit per person, plus 1 for the deck)
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		//console.log('num_decks', num_decks);
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		if (DA.TESTING != true) { shuffle(fen.plorder);shuffle(fen.plorder); } //shuffletest(fen.plorder);		}
		let starter = fen.plorder[0];
		//console.log('options', options);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				roundgoal: false,
				coins: options.coins, //0, //10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = {};
			for (const g of fen.availableGoals) { pl.goals[g] = 0; }//console.log('g',g);  { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };

			//console.log('pl.goals',plname, pl.goals);

			//if (DA.TEST0 == true && plname == starter) { pl.hand = ['AHn', 'AHn', 'AHn', 'AHn']; }
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function activate_ui() { ferro_activate_ui(); }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function clear_ack() {
		if (Z.stage == 'round_end') { start_new_round_ferro(); take_turn_fen(); }
		else if (Z.stage != 'card_selection') {
			//gib jedem spieler der nicht playerdata hat false
			//console.log('clear_ack', Z.stage, jsCopy(Z.fen));
			for (const plname of Z.fen.canbuy) {
				let pldata = firstCond(Z.playerdata, x => x.name == plname);
				if (isdef(pldata) && lookup(pldata, ['state', 'buy']) == true) {
					Z.fen.buyer = plname;
					break;
				}
			}
			Z.stage = 'can_resolve';
			ferro_change_to_card_selection();
		}
	}
	function present(dParent) { ferro_present(dParent); }
	function stats(dParent) { ferro_stats(dParent); }
	function state_info(dParent) { ferro_state(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}

function ferro_pre_action() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	switch (stage) {
		case 'can_resolve': if (Z.options.auto_weiter) ferro_change_to_card_selection(); else { select_add_items(ui_get_string_items(['weiter']), ferro_change_to_card_selection, 'may click to continue', 1, 1, Z.mode == 'multi'); select_timer(2000, ferro_change_to_card_selection); } break;
		case 'buy_or_pass': if (!is_playerdata_set(uplayer)) { select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click discard pile to buy or pass', 1, 1); if (uplayer != 'nasi') select_timer(Z.options.thinking_time * 1000, ferro_ack_uplayer); } break;
		case 'card_selection': select_add_items(ui_get_ferro_items(uplayer), fp_card_selection, 'must select one or more cards', 1, 100); break;
		default: console.log('stage is', stage); break;
	}
	//ensure_buttons_visible_ferro();
}

//main
function ferro_present(dParent) {

	if (DA.simulate == true) show('bRestartMove'); else hide('bRestartMove'); //console.log('DA', DA);

	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);

	ferro_stats(dRechts);

	show_history(fen, dRechts);

	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ferro_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ferro_get_card);
	//console.log('deck_discard',deck_discard);
	if (!isEmpty(deck_discard.items)) face_up(deck_discard.get_topcard());

	order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];

		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));

		mFlexWrap(d);
		mLinebreak(d, 10);

		let hidden = compute_hidden(plname);

		ferro_present_player(plname, d, hidden);
	}

	//console.log('playerdata changed', Z.playerdata_changed_for);
	Z.isWaiting = false;
	if (Z.stage == 'round_end') {
		show_waiting_for_ack_message();
		if (Z.role=='active' || i_am_host()) {
			show('bClearAck');
		}

		//*** auto resolve *** */
	} else if (Z.stage == 'buy_or_pass' && uplayer == fen.trigger && ferro_check_resolve()) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen(); return;
	} else if (Z.stage == 'buy_or_pass' && (Z.role != 'active' || is_playerdata_set(uplayer))) {

		//console.log('HAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOO')

		//get players in turn that have not yet set playerdata
		assertion(isdef(Z.playerdata), 'playerdata is not defined in buy_or_pass (present ferro)');
		let pl_not_done = Z.playerdata.filter(x => Z.turn.includes(x.name) && isEmpty(x.state)).map(x => x.name);
		// show_waiting_message(`waiting for ${pl_not_done.join(', ')} to make buy decision`);
		show_waiting_message(`waiting for possible buy decision...`);
		Z.isWaiting = true;
		//ich soll hier auch den statisTitle machen und sanduhr stoppen fuer diesen player!!! und alle players die bereits done sind!
		//if (Z.role == 'active') { Z.role = 'waiting'; staticTitle('waiting for ' + pl_not_done.join(', ')); }
	}

	show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname, { bottom: -2 });
	new_cards_animation();


}
function ferro_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	Config.ui.card.h = ishidden ? 100 : 150;
	Config.ui.container.h = Config.ui.card.h + 30;

	if (!ishidden) pl.hand = correct_handsorting(pl.hand, plname);

	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ferro_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }

	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_lead_hand(j, d, { maleft: 12, h: 130 }, `players.${plname}.journeys.${i}`, '', ferro_get_card);//list, dParent, path, title, get_card_func
		//jui.path = `players.${uplayer}.journeys.${i}`;
		i += 1;
		ui.journeys.push(jui);
	}
}
function ferro_activate_ui() { ferro_pre_action(); }
function ferro_state(dParent) {

	if (DA.TEST0 == true) {
		//testing output
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {

			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;

			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				//console.log('state', name, state, typeof(state));
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`; // (${typeof state})`;
				//let buys=!isEmpty(data.state)?data.state.buy:'_';
				//html += ` ${name}:${buys}`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}

		dParent.innerHTML = html;
		return;
	}

	if (Z.stage == 'round_end') {
		dParent.innerHTML = `Round ${Z.round} ended by &nbsp;${get_user_pic_html(Z.fen.round_winner, 30)}`;
	} else if (is_fixed_goal()) {
		let goal = get_round_goal();
		console.log('goal', goal);
		let goal_html = `<div style="font-weight:bold;border-radius:50%;background:white;color:red;line-height:100%;padding:4px 8px">${goal}</div>`;
		dParent.innerHTML = `Round ${Z.round}:&nbsp;&nbsp;minimum:&nbsp;${goal_html}`;
	} else {
		let user_html = get_user_pic_html(Z.stage == 'buy_or_pass' ? Z.fen.nextturn[0] : Z.turn[0], 30);
		// dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
		dParent.innerHTML = `Round ${Z.round}:&nbsp;${Z.stage == 'buy_or_pass' ? 'next ' : ''}turn: ${user_html} `;
	}
}
function ferro_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mStyle(d, { wmin: 150 }); mLinebreak(d);
		player_stat_count('coin', pl.coins, d);
		// player_stat_count('hand with fingers splayed', pl.hand.length, d);
		//console.log('pl.hand', pl.hand);
		player_stat_count('pinching hand', pl.hand.length, d);
		if (!compute_hidden(plname)) player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand), d);
		player_stat_count('star', pl.score, d);

		mLinebreak(d, 4);
		//console.log('is _fixed goal', _is_fixed_goal());
		if (!is_fixed_goal()) {
			let d2 = mDiv(d, { padding: 4, display: 'flex' }, `d_${plname}_goals`);
			if (fen.availableGoals.length < 4) { mStyle(d2, { wmin: 120 }); mCenterFlex(d2); }
			let sz = 16;
			let styles_done = { h: sz, fz: sz, maleft: 6, fg: 'grey', 'text-decoration': 'line-through green', weight: 'bold' };
			let styles_todo = { h: sz, fz: sz, maleft: 6, border: 'red', weight: 'bold', padding: 4, 'line-height': sz }; // 'text-decoration': 'underline red', 

			for (const k of fen.roundGoals) { //in pl.goals) {
				mText(k, d2, pl.goals[k] ? styles_done : styles_todo);
			}
		}

		if (fen.turn.includes(plname)) { show_hourglass(plname, d, 30, { left: -3, top: 0 }); }
	}
}

//#region turn changes
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	//multi data: fen.canbuy, fen.trigger, fen.buyer, fen.nextturn (und playerdata natuerlich!)
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	fen.canbuy = newturn.filter(x => x != uplayer && fen.players[x].coins > 0); //fen.canbuy list ist angeordnet nach reihenfolge der frage

	fen.trigger = uplayer; //NEIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!get_admin_player(fen.plorder); // uplayer;

	//der grund warum es nicht geht dass der trigger zugleich in canbuy ist, ist dass er ja kein ack ausloesen kann und deshalb
	//fuer immer => ueberleg das!!!!

	//console.log('trigger is', fen.trigger);
	fen.buyer = null;
	fen.nextturn = [nextplayer];

	if (isEmpty(fen.canbuy)) { Z.stage = 'can_resolve'; ferro_change_to_card_selection(); return; }
	else if (Z.mode == 'multi') { [Z.stage, Z.turn] = ['buy_or_pass', fen.canbuy]; fen.keeppolling = true; take_turn_fen_clear(); }
	else {
		//das ist nur in hotseat mode!!!
		fen.canbuy.map(x => fen.players[x].buy = 'unset');
		fen.lastplayer = arrLast(fen.canbuy);
		[Z.stage, Z.turn] = ['buy_or_pass', [fen.canbuy[0]]];
		take_turn_fen();
	}
}
function ferro_ack_uplayer() { if (Z.mode == 'multi') { ferro_ack_uplayer_multi(); } else { ferro_ack_uplayer_hotseat(); } }
function ferro_ack_uplayer_multi() {
	let [A, uplayer] = [Z.A, Z.uplayer];
	stopPolling();
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	let can_resolve = ferro_check_resolve();
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';

		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen_write();
	} else { take_turn_multi(); }
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];

	assertion(stage == 'buy_or_pass', "check_resolve NOT IN buy_or_pass stage!!!!!!!!!");
	assertion(isdef(pldata), "no playerdata in buy_or_pass stage!!!!!!!!!!!!!!!!!!!!!!!");

	let done = true;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;

		//console.log('state', plname, state);
		if (isEmpty(state)) done = false;
		else if (state.buy == true) fen.buyer = plname;
		else continue;

		break;
	}
	return done;
}
function ferro_ack_uplayer_hotseat() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let buy = !isEmpty(A.selected) && A.selected[0] == 0;
	if (buy || uplayer == fen.lastplayer) { fen.buyer = uplayer;[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve']; }
	else { Z.turn = [get_next_in_list(uplayer, fen.canbuy)]; }
	take_turn_fen();
}
function ferro_change_to_card_selection() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	assertion(stage == 'can_resolve', "change to card_selection: NOT IN can_resolve stage!!!!!!!!!!!!!!!!!!!!!!");
	assertion(Z.uplayer == 'mimi' || Z.uplayer == fen.trigger, "mixup uplayer in change_to_card_selection!!!!!!!!!!!!!!!!!!!!!!");

	// if buyer, buys
	if (isdef(fen.buyer)) {
		let plname = fen.buyer;
		let pl = fen.players[plname];
		let card = fen.deck_discard.shift();
		pl.hand.push(card);
		//console.log('buyer', plname, 'should get', card);
		lookupAddToList(pl, ['newcards'], card);
		//lookupAddToList(Clientdata, ['newcards'], card);
		deck_deal_safe_ferro(fen, plname, 1);
		pl.coins -= 1; //pay
		ari_history_list([`${plname} bought ${card}`], 'buy');
	}

	//nextplayer draws
	let nextplayer = fen.nextturn[0];
	deck_deal_safe_ferro(fen, nextplayer, 1);

	//if (isdef(fen.buyer)) console.log('newcards', fen.buyer, fen.players[fen.buyer].newcards);
	//console.log('newcards', nextplayer, fen.players[nextplayer].newcards);

	Z.turn = fen.nextturn;
	Z.stage = 'card_selection';

	for (const k of ['buyer', 'canbuy', 'nextturn', 'trigger', 'lastplayer']) delete fen[k];//cleanup buy_or_pass multi-turn!!!!!!!!!!!!!
	delete fen.keeppolling;

	clear_transaction();
	take_turn_fen();
}
//#endregion

// ferro helpers
function calc_ferro_score(roundwinner) {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	assertion(roundwinner == uplayer, '_calc_ferro_score: roundwinner != uplayer');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		pl.newcards = [];
		if (nundef(pl.score)) pl.score = 0;
		if (uplayer == plname) pl.score -= round * 5;
		else pl.score += calc_hand_value(pl.hand);
	}
}
function length_of_each_array(arr) {
	let res = []
	for (const a of arr) {
		res.push(a.length);
	}
	return res.sort((a, b) => b - a);

	//return arr.map(x => x.length).sort((a, b) => b-a);
}
function longest_array(arr) {
	let max = 0;
	for (const a of arr) {
		if (a.length > max) max = a.length;
	}
	return max;

}
function calc_ferro_highest_goal_achieved(pl) {
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};

	for (const k of Z.fen.availableGoals) { // ['7R', '55', '5', '44', '4', '33', '3']) {
		if (pl.goals[k]) {
			console.log('player', pl.name, 'already achieved goal', k);
			continue;
		}
		let achieved = di[k];
		//console.log('player', pl.name, 'achieved', k, achieved);
		if (achieved) {
			//console.log('goal', k, 'available to', pl.name);
			return k;
		}
	}
	//console.log('no goal is available that matches the revealed sets! THIS SHOULD BE IMPOSSIBLE!!!!!!');
	return null;
}
function deck_deal_safe_ferro(fen, plname, n) {
	if (fen.deck.length < n) {
		fen.deck = fen.deck.concat(fen.deck_discard.reverse());
		fen.deck_discard = [];
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	// new_cards.map(x => lookupAddToList(Clientdata, ['newcards'], x));
	return new_cards;
}
function end_of_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	//score all players
	calc_ferro_score(uplayer);
	if (Z.options.phase_order == 'anti') {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			if (!pl.roundgoal) pl.goals[get_round_goal()] = true;
			// let number_of_goals_achieved = 0;
			// for (const g in pl.goals) { if (pl.goals[g] == true) { number_of_goals_achieved++; } } //console.log('g',g,pl.goals); }}
			// //console.log(plname + ': ' + number_of_goals_achieved);
			// if (number_of_goals_achieved < Z.round) pl.goals[get_round_goal()] = true;
		}
	}
	ari_history_list([`${uplayer} wins the round`], 'round');
	fen.round_winner = uplayer;

	[Z.stage, Z.turn] = ['round_end', [Z.host]]; //jsCopy(plorder)];
	take_turn_fen();

}
function ferro_is_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	//let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	if (cards.length < 3) return false;
	let num_jollies_in_cards = cards.filter(x => is_joker(x)).length;
	if (num_jollies_in_cards > max_jollies_allowed) return false;

	cards = sortCardItemsByRank(cards.map(x => x), rankstr = '23456789TJQKA*');

	let rank = cards[0].rank;
	let isgroup = cards.every(x => x.rank == rank || is_joker(x));

	//check if all cards have either different suit or are jolly
	//check for duplicate suits in cards
	let suits = cards.filter(x => !is_joker(x)).map(x => x.suit);
	let num_duplicate_suits = suits.filter(x => suits.filter(y => y == x).length > 1).length;
	if (isgroup && !group_same_suit_allowed && num_duplicate_suits > 0) return false;
	else if (isgroup) return cards.map(x => x.key);

	let suit = cards[0].suit;
	if (!cards.every(x => is_jolly(x.key) || x.suit == suit)) return false;

	//if duplicate keys in cards, then it's not a set
	let keys = cards.map(x => x.key);
	if (keys.length != new Set(keys).size) return false;

	//console.log('checking for sequence!!!!!!!!!!!!!!!!!!!!!')
	let at_most_jollies = Math.min(num_jollies_in_cards, max_jollies_allowed);
	let num_jolly = sortCardItemsToSequence(cards, rankstr = '23456789TJQKA', at_most_jollies);
	//console.log('num_jolly', num_jolly);
	let cond1 = num_jolly <= at_most_jollies; //this sequence does not need more jollies than it should
	let cond2 = cards.length >= seqlen; //console.log('cond2', cond2);
	//console.log('cards', cards);
	if (cond1 && cond2) return cards.map(x => x.key); else return false;
}
function ferro_process_discard() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];

	//discard is imminent! check if _roundgoal has changed!
	if (!isEmpty(pl.journeys) && !pl.roundgoal) {
		//not fixed: calculate highest available goal and set it true
		//_roundgoal has been reached!
		let goal = is_fixed_goal() ? get_round_goal() : calc_ferro_highest_goal_achieved(pl);
		pl.roundgoal = goal;
		pl.goals[goal] = true;
		ari_history_list([`${pl.name} achieved goal ${pl.roundgoal}`], 'achieve');
	}

	let c = A.selectedCards[0].key;
	elem_from_to_top(c, fen.players[uplayer].hand, fen.deck_discard);
	ari_history_list([`${uplayer} discards ${c}`], 'discard');

	if (fen.players[uplayer].hand.length == 0) { end_of_round_ferro(); } else ferro_change_to_buy_pass(); //ferro_change_to_ack_round();

}
function ferro_process_set(keys) {
	//console.log('ferro_process_set', keys);
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	//console.log('group', jsCopy(keys)); //schon falsch!!!


	if (is_group(keys)) {
		//console.log('group', keys);
		keys = sort_cards(keys, true, 'CDSH', true, '23456789TJQKA*');
	}
	let j = [];
	keys.map(x => elem_from_to(x, fen.players[uplayer].hand, j));
	fen.players[uplayer].journeys.push(j);

	//console.log('journey is finally', j)

	ari_history_list([`${uplayer} reveals ${j.join(', ')}`], 'auflegen');
	Z.stage = 'card_selection';

}
function ferro_process_jolly(key, j) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	//console.log('jolly', jsCopy(j));
	let a = key;
	let b = j.find(x => x[0] == '*');
	//console.log(`${a} replaced by ${b}`);
	arrReplace1(fen.players[uplayer].hand, a, b);
	replace_jolly(key, j);
	ari_history_list([`${uplayer} replaces for jolly`], 'jolly');
	Z.stage = 'card_selection';
}
function ferro_transaction_error() {
	let d = mDiv(dError, { padding: 10, align: 'center' }, null, `Illegal turn sequence - transaction cannot be completed!!!<br>press reload and try again!<br>`);
	mButton('RELOAD', onclick_reload, d, { margin: 10 });
	clear_transaction();
	//onclick_reload();
}
function find_players_with_max_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let maxscore = -Infinity;
	let maxscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score > maxscore) { maxscore = pl.score; maxscorepls = [plname]; }
		else if (pl.score == maxscore) maxscorepls.push(plname);
	}
	return maxscorepls;
}
function find_players_with_min_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let minscore = Infinity;
	let minscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score < minscore) { minscore = pl.score; minscorepls = [plname]; }
		else if (pl.score == minscore) minscorepls.push(plname);
	}
	return minscorepls;

}
function fp_card_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selectedCards = A.selected.map(x => A.items[x]);
	let cards = selitems.map(x => x.o);
	let cmd = A.last_selected.key;

	if (cmd == 'discard') {
		//if only 1 card selected, discard it
		//first deal with error cases!
		if (selitems.length != 1) { select_error('select exactly 1 hand card to discard!'); return; }

		let item = selitems[0];
		if (!item.path.includes(`${uplayer}.hand`)) { select_error('select a hand card to discard!', () => { ari_make_unselected(item); A.selected = []; }); return; }

		assertion(DA.transactionlist.length == 0 || DA.simulate, '!!!!!!!!!!!!!!!!transactionlist is not empty!');
		if (DA.transactionlist.length > 0) {
			console.log('VERIFYING TRANSACTION............')
			//console.log('DA.transactionlist', jsCopy(DA.transactionlist));
			let legal = verify_min_req();
			clear_transaction();
			if (legal) {
				ferro_process_discard(); //discard selected card
				//take_turn_single();
			} else {
				ferro_transaction_error();
			}
		} else {
			//console.log('should process discard!!!')
			//let legal = verify_min_req();

			ferro_process_discard(); //discard selected card
			//take_turn_single();
		}
	} else if (cmd == 'jolly') {

		//first, error cases: have to select exactly 2 cards
		if (selitems.length != 2) { select_error('select a hand card and the jolly you want!'); return; }
		//one card has to be hand, the other jolly from a group
		let handcard = selitems.find(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let jolly = selitems.find(x => is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (!isdef(handcard) || !isdef(jolly)) { select_error('select a hand card and the jolly you want!'); return; }

		let key = handcard.key;
		let j = path2fen(fen, jolly.path);
		if (!jolly_matches(key, j)) { select_error('your card does not match jolly!'); return; }

		//if player has not yet played a set, simulate transaction!!!!
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		ferro_process_jolly(key, j);
		take_turn_fen();

	} else if (cmd == 'auflegen') {

		if (selitems.length < 3) { select_error('select cards to form a group!'); return; }
		else if (pl.hand.length == selitems.length) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		// console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', cards.map(x=>x.key))
		let newset = ferro_is_set(cards, Z.options.jokers_per_group);

		//console.log('nach is_set', newset);

		//console.log('is_set', is_set);
		if (!newset) { select_error('this is NOT a valid set!'); return; }

		//special case fuer 7R: geht nur in 7R round wenn fixed order
		let is_illegal = is_correct_group_illegal(cards);
		//console.log('is_legal', is_legal);

		if (is_illegal) { select_error(is_illegal); return; }

		if (pl.journeys.length == 0) { add_transaction(cmd); }
		let keys = newset; //cards.map(x => x.key);
		ferro_process_set(keys);
		take_turn_fen();

	} else if (cmd == 'anlegen') {

		if (selitems.length < 1) { select_error('select at least 1 hand card and the first card of a group!'); return; }
		else if (pl.hand.length == selitems.length - 1) { select_error('you need to keep a card for discard!!', clear_selection); return; }

		let handcards = selitems.filter(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let groupcard = selitems.find(x => !is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (isEmpty(handcards) || !isdef(groupcard)) { select_error('select 1 or more hand cards and the first card of a group!'); return; }

		//test try_anlegen for all handcards
		//if more than one handcard, test if all have the same rank
		let hand_rank = handcards[0].key[0];
		let handcards_same_rank = handcards.every(x => x.key[0] == hand_rank);
		let j = path2fen(fen, groupcard.path);

		if (is_group(j)) {
			if (!handcards_same_rank) { select_error('all hand cards must have the same rank!'); return; }

			let group_rank = groupcard.key[0];
			if (group_rank == hand_rank) {
				//console.log('anlegen is legal');

				for (const h of handcards) {
					elem_from_to(h.key, fen.players[uplayer].hand, j);
				}
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				return;
			} else {
				select_error('hand cards do not match the group!');
				return;
			}
		} else { //its a sequence!
			//sort hand cards
			//more than 1 hand_card!
			let suit = get_sequence_suit(j);
			let handkeys = handcards.map(x => x.key); //console.log('suit',suit,'keys', keys);
			if (firstCond(handkeys, x => x[1] != suit)) { select_error('hand card suit does not match the group!'); return; }

			//look if first key is a jolly
			let ij = j.findIndex(x => is_jolly(x));
			let j_has_jolly = ij > -1;
			let rank_to_be_relaced_by_jolly = j_has_jolly ? find_jolly_rank(j) : null;

			let r = rank_to_be_relaced_by_jolly;
			if (r) {
				j[ij] = r + suit + 'n';
			}

			//now should have a seequence without jolly!
			keys = handkeys.concat(j);
			let allcards = keys.map(x => ferro_get_card(x)); // handcards.concat(j.map(x=>ferro_get_card(x)));
			let jneeded = sortCardItemsToSequence(allcards, undefined, 0);

			//now replace back if r != null
			//console.log('new sequence', allcards.map(x => x.key), 'jneeded', jneeded);
			if (jneeded == 0) {
				//if r != null need to replace r key by * in final sequence
				let seq = allcards.map(x => x.key);
				if (r) { arrReplace1(seq, r + suit + 'n', '*Hn'); }
				//console.log('new sequence', seq);
				j.length = 0;
				j.push(...seq);
				for (const k of handkeys) { removeInPlace(fen.players[uplayer].hand, k); }
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				//console.log('YES!');

			} else {
				if (r != null) { j[ij] = '*Hn'; }
				select_error('hand cards cannot be added to sequence!');
				return;
			}
		}
	}
}
function get_available_goals(plname) {
	//return ['3', '33', '4', '44', '5', '55', '7R'].filter(x => !Z.fen.players[plname].goals[x]);
	return Z.fen.availableGoals.filter(x => !Z.fen.players[plname].goals[x]);
}
function get_round_goal() { return Z.fen.roundGoals[Z.round - 1]; } //get_keys(Z.fen.players[Z.uplayer].goals).sort()[Z.round - 1]; }
function is_correct_group(j, n = 3) { let r = j[0][0]; return j.length >= n && has_at_most_n_jolly(j, Z.options.jokers_per_group) && j.every(x => is_jolly(x) || x[0] == r); }
function is_fixed_goal() { return Z.options.phase_order == 'fixed'; }
function is_group(j) {
	if (j.length < 3) return false;
	let rank = firstCond(j, x => !is_jolly(x))[0];
	return j.every(x => is_jolly(x) || x[0] == rank);
}
function is_sequence(j) { return !is_group(j); }
function is_correct_group_illegal(cards) {
	//assumes that if this is a sequence, the sequence is correct!
	//this just tests whether the player is allowed to put down a 7sequence at this time

	//console.log('_is_correct_group_illegal', cards);

	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return false;

	if (is_fixed_goal() && get_round_goal() != '7R') {
		//console.log('DESHALB!!!')
		return `the goal for this round is ${get_round_goal()}!`;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return `you can only have one sequence of 7!`;

	if (pl.journeys.find(x => is_sequence(x))) return `you can only have one sequence of 7!`;

	if (pl.roundgoal) return `row of 7 NOT allowed except if it is the round goal!`;

	return false;

}
function onclick_clear_selection_ferro() { clear_selection(); }
function start_new_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	Z.stage = 'card_selection';
	fen.plorder = arrCycle(plorder, 1);
	let starter = fen.plorder[0];
	Z.turn = fen.turn = [starter];
	let deck = fen.deck = create_fen_deck('n', fen.num_decks, fen.num_decks * 4);
	let deck_discard = fen.deck_discard = [];
	shuffle(deck);

	let handsize = valf(Number(Z.options.handsize), 11);
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.journeys = [];
		pl.roundgoal = false;
		pl.roundchange = true;
		delete pl.handsorting;
	}
	Z.round += 1;
	//console.log('starter',starter,'turn',Z.turn,'round',Z.round);
	if (Z.round > Z.options.maxrounds) {
		ari_history_list([`game over`], 'game');
		Z.stage = 'game_over';
		fen.winners = find_players_with_min_score();
	}

}
function ui_get_buy_or_pass_items() {
	//console.log('uplayer',uplayer,_UI.players[uplayer])
	let items = [], i = 0;
	if (!isEmpty(UI.deck_discard.items)) items.push(ui_get_deck_item(UI.deck_discard));

	items = items.concat(ui_get_string_items(['pass']));

	reindex_items(items);
	return items;
}
function ui_get_ferro_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer);	//hand items

	//dazu alle aufgelegten jollys
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			for (const o of jitem.items) {
				if (!is_joker(o)) { continue; }
				//console.log('card', o, jitem);
				let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
				items.push(item);
			}
		}
	}

	//dazu alle lead cards von aufgelegten groups
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			let o = jitem.items[0]; // lead card
			let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
			items.push(item);
		}
	}

	//dazu die commands
	let cmds = ui_get_submit_items(['discard', 'auflegen', 'jolly', 'anlegen']);
	items = items.concat(cmds);

	reindex_items(items);
	return items;
}
function ui_get_submit_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i, submit_on_click: true, itemtype: 'submit' };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function verify_min_req() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};

	let goals = is_fixed_goal() ? [get_round_goal()] : get_available_goals(uplayer);
	//console.log('open and available',goals);
	for (const g of goals) {
		if (di[g] == true) { return true; } //console.log('achieved',g);
	}
	//console.log('none achieved',goals);
	return false;

}







