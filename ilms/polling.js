
function recUserEvent() { DA.prevEvUser = DA.evUser; DA.evUser = getNow(); DA.evList.push({ user: DA.evUser }); }
function recServerEvent() { DA.prevEvServer = DA.evServer; DA.evServer = getNow(); DA.evList.push({ server: DA.evServer }); }
function recSysEvent() { DA.prevEvSys = DA.evSys; DA.evSys = getNow(); DA.evList.push({ sys: DA.evSys }); }
function recPollEvent() { DA.prevEvPoll = DA.evPoll; DA.evPoll = getNow(); DA.evList.push({ poll: DA.evPoll }); }

function checkState() {

}
function sysInit() {
	DA.evList = [];
	DA.pollms = { lobby: 3000, table: { myMove: 1000, otherMove: 2000 } };
	DA.pollCounter = 0;
	// menuLobby();
	// tableNone();
	// sysIdle();
	// uiManual();
	// clearTimeout(TO.poll); TO.poll = null;
	// clearTimeout(TO.system); TO.system = null;
}
async function updateState() {
	clearTimeout(TO.system); TO.system = null;
	await mSleep(100);
	showState();
	TO.system = setTimeout(updateState, 1000);
}
function uiManual() { DA.prevUiState = DA.uiState; DA.uiState = 'manual'; }
function uiAuto() { DA.prevUiState = DA.uiState; DA.uiState = 'auto'; }
function menuLobby() { DA.prevMenuState = DA.menuState; DA.menuState = 'lobby'; }
function menuTable() { DA.prevMenuState = DA.menuState; DA.menuState = 'table'; }
function tableNone() { DA.prevTableState = DA.tableState; DA.tableState = 'none'; }
function tableMyMove() { DA.prevTableState = DA.tableState; DA.tableState = 'mymove'; }
function tableOtherMove() { DA.prevTableState = DA.tableState; DA.tableState = 'othermove'; }
function tableGameover() { DA.prevTableState = DA.tableState; DA.tableState = 'gameOver'; }
function tableOpen() { DA.prevTableState = DA.tableState; DA.tableState = 'open'; }
function sysIdle() { DA.prevSysState = DA.sysState; DA.sysState = 'busy'; }
function sysBusy() { DA.prevSysState = DA.sysState; DA.sysState = 'idle'; }
function sysPolling() { DA.prevSysState = DA.sysState; DA.sysState = 'polling'; }
function isBusy() { return DA.sysState == 'busy'; }
function isPolling() { return DA.sysState == 'polling'; }
function isIdle() { return DA.sysState == 'idle'; }

async function onPoll() {
	while (isBusy()) await mSleep(100);

	assertion()
}
async function forceUpdate() {
	switch (DA.pollState) {
		case 'lobby': DA.tableList = null; await showGamesAndTables(); break;
		case 'mymove':
		case 'othermove': break;
		default: break;
	}
}
function handleVisibilityChange() {
	if (DA.polling == false) return;
	if (document.visibilityState === "hidden") {
		pollStop();
	} else {
		pollResume();
	}
}
function pollChangeMs(state, ms) { DA.pollms[state] = ms; }
function pollChangeState(newState) {
	DA.prevState = DA.pollState;
	DA.pollState = newState;
	pollResume();
}
async function pollResume() {
	let ms = DA.pollms[DA.pollState];
	console.log('', DA.pollCounter++, ms, DA.prevState, DA.pollState);
	switch (DA.pollState) {
		case 'lobby':
			await showGamesAndTables();
			if (nundef(TO.poll)) TO.poll = setTimeout(pollResume, ms);
			break;
		case 'mymove':
			TO.poll = setTimeout(pollResume, ms);
			break;
		case 'othermove':
			TO.poll = setTimeout(pollResume, ms);
			break;
		default:
			pollStop(); break;
	}
}
function pollStop() {
	if (TO.poll) { clearTimeout(TO.poll); TO.poll = null; }
	DA.polling = false;
}



