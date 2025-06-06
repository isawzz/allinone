onload = start;

async function start() { await test10(); }

async function test10(){await prelims();}

async function test9_recipes() {
	let d0 = mBy('dBody');
	mStyle(d0, { bg: 'red', h: '100vh', hmin: '100vh', hmax: '100vh' });	//console.log(d0); 
	let palette = paletteTransWhiteBlack(5); //console.log(palette);
	let grid=mDom(d0, {display:'grid'});
	dTop=mDom(grid, {bg:palette[1], fg:'contrast'}, {id:'dTop',html:'relief station'});
	dMain=mDom(grid, {bg:palette[2], fg:'contrast'}, {id:'dMain'});
	let h=dMain.offsetHeight; console.log(h)
}
async function testvorlage(){

	// let h=25;
	// let dTop=mDom(d0, {w:'100%', h});
	// let dMiddle=mDom(d0, {w:'100%', h:`calc( 100% - ${h}px )`});
	// let [dSideLeft, dUpper] = mGridCols(dMiddle, 'auto 1fr');
	// //let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	// let divs = [dSideLeft, dUpper, dTop];
	// let names = ['dSideLeft', 'dUpper', 'dTop'];
	// let palette = paletteTransWhiteBlack(divs.length + 2); //console.log(palette);
	divs.forEach((div, i) => mStyle(div, { bg: palette[i + 1], fg: 'contrast' }, { id: names[i] }));

	let [dTop, dMainTop, dFooter] = mGridRows(d0, 'auto 1fr auto');
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	let [dSideLeft, dUpper] = mGridCols(dMainTop, 'auto 1fr');

	let divs = [dSideLeft, dUpper, dFooter, dTop];
	let names = ['dSideLeft', 'dUpper', 'dFooter', 'dTop'];
	let palette = paletteTransWhiteBlack(divs.length + 2); //console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }, { id: names[i] }));

	//mDom(dPageTitle,{family:'cambria',maleft:10},{tag:'h1',html:'relief station'});
	mStyle(dFooter,{padding:0,margin:0},{html:'copyright Chillax.inc 2024'})
	let sidebar = mSidebar(dSymLeft, dSideLeft); console.log(sidebar);

	let hmax = dUpper.offsetHeight; console.log(hmax)
	let stupper = { hmax, overy: 'auto', h:hmax };
	let stimage = {}; //{ w:'32%',bg: rColor(), fg: 'contrast', hline: 'normal' }
	mStyle(dUpper, stupper); //{ margin: 0, padding:'auto' })
	//mCenterFlex(dUpper);
	//mStyle(dUpper,{display:'flex','flex-wrap':true,hpadding:0,vpadding:'1%', overy:'scroll',hmax:dUpper.offsetHeight,gap:'1%'})
	let images = M.recipes = await mGetFiles('../assets/img/recipes'); //	console.log('images', images);
	//images.forEach(img => mDom(dUpper, stimage, { tag: 'img', src: '../assets/img/recipes/' + img }));


}
async function test8() { await prelims(); }
async function test7_recipes() {
	let d0 = mBy('dBody');
	mStyle(d0, { bg: 'red', h: '100vh', hmin: '100vh', hmax: '100vh', overy: 'hidden' });	//console.log(d0); 
	let [dSideLeft, dUpper, dFooter, dTop] = recipesLayout(d0); //return;
	mStyle(dUpper, { overy: 'scroll', hmax: dUpper.offsetHeight, gap: 9 })
	let images = M.recipes = await mGetFiles('../assets/img/recipes'); //	console.log('images', images);
	images.forEach(img => mDom(dUpper, { w: '32%', bg: rColor(), fg: 'contrast', hline: 'normal' }, { tag: 'img', src: '../assets/img/recipes/' + img }));


}
async function test7_mist() {


	return;
	let d1 = mBodyResetter('powderblue'); return;
	let [dSideLeft, dUpper, dFooter, dTop] = recipesLayout(d1);

	//load recipe images from '../assets/img/recipes'
	let images = await mGetFiles('../assets/img/recipes');
	console.log('images', images);
	images = images.map(img => '../assets/img/recipes/' + img);
	images.forEach(img => mDom(dUpper, { h: 200, bg: rColor(), fg: 'contrast', hline: 'normal' }, { tag: 'img', src: img }));

	//mDom(dUpper,{h:2000,bg:'skyblue'},{html:'hallo'})
}
async function test6_msGridVarianten() {
	let d1 = mBodyResetter('green');
	let [dTop, dMainTop, dMainBottom, dFooter] = mGridRows(d1, 'auto 1fr 1fr auto');
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	let [dSideLeft, dUpper] = mGridCols(dMainTop, 'auto 1fr');
	let [dLower, dSideRight] = mGridCols(dMainBottom, '1fr auto');
	let divs = [dSideLeft, dUpper, dLower, dSideRight, dFooter, dTop];
	let palette = paletteTransWhiteBlack(divs.length + 2); console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }));
	mSidebar(dSymLeft, dSideLeft);
	mSidebar(dSymRight, dSideRight);

	//wenn ich jetzt in das top window zeug reinschreibe, dann ist es ja scrollable
	//also ist top row sowieso immer da!
	mStyle(dUpper, { overy: 'scroll', hmax: dUpper.offsetHeight, padding: 0 })
	mDom(dUpper, { h: 2000, bg: 'skyblue' }, { html: 'hallo' })
}
async function test5_justLeftSidebar() {
	let d1 = mBodyResetter('green');
	let [dTop, dSideLeft, dMain, dSideRight, dFooter] = mLayout5(d1);
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	mRemove(dFooter); mRemove(dSideRight); mRemove(dSymRight);
	divs = [dSideLeft, dMain, dFooter, dTop];
	let palette = paletteTransWhiteBlack(divs.length + 2); console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }));
	mSidebar(dSymLeft, dSideLeft);
	mStyle(dPageTitle, { family: 'algerian', hpadding: 10 }, { html: 'My Recipes' });

	mStyle(d1, { bg: 'orange' }); //change pagee color
}
async function test4_justLeftSidebar() {
	let d1 = mBodyResetter('green');
	let [dTop, dSideLeft, dMain, dSideRight, dFooter] = mLayout5(d1);
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	mRemove(dFooter); mRemove(dSideRight); mRemove(dSymRight);
	divs = [dSideLeft, dMain, dFooter, dTop];
	let palette = paletteTransWhiteBlack(divs.length + 2); console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }));
	mSidebar(dSymLeft, dSideLeft);
	mStyle(dPageTitle, { family: 'algerian', hpadding: 10 }, { html: 'My Recipes' });
}
async function test4_justLeftSidebarFooter() {
	let d1 = mBodyResetter('lime');
	let [dTop, dSideLeft, dMain, dSideRight, dFooter] = mLayout5(d1);
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	mRemove(dSideRight); mRemove(dSymRight);
	divs = [dSideLeft, dMain, dFooter, dTop];
	let palette = paletteTransWhiteBlack(divs.length + 2); console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }));
	mSidebar(dSymLeft, dSideLeft);
	mStyle(dPageTitle, { family: 'algerian', hpadding: 10 }, { html: 'My Recipes' });
}
async function test4_2SidebarsFooter() {
	let d1 = mBodyResetter('skyblue');
	let [dTop, dSideLeft, dMain, dSideRight, dFooter] = mLayout5(d1);
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);
	divs = [dSideLeft, dMain, dSideRight, dFooter, dTop];//dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight];
	let palette = paletteTransWhiteBlack(divs.length + 2); console.log(palette);
	divs.forEach((div, i) => mStyle(div, { padding: 8, bg: palette[i + 1], fg: 'contrast' }));
	//divs.forEach((div, i) => div.innerHTML = `D${i}`);
	mSidebar(dSymLeft, dSideLeft);
	mSidebar(dSymRight, dSideRight);

	mStyle(dPageTitle, { family: 'algerian', hpadding: 10 }, { html: 'My Recipes' });

}
async function test3() {
	let d1 = mBodyResetter('crimson');

	let [dTop, dSideLeft, dMain, dSideRight, dFooter] = mLayout5(d1);
	//dTop.innerHTML = '';
	// let [dPageTitle, dTopMenu, dUser] = mLayoutLine3(dTop);
	let [dSymLeft, dPageTitle, dTopMenu, dUser, dSymRight] = mLayoutLine5(dTop);

	mDom(dPageTitle, { margin: 10, wbox: true }, { tag: 'h1', html: 'My Place' });
	let bHome = mDom(dTopMenu, { margin: 10, wbox: true }, { tag: 'button', html: 'Home' });
	mDom(dUser, { margin: 10, wbox: true }, { html: 'Guest' });

	let divs = [dTop, dSideLeft, dMain, dSideRight, dFooter];
	let palette = paletteTransWhiteBlack(7);
	console.log(palette);
	//give each div bg from palette
	//for (let i = 0; i < divs.length; i++) divs[i].style.backgroundColor = palette[i];
	divs.forEach((div, i) => mStyle(div, { bg: palette[i + 1], fg: 'contrast' }));

	// dSymLeft.innerHTML =  getMenuSymbol();
	// dSymRight.innerHTML =  getMenuSymbol();
	dSideLeft.innerHTML = 'Side Left';
	dSideRight.innerHTML = 'Side Right';
	dFooter.innerHTML = 'Footer';

	sidebarStyle(dSideLeft);
	sidebarControl(dSymLeft, dSideLeft);
	sidebarStyle(dSideRight);
	sidebarControl(dSymRight, dSideRight);
	bHome.onclick = () => sidebarToggle(dSideLeft);

}
async function test2() {
	let d0 = document.body;
	mClass(d0, 'reset100'); console.log(d0.offsetWidth, d0.offsetHeight);
	let margin = 10;
	let d1 = mDom(d0, { bg: 'lightblue', position: 'absolute', left: margin, top: margin, right: margin, bottom: margin })

	// let d1=mDom(document.body, {bg:'lightblue', w:'100%', h:'100%'}); //geht
	//let d1=mDom(document.body, {wbox:true, margin:10, bg:'lightblue', w:'100%', h:'100%'}); //geht
	//let d=mDom(dPage, {bg:'green', w:'100%',h:50, margin:10, wbox:true});
}
async function test_0_NO() {
	let dPage = mPage({ bg: 'lightblue' }); console.log(getRect(dPage));
	return;
	let [w, h, margin, padding, border, sz] = [500, 500, 0, 0, 8, 50]; //25;
	let d = mDom(dPage, { bg: 'red', w100: true, h100: true, margin, padding }); //,{fg:'red'},{html:'hallo'}); //return;
	//let dParent = mDom(d, { w, h, margin, padding, bg: 'red', fg: 'contrast' },{html:'Hello!'}); //, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding }, { id: 'dCanvas' });
}
async function test1() {
	let d1 = mDom(document.body, { bg: 'red', hline: 0, margin: 0 }, { html: '&nbsp;' });
	let [w, h, margin, padding, border, sz] = [500, 500, 20, 30, 8, 50]; //25;
	let dParent = mDom(d1, { w, h, bg: 'inherit', fg: 'contrast' }); //, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding }, { id: 'dCanvas' });
	showStyles(dParent);
	let d = mDom(dParent, { w: sz, h: sz, margin }, { html: 'hallo' }); //default is bg=rgba(0,0,0,0) fg=rgb(0,0,0)
	showStyles(d);
}
async function test0() {
	await prelims();
}
async function preprelims() {
	ColorThiefObject = new ColorThief();//console.log(ColorThiefObject);
	let t1 = performance.now();
	Serverdata = await mGetRoute('session'); //session ist: users,config,events
	let t2 = performance.now();
	await loadAssets();
	let textures = await mGetFiles(`../assets/textures`);
	M.textures = textures.map(x => `../assets/textures/${x}`); //console.log('textures',M.textures)
}
async function prelims() {
	await preprelims();
	let t4 = performance.now();
	sockInit();
	let t5 = performance.now();
	window.onkeydown = keyDownHandler;
	window.onkeyup = keyUpHandler;
	DA.funcs = { setgame: setgame(), lacuna: lacuna(), fishgame: fishgame(), button96: button96() }; //implemented games!
	for (const gname in Serverdata.config.games) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}

	let html = `
    <div style="position:fixed;width:100%;z-index:20000">
      <div id="dNav" class="nav p10"></div>
      <div id="dMessage" style='height:0px;padding-left:10px' class="transh"></div>
    </div>
    <div id="dBuffer" style="height:32px;width:100%" class="nav"></div>
    <div id="dExtra" class="p10hide nav"></div>
    <div id="dTitle"></div>
    <div id="dPage" style="display:grid;grid-template-columns: auto 1fr auto;">
      <div id="dLeft" class="mh100 over0 translow nav">
      </div>
      <div id="dMain"></div>
      <div id="dRight" class="mh100 over0 translow"></div>
    </div>
    <d id="dBottom"></d>
    
    `;
	document.body.innerHTML = html;
	UI.dTitle = mBy('dTitle');
	UI.commands = {};
	UI.nav = showNavbar(); //console.log(UI.nav)
	staticTitle();
	let cmd = UI.nav.commands.user = mCommand(UI.nav.elem, 'user'); //console.log(cmd)
	iDiv(cmd).classList.add('activeLink');
	await switchToUser(localStorage.getItem('username'), localStorage.getItem('menu'));
}

