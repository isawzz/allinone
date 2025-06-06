
//#region functions
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function arrClear(arr) { arr.length = 0; return arr; }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMinus(arr, b) { if (isList(b)) return arr.filter(x => !b.includes(x)); else return arr.filter(x => x != b); }
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		console.log('!!!ASSERTION!!!')
		for (const a of args) {
			console.log('\n', a);
		}
		return false;
	} else return true;
}
function calcScoreSum(table) {
	let res = 0;
	for (const name in table.players) {
		res += table.players[name].score;
	}
	return res;
}
function calcErrSum(table) {
	let res = 0;
	for (const name in table.players) {
		res += valf(table.players[name].errors, 0);
	}
	return res;
}
function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}
function deleteFile(filePath) {
	fs.unlink(filePath, (err) => {
		if (err) {
			console.error('Error deleting file:', err);
			return;
		}
		console.log('File deleted:', filePath);
	});
}
function deleteTable(id) {
	delete Session.tables[id];
	deleteFile(getTablePath(id));
	let ti = Session.tableInfo[id];
	if (isdef(ti)) {
		delete Session.tableInfo[id];
		saveTableInfo();
	}

}
function emitToPlayers(namelist, msgtype, o) {
	for (const name of namelist) {
		let idlist = byUsername[name]; //console.log('name', name, '\nid', idlist);
		if (nundef(idlist)) continue;
		console.log('ids for', name, idlist)
		for (const id of idlist) {
			let client = clients[id]; //console.log(name, client.id); //isdef(client),Object.keys(client))
			if (client) client.emit(msgtype, o);
		}
	}
}
async function getFiles(dir) {
	const directoryPath = dir.startsWith('C:') ? dir : path.join(__dirname, dir);
	//console.log('dirpath', directoryPath)
	const files = await fsp.readdir(directoryPath);
	return files;

}
function getFormattedDate() {
	const date = new Date();

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
	const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed

	return `${year}-${month}-${day}`;
}
function getFormattedTime() {
	const date = new Date();

	const hours = String(date.getHours()).padStart(2, '0'); // Get hours (24-hour format)
	const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes

	return `${hours}:${minutes}`;
}
function getNow() { return Date.now(); }
function getTablePath(id) { return path.join(tablesDir, `${id}.yaml`); }
function getTablesInfo() {
	let info = [];
	//console.log('session.tables',Session.tables); return [];
	for (const id in Session.tables) {
		let t = jsCopy(Session.tables[id]);
		delete t.fen;
		//delete t.players;
		info.push(t);
	}
	return info;
}
function getUniquePath(fname, dir) {
	let core = stringBefore(fname, '.');
	let ext = '.' + stringAfter(fname, '.');
	let name = core;
	let i = 1;
	while (true) {
		if (!fs.existsSync(dir + name + ext)) break;
		name = core + (i++);
	}
	return [name + ext, path.join(dir, name + ext)];

}
function getUserPath(name) { return path.join(usersDir, `${name}.yaml`); }
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function isString(param) { return typeof param == 'string'; }
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function lookup(dict, keys) {
	if (nundef(dict)) return null;
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue;
		//if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {}); //only uses val if hasn't been set!
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function normalizeString(s, sep = '_', keep = []) {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i]) || keep.includes(s[i])) res += s[i]; else res += sep; }
	return res;
}
function nundef(x) { return x === null || x === undefined; }
function recFlatten(o) {
	if (isLiteral(o)) return o;
	else if (isList(o)) return o.map(x => recFlatten(x)).join(', ');
	else if (isDict(o)) {
		let valist = [];
		for (const k in o) { let val1 = recFlatten(o[k]); valist.push(`${k}: ${val1}`); }
		return valist.join(', ');
	}
}
function removeInPlace(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function saveConfig() { let y = yaml.dump(Session.config); fs.writeFileSync(configFile, y, 'utf8'); }
function saveDetails() { let y = yaml.dump(M.details); fs.writeFileSync(detailsFile, y, 'utf8'); }
function saveLists() { let y = yaml.dump(M.lists); fs.writeFileSync(listsFile, y, 'utf8'); }
function saveTable(id, o) {
	lookupSetOverride(Session, ['tables', id], o);
	let y = yaml.dump(Session.tables[id]);
	fs.writeFileSync(getTablePath(id), y, 'utf8');
}
function saveTableInfo() {
	let y = yaml.dump(Session.tableInfo); fs.writeFileSync(tablesFile, y, 'utf8');
}
function saveUser(name, o) {
	let nogo = ['div', 'isSelected', 'button', 'button99', 'button98', 'button97', 'playmode'];
	nogo.map(x => delete o[x]);
	for (const k in o) {
		let val = o[k];
		if (!isDict(val)) continue;
		delete val['playmode'];
	}

	lookupSetOverride(Session, ['users', name], o);
	let y = yaml.dump(Session.users[name]);
	fs.writeFileSync(getUserPath(name), y, 'utf8');
}
function saveYaml(o, p) { let y = yaml.dump(o); fs.writeFileSync(p, y, 'utf8'); }
function saveZ() { let y = yaml.dump(Z.open); fs.writeFileSync(zOpen, y, 'utf8'); }
function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function toFlatObject(o) {
	if (isString(o)) return { details: o };
	for (const k in o) { let val = o[k]; o[k] = recFlatten(val); }
	return o;
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
//#endregion


//#region ::socket.io old code from easy
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, { cors: { origins: '*', } });//live-server: brauch ich cors!
//#endregion

//#region my socket impl
// const http = require("http").createServer();
// var io = require("socket.io")(http, { cors: { origin: "*", }, });

// const byClient = {};
// const byUsername = {};
// const clients = {};
// io.on('connection', (client) => {
// 	clients[client.id] = client;
// 	console.log('::io.connected', client.id);
// 	client.on('userChange', x => handle_userChange(x, client.id));
// 	client.on('move', x => handle_move(x, client, client.id));
// 	client.on('disconnect', x => handle_disconnect(x, client.id));
// });
// function handle_disconnect(x, id) {
// 	console.log('::io.disconnected', id);
// 	let uname = byClient[id];
// 	let idlist = byUsername[uname];
// 	if (isList(idlist)) removeInPlace(idlist, id);
// 	// for(const k in Spectators){removeInPlace(Spectators[k],uname)}
// 	io.emit('message', `${uname} left`);
// }
// function handle_move(x, socket, id) {
// 	io.emit("move", x);
// 	socket.broadcast.emit("move", { move: x, id });
// }
// function handle_userChange(x, id) {
// 	if (x.oldname == x.newname) { console.log('no change:', x.oldname); return; }
// 	console.log('::user change', x.newname);
// 	// for(const k in Spectators){removeInPlace(Spectators[k],x.oldname)}
// 	byClient[id] = x.newname;
// 	lookupAddToList(byUsername, [x.newname], id);
// 	let list = byUsername[x.oldname];
// 	//console.log('list',list,id)
// 	if (isList(list) && list.includes(id)) removeInPlace(list, id);
// 	io.emit('userChange', `${id} is now ${x.newname}`);
// }
// http.listen(3000, () => {
// 	console.log("Game server listening on port 3000");
// });
//#endregion

//#region socket io
const { createServer } = require("http");
const { Server } = require("socket.io");

var httpServer = createServer();
var io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("::io A user connected:", socket.id);
  socket.on("disconnect", (reason) => {
    console.log("::io User disconnected:", socket.id, "Reason:", reason);
  });
});


//#endregion

httpServer.listen(3000, () => {
  console.log("Socket.IO server running on port 3000");
});


