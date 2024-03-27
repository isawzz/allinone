//#region animations! NEUE UI!
function animcoin(plname, ms = 800, callback = null) {
	let d = UI.player_stat_items[plname].dCoin;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(3)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		//fill: 'forwards',
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = () => {
		let uplayer = Z.uplayer;
		let dAmount = UI.player_stat_items[uplayer].dAmount;
		dAmount.innerHTML = Z.fen.players[uplayer].coins;
		mStyle(dAmount, { fg: 'red' });
		if (callback) callback();
	};
}
function animbuilding(ui_building, ms = 800, callback = null) {
	let d = ui_building.cardcontainer;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		//fill: 'forwards',
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = callback;

}
function animtest(d, ms = 1000, callback) {
	let spinAway = [
		{ transform: 'rotate(0) scale(1)' },
		{ transform: 'rotate(360deg) scale(0)' }
	];

	spinAway = [
		{ transform: 'rotate(0) scale(1)' },
		{ transform: 'rotate(180deg) scale(0)' },
		{ transform: 'rotate(360deg) scale(2)' }
	];

	spinAway = [
		{ transform: 'scale(1)' },
		{ transform: 'scale(3)' },
		{ transform: 'scale(1)' }
	];

	// spinAway = [
	// 	{ transform: 'scale(1)' },
	// 	{ transform: 'scale(3)' },
	// 	{ transform: 'scale(.8)' },
	// 	{ transform: 'scale(1)' },
	// ];

	// spinAway = [
	// 	{ transform: 'scale(1)', 'box-shadow': '0 0 33px 0' },
	// 	{ transform: 'scale(3)', 'box-shadow': '0 0 33px 0' },
	// 	{ transform: 'scale(.8)' },
	// 	{ transform: 'scale(1)' },
	// ];

	let options = {
		duration: ms,
		iterations: 1,
		//fill: 'forwards',
		easing: 'ease-out', //'cubic-bezier(.24,.65,.78,.03)',
		// easing: 'cubic-bezier(.51,.65,.88,.65)',
		// easing: 'cubic-bezier(.71,.53,.08,.93)',
		//easing: 'cubic-bezier(.89,.31,.67,1.05)', // 'cubic-bezier(.55,.22,.52,.98)' //'cubic-bezier(1,-0.03,.86,.68)'
	}

	d.addEventListener('click', (ev) => {
		evNoBubble(ev);
		let a = d.animate(spinAway, options);
		a.onfinish = callback;
	});
}
function anipulse(d, ms = 3000, callback) {
	//create a glow animation
	let a = d.animate(
		[{
			'background-color': '#2ba805',
			'box-shadow': '0 0 3px #2ba805'
		},
		{
			'background-color': `#49e819`,
			'box-shadow': `0 0 10px #49e819`,
		},
		{
			'background-color': `#2ba805`,
			'box-shadow': `0 0 3px #2ba805`
		}], { fill: 'both', duration: ms, easing: 'ease', delay: 1000 });
	a.onfinish = callback;
	return a;

}
function remove_ui_items(items) {
	//UI muss NICHT consistent bleiben!!!! das wird nur bevor take turn gemacht!!!
	console.log('remove_ui_items', items);
	for (const item of items) {
		let card = item.o;
		make_card_unselectable(item);
		iDiv(item.o).remove();
	}
}

//#endregion

function aristo() {
	const rankstr = 'A23456789TJQK*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = create_fen_deck('n', num_decks);
		//console.log('deck',deck)
		//console.log('deck length is',deck.length);
		shuffle(deck);
		let deck_commission = fen.deck_commission = create_fen_deck('c'); shuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = create_fen_deck('l'); shuffle(deck_luxury);
		let deck_rumors = fen.deck_rumors = exp_rumors(options) ? create_fen_deck('r') : []; shuffle(deck_rumors);
		shuffle(fen.plorder);
		fen.market = [];
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = []; //eg., [Q,A,5,...]
		fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
		fen.church = exp_church(options) ? deck_deal(deck, players.length) : [];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 7),
				commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
				rumors: exp_rumors(options) ? deck_deal(deck_rumors, players.length - 1) : [],
				journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
				buildings: { farm: [], estate: [], chateau: [] },
				stall: [],
				stall_value: 0,
				coins: 3,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.phase = 'king'; //TODO: king !!!!!!!
		fen.num_actions = 0;
		fen.herald = fen.plorder[0];
		fen.heraldorder = jsCopy(fen.plorder);

		if (exp_commissions(options)) {
			ari_history_list([`commission trading starts`], 'commissions', fen);
			//[fen.stage, fen.turn] = [23, [fen.plorder[0]]]; fen.comm_setup_num = 3;
			[fen.stage, fen.turn] = [23, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; fen.comm_setup_num = 3; fen.keeppolling = true;
		} else if (exp_rumors(options) && fen.plorder.length > 2) {
			ari_history_list([`gossiping starts`], 'rumors', fen);
			[fen.stage, fen.turn] = [24, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; 
		} else[fen.stage, fen.turn] = set_journey_or_stall_stage(fen, options, fen.phase);

		return fen;
	}
	function activate_ui() { ari_activate_ui(); }
	function check_gameover(z) { return isdef(z.fen.winners) ? z.fen.winners : false; }
	function present(dParent) { ari_present(dParent); }
	function stats(dParent) { ari_stats(dParent); }
	function state_info(dParent) { ari_state(dParent); }
	function get_selection_color(item) {
		//console.log('stage', Z.stage, 'A.selected',Z.A.selected,'item', item);
		if (Z.stage == 41 && Z.A.selected.length == 1) return 'blue'; return 'red';
	}
	return { get_selection_color, rankstr, setup, activate_ui, check_gameover, present, state_info, stats };
}

function ari_pre_action() {
	let [stage, A, fen, phase, uplayer, deck, market] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.deck, Z.market];

	if (Z.num_actions > 0) fen.progress = `(action ${Z.action_number} of ${Z.total_pl_actions})`; else delete fen.progress;

	show_progress();
	switch (ARI.stage[stage]) {
		case 'action: command': Z.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break; //5
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(uplayer), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
				case 'inspect': select_add_items(ui_get_other_buildings(uplayer), process_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(uplayer), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'comm_weitergeben': if (!is_playerdata_set(uplayer)) select_add_items(ui_get_all_commission_items(uplayer), process_comm_setup, `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard`, fen.comm_setup_num, fen.comm_setup_num); break;
		case 'rumors_weitergeben':
			let rumitems = ui_get_rumors_and_players_items(uplayer);
			if (isEmpty(rumitems)) {
				//console.log(`ALL RUMOR ITEMS FOR PLAYER ${uplayer} HAVE BEEN ASSIGNED!!!`);
				show_waiting_message('waiting for other players...');
				Z.state = null;
				let done = rumor_playerdata_complete();
				if (done){
					Z.turn = [Z.host];
					Z.stage = 105; //'next_rumors_setup_stage';
					clear_transaction();
					take_turn_fen();
				}else autopoll();
				
			} else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
			break;
		case 'next_rumor_setup_stage': post_rumor_setup(); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(uplayer), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(uplayer), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(uplayer), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
		case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tithe': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			//fen.tithe_minimum is what fen.minplayer (=uplayer) must reach to tithe
			//first compute if hand and stall cards can get up to minimum
			//console.log('church_minplayer_tithe!', Z.stage, fen.stage);
			let pl = fen.players[uplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			//console.log('gesamtes minplayer blatt + stall', sum);
			let min = fen.tithe_minimum;
			if (sum < min) {
				//jetzt gibt es ein problem! player muss ein building downgraden!
				//fahre fort wie bei downgrade!
				//aber danach muss ich wieder zurueck zu church!!!

				//uplayer looses all hand and stall cards!!!

				ari_history_list([`${uplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				//must select more cards to tithe!
				ari_history_list([`${uplayer} must tithe more cards to reach ${min}!`], 'tithe');
				select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
			}


			break;
		case 'church_newcards':
			//console.log('church_newcards!', Z.stage, fen.stage);
			reveal_church_cards();
			let items = ui_get_church_items(uplayer);
			let num_select = items.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(items, post_church, instr, num_select, num_select);
			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(uplayer), post_complementing_market_after_church, 'may complement stall'); break;
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
		case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}

	
}

//main
function ari_present(dParent) {
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		//console.log('hmin wird gemacht!')
		mStyle(dOben, { hmin: 110 })
	}

	ari_stats(dRechts);

	show_history(fen, dRechts);

	//let h=ARI.hcontainer;
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ari_get_card);
	let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', ari_get_card, true);
	let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', ari_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ari_get_card);

	if (exp_commissions(Z.options)) {
		let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', ari_get_card);
		mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
		let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', ari_get_card);
		// let commissioned = ui.commissioned = ui_type_list(fen.commissioned, ['rank','count'], dOpenTable, {h:130}, 'commissioned', 'commissioned');
		let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', ari_get_card);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}

	if (exp_church(Z.options)) {
		let church = ui.church = ui_type_church(fen.church, dOpenTable, { maleft: 28 }, 'church', 'church', ari_get_card);
		//mMagnifyOnHoverControlPopup(ui.church.cardcontainer);
	}

	if (exp_rumors(Z.options)) {
		let deck_rumors = ui.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 25 }, 'deck_rumors', 'rumors', ari_get_card);
	}


	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];

		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 9, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));

		mFlexWrap(d);
		mLinebreak(d, 9);
		//R.add_ui_node(d, getUID('u'), uplayer);

		let hidden = compute_hidden(plname);

		ari_present_player(plname, d, hidden);
	}

	ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;
	show_view_buildings_button(uplayer);

	let desc = ARI.stage[Z.stage];
	Z.isWaiting = false;

	//console.log('Z.stage', Z.stage, 'uplayer',uplayer, 'desc', desc, 'pldata',firstCond(Z.playerdata,x=>x.name == uplayer));
	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && is_playerdata_set(uplayer)) {
		//console.log('hallo')
		if ((Z.mode == 'hotseat' || Z.host == uplayer) && check_resolve()) {
			//console.log('waiting and hotseat or host && can_resolve!!!!');
			Z.turn = [Z.host];
			Z.stage = 104; //'next_comm_setup_stage';
			//take_turn_fen();
		}
		show_waiting_message(`waiting for other players...`);
		Z.isWaiting = true;
	}
}
function ari_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };

	// pl.hand = fen.stage == '1' ? sort_cards(pl.hand, true, 'CDSH', true, 'A23456789TJQK') : sort_cards(pl.hand, false, null, true, 'A23456789TJQK'); //pl.hand.sort(); GEHT!
	//pl.hand = fen.stage == '1' ? sort_cards(pl.hand, true, 'CDSH', true, 'A23456789TJQK') : sort_cards(pl.hand, false, null, true, 'A23456789TJQK'); //pl.hand.sort(); GEHT!
	// if (!ishidden) pl.hand = correct_handsorting(pl.hand, plname); //NO automatic handsorting

	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ari_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }

	let stall = ui.stall = ui_type_market(pl.stall, d, { maleft: 12 }, `players.${plname}.stall`, 'stall', ari_get_card);
	if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }

	//present commissions
	if (exp_commissions(Z.options)) { 
		if (!ishidden) pl.commissions = correct_handsorting(pl.commissions, plname);
		ui.commissions = ui_type_market(pl.commissions, d, { maleft: 12 }, `players.${plname}.commissions`, 'commissions', Z.stage == 23 ? ari_get_card_large : ari_get_card);

		if (ishidden) { ui.commissions.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.commissions.cardcontainer);
	}

	//present rumors
	if (exp_rumors(Z.options)) { 
		if (!ishidden) pl.rumors = correct_handsorting(pl.rumors, plname);
		ui.rumors = ui_type_market(pl.rumors, d, { maleft: 12 }, `players.${plname}.rumors`, 'rumors', Z.stage == 24 ? ari_get_card_large : ari_get_card);

		if (ishidden) { ui.rumors.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.rumors.cardcontainer);
	}

	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_hand(j, d, { maleft: 12 }, `players.${plname}.journeys.${i}`, '', ari_get_card);//list, dParent, path, title, get_card_func
		//jui.path = `players.${uplayer}.journeys.${i}`;
		i += 1;
		ui.journeys.push(jui);
	}

	mLinebreak(d, 8);

	ui.buildinglist = [];
	ui.indexOfFirstBuilding = arrChildren(d).length;
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let type = k;
			let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card, true, ishidden);
			b_ui.type = k;
			ui.buildinglist.push(b_ui);

			if (b.isblackmailed) { mStamp(b_ui.cardcontainer, 'blackmail'); }

			//if (!ishidden) b_ui.items.map(x=>face_up(x));// {let j=0;b_ui.items.map(x=>{face_up(x));} //if (j++>0) mStyle(iDiv(x),{transform:'scale(.94)',origin:'bottom left'});});}

			lookupAddToList(ui, ['buildings', k], b_ui); //GEHT!!!!!!!!!!!!!!!!!!!!!
			i += 1;
			//console.log('bui eingetragener path ist',b_ui.path)
		}
	}
	//console.log('buildingslist',plname,ui.buildinglist.map(x=>x.type)); // correct!
	//console.log('ui_buildings',ui.buildings);


}
function ari_activate_ui() { ari_pre_action(); }
function ari_state(dParent) {
	function get_phase_html() {
		if (isEmpty(Z.phase) || Z.phase == 'over') return null; //capitalize(Z.friendly);
		let rank = Z.phase[0].toUpperCase();
		let card = ari_get_card(rank + 'Hn', 40);
		let d = iDiv(card);
		mClassRemove(d.firstChild, 'card');
		return iDiv(card).outerHTML;
	}

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

	let user_html = get_user_pic_html(Z.uplayer, 30);
	let phase_html = get_phase_html();

	let html = '';
	if (phase_html) html += `${Z.phase}:&nbsp;${phase_html}`;
	if (Z.stage == 17) { html += `&nbsp;&nbsp;CHURCH EVENT!!!`; }
	else if (TESTING) { html += `&nbsp;&nbsp;&nbsp;stage: ${ARI.stage[Z.stage]}`; }
	else html += `&nbsp;player: ${user_html} `;
	dParent.innerHTML = html;

	//if (phase_html) dParent.innerHTML = `${Z.phase}:&nbsp;${phase_html}&nbsp;player: ${user_html} `;
	// if (phase_html) dParent.innerHTML = `${Z.phase}:&nbsp;${phase_html},&nbsp;&nbsp;stage: ${Z.stage}`;

}
function ari_stats(dParent) {

	let player_stat_items = UI.player_stat_items = ui_player_info(dParent); //fen.plorder.map(x => fen.players[x]));
	let fen = Z.fen;
	let herald = fen.heraldorder[0];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (plname == herald) {
			//console.log('d', d, d.children[0]); let img = d.children[0];
			mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
		}
		if (exp_church(Z.options)) {
			if (isdef(pl.tithes)) {
				player_stat_count('cross', pl.tithes.val, d);

			}
		}
		let dCoin = player_stat_count('coin', pl.coins, d);
		item.dCoin = dCoin.firstChild;
		item.dAmount = dCoin.children[1];

		let list = pl.hand.concat(pl.stall);
		let list_luxury = list.filter(x => x[2] == 'l');
		player_stat_count('pinching hand', list.length, d);
		let d1 = player_stat_count('hand-holding-usd', list_luxury.length, d);
		mStyle(d1.firstChild, { fg: 'gold', fz: 20 })

		if (!isEmpty(fen.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
			player_stat_count('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
		}
		player_stat_count('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, plname) : ari_calc_fictive_vps(fen, plname), d);

		if (fen.turn.includes(plname)) {
			show_hourglass(plname, d, 30, { left: -3, top: 0 }); //'calc( 50% - 36px )' });
		}
	}
}

//#region actions
function ari_get_actions(uplayer) {
	let fen = Z.fen;
	//actions include market card exchange
	let actions = exp_rumors(Z.options) ? ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'buy rumor', 'rumor', 'inspect', 'blackmail', 'harvest', 'pickup', 'sell', 'tithe', 'commission']
		: ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tithe', 'commission'];
	if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for uplayer
		let avail = ari_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;

}
function ari_check_action_available(a, fen, uplayer) {
	let cards;
	let pl = fen.players[uplayer];
	if (a == 'trade') {
		//there must be 2 cards visible in stalls & market
		cards = ari_get_all_trading_cards(fen);
		//console.log('trade', cards);

		//there must be at least 1 card visible that does NOT belong to pl stall!!!!!
		let not_pl_stall = cards.filter(x => !pl.stall.includes(x.key));

		return cards.length >= 2 && pl.stall.length > 0 && not_pl_stall.length > 0;
	} else if (a == 'exchange') {
		cards = ari_get_all_wrong_building_cards(fen, uplayer);
		return cards.length > 0 && (pl.hand.length + pl.stall.length > 0);
	} else if (a == 'build') {
		//this player needs to have at least 4 cards in total (stall+hand)
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (res.length < 4) return false;
		//it has to be a king phase and player has money
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (fen.phase != 'king' && (!has_a_king || res.length < 5)) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		//player has to have at least 1 farm or estate
		if (isEmpty(pl.buildings.farm) && isEmpty(pl.buildings.estate)) return false;
		//it has to be a king phase and player has money
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (isEmpty(res)) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		return true;
	} else if (a == 'buy') {
		//there has to be some card in open_discard
		if (fen.open_discard.length == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (fen.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		//there has to be some building in any other player
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		//there has to be some harvest card
		let harvests = ari_get_all_building_harvest_cards(fen, uplayer);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		//there has to be some card in stall
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		//there has to be at least 2 cards in stall
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		//there has to be at least 2 cards in stall
		return true;
	} else if (a == 'commission') {
		//muss dieselbe rank in pl.commissions und pl.hand or pl.stall haben!
		for (const c of pl.commissions) {
			let rank = c[0];
			if (firstCond(pl.stall, x => x[0] == rank)) return true; //nur wenn in stall!!!!!!
			//if (firstCond(pl.hand, x => x[0] == rank) || firstCond(pl.stall, x => x[0] == rank)) return true;
		}
		return false;
	} else if (a == 'rumor') {
		//console.log('yes, checking rumor command',pl.rumors)
		//uplayer needs to have at least 1 rumor card
		if (isEmpty(pl.rumors)) return false;
		//there has to be some building in any other player
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		//console.log('other players have buildings:',n);
		if (n == 0) return false;
		return true;

		//NO to the following: rumor action kostet nichts!!!
		//player needs to have a queen or coin>0 and queen phase
		// let res = ari_get_player_hand_and_stall(fen, uplayer);
		// let has_a_queen = firstCond(res, x => x[0] == 'Q');
		// if (pl.coins < 1 && !has_a_queen) return false;
		// if (fen.phase != 'queen' && !has_a_queen) return false;
		// return true;
	} else if (a == 'inspect') {
		if (isEmpty(pl.rumors)) return false;
		//there has to be some building in any other player
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		return n > 0;
	} else if (a == 'blackmail') {
		//there has to be some building in any other player with a rumor
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				let list = fen.players[plname].buildings[k];
				let building_with_rumor = firstCond(list, x => !isEmpty(x.rumors));
				if (building_with_rumor) n++;
			}
		}
		if (n == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'buy rumor') {
		//there has to be some card in deck_rumors
		if (fen.deck_rumors.length == 0) return false;
		//player needs to coin>0
		if (pl.coins < 1) return false;
		return true;
	}
}
function ari_get_all_building_harvest_cards(fen, uplayer) {
	//let fen = Z.fen;
	let res = [];
	let pl = fen.players[uplayer];
	for (const b of pl.buildings.farm) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_wrong_building_cards(fen, uplayer) {
	//let fen = Z.fen;
	//console.log('fen', fen, 'uplayer', uplayer, fen.players[uplayer]);
	let res = [];
	let pl = fen.players[uplayer];
	for (const k in pl.buildings) {
		for (const b of pl.buildings[k]) {
			let bcards = b.list;
			let lead = bcards[0];
			let [rank, suit] = [lead[0], lead[1]];
			for (let i = 1; i < bcards.length; i++) {
				if (bcards[i][0] != rank) res.push({ c: bcards[i], building: b });
			}
		}
	}
	return res;
}
function ari_get_all_trading_cards(fen) {
	//each co_action is of the form {ckey,path} path is path in Z and otree
	//let fen = Z.fen;
	let res = [];
	fen.market.map(c => res.push({ key: c, path: 'market' }));

	for (const uplayer of fen.plorder) {
		let pl = fen.players[uplayer];
		//console.log('uplayer',uplayer,'pl',pl)
		let stall = pl.stall;
		//console.log('stall',stall);
		stall.map(x => res.push({ key: x, path: `players.${uplayer}.stall` }));
	}
	// let plcardlists = otree.plorder.map(x => otree[x].stall);
	// plcardlists.map(x => x.map(c => res.push[{ c: c, path: `${x}.stall` }]));
	return res;
}
function ari_get_player_hand_and_stall(fen, uplayer) {
	//let [fen, uplayer] = [Z.fen, Z.uplayer];
	//let fen = Z.fen;
	let res = [];
	res = res.concat(fen.players[uplayer].hand);
	res = res.concat(fen.players[uplayer].stall);
	return res;
}
function process_command() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.last_selected;
	if (nundef(item)) { post_pass(); return; }
	A.selected = [item.index];
	let a = A.items[A.selected[0]];
	A.command = a.key;
	ari_pre_action();
}
function ari_next_action() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	deactivate_ui();

	console.assert(isdef(Z.num_actions));
	//if (nundef(fen.num_actions)) fen.num_actions = 0;
	//console.log('ari_next', fen.num_actions);
	fen.num_actions -= 1;
	fen.action_number += 1;

	if (fen.num_actions <= 0) {
		//console.log('NO MORE ACTIONS FOR!!!!!!', uplayer);
		fen.total_pl_actions = 0;

		lookupAddIfToList(fen, ['actionsCompleted'], uplayer);
		//fen.actionsCompleted.push(uplayer);
		let next = ari_select_next_player_according_to_stall_value(fen);

		if (!next) {
			ari_next_phase();
		} else {
			Z.turn = [next];
		}
	} else {
		Z.stage = 5;
	}
	take_turn_fen();

}
//#endregion

//#region auction / buy
function process_auction() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	//console.log('A', A.selected);
	if (isEmpty(A.selected)) A.selected = [0];
	let playerbid = Number(valf(A.items[A.selected[0]].a, '0')); //A.selected.map(x => A.items[x]); 

	//console.log('player', uplayer, 'bids', playerbid);
	lookupSet(fen, ['auction', uplayer], playerbid);
	//console.log('fen.auction', fen.auction);

	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //console.log('auction over!');

		//find out max and second max investment
		let list = dict2list(fen.auction, 'uplayer');
		list = sortByDescending(list, 'value');

		let max = list[0].value;

		if (max == 0) {
			Z.stage = 4;
			Z.turn = [fen.plorder[0]];
			take_turn_fen();
			return;
		}

		let second = fen.second_most = list.length == 1 ? randomNumber(0, max) : list[1].value;

		//all players with max amount have the right to buy a market card for second coins
		Z.stage = 13;
		let maxplayers = fen.maxplayers = list.filter(x => x.value == max).map(x => x.uplayer);
		//fen.round = arrMinus(fen.plorder, maxplayers);
		Z.turn = [maxplayers[0]];
		for (const plname of plorder) {
			ari_history_list([`${plname} bids ${fen.auction[plname]}`], 'auction');
		}
		ari_history_list([`auction winner${if_plural(fen.maxplayers.length)}: ${fen.maxplayers.join(', ')} (price: ${fen.second_most} coin)`], 'auction');
		//iturn = fen.plorder.indexOf(maxplayers[0]);
	} else {
		Z.turn = [fen.plorder[iturn]];
	}
	//console.log('next player is', Z.turn[0]);
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
}
function post_auction() {
	console.assert(Z.stage == 13, 'WRONG STAGE IN POST AUCTION ' + Z.stage);
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	//console.log('selected', A.selected)
	let item = A.selected.map(x => A.items[x])[0]; // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);

	lookupSet(fen, ['buy', uplayer], { key: item.key, index: A.selected[0] });
	ari_history_list([`${uplayer} selects ${item.key}`], 'auction');

	for (const plname of fen.maxplayers) {
		if (!lookup(fen, ['buy', plname])) {
			//let iturn = fen.plorder.indexOf(uplayer);
			Z.turn = [plname]; //fen.plorder[iturn];
			take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
			return;
		}
	}
	//arriving here, everyone has determined what to buy
	//the choices are in fen.buy[plname]

	//if 2 or more players selected the same card, this card is discarded
	//otherwise the player buys the card
	let buylist = dict2list(fen.buy, 'playername');
	//console.log('buylist', buylist);

	let discardlist = [];
	for (const plname of fen.maxplayers) {
		let choice = fen.buy[plname]; //{key:item.key,index:A.selected[0]}
		//console.log('choice of', plname, 'was', choice)

		let n = arrCount(buylist, x => x.index == choice.index);

		let is_unique = n == 1; //!firstCond(buylist, x => x.id != plname && x.key == choice);
		//console.log('choice', choice, 'is_unique', is_unique);
		if (is_unique) {
			fen.players[plname].coins -= fen.second_most;

			let x = UI.player_stat_items[plname].dCoin; mPulse1(x); //console.log('dCoin: ', x); 

			elem_from_to(choice.key, fen.market, fen.players[plname].hand);
			ari_history_list([`${plname} buys ${choice.key} for ${fen.second_most}`], 'auction');

			//wenn choice gekauft wird, dann animate to player stats
			let card = find_card(choice.index, UI.market);
			//console.log('card', card);
			animate_card_transfer(card, arrLast(UI.players[plname].hand.items)); //UI.player_stat_items[plname]);

		} else {
			addIf(discardlist, choice.key);
			delete fen.buy[plname];
		}
	}

	//console.log('discardlist', discardlist);
	for (const key of discardlist) {
		elem_from_to(key, fen.market, fen.deck_discard);
		ari_reorg_discard(fen);
		ari_history_list([`${key} is discarded`], 'auction');
	}

	delete fen.second_most;
	delete fen.maxplayers;
	delete fen.buy;
	delete fen.auction;
	Z.stage = 4;
	Z.turn = [fen.plorder[0]];
	setTimeout(take_turn_fen, 1000); //take_turn_fen(); 


}
function add_auction_history() {
	let [fen, plorder] = [Z.fen, Z.plorder];
	for (const plname of fen.plorder) {
		if (nundef(fen.buy[plname])) continue;
		ari_history_list([`${plname} buys ${fen.buy[plname].a} for ${fen.second_most}`], 'auction');
	}
}

function get_auction_history(fen) {
	let lines = [];
	let revorder = jsCopy(fen.plorder).reverse();
	for (const uplayer of revorder) {
		if (nundef(fen.buy[uplayer])) continue;
		lines.push(`${uplayer} buys ${fen.buy[uplayer].a} for ${fen.second_most}`);
	}
	lines.push(`auction winner(s)${fen.maxplayers.length > 1 ? 's' : ''}: ${fen.maxplayers.join(', ')}`);
	for (const uplayer of revorder) {
		lines.push(`${uplayer} bids ${fen.auction[uplayer]}`);
	}
	return lines;
}
function post_buy() {

	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];


	elem_from_to(item.key, fen.open_discard, fen.players[uplayer].hand);
	ari_history_list([`${uplayer} buys ${item.key}`], 'buy')
	ari_reorg_discard();

	//console.log('buy item',item)
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();

}
//#endregion

//#region ball
function post_ball() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	let keys = A.selected.map(x => A.items[x]).map(x => x.key);

	//console.log('keys', keys)

	keys.map(x => lookupAddIfToList(fen, ['ball', uplayer], x));
	//console.log('ball', fen.ball);
	keys.map(x => removeInPlace(fen.players[uplayer].hand, x));

	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //alle sind durch ball selection
		//distribute ball cards according to what each player gave for ball!
		//console.log('TODO: distribute all cards from', otree.ball);
		//console.log('ball over!');
		if (isdef(fen.ball)) {
			let all = [];
			for (const c of fen.market) all.push(c);
			for (const uplayer in fen.ball) for (const c of fen.ball[uplayer]) all.push(c);
			//console.log('all ball cards', all);
			shuffle(all);
			//give 2 cards from all to market
			fen.market = [];
			for (let i = 0; i < 2; i++) top_elem_from_to(all, fen.market);
			for (const uplayer in fen.ball) for (let i = 0; i < fen.ball[uplayer].length; i++) top_elem_from_to(all, fen.players[uplayer].hand);
			delete fen.ball;
		} //else { console.log('empty ball!!!'); }

		iturn = 0;
		Z.stage = 4;
		console.assert(fen.phase == 'queen', 'wie bitte noch nicht in queen phase?!!!!!!!!!!!');
	}
	Z.turn = [fen.plorder[iturn]];
	//console.log('turn', Z.turn);
	ari_history_list([`${uplayer} added ${keys.length} card${plural(keys.length)} to ball!`], 'ball');
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!


}
//#endregion

//#region build
function post_build() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected.length < 4 || A.selected.length > 6) {
		select_error('select 4, 5, or 6 cards to build!');
		return;
	}
	let building_items = A.selected.map(x => A.items[x]);
	let building_type = building_items.length == 4 ? 'farm' : building_items.length == '5' ? 'estate' : 'chateau';

	//add the building to the fen
	fen.players[uplayer].buildings[building_type].push({ list: building_items.map(x => x.key), h: null, schweine: [], lead: building_items[0].key });

	//remove building_items from hand/stall
	for (const item of building_items) {
		let source = lookup(fen, item.path.split('.'));
		//console.log('item.path', item.path);
		//console.log('source', source);
		removeInPlace(source, item.key);
	}

	ari_history_list([`${uplayer} builds a ${building_type}`], 'build');

	let is_coin_pay = process_payment();

	let ms = 1800;
	if (is_coin_pay) animcoin(Z.uplayer, 1000);
	//animate_build_action(building_items.map(x=>x.o), is_coin_pay, null); //ari_next_action);

	//geht das: einfach presenten?
	remove_ui_items(building_items);

	//find index of new building in fen.players[uplayer].buildings[building_type]
	//make a list of all fen buildings
	let pl = fen.players[uplayer];
	let nfarms = pl.buildings.farm.length;
	let nestates = pl.buildings.estate.length;
	let nchateaus = pl.buildings.chateau.length;
	let index = building_type == 'farm' ? nfarms - 1 : building_type == 'estate' ? nfarms + nestates - 1 : nfarms + nestates + nchateaus - 1;

	console.log('index of new building is', index);
	let ifinal = UI.players[uplayer].indexOfFirstBuilding + index;

	console.log('ifinal', ifinal);

	let dpl = iDiv(UI.players[uplayer]);
	let akku = [];
	while (dpl.children.length > ifinal) { akku.push(dpl.lastChild); dpl.removeChild(dpl.lastChild); }

	let fenbuilding = arrLast(fen.players[uplayer].buildings[building_type]);
	// let d=iDiv(UI.players[uplayer]);
	//ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card, true, ishidden);
	let newbuilding = ui_type_building(fenbuilding, dpl, { maleft: 8 }, `players.${uplayer}.buildings.${building_type}.${index}`, building_type, ari_get_card, true, false);
	animbuilding(newbuilding, ms, ari_next_action);

	akku.map(x => mAppend(dpl, x));

}
//#endregion

//#region church
function ari_clear_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	for (const prop of ['church', 'church_order', 'selorder', 'tithemin', 'tithe_minimum', 'toBeSelected', 'candidates']) delete fen[prop];
	for (const plname in fen.players) {
		delete fen.players[plname].tithes;
	}
	//console.log('fen.deck', fen.deck, 'n',Z.plorder.length);
	fen.church = ari_deck_deal_safe(fen, Z.plorder.length);

}
function check_if_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let jacks = fen.market.filter(x => x[0] == 'J');
	let queens = fen.market.filter(x => x[0] == 'Q');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let pl_jacks = pl.stall.filter(x => x[0] == 'J');
		let pl_queens = pl.stall.filter(x => x[0] == 'Q');
		jacks = jacks.concat(pl_jacks);
		queens = queens.concat(pl_queens);
	}
	//console.log('jacks', jacks, 'queens', queens);

	let ischurch = false;
	for (const j of jacks) {
		if (firstCond(queens, x => x[1] != j[1])) ischurch = true;
	}
	//console.log('ischurch', ischurch);
	return ischurch;
}
function determine_church_turn_order() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	let initial = [];
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.vps = ari_calc_fictive_vps(fen, plname);
		pl.max_journey_length = ari_get_max_journey_length(fen, plname);
		pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
		initial.push(pl);
		//console.log('score', plname, pl.score);
	}
	//let playerlist = dict2list(fen.players, 'name');
	let sorted = sortByDescending(initial, 'score');
	//console.log('church order: scores', sorted.map(x => `${x.name}:${x.score}`));
	return sorted.map(x => x.name);
}
function is_in_middle_of_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	return isdef(fen.players[uplayer].tithes);
}
function post_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);

	//console.log('post_church num selected',items.length)

	//console.log('post_church', items);

	//which of items is a card and which one is a string item?
	let card = items.find(x => x.path && x.path.includes('church')); if (isdef(card)) card = card.key;
	let cand = items.length > 1 ? items.find(x => !x.path) : fen.candidates[0];
	if (isdef(cand) && isDict(cand)) cand = cand.key;

	//console.log('card', card, 'cand', cand);

	if (nundef(card) || nundef(cand)) {
		select_error(`You must select a card ${items.length > 1 ? 'and a candidate' : ''}!`);
		return;
	}

	//card has to be removed from church and given to cand hand
	elem_from_to(card, fen.church, fen.players[cand].hand);
	ari_history_list([`${uplayer} gives ${cand} card ${card}`], 'new cards');

	//remove cand from toBeSelected
	removeInPlace(fen.toBeSelected, cand);

	//if church only contains 1 more card, give it to the remaining player in toBeSelected
	if (fen.church.length == 1) {

		//console.log('nur noch ein element in church!!! proceed to stage 5...')

		let cand = fen.toBeSelected[0];
		let card = fen.church[0];
		elem_from_to(card, fen.church, fen.players[cand].hand);
		ari_history_list([`${cand} receives last card: ${card}`], 'new cards');

		//proceed to next stage after church! also mark this round not to contain any more churches!!!
		//list all properties related to churches in fen.players and fen: delete them!
		Z.stage = 14;
		let plorder = fen.plorder = jsCopy(fen.heraldorder);
		Z.turn = [plorder[0]];
		//church ends here!!!
		take_turn_fen();

		//ari_start_action_stage(); NEIN! zuerst kommt ein complementing_market stage!

	} else {
		Z.turn = [get_next_in_list(uplayer, fen.selorder)];
		take_turn_fen();
	}

}
function post_tithe() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let items = A.selected.map(x => A.items[x]);

	if (items.length == 0) { select_error('No cards selected!'); return; }

	//calc value of cards in items
	let st = items.map(x => ({ key: x.key, path: x.path }));
	let val = arrSum(st.map(x => ari_get_card(x.key).val));

	//console.log('player', uplayer, 'tithes', st, 'value', val);
	lookupSet(fen, ['players', uplayer, 'tithes'], { keys: st, val: val });

	remove_tithes_from_play(fen, uplayer);

	//calc tithe minimum so far
	let pldone = plorder.filter(x => isdef(fen.players[x].tithes));
	let minplayers = arrMin(pldone, x => fen.players[x].tithes.val);
	let minplayer = isList(minplayers) ? minplayers[0] : minplayers;
	let minval = fen.tithemin = fen.players[minplayer].tithes.val;

	let next = get_next_in_list(uplayer, fen.church_order);
	if (next == fen.church_order[0]) {
		//this stage is done! ALL PLAYERS HAVE TITHED!!!
		//goto church_tithe_eval stage (18)
		//console.log('CHURCH TIDYING DONE!!! minplayers', minplayers);
		assertion(sameList(pldone, plorder), 'NOT all players have tithes!!!!!!!', pldone);

		//tithed cards have to be removed!
		//for (const plname of pldone) { remove_tithes_from_play(fen, plname); }

		if (minplayers.length > 1) { proceed_to_newcards_selection(); return; }
		else {
			//there is a minplayer, this player has to tithe at least as much as next higher player!
			//remove minplayer from pldone
			pldone = pldone.filter(x => x != minplayer);
			//sort pldone by tithe value
			let sorted = sortBy(pldone, x => fen.players[x].tithes.val);
			let second_min = sorted[0];
			fen.tithe_minimum = fen.players[second_min].tithes.val - minval;

			//hier kann ich eigentlich schon checken ob der minplayer ueberhaupt genug hat!
			//dann kann ich gleich entscheiden ob er zu downgrad muss oder zu additional_tithes_to_play
			//#region check if minplayer has enough

			let pl = fen.players[minplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = isEmpty(vals) ? 0 : arrSum(vals);
			//console.log('gesamtes minplayer blatt + stall', sum);
			let min = fen.tithe_minimum;
			if (sum < min) {
				//jetzt gibt es ein problem! player muss ein building downgraden!
				//fahre fort wie bei downgrade!
				//aber danach muss ich wieder zurueck zu church!!!
				//was ist wenn player kein building hat!!!

				//uplayer looses all hand and stall cards!!!
				pl.hand = [];
				pl.stall = [];

				let buildings = arrFlatten(get_values(pl.buildings));
				console.log('buildings', buildings);
				if (isEmpty(buildings)) {
					ari_history_list([`${minplayer} does not have a building to downgrade!`], 'downgrade');
					proceed_to_newcards_selection();
					return;
				}

				ari_history_list([`${minplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				Z.stage = 22;

			} else {
				//must select more cards to tithe!
				ari_history_list([`${minplayer} must tithe more cards to reach ${min}!`], 'tithe');
				Z.stage = 21;
				//
			}


			//#endregion


			//Z.stage = 18;
			Z.turn = [minplayer];
		}

	} else {
		Z.turn = [next];

	}
	take_turn_fen();


}
function post_tithe_minimum() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);

	//calc value of cards in items
	let st = items.map(x => ({ key: x.key, path: x.path }));
	// let val = arrSum(st.map(x => ari_get_card(x.key).val));
	// let st = items.map(x => x.key);

	//player already has tithes!
	pl.tithes.keys = pl.tithes.keys.concat(st);
	let newval = arrSum(st.map(x => ari_get_card(x.key).val));
	pl.tithes.val += newval;
	//console.log('player', uplayer, 'tithes', st, 'value', pl.tithes.val);

	//verify that val is at least tithe_minimum
	console.log('tithe_minimum', fen.tithe_minimum);
	console.log('val', pl.tithes.val);

	if (newval < fen.tithe_minimum) {
		select_error(`you need to tithe at least ${fen.tithe_minimum} to reach minimum`);
		return;
	}


	//tithed cards have to be removed!
	remove_tithes_from_play(fen, uplayer, st);
	// for (const tithe of st) { removeInPlace(pl.hand, tithe); }

	proceed_to_newcards_selection();
}
function post_complementing_market_after_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];

	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	//ari_history_list([`${uplayer} chose ${selectedKeys.length == 0 ? 'NOT ' : ''} to complement stall`], 'complement stall');
	if (selectedKeys.length > 0) ari_history_list([`${uplayer} complements stall`], 'complement stall');

	let next = get_next_player(Z, uplayer);
	if (next == plorder[0]) {
		ari_clear_church();
		ari_start_action_stage();
	} else {
		Z.turn = [next];
		take_turn_fen();
	}
}
function proceed_to_newcards_selection() {
	//determine selection order for _newcards selection
	let fen = Z.fen;

	let selorder = fen.selorder = sortByFuncDescending(fen.church_order, x => fen.players[x].tithes.val);
	//console.log('church_order',fen.church_order);
	//console.log('selorder',selorder);
	fen.toBeSelected = jsCopy(selorder);
	fen.plorder = selorder;
	Z.turn = [selorder[0]];
	Z.stage = 19;
	take_turn_fen();


}
function remove_tithes_from_play(fen, plname, tithes) {
	let pl = fen.players[plname];
	if (nundef(tithes)) tithes = pl.tithes.keys;
	for (const tithe of tithes) {
		//console.log('*** removing tithe from', tithe.path, tithe.key);
		if (tithe.path.includes('hand')) { removeInPlace(pl.hand, tithe.key); }
		else if (tithe.path.includes('stall')) { removeInPlace(pl.stall, tithe.key); }
		//console.log('*** hand after removing tithe', pl.hand);
		//console.log('*** stall after removing tithe', pl.stall);
	}
	ari_history_list([`${plname} tithes ${tithes.map(x => x.key).join(', ')}!`], 'tithe');

}
function reveal_church_cards() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let uichurch = UI.church;
	let dOpenTable = UI.dOpenTable;
	let church_cards = uichurch.items;

	//console.log('reveal_church_cards', uichurch);

	uichurch.container.remove();

	UI.church = uichurch = ui_type_market(fen.church, dOpenTable, { maleft: 25 }, 'church', 'church');
}
function ui_get_church_items(uplayer) {
	let fen = Z.fen;
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let church = UI.church;
	for (const o of church.items) {
		//console.log('path', hand.path);
		//console.log(UI.players[uplayer].hand.path);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: church.path, index: i };
		i++;
		items.push(item);
	}

	let candidates = fen.candidates = arrMinus(fen.toBeSelected, uplayer);
	//console.log('can pick player to give a card to', candidates);

	if (candidates.length > 1) {
		let player_items = ui_get_string_items(candidates);
		items = items.concat(player_items);
		reindex_items(items);
	}

	return items;
}
//#endregion

//#region commission
function process_comm_setup() {

	let [fen, A, uplayer, plorder,pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder,Z.pl];
	assertion(fen.keeppolling == true, "keeppolling must be true for process_comm_setup!!!");
	//console.log('OK 1');

	if (DA.hallo) {
		console.log('process_comm_setup:', Z.playerdata, Z.stage,uplayer,pl);
		return;
	}

	//get keys of selected cards
	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);

	//must write to pldata (=Z.state) {giver, receiver, keys}
	Z.state = { giver:giver, receiver:receiver, keys:keys };


	//console.log('uplayer',uplayer,'commissions',pl.commissions);
	//console.log('other player',receiver,'commissions',fen.players[receiver].commissions);

	//console.log('setting playerdata for', giver, 'to', receiver, keys);
	//console.log('Z.state', Z.state);

	assertion(isdef(Z.playerdata), "Z.playerdata must be defined for process_comm_setup!!!");
	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), `MISSING: playerdata for ${uplayer}`);
	data.state = Z.state;

	//console.log('OK 2');

	//check if playerdata set for all players
	let can_resolve = check_resolve();
	//console.log('can_resolve', can_resolve);
	//if (uplayer == 'felix') return; //************************TEST TEST TEST*************** */
	if (can_resolve) {
		Z.turn = [Z.host];
		Z.stage = 104; //'next_comm_setup_stage';
		take_turn_fen_write();
	} else {
		if (Z.mode == 'hotseat') { Z.turn = [get_next_player(Z, uplayer)]; take_turn_fen_write(); }
		else take_turn_multi();
	}
}
function check_resolve(){
	let can_resolve = true;
	for (const plname of Z.plorder) {
		let data1 = firstCond(Z.playerdata, x => x.name == plname && !isEmpty(x.state));
		if (nundef(data1)) { can_resolve = false; break; }
	}
	return can_resolve;
}
function post_comm_setup_stage() {

	//erst uebertrage alle cards from pldata.state.keys to pldata.state.receiver
	let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	// console.log('OK 3: resolving__________________',uplayer);
	
	// console.log('playerdata',jsCopy(Z.playerdata));
	let achtungHack=false;
	let new_playerdata=[];
	for (const data of Z.playerdata) {
		let o=data;
		if (is_stringified(data)){
			console.log('achtungHack: data is stringified');
			o=JSON.parse(data);
			achtungHack=true;
		}else if (is_stringified(data.state)){
			console.log('achtungHack: data.state is stringified');
			o.state = JSON.parse(data.state);
			achtungHack = true;
		}
		new_playerdata.push(o);
		//if (!isDict(data)) data
		let state = o.state;
		//console.log('state', state)
		let giver = state.giver;
		let receiver = state.receiver;
		let keys = state.keys;
		// console.log('giver', giver, fen.players[giver].commissions)
		// console.log('receiver', receiver, fen.players[receiver].commissions);
		// console.log('state.keys', keys);

		keys.map(x => elem_from_to(x, fen.players[giver].commissions, fen.players[receiver].commissions));
		//fen.players[giver].commissions = arrMinus(fen.players[giver].commissions, keys);
		//fen.players[receiver].commissions = fen.players[receiver].commissions.concat(keys); //arrPlus(fen.players[receiver].commissions, keys);
		//fen.players[receiver].commissions = arrPlus(fen.players[receiver].commissions, keys);
	}
	if (achtungHack) {Z.playerdata = new_playerdata;}

	fen.comm_setup_num -= 1;

	//console.log('OK 4',fen.comm_setup_num);
	// console.log('mimi commissions',pl.commissions);
	// console.log('felix commissions',fen.players.felix.commissions);
	//assertion(fen.comm_setup_num > 1, "fen.comm_setup_num must be > 1");


	//return;

	if (fen.comm_setup_num <= 0) {
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;
		delete fen.keeppolling;
		ari_history_list([`commission trading ends`], 'commissions');

		if (exp_rumors && plorder.length > 2) {
			[Z.stage, Z.turn] = [24, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; 
			ari_history_list([`gossiping starts`], 'rumors');

		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }
	} else {

		//muss auf jeden fen clear aufrufen!
		//mach dasselbe wie beim ersten mal!
		[Z.stage, Z.turn] = [23, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
		//
	}

	//DA.hallo=true;
	take_turn_fen_clear();
	//if fen.comm_setup_num is 1, then go to next stage 
	//console.log('fen', fen);
}

function process_commission_stall() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	console.log('process_commission_stall selected', A.selected, 'item', A.items[A.selected[0]]);
	Z.A.commission_stall_item = A.items[A.selected[0]];
	Z.stage = 16;
	ari_pre_action();
}
function process_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];

	//console.log('process_commission:', A.items[A.selected[0]]);

	//was muss jetzt passieren?
	//1. frage den player was er auswaehlen wird?
	A.commission = A.items[A.selected[0]];

	//hier muss was her fuer wenn multiple stall items die passen hat!!!
	if (A.commission.similar.length > 1) {
		Z.stage = 37;
	} else {
		A.commission_stall_item = A.commission.similar[0];
		Z.stage = 16;
	}

	ari_pre_action();
}
function post_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];

	let comm_selected = A.items[A.selected[0]];
	let stall_item = A.commission_stall_item;
	console.log('stall_item:', stall_item);

	//console.log('process_commission:', comm_selected);

	//1. berechne wieviel der player bekommt!
	//first check N1 = wie oft im fen.commissioned der rank von A.commission schon vorkommt
	//fen.commissioned koennte einfach sein: array of {rank:rank,count:count} und sorted by latest
	let rank = A.commission.key[0];
	if (nundef(fen.commissioned)) fen.commissioned = [];
	let x = firstCond(fen.commissioned, x => x.rank == rank);
	if (x) { removeInPlace(fen.commissioned, x); }
	else { x = { key: A.commission.key, rank: rank, count: 0 }; }

	//console.log('x', x)

	x.count += 1;

	//is the rank >= that the rank of the topmost commissioned card
	let pl = fen.players[uplayer];
	let top = isEmpty(fen.commissioned) ? null : arrLast(fen.commissioned);
	let rankstr = 'A23456789TJQK';
	let points = !top || get_rank_index(rank, rankstr) >= get_rank_index(top.rank, rankstr) ? 1 : 0;
	points += Number(x.count);
	pl.coins += points;
	fen.commissioned.push(x);

	// let key = A.commission.similar.key;
	let key = stall_item.key;
	removeInPlace(pl.stall, key); // das muss aendern!!!!!!!!!!!!!

	if (comm_selected.path == 'open_commissions') {
		//top comm deck card goes to open commissions
		removeInPlace(fen.open_commissions, comm_selected.key);
		top_elem_from_to(fen.deck_commission, fen.open_commissions);
	} else {
		removeInPlace(fen.deck_commission, comm_selected.key);
	}

	//console.log('pl', pl, pl.commissions);
	arrReplace(pl.commissions, [A.commission.key], [comm_selected.key]);

	//ari_history_list([`${uplayer} replaced commission card ${A.commission.key} by ${comm_selected.key}`, `${uplayer} gets ${points} for commissioning ${A.commission.key}`], 'commission');
	ari_history_list([`${uplayer} commissions card ${A.commission.key}`, `${uplayer} gets ${points} coin${if_plural(points)} for commissioning ${A.commission.key}`], 'commission');

	ari_next_action();
}

//#endregion

//#region downgrade

function process_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	//console.log('A.building is', A.building, 'A.selected', A.selected);
	//next have to select 1 or more cards to take into hands from building
	fen.stage = Z.stage = 103;

	let items = ui_get_hidden_building_items(A.building.o);
	//console.log('items to select:',items);
	items.map(x => face_up(x.o));
	A.possible_downgrade_cards = items;
	ari_pre_action();

}
function post_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];

	A.downgrade_cards = A.selected.map(x => A.items[x]); //
	//console.log('A.candidates',A.possible_downgrade_cards);
	//console.log('selected indices',A.selected);
	//console.log('selected these cards to downgrade:',A.downgrade_cards);

	let obuilding = lookup(fen, A.building.path.split('.'));

	//get number of cards in this building
	let n = obuilding.list.length;
	let nremove = A.downgrade_cards.length;
	let nfinal = n - nremove;

	//remove this building from its list
	let type = A.building.o.type;
	let list = pl.buildings[type];
	removeInPlace(list, obuilding);
	let cards = A.downgrade_cards.map(x => x.key);

	if (nfinal < 4) {
		//entire building take to hand
		pl.hand = pl.hand.concat(obuilding.list);
	} else if (nfinal == 4) {
		//add the building to farm
		pl.buildings.farm.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 5) {
		//add the building to estate
		pl.buildings.estate.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 6) {
		//add the building to chateau
		pl.buildings.chateau.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	}
	A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));

	//aenderung fuer church!!!
	//if this is a church forced downgrade, cards are removed from hand (and play) permanently
	if (isdef(pl.tithes)) {
		for (const c of cards) removeInPlace(pl.hand, c);
	}

	ari_history_list([`${uplayer} downgrades to ${ari_get_building_type(obuilding)}`], 'downgrade');

	if (isdef(pl.tithes)) { proceed_to_newcards_selection(); } else ari_next_action(fen, uplayer);
}
//#endregion

//#region endgame
function ari_reveal_all_buildings(fen) {
	for (const plname of fen.plorder) {
		let gbs = UI.players[plname].buildinglist;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
			//console.log('gb',gb);
		}
	}

}
function post_endgame() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	// console.log('post_endgame...................................?', A.selected[0])
	if (A.selected[0] == 0) {

		console.log('GAMEOVER!!!!!!!!!!!!!!!!!!!');

		//berechne fuer jeden real vps!
		for (const plname of fen.plorder) {
			let pl = fen.players[plname];
			pl.vps = ari_calc_real_vps(fen, plname);
			pl.max_journey_length = ari_get_max_journey_length(fen, plname);
			pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
			console.log('score', plname, pl.score);
		}
		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		fen.winners = all_winners.map(x => x.name);
		console.log('winners:', fen.winners)
		take_turn_fen();

	} else {
		// *** this potential winners chose go on! ***
		let iturn = fen.pl_gameover.indexOf(uplayer) + 1;
		if (iturn >= fen.pl_gameover.length) { //niemand wollte beenden: move to queen phase!
			delete fen.pl_gameover;
			Z.turn = [fen.plorder[0]];
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
			take_turn_fen();

		} else {
			Z.turn = [fen.pl_gameover[iturn]];
			take_turn_fen();
		}
	}

}

//#endregion

//#region exchange
function ai_pick_legal_exchange() {
	//mach einfach alle pairs von legal trades
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];

	//console.log('A',A);

	let firstPick = rChoose(items, 1, x => x.path.includes('building'));
	let secondPick = rChoose(items, 1, x => !x.path.includes('building'));

	return [firstPick, secondPick];

}
function post_exchange() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];

	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];

	//one of the cards has to be from a building
	let [p0, p1] = [i0.path, i1.path];
	if (p0.includes('build') == p1.includes('build')) {
		select_error('select exactly one building card and one of your hand or stall cards!');
		return;
	}

	//console.log('i0', i0, 'i1', i1);

	//exchange_items_in_fen(fen, i0, i1); 
	//instead, need to exchange exactly at the same position!!!
	let ibuilding = p0.includes('build') ? i0 : i1;
	let ihandstall = ibuilding == i0 ? i1 : i0;
	let fenbuilding = lookup(fen, ibuilding.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));

	let ib_index = ibuilding.o.index; //index of the building card within building!

	//if this index is in fenbuilding.schweine, remove index from schweine
	if (fenbuilding.schweine.includes(ib_index)) {
		fenbuilding.schweine.splice(fenbuilding.schweine.indexOf(ib_index), 1);
	}

	let pl = fen.players[uplayer];
	let list2 = ihandstall.path.includes('hand') ? pl.hand : pl.stall;
	let i2 = list2.indexOf(ihandstall.o.key)
	exchange_by_index(fenbuilding.list, ib_index, list2, i2);



	ari_history_list([`${uplayer} exchanges card in ${ari_get_building_type(fenbuilding)}`], 'exchange');

	animate_card_exchange(ibuilding, ihandstall, ari_next_action);

}


//#endregion

//#region expansions
function exp_church(options) { return options.church == 'yes'; }
function exp_commissions(options) { return options.commission == 'yes'; }
function exp_journeys(options) { return options.journey == 'yes'; }
function exp_rumors(options) { return options.rumors == 'yes'; }
//#endregion

//#region general helpers
function aggregate_player(fen, prop) {
	let res = [];
	for (const uplayer in fen.players) {
		let list = fen.players[uplayer][prop];
		res = res.concat(list);
	}
	return res;
}
function ari_add_hand_card() {
	//distribute cards
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		ari_ensure_deck(fen, 1);
		top_elem_from_to(fen.deck, fen.players[uplayer].hand);
	}
}
function ari_add_harvest_cards(fen) {
	//console.log('deck', jsCopy(otree.deck));
	for (const plname of fen.plorder) {
		for (const f of fen.players[plname].buildings.farm) {
			if (nundef(f.h)) {
				//what is run out of cards!!!
				let list = [];
				ari_ensure_deck(fen, 1);
				top_elem_from_to(fen.deck, list);
				//let ckey = otree.deck.shift();
				f.h = list[0];
				//console.log('adding harvest key', f.h, jsCopy(otree.deck));
			}
		}
	}
}
function ari_add_rumor(fenbuilding, key) {
	if (nundef(fenbuilding.rumors)) fenbuilding.rumors = [];
	fenbuilding.rumors.push(key);
}
function ari_calc_real_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = ari_get_correct_buildings(pl.buildings);
	let vps = calc_building_vps(bs);
	//console.log('building vps for',plname,vps)
	for (const btype in bs) {
		let blist = bs[btype];
		for (const b of blist) {
			let lead = b.list[0];
			if (firstCond(pl.commissions, x => x[0] == lead[0])) {
				//console.log('player',plname,'has commission card for building of',lead);
				vps += 1;
			}
		}
	}
	return vps;
}
function ari_calc_fictive_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_check_end_condition(blist) {
	let nchateau = blist.chateau.length;
	let nfarm = blist.farm.length;
	let nestate = blist.estate.length;
	if (nchateau >= 2 || nchateau >= 1 && nfarm >= 3 || nchateau >= 1 && nestate >= 2) {
		return true;
	}
	return false;

}
function ari_deck_deal_safe(fen, n) { ari_ensure_deck(fen, n); return deck_deal(fen.deck, n); }
function ari_ensure_deck(fen, n) {
	//console.log('fen', jsCopy(fen));
	if (fen.deck.length < n) { ari_refill_deck(fen); }

}
function ari_get_building_type(obuilding) { let n = obuilding.list.length; return n == 4 ? 'farm' : n == 5 ? 'estate' : 'chateau'; }
function ari_get_correct_buildings(buildings) {
	let bcorrect = { farm: [], estate: [], chateau: [] };
	//let realvps = 0;
	for (const type in buildings) {
		for (const b of buildings[type]) {
			//console.log(',,,b', b);
			let list = b.list;
			//console.log('list', list)
			let lead = list[0];
			let iscorrect = true;
			for (const key of arrFromIndex(list, 1)) {
				if (key[0] != lead[0]) { iscorrect = false; continue; }
			}
			//console.log('building',list,'is',iscorrect?'correct':'_schwein!')
			if (iscorrect) {
				//console.log('type',type)
				//realvps += (type == 'farm' ? 1 : type == 'estate' ? 2 : 3);
				lookupAddIfToList(bcorrect, [type], b);
			}
		}
	}
	//console.log('realvps',realvps,'bcorrect',bcorrect);
	return bcorrect; // [bcorrect, realvps];
}
function ari_get_max_journey_length(fen, uplayer) {
	let pl = fen.players[uplayer];
	let sorted_journeys = sortByDescending(pl.journeys.map(x => ({ arr: x, len: x.length })), 'len');
	return isEmpty(pl.journeys) ? 0 : sorted_journeys[0].len;
}
function ari_history_list(lines, title = '', fen) {
	if (nundef(fen)) fen = Z.fen;
	if (nundef(fen.history)) fen.history = [];
	if (isString(lines)) lines = [lines];

	fen.history.push({ title: title, lines: lines });

	//lookupSetOverride(Z.fen,['history',title],lines);
	//console.log('____history', fen.history);
}
function ari_move_herald(fen) {
	// let cur_herald = fen.plorder[0];
	// let next_herald = fen.plorder[1];
	fen.heraldorder = arrCycle(fen.heraldorder, 1);
	ari_history_list([`*** new herald: ${fen.heraldorder[0]} ***`], 'herald');
	return fen.heraldorder[0];
}
function ari_move_market_to_discard() {
	let fen = Z.fen;
	while (fen.market.length > 0) {
		elem_from_to_top(fen.market[0], fen.market, fen.deck_discard);
	}
	ari_reorg_discard();
}
function ari_move_stalls_to_hands() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		fen.players[uplayer].hand = fen.players[uplayer].hand.concat(fen.players[uplayer].stall);
		fen.players[uplayer].stall = [];
	}
}
function ari_next_phase() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_move_market_to_discard();
	ari_move_stalls_to_hands();
	ari_add_hand_card();
	delete fen.actionsCompleted;
	delete fen.stallSelected;
	Z.turn = [fen.plorder[0]];
	if (Z.stage == 10) {
		//nach ende von king phase!
		Z.phase = 'queen';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else if (fen.phase == 'king') {
		//geh nur in stage 10 wenn irgendwer meets endconditions!!!
		fen.pl_gameover = [];
		for (const plname of fen.plorder) {
			let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			//console.log('end cond met:', can_end ? 'yes' : 'no');
			if (can_end) fen.pl_gameover.push(plname);
		}

		if (!isEmpty(fen.pl_gameover)) {
			Z.stage = 10;
			//console.log('plorder',otree.plorder,'pl_gameover',otree.pl_gameover,'iturn',otree.iturn);
			Z.turn = [fen.pl_gameover[0]];
		} else {
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
		}
	} else if (fen.phase == 'queen') {

		//distribute coins
		for (const uplayer of fen.plorder) {
			for (const k in fen.players[uplayer].buildings) {
				if (k == 'farm') continue;

				let n = fen.players[uplayer].buildings[k].length;
				fen.players[uplayer].coins += n;
				if (n > 0) ari_history_list([`${uplayer} gets ${n} coins for ${k} buildings`], 'payout');
			}
		}

		Z.phase = 'jack';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else {
		//gesamte runde fertig: herald moves!
		fen.herald = ari_move_herald(fen, uplayer);
		fen.plorder = jsCopy(fen.heraldorder);
		ari_add_harvest_cards(fen);
		Z.phase = 'king';
		let taxneeded = ari_tax_phase_needed(fen);
		Z.turn = taxneeded ? fen.turn : [fen.herald];
		// if (taxneeded) Z.stage = 2; else Z.stage = set_journey_or_stall_stage(fen, Z.options, Z.phase);
		// Z.stage = taxneeded ? 2 : 3;
		if (taxneeded) Z.stage = 2; else[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	}

	return Z.stage;

}
function ari_reorg_discard() {
	let fen = Z.fen;
	//organize open_discard: if < 4, add cards from bottom of deck_discard to open_discard
	while (fen.deck_discard.length > 0 && fen.open_discard.length < 4) {
		bottom_elem_from_to(fen.deck_discard, fen.open_discard);
	}
}
function ari_refill_deck(fen) {
	fen.deck = fen.deck.concat(fen.open_discard).concat(fen.deck_discard);
	shuffle(fen.deck);
	fen.open_discard = [];
	fen.deck_discard = [];
	console.log('deck refilled: contains', fen.deck.length, 'cards');
}
function calc_building_vps(bs) {
	//console.log('bs',bs, bs.farm,bs.estate,bs.chateau)
	let res = 0;
	res += bs.farm.length;
	res += bs.estate.length * 2;
	res += bs.chateau.length * 3;
	return res;

}
function calc_stall_value(fen, plname) { let st = fen.players[plname].stall; if (isEmpty(st)) return 0; else return arrSum(st.map(x => ari_get_card(x).val)); }
function exchange_items_in_fen(fen, o0, o1) {
	//let fen = Z.fen;
	let p0 = o0.path.split('.'); if (isdef(fen.players[p0[0]])) p0.unshift('players');
	let p1 = o1.path.split('.'); if (isdef(fen.players[p1[0]])) p1.unshift('players');
	let list0 = lookup(fen, p0);
	//console.log('o0.path',o0.path);
	//console.log('p0',p0);
	//console.log('list0',list0)
	let list1 = lookup(fen, p1); //['players'].concat(o1.path.split('.')));
	//console.log('list1',list1);
	if (isDict(list0) && isdef(list0.list)) list0 = list0.list;
	if (isDict(list1) && isdef(list1.list)) list1 = list1.list;
	elem_from_to(o0.key, list0, list1);
	elem_from_to(o1.key, list1, list0);
}
function find_sequences(blatt, n = 2, rankstr = '23456789TJQKA', allow_cycle = false) {
	//a sequence is several cards in a row of the same suit
	//algo!
	//let ranks = toLetters(rankstr);	//1. sort blatt into suitlists
	let suitlists = get_suitlists_sorted_by_rank(blatt, rankstr, true); //true...remove_duplicates
	//console.log('suitlists', suitlists);
	let seqs = [];
	//2. foreach list:
	for (const lst of get_values(suitlists)) {
		let len = lst.length;
		if (len < n) continue;
		let l = allow_cycle ? lst.concat(lst) : lst;
		//console.log('lst',lst,'l',l);
		//console.log('len',len);
		for (let istart = 0; istart < len; istart++) {
			let seq = [l[istart]];
			let i = istart;
			//console.log(follows_in_rank(l[i], l[i + 1],rankstr));
			while (i + 1 < l.length && follows_in_rank(l[i], l[i + 1], rankstr)) {
				seq.push(l[i + 1]);
				//console.log('seq',seq);
				i++;
			}
			//console.log('seq',seq,'n',n,seq.length>=n);
			if (seq.length >= n) seqs.push(seq);
		}
	}
	//console.log('seqs', seqs);
	return seqs;
}
function follows_in_rank(c1, c2, rankstr) {
	return get_rank_index(c2, rankstr) - get_rank_index(c1, rankstr) == 1;
	//console.log('follows_in_rank:',c1,c2)
	let i1 = rankstr.indexOf(c1[0]);
	let i2 = rankstr.indexOf(c2[0]);
	console.log('follows?', c1, i1, c2, i2, i2 - i1)
	return rankstr.indexOf(c2[0]) - rankstr.indexOf(c1[0]) == 1;
}
function get_rank_index(ckey, rankstr = '23456789TJQKA') { return rankstr.indexOf(ckey[0]); }
function get_suitlists_sorted_by_rank(blatt, rankstr = '23456789TJQKA', remove_duplicates = false) {
	let di = {};
	for (const k of blatt) {
		let suit = k[1];
		if (nundef(di[suit])) di[suit] = [];
		if (remove_duplicates) addIf(di[suit], k); else di[suit].push(k);
	}
	//let di_sorted = {};
	for (const s in di) {
		sortByRank(di[s], rankstr);
	}
	return di;
}
function reindex_items(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function remove_hover_ui(b) { b.onmouseenter = null; b.onmouseleave = null; }
function set_hover_ui(b, item) {
	let isCard = isdef(item.c52key);

	let d = iDiv(item);

	b.onmouseenter = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			let fill = b.fill = r.getAttribute('fill');
			r.setAttribute('fill', 'silver');
		} else {
			let hallo = mGetStyle(d, 'bg');
			//console.log('hallo',hallo,nundef(hallo),isString(hallo));
			let bg = isEmpty(hallo) ? 'transparent' : valf(mGetStyle(d, 'bg'), 'transparent');
			d.setAttribute('bg', bg);
			//console.log('..................................style bg is',bg);
			mStyle(d, { bg: 'silver' });

		}
	}
	b.onmouseleave = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			r.setAttribute('fill', b.fill);
		} else {
			let bg = d.getAttribute('bg');
			//console.log('d.bg',bg)
			mStyle(d, { bg: bg });
		}
	}
}
function set_journey_or_stall_stage(fen, options, phase) {
	//check if any player has a potential journey!
	let pljourney = exp_journeys(options) ? find_players_with_potential_journey(fen) : [];
	//console.log('________ any journey?', pljourney);
	let stage, turn;
	if (isEmpty(pljourney)) { delete fen.passed; turn = [fen.plorder[0]]; ari_ensure_deck(fen, phase == 'jack' ? 3 : 2); stage = 3; }
	else { turn = [pljourney[0]]; stage = 1; }
	return [stage, turn];
}


//#endregion

//#region get ui items for various object groups
function ui_get_all_commission_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_all_hidden_building_items(uplayer) {
	let items = [];
	for (const gb of UI.players[uplayer].buildinglist) {
		items = items.concat(ui_get_hidden_building_items(gb));
	}
	reindex_items(items);
	return items;
}
function ui_get_blackmailed_items() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let commands = ['accept', 'reject'];
	let rumors = fen.players[uplayer].rumors;
	let b = path2fen(fen, fen.blackmail.building_path);
	if (nundef(b.lead)) b.lead = b.list[0];
	//console.log('fenbuilding',b,b.list[0]);
	if (isList(rumors) && firstCond(rumors, x => x[0] == b.lead[0])) {
		commands.push('defend');

	}
	return ui_get_string_items(commands);
}
function ui_get_build_items(uplayer, except) {
	let items = ui_get_hand_and_stall_items(uplayer);
	if (is_card(except)) items = items.filter(x => x.key != except.key);
	//console.log('__________build items:', items)
	reindex_items(items);
	return items;
}
function ui_get_building_items(uplayer) {
	let gblist = UI.players[uplayer].buildinglist;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	//console.log('________building items', items)
	return items;
}
function ui_get_building_items_of_type(uplayer, types = ['farm', 'estate', 'chateau']) {
	let gblist = UI.players[uplayer].buildinglist.filter(x => types.includes(x.type));
	//console.log('gblist', gblist);
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_buildings(gblist) {
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_coin_amounts(uplayer) {
	let items = [];
	for (let i = 0; i <= Z.fen.players[uplayer].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
function ui_get_commands(uplayer) {

	let avail = ari_get_actions(uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ui_get_commission_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	//let hand_and_stall = ui_get_hand_and_stall_items(uplayer); // nur comm from stall allowed!!!!
	let stall = ui_get_stall_items(uplayer);
	for (const o of comm.items) {
		let rank = o.key[0];
		let similar = firstCond(stall, x => x.key[0] == rank);
		if (!similar) continue;
		//console.log('rank', rank, 'has similar')
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i, similar: stall.filter(x => x.key[0] == rank) }; // similar: similar };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_new_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.open_commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	//console.log('choose among:', items)
	return items;
}
function ui_get_commission_stall_items() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	console.log('ui_get_commission_stall_items similar', A.commission.similar);
	let items = A.commission.similar;
	reindex_items(items);
	return items;
}
function ui_get_deck_item(uideck) {
	let topdeck = uideck.get_topcard();
	let item = { o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: uideck.path, index: 0 };
	return item;
}
function ui_get_endgame(uplayer) { return ui_get_string_items(['end game', 'go on']); }
function ui_get_estates_chateaus_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['estate', 'chateau']); }
function ui_get_exchange_items(uplayer) {
	//all hand items
	let ihand = ui_get_hand_items(uplayer);
	//all stall items
	let istall = ui_get_stall_items(uplayer);
	//all invisible (1+) building items
	let irepair = ui_get_all_hidden_building_items(uplayer);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	reindex_items(items);

	//console.log('exchange items',items)
	return items;
}
function ui_get_farms_estates_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['farm', 'estate']); }
function ui_get_hand_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let hand = UI.players[uplayer].hand;
	for (const o of hand.items) {
		//console.log('path', hand.path);
		//console.log(UI.players[uplayer].hand.path);
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_hand_items_minus(uplayer, cardlist) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	if (!isList(cardlist)) cardlist = [cardlist];
	let items = [], i = 0;
	let hand = UI.players[uplayer].hand;
	for (const o of hand.items) {
		if (cardlist.includes(o)) continue;
		//console.log('path', hand.path);
		//console.log(UI.players[uplayer].hand.path);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_hand_and_stall_items(uplayer) {
	let items = ui_get_hand_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));

	reindex_items(items);
	return items;
}
function ui_get_hand_and_journey_items(uplayer) {
	let items = ui_get_hand_items(uplayer);

	//console.log('hand items',items);

	let matching = [];
	for (const plname of Z.plorder) {
		//items = items.concat(ui_get_journey_items(plname)); 

		//ne, das muss besser werden!
		//nur die journeys zu denen ich potentially anlegen kann sollen geadded werden!

		let jitems = ui_get_journey_items(plname);
		for (const j of jitems) {
			for (const card of items) {
				if (matches_on_either_end(card, j)) { matching.push(j); break; }
			}
		}
	}

	items = items.concat(matching);

	reindex_items(items);
	return items;
}
function ui_get_harvest_items(uplayer) {
	let items = []; let i = 0;
	for (const gb of UI.players[uplayer].buildinglist) {
		//console.log('gbuilding', gb);
		if (isdef(gb.harvest)) {
			let d = gb.harvest;
			mStyle(d, { cursor: 'pointer', opacity: 1 });
			gb.div = d;
			let name = 'H' + i + ':' + (gb.list[0][0] == 'T' ? '10' : gb.list[0][0]);
			let item = { o: gb, a: name, key: name, friendly: name, path: gb.path, index: i };
			i++;
			items.push(item);
		}
	}
	return items;
}
function ui_get_hidden_building_items(uibuilding) {
	let items = [];
	for (let i = 1; i < uibuilding.items.length; i++) {
		let o = uibuilding.items[i];
		//console.log('o',o);
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: uibuilding.path, index: i - 1 };
		items.push(item);
	}
	return items;
}
function ui_get_journey_items(plname) {
	let gblist = UI.players[plname].journeys;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = `${plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_market_items() {
	let items = [], i = 0;
	for (const o of UI.market.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_open_discard_items() {
	let items = [], i = 0;
	for (const o of UI.open_discard.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_other_buildings(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist));
	}
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_with_rumors(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist.filter(x => !isEmpty(x.rumors))));
	}
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_and_rumors(uplayer) {
	let items = ui_get_other_buildings(uplayer);
	items = items.concat(ui_get_rumors_items(uplayer));

	reindex_items(items);
	return items;
}
function ui_get_payment_items(pay_letter) {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = ui_get_hand_and_stall_items(uplayer); //gets all hand and stall cards

	let n = items.length;

	items = items.filter(x => x.key[0] == pay_letter);

	if (n == 4 && A.command == 'build') items = []; //das ist damit min building items gewahrt bleibt!
	if (n == 1 && A.command == 'upgrade') items = []; //das ist damit min upgrade items gewahrt bleibt!

	if (fen.players[uplayer].coins > 0 && fen.phase[0].toUpperCase() == pay_letter) {
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
	}
	let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
	return items;
}
function ui_get_rumors_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let rum = UI.players[uplayer].rumors;
	for (const o of rum.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: rum.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_rumors_and_players_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;

	let [data, pl] = [Z.uplayer_data, Z.pl];
	// let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), 'no data for player ' + uplayer);

	//console.log('ui: uplayer', Z.uplayer, 'data', data);
	//sss();

	if (!isDict(data.state)) data.state = { remaining: jsCopy(pl.rumors), receivers: [], di: {} };
	let rem = data.state.remaining;
	for (const k of rem) {
		let o = firstCond(comm.items, x => x.key == k);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}

	let players = [];

	// let receivers = valf(Z.fen.receivers, []);
	let receivers = data.state.receivers;
	//console.log('receivers', receivers);

	for (const plname in UI.players) {
		if (plname == uplayer || receivers.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));

	//assertion(comm.items.length == players.length, 'irgendwas stimmt nicht mit rumors verteilung!!!!', players, comm)

	reindex_items(items);
	return items;
}
function ui_get_schweine_candidates(uibuilding) {
	let items = ui_get_hidden_building_items(uibuilding);
	items = items.filter(x => x.o.key[0] != uibuilding.keycard.key[0]);
	reindex_items(items);
	return items;
}
function ui_get_stall_items(uplayer) {
	let items = [], i = 0;
	let stall = UI.players[uplayer].stall;
	for (const o of stall.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: stall.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_string_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ui_get_top_rumors() {
	let items = [], i = 0;
	for (const o of UI.rumor_top.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `rumor_top`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_trade_items(uplayer) {
	let items = ui_get_market_items(uplayer);
	//console.log('market items', items);
	items = items.concat(ui_get_stall_items(uplayer));//zuerst eigene!
	for (const plname of Z.fen.plorder) {
		if (plname != uplayer) items = items.concat(ui_get_stall_items(plname));
	}
	reindex_items(items);
	return items;
}
//#endregion

//#region harvest
function post_harvest() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	//console.log('harvesting from farm', item.path, item);

	//harvest card ist removed
	let obuilding = lookup(fen, item.path.split('.'));
	//console.log('obuilding', obuilding);
	//add the harvest card to hand
	fen.players[uplayer].hand.push(obuilding.h);
	obuilding.h = null;
	ari_history_list([`${uplayer} harvests`], 'harvest');
	ari_next_action();

}
//#endregion

//#region hack
function find_common_ancestor(d1, d2) { return dTable; }
function too_many_string_items(A) { return A.items.filter(x => nundef(x.o)).length >= 8; }
//#endregion

//#region journey

function process_journey() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];

	if (isEmpty(A.selected)) {
		if (nundef(fen.passed)) fen.passed = []; fen.passed.push(uplayer);
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
		take_turn_fen();
		return;
	}

	let sel = A.selected.map(x => A.items[x].key);

	//check if selection legal!
	let [carditems, journeyitem, jlegal] = check_correct_journey(A, fen, uplayer);
	if (!carditems) return;

	delete fen.passed; //at this point, a player has selected successful journey so all players can enter journey round again!
	[A.carditems, A.journeyitem, A.jlegal] = [carditems, journeyitem, jlegal];
	Z.stage = A.journeyitem ? 30 : 31;
	ari_pre_action();
}
function post_new_journey() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	fen.players[uplayer].journeys.push(A.jlegal);
	arrReplace(fen.players[uplayer].hand, A.jlegal, deck_deal(fen.deck_luxury, A.jlegal.length));
	ari_history_list([`${uplayer} added journey`], 'journey');
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	take_turn_fen();
}
function check_correct_journey(A, fen, uplayer) {
	let items = A.selected.map(x => A.items[x]);
	if (items.length < 2) {
		select_error('please select at least 2 items!'); return [null, null, null];//a total of at least 2 items must be selected
	}
	let carditems = items.filter(x => is_card(x));
	if (isEmpty(carditems)) {
		select_error('please select at least 1 card!'); return [null, null, null];//at least one hand card must be selected
	} else if (items.length - carditems.length > 1) {
		select_error('please select no more than 1 journey!'); return [null, null, null];//at most one journey must be selected
	}

	//legal selection ONLY IF IT FITS!!!
	//make a flat list of cards and check if this is a journey indeed
	let journeyitem = firstCond(items, x => !is_card(x));
	let cards = journeyitem ? jsCopy(journeyitem.o.list) : [];
	cards = cards.concat(carditems.map(x => x.o.key));

	//console.log('cards are:', cards);
	let jlegal = is_journey(cards);
	if (!jlegal || jlegal.length != cards.length) {
		select_error('this is not a legal journey!!'); return [null, null, null];//is this a legal journey?
	}

	return [carditems, journeyitem, jlegal];
}
function find_players_with_potential_journey(fen) {
	let res = [];
	//console.log('plorder',fen.plorder)
	for (const uplayer of fen.plorder) {
		if (isdef(fen.passed) && fen.passed.includes(uplayer)) continue;
		let j = find_journeys(fen, uplayer);
		//console.log('uplayer',uplayer,'journeys',j);
		if (!isEmpty(j)) res.push(uplayer);
	}
	//console.log('res',res)
	return res;
}
function find_journeys(fen, uplayer) {
	//zuerst finde alle sequences von mindestens 2 in player's hand
	let h = fen.players[uplayer].hand;
	let seqs = find_sequences(h, 2, 'A23456789TJQK');
	//console.log('seqs',seqs);
	if (!isEmpty(seqs)) return seqs;
	//danach aggregate all existing journeys and find all cards that fit any end of any journey
	let existing_journeys = aggregate_player(fen, 'journeys');
	for (const j of existing_journeys) {
		let h1 = j.concat(h);
		let seqs1 = find_sequences(h1, j.length + 1, 'A23456789TJQK');
		if (!isEmpty(seqs1)) return seqs1;
		//if (!isEmpty(seqs1)) seqs = seqs.concat(seqs1);
	}
	//console.log('seqs',seqs);
	return seqs;
}
function is_journey(cards) {
	let jlist = find_sequences(cards, cards.length, 'A23456789TJQK');
	//console.log('jlist',jlist);
	let j = firstCond(jlist, x => x.length == cards.length);
	//console.log('jlegal',j);
	return j;
	// if (!isEmpty(jlist)) [0]; else return false;
}
function matches_on_either_end(card, j) {
	//console.log('card',card,'j',j);

	let key = card.key;
	let jfirst = arrFirst(j.o.list);
	let jlast = arrLast(j.o.list);
	rankstr = 'A23456789TJQK';

	let [s, s1, s2] = [key[1], jfirst[1], jlast[1]];

	let anfang = s == s1 && follows_in_rank(key, jfirst, rankstr);
	let ende = s == s2 && follows_in_rank(jlast, key, rankstr);
	//if (anfang) console.log('match anfang:', key, jfirst);
	//if (ende) console.log('match ende:', jlast, key);
	return anfang || ende; // follows_in_rank(rcard,rjfirst,rankstr) || follows_in_rank(rjlast, rcard, rankstr);
}
function post_luxury_or_journey_cards() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let luxury_selected = A.selected[0] == 0;
	console.log('carditems', A.carditems);
	let n = A.carditems.length;
	if (luxury_selected) {
		let cardstoreplace = A.carditems.map(x => x.key); //add n luxury cards to player hand
		arrReplace(fen.players[uplayer].hand, cardstoreplace, deck_deal(fen.deck_luxury, n));
	} else {
		//need to remove n cards from the otherr side of journey and give them to player hand
		let len = A.jlegal.length;
		let handcards = firstCond(A.carditems, x => A.jlegal[0] == x.key) ? arrFromIndex(A.jlegal, len - n) : A.jlegal.slice(0, n);
		console.log('handcards', handcards);
		arrExtend(fen.players[uplayer].hand, handcards);
		A.jlegal = arrMinus(A.jlegal, handcards);
		let cardstoremove = A.carditems.map(x => x.key);
		arrRemove(fen.players[uplayer].hand, cardstoremove);
	}
	//journey is replaced by jlegal
	let path = A.journeyitem.path;
	let parts = path.split('.');
	let owner = parts[1];
	console.log('path', path, 'parts', parts, 'owner', owner)
	fen.players[owner].journeys.splice(Number(parts[3]), 1, A.jlegal);
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
	ari_history_list([`${uplayer} added to existing journey and takes ${luxury_selected ? 'luxury cards' : 'journey cards'}`], 'journey');
	take_turn_fen();
}


//#endregion

//#region market and stalls
function ari_open_market(fen, phase, deck, market) {
	//let [fen, phase, deck, market] = [Z.fen, Z.phase, Z.deck, Z.market];
	//console.log('*** MARKET OPENS!!! ***')

	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
	fen.stallSelected = [];
	delete fen.passed;

	// ari_ensure_deck(fen,n_market); //nein es hat ja mit ui zu tun!!! muss es schon bei deck present machen!!!
	//console.log('1. list',jsCopy(deck.list));
	//console.log('n_market', n_market)
	for (let i = 0; i < n_market; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, market]]);
		//console.log('2. list',jsCopy(deck.list));
		DA.qanim.push([q_move_topmost, [deck, market]]);
		//console.log('3. list',jsCopy(deck.list));
		//console.log('deck',deck.items.map(x=>x.key));
	}
	//console.log('4. list',jsCopy(deck.list));
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	//console.log('5. list',jsCopy(deck.list));
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_select_next_player_according_to_stall_value() {
	//all players have selected their stalls and now need to calc stall values and set turn order accordingly!
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	Z.stage = 5;
	let minval = 100000;
	let minplayer = null;

	for (const uname of fen.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = fen.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = fen.players[uname].stall_value = arrSum(stall.map(x => ari_get_card(x).val));
		if (val < minval) { minval = val; minplayer = uname; }

	}
	if (!minplayer) {
		//maybe all players have empty stall,
		return null;
	} else {
		Z.turn = fen.turn = [minplayer];
		fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
		fen.action_number = 1;
		return minplayer;
	}

}
function is_stall_selection_complete() { return Z.fen.stallSelected.length == Z.fen.plorder.length; }
function post_stall_selected() {

	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	//move selected keys from hand to stall
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	ensure_stallSelected(fen);
	fen.stallSelected.push(uplayer);

	ari_history_list([`${uplayer} puts up a stall for ${selectedKeys.length} action${plural(selectedKeys.length)}`], 'market');

	//if all players have selected, calc stall values and set uplayer to player with minimum
	if (is_stall_selection_complete()) {
		//console.log('stall selection complete!');
		delete fen.stallSelected;
		fen.actionsCompleted = [];
		if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		take_turn_fen();
	}
}

function ari_start_action_stage() {

	let next = ari_select_next_player_according_to_stall_value();
	//console.assert(next, 'NOBODY PUT UP A STALL!!!!!!!');

	if (!next) { ari_next_phase(); }
	take_turn_fen();

}
function ari_start_church_stage() {
	//need to sort players by their vps, and set Z.turn and Z.stage
	let [fen] = [Z.fen];
	let order = fen.plorder = fen.church_order = determine_church_turn_order();
	[Z.turn, Z.stage] = [[order[0]], 17];

	ari_history_list([`inquisition starts!`], 'church');

	take_turn_fen();
}
//#endregion

//#region payment
function process_payment() {

	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	//pay with card or coin
	let item = A.payment;

	is_coin_pay = nundef(item.o);
	if (is_coin_pay) a2_pay_with_coin(uplayer); else a2_pay_with_card(item);

	ari_history_list(get_pay_history(is_coin_pay ? 'coin' : item.o.key, uplayer), 'payment');

	//if (is_coin_pay) { let x = UI.player_stat_items[uplayer].dCoin; mPulse1(x); } // console.log('dCoin: ', x)

	A.payment_complete = true;
	return is_coin_pay;
}
function payment_complete() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.payment = A.items[A.selected[0]];
	let nextstage = Z.stage = ARI.stage[A.command];
	//console.log('........paying with:', A.payment);
	//console.log('need to go back to stage', ARI.stage[nextstage]);
	ari_pre_action();
}

function get_pay_history(payment, uplayer) { return [`${uplayer} pays with ${payment}`]; }
function a2_pay_with_card(item) {
	let fen = Z.fen;
	let source = lookup(fen, item.path.split('.'));
	elem_from_to_top(item.key, source, fen.deck_discard);
	ari_reorg_discard(fen);
}
function a2_pay_with_coin(uplayer) {
	let fen = Z.fen;
	fen.players[uplayer].coins -= 1;
	//animate_coin_pay();
	//ari_redo_player_stats(otree, uplayer);
}
//#endregion

//#region pass
function post_pass() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let n = fen.total_pl_actions - fen.num_actions;
	ari_history_list([`${uplayer} passes after ${n} action${plural(n)}`], 'pass');
	fen.num_actions = 0;
	ari_next_action();
}
//#endregion

//#region pickup
function post_pickup() {
	//console.log('post_pickup')
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	//move elem item.a from mimi.stall to mimi.hand
	elem_from_to(item.key, fen.players[uplayer].stall, fen.players[uplayer].hand);
	//take_turn_single();
	ari_history_list([`${uplayer} picks up ${item.key}`], 'pickup');
	ari_next_action();
}
//#endregion

//#region q

function qanim() {
	if (!isEmpty(DA.qanim)) {
		let [f, params] = DA.qanim.shift();
		f(...params);
	} //else console.log('...anim q done!')
}

// animated changes w/ callback qanim
function qanim_flip_topmost(deck, ms = 400) {
	qanim_flip(deck.get_topcard(), ms);
}
function qanim_flip(card, ms = 400) {
	mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], qanim, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function qanim_move_topmost(uideck, uito, ms = 400) {
	let card = uideck.get_topcard();
	qanim_move(card, uideck, uito, ms);
}
function qanim_move(card, uifrom, uito, ms = 400) {
	let dfrom = iDiv(card);
	let dto = isEmpty(uito.items) ? uito.cardcontainer : iDiv(arrLast(uito.items));
	let dParent = find_common_ancestor(dfrom, dto);
	let rfrom = getRect(dfrom, dParent);
	let rto = getRect(dto, dParent);
	dfrom.style.zIndex = 100;
	let [offx, offy] = isEmpty(uito.items) ? [4, 4] : [card.w, 0];
	let a = mAnimate(dfrom, 'transform',
		[`translate(${offx + rto.l - rfrom.l}px, ${offy + rto.t - rfrom.t}px)`], qanim,
		ms, 'ease');
}
//changes on ui (Z props) w/o animations, and mirrorring ui to fen Z[prop]=>fen[prop]
function q_move_topmost(uideck, uito) {
	//console.log('q_move_topmost')
	let topmost = pop_top(uideck); //pop_deck(uideck);
	//console.log('topmost is',topmost.key, 'after pop',jsCopy(uideck.list),uideck.items.map(x=>x.key));

	//console.log('deck items',uideck.items.map(x=>x.key))

	//console.log('topmost', topmost);
	//let dTopmost = iDiv(topmost);
	//mAppend(uito.container, dTopmost);
	// items.shift();
	// uideck.list = uideck.items.map(x => x.key);
	// uideck.topmost = uideck.items[0];

	let dfrom = iDiv(topmost);
	dfrom.remove();
	dfrom.style.position = 'static';
	dfrom.style.zIndex = 0;
	uito.items.push(topmost);
	uito.list = uito.items.map(x => x.key);
	mAppend(uito.cardcontainer, dfrom);
	qanim();
}
function q_mirror_fen() {
	let fen = Z.fen;
	for (const prop of arguments) {
		let ui = UI[prop];
		fen[prop] = ui.list;
	}
	//console.log('fen', fen, 'stage',Z.stage);
	qanim();
}

//#endregion

//#region rumors
function process_rumors_setup() {
	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];

	//check if items selected are exactly one player name and one rumor card
	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	assertion(isdef(data), 'no data for player ' + uplayer); //	sss(); //console.log('data',data);

	rumor_update_playerdata(data, receiver, rumor);

	let playerdata_complete = rumor_playerdata_complete();
	if (playerdata_complete) {
		//pass turn to host and write fen AND playerdata
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		clear_transaction();
		take_turn_fen_write();
	} else if (isEmpty(data.state.remaining)) {
		//clear transaction and write playerdata
		clear_transaction();
		take_turn_write();
	} else {
		//add transaction and write playerdata
		add_transaction('rumorsetup');
		take_turn_write();
	}
}
function post_rumor_setup() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	for (const plname of plorder) { fen.players[plname].rumors = []; }
	//console.log('post_rumor_setup', plorder, jsCopy(fen.players));

	for (const plname of plorder) {
		//if (plname == uplayer) continue;
		//let pl = fen.players[plname];
		let data = firstCond(Z.playerdata, x => x.name == plname);
		let di = data.state.di;
		//console.log('di', plname, di);
		for (const k in di) {

			arrPlus(fen.players[k].rumors, di[k]);
			//console.log('player', k, 'erhaelt', di[k]);
		}
		// 	assertion(isdef(fen.rumor_setup_di[plname]), 'no rumors for ' + plname);
		// 	pl.rumors = fen.rumor_setup_di[plname];
	}
	//for (const plname of plorder) { let r = fen.players[plname].rumors; console.log('rumors', plname, jsCopy(r)); }
	// delete fen.rumor_setup_di;
	// delete fen.rumor_setup_receivers;
	ari_history_list([`gossiping ends`], 'rumors');


	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	take_turn_fen_clear();
}
function rumor_update_playerdata(data, receiver, rumor) {
	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);
	Z.state = data.state; //genau DAS muss gesendet werden!!!!!
}
function rumor_playerdata_complete() {
	for (const pldata of Z.playerdata) {
		if (isEmpty(pldata.state) || !isEmpty(pldata.state.remaining)) return false;
	}
	return true;
}

function process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cards = item.o.items;
	cards.map(x => face_up(x))
	//console.log('item', item); 
	weiter_process_inspect();
	//ari_make_unselected(item); //iDiv(item).style.zIndex = -10;
}
function weiter_process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let uibuilding = A.uibuilding = item.o;
	let fenbuilding = A.fenbuilding = lookup(fen, uibuilding.path.split('.'));
	let key = uibuilding.keycard.key;
	let cards = uibuilding.items;

	//find candidates for new schwein
	let schweine_cand = [];
	for (let i = 1; i < cards.length; i++) {

		if (fenbuilding.schweine.includes(i)) continue; //if index i is already in schweine, skip this card

		//if card key == key, skip this card
		let card = cards[i];
		//console.log('card.key', card.key,'lead',key);
		if (card.key == key) continue;

		assertion(i == card.index, 'wrong card index!!!!')
		schweine_cand.push(card); //add this card to schweine_cand
	}

	//if candidates have been found
	if (schweine_cand.length > 1) {
		//need to go to another step of selecting the new schwein
		//console.log('mehrere candidates', schweine_cand);
		Z.stage = 38;
		//A.schweine_cand = schweine_cand;
		ari_pre_action();
	} else if (schweine_cand.length == 1) {
		//show_instruction('no additional schwein has been found - you gain 1 rumor')
		setTimeout(() => turn_new_schwein_up(schweine_cand[0], fenbuilding, uibuilding), 3000);
	} else if (isEmpty(fenbuilding.schweine)) {
		//this building is completely correct! inspector does NOT get a rumor
		//console.log('CORRECTES building!')
		Z.stage = 29;
		ari_history_list([`${uplayer} inspects a correct building`], 'inspect');
		show_instruction('the building is CORRECT - You loose 1 rumor')
		setTimeout(ari_pre_action, 2000); //ari_pre_action();
	} else {
		//console.log('kein neues schwein gefunden, aber schon existierendes schwein')
		// no new schweine candidate available: do nothing
		// but there are already schweine in this building
		// uplayer gets a rumor but owner does not
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		show_instruction('no additional schwein has been found - you gain 1 rumor')
		ari_history_list([`${uplayer} inspects a schweine!`], 'inspect');
		setTimeout(ari_next_action, 2000);
	}
}
function post_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let schwein = A.items[A.selected[0]].o;

	turn_new_schwein_up(schwein, A.fenbuilding, A.uibuilding);

}
function ari_open_rumors(stage = 28) {
	let [fen, deck] = [Z.fen, UI.deck_rumors];
	//console.log('*** RUMOR TOP OPENS!!! ***')

	DA.qanim = [];
	fen.stage = Z.stage = stage;
	let n = Math.min(2, fen.deck_rumors.length);

	let cards = arrTake(fen.deck_rumors, n);
	let uicards = cards.map(x => ari_get_card(x));
	//console.log('deck', deck, 'n', n, 'cards', uicards);
	//output_arr_short(fen.deck_rumors);

	let dest = UI.rumor_top = ui_type_market([], deck.container.parentNode, { maleft: 12 }, `rumor_top`, 'rumor_top', ari_get_card);
	mMagnifyOnHoverControlPopup(dest.cardcontainer);

	for (let i = 0; i < n; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, dest]]);
		DA.qanim.push([q_move_topmost, [deck, dest]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck_rumors', 'rumor_top']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function building_is_correct(b) {
	let key = b.keycard.key;
	let list = b.list;
	//return true if all list elements have the same first letter as key
	for (let i = 0; i < list.length; i++) { if (list[i][0] != key[0]) return false; }
	return true;
}
function output_arr_short(arr) {
	console.log('output_arr_short', getFunctionsNameThatCalledThisFunction());
	console.log('deck top 3', jsCopy(arrTake(arr, 3))); console.log('deck bottom 3', jsCopy(arrTakeLast(arr, 3)));

}
function post_rumor_both() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0])[0];
	let rumor = item.key;
	let rumor_other = non_selected.key;

	//console.log('post_buy_rumor', A.selected);
	//console.log('deck top 3', jsCopy(arrTake(fen.deck_rumors, 3))); console.log('deck bottom 3', jsCopy(arrTakeLast(fen.deck_rumors, 3)));

	//add non_selected to deck bottom
	//add rumor to uplayer rumors
	fen.players[uplayer].rumors.push(rumor);
	fen.players[A.owner].rumors.push(rumor_other);

	//console.log('deck top 3', jsCopy(arrTake(fen.deck_rumors, 3))); console.log('deck bottom 3', jsCopy(arrTakeLast(fen.deck_rumors, 3)));

	ari_history_list([`${uplayer} got a rumor, ${A.owner} got one too`], 'rumor');
	ari_next_action();

}
function post_buy_rumor() {

	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0]);
	let rumor = item.key;

	//console.log('post_buy_rumor', A.selected);
	//console.log('deck top 3', jsCopy(arrTake(fen.deck_rumors, 3))); console.log('deck bottom 3', jsCopy(arrTakeLast(fen.deck_rumors, 3)));

	//add non_selected to deck bottom
	for (const item of non_selected) { fen.deck_rumors.push(item.key); }
	//add rumor to uplayer rumors
	fen.players[uplayer].rumors.push(rumor);
	//pay w/ coin
	fen.players[uplayer].coins -= 1;

	//console.log('deck top 3', jsCopy(arrTake(fen.deck_rumors, 3))); console.log('deck bottom 3', jsCopy(arrTakeLast(fen.deck_rumors, 3)));

	ari_history_list([`${uplayer} bought a rumor`], 'rumor');
	ari_next_action();

}
function process_rumor() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];

	//assert that exactly 2 items are selected one of which is a building and one a rumor card
	let items = A.selected.map(x => A.items[x]);
	let building = firstCond(items, x => x.path.includes('building'));
	let rumor = firstCond(items, x => !x.path.includes('building'));
	if (nundef(building) || nundef(rumor)) {
		select_error('you must select exactly one building and one rumor card!');
		return;
	}

	let fenbuilding = lookup(fen, building.path.split('.'));

	//console.log('building', building, 'rumor', rumor, '\nfenbuilding', fenbuilding);
	//the buildings gets rumor added
	lookupAddToList(fenbuilding, ['rumors'], rumor.key);
	removeInPlace(fen.players[uplayer].rumors, rumor.key);
	ari_history_list([`${uplayer} added rumor to ${ari_get_building_type(fenbuilding)}`,], 'rumor');

	ari_next_action(fen, uplayer);

}
function process_rumor_discard() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];

	console.log('.........items', A.items, A.selected, item);

	let rumor = item.key;
	removeInPlace(fen.players[uplayer].rumors, rumor);

	ari_history_list([`building is correct! ${uplayer} had to discard rumor (${rumor})`], 'rumor');
	ari_next_action();
}
function process_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];

	console.log('selected building to blackmail:', item);

	let building_owner = stringAfter(item.o.path, '.'); building_owner = stringBefore(building_owner, '.');

	let path = item.o.path;
	fen.blackmail = { blackmailer: uplayer, blackmailed: building_owner, payment: A.payment, building_path: path };
	let fenbuilding = lookup(fen, path.split('.'));
	console.log('blackmail:', fen.blackmail);
	fenbuilding.isblackmailed = true;

	ari_history_list([`${uplayer} is blackmailing ${building_owner}`], 'blackmail');
	[Z.stage, Z.turn] = [33, [building_owner]];

	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(take_turn_fen, 1000); //take_turn_fen();

}
function being_blackmailed() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cmd = item.key;
	console.log('selected reaction to blackmail:', item.key);
	//was kann der jetzt entscheiden?
	// er kann das blackmail ablehnen: dann gehen alle seine stall cards zu dem blackmailer und 1 rumor is removed

	if (cmd == 'accept') { Z.stage = 34; ari_pre_action(); }
	else if (cmd == 'reject') { post_reject_blackmail(); }
	else { post_defend_blackmail(); }

}
function post_accept_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];

	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');

	//blackmailed gives card item.key from his stall to blackmailer's hand
	elem_from_to(item.key, fen.players[blackmailed].stall, fen.players[blackmailer].hand);

	ari_history_list([`${blackmailed} accepts: gives ${item.key} to ${blackmailer}`], 'blackmail');

	//blackmailer pays payment: schon gemacht!!!
	//blackmailed building isblackmailed is removed
	delete fenbuilding.isblackmailed;

	//turn goes back to blackmailer
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();

}
function post_defend_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');

	//assume building_owner has rumor card
	let rumors = fen.players[building_owner].rumors;
	let lead = fenbuilding.lead;
	let brumors = fenbuilding.rumors;

	//blackmailed pays lead rumor
	let match = firstCond(rumors, x => x[0] == lead[0]);
	removeInPlace(rumors, match);

	//one rumor is removed from building
	brumors.pop();

	ari_history_list([`${blackmailed} defends: pays matching rumor to deflect blackmail, 1 rumor is removed from building`], 'blackmail');

	delete fenbuilding.isblackmailed;

	//turn goes back to blackmailer
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();

}
function post_reject_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];

	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');

	ari_history_list([`${blackmailed} rejects!`], 'blackmail');
	//was soll bei reject blackmail passieren?
	//rumors from fenbuilding are revealed

	//if rumors contain building lead, all stall cards from blackmailed are moved to blackmailer's hand
	let rumors = fenbuilding.rumors;
	let has_lead_rumor = firstCond(rumors, x => x[0] == fenbuilding.lead[0]);
	if (has_lead_rumor) {
		let stall = fen.players[blackmailed].stall;
		fen.players[blackmailer].hand = fen.players[blackmailer].hand.concat(stall);
		fen.players[blackmailed].stall = [];
		ari_history_list([`RUMOR CORRECT!!! ${blackmailed} looses entire stall to ${blackmailer}`], 'blackmail');

	} else {
		ari_history_list([`${blackmailed} was lucky!!! rumors incorrect`], 'blackmail');

	}
	//rumors are removed from fenbuilding
	delete fenbuilding.rumors;
	delete fenbuilding.isblackmailed;

	//turn goes back to blackmailer
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();

}
function post_blackmail() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_history_list([`blackmail complete!`], 'blackmail');
	delete fen.blackmail;
	ari_next_action();
}

//#endregion

//#region schwein
function get_schweine(fenbuilding) { return fenbuilding.schweine; }
function get_schweine_ui(uibuilding) { return uibuilding.schweine; }

function add_schwein(card, fenbuilding, uibuilding) {
	//if card is NOT just a key,display this card face_up and scaled up
	if (isdef(uibuilding)) add_ui_schwein(card, uibuilding.schweine);

	let ckey = isString(card) ? card : card.key;
	let index = isString(card) ? fenbuilding.list.indexOf(ckey) : card.index;
	fenbuilding.schweine.push(index);

	console.log('fen schweine', fenbuilding.schweine);

}
function add_ui_schwein(item, uischweine) {
	uischweine.push(item);
	//mStyle(iDiv(item), { transform: 'scale(1.05)', origin: 'bottom left' });
	mStyle(iDiv(item), { position: 'relative' });
	miPic('pig', iDiv(item), { position: 'absolute', top: 30, left: 0, fz: 30 });
	face_up(item);
}
function has_schweine(fenbuilding) { return !isEmpty(fenbuilding.schweine); }
function turn_new_schwein_up(schwein, fenbuilding, uibuilding) {

	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	//unique new schwein
	//if this is the first schwein, both players get a rumor!
	let is_first_schwein = isEmpty(fenbuilding.schweine);

	add_schwein(schwein, fenbuilding, uibuilding);
	ari_history_list([`${uplayer} reveals a schwein!`], 'inspect');

	if (is_first_schwein) {
		console.log('unique AND first new schwein');
		show_instruction('found schwein - both players get a rumor!');
		let owner = stringAfter(uibuilding.path, '.');
		owner = stringBefore(owner, '.');
		console.log('owner', owner, 'uplayer', uplayer);
		A.owner = owner;
		ari_open_rumors(32);
	} else {
		console.log('unique new schwein (gibt schon schweine)')
		show_instruction('found schwein - you gain a rumor!');
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		ari_history_list([`${uplayer} inspects a schweine building!`], 'inspect');
		ari_next_action();
	}
}
//#endregion

//#region sell
function post_sell() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	//there should exactly 2 selected cards
	//console.log('YEAHHHHHHHHHHHHHHHHHHHHH', 'sell!', A.selected);
	if (A.selected.length != 2) {
		select_error('select exactly 2 cards to sell!');
		return;
	}
	for (const i of A.selected) {
		let c = A.items[i].key;
		elem_from_to(c, fen.players[uplayer].stall, fen.deck_discard);
	}
	ari_reorg_discard();
	fen.players[uplayer].coins += 1;

	let [i1, i2] = A.selected.map(x => A.items[x].key)
	ari_history_list([`${uplayer} sells ${i1} and ${i2}`], 'sell');
	ari_next_action(fen, uplayer);

}


//#endregion

//#region show
//#endregion

//#region tax
function post_tax() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = A.selected.map(x => A.items[x]);
	let n = fen.pl_tax[uplayer];
	if (items.length != n) {
		select_error(`please select exactly ${n} cards`);
		return;
	}

	for (const item of items) {
		elem_from_to_top(item.key, fen.players[uplayer].hand, fen.deck_discard);
	}
	ari_reorg_discard();
	ari_history_list([`${uplayer} pays tax: ${fen.pl_tax[uplayer]}`], 'tax');
	fen.pl_tax[uplayer] = 0;

	//market existiert in diesem stage nicht!!!
	//daher kann kein ari_next_action machen!!!
	let iturn = fen.plorder.indexOf(uplayer);
	let plnext = ari_get_tax_payer(fen, fen.pl_tax, iturn + 1);
	//console.log('====>get tax payer: plnext', plnext);
	if (plnext == null) {
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, 'king');

		delete fen.pl_tax;

	} else {
		Z.turn = [plnext];
	}

	take_turn_fen(fen, uplayer);

}
function get_tax_history(tax) {
	let hlines = [];
	console.log('tax', tax);
	for (const uplayer in tax) {
		hlines.push(`player ${uplayer} paid ${tax[uplayer]} in tax`);
	}
	return hlines;
}

function ari_get_tax_payer(fen, pl_tax, ifrom = 0) {
	//console.log('pl_tax', pl_tax, 'ifrom', ifrom, getFunctionsNameThatCalledThisFunction());
	let iturn = ifrom;

	let uplayer = fen.plorder[iturn];
	if (nundef(uplayer)) return null;
	//console.log('uplayer',uplayer,'tax',pl_tax[uplayer]);
	while (pl_tax[uplayer] <= 0) {
		//fen.round.push(uplayer);
		iturn++;
		if (iturn >= fen.plorder.length) return null;
		//console.assert(iturn<otree.plorder.length,'DOCH NIEMAND IN TAX>!>!>!>!>');
		uplayer = fen.plorder[iturn];
		//console.log('uplayer',uplayer,'tax',pl_tax[uplayer]);
	}
	return uplayer;

}
function ari_get_first_tax_payer(fen, pl_tax) { return ari_get_tax_payer(fen, pl_tax, 0); }
function ari_tax_phase_needed(fen) {
	//if any player has more cards in hand than he is allowed to, need to have a tax stage else stage 3
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uplayer of fen.plorder) {
		let hsz = fen.players[uplayer].hand.length;
		let nchateaus = fen.players[uplayer].buildings.chateau.length;
		let allowed = ARI.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uplayer] = diff;
	}

	if (need_tax_phase) {
		fen.turn = [ari_get_first_tax_payer(fen, pl_tax)];
		fen.pl_tax = pl_tax;
		fen.stage = 2;
		return true;
	} else {
		fen.stage = 3;
		return false;
	}

}
//#endregion

//#region trade
function post_trade() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];

	//console.log('post_trade!')
	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	let num_own_stall = [i0, i1].filter(x => x.path.includes(uplayer)).length;
	//console.log('___trading!',i0,i1,'\nnum_own_stall',num_own_stall)
	if (i0.path == i1.path) {
		select_error('you cannot trade cards from the same group');
		return;
	} else if (num_own_stall != 1) {
		select_error('you have to pick one card of your stall and one other card');
		return;
	} else {


		//exchange_items_in_fen(fen, i0, i1); 

		//get list0 from path of i0
		let list0 = lookup(fen, i0.path.split('.'));
		//get list1 from path of i1
		let list1 = lookup(fen, i1.path.split('.'));
		exchange_by_index(list0, i0.o.index, list1, i1.o.index);

		//exchange_by_index()

		ari_history_list(get_trade_history(uplayer, i0, i1), 'trade');

		//animate: iDiv(i1.o) should translated towards i0.o and other way around
		animate_card_exchange(i0, i1, ari_next_action);
	}
}
function ai_pick_legal_trade() {
	//mach einfach alle pairs von legal trades
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];

	let stall = fen.players[uplayer].stall;
	let firstPick = rChoose(items, 1, x => x.path.includes(uplayer)); //stall.includes(x.key));
	let secondPick = rChoose(items, 1, x => !x.path.includes(uplayer));

	//A.selected = [items.indexOf(firstPick), items.indexOf(secondPick)];

	//console.log('uplayer',uplayer,'picked',firstPick,secondPick);
	//console.log('first',firstPick.path,firstPick.path.includes(uplayer));

	return [firstPick, secondPick];

}
function get_trade_history(uplayer, i0, i1) {
	//console.log('i0', i0, 'i1', i1);

	if (i1.path.includes(uplayer)) { let h = i0; i0 = i1; i1 = h; }

	return [`${uplayer} trades ${i0.key} (from own stall) for ${i1.key} (from ${i1.path == 'market' ? 'market' : stringBetween(i1.path, '.', '.')})`];
}
//#endregion

//#region visit: TO BE IMPLEMENTED!!!!!!!!!!!!!
function process_visit() {
	alert('NOT IMPLEMENTED!');
	process_payment();
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	let parts = item.path.split('.');
	let owner = parts[1];

	if (isdef(obuilding.schweine)) {

		Z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;

	} else {

		//this building is revealed
		let cards = item.o.items;
		let key = cards[0].rank;
		//let schweine = false;
		//let schweine = null;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schweine = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schweine = schweine;
		}

		ari_history_list([
			`${uplayer} visited ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'visit');

		//_reveal_animation(cards, () => ari_next_action(fen, uplayer));

		//ari_next_action(fen, uplayer);
	}
}

function post_visit() {

	//console.log('post visit!!!!!!!!!!!!!!!!!!!!!!!')

	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	//console.log('====>buildingtype',buildingtype);
	//console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', obuilding.list);
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			//console.log('player', owner, 'pays to', uplayer, fen.players[owner].coins, fen.players[uplayer].coins);
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
			//console.log('after payment:', fen.players[owner].coins, fen.players[uplayer].coins)
		}
	} else {
		let list = obuilding.list;
		let correct_key = list[0];
		let rank = correct_key[0];
		//console.log('rank is', rank);
		//console.log('building destruction: ', correct_key);
		while (list.length > 0) {
			let ckey = list[0];
			//console.log('card rank is', ckey[0])
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
				//console.log('discard',otree.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		//console.log('building after removing cards', list, obuilding)

		if (isdef(obuilding.h)) {
			fen.deck_discard.unshift(obuilding.h);
		}
		ari_reorg_discard(fen);


		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));

		//console.log('===>remove',obuilding,'from',blist);
		removeInPlace(blist, obuilding);

		//console.log('player', owner, 'after building destruction', otree[owner])
	}
	ari_history_list([`${uplayer} visited ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'visit');

	ari_next_action(fen, uplayer);


}
//#endregion

//#region upgrade
function process_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let n = A.selected.length;
	if (n > 2 || n == 2 && !has_farm(uplayer)) {
		select_error('too many cards selected!');
		return;
	} else if (n == 0) {
		select_error('please select hand or stall card(s) to upgrade!');
		return;
	}

	//ok also die cards wurden correct selected
	A.upgrade_cards = A.selected.map(x => A.items[x]);
	//next ist selection of building to upgrade
	Z.stage = fen.stage = 102;
	ari_pre_action();
}
function post_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	let gb = A.building;
	//console.log('gb', gb)
	let b = lookup(fen, gb.path.split('.'));
	//console.log('real building:', b);
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estate' : 'chateau';
	let target = lookup(fen, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(fen, o.path.split('.'));
		//console.log('target',target,'elem',o.key,'source',source);
		elem_from_to(o.key, source, target.list);

		//also need to move the entire building to either estate or chateau
		//if this was a farm and 
	}
	//wie krieg ich das gesamte building?
	let bres = target; //lookup(otree,target);
	bres.h = null;
	//console.log('target',target);
	removeInPlace(fen.players[uplayer].buildings[type0], bres);
	fen.players[uplayer].buildings[type1].push(bres);

	ari_history_list([`${uplayer} upgrades a ${type0}`], 'upgrade');

	//console.log('building after upgrade', bres);
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();
}
//#endregion







