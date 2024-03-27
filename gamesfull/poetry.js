function poetry() {
	function state_info(dParent) { return; }//dParent.innerHTML = `stage: ${Z.stage}`; }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		let starter = fen.starter = fen.plorder[0];
		Sayings = shuffle(Sayings);
		fen.index = 0;
		fen.saying = Sayings[fen.index];

		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['one', 'write', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() {
		let winners = [];
		for (const plname of Z.plorder) {
			let cond = get_player_score(plname) >= Z.options.winning_score;
			if (cond) { winners.push(plname); }
		}
		if (!isEmpty(winners)) Z.fen.winners = winners;
		return isEmpty(winners)?false:Z.fen.winners;
	}
	function post_collect() { agmove_resolve(); } //console.log('YEAH!!!! post_collect',Z); ag_post_collect(); }
	return { post_collect, state_info, setup, present: poetry_present, check_gameover, activate_ui: poetry_activate };
}
function poetry_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);
	poetry_stats(dt);
	mLinebreak(dt, 10);
}
function poetry_activate() {
	let [pldata, stage, A, fen, phase, uplayer] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	//stages: write, select, round
	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = donelist.length == Z.plorder.length;
	let resolvable = uplayer == fen.starter && complete;
	//console.log('donelist',donelist.length
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	console.log(uplayer, stage, 'done', donelist, 'complete', complete, 'waiting', waiting);

	Z.isWaiting = false;
	if (waiting) {
		//either results are not all in or am NOT the starter (=admin)
		mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') take_turn_waiting();

		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'write' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let start = fen.saying.start.toLowerCase();
		let sentences = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let text = start + ' ' + pldata.state.text;
			sentences.push({ plname: plname, text: text.toLowerCase() });
		}
		sentences.push({ plname: '', text: start + ' ' + fen.saying.end.toLowerCase() });
		fen.sentences = shuffle(sentences);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'select';
		take_turn_fen_clear();

	} else if (stage == 'write') {
		let d = mCreate('form');
		let dt = dTable;
		mAppend(dt, d);
		d.autocomplete = "off";
		d.action = "javascript:void(0);";
		mDiv(d, { fz: 20 }, 'dForm', fen.saying.start.toLowerCase() + '...');
		Z.form = d;
		mLinebreak(d, 10);
		mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
		d.onsubmit = poetry_submit_text;
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			//console.log('selected',selected, typeof selected);
			if (isEmpty(selected)) { //} || selected === null || !selected || nundef(selected)){ // nundef(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				//console.log('selecting', selecting, 'selected', selected ?? 'null')
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };

		}
		delete fen.sentences;
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (stage == 'select') {
		let d = mDiv(dTable, {});
		let i = 1;
		for (const s of fen.sentences) {
			let d1 = mDiv(d, { fz: 20, hline: 30 }, `dsent_${s.plname}`, '' + (i++) + ') ' + s.text, 'hop1');
			d1.onclick = poetry_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		delete fen.result;
		Z.turn = jsCopy(Z.plorder);
		fen.index++;
		fen.saying = Sayings[fen.index];
		Z.stage = 'write';
		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {});
		for (const plname in fen.result) {
			let o = fen.result[plname];
			let d1 = mDiv(d, { fz: 20, hline: 30 }, null, `${plname} selected ${o.plname}: ${o.text}`);
		}
		mLinebreak(dTable, 12)
		mButton('WEITER', poetry_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
	}else{
		console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}
function poetry_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
}
function poetry_select_sentence(ev) {
	if (!uiActivated) return;
	let text = ev.target.innerHTML;
	let plname = stringAfter(ev.target.id, 'dsent_')
	//console.log('player', Z.uplayer, 'prefers', text, '(' + plname + ')');

	Z.state = { plname: plname, text: text };
	take_turn_multi();

}
function poetry_submit_text(ev) { ev.preventDefault(); let text = mBy('i_end').value; Z.state = { text: text }; take_turn_multi(); }
function poetry_stats(d) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}

