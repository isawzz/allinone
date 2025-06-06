
function mLayoutLeftMain(container,scroll=true) {
  mStyle(container, { display: 'grid', gridCols: 'auto 1fr', h: '100%' });
  let d1 = mDom(container,{transition:'all .5s ease',wmin:0,w:0},{html:getMenuSymbol()});
  let d2 = mDom(container); 
	if (scroll) mStyle(d2, { overflow: 'scroll' });
  return [d1, d2];
}
function mLayoutTopTable(container,scroll=true) {
  mStyle(container, { display: 'grid', gridRows: 'auto 1fr', h: '100%' });
  let d1 = mDom(container);
  let d2 = mDom(container); 
  if (scroll) mStyle(d2, { overflow: 'scroll' });
  return [d1, d2];
}
function _mLayoutTopLeftTable(container,scroll=true) {
  mStyle(container, { display: 'grid', gridRows: 'auto 1fr', h: '100%' });
  let d1 = mDom(container);
  let drest = mDom(container,{ display: 'grid', gridCols: 'auto 1fr', h: '100%', w:'100%' }); 
	let d2 = mDom(drest);
	let d3 = mDom(drest);
  if (scroll) mStyle(d3, { overflow: 'scroll' });
  return [d1, d2, d3];
}
function mLayoutTopLeftTable(container) {

  mStyle(container, { display: 'flex', dir: 'column', h: '100%', w:'100%' });
  let d1=mDom(container,{bg:'lightblue',padding:10},{html:'top'})
  let drest=mDom(container,{display:'flex',flexGrow:1,overflow:'hidden',w:'100%'});
  let d2=mDom(drest,{w:60,bg:'lightgray',transition:'width 0.5s ease'});
  let dsym=mDom(d2,{cursor:'pointer',fz:24,padding:10},{html:getMenuSymbol()})
  let d3=mDom(drest,{flexGrow:1,overy:'scroll',bg:'lightgreen',padding:10},{html:'content'});

	// Add some extra content to make the right div scrollable
	for (let i = 0; i < 120; i++) {
		const p = document.createElement('p');
		p.textContent = `Content line ${i + 1}`;
		d3.appendChild(p);
	}

	// Toggle sidebar open/close on menu symbol click
	let sidebarOpen = false;
	menuSymbol.addEventListener('click', () => {
		if (sidebarOpen) {
			leftDiv.style.width = '60px'; // Collapse the sidebar
		} else {
			leftDiv.style.width = '200px'; // Expand the sidebar
		}
		sidebarOpen = !sidebarOpen;
	});

  return [d1,d2,d3]; //{dTop:d1,dSidebar:d2,dTable:d3,isOpen:sidebarOpen}
}


