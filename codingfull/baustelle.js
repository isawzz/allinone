


//#region css closure gen NEW
function cssKeysNeeded(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let allkeys = [], newlines = []; //in newlines
	let di = {};
	for (const line of lines) {
		if (cssIsKeywordLine(line)) {
			let newline = line.startsWith('@') ? stringAfter(line, ' ') : line.startsWith(':') ? stringAfter(line, ':') : line;
			//let words = 
			//let sep = line.includes('{')?'{':',';
			//let word = stringBefore(newline,sep).trim(); console.log('word',word)
			//let word = firstWordIncluding(newline, '_-');
			let word = firstWordIncluding(newline, '_-: ').trim();
			//if (line.includes(':')) console.log('line', line, '=', word);
			newline = word + stringAfter(newline, word);
			addIf(allkeys, word);
			newlines.push(newline)
			let ch = line[0];
			let type = isLetter(ch) ? 't' : ch == '.' ? 'c' : ch == '@' ? 'k' : ch == ':' ? 'r' : 'i';
			di[word] = { type: type, key: word }
		} else {
			newlines.push(line);
			//console.log('line[0]',line[0]==' '?'SPACE':line[0])
		}
	}
	let neededkeys = [];
	for (const k of allkeys) {
		if (['rubberBand'].includes(k)) continue;
		let ktest = k.includes(' ') ? stringBefore(k, ' ') : k.includes(':') ? stringBefore(k, ':') : k;
		if (['root'].some(x => x == k)) addIf(neededkeys, k);
		else if (code.includes(`${ktest}`) || code.includes(`'${ktest}'`) || code.includes(`"${ktest}"`)) addIf(neededkeys, k);
		else if (html.includes(`${ktest}`)) addIf(neededkeys, k);
	}
	//console.log('allkeys', allkeys); console.log('needed', neededkeys);
	//linestartsTest(newlines)
	return [di, neededkeys, newlines];
}
function cssNormalize(tcss, code, html) {

	[di, neededkeys, newlines] = cssKeysNeeded(tcss, code, html);
	console.log('needed', sortCaseInsensitive(neededkeys))

	let clause = '';
	let state = 'search_kw'; // search_kw search_clause_start search_clause_end
	for (const kw of neededkeys) {
		//if (kw == 'pulse') console.log('kw', kw, di[kw].type)
		let i = 0;
		for (const line of newlines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			//if (line[0]==' ') console.log('SPC')
			//if (stringBefore(line,' ') == kw) { //.startsWith(kw)) {
			if (line.startsWith(kw) && firstWordIncluding(line, '_-: ').trim() == kw) { //firstWordIncluding(line, '_- ').trim() == kw)	{
				//look for start of corresponding clause!
				assertion(line.includes('{') || line.includes(','), `WEIRED LINE: ${line}`)
				if (line.includes('{')) {
					clause = '{\n'; state = 'search_clause_end';
				} else if (line.includes(',')) {
					state = 'search_clause_start';
				}
			} else if (state == 'search_clause_start' && line.includes('{')) {
				clause = '{\n'; state = 'search_clause_end';
			} else if (state == 'search_clause_end') {
				if (line[0] == '}') {
					//if (kw == 'pulse') console.log('i', i++, line)
					clause += line;
					//clause can be added for kw
					let cleanclause = cssCleanupClause(clause, kw);
					lookupAddIfToList(di, [kw, 'clauses'], cleanclause);
					lookupAddIfToList(di, [kw, 'fullclauses'], clause);
					state = 'search_kw';
				} else {
					clause += line + '\n';
				}
			}
		}
	}

	//return;
	//console.log('di', di)
	//sort kw by type and name
	let dis = {};
	for (const o of get_values(di)) {
		if (nundef(o.clauses)) continue;
		//console.log('o', o)
		let x = lookup(dis, [o.type, o.key]); if (x) console.log('DUPL:', o.key, o.type)
		lookupSet(dis, [o.type, o.key], o);
	}

	let text = '';
	for (const type in dis) {
		//console.log('type', type)
		let ksorted = sortCaseInsensitive(get_keys(dis[type]));
		//console.log('keys', ksorted)
		//let type = isLetter(ch) ? 't' : ch=='.'?'c':ch=='@'?'k':'i'
		let prefix = type == 't' ? '' : type == 'k' ? '@keyframes ' : type == 'c' ? '.' : type == 'r' ? ':' : '#';

		for (const kw of ksorted) {
			//if (kw.startsWith('pulse')) console.log(':',kw,type,prefix)
			let startfix = prefix + kw;
			//console.log('clauses',type,kw,dis[type][kw].clauses.length)
			for (const clause of dis[type][kw].clauses) {
				text += startfix + clause;
			}
		}
	}


	//console.log(dis.id.sidebar)
	//AU.ta.value = text;
	return text;
}
function cssCleanupClause(t, kw) {
	let lines = t.split('\n');
	let comment = false;

	let state='copy';

	let res = '';
	for (const line of lines) {
		let lt = line.trim();
		let [cstart,cend,mstart] = [lt.startsWith('/*'),lt.endsWith('*/'),line.includes('/*')];
		//console.log('___line',line,'\n..state',state,'start',cstart,'end',cend,'mid',mstart)
		if (state=='skip'){
			if (cend) state='copy';
			continue;
		}else if (state == 'copy'){
			if (cstart && cend) {continue;}
			else if (cstart) {state = 'skip';continue;}
			else if (mstart) {
				//copy up to /* and set skip
				res+= stringBefore(line,'/*')+'\n'; 
				if (!cend) state = 'skip';
			}else{
				res += line + '\n';		
			}
		}
		//console.log('...state:',state)
	}
	if (kw == 'bAdd') console.log(res);
	return res;
}

//#endregion

//#region belinda bundle and closure gen
function belinda_get_games() {
	return [
		'gSpotit',
		'gColoku',
		'gMaze',
		'gSteps',
		'gSentence',
		'gTouchColors',
		'gSayPic',
		'gReversi',
		'gMissingLetter',
		'gNamit',
		'gTouchPic',
		'gHouse',
		'gWritePic',
		'gChess',
		'gPremem',
		'gMem',
		'gSwap',
		'gTTT',
		'gElim',
		'gAnagram',
		'gCats',
		'gAbacus',
		'gRiddle',
		'gC4',
	];
}
function belinda_get_imports() {
	return `
	<script src="../belindafull/js/globals.js"></script>
	<script src="../belindafull/js/base.js"></script>
	<script src="../belindafull/js/areas.js"></script>
	<script src="../belindafull/js/audio.js"></script>
	<script src="../belindafull/js/badges.js"></script>
	<script src="../belindafull/js/banner.js"></script>
	<script src="../belindafull/js/board.js"></script>
	<script src="../belindafull/js/cards.js"></script>
	<script src="../belindafull/js/chess.js"></script>
	<script src="../belindafull/js/markers.js"></script>
	<script src="../belindafull/js/menu.js"></script>
	<script src="../belindafull/js/mGraph.js"></script>
	<script src="../belindafull/js/speech.js"></script>
	<script src="../belindafull/js/settings.js"></script>
	<script src="../belindafull/js/test_ui_helpers.js"></script>
	<script src="../belindafull/js/time.js"></script>
	<script src="../belindafull/js/maze.js"></script>
	<script src="../belindafull/js/ai.js"></script>
	<script src="../belindafull/js/all.js"></script>
	<script src="../belindafull/js/classes.js"></script>
	<script src="../belindafull/js/debug.js"></script>
	<script src="../belindafull/js/controller.js"></script>
	<script src="../belindafull/js/classes3.js"></script>
	<script src="../belindafull/js/controller3.js"></script>
	<script src="../belindafull/js/game.js"></script>
	<script src="../belindafull/js/house.js"></script>
	<script src="../belindafull/js/item.js"></script>
	<script src="../belindafull/js/keys.js"></script>
	<script src="../belindafull/js/legacy.js"></script>
	<script src="../belindafull/js/letter.js"></script>
	<script src="../belindafull/js/math.js"></script>
	<script src="../belindafull/js/onClick.js"></script>
	<script src="../belindafull/js/scoring.js"></script>
	<script src="../belindafull/js/testing.js"></script>
	<script src="../belindafull/js/ui.js"></script>
	<script src="../belindafull/js/user.js"></script>
	<script src="../belindafull/js/work.js"></script>
	<script src="../belindafull/js/workUI.js"></script>
	`
}
async function belinda_get_index_html() {
	return await route_path_text('../belindafull/html/index.html');
}
async function belinda_closure() {
	let indexhtml = DA.indexhtml = await belinda_get_index_html();
	let [di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	if (!di) {
		await belinda_bundle();
		[di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	}
	//console.log('di', di)

	//all die onclick dinsplit('onclick=").shift()ger dazu
	let symlist = ['start'];
	let onclicks = DA.indexhtml.split('onclick="'); //.shift();
	onclicks.shift();
	console.log('onclicks', onclicks);
	for (const oncl of onclicks) {
		console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}
	for(const cl of belinda_get_games()){
		symlist.push(capitalize(cl));
	}
	symlist = symlist.concat(['csv2list','ControllerSolitaireMinimal'])

	//console.log('belindafull sym list',symlist); 

	let done = minimizeCode(di, klist, symlist);
	//console.log('done', done); //return;

	let newklist = klist.filter(x => isdef(done[x]))
	lookupSetOverride(DA, ['closure', 'di'], done, newklist)
	lookupSetOverride(DA, ['closure', 'klist'],);

	assemble_complete_code(newklist, done);

	//write_new_index_html(DA.dirout, 'closure');

}
async function belinda_bundle() {
	let files = belinda_get_imports().split('src="');
	files = files.map(x => stringBefore(x, '"'));
	files.shift(); //console.log(files); return;
	files.push('../belindafull/start.js');
	let dirout = 'belinda';
	let byKey = {}, ckeys = [], idx = 0;
	let text = '';
	for (const f of files) {
		let [filetext, idxnew] = await belinda_parsefile(f, byKey, ckeys, idx);
		idx = idxnew;
		text += filetext;
	}
	//assemble text!!!

	assemble_complete_code(ckeys, byKey);

	lookupSetOverride(DA, ['bundle', 'di'], byKey)
	lookupSetOverride(DA, ['bundle', 'klist'], ckeys)

	//write_new_index_html(dirout);
	//DA.codedir = dir;
	DA.dirout = dirout;
}
async function belinda_parsefile(f, byKey, ckeys, idx) {
	let chunk = '', error = '', state, kw = null, blocktype = null, region = null;
	//let linestarts = [];
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let text = `//#region ${fname}\n`;
	let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

	for (const line of lines) {
		let [w, type] = getLineStart(line);	//console.log('linestart', w, type);
		if (type == 'WTF') {
			//if (fname == 'test_ui_helpers') console.log('WTF',w,'\n..',line,w); 
			if (kw == 'uiGetContact') console.log('WTF', w, '\n..', line, w);
			if (w == 'SPACE') chunk += line + '\n';
			continue;
		}
		else if (type == 'empty') {
			// if (fname == 'test_ui_helpers') console.log('empty', w, '\n..', line, w);
			// if (kw == 'uiGetContact') console.log('empty', w, '\n..', line, w);
			continue;
		}
		else if (type == 'in_process') {

			if (line.includes('//#region') || line.includes('//#endregion')) continue;
			if (kw) { chunk += line + '\n'; } else error += line + '\n';
		}
		else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
		else if (type == 'block') {
			if (kw) {
				//close previous block!
				let prev = lookup(byKey, [kw]);
				let oldfname = prev ? prev.fname : fname;
				let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
				// if (o.type == 'async') {o.type = 'function';console.log('async',kw)}
				if (prev) {
					if (prev.type != o.type) {
						console.log('DUPLICATE', kw, prev);
						console.log('... change from', prev.type, 'to', o.type);
					}
					//loesche den alten!
					//ckeys[prev.idx] = null;
				} else { ckeys.push(kw); }
				//lookupSetOverride(di, [blocktype, region, kw], o);
				lookupSetOverride(byKey, [kw], o);


			}
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			let blocktypes = { function: 'func', class: 'cla', async: 'func', var: 'var', const: 'const' };
			blocktype = blocktypes[w]; //w == 'async' ? 'function' : w; //hier async turns into function!!!
			chunk = line + '\n';
			//console.log('?',blocktype,kw,line);
			//console.log('kw',kw);
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) {
		//close previous block!
		let prev = lookup(byKey, [kw]);
		let oldfname = prev ? prev.fname : fname;
		let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
		if (prev) {
			//console.log('DUPLICATE', kw);
			if (prev.type != o.type) {
				console.log('... change from', prev.type, 'to', o.type);
			}
			//loesche den alten!
			//ckeys[prev.idx] = null;
		} else { ckeys.push(kw); }
		lookupSetOverride(byKey, [kw], o);


	}
	text += `//#endregion ${fname}\n\n`;
	return [text, idx];
}
//#endregion

//#region closure generation
function minimizeCode(di, klist, symlist = ['start']) {
	let done = {};
	let tbd = symlist; console.log('symlist', symlist)
	let MAX = 1000000, i = 0;
	let visited = { grid: true, jQuery: true, config: true, Number: true, sat: true, hallo: true, autocomplete: true, PI: true };
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; //else console.log('i',i)
		let sym = tbd[0]; //console.log('sym', sym);
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = di[sym];
		//if (nundef(o)) { console.log('not def', sym); tbd.shift(); continue; }
		if (nundef(o)) { tbd.shift(); continue; } //console.log('not def',sym);
		let text = o.code; //always using last function body!!!
		let words = toWords(text, true);
		for (const w of words) { if (nundef(done[w]) && nundef(visited[w]) && w != sym && isdef(di[w])) addIf(tbd, w); }
		assertion(sym == tbd[0], 'W T F')
		tbd.shift();
		done[sym] = o;
	}
	//console.log('done',done);
	//==>assertion(isdef(done.SOCKETSERVER),'no SOCK.......')
	return done;
}
async function onclickClosure() {
	let [di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	if (!di) {
		await onclickBundle();
		[di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	}
	//console.log('di', di)

	//all die onclick dinsplit('onclick=").shift()ger dazu
	let symlist = ['start'];
	let onclicks = DA.indexhtml.split('onclick="'); //.shift();
	onclicks.shift();
	console.log('onclicks',onclicks);
	for (const oncl of onclicks) {
		console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}

	let done = minimizeCode(di, klist, symlist);
	console.log('done', done)

	let newklist = klist.filter(x => isdef(done[x]))
	lookupSetOverride(DA, ['closure', 'di'], done, newklist)
	lookupSetOverride(DA, ['closure', 'klist'],);

	assemble_complete_code(newklist, done);

	write_new_index_html(DA.dirout, 'closure');

}

//#endregion

//#region bundle generation
function mClosureUI(dParent) {
	let d = mDiv(dParent, { gap: 10 }); mFlexWrap(d);
	let d1 = mDiv(d);
	mDiv(d1, {}, null, 'project')
	mDiv(d1, {}, null, '<input type="text" id="inp_project" value="gamesfull"/>')
	let d2 = mDiv(d);
	mDiv(d2, {}, null, 'seed')
	mDiv(d2, {}, null, '<input type="text" id="inp_seed" value="start"/>')
	let d3 = mDiv(d);
	mDiv(d3, {}, null, 'output')
	mDiv(d3, {}, null, '<input type="text" id="inp_dirout" value="games"/>')

	let d4 = mDiv(dParent, { gap: 12 }); mFlexWrap(d4);
	mButton('bundle', onclickBundle, d4);
	mButton('closure', onclickClosure, d4);
	mButton('belinda bundle', belinda_bundle, d4);
	mButton('belinda closure', belinda_closure, d4);
}
function getLineStart(line) {

	if (isEmpty(line.trim())) { return ['', 'empty'] }

	let type = 'in_process';
	let w = stringBefore(line, ' ');
	let ch = line[0];
	let i = 0; while (line[i] == '\t') { i++; }
	let fw = line.slice(i);
	if (line.startsWith('//#region')) { w = 'REGION'; type = 'REGION' }
	else if (line.startsWith('//#endregion')) { w = 'ENDREGION'; type = 'REGION' }
	else if (line.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (isdef(fw) && fw.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (ch == '\t') { w = 'TAB'; }
	else if (ch == '}' || ch == '{') { w = 'BRACKET' }
	else if (nundef(ch)) { w = 'UNDEFINED'; type = 'WTF' }
	else if (ch == ' ') { w = 'SPACE'; type = 'WTF' }
	else if (ch == '\r') { type = 'WTF' }
	else if (nundef(fw)) { w = fw; type = 'WTF' }

	if (['async', 'class', 'const', 'function', 'var'].includes(w)) type = 'block';
	else if (isLetter(ch)) type = 'WTF';

	return [w, type];
}
async function get_dir_files_seed() {

	//first go to project dir and load all js files
	let dir = '../' + mBy('inp_project').value;
	let list = mBy('inp_seed').value.split(' ');

	//console.log('dir', dir, 'list', list)

	//hol mir erstmal das index file
	let textIndex = DA.indexhtml = await route_path_text(dir + '/index.html');
	let arr = textIndex.split('script src="');
	arr.shift();
	let files = arr.map(x => stringBefore(x, '"'));


	files = files.filter(x => !x.includes('alibs'));
	//console.log('files', files)
	let dirout = mBy('inp_dirout').value;
	return [dir, files, list, dirout];
}
async function __parsefile(f, byKey, ckeys, idx) {
	let chunk = '', error = '', state, kw = null, blocktype = null, region = null;
	//let linestarts = [];
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let text = `//#region ${fname}\n`;
	let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

	for (const line of lines) {
		let [w, type] = getLineStart(line);	//console.log('linestart', w, type);
		if (type == 'WTF') { continue; } //console.log('linestart', w, type); 
		else if (type == 'empty') { continue; }
		else if (type == 'in_process') {

			if (line.includes('//#region') || line.includes('//#endregion')) continue;
			if (kw) { chunk += line + '\n'; } else error += line + '\n';
		}
		else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
		else if (type == 'block') {
			if (kw) {
				//close previous block!
				let prev = lookup(byKey, [kw]);
				let oldfname = prev ? prev.fname : fname;
				let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
				// if (o.type == 'async') {o.type = 'function';console.log('async',kw)}
				if (prev) {
					if (prev.type != o.type) {
						console.log('DUPLICATE', kw, prev);
						console.log('... change from', prev.type, 'to', o.type);
					}
					//loesche den alten!
					//ckeys[prev.idx] = null;
				} else { ckeys.push(kw); }
				//lookupSetOverride(di, [blocktype, region, kw], o);
				lookupSetOverride(byKey, [kw], o);


			}
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			let blocktypes = { function: 'func', class: 'cla', async: 'func', var: 'var', const: 'const' };
			blocktype = blocktypes[w]; //w == 'async' ? 'function' : w; //hier async turns into function!!!
			chunk = line + '\n';
			//console.log('?',blocktype,kw,line);
			//console.log('kw',kw);
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) {
		//close previous block!
		let prev = lookup(byKey, [kw]);
		let oldfname = prev ? prev.fname : fname;
		let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
		if (prev) {
			//console.log('DUPLICATE', kw);
			if (prev.type != o.type) {
				console.log('... change from', prev.type, 'to', o.type);
			}
			//loesche den alten!
			//ckeys[prev.idx] = null;
		} else { ckeys.push(kw); }
		lookupSetOverride(byKey, [kw], o);


	}
	text += `//#endregion ${fname}\n\n`;
	return [text, idx];
}
async function onclickBundle() {
	let [dir, files, seed, dirout] = await get_dir_files_seed();
	let byKey = {}, ckeys = [], idx = 0;
	//console.log(files)
	let text = '';
	for (const f of files) {
		let [filetext, idxnew] = await __parsefile(f, byKey, ckeys, idx);
		idx = idxnew;
		text += filetext;
	}
	//assemble text!!!
	assemble_complete_code(ckeys, byKey);

	lookupSetOverride(DA, ['bundle', 'di'], byKey)
	lookupSetOverride(DA, ['bundle', 'klist'], ckeys)

	write_new_index_html(dirout);
	DA.codedir = dir;
	DA.dirout = dirout;
}
function assemble_code_sorted(list, di, preserveRegions=false) {
	//console.log('...',list[0],di[list[0]]);//var list problem!!!!!
	let text = ''

	let byFT = {},fnames=[];
	for (const k of list) {
		let o = di[k];
		lookupAddIfToList(byFT, [preserveRegions?o.region:o.fname, o.type], k);
		addIf(fnames,o.fname);
	}

	for(const fname of fnames){
		text +=  `//#region ${fname}\n`;
		for (const t of ['const', 'var', 'cla', 'func']) {
			let keys = byFT[fname][t];
			if (nundef(keys)) continue;
			if (t == 'func') keys = sortCaseInsensitive(keys);
			for (const k of keys) {
				if (!k || nundef(di[k])) continue;
				let o = di[k];
				text += o.code;
			}
		}
		text += `//#endregion ${fname}\n\n`;
	}
	return text;
}
function assemble_code_orig(list, di) {
	//console.log('...',list[0],di[list[0]]);//var list problem!!!!!
	let region = null, fname = di[list[0]].fname;
	let text = `//#region ${fname}\n`;

	for (const k of list) {
		if (!k || nundef(di[k])) continue;
		let o = di[k];
		//console.log('o.type',o.type)

		//if (o.key == 'verify_min_req') console.log('verify_min_req', o)

		if (fname != o.fname) {
			text += `//#endregion ${fname}\n\n//#region ${o.fname}\n`;
			fname = o.fname;
		}
		text += o.code;

	}
	text += `//#endregion\n\n`;
	return text;
}
function assemble_complete_code(list, di, sort_functions = true) {
	CODE.byKey = di;
	CODE.keylist = list;

	text = sort_functions ? assemble_code_sorted(list, di) : assemble_code_orig(list, di);

	downloadAsText(text, 'bundle', 'js');
	lookupSetOverride(DA, ['bundle', 'text'], text)

	AU.ta.value = text;
}
function write_new_index_html(dir, filename = 'bundle') {
	//let project = stringAfterLast(dir,'/');	console.log('project',project)
	let text = DA.indexhtml;


	let scripts = `</body><script src="../${dir}/${filename}.js"></script><script>onload = start;</script>\n</html>`;
	let newtext = stringBefore(text, `</body>`) + scripts;

	//downloadAsText(newtext,`index`,'html')
}
//#endregion bundle generation

//#region css closure generation
function firstWordIncluding(s, allowed = '_-') {
	let res = '', i = 0;
	while (!isLetter(s[i]) && !isDigit(s[i]) && !allowed.includes(s[i])) i++;
	while (isLetter(s[i]) || isDigit(s[i]) || allowed.includes(s[i])) { res += s[i]; i++; }
	return res;
}
async function prettyCss(cssfile, codefile, htmlfile) {
	let tcss = await route_path_text(cssfile);
	let code = await route_path_text(codefile);
	let html = await route_path_text(htmlfile);

	let [diclasses, outputclasses] = parse_css_classes(tcss, code, html);
	let [dikeyframes, outputkeyframes] = parse_css_keyframes(tcss, code, html);
	let [diids, outputids] = parse_css_ids(tcss, code, html);
	let [ditags, outputtags] = parse_css_tags(tcss, code, html);

	// let res = outputtags;
	//let res = outputkeyframes; 
	let res = outputtags + '\n' + outputids + '\n' + outputkeyframes + '\n' + outputclasses;

	AU.ta.value = res;

}

async function games_css_closure() {
	let tcss = await route_path_text('../games/basemin.css');
	let code = await route_path_text('../games/bundle.js');
	let html = await route_path_text('../games/index.html');

	let [diclasses, outputclasses] = parse_css_classes(tcss, code, html);
	let [dikeyframes, outputkeyframes] = parse_css_keyframes(tcss, code, html);
	let [diids, outputids] = parse_css_ids(tcss, code, html);
	let [ditags, outputtags] = parse_css_tags(tcss, code, html);

	// let res = outputtags;
	//let res = outputkeyframes; 
	let res = outputtags + '\n' + outputids + '\n' + outputkeyframes + '\n' + outputclasses;

	AU.ta.value = res;

}
function cssIsKeywordLine(line) { return line.startsWith(':') || line.startsWith('.') || line.startsWith('#') || line.startsWith('@keyframes') || isLetter(line[0]); }
function parse_css_keywords(lines) {
	let have_primary = false;
	let di = {};
	for (const line of lines) {
		if (cssIsKeywordLine(line)) {
			let word = firstWordIncluding(line, ['_', '-']);
			lookupAddIfToList(di, [have_primary ? 'sec' : 'prim'], word);
			have_primary = true;
			// console.log('word', word);
		} else {
			have_primary = false;
		}
	}
	return di;
}
function parse_css_classes(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) {
		if (line.startsWith('.')) {
			let word = firstWordIncluding(line, ['_', '-']);
			// console.log('word', word);
			lookupAddIfToList(di, ['classes'], word);
		}
	}
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', sortCaseInsensitive(di.classes));
	console.log('included_classes', sortCaseInsensitive(included_classes));
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith('.' + cname)) {
				assertion(parsing == false, 'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')) {
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) {
				comment = false; continue;
			} else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else {
					chunk += line + '\n';
				}
			} else {
				assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line);
			}
		}
	}
	let output = css_complete_text(dicode);
	return [dicode, output];
}
function parse_css_ids(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) { if (line.startsWith('#')) { let word = firstWordIncluding(line, ['_', '-']); lookupAddIfToList(di, ['classes'], word); } }
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', di.classes);
	console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) {
		for (const line of lines) {
			let lt = line.trim();
			if (line.startsWith('#' + cname)) {
				assertion(parsing == false, 'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')) {
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) {
				comment = false; continue;
			} else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else {
					chunk += line + '\n';
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	return [dicode, output];
}
function parse_css_keyframes(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) {
		if (line.startsWith('@keyframes')) {
			let word = firstWordIncluding(stringAfter(line, 'keyframes'), ['_', '-']);
			console.log('=====word', word);
			lookupAddIfToList(di, ['classes'], word);
		}
	}
	if (isEmpty(di)) return [];
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', di.classes);
	console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith('@keyframes ' + cname)) {
				assertion(parsing == false, 'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')) {
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) {
				comment = false; continue;
			} else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else {
					chunk += line + '\n';
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	return [dicode, output];
}
function parse_css_tags(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) { if (isLetter(line[0])) { let word = firstWordIncluding(line, []); lookupAddIfToList(di, ['classes'], word); } }
	let included_classes = di.classes; console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith(cname)) {
				assertion(parsing == false, 'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')) {
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) {
				comment = false; continue;
			} else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else {
					chunk += line + '\n';
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	return [dicode, output];
}
function css_complete_text(dicode) {
	let output = '';
	let keylist = sortCaseInsensitive(get_keys(dicode));
	for (const k of keylist) { for (const c of dicode[k]) { output += c; } }
	return output;
}

//#endregion

function addDummy(dParent) {
	let dummy = mCreate('button');
	mAppend(dParent, dummy);
	mStyle(dummy, { position: 'absolute', opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
	dummy.id = 'dummy';

}
function compute_closure(code) {
	if (nundef(code)) code = AU.ta.value;
	let disub = CODE.closure = computeClosure();
	let keylist = [];
	for (const type of ['const', 'var', 'cla', 'func']) {
		//let klist = sortCaseInsensitive(get_keys(disub[type]));
		if (nundef(disub[type])) continue;
		let knownkeys = CODE.keysSorted.filter(x => lookup(disub, [type, x]));
		let extras = sortCaseInsensitive(get_keys(disub[type]).filter(x => !knownkeys.includes(x)));
		keylist = keylist.concat(knownkeys).concat(extras);
	}

	//console.log(keylist.includes('write_code_text_file'));
	console.log('duplicates',hasDuplicates(keylist))
	write_code_text_file(keylist);
}
function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let done = {};
	let tbd = valf(symlist, ['start']);
	let MAX = 1000000, i = 0;
	let visited = { grid: true, jQuery: true, config: true, Number: true, sat: true, hallo: true, autocomplete: true, PI: true };
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; //else console.log('i',i)
		let sym = tbd[0];
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) { tbd.shift(); continue; }
		if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
		if (o.type == 'var' || o.type == 'const') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		assertion(['cla', 'func'].includes(o.type), 'TYPE ERRROR!!!!!!!!!!!!!!!!!!!!!!!!!')

		//at this point *** sym is a func or class!!! ***
		let olive = valf(window[sym], o.code);
		//if (sym == 'write_code_text_file') console.log('still here')
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		//if (sym == 'write_code_text_file') console.log('still here')

		let text = olive.toString(); //always using last function body!!!
		let words = toWords(text, true);

		if (words.includes('in' + 'it')) console.log('sym', sym)
		//if (words.includes('gr'+'id')) console.log('sym',sym)
		//words = words.filter(x => text.includes(' ' + x) || text.includes(x + '(')  || text.includes(x + ','));
		//console.log('words',words)
		//if (sym == 'compute_closure') console.log('', sym, words)

		for (const w of words) { if (nundef(done[w]) || nundef(visited[w]) && w != sym && isCodeWord(w)) addIf(tbd, w); }
		tbd.shift();

		//if (sym == 'write_code_text_file') console.log('still here',o.code)
		//done[sym] = o; //
		lookupSet(done, [o.type, sym], o);
	}

	//console.log('done',done);
	return done;
}
function create_left_side_extended() {
	let dl = dLeft;
	mClear(dLeft);
	let [dt, dse, dsb, dft, dfta] = [mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl)];

	for (const d of [dt, dse, dsb, dft, dfta]) mStyle(d, { padding: 4, hmin: 10 })

	//hier kommt die neue ui!
	//mClosureUI(dt)


	mSearchGoLive('keywords', mySearch, dse, { hmargin: 6 }, { selectOnClick: true });

	let dm = mDom(dft, {}, { html: 'Edit Code:' });
	mButton('closure', compute_closure, dm)
	let r = getRect(dm);

	//console.log(r.y + r.h);
	//let h = `calc( 100vh - ${r.y + r.h} )`;
	h = window.innerHeight - (r.y + r.h + 4); mStyle(dfta, { h: h, box: true, padding: 4 });
	AU.ta = mDom(dfta, { fz: 18, family: 'consolas', w100: true, box: true, h: '99%', bg: 'white', fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });


}
function execute_on_control_enter(ev) {
	if (ev.ctrlKey && ev.key == 'Enter') {
		console.log('!!!')
		x = runcode(mBy('ta').value)
		//console.log('TEST!', x)
	}
}
function extractKeywords(text) {
	let words = toWords(text, true); //console.log('words', words);
	//words = words.filter(x=>text.includes(' '+x));
	let res = [];
	for (const w of words) { if (isdef(CODE.all[w])) addIf(res, w); }
	return res;
}
function getLiveKeys(list){
	return list.filter(x=>isLiveInBrowser(x));
}
function getObjectFromWindow(key) {
	let code, sig, type;
	let f = window[key];

	if (isdef(f)) {
		type = typeof f;
		if (type != 'function') return null; else type = 'func';
		// } else if (['async', 'function', 'await'].includes(key)) {
		// 	return null;
	} else {
		//console.log('key', key)
		try {
			f = eval(key);
			if (typeof (f) == 'function') type = 'cla'; else return null;
		} catch { return null; }
	}
	// if (isdef(f)) console.log('key', key, 'type', typeof f); //, isdef(f)?f.toString():'_',typeof f)
	// if (typeof f != 'function') return null;
	code = f.toString();
	//if (type == 'cla') console.log('code', code)
	sig = type == 'func' ? getFunctionSignature(stringBefore(code, '\n'), key) : `class ${key}{}`;
	// type = 'func';
	let o = { name: key, code: code, sig: sig, region: type, filename: '', path: '', type: type };
	CODE.justcode[key] = code;
	CODE.all[key] = CODE.di[type][key] = o;
	return o;
}
function hasDuplicates(list){
	let res=[];
	for(let i=0;i<list.length;i++){
		for(let j=i+1;j<list.length;j++){
			if (list[i]==list[j]){res.push(list[i])}
		}
	}
	return res.length>0?res:false;
}
function isCodeWord(w) {
	return isdef(window[w]) || isdef(CODE.all[w])
}
function isLiveInBrowser(s){
	if (isdef(window[s])) return true;
	try{
		//console.log('have to eval!!!',s)
		let res=eval(s);
		return isdef(res);
	}catch{
		return false;
	}
	return false;
}
async function load_Codebase(dir, path_allcode) {
	let path_js = isdef(path_allcode) ? path_allcode : '../coding/cb/cb2/allcode.js';
	dir = isdef(dir) ? dir : '../coding/cb';

	//#region keysSorted: WOZU BRAUCH ICH keysSorted???????? fuerr die closure!!!!!!!!!!!!!!!
	let text = CODE.text = await route_path_text(path_js);
	let keysSorted = [];
	let lines = text.split('\r\n');
	for (const l of lines) {
		if (['var', 'const', 'cla', 'func'].some(x => l.startsWith(x))) {
			let key = firstWordAfter(l, ' ', true);
			keysSorted.push(key);
		}
	}
	CODE.keysSorted = keysSorted;
	//console.log('keysSorted',keysSorted);
	//#endregion

	CODE.di = await route_path_yaml_dict(dir + '/z_all.yaml');
	CODE.justcode = await route_path_yaml_dict(dir + '/z_allcode.yaml');
	CODE.codelist = dict2list(CODE.justcode, 'key');
	CODE.history = await route_path_yaml_dict(dir + '/z_allhistory.yaml');
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys);
	//let inter = intersection(Object.keys(keys), Object.keys(window));
	//console.log('intersection',inter);
	//7748 in intersection, also ca 400 jeweils extra, ergibt total of 8500 keys ca.
}
function loadCodebase(o,callback) {
	o = JSON.stringify(valf(o,{}));
	var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loadCodebaseResult(xml.responseText,callback);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);

}
function loadCodebaseResult(result,callback) {
	let obj = JSON.parse(result);
	//console.log('result',result);
	DA.all = jsyaml.load(obj.all);
	DA.allcode = jsyaml.load(obj.allcode);
	DA.allhistory = jsyaml.load(obj.allhistory);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();

	CODE.di = DA.all;
	CODE.justcode = DA.allcode;
	CODE.codelist = dict2list(CODE.justcode, 'key');
	CODE.history = DA.allhistory;
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	CODE.keysSorted = CODE.keylist;

	console.log('LOADED CODEBASE!')
	if (isdef(callback))	callback();

}
function lookupToggle(o, list) {
	let x = lookup(o, list);
	let val = !x;
	lookupSetOverride(o, list, val);
	return val;
}
function mButton(caption, handler, dParent, styles = {}, opts = {}) {
	addKeys({ bg: '#00000080', hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, styles);
	addKeys({ html: caption, onclick: handler, className: 'hop1' }, opts);
	return mDom(dParent, styles, opts);
}
function mDom(dParent, styles = {}, opts = {}) {
	let tag = valf(opts.tag, 'div');
	let d = document.createElement(tag);
	mAppend(dParent, d);
	if (tag == 'textarea') styles.wrap = 'hard';
	const aliases = {
		classes: 'className',
		inner: 'innerHTML',
		html: 'innerHTML',

	};
	if (opts.editable) {
		d.setAttribute('contentEditable', true);
		mStyle(d, { overflow: 'hidden' })
		mClass(d, 'plain');
		d.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				//if (nundef(mBy('dummy'))) mButton('', null, dTestButtons, { position:'absolute',opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' },{id:'dummy'});
				mBy('dummy').focus();
				// mBy('dummy').focus();
			}
		});
		// d.onkeyup = ev=>{if (ev.key == 'Enter') d.parentNode.focus();}
	}
	if (nundef(opts.onclick) && opts.selectOnClick) {
		if (opts.editable) {
			opts.onclick = ev => selectText(ev.target);
		} else if (tag == 'input' || tag == 'textarea') {
			//if (tag != 'input' && tag != 'textarea') d.setAttribute('contentEditable', true); //opts.contenteditable=true;
			opts.onclick = ev => ev.target.select();
		}
	}

	for (const opt in opts) { d[valf(aliases[opt], opt)] = opts[opt] };
	mStyle(d, styles);
	return d;
}
function mDomRest(dParent, styles, opts) {
	if (nundef(styles.w) && nundef(styles.w100)) addKeys({ wrest: true }, styles);
	if (nundef(styles.h) && nundef(styles.h100)) addKeys({ hrest: true }, styles);
	return mDom(dParent, styles, opts);
}
function mDom100(dParent, styles, opts) {
	if (nundef(styles.w) && nundef(styles.wrest)) addKeys({ w100: true }, styles);
	if (nundef(styles.h) && nundef(styles.hrest)) addKeys({ h100: true }, styles);
	return mDom(dParent, styles, opts);
}
function mGridFrom(d, m, cols, rows, cellstyles = {}) {
	let gta = '';
	let words = [];
	for (const line of m) {
		gta = gta + `'${line}' `;
		let warr = toWords(line);
		//console.log('warr',warr)
		for (const w of warr) if (!words.includes(w)) words.push(w);
		//w.map(x => addIf(words, w));

	}
	//console.log('gta',gta);
	//console.log('words', words);
	let dParent = mDom100(d, { display: 'grid', 'grid-template-areas': gta });
	dParent.style.gridTemplateColumns = cols;
	dParent.style.gridTemplateRows = rows;
	for (const w of words) {
		let st = copyKeys({ 'grid-area': w }, cellstyles);
		let cell = window[w] = mDom(dParent, st, { id: w });//	,html:w.substring(1)})


	}
	//console.log('dParent',dParent); return;
	return dParent;
}
function mInput(dParent, styles = {}, opts = {}) {
	addKeys({ fz: 'inherit', fg: 'inherit', 'flex-grow': 1, bg: '#00000080', hpadding: 10, vpadding: 4, rounding: 8 }, styles);
	addKeys({ id: 'inpSearch', name: 'searchResult', className: 'hop1 plain', type: 'text', tag: 'input' }, opts);
	return mDom(dParent, styles, opts);

}
function mSearch(label, handler, dParent, styles = {}, opts = {}) {
	let html = `
    <form action="javascript:void(0);" autocomplete="off">
		<label>${label}</label>
    </form>
  `;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	mStyle(elem, { display: 'grid', 'align-items': 'center', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto' });
	//mStyle(elem, { display: 'grid', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto' });

	let inp = mInput(elem, styles, opts);

	let myhandler = () => handler(mBy(inp.id).value.trim()); // handler(toWords(mBy(inp.id).value));
	mButton('GO', myhandler, elem);
	elem.onsubmit = myhandler;

	return elem;
}
function mSearchGoLive(label, handler, dParent, styles = {}, opts = {}) {
	let html = `
    <form action="javascript:void(0);" autocomplete="off">
		<label>${label}</label>
    </form>
  `;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	mStyle(elem, { display: 'grid', 'align-items': 'center', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto auto' });
	//mStyle(elem, { display: 'grid', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto' });

	let inp = mInput(elem, styles, opts);

	let allhandler = () => handler(mBy(inp.id).value.trim(),false); // handler(toWords(mBy(inp.id).value));
	mButton('GO', allhandler, elem);
	let livehandler = () => handler(mBy(inp.id).value.trim(),true); // handler(toWords(mBy(inp.id).value));
	mButton('Live', livehandler, elem);
	elem.onsubmit = livehandler;

	return elem;
}
function myOnclickCodeInSidebar(ev) {
	let key = isString(ev) ? ev : ev.target.innerHTML;
	let text = CODE.justcode[key];
	AU.ta.value = text;
	let download = false;
	if (download) downloadAsText(text, 'hallo', 'js');
	return text;
}
function mySearch(kws,onlylive) {
	//kws should be a string
	assertion(isString(kws), 'mySearch: kws should be a string')
	//console.log(`'${kws}'`);
	ohneRegexMix(kws,onlylive); //return;//keyPlusMinus(); return;
}
function ohneRegexMix(s,onlylive=false) {
	// let arr = CODE.codelist;
	//let arr = getLiveKeys(CODE.codelist.map(x=>x.key));
	let arr=onlylive?CODE.codelist.filter(x=>isLiveInBrowser(x.key)):CODE.codelist;
	//console.log('arr',arr)
	//s=`-e +fi`
	let ws = parseSearchString(s);
	let [sno, syes, smay] = [[], [], []];
	for (const w of ws) {
		if (w[0] == '-') sno.push(w.substring(1));
		else if (w[0] == '+') syes.push(w.substring(1));
		else smay.push(w);
	}

	let res = [];
	let opts = lookup(CODE, ['searchOptions', 'case']) == true ? '' : 'i';
	let prop = lookup(CODE, ['searchOptions', 'fulltext']) == true ? 'value' : 'key';
	let prefix = lookup(CODE, ['searchOptions', 'where']); // == true ? 'value' : 'key';

	for (const el of arr) {
		let text = el[prop]; //or x.value
		if (sno.some(x => text.includes(x))) continue;
		if (syes.some(x => !text.includes(x))) continue;
		let patt = smay.join('|');
		if (prefix) patt = '\\b' + patt;
		let regex = new RegExp(patt, opts);
		if (regex.test(text)) res.push(el.key);
		//if (!isEmpty(syes) || smay.some(x => text.includes(x))) res.push(el.key);
	}
	CODE.selectedKeys = res; // arr.filter(x => regex.test(x.key)).map(x => x.key);
	//console.log('res', res.length > 20 ? res.length : res)
	if (!isEmpty(res)) show_sidebar(res, myOnclickCodeInSidebar); //console.log('keys', res);
}
function onclickCase(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'case']);
	let b = ev.target;
	b.innerHTML = val ? 'case-sensitive' : 'insensitive';
}
function onclickCodeInSidebar(ev) {
	let key = isString(ev) ? ev : ev.target.innerHTML;
	let text = CODE.justcode[key];

	let ta = AU.ta; let dParent = null;
	if (nundef(ta)) {
		dParent = valf(dFiddle, dTable, document.body);
		let talist = dParent.getElementsByTagName('textarea');
		if (isEmpty(talist)) ta = mTextarea(null, null, dParent, { w: '100%' });
		else ta = talist[0];
	} else dParent = ta.parentNode;
	ta.value = text;
	let hideal = ta.scrollHeight;
	console.log('ta.scrollheight', hideal)

	//wie gross soll dParent sein? h sowie sidebar
	let hsidebar = window.innerHeight - 128; // getComputedStyle(dSidebar, 'height');
	mStyle(dParent, { hmax: hsidebar });

	let lines = text.split('\n');
	let min = lines.length + 1;

	mStyle(ta, { h: hideal, hmin: 50, hmax: hsidebar - 24 });
	ta.scrollTop = 0;

	let download = false;
	if (download) downloadAsText(text, 'hallo', 'js');
	return text;
}
function onclickFulltext(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'fulltext']);
	let b = ev.target;
	b.innerHTML = val ? 'fulltext' : 'name';
}
function onclickWhere(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'where']);
	let b = ev.target;
	b.innerHTML = val ? 'start' : 'anywhere';
}
function onclickTest(x) {
	x = runcode(mBy('ta').value)
	console.log('TEST!', x)
}
function parseSearchString(s, sAllow = '+-_') { return toWordsX(s, sAllow); }
function rColorTrans(opaPer = 100, lumPer = 70, satPer = 100, hue) {
	if (isList(hue) && hue.length > 2) {
		//interpret as choose one of these hues
		hue = rChoose(hue);
	} else if (isList(hue)) {
		//interpret as range min,max
		hue = Math.random() * (hue[1] - hue[0]) + hue[0];
	} else if (isdef(hue)) {
		//interpret as modulo
		hue = divInt(rHue(), hue) * hue;
	} else hue = Math.round(Math.random() * 360);
	//console.log('hue', hue)
	return hslToHslaString(hue, satPer, lumPer, opaPer / 100);
}
function runcode(code, callback = null) {
	let x = eval(code);
	if (callback) callback(x);
	else {
		console.log('===>result:', x);
		if (isdef(dMessage)) dMessage.innerHTML = isDict(x) ? JSON.stringify(x) : isdef(x) ? x.toString() : x;
	}
}
function selectText(el) {
	var sel, range;
	//var el = document.getElementById(id); //get element id
	if (window.getSelection && document.createRange) { //Browser compatibility
		sel = window.getSelection();
		if (sel.toString() == '') { //no text selection
			window.setTimeout(function () {
				range = document.createRange(); //range object
				range.selectNodeContents(el); //sets Range
				sel.removeAllRanges(); //remove all ranges from selection
				sel.addRange(range);//add Range to a Selection.
			}, 1);
		}
	} else if (document.selection) { //older ie
		sel = document.selection.createRange();
		if (sel.text == '') { //no text selection
			range = document.body.createTextRange();//Creates TextRange object
			range.moveToElementText(el);//sets Range
			range.select(); //make selection.
		}
	}
}
function show_coding_ui() {
	let d = document.body; mClass(d, 'fullpage airport'); //addDummy(d);
	//mStyle(d,{hmax:'100%'})
	let areas = [
		'dTestButtons dTestButtons',
		'dSearch dSidebar',
		'dFiddle dSidebar',
		'dTable dSidebar',
		'dFooter dSidebar',
	];
	let cols = '1fr 240px';
	let rows = 'auto auto 1fr auto auto';

	let [bg, fg] = [rColorTrans(50, 10, 100, [150, 230]), 'contrast']; //console.log('colors:', bg, fg);	//bg='hsla(120,100%,25%,0.3)';
	dPage = mGridFrom(d, areas, cols, rows, { hmax: '96%', padding: 4, box: true, bg: bg, fg: fg });

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });
	let bs = mDiv(elem, { 'grid-column': '1 / span 3', display: 'flex', gap: 4 });
	mButton('name', onclickFulltext, bs, { align: 'center', w: 110 });
	mButton('insensitive', onclickCase, bs, { align: 'center', w: 210 });
	mButton('anywhere', onclickWhere, bs, { align: 'center', w: 210 });

	mStyle(dFiddle, { h: 800, bg: GREEN });
	mDom(dFiddle, {}, { html: 'Edit Code:' });
	AU.ta = mDom(dFiddle, { fz: 18, family: 'consolas', w100: true, box: true, h: 'rest', bg: colorTrans(bg, 1), fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });

	mFlex(dTestButtons);
	mButton('TEST', onclickTest, dTestButtons); //mDom(dTestButtons, { bg: bg, hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, { onclick: onclickTest, className: 'hop1', html: 'TEST' });

	addEventListener('keydown', execute_on_control_enter)
	//mDom(dTable, {margin:10,bg:'#222'}, { html: 'HAAAAAAAAAALLLLLLLLLOOOOOO', editable: true, selectOnClick: true });
	//dUnten = mDiv(dTable, {box:true,w:'100%',h:400,bg:'#222'});
}
function show_sidebar(list, handler) {
	dSidebar = mBy('dSidebar');
	mClear(dSidebar);
	//mStyle(dSidebar, { w: 200, h: window.innerHeight - 68, overy: 'auto' });
	for (const k of list) {
		let d = mDiv(dSidebar, { cursor: 'pointer', wmin: 100 }, null, k, 'hop1')
		if (isdef(handler)) d.onclick = handler;
	}
}
function sortClassKeys(di) {
	let classes = dict2list(di.cla, 'key');
	let classesWithoutExtends = classes.filter(x => !x.code.includes(' extends '));

	let keys = sortCaseInsensitive(classesWithoutExtends.map(x => x.key));
	let dinew = {};
	for (const el of keys) { dinew[el] = di.cla[el]; }

	let classesWithExtends = classes.filter(x => x.code.includes(' extends '));

	let MAX = 150, i = 0;
	console.log('starting class loop')
	while (!isEmpty(classesWithExtends)) {
		if (++i > MAX) { console.log("WRONG!!!"); return []; }
		let o = classesWithExtends.find(x => {
			let ext = firstWordAfter(x.code, 'extends', true).trim();
			if (nundef(di.cla[ext])) return true; //Array
			//console.log('extends:', ext);
			return isdef(dinew[ext]);
		});
		if (isdef(o)) { dinew[o.key] = o; removeInPlace(classesWithExtends, o); }
	}
	return Object.keys(dinew);
}
function sortConstKeys(di) {
	let tbd = dict2list(di.const, 'key');
	let donelist = [];

	tbd = sortBy(tbd, x => x.code.length); //sortCaseInsensitive(tbd.map(x => x.key));
	//console.log('tbd',tbd)
	let dinew = {};

	//let keystbd=tbd.map(x=>x.key);
	let MAX = 3000, i1 = 0, i2 = 0, i3 = 0;
	console.log('starting const loop');
	console.log('const keys', tbd.length);
	while (!isEmpty(tbd)) {
		if (++i1 > MAX) { console.log("WRONG!!!"); return donelist; }

		//find a key in keystbd which code does NOT contain any other const
		let o = null;
		i2 = 0;
		for (const c of tbd) {
			if (++i2 > MAX) { console.log("WRONG!!!"); return donelist; }
			i3 = 0;
			let ok = true;
			for (const c1 of tbd) {
				if (++i3 > MAX) { console.log("WRONG!!!"); return donelist; }
				//if (c1.key == 'BRAUN' && c.key == 'ColorDict') console.log('BRAUN!!!',c1)
				if (c1 == c) continue;
				if (c.code.includes(c1.key)) ok = false;
			}
			//if (c.key == 'ColorDict') console.log('ColorDict ok',ok);
			if (ok) { o = c; break; }
		}

		//let o = tbd.find(x => tbd.every(y => y.key != x.key && !x.code.includes(y.key)));
		//console.log('o',o)
		if (isdef(o)) { donelist.push(o); dinew[o.key] = o; removeInPlace(tbd, o); } // console.log('removing',o.key); }
	}

	return donelist; //dinew; //Object.keys(dinew);
}
function stringCount(s,sSub,caseInsensitive=true){

	let temp = "Welcome to W3Docs";
	let m=new RegExp(sSub,'g'+(caseInsensitive?'i':''));
	let count = (s.match(m)).length;
	//console.log(count);
	return count;

	//console.log('m',m);
	//console.log(m.exec(s));
}function stringMinusLast(s, n = 1) {
	return s.substring(0, s.length - n);
}
function test_ui() {
	mClear(document.body);
	let d1 = mDom(document.body, {}, { classes: 'fullpage airport' });
	let [dl, dr] = mColFlex(d1, [7, 2]);
	for (const d of [dl, dr]) mStyle(d, { bg: rColor('blue', 'green', .5) })
	//return;

	mStyle(dr, { h: '100vh', fg: 'white' })
	dSidebar = mDiv100(dr, { wmax: 240, overy: 'auto', overx: 'hidden' }, 'dSidebar'); //,{h:window.innerHeight},'dSidebar')
	dLeft = dl;
	onresize = create_left_side;
	create_left_side();
}
function test_ui_extended() {
	mClear(document.body);
	let d1 = mDom(document.body, {}, { classes: 'fullpage airport' });
	let [dl, dr] = mColFlex(d1, [7, 2]);
	for (const d of [dl, dr]) mStyle(d, { bg: rColor('blue', 'green', .5) })
	//return;

	mStyle(dr, { h: '100vh', fg: 'white' })
	dSidebar = mDiv100(dr, { wmax: 240, overy: 'auto', overx: 'hidden' }, 'dSidebar'); //,{h:window.innerHeight},'dSidebar')
	dLeft = dl;
	onresize = create_left_side_extended;
	create_left_side_extended();
}
function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}
function toWordsX(s, sAllow = '_') {
	let special = ['-', '.', '*', '?', '!'];
	let s1 = '';
	for (let i = 0; i < sAllow.length; i++) {
		let ch = sAllow[i];
		s1 += (special.includes(ch) ? '\\' : '') + ch + '|';
	}
	s1 = stringMinusLast(s1);
	let arr = s.split(new RegExp(`[^(\\w|${s1})]`)); ///[^(\w|+|\-|_)]/); // // toWordsX('+hallo -rey das ist ein regal');
	return arr.filter(x => !isEmpty(x));
}
function write_code_text_file(keylist) {
	let text = '';
	for (const k of keylist) {
		let o = lookup(CODE, ['all', k]);
		let type, code;
		type = isdef(o) ? o.type : null;
		if (type == 'var') { code = CODE.justcode[k]; }
		else if (type == 'const') { code = CODE.justcode[k]; }
		else if (type == 'cla') { code = CODE.justcode[k]; }
		else if (type == 'func') { code = isdef(window[k]) ? window[k].toString() : CODE.justcode[k]; }
		else { code = window[k].toString(); }

		if (OWNPROPS.includes(k)) {continue;} //console.log('nicht dabei',k);
		// else if (!OWNPROPS.includes(k)) { code = window[k].toString(); }
		// else {console.log('nicht dabei',k); code = '';}
		// assertion(!code.includes('[native code]') && !code.includes('function('),"ERRORRRRRRRRRRRRRRRR")
		// if (k == 'write_code_text_file') console.log('code',code)

		if (k != 'write_code_text_file' && (code.includes('[native code]') || code.includes('function('))) continue;
		//if (code.includes('create_left_side')) console.log('k',k,code)
		if (!isEmpty(code)) text += code + '\n';
	}
	text = replaceAllSpecialChars(text, '\r', '');
	AU.ta.value = text;
	return text;
}

