
function mBodyResetter(bg) {
  let d0 = document.body;
  mClass(d0, 'reset100'); //console.log(d0.offsetWidth, d0.offsetHeight);
  mStyle(d0, { bg })
  let d1 = mDom(d0); //, { w: '100%', h: '100%' });
  return d1;
}

function mGridRows(d0, desc, testing=false) {
	return mGridDesc(d0, desc, 'gridTemplateRows', testing);
}
function mGridCols(d0, desc, testing=false) {
	return mGridDesc(d0, desc, 'gridTemplateColumns', testing);
}
function mGridDesc(d0, desc, prop, testing=false) {
	let dg0 = mDom(d0, { display: 'grid', w: '100%', h: '100%' });
	dg0.style[prop] = desc;
	let func = testing ? mDomTest : mDom;
	let num = desc.split(' ').length;
	let divs=[];
	for(const i of range(num)) divs.push(func(dg0));
	return divs;
}


