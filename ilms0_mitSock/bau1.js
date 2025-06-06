



function sockInit(port='3000') {
  let type = detectSessionType();
  let server = type == 'live'? `http://localhost:${port}` : type == 'fastcomet'? `https://moxito.online:${port}` : null;//getServer(); //getServerurl();
  console.log('::sockInit:', type, server); return;
  if (!server){  console.log('::sockInit: NO SOCKETS!!!', type, server); return;}

  Socket = io(server);
  Socket.on('disconnect', x => console.log('::io disconnect:', x));
  Socket.on('connection', x => console.log('::io connect:', x));
  // Socket.on('config', onsockConfig);
  // Socket.on('event', onsockEvent);
  Socket.on('message', o=>console.log('message',o)); //showChatMessage);
  // Socket.on('merged', onsockMerged);
  // Socket.on('pending', onsockPending);
  // Socket.on('table', onsockTable);
  // Socket.on('tables', onsockTables);
  // Socket.on('superdi', onsockSuperdi);
}
function sockPostUserChange(oldname, newname) {
  Socket.emit('userChange', { oldname, newname });
}
