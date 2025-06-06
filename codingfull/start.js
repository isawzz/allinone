onload = start;

async function start(){ loadColors(); await test2(); }

async function test2(){
	let d = document.body; d.innerHTML = '';
	mStyle(d,{w100:true,h100:true,bg:'fuchsia'})
	mClass(d, 'fullpage airport');
}

async function test2NO(){
	show_coding_ui();
}
async function test1() {
	test_ui_extended();
}	
async function test0() {
	test_ui_extended();
	await load_Codebase('../coding/cb/cb1');
	await load_assets_fetch('../base/', '../games/')

	// dTable = document.body; mClear(dTable); let x=get_user_pic_and_name()

	let [bundle, closure, csstext, html] = await bundleGenFromProject('codingfull', true);
	//await bundleGenerateFrom('../games/test.html'); 

	//let text = await cssGenerateFrom(['../belinda/css/base.css','../belinda/css/cards.css'], '../belinda/closure.js', '../belinda/html/index.html');
	AU.ta.value = csstext; //stringAfter(bundle, 'function getLineStart');
	//test_cleanup_css_clause();
	//await prettyCss('../games/basemin.css','../games/closure.js','../games/index.html');

}

function test_cleanup_css_clause() {
	let cl = `
	#sidebar {
		/* height: 100%;
		flex: 1 0 auto; */
		background-color: #ffffff80;
		box-sizing: border-box;
		padding: 12px;
		text-align: center;
	}
		`;
	let x = cssCleanupClause(cl, 'sidebar');
	console.log('x', x);

}
function testKoffer() {

	let s='29.2 in × 20.5 in × 12 in ';
	let nums=allNumbers(s);
	let nums2=nums.map(x=>x*2.54);
	console.log('nums2',nums2,arrSum(nums2))

	console.log('du sollst am 11.6. buchen?',coin()?'JA':'NEIN')
	return;
	let x = [55, 40, 20, 158, 40, 30, 10];
	console.log('baggage', x.map(x => (x / 2.54).toFixed(1)).join(' x '))
	console.log('weight', [10, 8].map(x => (x * 0.453592).toFixed(1)).join(' '))

	// let nums = allNumbers('18.31 x 11.42 x 26.77'); //.map(x => Number((x * 2.54).toFixed(1)));
	// console.log('nums',nums)
	// let sum = 0; for (const n of nums) sum += n; console.log('n', sum)
	// console.log('suit', allNumbers('18.31 x 11.42 x 26.77').map(x => (x * 2.54).toFixed(1)).join(' x '));
	// return;
	// console.log('baggage', x.map(x => Math.round(x / 2.54)).join(' x '))
	// console.log('weight', [10, 8].map(x => Math.round(x * 0.453592)).join(' '))
	// return;

}
function test_lineStart(lines) {
	AU.ta.value = lines.join('\n')
	let linestarts = [];
	for (const line of lines) {
		if (isLetter(line[0])) addIf(linestarts, 'letter')
		else addIf(linestarts, line[0])
	}
	console.log('linestarts', linestarts)

}
















