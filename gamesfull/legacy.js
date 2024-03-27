
//#region bauhelpers

function dachain(ms = 0) {
	console.log('TestInfo', TestInfo)
	if (!isEmpty(DA.chain) && !(DA.test.running && DA.test.step == true)) {
		dachainext(ms);
	} else if (isEmpty(DA.chain)) console.log('DA.chain EMPTY ' + DA.test.iter)
}
function dachainext(ms = 0) {
	let f = DA.chain.shift();
	//console.log('====>CHAINING: func',f.name);
	if (ms > 0) TOMan.TO[getUID('f')] = setTimeout(f, ms);
	else f();
}
function onclick_step() {
	DA.test.step = true;
	DA.test.running = true;
	if (!isEmpty(DA.chain)) { dachainext(1000); return; }

	let testnumber = valf(mBy('intestnumber').value, 110);
	if (!isNumber(testnumber)) testnumber = 110;
	console.log('test for step is', testnumber);
	//onclick_ut_n('ari', testnumber);
	DA.test.number = testnumber;
	onclick_last_test();
	//jetzt nur den ersten step wie mach ich das?
}
function onclick_ut_n(g, n) {

	DA.test.running = true;
	let [fen, player_names] = window[`${g}_ut${n}_create_staged`]();
	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// if (isdef(Session.cur_tid) && Session.cur_tid > 1) {
	// 	get_delete_last_and_create_staged(fen, { level_setting: 'min' }, player_names);
	// } else {
	// 	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// }
}
function get_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ table: t }, 'delete_and_create_staged');
}
function onclick_run_tests() {
	stop_game();
	stop_polling();
	shield_on();
	DA.test.iter = 0;
	DA.test.suiteRunning = true;
	if (nundef(DA.test.list)) {
		console.log('taking default DA.test.list');
		DA.test.list = [100, 101];
	}
	test_engine_run_next(DA.test.list);
	//onclick_ut_n('ari', 104);
}
function onclick_last_test() {
	stop_game();
	stop_polling();
	DA.test.iter = 0;
	DA.test.suiteRunning = false;
	onclick_ut_n('ari', DA.test.number);
}

function ari_deck_add_safe(otree, n, arr) {
	ari_ensure_deck(otree, n);
	deck_add(otree.deck, n, arr);
}

function has_farm(uname) { return firstCond(UI.players[uname].buildinglist, x => x.type == 'farm'); }


//#endregion

//#region board

//#region sudoku utilities
function arrToMatrix(arr, rows, cols) {
	let i = 0, res = [];
	for (let r = 0; r < rows; r++) {
		let rarr = [];
		for (let c = 0; c < cols; c++) {
			let a = arr[i]; i++;
			rarr.push(a);
		}
		res.push(rarr);
	}
	return res;
}
function sudokuSampleToIndexMatrix(s, rows, cols) {
	//all 0 entries => ' ', and all numbers>0 => 
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	//console.log('letters',letters);
	let nums = letters.map(x => Number(x));
	//console.log('nums',nums);
	let res = [];
	for (const n of nums) {
		if (n === 0) res.push(' ');
		else res.push(n - 1);
	}
	//console.log('numbers',nums);
	let matrix = arrToMatrix(res, rows, cols);
	return matrix;
}
function stringToMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	//console.log('letters',letters);
	let nums = letters.map(x => Number(x));
	//console.log('numbers',nums);
	let matrix = arrToMatrix(nums, rows, cols);
}
function getSudokuPatternFromDB(r, c, index) {
	let key = '' + r + 'x' + c;
	let numSamples = Object.keys(DB.games.gColoku.samples[key]).length;
	//console.log('r', r, 'c', c, numSamples)
	if (nundef(index)) index = randomNumber(0, numSamples - 1); else if (index >= numSamples) index = 1;
	let sample = DB.games.gColoku.samples[key][index];
	//console.log('sample', sample, 'index', index, sample.sol, r, c)
	let pattern = sudokuSampleToIndexMatrix(sample.sol, r, c);
	//console.log('pattern',pattern);
	let puzzle = sudokuSampleToIndexMatrix(sample.min, r, c);
	return { pattern: pattern, puzzle: puzzle };
}
function getSudokuPattern(r, c) {
	//mach das pattern es sollte 16 geben!
	// 0 1 2 3 
	// 3 2 0 1
	// 2 3 1 0
	// 1 0 2 3

	// 0 1 2 3 
	// 2 3 0 1
	// 3 0 1 2
	// 1 2 3 0

	// 0 1 2 3 
	// 2 3 0 1
	// 1 0 3 2
	// 3 2 1 0
	let patterns = {
		44: [
			[[0, 1, 2, 3], [2, 3, 0, 1], [3, 0, 1, 2], [1, 2, 3, 0]],
			[[0, 1, 2, 3], [3, 2, 0, 1], [2, 3, 1, 0], [1, 0, 3, 2]],
			[[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]],
		],
	};
	return chooseRandom(patterns['' + r + c]);
}
function destroySudokuRule(pattern, rows, cols) {
	let sz = Math.min(rows, cols);
	let [r1, r2] = choose(range(0, sz - 1), 2);
	let c = chooseRandom(range(0, sz - 1));
	// arrSwap2d(pattern, r1, c, r2, c);


	//TEST arrSwap2d(pattern, 0, 3, 1, 3);return;

	//generate row error
	if (coin(50)) { arrSwap2d(pattern, r1, c, r2, c); }

	//generate col error
	else if (coin(50)) { arrSwap2d(pattern, c, r1, c, r2); }

}
function hasDuplicate(arr, efunc) {
	let di = {};
	if (nundef(efunc)) efunc = x => { return x === ' ' };
	let i = -1;
	//console.log('check for dupl in',arr)
	for (const a of arr) {
		//console.log('i', i, 'a', a)
		i += 1;
		if (efunc(a)) continue; //!isNumber(a) && a==' ') {console.log('H!',a);continue;}
		if (a in di) return { i: i, val: a };
		di[a] = true;
	}
	return false;
}
function checkSudokuRule(matrix) {
	//should return at least one example of offending tiles if incorrect! null otherwise!

	//check rows is simple!
	let i = 0;
	for (const arr of matrix) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'row', row: i, col: dd.i, val: dd.val, info: dd, i: i };
			return err;
		}
		i += 1;
	}

	i = 0;
	for (const arr of bGetCols(matrix)) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'column', col: i, row: dd.i, val: dd.val, i: i, info: dd };
			return err;
		}
		i += 1;
	}

	//console.log('still here!');

	// let sub0=bGetSubMatrix(pattern,0,2,0,2);
	// let sub1=bGetSubMatrix(pattern,0,2,2,2);
	// let sub2=bGetSubMatrix(pattern,2,2,0,2);
	// let sub3=bGetSubMatrix(pattern,2,2,2,2);
	let [rows, cols] = [matrix.length, matrix[0].length];
	let rowsEach = rows == 9 ? 3 : 2;
	let colsEach = cols == 4 ? 2 : 3;
	let chunks = bGetChunksWithIndices(matrix, rowsEach, colsEach);
	//printMatrix(chunks, 'quadrants');



	i = 0;
	for (const arr of chunks) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let val = dd.val;
			let err = { type: 'quadrant', row: val.row, col: val.col, val: val.val, i: i, info: dd };
		}
		i += 1;
	}

	return null;
}
function checkSudokuRule_trial1(matrix) {
	//should return at least one example of offending tiles if incorrect! null otherwise!

	for (const arr of matrix) { let dd = hasDuplicate(arr); if (dd) return { type: 'row', info: dd }; }

	for (const arr of bGetCols(matrix)) { let dd = hasDuplicate(arr); if (dd) return { type: 'column', info: dd }; }

	//console.log('still here!');

	// let sub0=bGetSubMatrix(pattern,0,2,0,2);
	// let sub1=bGetSubMatrix(pattern,0,2,2,2);
	// let sub2=bGetSubMatrix(pattern,2,2,0,2);
	// let sub3=bGetSubMatrix(pattern,2,2,2,2);
	let chunks = bGetChunks(matrix, 2, 2);
	//printMatrix(chunks, 'quadrants');
	for (const arr of chunks) { let dd = hasDuplicate(arr); if (dd) return { type: 'quadrant', info: dd }; }

	return null;
}
//#endregion

//#region board 2d arr utilities
function bGetSubMatrix(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	//console.log('rows',rows,res);return;
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push(arr2d[r][c]);
		}
		rIndex += 1;
	}
	//console.log('res',res)
	//printMatrix(res,'res')
	return res;
}
function bGetSubMatrixWithIndices(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	//console.log('rows',rows,res);return;
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push({ row: r, col: c, val: arr2d[r][c] });
		}
		rIndex += 1;
	}
	//console.log('res',res)
	//printMatrix(res,'res')
	return res;
}
function bGetChunksWithIndices(arr2d, rowsEach, colsEach) {
	//das returned nicht flattened arrays of just entries, but flattened arrays of {row:r,col:c,val:entry}
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			//console.log('rFrom',r,'cFrom',c)
			m1 = bGetSubMatrixWithIndices(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
		//printMatrix(m1,'quad'+res.length);
	}
	return res;
}
function bGetChunks(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			//console.log('rFrom',r,'cFrom',c)
			m1 = bGetSubMatrix(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
		//printMatrix(m1,'quad'+res.length);
	}
	return res;
}
function bGetRows(arr2d) {
	return arr2d;
}
function bGetCols(arr2d) {
	let rows = arr2d.length;
	let cols = arr2d[0].length;

	let res = [];
	for (let c = 0; c < cols; c++) { res.push([]); }
	//console.log('res',res);

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			res[c].push(arr2d[r][c]);
		}
	}

	return res;
}
function printMatrix(arr2d, title = 'result') {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let arr = arrFlatten(arr2d);
	// console.log('arr', arr,rows,cols)
	let s = toBoardString(arr, rows, cols);
	console.log(title, s)
}

//#endregion

//#region board utilities
var StateDict = {};
var EmptyFunc = x => nundef(x) || x == ' ';

function bGetCol(arr, icol, rows, cols) {
	let iStart = icol;
	let res = [];
	for (let i = iStart; i < iStart + (cols * rows); i += cols) res.push(arr[i]);
	return res;
}
function bGetRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let arrNew = arr.slice(iStart, iStart + cols);

	let res = [];
	for (let i = iStart; i < iStart + cols; i++) res.push(arr[i]);

	console.assert(sameList(arrNew, res), 'NOOOOOO');
	return res;
}

function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	//ang tile ist 0,0
	//get r,c from index: 
	let [r, c] = iToRowCol(idx, rows, cols);

	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	//console.log('idx', idx, 'rows', rows, 'cols', cols, 'r', r, 'c', c);
	return nei;

}
function iFromRowCol(row, col, rows, cols) { return row * cols + col; }
function iToRowCol(idx, rows, cols) { let c = idx % cols; let r = (idx - c) / rows; return [r, c]; }
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !EmptyFunc(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!EmptyFunc(arr[i])) break;
	}
	return indices;
}
function isOppPiece(sym, plSym) { return sym && sym != plSym; }
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	//console.log('player sym',plSym,'arr',arr,'idx', idx,'rows', rows,'cols', cols);
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	//console.log('nei',nei);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;

		let el = arr[i];
		//console.log('___i',i,'el',el,'checking dir',dir);
		if (EmptyFunc(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;

		while (isOppPiece(el, plSym)) {
			//console.log('index',i,'is opp',el)
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			//console.log(i,cmax,'dir',dir);
			if (nundef(i)) break;
			el = arr[i];
			//console.log('i',i,'el',el,'max',cmax);
		}
		if (el == plSym) {
			//add all the captured pieces to res
			res = res.concat(inew);
		}
	}
	return res;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	//console.log('hallo!', cols, stride)
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(cols, icol, stride)
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideCol(arr, icol, rows, cols, stride) {
	//console.log('hallo!', rows, stride)
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (EmptyFunc(arr[i])) continue;
		else if (EmptyFunc(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
		//else if (state[i]=='O')
	}
	return res;
}
function printBoard(arr, rows, cols, reduced = true) {
	let arrR = boardArrOmitFirstRowCol(arr, rows, cols);
	let s = toBoardString(arrR, rows, cols);
	console.log('board', s);
}
function boardArrOmitFirstRowCol(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);

			res.push(boardArr[i]);
		}
	}
	return res;

}
// new version von printState:
function toBoardString(arr, rows, cols) {
	let s = '\n';
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let item = arr[r * cols + c];

			s += '' + (nundef(item) ? '_' : item) + ' ';
		}
		s += '\n';
	}
	return s;
}
function printState(state, cols, rows) {
	//console.log('___________',state)
	let formattedString = '';
	state.forEach((cell, index) => {
		formattedString += isdef(cell) ? ` ${cell == '0' ? ' ' : cell} |` : '   |';
		if ((index + 1) % cols == 0) {
			formattedString = formattedString.slice(0, -1);
			if (index < rows * cols - 1) {
				let s = '\u2015\u2015\u2015 '.repeat(cols);
				formattedString += '\n' + s + '\n'; //\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
				// formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
			}
		}
	});
	console.log('%c' + formattedString, 'color: #6d4e42;font-size:10px');
	console.log();
}
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }

function checkwinnersPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinners(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!EmptyFunc(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (EmptyFunc(x)) return false; return true; }

//TTT
function checkPotentialTTT(arr, rows, cols) { return checkwinnersPossible(arr, rows, cols); }
function checkwinnersTTT(arr, rows, cols) { return checkwinners(arr, rows, cols); }
function checkwinnersC4(arr, rows = 6, cols = 7, stride = 4) {
	//console.log(arr,rows,cols,stride)

	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
//#endregion

//#region Board classes
class Board {
	constructor(rows, cols, handler, cellStyle) {
		let styles = isdef(cellStyle) ? cellStyle : { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
		this.rows = rows;
		this.cols = cols;
		let items = this.items = iGrid(this.rows, this.cols, dTable, styles);
		items.map(x => {
			let d = iDiv(x);
			mCenterFlex(d);
			d.onclick = handler;
		});
		//console.log(this.items)
	}
	get(ir, c) {
		if (isdef(c)) {
			// interpret as row,col
			let idx = ir * this.cols + c;
			return this.items[idx];
		} else {
			//interpret as index
			return this.items[ir];
		}
	}
	getState() {
		return this.items.map(x => x.label);
	}
	setState(arr, colors) {

		if (isEmpty(arr)) return;
		if (isList(arr[0])) { arr = arrFlatten(arr); }

		for (let i = 0; i < arr.length; i++) {
			let item = this.items[i];
			let val = arr[i];
			if (!EmptyFunc(val)) {
				addLabel(item, val, { fz: 60, fg: colors[val] });
			} else item.label = val;
			//item.label = arr[i];

		}
	}
	clear() {
		for (const item of this.items) {
			let dLabel = iLabel(item);
			if (isdef(dLabel)) { removeLabel(item); item.label = null; }
		}
	}
}

class Board2D {
	constructor(rows, cols, dParent, cellStyles, boardStyles, handler) {
		cellStyles = this.cellStyles = isdef(cellStyles) ? cellStyles : { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
		boardStyles = this.boardStyles = isdef(boardStyles) ? boardStyles : { bg: 'silver', fg: 'black' };
		this.rows = rows;
		this.cols = cols;
		this.dParent = dParent;
		//let dGridParent = this.dGridParent = mDiv(dParent,{bg:'green'});
		let dBoard = this.dBoard = mDiv(dParent);//, boardStyles);
		let items = this.items = this.fill(dBoard, this.rows, this.cols, null, cellStyles);
	}
	fill(d, rows, cols, items, cellStyles) {
		if (nundef(items)) items = [];
		clearElement(d);
		mStyle(d, { display: 'grid', 'grid-template-columns': cols });
		for (let i = 0; i < rows * cols; i++) {
			let item = items[i];
			if (isdef(item)) {
				let d1 = iDiv(item);
				if (isdef(d1)) mAppend(d, iDiv(item));
				else {
					d1 = mDiv(d, cellStyles); iAdd(item, { div: d1 }); mAppend(d, d1);
				}
			} else {
				let [r, c] = iToRowCol(i);
				item = { row: r, col: c, index: i };
				let d1 = mDiv(d, cellStyles); iAdd(item, { div: d1 }); mAppend(d, d1);
			}
			mStyle(iDiv(item), cellStyles);
			items.push(item)
		}
		return items;
	}
	get(ir, c) {
		if (isdef(c)) {
			// interpret as row,col
			let idx = ir * this.cols + c;
			return this.items[idx];
		} else {
			//interpret as index
			return this.items[ir];
		}
	}
	getState() {
		return this.items.map(x => x.label);
	}
	setState(arr, colors) {

		if (isEmpty(arr)) return;
		if (isList(arr[0])) { arr = arrFlatten(arr); }

		for (let i = 0; i < arr.length; i++) {
			let item = this.items[i];
			let val = arr[i];
			if (!EmptyFunc(val)) {
				addLabel(item, val, { fz: 60, fg: colors[val] });
			} else item.label = val;
			//item.label = arr[i];

		}
	}
	clear() {
		for (const item of this.items) {
			let dLabel = iLabel(item);
			if (isdef(dLabel)) { removeLabel(item); item.label = null; }
		}
	}
}

//#endregion

//#region expand and reduce board (perlen 1. version)
function reduceBoard(board, rNew, cNew, iModify) {
	//console.log(board.rows,board.cols, 'iModify',iModify)
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	//console.log('boardArrOld',boardArrOld)

	let rest = [];
	if (rOld > rNew) { rest = bGetRow(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	else if (cOld > cNew) { rest = bGetCol(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	//console.log('restPerlen', rest)

	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iModify) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			// else if (x == iModify) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r + 1, c] : [r, c + 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: rest };
}
function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: [] };

}
function insertColNew(board, cClick) { return expandBoard(board, board.rows, board.cols + 1, cClick + 1); }
function insertRowNew(board, cClick) { return expandBoard(board, board.rows + 1, board.cols, cClick + 1); }
function removeColNew(board, cClick) { return reduceBoard(board, board.rows, board.cols - 1, cClick); }
function removeRowNew(board, cClick) { return reduceBoard(board, board.rows - 1, board.cols, cClick); }
//#endregion

function getCenters(layout, rows, cols, wCell, hCell,) {
	if (layout == 'quad') { return quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { return hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { return circleCenters(rows, cols, wCell, hCell); }
}
function getCentersFromAreaSize(layout, wBoard, hBoard, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function getCentersFromRowsCols(layout, rows, cols, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function quadCenters(rows, cols, wCell, hCell) {
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let center = { x: x + offX, y: y + offY };
			centers.push(center);
			x += wCell;
		}
		y += hCell; x = 0;
	}
	//last,x,y+offX,offY 	
	return [centers, wCell * cols, hCell * rows];
}
function circleCenters(rows, cols, wCell, hCell) {
	//find center
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;

	//console.log('cx,cy', cx, cy)

	let centers = [{ x: cx, y: cy }];

	//calc wieviele schichten sich ausgehen?
	let rx = cx + wCell / 2; let dradx = rx / wCell;
	let ry = cy + hCell / 2; let drady = ry / hCell;
	let nSchichten = Math.floor(Math.min(dradx, drady));
	//console.log('Schichten', nSchichten)

	for (let i = 1; i < nSchichten; i++) {
		let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
		//console.log('newCenters',newCenters,'w',wsch,'h',hsch);//,'\n',newCenters.centers.length);
		for (const nc of newCenters) {
			//console.log('adding point',nc);
			centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
		}
	}
	return [centers, wCell * cols, hCell * rows];
}
function cCircle(c, sz, n, disp = -90) {
	//disp=0 would be starting from east for flat hex!
	//return starting from north towards NW in clockwise order, n equidistant points along circle with center c and diameter sz
	let rad = sz / 2;
	centers = getEllipsePoints(rad, rad, n, disp)
	centers = centers.map(pt => ({ x: pt.X + c.x, y: pt.Y + c.y }));
	return centers;
}
function oneCircleCenters(rows, cols, wCell, hCell) {
	//find center
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;

	//console.log('cx,cy',cx,cy)

	let centers = [{ x: cx, y: cy }];


	//wieviele will ich placen?
	let n = 8;
	//was ist radius?
	let radx = cx - wCell / 2;
	let rady = cy - hCell / 2;

	//console.log('radx,rady',radx,rady)

	let peri = Math.min(radx, rady) * 2 * Math.PI;
	//console.log('.............n',n)
	n = Math.floor(peri / Math.min(wCell, hCell));
	//console.log('.............n',n)
	while (n > 4 && n % 4 != 0 && n % 6 != 0) n -= 1;
	//console.log('.............n',n)

	centers = getEllipsePoints(radx, rady, n)
	centers = centers.map(pt => ({ x: pt.X + cx, y: pt.Y + cy }));

	return [centers, wCell * cols, hCell * rows];
}

//#region hex: colarr stuff!
function hexCenters(rows, cols, wCell = 100, hCell) {
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let startSmaller = Math.floor(rows / 2) % 2 == 1;

	let x = 0; y = 0;
	for (let r = 0; r < rows; r++) {
		let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
		let curCols = isSmaller ? cols - 1 : cols;
		let dx = isSmaller ? wCell / 2 : 0;
		dx += offX;
		for (let c = 0; c < curCols; c++) {
			let center = { x: dx + c * wCell, y: offY + r * hline };
			centers.push(center);
		}
	}
	return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function _calc_hex_col_array_old(rows, cols) {
	let colarr = []; //how many cols in each row
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function _calc_hex_col_array(rows, cols) {
	let colarr = []; //how many cols in each row
	//let b = (rows - 1) / 2; //Math.floor(rows/2);
	let even = rows % 2 == 0;

	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (even && i < (rows / 2) - 1) cols += 1;
		else if (even && i > rows / 2) cols -= 1;
		else if (!even && i < (rows - 1) / 2) cols += 1;
		else if (!even || i >= (rows - 1) / 2) cols -= 1;
	}
	return colarr;
}
function fillColarr(colarr, items) {
	//eg  colarr=[2,4,3], items:[a,b,c,d,e,f,g,h,i] =>returns [[a,b],[c,d,e,f],[g,h,i]]
	let i = 0;
	let result = [];
	for (const r of colarr) {
		let arr = [];
		for (let c = 0; c < r; c++) {
			arr.push(items[i]); i++;
		}
		result.push(arr);
	}
	return result;

}

function hex1Count(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let total = 0;
	for (let r = 0; r < colarr.length; r++) { total += colarr[r]; }
	return total;
}
function hex1Indices(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let iStart = Math.floor(rows / 2);
	let inc = -1;
	let res = [];
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let icol = iStart + 2 * c;
			let irow = r;
			res.push({ row: irow, col: icol });
		}
		if (iStart == 0) inc = 1;
		iStart += inc;
	}
	return res;
}

function hex1Centers(rows, cols, wCell = 100, hCell = null) {
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
	//rows = 7, cols = 6;
	let colarr = _calc_hex_col_array(rows, cols);
	//console.log('colarr', colarr);
	let maxcols = arrMax(colarr);
	//calc x offset of row: (maxcols-colarr[i])*wCell/2
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];

	let x = 0; y = 0;
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let dx = (maxcols - n) * wCell / 2;
			let dy = r * hline;
			let center = { x: dx + c * wCell + offX, y: dy + offY };
			centers.push(center);
		}
	}
	//console.log(centers)
	return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}

function hex1Board(dParent, rows, topcols, styles = {}) {
	let g = new UIGraph(dParent, styles);
	let [w, h] = [valf(lookup(styles, ['node', 'w']), 50), valf(lookup(styles, ['node', 'h']), 50)];
	//let [rows, topcols] = [5, 3];
	let total = hex1Count(rows, topcols);
	//console.log('for rows', rows, 'and cols', topcols, 'need', total, 'nodes')
	let nids = g.addNodes(total);
	g.hex1(rows, topcols, w + 4, h + 4);
	let indices = hex1Indices(rows, topcols);
	//console.log('indices', indices);
	//correct, jetzt soll jeder node die bekommen!
	let ids = g.getNodeIds();
	//console.log('node ids:', ids);
	//return;
	let di = {};
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		lookupSet(di, [row, col], id);
		g.setProp(id, 'row', row);
		g.setProp(id, 'col', col);
		g.setProp(id, 'label', `${row},${col}`);
		//g.setStyle(id, 'label', 'data(label)');
	}
	//let labels=g.getNodes().map(x=>x.data().label);
	//console.log('labels',labels);
	//let label=g.cy.getElementById(ids[1]).data('label');

	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		let nid2 = lookup(di, [row, col + 2]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col - 1]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col + 1]); if (nid2) g.addEdge(id, nid2);
	}

	//let deg=g.getDegree(ids[1]); //cy.getElementById(ids[1]).data('label');
	//let deg1=g.getDegree(ids[10]); //cy.getElementById(ids[1]).data('label');
	//let deg2=g.getDegree(ids[18]); //cy.getElementById(ids[1]).data('label');
	//console.log('das geht: label',label,deg,deg1,deg2);

	let byrc = {};
	for (const r in di) {
		byrc[r] = {};
		for (const c in di[r]) {
			byrc[r][c] = g.getNode(di[r][c]).data();
		}
	}
	g.di = di;
	g.byrc = byrc;
	g.rc = (i, j, f) => (isdef(f)) ? f(g.getNode(di[i][j])) : g.getNode(di[i][j]);
	return g;
}

function catanBoard(dParent, rows, topcols, styles = {}) {
	let g = hex1Board(dParent, rows, topcols, styles);
	hexCornerNodes(g);

}
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}

function getCornerVertices(centers, w = 100, h = 100) {
	let polys = [];
	for (const pt of centers) {
		let poly = getHexPoly(pt.x, pt.y, w, h);
		polys.push(poly);
	}
	let vertices = correctPolys(polys, 1);
	return vertices;
}
function hexCornerNodes(g) {
	let nodes = g.getNodes();
	let centers = nodes.map(x => x.data('center'));
	let vertices = getCornerVertices(centers);

	//now create points for unique vertices!
	//danach muss ich noch das neighborhood machen
	for (const f of nodes) {
		let center = f.data('center');
		console.log('center', center)

	}

}

function makeEdge(dParent, v1, v2, dFromEdge, ew = 20) {

	let switched = false;
	if (v1.x == v2.x) {
		if (v1.y > v2.y) { let h = v2; v2 = v1; v1 = h; switched = true; }
		let w = ew / 2;
		let sp = `polygon(${v1.x - w + ew}px ${v1.y + dFromEdge + ew}px, ${v1.x + w + ew}px ${v1.y + dFromEdge + ew}px, ${v2.x + w + ew}px ${v2.y - dFromEdge + ew}px, ${v2.x - w + ew}px ${v2.y - dFromEdge + ew}px)`;
		let de = mDiv(dParent, { position: 'absolute', left: -ew, top: -ew, w: '120%', h: '120%' });
		mClass(de, 'edge');
		mStyle(de, { 'clip-path': sp });
		return mItem(null, { div: de }, { type: 'edge' }, true);
	}
	if (v1.x > v2.x) { let h = v2; v2 = v1; v1 = h; switched = true; }

	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;

	let m = dy / dx;
	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];

	let alpha = Math.atan(m);

	let xa = x1 + dFromEdge * Math.cos(alpha);
	let ya = y1 + dFromEdge * Math.sin(alpha);

	let xe = x2 - dFromEdge * Math.cos(alpha);
	let ye = y2 - dFromEdge * Math.sin(alpha);

	let m2 = -1 / m;
	let beta = Math.atan(m2);

	let w = ew / 2;
	let x1t = xa + w * Math.cos(beta);
	let y1t = ya + w * Math.sin(beta);
	let x1b = xa - w * Math.cos(beta);
	let y1b = ya - w * Math.sin(beta);

	let x2t = xe + w * Math.cos(beta);
	let y2t = ye + w * Math.sin(beta);
	let x2b = xe - w * Math.cos(beta);
	let y2b = ye - w * Math.sin(beta);

	let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: '120%', h: '120%' });
	mStyle(de, { 'clip-path': `polygon(${x1t}px ${y1t}px, ${x2t}px ${y2t}px, ${x2b}px ${y2b}px, ${x1b}px ${y1b}px)` });
	mClass(de, 'edge');
	return mItem(null, { div: de }, { type: 'edge' }, true);
}
function neighborhood(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {

		if (info.type != 'field') continue;
		//nodes from north! null if dont exist
		let [r, c] = [info.row, info.col];
		//nodes for each field
		info.nodeItems = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r - 1, c - 1]),
		];
		info.nodes = info.nodeItems.map(x => isdef(x) ? x.id : null);
		delete info.nodeItems;

		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neiItems = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
		info.nei = info.neiItems.map(x => isdef(x) ? x.id : null);
		delete info.neiItems;

	}

}
function addRowsCols(items) {
	let byrc = {};

	let byx = sortBy(items, 'x');
	let c = 0, x = byx[0].x;
	for (let i = 0; i < byx.length; i++) {
		let item = byx[i];
		if (!isCloseTo(item.x, x, 2)) { c += 1; x = item.x; }
		item.col = c;
	}

	let byy = sortBy(items, 'y');
	let r = 0, y = byy[0].y;
	for (let i = 0; i < byy.length; i++) {
		let item = byy[i];
		if (!isCloseTo(item.y, y, 2)) { r += 1; y = item.y; }
		item.row = r;
		lookupSet(byrc, [item.row, item.col], item);
	}

	return byrc;
}


//#endregion hex

//#region mGraph


class AGraph {
	constructor() {
		this.init(...arguments);
		this.posDict = {};
	}
	init() {
		let defOptions = {
			maxZoom: 1,
			minZoom: .001,
			motionBlur: false,
			// wheelSensitivity: 0.05,
			zoomingEnabled: false,
			userZoomingEnabled: false,
			panningEnabled: false,
			userPanningEnabled: false,
			boxSelectionEnabled: false,
			layout: { name: 'preset' },
			elements: [],
		};

		this.cy = cytoscape(defOptions);
	}
	clear() { this.cy.destroy(); }

	//#region access and algos
	getComponents() { return this.cy.elements().components(); }
	getComponentIds() { return this.cy.elements().components().map(x => x.id()); }
	getCommonEdgeId(nid1, nid2) { return nid1 + '_' + nid2; }
	getNumComponents() { return this.cy.elements().components().length; }
	getNode(id) { return this.cy.getElementById(id); }
	getEdge(id) { return this.cy.getElementById(id); }
	getNodes() { return this.cy.nodes(); }
	getNodeIds() { return this.cy.nodes().map(x => x.id()); }
	getNodeData() { return this.cy.nodes().map(x => x.data()); }
	getNodePositions() { return this.cy.nodes.map(x => x.position()); }
	getEdges() { return this.cy.edges(); }
	getEdgeIds() { return this.cy.edges().map(x => x.id()); }
	getPosition(id) {
		let node = this.getNode(id);
		let pos = node.renderedPosition();
		//console.log('node', node, pos);
		return pos; //this.cy.getElementById(id).renderedPosition();
	}
	getSize(id) {
		let node = this.getNode(id);
		let pos = node.bb();//renderedBoundingBox();
		//console.log('node', node, pos);
		return pos; //this.cy.getElementById(id).renderedPosition();

	}
	getProp(id, prop) { return this.cy.getElementById(id).data(prop); }
	getDegree(id) { return this.cy.getElementById(id).degree(); }
	getNodeWithMaxDegree(idlist) {
		if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let imax = arrMinMax(idlist, x => this.getDegree(x)).imax;
		let id = idlist[imax];
		return id;
	}
	getShortestPathsFrom(id) { let res = this.cy.elements().dijkstra('#' + id); return res; }
	getShortestPathFromTo(nid1, nid2) {
		//console.log(nid1, nid2)
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		// let len = funcs.distanceTo('#' + nid2);
		let path = funcs.pathTo('#' + nid2);
		return path;

	}
	getLengthOfShortestPath(nid1, nid2) {
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		let len = funcs.distanceTo('#' + nid2);
		//let path = funcs.pathTo('#' + nid2);
		return len;
	}
	setPositionData(prop = 'center') {
		let ids = this.getNodeIds();
		for (const id of ids) {
			let pos = this.getProp(id, prop);
			if (isdef(pos)) this.setPosition(id, pos.x, pos.y);
			else return false;
		}
		return true;
	}
	sortNodesByDegree(idlist, descending = true) {
		//console.log('idlist',idlist)
		if (nundef(idlist)) idlist = this.cy.nodes.map(x => x.data().id);
		// if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let nodes = idlist.map(x => this.getNode(x));
		for (const n of nodes) {
			n.degree = this.getDegree(n.id());
			//console.log('id',n.id(),'has degree',n.degree);
		}
		if (descending) sortByDescending(nodes, 'degree'); else sortBy(nodes, 'degree');
		return nodes;
	}
	storeCurrentPositions(prop = 'center') {
		for (const n of this.getNodes()) {
			let id = n.id();
			//console.log('id', id);
			let pos = this.getPosition(id);
			//console.log('current pos', id, pos);
			this.setProp(id, prop, pos);
			//console.log('new val', this.getProp(id, prop));
		}
	}
	//#endregion

	//#region add/remove nodes, edges
	addNode(data, coords) {
		if (nundef(data)) data = {};
		if (nundef(data.id)) data.id = getFruid();
		if (isdef(coords)) {
			coords.x -= this.cy.pan().x;
			coords.y -= this.cy.pan().y;
		} else { coords = { x: 0, y: 0 }; }
		var ele = this.cy.add({
			group: 'nodes',
			data: data,
			position: coords
		});
		return ele.id();
	}
	addNodes(n, datalist, coordlist) {
		let ids = [];
		if (nundef(datalist)) datalist = new Array(n).map(x => ({ id: getFruid() }));
		if (nundef(coordlist)) coordlist = new Array(n).map(x => ({ coords: { x: 0, y: 0 } }));
		for (let i = 0; i < n; i++) {
			let id = this.addNode(datalist[i], coordlist[i]);
			ids.push(id);
		}
		return ids;
	}
	addEdge(nid1, nid2, data) {
		//console.log('addEdge',nid1,nid2,data)
		if (nundef(data)) data = {};
		data.id = this.getCommonEdgeId(nid1, nid2);

		data.source = nid1;
		data.target = nid2;
		var ele = this.cy.add({
			group: 'edges',
			data: data,
		});
		return ele.id();
	}
	addEdges(nOrNodePairList) {
		//nodePairList should be of the form: [[nid1,nid2], ...]
		if (isNumber(nOrNodePairList)) {
			//make n random nodes!
			let nids = this.getNodeIds();
			let prod = arrPairs(nids);
			nOrNodePairList = choose(prod, nOrNodePairList);
		}
		let res = [];
		for (const pair of nOrNodePairList) {
			res.push(this.addEdge(pair[0], pair[1]));
		}
		return res;
	}
	removeNode(node) { this.removeElement(node); return this.getNodeIds(); }
	removeEdge(edge) { this.removeElement(edge); return this.getEdgeIds(); }
	removeElement(ne) { if (!isString(ne)) ne = ne.id(); this.cy.getElementById(ne).remove(); }
	//#endregion

	//#region modify nodes, edges (data, position...)
	setPosition(id, x, y) { this.cy.getElementById(id).position({ x: x, y: y }); }

	setProp(id, prop, val) { this.cy.getElementById(id).data(prop, val); }

	//#endregion

}
class UIGraph extends AGraph {

	init(dParent, styles = {}) {
		//console.log('dParent', dParent)
		let defOptions = {
			maxZoom: 1,
			minZoom: .001,
			motionBlur: false,
			wheelSensitivity: 0.05,
			zoomingEnabled: true,
			userZoomingEnabled: true,
			panningEnabled: true,
			userPanningEnabled: true,
			boxSelectionEnabled: false,
			elements: [],
		};

		this.id = getUID();
		let dOuter = mDiv(dParent, styles.outer, this.id);//, 'Outer graph');
		let gStyles = valf(styles.inner, { w: 640, h: 420 });
		let dContainer = mDiv(dOuter, { position: 'relative', w: gStyles.w, h: gStyles.h, align: 'left' });

		let styleDict = {
			node: { 'label': 'data(label)', width: 25, height: 25, 'background-color': 'red', color: "#fff", "text-valign": "center", "text-halign": "center" },
			edge: { width: 2, 'line-color': 'silver', 'curve-style': 'haystack', },
			'node.high': { 'background-color': 'yellow' },
			'node.trans': { opacity: '0.5' },
		}
		for (const ks of ['node', 'edge', 'node.high', 'node.trans']) {
			if (isdef(styles[ks])) {
				let mStyles = styles[ks];
				let cyStyles = translateStylesToCy(mStyles, ks);
				copyKeys(cyStyles, styleDict[ks]);
				// console.log('style dict', styles[ks])
				// for (const k in styles[ks]) {
				// 	mStyleToCy(k, styles[ks][k], styleDict[ks]);
				// }
			}
		}
		let cyStyle = [];
		for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

		let options = { container: dContainer, style: cyStyle };
		copyKeys(options, defOptions);

		this.cy = cytoscape(defOptions);
		iAdd(this, { div: dOuter, dCy: dContainer });

	}
	//#region layouts
	hex(rows, cols, wCell, hCell) {

		let centers = this.hexPositions = getCentersFromRowsCols('hex', rows, cols, wCell, hCell)[0];
		//console.log('centers', centers);
		this.storePositions('hex', centers);
		this.storePositions('preset', centers);

		//jetzt retrieve
		this.retrievePositions('hex');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
		//for (const n of this.cy.nodes()) { n.position(centers.x, centers.y); }

	}
	hex1(rows, cols, wCell, hCell) {

		let centers = this.hexPositions = getCentersFromRowsCols('hex1', rows, cols, wCell, hCell)[0];
		//console.log('centers', centers);
		//centers = centers.map(pt=>{return {x:pt.y,y:pt.x};});
		this.storePositions('hex1', centers);
		this.storePositions('preset', centers);
		let nodes = this.getNodes();
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			let center = centers[i];
			node.data('center', center);
		}

		//jetzt retrieve
		this.retrievePositions('hex1');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
		//for (const n of this.cy.nodes()) { n.position(centers.x, centers.y); }

	}
	breadthfirst() { this.cy.layout({ name: 'breadthfirst', animate: true }).run(); }
	circle() { this.cy.layout({ name: 'circle', animate: 'end' }).run(); }
	concentric() { this.cy.layout({ name: 'concentric', animate: true }).run(); }
	//cola() { this.cy.layout({ name: 'cola', animate: 'end' }).run(); }
	comcola() {
		let defaults = {
			name: 'cola',
			animate: true, // whether to show the layout as it's running
			refresh: 1, // number of ticks per frame; higher is faster but more jerky
			maxSimulationTime: 4000, // max length in ms to run the layout
			ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
			fit: true, // on every layout reposition of nodes, fit the viewport
			padding: 30, // padding around the simulation
			boundingBox: undefined, //{x1:0,y1:0,x2:200,y2:200,w:200,h:200}, //undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
			nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

			// layout event callbacks
			ready: function () { }, // on layoutready
			stop: function () { }, // on layoutstop

			// positioning options
			randomize: false, // use random node positions at beginning of layout
			avoidOverlap: true, // if true, prevents overlap of node bounding boxes
			handleDisconnected: true, // if true, avoids disconnected components from overlapping
			convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
			nodeSpacing: function (node) { return 10; }, // extra spacing around nodes
			flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
			alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
			gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

			// different methods of specifying edge length
			// each can be a constant numerical value or a function like `function( edge ){ return 2; }`
			edgeLength: undefined, // sets edge length directly in simulation
			edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
			edgeJaccardLength: undefined, // jaccard edge length in simulation

			// iterations of cola algorithm; uses default values on undefined
			unconstrIter: undefined, // unconstrained initial layout iterations
			userConstIter: undefined, // initial layout iterations with user-specified constraints
			allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

			// infinite layout options
			infinite: false // overrides all other options for a forces-all-the-time mode
		};
		let options = {
			name: 'cola',
			convergenceThreshold: 100,
			// padding: 25,
			// nodeSpacing: 5,
			// edgeLengthVal: 2,
			// animate: true,
			// randomize: false,
			// maxSimulationTime: 1500,
			// ready: this.reset.bind(this),
			// flow: null,
			boundingBox: { x1: 20, y1: 20, w: 200, h: 200 },
		};
		copyKeys(options, defaults);
		console.log(defaults.boundingBox)
		this.cy.layout(defaults).run();
	}
	cola() { this.cy.layout({ name: 'cola' }).run(); }
	cose() { this.cy.layout({ name: 'cose', animate: 'end' }).run(); }
	// dagre() { this.cy.layout({ name: 'dagre', fit: true, padding: 25, animate: 'end' }).run(); }
	euler() { this.cy.layout({ name: 'euler', fit: true, padding: 25, animate: 'end' }).run(); }
	fcose() {
		var defaultOptions = {

			// 'draft', 'default' or 'proof' 
			// - "draft" only applies spectral layout 
			// - "default" improves the quality with incremental layout (fast cooling rate)
			// - "proof" improves the quality with incremental layout (slow cooling rate) 
			quality: "default",
			// Use random node positions at beginning of layout
			// if this is set to false, then quality option must be "proof"
			randomize: true,
			// Whether or not to animate the layout
			animate: true,
			// Duration of animation in ms, if enabled
			animationDuration: 500,
			// Easing of animation, if enabled
			animationEasing: undefined,
			// Fit the viewport to the repositioned nodes
			fit: true,
			// Padding around layout
			padding: 30,
			// Whether to include labels in node dimensions. Valid in "proof" quality
			nodeDimensionsIncludeLabels: false,
			// Whether or not simple nodes (non-compound nodes) are of uniform dimensions
			uniformNodeDimensions: false,
			// Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
			packComponents: true,
			// Layout step - all, transformed, enforced, cose - for debug purpose only
			step: "all",

			/* spectral layout options */

			// False for random, true for greedy sampling
			samplingType: true,
			// Sample size to construct distance matrix
			sampleSize: 25,
			// Separation amount between nodes
			nodeSeparation: 75,
			// Power iteration tolerance
			piTol: 0.0000001,

			/* incremental layout options */

			// Node repulsion (non overlapping) multiplier
			nodeRepulsion: node => 4500,
			// Ideal edge (non nested) length
			idealEdgeLength: edge => 50,
			// Divisor to compute edge forces
			edgeElasticity: edge => 0.45,
			// Nesting factor (multiplier) to compute ideal edge length for nested edges
			nestingFactor: 0.1,
			// Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
			numIter: 2500,
			// For enabling tiling
			tile: true,
			// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingVertical: 10,
			// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingHorizontal: 10,
			// Gravity force (constant)
			gravity: 0.25,
			// Gravity range (constant) for compounds
			gravityRangeCompound: 1.5,
			// Gravity force (constant) for compounds
			gravityCompound: 1.0,
			// Gravity range (constant)
			gravityRange: 3.8,
			// Initial cooling factor for incremental layout  
			initialEnergyOnIncremental: 0.3,

			/* constraint options */

			// Fix desired nodes to predefined positions
			// [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
			fixedNodeConstraint: undefined,
			// Align desired nodes in vertical/horizontal direction
			// {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
			alignmentConstraint: undefined,
			// Place two nodes relatively in vertical/horizontal direction
			// [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
			relativePlacementConstraint: undefined,

			/* layout event callbacks */
			ready: () => { }, // on layoutready
			stop: () => { }, // on layoutstop
			name: 'fcose',
		};
		this.cy.layout(defaultOptions).run(); //{name: 'fcose'}).run(); 
	}
	gridLayout() { this.cy.layout({ name: 'grid', animate: true }).run(); }
	presetLayout_dep() {
		let hasCenterProp = this.setPositionData();

		if (!hasCenterProp) {
			console.log('no positions are preset: store first!');
		} else {
			let options = {
				name: 'preset',
				positions: undefined, //function (n){return this.getNode(n.id()).data().center;}, //this.posDict, //undefined, // undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
				zoom: undefined, // the zoom level to set (prob want fit = false if set)
				pan: undefined, // the pan level to set (prob want fit = false if set)
				fit: true, // whether to fit to viewport
				padding: 30, // padding on fit
				animate: true, // whether to transition the node positions
				animationDuration: 500, // duration of animation in ms if enabled
				animationEasing: undefined, // easing of animation if enabled
				animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
				ready: undefined, // callback on layoutready
				stop: undefined, // callback on layoutstop
				transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
			};
			this.cy.layout(options);
			this.reset();
		}
	}
	presetLayout() {
		this.retrievePositions('prest');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
	}
	randomLayout() { this.cy.layout({ name: 'random', animate: 'true' }).run(); }
	klay() {
		let klayDefaults = {
			// Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
			addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
			aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
			borderSpacing: 20, // Minimal amount of space to be left to the border
			compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
			crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
			/* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
			INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
			/* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
			INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
			direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
			/* UNDEFINED, RIGHT, LEFT, DOWN, UP */
			edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
			edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
			feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
			fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
			/* NONE Chooses the smallest layout from the four possible candidates.
			LEFTUP Chooses the left-up candidate from the four possible candidates.
			RIGHTUP Chooses the right-up candidate from the four possible candidates.
			LEFTDOWN Chooses the left-down candidate from the four possible candidates.
			RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
			BALANCED Creates a balanced layout from the four possible candidates. */
			inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
			layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
			linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
			mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
			mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
			nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
			/* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
			LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
			INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
			/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
			LINEAR_SEGMENTS Computes a balanced placement.
			INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
			SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
			randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
			routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
			separateConnectedComponents: true, // Whether each connected component should be processed separately
			spacing: 20, // Overall setting for the minimal amount of space to be left between objects
			thoroughness: 7 // How much effort should be spent to produce a nice layout..
		};

		var options = {
			nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
			fit: true, // Whether to fit
			padding: 20, // Padding on fit
			animate: true, // Whether to transition the node positions
			animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
			animationDuration: 500, // Duration of animation in ms if enabled
			animationEasing: undefined, // Easing of animation if enabled
			transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
			ready: this.reset.bind(this), // Callback on layoutready
			stop: undefined, // Callback on layoutstop
			klay: {
				addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
				aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
				borderSpacing: 20, // Minimal amount of space to be left to the border
				compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
				crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
				cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
				direction: 'UNDEFINED', // Overall direction of edges: /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
				edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
				edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
				feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
				fixedAlignment: 'NONE', // node placer alignment: NONE | LEFTUP | RIGHTUP | LEFTDOWN | RIGHTDOWN | BALANCED
				inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
				layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
				linearSegmentsDeflectionDampening: 0.3,// 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
				mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
				mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
				nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering NETWORK_SIMPLEX (expensive!) | LONGEST_PATH | INTERACTIVE comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
				nodePlacement: 'INTERACTIVE', // Strategy for Node Placement BRANDES_KOEPF | LINEAR_SEGMENTS | INTERACTIVE | SIMPLE
				/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
				LINEAR_SEGMENTS Computes a balanced placement.
				INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
				SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
				randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
				routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
				separateConnectedComponents: true, // Whether each connected component should be processed separately
				spacing: 20, // Overall setting for the minimal amount of space to be left between objects
				thoroughness: 3 // How much effort should be spent to produce a nice layout..
			},
			name: 'klay',

			priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
		};
		this.cy.layout(options).run();
	}
	retrievePositions(key) {
		if (nundef(key)) key = 'prest';
		let di = this.posDict[key];
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = di[id];
			if (isdef(pos)) this.setPosition(id, pos.x, pos.y);
		}
	}
	storePositions(key, poslist = []) {
		//console.log('positions', poslist)
		if (nundef(key)) key = 'prest';
		this.posDict[key] = {};
		let i = 0;
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = valf(poslist[i], this.getPosition(id));
			i += 1;
			this.posDict[key][id] = pos;
		}
	}
	storeSizes(key, poslist = []) {
		if (nundef(key)) key = 'size';
		this.posDict[key] = {};
		let i = 0;
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = valf(poslist[i], this.getSize(id));
			i += 1;
			this.posDict[key][id] = pos;
		}
	}
	//#endregion

	//#region zoom pan fit center
	fit() { this.cy.fit(); }
	center() { this.cy.center(); } //console.log('bb:', this.cy.elements().bb()); }
	reset() { this.pan0(); this.zoom1(); this.center(); this.fit(); }
	pan0() { this.cy.pan({ x: 0, y: 0 }); }
	zoom1() { this.cy.zoom(1); }

	isPan() { return this.cy.panningEnabled(); }
	isZoom() { return this.cy.zoomingEnabled(); }
	enablePanZoom() { this.pan(true); this.zoom(true); }
	pan(isOn, reset = true) {
		this.cy.panningEnabled(isOn);
		this.cy.userPanningEnabled(isOn);
		if (!isOn && reset) { this.pan0(); this.center(); }
	}
	zoom(isOn, minZoom = .25, maxZoom = 1, reset = true) {
		this.cy.zoomingEnabled(isOn);
		this.cy.userZoomingEnabled(isOn);
		if (!isOn && reset) { this.zoom1(); this.center(); }
		else if (isOn) { this.cy.minZoom(minZoom); this.cy.maxZoom(maxZoom); }
	}
	//#endregion

	setSizeToContent() {
		this.cy.zoomingEnabled(false);
		this.updateBounds();

	}
	updateBounds() {
		var bounds = this.cy.elements().boundingBox();
		let dContainer = this.live.dCy;
		dContainer.css('height', bounds.h + 100);
		dContainer.css('width', bounds.w + 100);
		this.cy.center();
		this.cy.resize();
		//fix the Edgehandles
		dContainer.cytoscapeEdgehandles('resize');
	}

	//#region ui functions
	enableDD() { this.enableDragging(); }
	disableDD() { this.disableDragging(); }
	enableDragging() { this.cy.nodes().grabify(); }
	disableDragging() { this.cy.nodes().ungrabify(); }

	showGraph() { }
	showControls(dWhere, lWhich) {
		if (!this.hasControls) this.addLayoutControls(dWhere, lWhich);

		if (nundef(dWhere)) dWhere = iDiv(this);

	}
	showExtent() { let bb = this.cy.elements().bb(); console.log('graph size:', bb.w, bb.h); }
	showSize() { this.showExtent(); }
	hideGraph() { }
	hideControls() { }
	mount() { }
	unmount() { }

	//old API: weg damit!!!
	closeLayoutControls() { if (isdef(this.sb)) hide(this.sb); }
	addLayoutControls(dParent, buttonlist) {
		if (nundef(dParent)) dParent = iDiv(this);
		let buttons = {
			BFS: mButton('BFS', () => this.breadthfirst(), dParent, {}, ['tbb']),
			circle: mButton('circle', () => this.circle(), dParent, {}, ['tbb']),
			CC: mButton('CC', () => this.concentric(), dParent, {}, ['tbb']),
			cola: mButton('cola', () => this.comcola(), dParent, {}, ['tbb']),
			cose: mButton('cose', () => this.cose(), dParent, {}, ['tbb']),
			// dagre: mButton('dagre', () => this.dagre(), sb, {}, ['tbb']),
			euler: mButton('euler', () => this.euler(), dParent, {}, ['tbb']),
			fcose: mButton('fcose', () => this.fcose(), dParent, {}, ['tbb']),
			grid: mButton('grid', () => this.gridLayout(), dParent, {}, ['tbb']),
			klay: mButton('klay', () => this.klay(), dParent, {}, ['tbb']),
			prest: mButton('prest', () => this.presetLayout(), dParent, {}, ['tbb']),
			rand: mButton('rand', () => this.randomLayout(), dParent, {}, ['tbb']),
			center: mButton('center', () => this.center(), dParent, {}, ['tbb']),
			fit: mButton('fit', () => this.fit(), dParent, {}, ['tbb']),
			reset: mButton('reset', () => this.reset(), dParent, {}, ['tbb']),
			show: mButton('show', () => this.showGraph(), dParent, {}, ['tbb']),
			hide: mButton('hide', () => this.hideGraph(), dParent, {}, ['tbb']),
			store: mButton('store', () => this.storeCurrentPositions(), dParent, {}, ['tbb']),
		};
		for (const b in buttons) {
			if (isdef(buttonlist) && !buttonlist.includes(b)) hide(buttons[b]);
		}
		return buttons;
	}
	addVisual(dParent, styles = {}) {

		if (this.hasVisual) return;
		this.hasVisual = true;
		this.id = nundef(dParent.id) ? getUID() : dParent.id;
		// mIfNotRelative(dParent);

		let styleDict = {
			node: { 'width': 25, 'height': 25, 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
			edge: { 'width': 2, 'line-color': 'silver', 'curve-style': 'haystack', },
			'node.highlight': { 'background-color': 'yellow' },
			'node.trans': { 'opacity': '0.5' },
		}
		for (const ks of ['node', 'edge', 'node.highlight', 'node.trans']) {
			if (isdef(styles[ks])) {
				for (const k in styles[ks]) {
					let [prop, val] = translateToCssStyle(k, styles[ks][k], false);
					styleDict[ks][prop] = val;
				}
			}
		}
		let cyStyle = [];
		for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

		//let d1=
		let size = getSize(dParent);
		let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w, left: 0, top: 0, h: size.h, align: 'left' });
		// let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w - 80, left: 40, top: 0, h: size.h, align: 'left' });

		// // console.log('size',size)
		// // let dCy = mDiv(dParent, { position: 'absolute', left: 40, top: 0, w: 'calc( 100% - 80px )', h: '100%' });
		// // let dCy = mDiv(dParent, {display:'inline-block', position: 'absolute', left: 40, top: 0, w: size.w-80, h: size.h });
		this.cy.mount(d1);
		this.cy.style(cyStyle);
		// console.log('extent',g.cy.extent());
		this.enablePanZoom();
		iAdd(this, { div: dParent, dCy: d1 });
	}

	//#endregion

	//#region events
	nodeEvent(evname, handler) { this.cy.on(evname, 'node', ev => handler(ev.target)); }
	mStyle(elid, styles, group = 'node') {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		let di = translateStylesToCy(styles, group);
		for (const k in di) {
			// let css = mStyleTranslate(k, styles[k]);
			elid.style(k, di[k]);
		}

	}
	setLabel(id, label, styles) {
		let ele = this.cy.getElementById(id);
		ele.data('label', label);
		this.mStyle(id, styles, isdef(this.getNode(id)) ? 'node' : 'edge');

	}
	setStyle(elid, prop, val) {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		//console.log('elid', prop, val)
		elid.style(prop, val);
	}
	setClass(elid, className) {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		//console.log('elid', className, val)
		elid.class(className);
	}
	//#endregion
}
class MazeGraph extends AGraph {
	constructor(dParent, rows, cols, sz, gap = 4) {
		super();

		[this.cols, this.rows, this.sz, this.gap] = [cols, rows, sz, gap];
		let m = this.m = this.createMaze(cols, rows, sz, gap);
		let dMaze = this.dMaze = this.createDiv(dParent, cols, rows, sz, gap);

		let szMaze = getSize(dMaze);
		let dGraph = this.dGraph = mDiv(dParent, { align: 'left', w: szMaze.w, h: szMaze.h, bg: 'pink', maleft: 20 }, 'd_graph');//, opacity: 0 });
		this.mazeId = dGraph.id = getUID();

		let sb = this.sb = mDiv(dParent, { w: 40 }); mCenterCenterFlex(this.sb);
		hide(dGraph); hide(sb);

		this.items = this.createCellItems();
		//console.log('items', this.items)
	}
	clear() { super.clear(); } //dTable.firstChild.remove(); } //mBy(this.mazeId).remove();}
	getTopLeftCell() { return this.getCell(0, 0); }
	getTopRightCell() { return this.getCell(0, this.cols - 1); }
	getBottomLeftCell() { return this.getCell(this.rows - 1, 0); }
	getBottomRightCell() { return this.getCell(this.rows - 1, this.cols - 1); }

	getCell(row, col) { return this.matrix[row][col]; }// mBy(this.getCommonIdTable(row, col)); }
	getCommonId(row, col) { return '' + row + "-" + col; }
	getCommonIdTable(row, col) { return 'td_' + this.getCommonId(row, col); }
	getRCI(edgeId) {
		//edge id is of the form r1-c1_r2-c2
		let [r1, c1, r2, c2] = allNumbers(edgeId).map(x => Math.abs(x));	//console.log('r,c 1:',r1,c1,'\nr,c 2:',r2,c2);
		let i1, i2; //indices that have to be switched form 1 to 0
		i1 = r1 < r2 ? 2 : r1 > r2 ? 0 : c1 < c2 ? 1 : 3;
		i2 = i1 == 0 ? 2 : i1 == 1 ? 3 : i1 == 2 ? 0 : 1;
		return [r1, c1, i1, r2, c2, i2];
	}
	getRelativeDirections(item1, item2) {
		//edge id is of the form r1-c1_r2-c2
		let [r1, c1, r2, c2] = [item1.row, item1.col, item2.row, item2.col];//allNumbers(edgeId).map(x=>Math.abs(x));	//console.log('r,c 1:',r1,c1,'\nr,c 2:',r2,c2);
		let i1, i2; //indices that have to be switched form 1 to 0
		i1 = r1 < r2 ? 2 : r1 > r2 ? 0 : c1 < c2 ? 1 : 3;
		i2 = i1 == 0 ? 2 : i1 == 1 ? 3 : i1 == 2 ? 0 : 1;
		return [i1, i2];
	}
	createCellItems() {
		//each cellItem should contain: div:table td, sz, row, col, maze arr, id=idNode, idCell
		let items = [];
		this.matrix = [];
		for (let r = 0; r < this.rows; r++) {
			this.matrix[r] = [];
			for (let c = 0; c < this.cols; c++) {
				let id = this.getCommonId(r, c);
				let item = { id: id, nid: id, nodeId: id, cellId: this.getCommonIdTable(r, c), row: r, col: c, sz: this.sz, marr: this.m[r, c] };
				delete Items[id];
				iAdd(item, { div: mBy(this.getCommonIdTable(r, c)) });
				items.push(item);

				this.matrix[r][c] = item;
				//console.log('item', item)
			}
		}
		return items;
	}
	createDiv(dParent, cols, rows, sz, gap = 1) {
		let [wCell, hCell] = [sz, sz];
		let [wTotal, hTotal] = [cols * (wCell + gap) + gap, rows * (hCell + gap) + gap];
		let dGridOuter = this.dMaze = mDiv(dParent, { wmin: wTotal, hmin: hTotal, position: 'relative' });
		let m = this.m;
		let [x, y] = [0, 0];
		let sBorder = `${gap}px solid black`;
		let noBorder = `${gap}px solid transparent`;
		this.dCells = [];
		for (var r = 0; r < m.length; r++) {
			x = 0;
			this.dCells[r] = [];
			for (var c = 0; c < m[r].length; c++) {
				let info = m[r][c];
				let dCell = mDiv(dGridOuter, { w: wCell, h: hCell, position: 'absolute', top: y, left: x, bg: 'gray' });
				dCell.id = this.getCommonIdTable(r, c);
				dCell.style.borderTop = info[0] == 0 ? sBorder : noBorder;
				dCell.style.borderRight = info[1] == 0 ? sBorder : noBorder;
				dCell.style.borderBottom = info[2] == 0 ? sBorder : noBorder;
				dCell.style.borderLeft = info[3] == 0 ? sBorder : noBorder;
				x += wCell + gap;
				this.dCells[r].push(dCell);
			}
			y += hCell + gap;
		}
		return dGridOuter;
	}

	createDiv_orig(dParent, cols, rows, sz, gap) {
		let [wCell, hCell] = [sz, sz];
		let [wTotal, hTotal] = [cols * (wCell + gap), rows * (hCell + gap)];
		let dGridOuter = this.dMaze = mDiv(dParent, { wmin: wTotal, hmin: hTotal });

		let m = this.m;
		let id = 'tMaze';
		setCSSVariable('--wCell', `${wCell}px`);
		setCSSVariable('--hCell', `${hCell}px`);
		let tMaze = createElementFromHtml(`
			<table id="${id}">
			<tbody></tbody>
			</table>
		`);
		mAppend(dGridOuter, tMaze);
		// let sBorder = `${gap}px solid black`;
		let sBorder = `${1}px solid black`;
		for (var i = 0; i < m.length; i++) {
			$('#tMaze > tbody').append("<tr>");
			for (var j = 0; j < m[i].length; j++) {
				var selector = this.getCommonIdTable(i, j);
				$('#tMaze > tbody').append("<td id='" + selector + "'>&nbsp;</td>");
				if (m[i][j][0] == 0) { $('#' + selector).css('border-top', sBorder); }
				if (m[i][j][1] == 0) { $('#' + selector).css('border-right', sBorder); }
				if (m[i][j][2] == 0) { $('#' + selector).css('border-bottom', sBorder); }
				if (m[i][j][3] == 0) { $('#' + selector).css('border-left', sBorder); }
				//mStyle(mBy(selector), { bg: coin(30) ? 'random' : 'lightgreen' });
			}
			$('tMmaze > tbody').append("</tr>");
		}
		return dGridOuter;
	}
	createMaze(cols, rows, sz, gap) {
		// Establish variables and starting grid
		var dxy = sz + 2 * gap;
		var offs = dxy / 2 + gap;

		var totalCells = cols * rows;
		var cells = new Array();
		var unvis = new Array();
		for (var i = 0; i < rows; i++) {
			cells[i] = new Array();
			unvis[i] = new Array();
			for (var j = 0; j < cols; j++) {
				cells[i][j] = [0, 0, 0, 0];
				let pos = { x: offs + dxy * j, y: offs + dxy * i };
				this.addNode({ id: this.getCommonId(i, j), row: i, col: j, center: pos }, pos);
				unvis[i][j] = true;
			}
		}

		// Set a random position to start from
		var currentCell = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
		var path = [currentCell];
		unvis[currentCell[0]][currentCell[1]] = false;
		var visited = 1;

		// Loop through all available cell positions
		while (visited < totalCells) {
			// Determine neighboring cells
			var pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
			[currentCell[0], currentCell[1] + 1, 1, 3],
			[currentCell[0] + 1, currentCell[1], 2, 0],
			[currentCell[0], currentCell[1] - 1, 3, 1]];
			var neighbors = new Array();

			// Determine if each neighboring cell is in game grid, and whether it has already been checked
			for (var l = 0; l < 4; l++) {
				if (pot[l][0] > -1 && pot[l][0] < rows && pot[l][1] > -1 && pot[l][1] < cols && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
			}

			// If at least one active neighboring cell has been found
			if (neighbors.length) {
				// Choose one of the neighbors at random
				let next = neighbors[Math.floor(Math.random() * neighbors.length)];

				// Remove the wall between the current cell and the chosen neighboring cell
				cells[currentCell[0]][currentCell[1]][next[2]] = 1;
				cells[next[0]][next[1]][next[3]] = 1;

				let row = currentCell[0];
				let col = currentCell[1];
				let row2 = next[0];
				let col2 = next[1];
				this.addEdge(this.getCommonId(row, col), this.getCommonId(row2, col2), {});

				// Mark the neighbor as visited, and set it as the current cell
				unvis[next[0]][next[1]] = false;
				visited++;
				currentCell = [next[0], next[1]];
				path.push(currentCell);
			}
			// Otherwise go back up a step and keep going
			else {
				currentCell = path.pop();
			}
		}
		return cells;
	}

	setItemBorder(item, dir) {
		let prop = getBorderPropertyForDirection(dir);
		iDiv(item).style[prop] = `${this.gap}px solid black`;
	}
	setItemColor(item, color) { mStyle(iDiv(item), { bg: color }); }
	setItemContent(item, text) { iDiv(item).innerHTML = text; }
	removeItemContent(item) { iDiv(item).innerHTML = ''; }
	disconnectCells(nid1, nid2) {
		this.removeEdge(this.getCommonEdgeId(nid1, nid2));
		let [item1, item2] = [Items[nid1], Items[nid2]];
		//console.log('item1', item1, item2);

		let [dir1, dir2] = this.getRelativeDirections(item1, item2);
		// this.setItemColor(item1,'green');
		// this.setItemColor(item2,'lightgreen');
		//this.setItemContent(item1,'1');this.removeItemContent(item1);
		//console.log('directions:', dir1, dir2);
		this.setItemBorder(item1, dir1);
		this.setItemBorder(item2, dir2);
	}
	cutPath(path, min, max) {
		let edges = path.edges();
		let len = edges.length;
		let [imin, imax] = [Math.floor(len * min), Math.floor(len * max)];
		let i = randomNumber(imin, imax);
		let edge = edges[i];
		let [nid1, nid2] = edge.connectedNodes().map(x => x.id());
		this.disconnectCells(nid1, nid2);
	}

	breadCrumbs(path, color = 'sienna', sz = 10) {
		for (const cell of path.nodes().map(x => Items[x.id()])) {
			mCellContent(iDiv(cell), { w: sz, h: sz, bg: color, fg: 'white', rounding: '50%' });
		}
	}
	colorComponents() {
		let comps = this.getComponents();
		//get hue wheel!!!
		let wheel = getColorWheel('red', comps.length);
		//console.log('wheel', wheel)
		let i = 0;
		for (const comp of comps) {
			// this.breadCrumbs(comp, wheel[i], 20); i += 1;
			this.breadCrumbs(comp, wheel[i]); i += 1;
		}

	}
	showGraph() {
		this.dGraph.style.opacity = 1;
		if (this.hasVisual) { show(this.dGraph); return; }
		this.addVisual(this.dGraph);
		this.storeCurrentPositions();
		this.addLayoutControls(this.sb, ['show', 'hide', 'prest', 'grid', 'klay', 'rand', 'euler', 'reset', 'store']);//,'grid','euler','prest');		
		// setTimeout(() => {
		// 	this.comcola();
		// 	this.addLayoutControls(this.sb, ['cola', 'fit', 'prest', 'grid', 'klay', 'rand', 'euler', 'cose', 'reset', 'store']);//,'grid','euler','prest');
		// }, 2000);
	}
	hideGraph() {
		if (isdef(this.dGraph) && this.hasVisual) {
			//this.dGraph.style.opacity = 0;
			this.dGraph.style.display = 'none';
			// hide(this.dGraph);
		}
	}

}

function applyStyles(g, id, styles) { g.mStyle(id, styles, isdef(g.getNode(id)) ? 'node' : 'edge'); }
function setSymLabel(g, id, key, styles = {}) {
	if (nundef(Syms[key])) return;
	let info = Syms[key];
	console.log('family', info.family);
	g.setLabel(id, info.text, addKeys({ fz: 40, family: info.family }, styles));
}







//#endregion

//#endregion

//#region cards
Card.sz = 200;
function is_card(o) { return isdef(o.rank) || isdef(o.o) && isdef(o.o.rank); }
function show_card(dParent, key, type = 'aristo') {
	if (type == 'spotit') {
		Card.sz = 200;
		let [rows, cols, numCards, setName] = [3, 2, 2, valf(key, 'animals')];
		let infos = spotitDeal(rows, cols, numCards, setName); //backend
		let items = [];//frontend
		for (const info of infos) {
			let item = spotitCard(info, dParent, { margin: 10 }, spotitOnClickSymbol);
			mStyle(iDiv(item), { padding: 12 });
			items.push(item);
		}
	} else if (type == 'aristo') {
		let card = ari_get_card(valf(key, 'ASr'));
		mAppend(dParent, iDiv(card))
	}
}
function indexDiff(a, b, s) {
	let ia = s.indexOf(a);
	let ib = s.indexOf(b);
	console.log('index of', a, 'is', ia)
	console.log('index of', b, 'is', ib)
	//console.log('s',s,'diff',ia-ib);
	return ia - ib;
}

function sort_cards_orig(hand, bysuit = true, byrank = true) {
	let ranked = hand.map(x => ({ x: x, r: x[0], s: x[1] }));
	let rankstr = 'A23456789TJQK';

	if (bysuit && byrank) {
		sortByFunc(ranked, x => 3 * x.s.charCodeAt(0) + 2 * rankstr.indexOf(x.r));
	} else if (bysuit) {
		sortByFunc(ranked, x => x.s.charCodeAt(0));
	} else if (byrank) {
		sortByFunc(ranked, x => rankstr.indexOf(x.r));
	}

	//console.log('ranked',ranked)
	return ranked.map(x => x.x);

}

function set_card_constants(w, h, ranks, suits, deckletters, numjokers = 0, ovdeck = .25, ovw = '20%', ovh = '20%') {
	//koennte ich eine card haben die suit=Spade,
	Card = {};
	Card.sz = valf(h, 300);
	Card.h = h;
	Card.w = isdef(w) ? w : Card.sz * .7;
	Card.gap = Card.sz * .05;
	Card.ovdeck = ovdeck;
	Card.ovw = isString(ovw) ? Card.w * firstNumber(ovw) / 100 : ovw;
	Card.ovh = isString(ovh) ? Card.h * firstNumber(ovh) / 100 : ovh;
	Card.ranks = valf(ranks, '23456789TJQKA');
	Card.suits = valf(suits, 'SHDC');
	Card.decks = valf(deckletters, 'rb'); //colors of backside rbgyop (red,blue,green,yellow,orange,purple)
	Card.numdecks = deckletters.length;
	Card.numjokers = numjokers;
}

function deck_deal(deck, n) { return deck.splice(0, n); }
function deck_add(deck, n, arr) { let els = deck_deal(deck, n); els.map(x => arr.push(x)); return arr; }

function get_card_key52(R1 = '1', SB = 'B') {
	return `card_${Rank1}${SuitB}`;
}
function get_card_div(R1 = '1', SB = 'B') {
	//per default returns a facedown card
	let key52 = get_card_key52(R1, SB);
	let svgCode = C52['card_1B']; //joker:J1,J2, back:1B,2B
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	[w, h] = [isdef(w) ? w : Card.w, isdef(h) ? h : Card.sz];
	mSize(el, w, h);
	return el;
}

// inno card
function inno_card(dParent, keyOrName) {
	if (nundef(keyOrName)) keyOrName = chooseRandom(get_keys(InnoById));

	let cardInfo, name, key, id;
	if (isdef(InnoById[keyOrName])) { id = key = keyOrName; cardInfo = InnoById[id]; name = cardInfo.name; }
	else if (isdef(InnoByName[keyOrName])) { name = keyOrName; cardInfo = InnoByName[name]; id = key = cardInfo.id; };

	//console.log('card', cardInfo);

	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: Card.sz, h: Card.sz * .65, margin: 10 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), Card.sz / 5, cardInfo.exp[0] == 'A' ? Card.sz / 12 : Card.sz / 8, 4];

	let [dTitle, dMain] = cTitleArea(card, szTitle);
	//let fzTitle = cardInfo.exp[0] == 'A'? szTitle *.5 :szTitle*.7;
	let d = mAddContent(dTitle, name, {
		patop: 4, bg: sym.bg, fg: 'white', h: szTitle, fz: szTitle * .7, align: 'center',
		position: 'relative'
	});
	mAddContent(d, cardInfo.age, { hpadding: szTitle / 4, float: 'right' });
	let s = mSym(sym.key, d, { hpadding: szTitle / 4, h: szTitle * .7, fg: sym.fg, float: 'left' });

	let positions = ['tl', 'bl', 'bc', 'br'];
	for (let i = 0; i < 4; i++) {
		let r = cardInfo.resources[i];
		let pos = positions[i];
		if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
		else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
		else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
		else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
		else if (r == 'inspire') { innoInspire(cardInfo.inspire, dMain, sz, pos, margin); }
	}

	if (isdef(cardInfo.dogmas)) {

		let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin); //,{bg:'grey',alpha:.5, rounding:10});
		//console.log('box',box);
		mStyle(box, { align: 'left' });
		let text = '';
		for (const dog of cardInfo.dogmas) {
			//console.log('text', cardInfo.type, sym);
			let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : startsWith(dog, 'I compell') ? ('I <b>compell</b>' + dog.substring(8)) : dog;
			text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
		}
		let t2 = innoText(text);
		//box.onclick = (ev) => makeInfobox(ev, box, 2); //console.log('click!',ev.target);
		mFillText(t2, box);
		// mText(t2,box);
	} else if (isdef(cardInfo.res_city)) {
		let positions = ['tc', 'tr'];
		for (let i = 0; i < 2; i++) {
			let r = cardInfo.res_city[i];
			let pos = positions[i];
			if (r == 'flag') { innoFlag(cardInfo.type, dMain, sz, pos, margin); }
			else if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
			else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
			else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
			else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
			else if (r == 'inspire') { innoInspire(cardInfo.inspire, dMain, sz, pos, margin); }
			//else if (r == 'plus') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
		}

	}

	card.info = cardInfo;
	return card;
}

function inno_card_fixed_font(dParent, keyOrName) {
	if (nundef(keyOrName)) keyOrName = chooseRandom(get_keys(InnoById));

	let cardInfo, name, key, id;
	if (isdef(InnoById[keyOrName])) { id = key = keyOrName; cardInfo = InnoById[id]; name = cardInfo.name; }
	else if (isdef(InnoByName[keyOrName])) { name = keyOrName; cardInfo = InnoByName[name]; id = key = cardInfo.id; };

	//console.log('card', cardInfo);

	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: Card.sz, h: Card.sz * .65, margin: 10 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), Card.sz / 5, cardInfo.exp[0] == 'A' ? Card.sz / 12 : Card.sz / 8, 4];

	let [dTitle, dMain] = cTitleArea(card, szTitle);
	//let fzTitle = cardInfo.exp[0] == 'A'? szTitle *.5 :szTitle*.7;
	let d = mAddContent(dTitle, name, {
		patop: 4, bg: sym.bg, fg: 'white', h: szTitle, fz: szTitle * .7, align: 'center',
		position: 'relative'
	});
	mAddContent(d, cardInfo.age, { hpadding: szTitle / 4, float: 'right' });
	let s = mSym(sym.key, d, { hpadding: szTitle / 4, h: szTitle * .7, fg: sym.fg, float: 'left' });

	let positions = ['tl', 'bl', 'bc', 'br'];
	for (let i = 0; i < 4; i++) {
		let r = cardInfo.resources[i];
		let pos = positions[i];
		if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
		else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
		else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
		else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
	}
	let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin); //,{bg:'grey',alpha:.5, rounding:10});
	console.log('box', box);
	mStyle(box, { align: 'left', padding: 4 });
	let text = '';
	for (const dog of cardInfo.dogmas) {
		//console.log('text', cardInfo.type, sym);
		let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : startsWith(dog, 'I compell') ? ('I <b>compell</b>' + dog.substring(8)) : dog;
		text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
	}
	let t2 = innoText(text);
	//box.onclick = (ev) => makeInfobox(ev, box, 2); //console.log('click!',ev.target);
	//mFillText(t2, box);
	mText(t2, box, { fz: 10 });

	card.info = cardInfo;
	return card;
}
function innoAgeNumber(n, dParent, sz, pos, margin = 10) {
	let x = Card.sz * .04; sz -= x; //margin += x / 2;


	// let box = mDiv(dParent, { w: sz, h: sz, bg: 'beige', rounding: '50%', align: 'center' });
	//mPlace(box, pos, margin);
	let hOff = 0; //margin / 2;
	// let styles = { w: sz, h: sz, bg: 'beige', rounding: '50%', align: 'center' };
	let styles = { wmin: sz * 1.1, h: sz, bg: '#131313', align: 'center' };
	let box = mShape('hexFlat', dParent, styles); mPlace(box, pos, margin, margin - hOff / 2); //mPlace(box, pos, margin + hOff / 2, margin);
	s = mDiv(box, { fz: sz * .6, fg: 'white', display: 'inline-block' }, null, n);
	mPlace(s, 'cc'); //, 'vertical-align': 'text-top'  },null,n); 
	return box;
}
function innoBonusNumber(n, dParent, sz, pos, margin = 10) {
	let hOff = margin / 2;
	let styles = { w: sz, h: sz - hOff, bg: 'brown', box: true, align: 'center' };
	let box = mShape('circle', dParent, styles); mPlace(box, pos, margin + hOff / 2, margin);
	//let box = mDiv(dParent, { w: sz, h: sz, bg: 'brown', border:'5px double dimgray', box:true, rounding: '50%', align:'center'}); mPlace(box, pos, margin);
	let dText = mDiv(box, { fz: sz * .1, fg: 'black', 'line-height': sz * .1, matop: sz * .05 }, null, 'bonus');
	let dNum = mDiv(box, { fz: sz * .7, fg: 'black', 'line-height': sz * .65 }, null, n);
	return box;
}
function innoEcho(text, dParent, sz, pos, margin = 10) {
	if (isList(text)) text = text.join('<br>');
	//console.log('text',text); return;
	margin /= 2;
	sz += margin / 4;
	let box = mDiv(dParent, { w: sz, h: sz, bg: 'black', fg: 'white', rounding: 10 });
	mPlace(box, pos, margin);
	box.onclick = (ev) => makeInfobox(ev, box, 3);
	let t2 = innoText(text);
	mFillText(t2, box);
	return box;
}
function innoInspire(text, dParent, sz, pos, margin = 10) {
	if (isList(text)) text = text.join('<br>');
	//console.log('text',text); return;
	margin /= 2;
	sz += margin / 4;
	let box = mDiv(dParent, { w: sz, h: sz, bg: '#ffffff80', fg: 'black', rounding: 10 });
	mPlace(box, pos, margin);
	box.onclick = (ev) => makeInfobox(ev, box, 3);
	let t2 = innoText(text);
	mFillText(t2, box);
	return box;
}
function innoSym(key, dParent, sz, pos, margin = 10) {
	let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym[key].bg, rounding: 10 }); if (isdef(pos)) mPlace(box, pos, margin);
	s = mSym(INNO.sym[key].key, box, { sz: sz * .75, fg: INNO.sym[key].fg }, 'cc');
	return box;
}
function innoFlag(cardType, dParent, sz, pos, margin = 10) {
	let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym.flag.bg, rounding: 10 }); if (isdef(pos)) mPlace(box, pos, margin);
	s = mSym(INNO.sym.flag.key, box, { sz: sz * .75, fg: INNO.sym[cardType].bg }, 'cc');
	return box;
}
function innoText(text) {
	for (const s in INNO.sym) { INNO.sym[s].sym = Syms[INNO.sym[s].key]; }
	// console.log('INNO.sym', INNO.sym);
	// console.log('text', text);

	//words to replace:
	let parts = text.split('[');
	let s = parts[0];
	for (let i = 1; i < parts.length; i++) {
		let part = parts[i];
		let kw = stringBefore(part, ']');
		//console.log('kw', kw);
		let sp;
		let fz = Card.sz * .04;
		if (Object.keys(INNO.sym).includes(kw)) { let o = INNO.sym[kw]; sp = makeSymbolSpan(o.sym, o.bg, o.fg, fz * .9, '20%'); }
		else if (isNumber(kw)) { sp = makeNumberSpan(kw, '#232323', 'white', fz * .9, '20%'); }
		s += sp + stringAfter(part, ']');
	}
	// console.log('text', text, '\ns', s)
	return s;
}


// inno
function inno_calc_visible_syms(board, splays = {}) {
	//splayed color NOT IMPLEMENTED!
	let res = {};
	INNO.symNames.map(x => res[x] = 0);

	for (const color in board) {
		//console.log(board, splays)
		let res_color = inno_calc_visible_syms_pile(board[color], splays[color]);
		for (const k in res) { res[k] += res_color[k]; }
	}
	return res;
}
function inno_calc_visible_syms_pile(keys, dir) {
	let [cards, totals] = [keys.map(x => InnoById[x]), {}];
	INNO.symNames.map(x => totals[x] = 0);

	if (isEmpty(keys)) return totals;

	let top = cards.shift();
	for (const k of top.resources) {
		if (isdef(totals[k])) totals[k] += 1;
	}
	//console.log('sym count of top card', totals);
	if (nundef(dir) || dir == 0) return totals;

	//splayed color NOT IMPLEMENTED!
	if (dir == 1) {
		//left splay: all cards except top card count symbol resources[3], +TODO*** city symbols!

	} else if (dir == 2) {
		//right splay: all cards except top card count symbol resources[0]+[1], +TODO*** city symbols!
		for (const c of cards) {
			for (const k in totals) {
				if (c.resources[0] == k) totals[k]++;
				if (c.resources[1] == k) totals[k]++;
			}
		}
	}
	return totals;
}
//chronologisch:
function inno_get_object_keys(otree) {
	let keys = {}; for (const k in InnoById) keys[k] = true;
	for (const k of otree.plorder) keys[k] = true;
	for (const k of ['decks', 'board', 'splays', 'hand', 'green', 'purple', 'blue', 'red', 'yellow', 'forecast', 'scored', 'artifact', 'special_achievements', 'achievements']) keys[k] = true;
	let decknames = 'ABCEF';
	for (let i = 0; i < decknames.length; i++) { keys[decknames[i]] = true; }
	for (let age = 1; age <= 10; age++) { keys['' + age] = true; }
	return keys;
}

function inno_get_hand_actions(otree, uname) {
	let actions = [];
	otree[uname].hand.map(x => actions.push(`${uname}.hand.${x}`));
	return actions;
}
//helpers
function inno_get_basic_deck_age(otree, min_age) {
	for (let i = min_age; i <= 10; i++) {
		let deck = otree.decks.B[i];
		//console.log('age',i,'deck',deck);
		let len = deck.length;
		//console.log('basic deck age', i, 'has', deck.length);
		if (len > 0) return i;
	}
	return 11;
}
function inno_get_deck_age(otree, deck_letter, min_age = 1) {
	let deck_age = inno_get_basic_deck_age(otree, min_age);
	if (deck_letter == 'B') return deck_age;
	let deck = otree.decks[deck_letter][deck_age];
	while (deck_age <= 10 && isEmpty(deck)) { deck_age += 1; deck = otree.decks[deck_letter][deck_age]; }
	return deck_age;
}
function inno_get_player_age(otree, uname) {
	let top = inno_get_top_card_info(otree, uname);
	//console.log('top',top);
	let maxage = arrMinMax(top, x => x.age).max;
	//console.log('maxage of player top cards is',maxage);
	return maxage;
}
function inno_get_splay(otree, path) {
	let [uname, x, color, y] = path.split('.');
	let splay = otree[uname].splays[color];
	return splay;
}
function inno_get_top_card_actions(otree, uname) {
	let keys = inno_get_top_card_keys(otree, uname);
	// console.log('keys', keys);
	// for (const k of keys) { console.log(InnoById[k]); }
	let res = keys.map(x => `${uname}.board.${inno_get_cardinfo(x).color}.${x}`);
	return res;
}
function inno_get_top_card_info(otree, uname) { return inno_get_top_card_keys(otree, uname).map(x => inno_get_cardinfo(x)); }
function inno_get_top_card_keys(otree, uname) {
	let pl = otree[uname];
	let board = pl.board;
	let top = [];
	for (const k in board) { if (!isEmpty(board[k])) top.push(arrFirst(board[k])); }
	return top;
}
function inno_get_cardinfo(key) { return InnoById[key]; }
function inno_get_phase(iphase) { return INNO.phases[iphase].key; }
function inno_get_id(c) { return c.exp[0] + (c.age - 1) + c.color[0] + c.name[0] + c.name[1] + c.name[c.name.length - 1]; }
function inno_get_id(c) { return normalize_string(c.name); }//.toLowerCase().trim(); }
function inno_create_card_assets() {
	Dinno = { A: {}, B: {}, C: {}, E: {}, F: {} };

	InnoById = {}; // id is: exp[0] + age-1 + name[0]; for basic,echoes and artifacts this id is unique!
	InnoByName = {};
	for (const exp in Cinno) {
		for (const name in Cinno[exp]) {
			let c = Cinno[exp][name];
			c.name = name;
			c.exp = exp;
			let id = inno_get_id(c); //exp[0] + c.age - 1 + c.name[0];
			c.id = c.key = id;

			if (isdef(InnoById[id])) { console.log('duplicate id', id, InnoById[id].name, c.name); }
			InnoById[id] = c;

			let key_name = name.toLowerCase().trim();
			if (isdef(InnoByName[key_name])) console.log('duplicate name', name);
			InnoByName[key_name] = c;

			lookupAddToList(Dinno, [exp[0], c.age], c.id);
		}
	}
	//console.log('Decks', Dinno);
	//console.log('inno cards:',InnoById);
	//console.log('n', get_keys(InnoById));
}

function inno_stat_sym(key, n, dParent, sz) {
	let d = mDiv(dParent, { display: 'flex', dir: 'c', fz: sz });

	//let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym[key].bg, rounding: 10 },null,n); 
	let s = mSym(INNO.sym[key].key, d, { h: sz, fz: sz, fg: INNO.sym[key].fg });
	d.innerHTML += `<span>${n}</span>`;
	return d;
}
function inno_show_other_player_info(ev) {
	console.log('enter', ev.target);
	let id = evToId(ev);
	let g = Session;
	let plname = stringAfter(id, '_');
	let pl = firstCond(g.players, x => x.name == plname);
	console.log('player info for', pl);
}
function inno_present_board(dParent, board) {

	//let d = mDiv(dParent); //,{},null,'board');
	let dBoard = mDiv(dParent, {}, null, 'board');
	mFlex(dBoard);
	let boardItemLists = [];
	for (const color in board) {
		let cardlist = board[color];
		let d = mDiv(dBoard);
		let items = inno_present_cards(d, cardlist);
		boardItemLists.push(items);
	}
	return boardItemLists;
}
function inno_present_hand(dParent, hand) {
	//let d = mDiv(dParent); //,{},null,'board');
	let dHand = mDiv(dParent, {}, null, 'hand');
	mFlexWrap(dHand); mLinebreak(dHand);
	let handItems = inno_present_cards(dHand, hand);
	return handItems;
}
function inno_present_card(dParent, k) { let card = inno_card(dParent, k); card.key = card.info.key; return card; }
function inno_present_cards(dParent, keys) {
	let items = [];
	//console.log('keys',keys)
	for (const k of keys) {
		let card = inno_present_card(dParent, k);
		items.push(card);
	}
	return items;
}
function inno_shuffle_decks() {
	//console.log('Dinno.B[1]', Dinno.B[1]);
	for (const exp in Dinno) {
		for (const age in Dinno[exp]) {
			shuffle(Dinno[exp][age]);
		}
	}
	//console.log('Dinno.B[1]', Dinno.B[1]);
}
function inno_setup(player_names) {
	//einfachkeitshalber mach ich jetzt ein fen object und stringify
	//each player gets 2 cards

	inno_shuffle_decks();//shuffle all decks (remove to test deterministically)

	// make decks
	let pre_fen = {};
	let decks = pre_fen.decks = jsCopy(Dinno);

	// make achievement pile: from each Basic deck, remove 1
	pre_fen.achievements = [];
	for (const age in decks.B) { last_elem_from_to(decks.B[age], pre_fen.achievements); }

	//make special achievements
	pre_fen.special_achievements = ['monument', 'empire', 'world', 'wonder', 'universe', 'legend', 'repute', 'fame', 'glory', 'victory', 'supremacy', 'destiny', 'wealth', 'heritage', 'history'];


	//from each basic and echoes age=1 deck draw 1 card per player
	let pls = pre_fen.players = {};
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: [],
			board: { blue: [], red: [], green: [], yellow: [], purple: [] },
			splays: { blue: 0, red: 0, green: 0, yellow: 0, purple: 0 },
			achievements: [],
			scored: [],
			forecast: [],
			artifact: null
		};
		last_elem_from_to(deck1, pl.hand); last_elem_from_to(deck2, pl.hand);
	}

	//no! phase should be select_initial_card
	//fen.phase = 0;

	//fen.turn = jsCopy(player_names);
	pre_fen.plorder = jsCopy(player_names); //get_random_player_order(player_names);
	let fen = {
		players: pre_fen.players,
		decks: pre_fen.decks,
	};
	addKeys(pre_fen, fen);

	//sort pre_fen keys so wie ich es in der ui will!
	//console.log('keys von pre_fen',get_keys(pre_fen),get_keys(fen));

	return fen; //[player_names.map(x=>x),fen];
}

function spotitCard(info, dParent, cardStyles, onClickSym) {
	let styles = copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
	let card = cRound(dParent, cardStyles, info.id);
	addKeys(info, card);

	let d = iDiv(card);
	card.pattern = fillColarr(card.colarr, card.keys);

	// symSize: abhaengig von rows
	let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };

	let syms = [];
	mRows(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = onClickSym;
	}

	return card;
}
function spotitDeal(rows, cols, numCards, setName) {
	//deal cards (backend)
	let colarr = _calc_hex_col_array(rows, cols);
	let perCard = arrSum(colarr);

	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let keys = choose(oneWordKeys(KeySets[setName]), nShared + numCards * nUnique);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, i * nUnique + nUnique);
		//console.log('card unique keys:',card.keys);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr };
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
	return infos;

}
function spotitFindCardSharingSymbol(card, key) {
	let id = firstCondDict(card.shares, x => x == key);
	//console.log('found', id);
	return Items[id];
}
function spotitFindSymbol(card, key) { let k = firstCondDictKey(card.live, x => x == key); return card.live[k]; }
function spotitOnClickSymbol(ev) {

	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);

	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		console.log('clicked key', keyClicked, 'of card', id, item);
		if (Object.values(item.shares).includes(keyClicked)) {
			console.log('success!!!');//success!
			//find the card that shares this symbol!
			let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
			let cardSymbol = ev.target;
			let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
			//mach die success markers auf die 2 symbols!
			Selected = { success: true, feedbackUI: [cardSymbol, otherSymbol] };

		} else {
			console.log('fail!!!!!!!!'); //fail
			let cardSymbol = ev.target;
			Selected = { success: false, feedbackUI: [cardSymbol] };

		}
	}
}

function gSet_attributes() {
	const all_attrs = {
		shape: ['circle', 'triangle', 'square'],
		color: [RED, BLUE, GREEN],
		num: [1, 2, 3],
		shading: ['solid', 'empty', 'gradient'],
		background: ['white', 'grey', 'black'],
		text: ['none', 'letter', 'number'],
	};

	return all_attrs;
}
function get_random_attr_val(attr_list) {
	let all_attrs = gSet_attributes();
	return attr_list.map(x => chooseRandom(all_attrs[x]));
}
function draw_set_card(dParent, info, card_styles) {
	let card = cLandscape(dParent, card_styles);
	card.info = info;
	let d = iDiv(card);
	mCenterCenterFlex(d);
	let sz = card.sz / 2.8;
	let bg, shape = info.shape, text;
	switch (info.shading) {
		case 'solid': bg = info.color; break;
		case 'gradient': bg = `linear-gradient(${info.color}, silver)`; break;
		case 'empty': bg = `repeating-linear-gradient(
			45deg,
			${info.color},
			${info.color} 10px,
			silver 10px,
			silver 20px
		)`; break;

	}
	mStyle(d, { bg: info.background });
	switch (info.text) {
		case 'none': text = null; break;
		case 'letter': text = randomLetter(); break;
		case 'number': text = '' + randomDigit(); break;
	}
	let styles = { w: sz, h: sz, margin: sz / 10 };
	for (let i = 0; i < info.num; i++) {
		let d1 = drawShape(shape, d, styles);
		if (info.shading == 'gradient') { d1.style.backgroundColor = info.color; mClass(d1, 'polka-dot'); } else mStyle(d1, { bg: bg });
		if (shape == 'circle') console.log('circle', d1);
		if (isdef(text)) { mCenterCenterFlex(d1); mText(text, d1, { fz: sz / 1.75, fg: 'black', family: 'impact' }); }
	}
	//console.log('drawing info',info,'\nstyles',styles);
	return card;
}
function check_complete_set(fenlist) {
	if (fenlist.length != 3) return false;
	let [f1, f2, f3] = fenlist;
	console.log('set clicked', f1, f2, f3)
	for (let i = 0; i < f1.length; i++) {
		let [a, b, c] = [f1[i], f2[i], f3[i]];
		console.log('...set clicked', a, b, c)
		let correct = (a == b && b == c) || (a != b && b != c && a != c);
		if (!correct) return false;
	}
	return true;

}
function create_set_card(fen, dParent, card_styles) {
	let myinfo = info_from_fen(fen);
	let info = { shape: 'circle', color: BLUE, num: 1, shading: 'solid', background: 'white', text: 'none' };
	copyKeys(myinfo, info);
	// console.log('info', info);
	let card = draw_set_card(dParent, info, card_styles);
	card.fen = fen; //fen_from_info(info);
	return card;
}
function draw_set_card_test(dParent) {
	let card = cLandscape(dParent, { w: 120 });
	let d = iDiv(card, { h: '100%' });
	mCenterCenterFlex(d);
	let sz = card.sz / 4;
	let styles = { w: sz, h: sz, bg: `linear-gradient(${RED},black`, margin: sz / 10, border: `solid 3px ${GREEN}` };
	let d1 = drawShape('circle', d, styles); mCenterCenterFlex(d1); mText('A', d1, { fz: sz / 4, fg: 'white' });
	drawShape('circle', d, styles);
	drawShape('circle', d, styles);
}
function fen_from_info(info) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let fen = '';
	for (const prop of keys) {
		let val = info[prop];
		let i = all_attrs[prop].indexOf(val);
		fen += '' + i;
	}
	return fen;
}
function info_from_fen(fen) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let info = {};
	for (let i = 0; i < fen.length; i++) {
		let prop = keys[i];
		let val = all_attrs[prop][Number(fen[i])];
		info[prop] = val;
	}
	return info;
}
function make_set_deck(n_or_attr_list) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let n = isNumber(n_or_attr_list) ? n_or_attr_list : n_or_attr_list.length;
	let attrs = isNumber(n_or_attr_list) ? arrTake(keys, n) : n_or_attr_list;

	// 00 01 02 10 11 12
	//take a list, triple it and add 0,1,2 to the end of all elements
	let list = ['0', '1', '2']; //because each attribute has exactly 3 possible values
	let i = 1;
	while (i < n) {
		let [l1, l2, l3] = [jsCopy(list), jsCopy(list), jsCopy(list)];
		l1 = l1.map(x => '0' + x); l2 = l2.map(x => '1' + x); l3 = l3.map(x => '2' + x);
		list = l1.concat(l2).concat(l3);
		i++;
	}
	//console.log('list',list);
	return list;
}
function make_goal_set(deck, prob_different) {
	//make a random set: fen of 3 cards with each letter all same or all different to first
	let [fen1, fen2, fen3] = [deck[0], '', ''];  // 0102
	let n = fen1.length;
	let different = randomNumber(0, n - 1);

	for (let i = 0; i < n; i++) {
		let l1 = fen1[i];
		let same = i == different ? false : coin(prob_different);
		let inc = coin() ? 1 : -1;
		let [l2, l3] = same ? [l1, l1] : ['' + (3 + Number(l1) + inc * 1) % 3, '' + (3 + Number(l1) + inc * 2) % 3];
		fen2 += l2; fen3 += l3;
	}

	return [fen1, fen2, fen3];

}

// card splaying NEW!!!
function get_splay_word(nsplay) { return nsplay == 0 ? 'none' : nsplay == 1 ? 'left' : nsplay == 2 ? 'right' : dsplay == 3 ? 'up' : 'deck'; }
function get_splay_number(wsplay) { return wsplay == 'none' ? 0 : wsplay == 'left' ? 1 : wsplay == 'right' ? 2 : wsplay == 'up' ? 3 : 4; }
function mContainerSplay_WORKS(d, splay, w, h, num, ov) {
	//splay can be number(0,1,2,3) or word ('none','left','right','up')
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		d.style.height = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
		// d.style.display = 'grid'; ov = .5;
		// d.style.gridTemplateColums = `repeat(${num},${ov}px)`;
		// d.style.width = `${w + (num - 1)}px`;
	} else if (splay == 4) {
		//d.style.display = 'grid'; ov=.5;
		//d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.height = `${h + (num - 1) * (ov * 1.1)}px`;
		// d.style.display = 'grid'; ov = .5;
		// d.style.gridTemplateColums = `repeat(${num},${ov}px)`;
		// d.style.width = `${w + (num - 1)}px`;
	}
}
//changed w to minWidth...
function mContainerSplay(d, splay, w, h, num, ov) {
	//splay can be number(0,1,2,3,4) or word ('none','left','right','up','deck')
	if (nundef(splay)) splay = 2;
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		console.log('HAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOO')
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		let wnew = w + (num - 1) * (ov * 1.1);
		// console.log('setting min-width to',wnew)
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 5) { //lead card has wider splay than rest
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `${ov}px repeat(${num-1},${ov/2}px)`; //100px repeat(auto-fill, 100px)
		d.style.minWidth = `${w + (num) * (ov/2 * 1.1)}px`;
	} else if (splay == 4) {
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	}
}
function mItemSplay(item, list, splay, ov = .5) {
	if (!isNumber(splay)) splay = get_splay_number(splay);
	let d = iDiv(item);
	let idx = list.indexOf(item.key);
	if (splay == 4) {
		let offset = (list.length - idx) * ov;
		mStyle(d, { position: 'absolute', left: offset, top: offset }); //,Z:list.length - idx});
		d.style.zIndex = list.length - idx;
		// } else if (splay == 4) {
		// 	let offset = idx * ov; //(list.length-idx)*ov;
		// 	mStyle(d, { position: 'absolute', left: offset, top: offset });
	} else {
		d.style.zIndex = splay != 2 ? list.length - idx : 0;
	}
}


// card presentation
function cardPattern(n, sym) {
	//wie teilt man n symbols auf eine card auf (sz bei pik 8)
	let di = {
		1: [sym],
		2: [[sym], [sym]],
		3: [[sym], [sym], [sym]],
		4: [[sym, sym], [sym, sym]],
		5: [[sym, sym], [sym], [sym, sym]],
		6: [[sym, sym], [sym, sym], [sym, sym]],
		7: [[sym, sym], [sym, sym, sym], [sym, sym]],
		8: [[sym, sym, sym], [sym, sym], [sym, sym, sym]],
		9: [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]],
		10: [[sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym]],
		11: [[sym, sym, sym, sym], [sym, sym, sym], [sym, sym, sym, sym]],
		12: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		13: [[sym, sym, sym], [sym, sym], [sym, sym, sym], [sym, sym], [sym, sym, sym]],
		14: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		15: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
	};
	return di[n];
}
function cRound(dParent, styles = {}, id) {
	styles.w = valf(styles.w, Card.sz);
	styles.h = valf(styles.h, Card.sz);
	styles.rounding = '50%';
	return cBlank(dParent, styles, id);
}
function cLandscape(dParent, styles = {}, id) {
	if (nundef(styles.w)) styles.w = Card.sz;
	if (nundef(styles.h)) styles.h = styles.w * .65;
	return cBlank(dParent, styles, id);
}
function cPortrait(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;

	return cBlank(dParent, styles, id);
}
function cBlank(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';

	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;

	let d = mDiv(dParent, styles, id, null, 'card');
	//console.log('styles',styles)

	//return d;

	let item = mItem(null, { div: d }, { type: 'card', sz: sz, rounding: styles.rounding });
	copyKeys(styles, item);
	return item;
}
function cTitleArea(card, h, styles, classes) {
	let dCard = iDiv(card);

	let dTitle = mDiv(dCard, { w: '100%', h: h, overflow: 'hidden', upperRounding: card.rounding });
	let dMain = mDiv(dCard, { w: '100%', h: card.h - h, lowerRounding: card.rounding });
	iAdd(card, { dTitle: dTitle, dMain: dMain });
	if (isdef(styles)) mStyle(dTitle, styles);
	return [dTitle, dMain];

}
function makeInfobox(ev, elem, scale) {
	let t = ev.target; while (isdef(t) && t != elem) t = t.parentNode; if (nundef(t)) { console.log('WRONG click', ev.target); return; }
	//let t = ev.target; if (ev.target != elem) {console.log('WRONG click',ev.target); return;}

	//console.log('ok');
	let di = DA.infobox; if (isdef(di)) {
		let inner = di.innerHTML;
		//console.log('removing!');
		di.remove();
		DA.infobox = null;
		if (inner == elem.innerHTML) return;
	}
	let r = getRectInt(elem, dTable);
	let d = DA.infobox = mDiv(dTable, {
		bg: 'black', rounding: 10, fz: 24, position: 'absolute',
		w: r.w, h: r.h, left: r.l, top: r.t, transform: `scale(${scale})`
	}, 'dInfoBox', elem.innerHTML);
	d.innerHTML += '<div style="font-size:6px">click to close</div><br>';
	d.onclick = () => { d.remove(); DA.infobox = null; }
}
function makeNumberSpan(n, bg, fg, fz, rounding = '50%') {
	return `<span style='font-size:${fz}px;background:${bg};color:${fg};padding:0px 5px;border-radius:${rounding}'>${n}</span>`;
}
function makeSymbolSpan(info, bg, fg, fz, rounding = '50%') {

	//console.log('makeSymbol',bg,fg,fz,info);
	//let pad=info.key == 'white-tower'?

	let patop = Math.min(2, fz * .2);
	let pad = '5% 10%'; pad = '3px 5px'; pad = `${patop}px ${patop * 2}px`;
	if (info.key == 'queen-crown') pad = `${patop}px ${patop}px ${1}px ${patop}px`;
	else if (info.key == 'leaf') pad = `${1}px ${patop}px ${patop}px ${patop}px`;
	else if (info.key == 'white-tower') pad = `${patop}px ${patop * 2}px ${patop - 1}px ${patop * 2}px`;

	//return `<span style='background:${bg};padding:2px 10px;font-family:${info.family}'>${info.text}</span>`;
	// sp = `
	// <div style="display: inline-flex; place-content: center; flex-wrap: wrap; width: ${fz * 1.5}px; height: ${fz * 1.35}px;
	// 	font-size: ${fz}px; background: ${bg};color: ${fg}; border-radius: 50%;">
	// 	<div style="font-family: ${info.family}; font-size: ${fz}px;display: inline-block;">${info.text}</div>
	// </div>`;
	// return `<span style='line-height: 125%;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};padding:1px 7px;border-radius:${rounding}'>${info.text}</span>`;

	// return `<div style='box-sizing:border-box;padding:6px 7px 4px 7px;min-height:22px;display:inline-block;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};border-radius:${rounding}'>${info.text}</div>`;
	return `<div style='box-sizing:border-box;padding:${pad};min-height:${fz + 3}px;display:inline-block;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};border-radius:${rounding}'>${info.text}</div>`;
}
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToBox(info, w, h) {
	//console.log('mSymSizeToBox', w, h, '\ninfo:', info.w, info.h);
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	//console.log('fw', fw, '\nfh', fh, '\nf', f);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mPlaceText(text, where, dParent, styles, innerStyles, classes) {
	//where can be: [w,h,'tl'] or margins: [t,r,b,l]
	let box;
	if (where.length == 4) {
		let [t, r, b, l] = where;
		box = mBoxFromMargins(dParent, t, r, b, l);
	} else if (where.length == 3) {
		let [wb, hb, place] = where;
		box = mDiv(dParent, { w: wb, h: hb });
		mPlace(box, place);
	}
	let r = mMeasure(box);
	//text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);
	if (isdef(styles)) mStyle(box, styles);
	if (isdef(innerStyles)) mStyle(dText, innerStyles);
	if (isdef(classes)) mStyle(box, classes);
	return box;
}


function mFillText(text, box, padding = 10) {
	let r = mMeasure(box);
	console.log('r', r)
	//text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 12, r.w - padding, r.h - padding);
	//if (fz<18) fz=18;
	//console.log('res', fz,w,h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);
	//if (isdef(styles)) mStyle(box,styles);
	//if (isdef(innerStyles)) mStyle(dText,innerStyles);
	//if (isdef(classes)) mStyle(box,classes);
	return dText;

}

function mFillText(text, box, padding = 10, perleft = 10, pertop = 20) {
	let r = mMeasure(box);

	//text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 14, r.w - padding, r.h - padding);
	//if (fz<8) fz=8;
	//console.log('res', fz,w,h);

	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: `translate(-${perleft}%,-${pertop}%)`, top: `${pertop}%`, left: `${perleft}%`
	}, null, text);
	//if (isdef(styles)) mStyle(box,styles);
	//if (isdef(innerStyles)) mStyle(dText,innerStyles);
	//if (isdef(classes)) mStyle(box,classes);
	return dText;

}

function mRowsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });//,'align-items':'center'});
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0); 
			mColsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles); 
			akku.push(d1);
		}
	}
}
function mColsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' }); //,'align-items':'center'});
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0); //,null,randomName());
			mRowsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
		}
	}

}
function mContentX(content, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	let [key, scale] = isDict(content) ? [content.key, content.scale] : [content, 1];
	if (scale != 1) { styles.transform = `scale(${scale},${Math.abs(scale)})`; }
	let dResult = mDiv(dParent);
	let ds = isdef(Syms[key]) ? mSym(key, dResult, styles) : mDiv(dResult, styles, null, key);
	return dResult;
}
function mRows(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });//,'align-items':'center'});
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		// let d1=mDiv(d0,{bg:'random',h:randomNumber(30,80),w:'100%'},null,randomName());
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0); //,null,randomName());
			mCols(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
			// let d1 = mDiv(d0, { bg: 'random' }, null, content);
		}

	}
}
function mCols(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' }); //,'align-items':'center'});
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0); //,null,randomName());
			mRows(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
		}
	}

}
function mContent(content, dParent, styles) {
	let d1 = isdef(Syms[content]) ? mSymInDivShrink(content, dParent, styles) : mDiv(dParent, styles, null, content);
	return d1;
}
function mSymInDiv(sym, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	dResult = mDiv(dParent);
	//sym = chooseRandom(KeySets['animals-nature']); //SymKeys);
	ds = mSym(sym, dResult, styles);
	return dResult;
}
function mSymInDivShrink(sym, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	//console.log('**************************!!!!')
	dResult = mDiv(dParent);
	let ds = mSym(sym, dResult, styles);
	//console.log('ds',ds);
	let scale = chooseRandom([.5, .75, 1, 1.25]);
	//if (coin()) scale = -scale;
	let [scaleX, scaleY] = [coin() ? scale : -scale, scale];
	//console.log('sym', sym, scaleX, scaleY);
	if (coin()) ds.style.transform = `scale(${scaleX},${scaleY})`;
	return dResult;
}

// cgame.js

//convert from number to different kinds of decks: i stands for item
function i52(i) { return isList(i) ? i.map(x => Card52.getItem(x)) : Card52.getItem(i); }
function iFaceUp(item) { Card52.turnFaceUp(item); }
function iFaceDown(item) { Card52.turnFaceDown(item); }
function iFace(item, faceUp) { if (isdef(faceUp)) faceUp ? iFaceUp(item) : iFaceDown(item); }
function iResize52(i, h) { let w = h * .7; return iResize(i, w, h); }
function iTableBounds(i) { return iBounds(i, dTable); }

//presentation of items or item groups(=layouts)
function iAppend52(i, dParent, faceUp) {
	let item = i52(i);
	iFace(item, faceUp);
	mAppend(dParent, item.div);
	return item;
}
function iHand52(i) {
	let hand = iSplay(i, dTable);

}
function iSplay52(i, iContainer, splay = 'right', ov = 20, ovUnit = '%', createiHand = true, rememberFunc = true) {
	let ilist = !isList(i) ? i : [i];
	let items = isNumber(i[0]) ? i52(ilist) : ilist;
	let res = iSplay(items, iContainer, null, 'right', 20, '%', true);
	return res;
}
function netHandSize(nmax, hCard, wCard, ovPercent = 20, splay = 'right') {

	let isHorizontal = splay == 'right' || splay == 'left';
	if (nundef(hCard)) hCard = 110;
	if (nundef(wCard)) wCard = Math.round(hCard * .7);
	return isHorizontal ? { w: wCard + (nmax - 1) * wCard * ovPercent / 100, h: hCard } : { w: wCard, h: hCard + (nmax - 1) * hCard * ovPercent / 100 };
}
function iHandZone(dParent, styles, nmax) {
	if (nundef(styles)) styles = { bg: 'random', rounding: 10 };
	if (isdef(nmax)) {
		console.log('nmax', nmax)
		let sz = netHandSize(nmax);
		styles.w = sz.w;
		styles.h = sz.h;
	}
	//console.log('________________', styles)
	return mZone(dParent, styles);
}
function iSortHand(dParent, h) {
	let d = h.deck;
	//console.log(d.cards());
	d.sort();
	//console.log(d.cards());

	iPresentHand(dParent, h);
}
function iPresentHand(h, dParent, styles, redo = true) {
	//console.log('zone styles',styles)
	if (nundef(h.zone)) h.zone = iHandZone(dParent, styles); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		//console.log('items',items)
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iMakeHand(iarr, dParent, styles, id) {
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	iPresentHand(data, dParent, styles);
	return data;
}
function iRemakeHand(data) {
	let zone = data.zone;
	let deck = data.deck;

	let items = i52(deck.cards());
	clearElement(zone);
	data.iHand = iSplay(items, zone);
	return data;
}
function iH00_dep(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding, rounding: 10 });
	}
	//should return item={iarr,live.div,styles}
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	// iPresentHand_test(dParent, data);
	// return data;
	h = data;
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;

}
function iH01(iarr, dParent, styles, id, overlap) {
	function iH01Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding }); //, rounding: 10, bg:'blue' });
	}
	//should return item={iarr,live.div,styles}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH01Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone, {}, 'right', overlap);
	return h;

}
function iH00(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 7, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding }); //, rounding: 10, bg:'blue' });
	}
	//should return item={iarr,live.div,styles}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone);
	return h;

}
function iHandZone_test(dTable, nmax = 10, padding = 10) {
	let sz = netHandSize(nmax);
	//console.log('________________', sz)
	return mZone(dTable, { wmin: sz.w, h: sz.h, bg: 'random', padding: padding, rounding: 10 });
}
function iSortHand_test(dParent, h) {
	let d = h.deck;
	//console.log(d.cards());
	d.sort();
	//console.log(d.cards());

	iPresentHand_test(dParent, h);
}
function iPresentHand_test(dParent, h, redo = true) {
	if (nundef(h.zone)) h.zone = iHandZone_test(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iMakeHand_test(dParent, iarr, id) {
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	iPresentHand_test(dParent, data);
	return data;
}
function randomRank() { return Card52.randomRankSuit[0]; }
function randomSuit() { return Card52.randomRankSuit[1]; }
function randomC52() { return Card52.getShortString(randomCard52()); }
function randomCard52() { return Card52.random(); }

//animations of items or item groups(=layouts)
function anim1(elem, prop, from, to, ms) {
	if (prop == 'left') elem.style.position = 'absolute';
	if (isNumber(from)) from = '' + from + 'px';
	if (isNumber(to)) to = '' + to + 'px';
	// let kfStart={};
	// kfStart[prop]=from;
	// let kfEnd={};
	// kfEnd[prop]={};
	// elem.animate([{left: '5px'},{left: '200px'}], {
	// 	// timing options
	// 	duration: ms,
	// 	iterations: Infinity
	// });
}

class Card52 {
	static toString(c) { return c.rank + ' of ' + c.suit; }
	static _getKey(i) {
		if (i >= 52) return 'card_J1';
		let rank = Card52.getRank(i);
		let suit = Card52.getSuit(i);
		return 'card_' + rank + suit;

	}
	//returns index 0..51
	static _fromKey(k) {
		let ranks = 'A23456789TJQK';
		let suits = 'SHDC';
		//ex k='2H';
		let ir = ranks.indexOf(k[0]); //=> zahl zwischen 0 und 12
		let is = suits.indexOf(k[1]); //=> zahle zwischen 0 und 3
		//console.log(is)
		return is * 13 + ir;
	}
	static getRankValue(i) { if (nundef(i)) return null; let r = i % 13; return r == 0 ? 12 : r - 1; }
	static getRank(i) {
		let rank = (i % 13);
		if (rank == 0) rank = 'A';
		else if (rank >= 9) rank = ['T', 'J', 'Q', 'K'][rank - 9];
		else rank = rank + 1;
		return rank;
	}
	static getSuit(i) {
		let s = ['S', 'H', 'D', 'C'][divInt(i, 13)];
		//if (!'SHDC'.includes(s)) console.log('SUIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		return s;
	}
	static getShortString(c) { return c.suit + c.rank; }
	static turnFaceDown(c, color) {
		//console.log(c.faceUp)
		if (!c.faceUp) return;
		let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
		c.div.innerHTML = svgCode;
		if (isdef(color)) c.div.children[0].children[1].setAttribute('fill', color);
		c.faceUp = false;
	}
	static turnFaceUp(c) {
		if (c.faceUp) return;
		c.div.innerHTML = C52[c.key];
		c.faceUp = true;
	}
	static fromSR(sr, h) { return Card52.fromShortString(sr, h); }
	static fromShortString(sr, h) {
		//eg: getByShortString('HK')
		let key = sr[1].toUpperCase() + sr[0].toUpperCase();
		let i = Card52._fromKey(key);
		console.log('card from ', sr, 'is', key, 'i', i)
		return Card52.getItem(i, h);
	}
	static get(sr, h) { return Card52.fromSR(sr, h); }
	static getItem(i, h = 110, w) {
		//rank:A23456789TJQK, suit:SHDC, card_2H (2 of hearts)
		if (nundef(w)) w = h * .7;
		if (nundef(i)) i = randomNumber(0, 51);
		if (isString(i) && i.length == 2) { i = Card52._fromKey(i[1].toUpperCase() + i[0].toUpperCase()); }
		let c = Card52._createUi(i, undefined, w, h);
		c.i = c.val = i;
		return c;
	}
	static _createUi(irankey, suit, w, h) {
		//#region set rank and suit from inputs
		let rank = irankey;
		if (nundef(irankey) && nundef(suit)) {
			[rank, suit] = Card52.randomRankSuit();
		} else if (nundef(irankey)) {
			//face down card!
			irankey = '2';
			suit = 'B';
		} else if (nundef(suit)) {
			if (isNumber(irankey)) irankey = Card52._getKey(irankey);
			rank = irankey[5];
			suit = irankey[6];
		}
		//console.log('rank', rank, 'suit', suit); // should have those now!

		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase(); //joker:J1,J2, back:1B,2B
		//#endregion

		//#region load svg for card_[rank][suit] (eg. card_2H)
		let cardKey = 'card_' + rank + suit;
		let svgCode = C52[cardKey]; //C52 is cached asset loaded in _start
		// console.log(cardKey, C52[cardKey])
		svgCode = '<div>' + svgCode + '</div>';
		let el = mCreateFrom(svgCode);
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		//console.log('__________ERGEBNIS:',w,h)
		//#endregion

		return { rank: rank, suit: suit, key: cardKey, div: el, w: w, h: h, faceUp: true }; //this is a card!
	}
	static random() { return Card52.getItem(randomNumber(0, 51)); }
	static randomRankSuit() {
		//console.log(Object.keys(C52))
		let c = Card52.random();
		return [c.rank, c.suit];
	}
	static show(icard, dParent, h = 110, w = undefined) {
		if (isNumber(icard)) {
			if (nundef(w)) w = h * .7;
			icard = Card52.getItem(icard, h, w);
		}
		mAppend(dParent, icard.div);
	}
}

class DeckClass {
	constructor(f) { this.data = []; if (isdef(f)) if (isString(f)) this['init' + f](); else if (isList(f)) this.init(f); }
	init(arr) { this.data = arr; }
	initEmpty() { this.data = []; }
	initNumber(n, shuffled = true) { this.initTest(n, shuffled); }
	initTest(n, shuffled = true) { this.data = range(0, n - 1); if (shuffled) this.shuffle(); }
	init52(shuffled = true, jokers = 0) { this.data = range(0, 51 + jokers); if (shuffled) this.shuffle(); }
	init52_double(shuffled = true, jokers = 0) { this.data = range(0, 103 + jokers); if (shuffled) this.shuffle(); }
	init52_no_suits(n = 4, shuffled = true, jokers = 0) { this.data = range(0, 13 * n + jokers - 1); if (shuffled) this.shuffle(); }
	initRandomHand52(n) { this.data = choose(range(0, 51), n); }
	addTop(i) { this.data.push(i); return this; }
	addBottom(i) { this.data.unshift(i); return this; }
	bottom() { return this.data[0]; }
	cards() { return this.data; }
	count() { return this.data.length; }
	clear() { this.data = []; }
	deal(n) { return this.data.splice(0, n); }
	dealDeck(n) { let d1 = new DeckClass(); d1.init(this.data.splice(0, n)); return d1; }
	popTop() { return this.data.pop(); }
	popBottom() { return this.data.shift(); }
	remTop() { this.data.pop(); return this; }
	remBottom() { this.data.shift(); return this; }
	remove(i) { removeInPlace(this.data, i); return this; }
	removeAtIndex(i) { return this.data.splice(i, 1)[0]; }
	removeFromIndex(i, n) { return this.data.splice(i, n); }
	setData(arr, shuffled = false) { this.data = arr; if (shuffled) this.shuffle(); }
	sort() {
		//console.log('cards:', this.data.join(','));
		this.data.sort((a, b) => Number(a) - Number(b));
		//console.log('cards:', this.data.join(','));
		return this;
	}
	shuffle() { shuffle(this.data); return this; }
	top() { return arrLast(this.data); }
	toString() { return this.data.toString(); }//.join(','); }
}

//das sind cards die belibige RANKZ SUITZ symbols, colors haben koennen
class Cardz {
	static toString(c) { return c.rank + ' of ' + c.suit; }
	static _getKey(i) {
		if (i >= 52) return 'card_J1';
		let rank = Card52.getRank(i);
		let suit = Card52.getSuit(i);
		return 'card_' + rank + suit;

	}
	//returns index 0..51
	static _fromKey(k) {
		let ranks = 'A23456789TJQK';
		let suits = 'SHDC';
		//ex k='2H';
		let i_rank = ranks.indexOf(k[0]); //=> zahl zwischen 0 und 12
		let i_suit = suits.indexOf(k[1]); //=> zahle zwischen 0 und 3
		//console.log(is)
		return i_suit * ranks.length + i_rank;
	}
	static getRankValue(i) { if (nundef(i)) return null; let r = i % 13; return r == 0 ? 12 : r - 1; }
	static getRank(i) {
		let rank = (i % 13);
		if (rank == 0) rank = 'A';
		else if (rank >= 9) rank = ['T', 'J', 'Q', 'K'][rank - 9];
		else rank = rank + 1;
		return rank;
	}
	static getSuit(i) {
		let s = ['S', 'H', 'D', 'C'][divInt(i, 13)];
		//if (!'SHDC'.includes(s)) console.log('SUIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		return s;
	}
	static getShortString(c) { return c.suit + c.rank; }
	static turnFaceDown(c, color) {
		//console.log(c.faceUp)
		if (!c.faceUp) return;
		let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
		c.div.innerHTML = svgCode;
		if (isdef(color)) c.div.children[0].children[1].setAttribute('fill', color);
		c.faceUp = false;
	}
	static turnFaceUp(c) {
		if (c.faceUp) return;
		c.div.innerHTML = C52[c.key];
		c.faceUp = true;
	}
	static fromSR(sr) { return Card52.fromShortString(sr); }
	static fromShortString(sr) {
		//eg: getByShortString('HK')
		let key = sr[1].toUpperCase() + sr[0].toUpperCase();
		let i = Card52._fromKey(key);
		console.log(key, 'i', i)
		return Card52.getItem(i);
	}
	static getItem(i, h = 110, w) {
		//rank:A23456789TJQK, suit:SHDC, card_2H (2 of hearts)
		if (nundef(w)) w = h * .7;
		if (nundef(i)) i = randomNumber(0, 51);
		if (isString(i) && i.length == 2) { i = Card52._fromKey(i[1].toUpperCase() + i[0].toUpperCase()); }
		let c = Card52._createUi(i, undefined, w, h);
		c.i = c.val = i;
		return c;
	}
	static _createUi(irankey, suit, w, h) {
		//#region set rank and suit from inputs
		let rank = irankey;
		if (nundef(irankey) && nundef(suit)) {
			[rank, suit] = Card52.randomRankSuit();
		} else if (nundef(irankey)) {
			//face down card!
			irankey = '2';
			suit = 'B';
		} else if (nundef(suit)) {
			if (isNumber(irankey)) irankey = Card52._getKey(irankey);
			rank = irankey[5];
			suit = irankey[6];
		}
		//console.log('rank', rank, 'suit', suit); // should have those now!

		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase(); //joker:J1,J2, back:1B,2B
		//#endregion

		//#region load svg for card_[rank][suit] (eg. card_2H)
		let cardKey = 'card_' + rank + suit;
		let svgCode = C52[cardKey]; //C52 is cached asset loaded in _start
		// console.log(cardKey, C52[cardKey])
		svgCode = '<div>' + svgCode + '</div>';
		let el = mCreateFrom(svgCode);
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		//console.log('__________ERGEBNIS:',w,h)
		//#endregion

		return { rank: rank, suit: suit, key: cardKey, div: el, w: w, h: h, faceUp: true }; //this is a card!
	}
	static random() { return Card52.getItem(randomNumber(0, 51)); }
	static randomRankSuit() {
		//console.log(Object.keys(C52))
		let c = Card52.random();
		return [c.rank, c.suit];
	}
	static show(icard, dParent, h = 110, w = undefined) {
		if (isNumber(icard)) {
			if (nundef(w)) w = h * .7;
			icard = Card52.getItem(icard, h, w);
		}
		mAppend(dParent, icard.div);
	}
}
class Deck1 extends Array {
	initTest(n, shuffled = true) { range(0, n).map(x => this.push(Card52.getItem(x))); if (shuffled) this.shuffle(); }
	initEmpty() { }
	init52(shuffled = true, jokers = 0) {
		range(0, 51 + jokers).map(x => this.push(Card52.getItem(x)));
		//this.__proto__.faceUp = true;
		//console.log(this.__proto__)
		if (shuffled) this.shuffle();
	}
	add(otherDeck) { while (otherDeck.length > 0) { this.unshift(otherDeck.pop()); } return this; }
	count() { return this.length; }
	static transferTopFromToBottom(d1, d2) { let c = d1.pop(); d2.putUnderPile(c); return c; }
	deal(n) { return this.splice(0, n); }
	getIndices() { return this.map(x => x.i); }
	log() { console.log(this); }
	putUnderPile(x) { this.push(x); }
	putOnTop(x) { this.unshift(x); }
	showDeck(dParent, splay, ovPercent = 0, faceUp = undefined, contStyles = {}) {
		//console.log('aaaaaaaaaaaaaaaaaaaaaaaaa')
		if (isdef(faceUp)) { if (faceUp == true) this.turnFaceUp(); else this.turnFaceDown(); }
		// splayout(this, dParent, {bg:'random',padding:0}, ovPercent, splay);
		splayout(this, dParent, contStyles, ovPercent, splay);
	}
	shuffle() { shuffle(this); }
	topCard() { return this[this.length - 1]; }
	turnFaceUp() {
		if (isEmpty(this) || this[0].faceUp) return;
		//if (this.__proto__.faceUp) return;
		this.map(x => Card52.turnFaceUp(x));
		//this.__proto__.faceUp = true;
	}
	turnFaceDown() {
		if (isEmpty(this) || !this[0].faceUp) return;
		//if (!this.__proto__.faceUp) return;
		//console.log(this[0])
		this.map(x => Card52.turnFaceDown(x));
		//this.__proto__.faceUp = false;
	}
}

function splayout(elems, dParent, w, h, x, y, overlap = 20, splay = 'right') {
	function splayRight(elems, d, x, y, overlap) {
		//console.log('splayRight', elems, d)
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x += overlap;
		}
		return [x, y];
	}
	function splayLeft(elems, d, x, y, overlap) {
		x += (elems.length - 2) * overlap;
		let xLast = x;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x -= overlap;
		}
		return [xLast, y];
	}

	function splayDown(elems, d, x, y, overlap) {
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y += overlap;
		}
		return [x, y];
	}
	function splayUp(elems, d, x, y, overlap) {
		y += (elems.length - 1) * overlap;
		let yLast = y;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y -= overlap;
		}
		return [x, yLast];
	}

	if (isEmpty(elems)) return { w: 0, h: 0 };

	mStyle(dParent, { display: 'block', position: 'relative' });

	//phase 4: add items to container
	[x, y] = (eval('splay' + capitalize(splay)))(elems, dParent, x, y, overlap);

	let isHorizontal = splay == 'right' || splay == 'left';
	let sz = { w: (isHorizontal ? (x - overlap + w) : w), h: (isHorizontal ? h : (y - overlap + h)) };

	return sz;

}


// containers.js
var BG_CARD_BACK = randomColor();

function cardZone(dParent, o, flex = 1, hmin = 170) {
	let dOuter = mDiv(dParent, { bg: o.color, fg: 'contrast', flex: flex, hmin: hmin }, 'd' + o.name, o.name);
	let dInner = mDiv(dOuter);
	mFlex(dInner); dInner.style.alignContent = 'flex-start';
	return dInner;
}

function gameItem(name, color) { return mItem(name2id(name), null, { color: isdef(color) ? color : randomColor(), name: name }); }
function id2name(id) { id.substring(2).split('_').join(' '); }
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function giRep(gi, dParent, styles, shape, prefix, content) {
	gi = isString(gi) ? gi[1] == '_' ? Items[gi] : Items[name2id(gi)] : gi;
	let id = gi.id;
	let name = gi.name;
	let d = mShape(shape, dParent, styles);
	d.id = (isdef(prefix) ? prefix : '') + id;
	let key = isdef(prefix) ? prefix : 'div';
	d.innerHTML = content;
	//was macht iAdd?
	let di = {}; di[key] = d; iAdd(gi, di);
	return d;
}

function aristoUi(dParent, g) {
	clearTable();
	let d1 = mDiv(dParent, { w: '100%' }); mFlex(d1, 'v');
	let dWorld = mDiv(d1, { bg: 'random', hmin: 170, flex: 1 });
	mFlex(dWorld);
	iAdd(g.me, { div: cardZone(d1, g.me, 2) });

	let others = g.others;
	//console.log('others', others);
	for (let i = 0; i < others.length; i++) {
		let pl = others[i];
		iAdd(pl, { div: cardZone(d1, pl) });
	}

	for (const o of [g.draw_pile, g.market, g.buy_cards, g.discard_pile]) { iAdd(o, { div: cardZone(dWorld, o) }); }

	//was hab ich hier? for each player, have d[NAME] thaths all
	//was will ich jetzt?
	for (const name of ['draw_pile', 'market', 'buy_cards', 'discard_pile']) { g[name + 'Items'] = showCards(g[name]); }

	//g.me.handItems = showCards({ div: iDiv(g.me), type: 'hand', cards: g.me.hand });

	for (const pl of g.allPlayers) {
		pl.handItems = showCards({ div: iDiv(pl), type: pl == g.me ? 'hand' : 'handHidden', cards: pl.hand });
		if (isdef(pl.stall)) pl.stallItems = showCards({ div: iDiv(pl), type: g.stallsHidden ? 'cardsHidden' : 'cards', cards: pl.stall });
		if (isdef(pl.buildings)) {
			for (const building of pl.buildings) {
				let bItem = showCards({ div: iDiv(pl), type: 'hand', cards: building });
				// let bItem = showCards({ div: iDiv(pl), type: pl==g.me?'hand':'handHidden', cards: building });
				lookupAddToList(pl, ['buildingItems'], bItem);
			}
		}
	}
}

function showCards(o, type) {
	//in ddraw_pile, present draw_pile (arr of numbers 0 to 103)
	let d2 = iDiv(o);
	if (nundef(type)) type = isdef(o.type) ? o.type : 'hand';
	let arr = type == 'deck' ? o.deck.cards() : o.cards;
	let cont = type == 'deck' ? stdDeckContainer(d2, arr.length) : startsWith(type, 'cards') ? stdCardsContainer(d2, arr.length) : stdHandContainer(d2, arr.length);
	let items = arr.map(x => Card52.getItem(x % 52));
	if (endsWith(type, 'Hidden') || type == 'deck') items.map(x => Card52.turnFaceDown(x, BG_CARD_BACK));
	items.map(x => mAppend(cont, iDiv(x)));
	return items;
}

function stdRowOverlapContainer(dParent, n, wGrid, wCell, styles) {
	addKeys({
		w: wGrid,
		gap: 0,
		display: 'inline-grid',
		'grid-template-columns': `repeat(${n}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdColOverlapContainer(dParent, n, wGrid, wCell, styles) {
	addKeys({
		h: wGrid,
		gap: 0,
		display: 'inline-grid',
		'grid-template-rows': `repeat(${n}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdDeckContainer(dParent, n, ov = .25, styles = {}) { return stdRowOverlapContainer(dParent, n, 140, ov, addKeys({ padding: 10 }, styles)); }
function stdCardsContainer(dParent, n, ov = 80, styles = {}) { return stdRowOverlapContainer(dParent, n, n * ov + 22, ov, addKeys({ paleft: 20, patop: 10 }, styles)); }
function stdHandContainer(dParent, n, ov = 20, styles = {}) { return stdRowOverlapContainer(dParent, n, 76 + n * ov + 22, ov, addKeys({ padding: 10 }, styles)); }



function stdGridContainer(dParent, wCell, styles = {}) {
	addKeys({
		wmax: 500,
		margin: 'auto',
		padding: 10,
		gap: 0,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${20}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdRowsColsContainer(dParent, cols, styles = {}) {
	addKeys({
		margin: 'auto',
		padding: 10,
		gap: 10,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${cols}, 1fr)`
	}, styles);
	return mDiv(dParent, styles);
}
// cardM.js old code!
function mSymFramed(info, bg, sz) {
	let [w, h, fz] = [sz, sz, sz * .7];
	return mCreateFrom(`<div style='
	text-align:center;display:inline;background-color:${bg};
	font-size:${fz}px;overflow:hidden;
	font-family:${info.family}'>${info.text}</div>`);
}



// svg zeug
function mgPos(card, el, x = 0, y = 0, unit = '%', anchor = 'center') {
	mAppend(iG(card), el);
	let box = el.getBBox();
	console.log('rect', box);
	// if (unit == '%'){
	// 	x=x*card.w/100;
	// 	y=y*card.h/100;
	// }
	// if (anchor == 'center'){
	// 	let [w, h] = [box.width, box.height];
	// 	console.log('w',w,'h',h)
	// 	x -= w/2;
	// 	y -= h/2;
	// }
	el.setAttribute('x', x);
	el.setAttribute('y', y);
}
function mgSize(el, h, w) {
	el.setAttribute('height', h);
	if (isdef(w)) el.setAttribute('width', w);
}
function mgSuit(key) {
	// let svg=gCreate('svg');
	let el = gCreate('use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
	return el;
	// mAppend(svg,el);
	// return svg;
}
function mgSym(key) {
	let el = gCreate('text');
	let info = Syms[key];
	mStyle(el, { family: info.family });
	el.innerHTML = info.text;
	return el;
}
function mgShape(key) {

}

function mgSuit1(card, key, h, x, y) {
	//let el = useSymbol(key, h, x, y);
	el = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${key}`);
	el.setAttribute('height', h);
	el.setAttribute('width', h);
	el.setAttribute('x', x);
	el.setAttribute('y', y);

	mAppend(iG(card), el);
	return el;

	// let p=iG(card);
	// //p.innerHTML += el.innerHTML;
	// el = mCreateFrom(el);
}
function useSymbolElemNO(key = 'Treff', h = 50, x = 0, y = 0) {
	return mCreateFrom(`<use xlink:href="#${key}" height="${h}" x="${x}" y="${y}"></use>`);
}


function fitSvg(el) {
	const box = el.querySelector('text').getBBox();
	el.style.width = `${box.width}px`;
	el.style.height = `${box.height}px`;
}
function cBlankSvg(dParent, styles = {}) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';

	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;

	let d = mDiv(dParent, styles, null, null, 'card');
	let svg = mgTag('svg', d, { width: '100%', height: '100%' }); //,background:'transparent'});
	let g = mgTag('g', svg);
	//let sym = mSymFramed(Syms['bee'], 'skyblue', sz / 4); mAppend(d, sym);

	let item = mItem(null, { div: d, svg: svg, g: g }, { type: 'card', sz: sz });
	copyKeys(styles, item);
	return item;
}




//hier kann man jede belibige card anfertigen lassen!
function mSymbol(key, dParent, sz, styles = {}) {

	console.log('key', key)
	let info = symbolDict[key];

	//ich brauche einen size der macht dass das symbol in sz passt
	fzStandard = info.fz;
	hStandard = info.h[0];
	wStandard = info.w[0];

	//fzStandard/fz = hStandard/sz= wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;

	let fzMax = fzStandard * sz / Math.max(hStandard, wStandard);
	fzMax *= .9;


	let fz = isdef(styles.fz) && styles.fz < fzMax ? styles.fz : fzMax;

	let wi = wStandard * fz / 100;
	let hi = hStandard * fz / 100;
	let vpadding = 2 + Math.ceil((sz - hi) / 2); console.log('***vpadding', vpadding)
	let hpadding = Math.ceil((sz - wi) / 2);

	let margin = '' + vpadding + 'px ' + hpadding + 'px'; //''+vpadding+'px '+hpadding+' ';

	let newStyles = deepmergeOverride({ fz: fz, align: 'center', w: sz, h: sz, bg: 'white' }, styles);
	newStyles.fz = fz;
	let d = mDiv(dParent, newStyles);

	console.log(key, info)
	//let fz=sz;
	//if (isdef(styles.h)) styles.fz=info.h[0]*
	let txt = mText(info.text, d, { family: info.family });

	console.log('-----------', margin, hpadding, vpadding);
	mStyle(txt, { margin: margin, 'box-sizing': 'border-box' });

	return d;
}

function fitFont(text, fz = 20, w2 = 200, h2 = 100) {
	let e1, e2, r1, r2;
	e1 = mDiv(dTable, { w: w2, h: h2, display: 'inline-block' });
	do {
		e2 = mDiv(e1, { fz: fz, display: 'inline-block' }, null, text);
		r1 = getRect(e1);
		r2 = getRect(e2);
		e2.remove();
		//console.log('e1', r1.w, r1.h, 'e2', r2.w, r2.h, 'fz',fz);
		fz -= 1;
	} while (r1.w * r1.h < r2.w * r2.h);
	e1.remove();

	return [fz + 1, r2.w, r2.h];

}
function fitFont(text, fz = 20, w2 = 200, h2 = 100) {
	let e1, e2, r1, r2;
	e1 = mDiv(dTable, { w: w2, h: h2, display: 'inline-block' });
	do {
		e2 = mDiv(e1, { fz: fz, display: 'inline-block' }, null, text);
		r1 = getRect(e1);
		r2 = getRect(e2);
		e2.remove();
		//console.log('e1', r1.w, r1.h, 'e2', r2.w, r2.h, 'fz',fz);
		fz -= 1;
	} while (r1.w * r1.h < r2.w * r2.h);
	e1.remove();

	return [fz + 1, r2.w, r2.h];

}

function makeInnoSymbolDiv(info, bg, fz = 20) {

	return `<div style='text-align:center;display:inline;background-color:${bg};width:40px;padding:2px ${fz / 2}px;
	font-size:${fz}px;font-family:${info.family}'>${info.text}</div>`;
}
function makeInnoNumberDiv(n, fz) {
	return `<span style='background:white;color:black;padding:2px 10px;border-radius:50%'>${n}</span>`;
}
function mSymInline(key, dParent, styles) {
	let info = Syms[key];
	styles.family = info.family;
	let el = mSpan(dParent, styles, null, info.text);
	return text;
}
function innoSymInline(key, dParent) {
	//let box = mSpan(dParen,bg: INNO.sym[key].bg, rounding: 10t, { bg: INNO.sym[key].bg, rounding: 10 }); mPlace(box, pos, 10);

	s = mSymInline(INNO.sym[key].key, dParent, { fg: INNO.sym[key].fg, bg: INNO.sym[key].bg, rounding: 10 });
	return s;
}


function cardInno1(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));

	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 100 * f, 8 * f, 100 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));

	//key = 'Flight';
	let info = Cinno[key];
	info.key = key;

	let cdict = { red: RED, blue: 'royalblue', green: 'green', yellow: 'yelloworange', purple: 'indigo' };
	info.c = getColorDictColor(cdict[info.color]);

	//make empty card with dogmas on it
	let d = mDiv();
	mSize(d, w, h);
	//let szSym = 50; let fz = szSym * .8;

	mStyle(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		//console.log(dog);
		let text = replaceSymbols(dog);
		let d1 = mText(text, d); //,{mabot:14});
		d1.style.marginBottom = '' + vGapTxt + 'px';
		//mLinebreak(d);
	}
	let syms = []; let d1;
	szSym -= gap;
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const s in sdict) { sdict[s].sym = Syms[sdict[s].k]; }

	for (const sym of info.resources) {
		let isEcho = false;
		if (sym == 'None') {
			//einfach nur das age als text
			//console.log('age of card:', info.age)
			//mTextFit(text, { wmax, hmax }, dParent, styles, classes)
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered');
		} else if (sym == 'echo') {
			let text = info.echo;
			console.log('info.echo', info.echo);
			if (isList(info.echo)) text = info.echo[0];
			text = replaceSymbols(text);
			//console.log('Echo!!! info', info);
			wEcho = szSym;
			let [w1, h1, w2, h2] = [wEcho, szSym, wEcho - 8, szSym - 8];
			d1 = mDiv(d, { display: 'inline', fg: 'white', bg: 'dimgray', rounding: 6, h: h1, w: w1 });
			let [bestFont, w3, h3] = fitFont(text, 20, w2, h2);
			let d2 = mDiv(d1, { w: w3, h: h3, fz: bestFont }, null, text);
			mCenterCenterFlex(d1);
			isEcho = true;
		} else if (isNumber(sym)) {
			d1 = mDiv(d, { fz: fz * .75, fg: 'white', bg: 'brown', border: '2px solid black', rounding: '50%', display: 'inline' });
			mCenterCenterFlex(d1);
			let d2 = mText('' + info.age, d1, {});
		} else {
			let key = sdict[sym].k;
			let mi = mPic(key, d, { w: szSym, fz: szSym * .8, bg: sdict[sym].bg, rounding: '10%' });
			d1 = iDiv(mi);
		}
		syms.push({ isEcho: isEcho, div: d1 });
	}
	placeSymbol(syms[0], szSym, gap, { left: 0, top: 0 });
	placeSymbol(syms[1], szSym, gap, { left: 0, bottom: 0 });
	placeSymbol(syms[2], szSym, gap, { left: w / 2, bottom: 0 });
	placeSymbol(syms[3], szSym, gap, { right: 0, bottom: 0 });
	info.div = d;
	return info;
}
function placeSymbol(sym, szSym, margin, posStyles) {
	let d = iDiv(sym);
	posStyles.position = 'absolute';
	posStyles.margin = margin;
	posStyles.h = szSym;
	posStyles.w = szSym; //sym.isEcho ? szSym * 3 : szSym;
	mStyle(d, posStyles); // { position: 'absolute', w: w, h: szSym, left: left, top: top, margin: margin });
}


class Karte {
	static random(sym = 'bee', h = 220) {
		return Karte.get(sym, h);

		return Card52.random();
	}

	static c1(info, n, fg, h, w) {

		let d = mDiv();
		let svg = mgTag('svg', d, { class: 'card', face: '2C', height: '100%', width: '100%', preserveAspectRatio: 'none', viewBox: "-120 -168 240 336" });

		// let idN = fg + n;
		// let prefabN = mgTag('symbol', svg, { id: idN, viewBox: "-500 -500 1000 1000", preserveAspectRatio: "xMinYMid" });
		// let t = mgTag('text', prefabN, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg }, { fz: 1000 }, n);

		// let idSym = info.E;
		// let prefabSym = mgTag('symbol', svg, { id: idSym, viewBox: "-500 -500 1000 1000", preserveAspectRatio: "xMinYMid" });
		// t = mgTag('text', prefabSym, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg },
		// 	{ fz: (info.family == 'emoNoto' ? 750 : 1000), family: info.family }, info.text);

		let g = mgTag('g', svg);
		let rect = mgTag('rect', g, { width: 239, height: 335, x: -120, y: 168, rx: 12, ry: 12, fill: "white", stroke: "black" });
		let t = mgTag('text', g, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg }, { fz: 1000 }, 'HALLO');

		// let elNumber = mgTag('use', svg, { 'xlink:href': `#${idN}`, height: 42, x: -120, y: -156 });

		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(d, w, h); }

		console.log('d', d)
		return { key: getUID(), div: d, w: w, h: h, faceUp: true }; //this is a card!

	}
	static card(info, n, fg, h, w) {

		let x = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
			face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
			<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
				<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-weight:bold;">${n}</text>				
			</symbol>
			<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
				<text text-anchor="middle" dominant-baseline="middle" x="0" y="-150" fill="red" style="font-size:750px;font-family:${info.family};">${info.text}</text>				
			</symbol>
			<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>`;


		//calc coordinates!
		//min x [-120 120]
		//y [-156 156]
		//what should be next?
		//upper left=  
		let h1 = { xs: 24, s: 27, m: 42, l: 60, xl: 70, xxl: 100 };

		let left = [0, 50, 100, 120];
		// mid->left: 
		let upperLeftNumber = `<use xlink:href="#${fg}${n}" height="42" x="-120" y="-156"></use>`
			`<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
			<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
			<g transform="rotate(180)">
				<use xlink:href="#${fg}${n}" height="42" x="-120" y="-156"></use>
				<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
				<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
			</g>
		</svg>`;

		let svgCode = x;
		svgCode = '<div>' + svgCode + '</div>';
		let el = mCreateFrom(svgCode);
		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		return { key: getUID(), div: el, w: w, h: h, faceUp: true }; //this is a card!

	}

	static get52(suit, rank, fg, bg, h, w, faceUp) {
		//suit is a key into Syms including
		//rank is a number 0,1.... or TJQKA or some other letter or * for joker 
		let key = suit.toLowerCase();
		let di = {
			h: 'hearts', s: 'spades', p: 'spades', c: 'clubs', t: 'clubs', d: 'diamonds', k: 'diamonds',
			j: 'joker', '*': 'joker'
		};
		if (isdef(di[key])) key = di[key];
		let di2 = { spades: 'spade suit', hearts: 'heart suit', diamonds: 'diamond suit', clubs: 'club suit' };
		if (isdef(di2[key])) key = di2[key];
		let info = Syms[key];
		return Karte.get(key, 300, rank, fg);
		let fz = info.family == 'emoNoto' ? 750 : 1000;
	}

	static get(sym = 'bee', h = 110, n = 2, fg = 'indigo', w) {
		let info = Syms[sym];
		n = 2;
		ensureColorNames();
		if (nundef(fg)) fg = sym == 'spades' || sym == 'clubs' ? 'black' : sym == 'hearts' || sym == 'diamonds' ? 'red' : chooseRandom(Object.keys(ColorNames)); 
		let cardKey = info.family == 'emoNoto' ? 'card0' : 'card52';
		let basic = {
			card0: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-weight:bold;">${n}</text>				
					</symbol>
					<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="-150" fill="red" style="font-size:750px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#${fg}${n}" height="42" x="-118" y="-156"></use>
					<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#${fg}${n}" height="42" x="-118" y="-156"></use>
						<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card52: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-family:opensans;">${n}</text>				
					</symbol>
					<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="50" fill="${fg}" style="font-size:800px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#${fg}${n}" height="40" x="-116.4" y="-156"></use>
					<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#${fg}${n}" height="40" x="-116.4" y="-156"></use>
						<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card7: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:750px;font-family:opensans;">A</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#VC2" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#VC2" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
						<use xlink:href="#VC2" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#VC2" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card6: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:750px;font-family:opensans;">A</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
				</svg>`,
			card5: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="SC2" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid">
						<path d="M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z" 
							fill="black">
						</path>
					</symbol>
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<path d="M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300" 
							stroke="black" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none">
						</path>
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
						<use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use>
					</g>
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="green" transform="rotate(180)" style="font-size:16px;font-family:opensans;">YES</text>				
				</svg>`,
			card4: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text dominant-baseline="hanging" text-anchor="middle" x="0" y="0" fill="red" style="font-size:600px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>

					<use xlink:href="#VC2" height="32" x="-114.4" y="-156" dominant-baseline="hanging" text-anchor="middle" ></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156" dominant-baseline="hanging" text-anchor="middle" ></use>
					</g>
					<text dominant-baseline="hanging" text-anchor="middle" x="0" y="0" fill="red" style="font-size:600px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="green" transform="rotate(180)" style="font-size:16px;font-family:opensans;">YES</text>				
				</svg>`,
			card3: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`,
			card2: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:500px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`,
			card1: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2">
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#VC2" height="32" x="0" y="0"></use>
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`


		};
		let svgCode = basic[cardKey];
		svgCode = '<div>' + svgCode + '</div>';
		let el = mCreateFrom(svgCode);
		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		return { key: getUID(), div: el, w: w, h: h, faceUp: true }; //this is a card!

	}
}
//#endregion

//#region onclick
function onclick_cancelmenu() { hide('dMenu'); }
function onclick_home() { window.location = SERVER; }
function onclick_lamp() {
	DA.simple = !DA.simple;
	if (DA.simple) show_simple_ui(); else show_advanced_ui();
	if (isVisible('dTables')) onclick_tables();
}
function onclick_player_in_gametable(uname, tablename, rid) {

	stopgame();
	U = firstCond(Serverdata.users, x => x.name == uname);
	send_or_sim({ friendly: tablename, uname: U.name,  }, 'table');
}
function onclick_pause_continue() {

	let b = mBy('bPauseContinue');
	clearTimeout(TO.ai);
	onclick_stoppolling();
	show_status('game is paused', true);
	mStyle(b, { fg: 'grey' });
	//hide(b)

}

function onclick_reset_past() { stopgame(); phpPost({ app: 'simple' }, 'delete_past'); }



//#endregion



//#region start (simple)
//ab hier soll der gesamte ui code refactored werden!
function clearTable() {
	clearElement('dTable');
	clearElement('dHistory');
	show_title();
	clearElement('dMessage');
	clearElement('dInstruction');
	clearElement('dTitleRight');
	hide('bPauseContinue');
}
function clearStatus() { clearFleetingMessage(); }
function hide_options_popup() {	let d = mBy('dOptions');	if (isdef(d)) mRemove(d);}
function hide_history_popup() {	let d = mBy('dHistoryPopup');	if (isdef(d)) {mAppend(UI.dHistoryParent,UI.dHistory);mRemove(d);}}
function rPlayerOrder(players) { return shuffle(jsCopy(players)); }
function show_settings_orig(options) {
	clearElement('dTitleRight');
	let dParent = mDiv(mBy('dTitleRight'), { display: 'flex', fg: 'red' }, null, options.mode == 'hotseat' ? 'h' : '');

	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_medium_ui() { DA.testing = false; hide('dButtons'); hide('dTest0'); hide('dTopAdvanced'); toggle_games_off(); } //toggle_tables_off();  }
function show_simple_ui_orig() {
	DA.testing = false;
	hide('dButtons');
	hide('dTest0');
	hide('dTopAdvanced');
	toggle_games_off();
	toggle_tables_off();
	toggle_users_on();
}
function show_advanced_ui() {
	show('dButtons');
	show('dTest0');
	show('dTopAdvanced');
	//hier koennt ich auch activate test vars machen!!!
	DA.testing = true;
	DA.test = { iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [100, 101] };

	//hier setze default tests!
	DA.test.list = arrRange(100, 101); //[];// [100, 101, 102, 103, 104];
	DA.test.number = 306; // do NOT set this to 107 in real mode!
	DA.staged_moves = []; DA.iter = 100; DA.auto_moves = {};

}
function show_status_orig(msg = '', stay) {
	if (isdef(stay)) showFleetingMessage(msg, mBy('dStatus'), { fg: 'red' }, 1000, 0, false);
	else showFleetingMessage(msg, mBy('dStatus'), { fg: 'black' });  
}

function mTableCommands(rowitems, di) {
	let t = rowitems[0].div.parentNode;
	mTableHeader(t, 'commands');
	for (const item of rowitems) {
		let drow = item.div;
		let dcol = mTableCol(drow);
		let colitem = { div: dcol, key: 'commands', val: null };
		item.colitems.push(colitem);
		let html = '';
		for (const k in di) {
			html += di[k](item); //`<a href="/loggedin/${item.o.name}">login</a>`);

		}
		dcol.innerHTML = html;
	}
}

function show_title_left(s, styles, funnyLetters = false) {
	let d = mBy('dTitleLeft');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_title_right(s, styles, funnyLetters = false) {
	let d = mBy('dTitleRight');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_user() {
	//console.log('U',U)
	if (isdef(U) && U.name != 'anonymous') {
		//show_title_left(U.name, { fg: U.color });
		let uname = U.name;
		let sz = 36;
		let html = `
		<div username='${uname}' style='display:flex;align-items:center;gap:6px;height:100%'>
			<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='border:3px solid ${U.color};margin:0'>
			<span>${uname}</span>
		</div>`;
		show_title_left(html, { fg: U.color });
		// mUserPic(U.name, mBy('dTitleLeft'));
	}
	else show_home_logo();
}

function show_x_button(dParent) {
	let b = mButton('close', () => hide(dParent), dParent, { maleft: '95%' });
}
function toggle_games_on() { let a = mBy('aGames'); mStyle(a, { bg: 'skyblue' }); }
function toggle_games_off() { let a = mBy('aGames'); hide('dGames'); mStyle(a, { bg: 'silver' }); }
function toggle_tables_on() { let a = mBy('aTables'); mStyle(a, { bg: '#afe78f' }); } //'lightgreen' }); }
function toggle_tables_off() { let a = mBy('aTables'); hide('dTables'); mStyle(a, { bg: 'silver' }); }
function toggle_users_on() { let a = mBy('aUsers'); mStyle(a, { bg: 'coral' }); }
function toggle_users_off() { let a = mBy('aUsers'); hide('dUsers'); mStyle(a, { bg: 'silver' }); }

//#endregion

//#region testing
function test_endgame() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	fen.actionsCompleted = [];

	//erstmal: jeder bakommt ein chateau + 1 or 2 random buildings!
	//erstmal: alle players bekommen 3-5 correct buildings
	for (const plname of fen.plorder) {
		add_a_correct_building_to(fen, plname, 'chateau');
		add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		if (coin()) add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		fen.actionsCompleted.push(plname);
	}

	//test_skip_to_actions();
	Z.stage = 5;
	Z.phase = 'king';
	take_turn_fen();

}
function test_add_schwein() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];

	let type = rChoose(['farm', 'estate', 'chateau']);
	let keys = deck_deal(fen.deck, type[0] == 'f' ? 4 : type[0] == 'e' ? 5 : 6);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
	take_turn_fen();

}
function test_add_building() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	let type = rChoose(['farm', 'estate', 'chateau']);
	add_a_correct_building_to(fen, uname, type);
	take_turn_fen();

}
function testSplitIntoNumbersAndWords() {
	let ss = ['1k 2queen', '1 k 12 q', '12king2queen', '31 ace 2queen', '1 3 3 4', '1 10 3 8', '1J3As', '12 koenig 2 Ass'];
	for (const s of ss) {
		let x = splitIntoNumbersAndWords(s);
		//console.log('s',s,'x',x);
	}
}
function test_skip_to_tax() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];

	//was soll da geschehen?
	Z.phase = 'jack';
	Z.stage = 5;
	let iturn = fen.plorder.length - 1;
	Z.turn = [fen.plorder[iturn]];
	fen.actionsCompleted = fen.plorder.slice(0, iturn);
	console.log('fen.actionsCompleted', fen.actionsCompleted);

	//add 0 to 5 cards to each player's hand
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = pl.hand.concat(deck_deal(fen.deck, rNumber(0, 5)));
	}

	take_turn_fen();

}
function test_skip_to_actions() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];

	//was soll da geschehen?
	Z.phase = 'king';
	Z.stage = 5;
	fen.actionsCompleted = [];

	//empty market into pl with min hand!
	let i = arrMinMax(fen.plorder, x => fen.players[x].hand.length).imin;
	let pl_min_hand = fen.plorder[i];
	console.log('pl w/ min hand is', pl_min_hand);
	let pl = fen.players[pl_min_hand];
	pl.hand = pl.hand.concat(fen.market);
	fen.market = deck_deal(fen.deck, 2);

	//each player gets a random stall (1 to hand length)
	for (const plname of fen.plorder) {
		pl = fen.players[plname];
		let n = rNumber(1, pl.hand.length);
		pl.stall = pl.hand.splice(0, n);

	}

	Z.turn = [fen.plorder[rNumber(0, fen.plorder.length - 1)]];
	fen.total_pl_actions = fen.num_actions = fen.players[Z.turn[0]].stall.length;
	fen.action_number = 1;

	take_turn_fen();

}
function testjourney0() {
	let [fen, uname] = [Z.fen, Z.uname];

	let plist = find_players_with_potential_journey(fen);
	console.log('journey players', plist);
	if (!plist.includes(uname)) {
		set_nextplayer_after_journey(); //der macht ja auch find_players_with_potential_journey .....
		console.log('Z.turn', Z.turn)
		take_turn_fen();
	}

}
function testanim1() {
	let [fen, phase, deck, market] = [Z.fen, Z.phase, Z.deck, Z.market];

	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;

	for (let i = 0; i < n_market; i++) {
		DA.qanim = DA.qanim.concat([
			[qanim_flip_topmost, [deck]],
			[qanim_move_topmost, [deck, market]],
			[q_move_topmost, [deck, market]],
		]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function testanim0() {
	let [fen, phase, stage, deck, market] = [Z.fen, Z.phase, Z.stage, Z.deck, Z.market];

	let ms = 400;
	let item = deck.topmost;
	mAnimate(iDiv(item), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (item.faceUp) face_down(item); else face_up(item);
			mAnimate(iDiv(item), 'transform', [`scale(0,1)`, `scale(1,1)`], null,
				ms / 2, 'ease-in', 0, 'both');
		}, ms / 2, 'ease-out', 100, 'both');


}

//#endregion
















