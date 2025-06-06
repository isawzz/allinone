
function _assemble_code_sorted(list, di, preserveRegions = false) {
	//console.log('...',list[0],di[list[0]]);//var list problem!!!!!
	let text = '';
	for (const k of list) {
		assertion(isdef(k),`KEY UNDEFINED ${k}`);
		if (nundef(di[k])) continue;
		let o = di[k];
		text += o.code;
	}
	return text;
}
function muell(){
	let byFT = {}, groupkeys = {}, fnames = [];
	for (const k of list) {
		let o = di[k];
		let groupkey = preserveRegions || o.fname.startsWith('all') && o.fname != 'all' ? o.region : o.fname;
		lookupAddIfToList(byFT, [o.fname, groupkey, o.type], k);
		lookupAddIfToList(groupkeys,[o.fname],groupkey);
		// addIf(groupkeys, groupkey);
		addIf(fnames, o.fname);
	}

	let regionlist=['const','var','classes'];
	for(const ch of '_ABCDEFGHIJKLMNOPQRSTUVWXYZ') regionlist.push(ch); console.log('regions',regionlist)

	for (const fname of fnames) {

		if (fname.startsWith('all') && fname != 'all'){
			//let r=
		}
		for (const groupkey of groupkeys[fname]) {

			text += `//#region ${groupkey}\n`;
			for (const t of ['const', 'var', 'cla', 'func']) {
				let keys = byFT[fname][groupkey][t];
				if (nundef(keys)) continue;
				if (t == 'func') keys = sortCaseInsensitive(keys);
				for (const k of keys) {
					if (!k || nundef(di[k])) continue;
					let o = di[k];
					text += o.code;
				}
			}
			text += `//#endregion ${groupkey}\n\n`;
		}
	}
	return text;
}













