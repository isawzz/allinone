
function _minimizeCode(di, symlist = ['start'],nogo=[]) {
	let done = {};
	let tbd = symlist; //console.log('symlist', symlist)
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
		for (const w of words) { 
			if (nogo.some(x=>w.startsWith(x))) continue; //'uiGetC'+'ontact')) {console.log('sym',sym,w);return done;}
			if (nundef(done[w]) && nundef(visited[w]) && w != sym && isdef(di[w])) addIf(tbd, w); 
		}
		assertion(sym == tbd[0], 'W T F')
		tbd.shift();
		done[sym] = o;
	}
	//console.log('done',done);
	//==>assertion(isdef(done.SOCKETSERVER),'no SOCK.......')
	return done;
}











