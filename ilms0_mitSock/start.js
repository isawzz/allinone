onload = start;

async function start() { await test0_game0(); }

async function test0_game0() {
	DA.gamelist = ['setgame', 'button96']; //'accuse aristo bluff ferro fishgame fritz huti lacuna nations setgame sheriff spotit wise'; if (DA.TEST0) gamelist += ' a_game'; gamelist = toWords(gamelist);
	DA.funcs = { setgame: setgame(), button96: button96() }; //implemented games!
	for (const gname in DA.gamelist) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}

	await loadAssetsStatic();
	await loadTables();

	let elems = mLayoutTM('dPage'); mStyle('dMain', { overy: 'auto' }); mCenterFlex('dMain');

	mLayoutTopTestExtraMessageTitle('dTop'); mFlexV('dTop'); //mStyle('dTop', { hmin: 32 }); mStyle('dExtra', { hmin: 32 })

	let names = ['amanda', 'felix', 'lauren', 'mimi', 'gul']; let d = mBy('dTestRight');
	for (const name of names) { let b = mDom(d, { className: 'button' }, { tag: 'button', html: name, onclick: async () => await switchToUser(name) }); }

	//await mSleep(rNumber(0,2000));
	let username = rChoose(names); //['felix','lauren','diana','mimi','amanda','guest','gul']); //localStorage.getItem('username') ?? 'hans'; 
	//if (username == 'felix') username = 'mimi'; else { username = 'felix';}
	await switchToUser(username);

	//return;
  let type = detectSessionType();
	let port = '3000';
  let server = type == 'live'? `http://localhost:${port}` : type == 'fastcomet'? `http://moxito.online:${port}` : null;//getServer(); //getServerurl();
	if (!server){  console.log('NO SOCKETS!!!', type, server); return;}

  console.log('::io ...initializing socket.io', type, server); //return;

	const socket = io(server); //'https://localhost:3000'); // Or use wss:// and the correct port if using HTTPS
	socket.on('connect', () => { console.log('::io connected!', socket.id); });
	socket.on('connect_error', (err) => { console.error('::io connection failed:', err); });
	socket.on('disconnect', x => console.log('::io disconnect:', x));
}
async function test0_getTables() {
	//console.log('haloooooooooooooo'); return;
	let tables = await getTables(); console.log('tables', tables);

}
