function accuse() {
	function state_info(dParent) {
		let histinfo = !isEmpty(Z.fen.generations) ? '(' + Z.fen.generations.map(x => x.color == 'white' ? '_' : x.color).join(', ') + ')' : '';
		//console.log('generations', histinfo);
		dParent.innerHTML = Z.phase > Z.options.rounds ? `game over ${histinfo}!` : `generation ${Z.fen.phase}/${Z.options.rounds} ${histinfo}`; //`phase: ${Z.phase}, turn: ${Z.turn}, stage:${Z.stage}`; 
		return false;
	}
	function setup(players, options) {
		//console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		//console.log('players', players, 'options', options)
		let fen = {
			players: {}, plorder: jsCopy(players),
			history: [{ title: '*** game start ***', lines: [] }],
			rounds: options.rounds, stability: options.stability, cardtype: options.cardtype,
			handsize: Number(options.handsize) + (players.length > 9 ? 0 : 1),
			colors: arrTake(get_nc_color_array(), Number(options.colors)),
		};
		shuffle(fen.plorder);
		let plorder = fen.plorder;
		let num = Math.max(7, Math.ceil(players.length / 2));

		let deck_identities = fen.deck_identities = [];
		for (let i = 0; i < num; i++) {
			for (const c of fen.colors) {
				deck_identities.push(c);
			}
			// deck_identities.push(ranks[i] + 'Hh'); deck_identities.push(ranks[i] + 'Sh'); 
		}
		shuffle(deck_identities);

		//console.log('plorder', plorder)
		for (const plname of plorder) {
			//console.log('plname', plname)
			let pl = fen.players[plname] = {
				score: 0,
				experience: 0,
				name: plname,
				idleft: deck_deal(deck_identities, 1)[0],
				color: get_user_color(plname),
			};
		}

		//each player gets idright = idleft of next player
		for (let i = 0; i < plorder.length; i++) {
			let j = (i + 1) % plorder.length;
			fen.players[plorder[i]].idright = fen.players[plorder[j]].idleft;
		}

		[fen.phase, fen.stage, fen.step, fen.turn] = ['1', 'membership', 0, jsCopy(fen.plorder)];
		start_new_generation(fen, fen.plorder, options);

		//show_sitting_order
		//accuse_show_sitting_order(fen);

		return fen;
	}
	function check_gameover() {
		if (Z.phase <= Z.fen.rounds) return false;

		//end reached: final scoring:
		let [fen, num] = [Z.fen, Z.fen.rounds];
		for (const plname in fen.players) {
			let pl = fen.players[plname];
			let cleft = get_color_of_card(pl.idleft);
			let cright = get_color_of_card(pl.idright);
			for (const sess of fen.generations) {
				if (sess.color == cleft) pl.score += 1;
				if (sess.color == cright) pl.score += 1;
			}
			//if ( == color) pl.score += num;
			//if (get_color_of_card(pl.idright) == color) pl.score += num;
		}

		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		//console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);

		let sorted2 = sortByDescending(all_winners, 'experience');
		let max_experience = sorted2[0].experience;
		let all_experience = sorted2.filter(x => x.experience == max_experience);

		fen.winners = all_experience.map(x => x.name);
		//console.log('generations:', fen.generations)
		return fen.winners;
	}
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {
	//console.log('options',Z.options)
	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto', h: 32 });

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	show_history(fen, dRechts);
	if (isdef(fen.msg)) { show_message(fen.msg, true); }

	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];

	// *** d1 policies ***
	let [color, n] = get_policies_to_win();
	UI.policies = ui_type_accuse_policies(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	//UI.policies.items.map(x=>mStyle(iDiv(x),{border:x.bg,bg:'silver'})); //:.75}))
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : n <= 0 ? `${capitalize(color)} wins generation ${fen.generations.length}!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)

	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	let order = get_present_order();
	let me = order[0];

	// *** d2 players ***
	if (Z.phase > Z.options.rounds) show_playerstats_over(d2); else show_playerstats_orig(d2);


	// *** d3 me ***
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	let dnet = mDiv(d3, { w: wneeded });
	let wrest = wneeded - 2 * himg;
	dnet.style.gridTemplateColumns = `64px 1fr 64px`;
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${hgap}px ${wgap}px`;

	let pl = fen.players[me];

	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par });
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))

	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	let d_idleft = mDiv(dnet, { w: 64, padding: par });
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))

	// *** d4 hand ***
	mStyle(d4, { margin: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, { h: hhand }, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);

	presentcards(hvotecard);

	// *** show membership color for me (or in 'round' stage for all)
	let plnames = stage == 'round' || stage == 'gameover' ? order : [me];
	plnames.map(x => show_membership_color(x, hnetcard, himg));

}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
	//if (!isEmpty(donelist)) console.log('.................donelist',donelist)
	let complete = ['hand', 'membership', 'tied_consensus'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x.state));
	if (complete && !sameList(turn, [Z.host])) {
		//console.log('COMPLETE! donelist', donelist)
		relegate_to_host(donelist);
		return;
	}
	//if still here and multiturn: it cannot be complete or Z.host is only player on turn now!
	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	assertion(!complete || sameList(turn, [Z.host]), 'complete hat nicht zu host uebergeben!!!!!!!!!!')
	assertion(!complete || !waiting, 'ERROR WAITING WHEN COMPLETE!!!')
	Z.isWaiting = waiting; //das ist nur fuer page tab title animated vs static

	assertion(turn.length == 1 || ['membership', 'hand', 'round'].includes(stage), "FALSCHE ASSUMPTION!!!!!!!!!!!!!");
	if (turn.length == 1) check_experience_states();

	if (waiting) {
		//console.log('WAITING!!', stage, uplayer);
		accuse_show_selected_state(donelist.find(x => x.name == uplayer).state);
		if (Z.mode != 'multi') { take_turn_waiting(); return; }
		autopoll();
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING votes on click!!!!!!!!!!!!!')
		DA.gobutton = mButton('evaluate cards', accuse_evaluate_votes, dTable, {}, ['donebutton', 'enabled']);
	} else if (stage == 'membershipresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of fen.pldata) { //Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.item;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)
			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
			histest.push(`${plname} ${DA.showTestButtons ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}
		ari_history_list(histest, 'membership');
		start_new_poll();
	} else if (stage == 'roundresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING round => new generation!!!!!!!!!!!!!')
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		stage = Z.stage = Z.phase > fen.rounds ? 'gameover' : 'membership';

		if (stage == 'membership') {
			for (const pl in fen.players) { delete fen.players[pl].membership; }
			start_new_generation(fen, Z.plorder, Z.options);
		}
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let parley_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		addIf(fen.presidents_poll, fen.president);
		if (parley_action_available) {
			select_add_items(ui_get_string_items(['parley']), president_parley, 'may parley cards', 0, 1);
		} else {
			//proceed to president_2
			Z.stage = 'president_2';
			accuse_activate();
		}
	} else if (stage == 'president_2') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let actions = ['defect', 'resign'];
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer && !fen.presidents_poll.includes(x));
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(fen.colors), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parley_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parley_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parley_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parley_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parley_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parley_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `generation end! ${fen.generations[fen.phase - 1].color} wins`);
		show_special_message(`generation end! ${fen.generations[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert(`PROBLEM!!! unknown stage ${stage}`)
	}
}

//#region president sequence of actions
function president_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let action = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'selects action', action)

	if (action == 'accuse') {
		//Z.stage = fen.isprovisional ? 'pay_for_accuse' : 'accuse_action_select_player';
		Z.stage = 'accuse_action_select_player'; //provisional does NOT pay anymore
		accuse_activate();

	} else if (action == 'parley') {
		Z.stage = 'parley_select_player';
		accuse_activate();

	} else if (action == 'defect') {
		Z.stage = 'defect_membership';
		accuse_activate();

	} else if (action == 'resign') {
		ari_history_list(`${uplayer} resigns as president`, 'resign')
		president_end();
	}
}

function pay_for_accuse_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	removeInPlace(fen.players[uplayer].hand, card); accuse_discard(card)
	redraw_hand();
	Z.stage = 'accuse_action_select_player';
	ari_history_list(`${uplayer} pays for accuse action`, 'accuse')
	accuse_activate();
}
function accuse_submit_accused() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'accuses', plname);
	fen.accused = plname;
	Z.stage = 'accuse_action_select_color';
	ari_history_list(`${uplayer} accuses ${plname}`, 'accuse')
	accuse_activate();
}
function accuse_submit_accused_color() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let color = A.items[A.selected[0]].a;


	//console.log('president', uplayer, 'accused', accused, 'of being', color);

	//now check the color
	let card = fen.players[accused].membership;
	let real_color = get_color_of_card(card);
	ari_history_list(`${uplayer} guesses ${color == real_color ? 'CORRECT' : 'WRONG'} (${color})`, 'accuse')
	console.log(`PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`);
	fen.msg = `PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`;
	if (color == real_color) {
		//guess was correct!
		//president keeps membership card
		//accused needs to replace membership card
		//console.log('PRESIDENT GUESSES CORRECTLY!!!')
		Z.turn = [accused];
		//console.log(fen.players[uplayer], fen.players[uplayer].hand, card)
		fen.players[uplayer].hand.push(card);
		fen.wrong_guesses = 0;
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_entlarvt';
		take_turn_fen_clear(); //!!!!clear added!!!!
	} else {
		//console.log('PRESIDENT GUESSES WRONG!!!!!!!!!!!!');
		Z.turn = [accused];
		fen.players[accused].hand.push(card);
		fen.wrong_guesses += 1;
		//fen.president = accused;
		//fen.isprovisional = true;
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_provisional';
		take_turn_fen_clear(); //!!!!clear added!!!!

	}

}
function accuse_replaced_membership() {
	let [stage, A, uplayer, fen, accused] = [Z.stage, Z.A, Z.uplayer, Z.fen, Z.fen.accused];

	assertion(accused == uplayer, "accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	accuse_discard(pl.membership)
	pl.membership = card;
	removeInPlace(pl.hand, card);
	ari_history_list(`${accused} chooses new membership` + (DA.showTestButtons ? ` ${card}` : ''), 'accuse');
	delete fen.msg;
	if (stage == 'accuse_action_entlarvt'){
		Z.turn = [fen.president];
		Z.stage = 'accuse_action_policy';
		take_turn_fen_clear(); //!!!!clear added!!!!
	}else{
		fen.newpresident = accused;
		set_new_president();
	}
}
function accuse_enact_policy() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;

	//this card is chosen as a policy
	if (!isEmpty(card)) {
		lookupAddToList(fen, ['policies'], get_color_of_card(card));
		removeInPlace(fen.players[uplayer].hand, card);
		ari_history_list(`${uplayer} enacts a ${get_color_of_card(card)} policy`, 'policy')

		//look if last X policies are same color =>dominance
		let policies_needed = fen.stability - fen.crisis;
		let arr = arrTakeLast(fen.policies, policies_needed);
		let color = arrAllSame(arr, get_color_of_card);
		if (color && arr.length >= policies_needed) {
			//generation ends here!!! 
			fen.dominance = true;
			ari_history_list(`${color} dominance reached!`, 'generation ends')

			//update score
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();


		} else {
			president_end();
		}


	} else {
		president_end();
	}
}
function set_new_president() {
	let fen = Z.fen;

	if (fen.wrong_guesses >= 3) {
		//at this point it is still old president's turn!
		ari_history_list(`too many wrong guesses!!!`, 'abort');
		president_end();

	} else {
		fen.president = fen.newpresident;
		delete fen.newpresident;
		fen.isprovisional = true;
		Z.stage = 'president';
		Z.turn = [fen.president];
		ari_history_list(`new president is ${fen.president}`, 'provisional president')
		take_turn_fen_clear(); //!!!!clear added!!!!
	}

}

function president_parley() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	if (!isEmpty(A.selected)) {
		//console.log('president selected parley', Z.uplayer);
		Z.stage = 'parley_select_player';
		accuse_activate();
	} else {
		Z.stage = 'president_2';
		accuse_activate();
	}
}
function parley_player_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let other = fen.other = A.items[A.selected[0]].a;
	fen.maxcards = Math.min(fen.players[other].hand.length, fen.players[uplayer].hand.length);
	Z.stage = 'parley_select_cards'
	accuse_activate();
}
function parley_cards_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let player_cards = fen.player_cards = A.selected.map(x => A.items[x].a);
	Z.turn = [fen.other];
	Z.stage = 'parley_opponent_selects';
	take_turn_fen_clear(); //!!!!clear added!!!!
}
function parley_opponent_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let opp_cards = A.selected.map(x => A.items[x].a);
	//resolve!
	let pl1 = fen.players[fen.president];
	let pl2 = fen.players[uplayer];
	fen.player_cards.map(x => removeInPlace(pl1.hand, x))
	fen.player_cards.map(x => pl2.hand.push(x));
	opp_cards.map(x => removeInPlace(pl2.hand, x))
	opp_cards.map(x => pl1.hand.push(x));

	ari_history_list(`president ${fen.president} exchanged ${opp_cards.length} cards with ${uplayer}`, 'parley')

	Z.stage = 'president_2';
	Z.turn = [fen.president];
	take_turn_fen_clear();
	//president_end();
}

function defect_resolve() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	let pl = fen.players[uplayer];
	let mem = pl.membership;
	pl.membership = card;
	removeInPlace(pl.hand, card);

	let def = Z.options.defected;
	console.log('defected', def);
	if (def == 'remove') accuse_discard(mem);
	else if (def == 'exchange') pl.hand.push(mem);
	else if (def == 'draw') pl.hand.push(fen.deck_discard.shift())

	ari_history_list(`${uplayer} replaces membership`, 'defect')
	president_end();
}

function president_end() {
	let fen = Z.fen;

	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;

	fen.validvoters = jsCopy(fen.plorder);

	start_new_poll();
}
//#endregion

//#region evaluate votes
function accuse_evaluate_votes() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	assertion(uplayer == host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
	let votes = [];
	for (const pldata of fen.pldata) { //Z.playerdata) {
		let plname = pldata.name;
		let card = pldata.state.item;
		if (!isEmpty(card)) votes.push({ plname: plname, card: card });
		else removeInPlace(fen.validvoters, plname);
	}
	ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'votes');

	//resolve votes
	//0. check if unsuccessful (no votes)
	if (isEmpty(votes)) { eval_empty_votes(votes); return; }

	//1. check if all votes same color (consensus)
	let color = arrSame(votes, x => get_color_of_card(x.card));
	if (color) { eval_consensus(votes, color); return; }

	//2. check single winner if any (presidency)
	let max_votes = get_max_votes(votes);
	if (max_votes.length == 1) { eval_president(max_votes[0]); }
	else { eval_tie(max_votes, votes); }


}
function eval_consensus(votes, color) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//check ob es eindeutiges maximum rank gibt
	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	//console.log(vsorted.map(x => x.card));
	//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);

	let opt = valf(Z.options.consensus, 'policy');

	if (opt == 'policy') {
		fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); //last_policy);
		fen.validvoters = jsCopy(Z.plorder);
		check_enough_policies_or_start_new_poll(`consensus on ${color}`);
	} else if (opt == "coupdetat") {
		let ace_present = vsorted.find(x => is_ace(x.card));
		//console.log('ace_present', ace_present);
		if (isdef(ace_present)) {
			ari_history_list(`coup succeeded! ${color} wins!`, 'generation ends');
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else { //just add a policy
			fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); 
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	} else if (opt == 'generation') {
		ari_history_list(`consensus on ${color}!`, 'generation ends');
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'playerpolicy') { // opt == 'policy'
		//what if there is a tie?
		let tie = vsorted.length > 1 && getRankOf(vsorted[0].card) == getRankOf(vsorted[1].card);
		if (tie) {
			//need to go into a dialogue: each of the tied players must select a victim (tied player) who will pay!
			let maxrank = getRankOf(vsorted[0].card);
			let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);
			let tied_players = tied_votes.map(x => x.plname);
			console.log('tied', tied_votes, tied_players);
			Z.turn = tied_players;
			Z.stage = 'tied_consensus';
			fen.tied_votes = tied_votes;
			take_turn_fen_clear();
		} else {
			let winner = vsorted[0];
			//remove winning vote from player hand and add it to policies!
			fen.policies.push(winner.card);
			removeInPlace(fen.players[winner.plname].hand, winner.card);
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	}
}
function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let last_policy = arrLast(fen.policies);
	if (last_policy) {
		// console.log('add policy, last:', last_policy)
		fen.policies.push(last_policy);
	}
	fen.validvoters = jsCopy(Z.plorder);
	check_enough_policies_or_start_new_poll(`no one voted: policy repeat`);
}
function eval_president(winning_vote) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let plwinner = winning_vote.plname;
	//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
	//return all pending cards (from previous votes) to resp hands
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.pending) && !isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
		delete pl.pending;
	}
	//discard winning vote
	removeInPlace(fen.players[plwinner].hand, winning_vote.card);
	fen.deck_discard.push(winning_vote.card);
	fen.president = plwinner;
	fen.players[plwinner].experience += 1;
	fen.isprovisional = false;
	ari_history_list(`${plwinner} wins presidency!`, 'president');
	Z.turn = [plwinner];
	Z.stage = 'president';
	take_turn_fen_clear();
}
function eval_tie(max_votes, votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//console.log('Tie!!!!!!!!!!!!!', vsorted);
	ari_history_list('tie! new poll round', 'poll');

	//played cards go into pending
	for (const v of votes) {
		let plname = v.plname;
		let pl = fen.players[plname];
		lookupAddToList(pl, ['pending'], v.card)
		removeInPlace(pl.hand, v.card);
	}
	start_new_poll();

}

//#endregion

//#region experience points gifting
function check_experience_states() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//read playerdata state2
	let donelist = Z.playerdata.filter(x => isDict(x.state1));
	//console.log('...state1',donelist,stage);

	for (const x of donelist) {
		//this is a gift from 
		let plfrom = x.name;
		let plto = x.state1.plname;
		let num = Number(x.state1.num);

		fen.players[plfrom].experience -= num;
		fen.players[plto].experience += num;
		ari_history_list(`${plfrom} bribes ${plto}: ${num} points!`, 'corruption!')
		x.state1 = null; //reset fuer den fall dass multiple times in accuse_activate gehe!!!!
	}




}
function gift_experience_points() {
	let selected = DA.popupitems.filter(x => x.isSelected);
	if (selected.length < 2) {
		//console.log('cannot send experience points!!!!');
		return;
	}
	let plname_item = selected.find(x => x.irow == 0);
	let plname = plname_item.a;
	let num_item = selected.find(x => x.irow == 1);
	let num = Number(num_item.a);
	//console.log('player', Z.uplayer, 'gives', num, 'points to', plname);
	//close the popup

	mRemove('dBandMessage');
	Z.state1 = { plname: plname, num: num };
	take_turn_state1();

	//now I need reload with write player!!!!

}
function send_experience_points() {
	console.log('sending experience points.....')
}
function show_special_popup(title, onsubmit, styles = {}) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 154, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);

	mDiv(dParent, {}, null, title)

	let dContent = mDiv(dParent, { bg: 'silver' })
	DA.popupitems = [];
	let irow = 0;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const list of [...arguments].slice(3)) {
		let d = mDiv(dContent, { padding: 10 }, `d_line_${irow}`);
		mCenterFlex(d);
		let items = ui_get_string_items(list);
		DA.popupitems = DA.popupitems.concat(items);
		let sample = items[0];
		//console.log('sample', sample); //continue;
		let type = sample.itemtype = isNumber(sample.a) ? 'number' : is_card(sample.a) ? 'card' : is_player(sample.a) ? 'player' : isdef(sample.o) ? 'container' : is_color(sample.a) ? 'color' : 'string';
		//console.log('type', type); //continue;
		//lookupSet(DA,['selections',idx],null);
		//DA.selections[irow]=null;
		let icol = 0;
		for (const item of items) {
			//console.log('type', type, items[0].a);
			//let handler = x=> ev => DA.selections[x]=ev.target; //console.log(ev.target.innerHTML,x); //lookupSetOverride(DA,['selections',idx],ev.target.innerHTML);
			item.div = mButton(item.a, unselect_select, d, buttonstyle, 'selectable_button', `b_${irow}_${icol}`);
			item.id = item.div.id;
			item.irow = irow;
			item.icol = icol;
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
			icol++;
		}
		irow++;
		//for (const el of list) { mButton(el, x => console.log(x.target.innerHTML), d); }
	}
	mButton("submit", gift_experience_points, dContent, buttonstyle, ['donebutton', 'enabled']);
	mButton("cancel", () => { mRemove('dBandMessage'); }, dContent, buttonstyle, ['donebutton', 'enabled']);
}
function unselect_select(ev) {
	let id = evToId(ev);
	//console.log('clicked', id)
	let [irow, icol] = allNumbers(id);
	//console.log('row', irow, 'col', icol);
	let newitem = null;
	//check if there is an item selected in that row already
	for (const item of DA.popupitems) {
		//console.log('item', item, item.isSelected);
		let id1 = iDiv(item).id;
		let [irow1, icol1] = allNumbers(id1);
		if (irow1 == irow && icol1 != icol && item.isSelected) {
			make_string_unselected(item);
			item.isSelected = false;
		} else if (irow1 == irow && icol1 == icol) {
			newitem = item;
		}
	}
	//newitem should be selected or unselected
	//console.log('newitem', newitem)
	if (newitem.isSelected) { make_string_unselected(newitem); newitem.isSelected = false; }
	else { make_string_selected(newitem); newitem.isSelected = true; }
}
//#endregion

//#region helpers
function accuse_ai_move(bot) {
	let [pl, fen, stage] = [Z.fen.players[bot], Z.fen, Z.stage];
	if (stage == 'hand') {
		//this is where hand card or empty can be played
		pl.move = { state: { item: '' } }
	} else if (stage == 'membership') {
		//this is where a membership card has to be chosen
	}
}
function accuse_discard(card) { Z.fen.deck_discard.push(card) }
function accuse_onclick_weiter() {
	Z.state = { item: Z.uplayer };
	take_turn_multi();
}
function accuse_score_update(color) {
	let [fen] = [Z.fen];

	let generation_entry = { color: color };
	let plgeneration = generation_entry.players = {};

	for (const plname in fen.players) {
		let pl = fen.players[plname];

		plgeneration[plname] = get_color_of_card(pl.membership); // { left: get_color_of_card(pl.idleft), middle: get_color_of_card(pl.membership), right: get_color_of_card(pl.idright) };

		//if (get_color_of_card(pl.idleft) == color) pl.score += 1;
		//if (get_color_of_card(pl.idright) == color) pl.score += 1;
		if (get_color_of_card(pl.membership) == color) pl.score += 1;
	}

	lookupAddToList(fen, ['generations'], generation_entry);
	//console.log('SCORE UPDATE!!!', fen.phase, color, '\nentry', generation_entry);


}
function accuse_player_stat(dParent, plname, hvotecard, himg, hstatfz, gap) {
	let players = Z.fen.players;
	let pl = players[plname];
	//console.log('plname',plname,pl)
	//console.log()
	let onturn = Z.turn.includes(plname);
	let sz = himg; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(dParent, { align: 'center' });
	//let d = mDiv(dParent); mCenterFlex(d); //, { margin: 4, align: 'center' });
	let card = mDiv(d, { hmin: hvotecard + gap, bg: 'transparent', mabottom: gap, paright: 4 }); mCenterFlex(card);

	let wstats = sz * 1.3;
	let dcombine = mDiv(d, { w: wstats, margin: 'auto' }); //,{padding:6});

	let dimg = mDiv(dcombine, { padding: 0 }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`); mCenterFlex(dimg);
	let stats = mDiv(dcombine, { align: 'center', w: wstats, bg: 'silver', rounding: 10 }); mCenterFlex(stats);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dcombi: dcombine, dstats: stats, dimg: dimg, dcard: card });
	let numcols = 3;
	accuse_player_stat_count('star', pl.score, stats, { sz: hstatfz }, numcols);
	accuse_player_stat_count('hand with fingers splayed', pl.hand.length, stats, { sz: hstatfz }, numcols);
	accuse_player_stat_count('eye', pl.experience, stats, { sz: hstatfz }, numcols);

	return x;
}
function accuse_player_stat_count(key, n, dParent, styles = {}, numcols) {
	//mStyle(dParent,{align:'center'});
	let sz = valf(styles.sz, 8);
	let d = mDiv(dParent, { w: `${100 / numcols}%`, align: 'center' });
	let dsym;
	if (isdef(Syms[key])) dsym = mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else dsym = mText(key, d, { h: sz, fz: sz, w: '100%' });
	//console.log('hallo!!!')

	//if (nundef(styles.wmax)) styles.wmax = sz;
	//addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);

	let dn = mDiv(d, { fz: 2 * sz, weight: 'bold' }, null, n);
	return d;
}
function accuse_show_selected_state(state) {
	let [fen, uplayer, stage] = [Z.fen, Z.uplayer, Z.stage];
	let mystate = state.item;
	if (!isEmpty(mystate)) {
		let handui = lookup(UI, ['players', uplayer, 'hand']);
		let items = handui.items;
		let cardui = items.find(x => x.key == mystate)
		if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
		else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
		else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
	}
}
function accuse_show_sitting_order(fen) {
	if (nundef(fen)) fen = Z.fen;

	//ist der turn immer wie der sitting order?
	//console.log('turn');
	for (const plname of fen.turn) {
		let pl = fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

	//console.log('plorder');
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

}
function accuse_submit_card() {
	//console.log('A',Z.A);
	let A = Z.A;
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;
	Z.state = { item: card };
	take_turn_multi();
}
function accuse_submit_membership() {
	//console.log('A',Z.A);
	let A = Z.A;
	let card = A.items[A.selected[0]].a;
	//console.log('player',Z.uplayer,'selectes membership',card,Z.fen.players[Z.uplayer].hand)
	Z.state = { item: card };
	take_turn_multi();
}
function add_advanced_ui(dParent) {
	mDiv(dParent, {}, 'dAdvancedUI');
	show_advanced_ui_buttons();
}
function arrSame(arr, func) {
	if (isEmpty(arr)) return true;
	let x = func(arr[0]);
	for (let i = 1; i < arr.length; i++) {
		if (func(arr[i]) != x) return false;
	}
	return x;
}
function arrAllSame(arr, func) {
	if (isEmpty(arr)) return false;
	//console.log('arr',arr)
	let arr1 = arr.map(x => func(x));
	let sample = arr1[0];
	for (let i = 1; i < arr1.length; i++) if (arr1[i] != sample) return false;
	return sample;
}
function calcNumRanks(total, repeat, ncolors) {
	let d = Math.ceil(total / (repeat * ncolors));
	return range(1, d + 1);
}
function check_enough_policies_or_start_new_poll(msg_new_poll) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//look if last X policies are same color =>dominance
	let policies_needed = fen.stability - fen.crisis;
	let arr = arrTakeLast(fen.policies, policies_needed);
	//console.log('arr',arr)
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= policies_needed) {
		//generation ends here!!! 
		fen.dominance = true;
		ari_history_list(`${color} dominance reached!`, 'generation ends')

		//update score
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		//Z.phase += 1
		Z.stage = 'round';
		take_turn_fen_clear();
		return true;

	} else {

		ari_history_list(msg_new_poll, 'new poll')
		start_new_poll();
		return false;
	}


}
function get_advanced_menu_button() {
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">T</a>`;
	let b = mCreateFrom(html);
	mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mClass(b, 'hop1')
	return b;
}
function get_advanced_menu_buttons() {
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a href="javascript:onclick_advanced_test()">T</a>`;
	let btest = mCreateFrom(html);
	let mode = 'multi';
	html = `<a href="javascript:onclick_advanced_mode()">${mode[0].toUpperCase()}</a>`;
	let bmode = mCreateFrom(html);
	let d = mCreate('div');
	mAppend(d, btest);
	mAppend(d, bmode);
	let styles = { bg: 'silver', wmin: 25, h: 25, rounding: '50%', maright: 10, align: 'center' };
	mStyle(btest, styles);
	mStyle(bmode, styles);
	//mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	// mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mClass(btest, 'hop1')
	mClass(bmode, 'hop1')
	return d;
}
function get_bots_on_turn() {
	let players = Z.turn;
	return players.filter(x => Z.fen.players[x].playmode != 'human');
}
function get_color_card(ckey, h, opts = {}) {
	//console.log('ckey', ckey);
	let color;
	if (nundef(ckey)) color = 'transparent'; else color = is_color(ckey) ? ckey : get_color_of_card(ckey);
	//console.log('color',color)
	let type = 'color';
	let info = { friendly: color, color: valf(opts.bg, BLUE) }
	info.ckey = color;
	let el = mDiv(null, { bg: color == 'black' ? '#222' : color, rounding: h / 10, border: 'silver' });
	h = valf(h, valf(info.h, 100));
	w = valf(opts.w, h * .7);
	mSize(el, w, h);
	let card = {};
	copyKeys(info, card);
	copyKeys({ sz: h, w: w, h: h, faceUp: true, div: el }, card);
	card.ov = valf(opts.ov, .3);

	return card;
}
function get_max_votes(votes) {
	//assume: votes non empty list of {plname:,card:}
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	let maxrank = getRankOf(vsorted[0].card);
	let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);

	return tied_votes;


}
function get_nc_color_array() { return ['red', 'black', 'blue', 'green', 'gold', 'hotpink', 'cyan'] }
function get_nc_complement_array(color) { return { red: '#ff9999', black: '#999', blue: BLUE, green: GREEN, gold: 'lightgoldenrodyellow', hotpink: 'pink', cyan: TEAL }[color]; }

function get_number_card(ckey, h = 100, w = null, backcolor = BLUE, ov = .3) {
	let info = {};
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');

	info.key = ckey;
	info.cardtype = 'num';
	let [r, s] = [info.rank, info.suit] = [Number(num), color];
	info.val = r; // Number(num);
	info.color = backcolor;
	let sz = info.sz = info.h = h;
	w = info.w = valf(w, sz * .7);
	if (!isList(Z.fen.ranks)) Z.fen.ranks = calcNumRanks(get_keys(Z.fen.players).length * Z.fen.handsize, 2, Z.fen.colors.length);
	//console.log('ranks',Z.fen.ranks);
	let ranks = valf(lookup(Z, ['fen', 'ranks']), range(100)); //Z.fen.ranks;
	info.irank = ranks.indexOf(r);
	info.isuit = valf(lookup(Z, ['fen', 'colors']), get_nc_color_array()).indexOf(s); //range(100));'SHCD'.indexOf(s);
	info.isort = info.isuit * ranks.length + info.irank;

	//card face
	//let card = cBlank(dTable, { h: sz, w:w, border: 'silver' });
	//let dcard = mDiv(dTable,{h:h,w:w,rounding:4,bg:'white',border:'silver'});
	//console.log('________w',w)

	let d = mDiv(null, { h: h, w: w, rounding: 4, bg: 'white', border: 'silver' }, null, null, 'card');
	//console.log('ui',d)

	//let d = iDiv(ui, { margin: 10 });
	let [sm, lg] = [sz / 8, sz / 4]

	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { matop: (h - lg) / 2, family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }, null, num);
	//mPlace(dbig, 'cc');

	// mSize(ui, info.w, info.h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: info.w, h: info.h, faceUp: true, div: d }, res);
	if (isdef(ov)) res.ov = ov;

	return res;
}
function get_random_ballot_card() {
	let [fen] = [Z.fen];
	//console.log('fen.cardtype', fen.cardtype, '\nranks', fen.ranks);
	return fen.cardtype == 'num' ? `${rChoose(fen.ranks)}_${rChoose(fen.colors)}` : `${rCard('n', fen.ranks, 'SHDC')}`;
}
function get_policies_to_win() {
	let fen = Z.fen;
	let policies_needed = fen.stability - fen.crisis;
	if (isEmpty(fen.policies)) return ['any', policies_needed];
	//console.log('fen.policies',fen.policies)
	let revlist = jsCopy(fen.policies).reverse();
	let color = get_color_of_card(revlist[0]);
	let samecolorlist = arrTakeWhile(revlist, x => get_color_of_card(x) == color);
	//console.log('samecolorlist',samecolorlist)
	return [color, Math.max(0, policies_needed - samecolorlist.length)];
}
function get_player_data(plname) { return firstCond(Z.playerdata, x => x.name == plname); }
function get_player_state(plname) { let pld = get_player_data(plname); return pld ? pld.state : null; }
function get_player_card(plname) { let pld = get_player_data(plname); return pld ? pld.state.item : null; }
function get_players_with_at_least_one_hand_card() {
	return get_keys(Z.fen.players).filter(x => Z.fen.players[x].hand.length >= 1);
}
function get_other_players() { return get_keys(Z.fen.players).filter(x => x != Z.uplayer); }
function get_others_with_at_least_one_hand_card() {
	//console.log('uplayer',Z.uplayer)
	return get_keys(Z.fen.players).filter(x => x != Z.uplayer && Z.fen.players[x].hand.length >= 1);
}
function getRankOf(ckey, ranks) {
	//console.log('ckey',ckey,ranks)
	if (is_nc_card(ckey)) return Number(stringBefore(ckey, '_'));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return ckey[0];
}
function get_valid_voters() {
	return Z.fen.validvoters.filter(x => Z.fen.players[x].hand.length >= 1);
}
function has_player_state(plname) { let pld = get_player_data(plname); return pld ? pld.state : false; }
function is_ace(ckey) { return ckey[0] == 'A' || firstNumber(ckey) == 1; }
function is_nc_card(ckey) { return ckey.includes('_'); }
function presentcards(h) {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = isdef(fen.pldata) ? fen.pldata : Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
	if (!startsWith(stage, 'hand') && !startsWith(stage, 'membership')) return;
	for (const pld of donelist) {
		let plname = pld.name;
		let plui = lookup(UI, ['stats', plname]);
		let dcard = plui.dcard;

		if (isEmpty(arrChildren(dcard))) {
			// console.log('dcard',dcard)
			let card = pld.state.item;
			let actualcard = plui.actualcard = !isEmpty(card);
			//console.log('card', card)
			let card1 = plui.card = accuse_get_card(actualcard ? card : 'AHn', h)
			mAppend(dcard, iDiv(card1));
		}
		if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
	}
}
function redraw_hand() {
	let [uplayer, fen, ui, dt] = [Z.uplayer, Z.fen, UI, dTable];
	let ch = arrChildren(dt);
	let handui = UI.players[uplayer].hand.container;
	handui.remove();
	//dt.lastchild.remove();
	let pl = fen.players[uplayer];
	lookupSetOverride(ui, ['players', uplayer, 'hand'], ui_type_hand(pl.hand, dt, { paleft: 25 }, `players.${uplayer}.hand`));


}
function relegate_to_host(list) {
	//console.log('***', list)
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//console.log('complete', turn, sameList(turn, [Z.host]), 'uplayer', uplayer);
	if (stage == 'hand') fen.cardsrevealed = true;
	Z.turn = [Z.host];
	fen.pldata = list;

	Z.stage = Z.stage + 'resolve';
	take_turn_fen(); //das ist ein fen override in multiturn!!!!!!!
	return;

}
function show_advanced_ui_buttons() {
	let dParent = mBy('dAdvancedUI');
	//if (nundef(dParent)) return;
	mClear(dParent)
	let sz = 20;
	let styles = { bg: 'silver', wmin: sz, h: sz, rounding: '50%', maright: 10, align: 'center' };
	mButton(' ', onclick_advanced_test, dParent, styles, 'enabled');
	style_advanced_button();
	//let mode = Z.mode;
	//mButton(mode[0].toUpperCase(),onclick_advanced_mode,dParent,styles,'enabled');
}
function show_membership_color(plname, hnetcard, himg) {

	let dx = lookup(UI, ['stats', plname]);
	//console.log('dx',dx,plname);

	let pl = Z.fen.players[plname];

	if (nundef(pl.membership)) return;

	let c = get_color_of_card(pl.membership);
	mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10, patop: 4 })
	mStyle(dx.dstats, { bg: c, fg: 'white' });
	dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;

}
function show_number_card(ckey, sz) {

	//console.log('show_card', ckey)

	let card = cBlank(dTable, { h: sz, border: 'silver' });

	let d = iDiv(card, { margin: 10 });
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');

	//let d=mMeasure()

	let [sm, lg] = [sz / 8, sz / 4]

	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { family: 'algerian', fg: color, fz: lg, h: lg, w: '100%', hline: lg, align: 'center' }, null, num);
	mPlace(dbig, 'cc');
	return card;

}
function show_playerstats_over(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	// *** d2 players ***
	let [wgap, hgap] = [10, 12]; //NEW!
	let players = fen.players;

	let order = get_present_order();
	let me = order[0];
	let ncols = order.length - 1 + order.length - 2;

	let wneeded = (himg + wgap) * ncols + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });

	let szcols = '1fr'; //isover?'auto':'1fr';

	dstats.style.gridTemplateColumns = `repeat(${ncols},${szcols})`; // 'repeat(' + ncols + `,1fr)`;
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) {
		let dshell1 = mDiv(dstats); mCenterCenterFlex(dshell1)
		accuse_player_stat(dshell1, plname, hvotecard, himg, hstatfz, gap);
		//if game is over and this is NOT the last one in order, show his left net card!!!
		if (plname == arrLast(order)) break;
		let dshell2 = mDiv(dstats); mCenterCenterFlex(dshell2)
		let dncshell = mDiv(dshell2); //,{bg:'green'}); //{h:141,patop:90,bg:GREEN});
		let dummy = mDiv(dncshell, { h: 50, bg: 'transparent' })
		let netcard = get_color_card(fen.players[plname].idright, 50);
		mAppend(dncshell, iDiv(netcard));
	}
	mLinebreak(d2)

}
function show_playerstats_orig(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	// *** d2 players ***
	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });
	let order = get_present_order();
	let me = order[0];
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)

}
function show_role_accuse() {
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let [role, pldata, stage, fen, phase, uplayer, turn, uname, host, mode] = [Z.role, Z.playerdata, Z.stage, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	if (mode == 'hotseat') {
		// let dpics = mDiv(d,{gap:10}); mCenterCenterFlex(dpics);
		// let pic = get_user_pic(uplayer, sz = 30, border = 'solid medium white');
		// mStyle(pic, { cursor: 'pointer' });
		text = `hotseat: <span style='color:${get_user_color(uplayer)}'>${uplayer}</span>`;
		styles = boldstyle;
		styles.wmin = 220;
		// let d1=mDiv(dpics,styles,text); mCenterCenterFlex(d1);
		d.innerHTML = text; mStyle(d, styles);
		// mAppend(dpics, pic);
	} else if (role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'inactive' && !DA.showTestButtons) {
		styles = normalstyle;
		text = `(${turn[0]}'s turn)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length > 1 && !has_player_state(uplayer)) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length == 1) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (DA.showTestButtons) {
		let pls = turn.filter(x => x != uname && !has_player_state(x));
		if (isEmpty(pls)) pls = [host];
		let dpics = mDiv(d, { gap: 10 }); mCenterCenterFlex(dpics);
		//console.log('host is',host, 'pls is',pls)
		for (const plname of pls) {
			let pic = get_user_pic(plname, sz = 30, border = 'solid medium white');
			mStyle(pic, { cursor: 'pointer' })
			pic.onclick = () => transferToPlayer(plname);
			mAppend(dpics, pic);
		}
	} else {
		styles = normalstyle;
		text = `(waiting for other players)`;
		d.innerHTML = text; mStyle(d, styles);
	}
}
function show_takeover_ui() {

	DA.omnipower = true;
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host, mode] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];

	//entweder zeigen wenn uname not in turn
	//oder wenn uname in turn aber schon gespielt hat
	if (mode != 'multi') return;

	if (turn.length > 1 && turn.includes(uname) && !has_player_state(uname)) return;

	if (turn.length == 1 && turn[0] == uplayer) return;

	let dTakeover = mBy('dTakeover'); show(dTakeover); mClear(dTakeover);
	dTakeover.innerHTML = '' + stage + ': ';
	let pls = turn.filter(x => x != uname && !has_player_state(x));
	if (isEmpty(pls)) pls = [host];
	//console.log('host is',host, 'pls is',pls)
	for (const plname of pls) {
		let pic = get_user_pic(plname, sz = 35, border = 'solid medium white');
		mStyle(pic, { cursor: 'pointer' })
		pic.onclick = () => transferToPlayer(plname);
		mAppend(dTakeover, pic);
	}
}
function sortCardsByRank(arr, ranks) {
	if (isEmpty(arr)) return [];
	if (is_nc_card(arr[0])) return sortByFunc(arr, x => Number(stringBefore(x, '_')));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return sortByFunc(arr, x => ranks.indexOf(x[0]));
}
function sortCardsByRankDesc(arr, ranks) {
	let res = sortCardsByRank(arr, ranks);
	return arrReverse(res);
}
function sortCardObjectsByRank(arr, ranks, ckeyprop) {
	if (isEmpty(arr)) return [];
	if (is_nc_card(arr[0][ckeyprop])) return sortByFunc(arr, x => Number(stringBefore(x[ckeyprop], '_')));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return sortByFunc(arr, x => ranks.indexOf(x[ckeyprop][0]));
}
function sortCardObjectsByRankDesc(arr, ranks, ckeyprop) {
	let res = sortCardObjectsByRank(arr, ranks, ckeyprop);
	return arrReverse(res);
}
function start_new_generation(fen, players, options) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = [];
	let handsize = fen.handsize;
	let ctype = fen.cardtype;
	if (ctype == 'c52') {
		let ranks = fen.ranks = '*A23456789TJQK';
		let tb = {
			4: ['4', '5', 5, 12, 1],
			5: ['4', 'T', 6, 2, 1],
			6: ['2', 'T', 6, 0, 1],
			7: ['A', 'T', 6, 2, 1],
			8: ['2', 'K', 6, 0, 1],
			9: ['A', 'K', 6, 0, 1],
			10: ['2', 'K', 5, 2, 1],
			11: ['A', 'K', 5, 3, 1],
			12: ['2', '8', 5, 4, 2],
			13: ['2', '9', 5, 2, 2],
			14: ['2', '9', 5, 2, 2], //add 4 10s
		};
		if (nundef(players)) players = get_keys(fen.players);
		let N = players.length;

		let [r0, r1, hz, jo, numdecks] = tb[N];

		for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
			for (let nd = 0; nd < numdecks; nd++) {
				let c = ranks[i];
				for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
			}
		}
		if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }

		// *** jokers ***
		// for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');
		// for (let i = 0; i < jo; i++) { deck_ballots.push('' + (i%2) + 'J' + 'n'); } 
		for (let i = 0; i < jo; i++) { deck_ballots.push('*' + (i % 2 ? 'H' : 'S') + 'n'); }
	} else if (ctype == 'num') {
		let ncolors = fen.colors.length;
		let nplayers = get_keys(fen.players).length;
		let ranks = fen.ranks = calcNumRanks(players.length * handsize, 2, ncolors);
		//console.log('ranks',ranks);
		let ncards = handsize * nplayers;
		let colors = fen.colors;
		let n = 1;
		while (deck_ballots.length < ncards) {
			for (const i of range(2)) {
				for (const c of colors) { deck_ballots.push(`${n}_${c}`); }
				if (deck_ballots.length >= ncards) break;
			}
			n++;
		}
		n--;
		fen.ranks = range(1, n);
		//console.log('new gen: ranks=', fen.ranks, 'n', n)
	}


	shuffle(deck_ballots); //console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	//console.log('phase',fen.phase)
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && fen.colors.includes(last_winning_color)) {
		fen.policies.push(last_winning_color); //get_color_card(last_winning_color)); //'Q' + (last_winning_color == 'red' ? 'H' : 'S') + 'n');
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}
function start_new_poll() {
	Z.stage = 'hand';
	Z.fen.cardsrevealed = false;
	Z.fen.wrong_guesses = 0;
	Z.fen.presidents_poll = [];
	Z.turn = get_valid_voters();
	//console.log('...turn', Z.turn)
	take_turn_fen_clear();

}
function there_are_bots() {
	let players = get_values(Z.fen.players);
	return firstCond(players, x => x.playmode != 'human');

}
function toggle_mode() {
	let mode = valf(Clientdata.mode, Z.mode);
	let newmode = mode == 'multi' ? 'hotseat' : 'multi';
	let b = mBy('dAdvancedUI').children[1];
	if (newmode == 'multi') { b.innerHTML = 'M'; mStyle(b, { fg: 'blue' }) }
	else { b.innerHTML = 'H'; mStyle(b, { fg: 'red' }) }
	return newmode;

}
function toggle_visibility(elem) {
	//returns new visibility (true or false)
	elem = toElem(elem);
	if (nundef(elem)) return;
	let vis = elem.style.display;
	if (vis == 'none') { show(elem); return true; } else { hide(elem); return false; }
}
function transferToPlayer(plname) {
	stopgame();
	clear_screen();
	set_user(plname);	//U = firstCond(Serverdata.users, x => x.name == plname);	//localStorage.setItem('uname', U.name); DA.secretuser = U.name;
	assertion(U.name == plname, 'set_user nicht geklappt!!!!!!!')
	show_username(true);
}
function turn_has_bots_that_must_move() {
	let [turn, pldata] = [Z.turn, Z.playerdata];

	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata, 'name');

	let bots_on_turn = turn.filter(x => Z.fen.players[x].playmode != 'human');
	//console.log('bots_on_turn',bots_on_turn)

	for (const bot of bots_on_turn) {
		//console.log(bot,pldata_dict[bot])
	}

	let no_pldata = bots_on_turn.filter(x => !isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length == bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	//is_bot_turn.map(x=>addIf(no_pldata,x));

	return no_pldata;

}
function ui_add_accuse_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let elem = mText(title, cont, { margin: 3 });
		return elem;
	}
	return null;
}
function ui_get_player_items(playernames) {
	let items = [], i = 0;
	for (const plname of playernames) {
		let plui = UI.stats[plname];
		plui.div = plui.dimg;
		plui.itemtype = 'player';
		let item = { o: plui, a: plname, key: plname, friendly: plname, path: `stats.${plname}`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_type_accuse_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: valf(styles.h, Config.ui.card.h), ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}
function ui_type_accuse_policies(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x));

	for (const item of items) {
		let d = iDiv(item);
		//console.log('item', item)
		let color = item.ckey;
		let c = get_nc_complement_array(color); //colorMix((color,.7)
		mStyle(d, { bg: c, border: color }); //`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
		// mStyle(d,{bg:'#eee',border:`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
		// mStyle(d,{bg:'#eee',border:`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
	}

	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: valf(styles.h, Config.ui.card.h), ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}



