//#region bundle closure css
function _getLineStart(line) {
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
	else if (ch == ' ') { w = 'SPACE'; } //type = 'WTF' }
	else if (ch == '\r') { type = 'WTF' }
	else if (nundef(fw)) { w = fw; type = 'WTF' }

	if (['async', 'class', 'const', 'function', 'var'].includes(w)) type = 'block';
	else if (isLetter(ch)) type = 'WTF';

	return [w, type];
}
function addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx) {
	let prev = lookup(byKey, [kw]);
	let oldfname = prev ? prev.fname : fname;
	let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
	if (prev) {
		if (prev.type != o.type) {
			console.log('DUPLICATE', kw, prev);
			console.log('... change from', prev.type, 'to', o.type);
		}
	} else { ckeys.push(kw); }
	lookupSetOverride(byKey, [kw], o);
}
async function bundleGenFromProject(projectname, genfiles) {
	//assume projectname has to be a top leve folder inside of the dir where coding resides!
	return await bundleGenerateFrom(`../${projectname}/index.html`, null, genfiles);
}
async function bundleGenerateFrom(htmlScriptsFile, htmlBodyFile = null, download = true) {
	let html = await route_path_text(htmlScriptsFile);
	html = removeCommentLines(html,'<!--','-->');
	if (htmlBodyFile) html += await route_path_text(htmlBodyFile);
	let dirhtml = stringBeforeLast(htmlScriptsFile, '/');
	let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
	let files = extractFilesFromHtml(html, htmlScriptsFile);

	let byKey = {}, ckeys = [], idx = 0, haveBundle = false;
	if (files.length == 1) {
		haveBundle = true;
		console.log('bundle already generated!!!', files[0]);
	}
	for (const f of files) { let idxnew = await parseCodeFile(f, byKey, ckeys, idx); idx = idxnew; }
	let bundle_code = _assemble_code_sorted(ckeys, byKey, haveBundle);
	//if (download) downloadAsText(bundle_code, `${project}_bundle`, 'js');

	let knownNogos={codingfull:['uiGetContact']};

	//closure!
	let seed = ['start'].concat(extractOnclickFromHtml(html)); //console.log('seed',seed)
	let byKeyMinimized = _minimizeCode(byKey, seed, valf(knownNogos[project],[]) );
	let ckeysMinimized = ckeys.filter(x => isdef(byKeyMinimized[x]));
	let closure_code = _assemble_code_sorted(ckeysMinimized, byKeyMinimized, haveBundle);
	if (download) downloadAsText(closure_code, `${project}_closure`, 'js');

	let scripts = `</body><script src="../${dirhtml}/closure.js"></script><script>onload = start;</script>\n</html>`;
	let htmlcode = stringBefore(html, `</body>`) + scripts;
	//if (download) downloadAsText(htmlcode, `${project}_index`, 'html')
	// if (download) downloadAsText(htmlcode.replace('/bundle.js', 'closure.js'), `${project}_closure`, 'html')

	AU.ta.value = closure_code;
	cssfiles = extractFilesFromHtml(html, htmlScriptsFile, 'css');
	console.log('cssfiles', cssfiles)
	//jetzt brauch ich noch das css
	let csstext = files.length>0? await cssGenerateFrom(cssfiles[0], bundle_code, html):'no css';

	return [bundle_code, closure_code, csstext, html];

}
async function cssGenerateFrom(cssfile, codefile, htmlfile) {
	if (!isList(cssfile)) cssfile = [cssfile];
	let tcss = '';
	for (const f of cssfile) { tcss += await route_path_text(f); }
	let code = codefile.endsWith('.js') ? await route_path_text(codefile) : codefile;
	let html = htmlfile.endsWith('.html') ? await route_path_text(htmlfile) : htmlfile;

	return cssNormalize(tcss, code, html);
}
function extractFilesFromHtml(html, htmlfile, ext = 'js') {
	let prefix = ext == 'js' ? 'script src="' : 'link rel="stylesheet" href="';
	let dirhtml = stringBeforeLast(htmlfile, '/');
	let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
	let parts = html.split(prefix);
	parts.shift();
	let files = parts.map(x => stringBefore(x, '"'));
	files = files.filter(x => !x.includes('alibs/') && !x.includes('assets/')); //console.log('files', jsCopy(files))


	//console.log('dirhtml', dirhtml);
	let files2 = [];
	for (const f of files) {
		if (f.startsWith(dirhtml)) { files2.push(f); continue; }

		if (f.startsWith('./')) { files2.push(dirhtml + f.substring(1)); continue; }

		if (f.startsWith('../') && stringCount(dirhtml, '../') == 1) {
			files2.push(f); continue;
		}

		if (!f.includes('/')) { files2.push(dirhtml + '/' + f); continue; }

		if (isLetter(f[0])) { files2.push(dirhtml + '/' + f); continue; }
		console.log('PROBLEM!', f)
		//file die in f is relative to index.html
		//ich brauch es relativ to coding/index
		//if (!f.startsWith())
	}
	//console.log('files2', files2);
	files = files2;
	return files;
}
function extractOnclickFromHtml(html) {
	let symlist = [];
	let onclicks = html.split('onclick="'); //.shift();
	onclicks.shift();
	//console.log('onclicks',onclicks);
	for (const oncl of onclicks) {
		//console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}
	return symlist;
}
async function parseCodeFile(f, byKey, ckeys, idx) {
	let chunk = '', kw = null, blocktype = null, region = null;
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let lines = txt.split('\n');
	for (const line of lines) {
		let [w, type] = _getLineStart(line);
		//if (kw == '_getLineStart') console.log('line',line,w,type)
		//if (line.includes('`;')) console.log('ACHTUNG!', w, type, line.trim() == '`;');
		if (line.trim() == '`;' && kw) { chunk += line + '\n'; continue; }
		if (type == 'WTF') { continue; }
		else if (type == 'empty') { continue; }
		else if (type == 'in_process') {
			if (line.trim().startsWith('//')) continue; // #region') || line.includes('//#endregion')) continue;
			if (kw) { chunk += line + '\n'; }
		}
		else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
		else if (type == 'block') {
			if (kw) addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx++);
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			let blocktypes = { function: 'func', class: 'cla', async: 'func', var: 'var', const: 'const' };
			blocktype = blocktypes[w];
			chunk = line + '\n';
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx++);
	return idx;
}
function removeCommentLines(text,cstart,cend){
	let lines = text.split('\n');
	let inComment=false, res='';
	for (const line of lines) {
		let lt=line.trim();
		if (lt.startsWith(cstart) && lt.endsWith(cend)) {continue;}
		if (lt.startsWith(cstart)) {inComment=true;continue;}
		if (lt.endsWith(cend)) {inComment=false;continue;}
		res+= line+'\n';
	}
	return res;
}
//#__endregion








