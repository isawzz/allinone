
async function mToggleButton(dParent, styles = {}) {
	addKeys({ display: 'flex', wrap: 'wrap', aitems: 'center' }, styles)
	let d1 = mDom(dParent, styles);
	let list = Array.from(arguments).slice(2);
	let buttons = [];
	let style = { className: 'no_select', display: 'flex', 'flex-wrap': 'nowrap', aitems: 'center', cursor: 'pointer' };

	let words = list.map(x => x.label);
	let hasKey = list.some(x => x.key);
	let w = getMaxWordWidth(words, d1) + (hasKey ? styles.h * 1.35+2 : 10); console.log(w);
	mStyle(d1, { w });

	for (const l of list) {

		let b = mDom(d1, style, { onclick: l.onclick });
		mDom(b, { maright: 6, 'white-space': 'nowrap' }, { html: l.label });
		if (l.key) await mKey(l.key, b, { h: styles.h, w: styles.h, fz: styles.h }); //:fz:valf(styles.h,50) });

		// let dAuto = mDom(d1,{ cursor: 'pointer'}, { onclick: uiAuto });	
		// mDom(dAuto, {}, { html: 'uiState:' });
		// await mKey('display', dAuto,{sz:24});

		buttons.push(b);

	}

	return mToggleCompose(...buttons);

}
function mToggleCompose() {
	let list = Array.from(arguments);
	if (isEmpty(list)) return;
	let dParent = list[0].parentNode;
	let tb = mDom(dParent);
	let n = list.length;
	let i = 0;
	for (const b of list) {
		mAppend(tb, b);
		b.setAttribute('idx', i++);
		if (i < n) mStyle(b, { display: 'none' });
	}
	tb.onclick = ev => {
		let idx = Number(evToAttr(ev, 'idx'));
		let inew = (idx + 1) % n;
		let b = list[inew];
		list.map(x => mStyle(x, { display: 'none' }));
		mStyle(b, { display: 'flex' });
	}
	return tb;
}
async function postUsers() {
	let users = jsonToYaml(M.users);
	let res = await mPhpPost('mox0', { action: 'savey', file: 'users', o: M.users });
	console.log('res', res);
}
function firstVisibleChild(div) {
	if (!div || !div.children) return null;

	for (const child of div.children) {
		const style = window.getComputedStyle(child);
		if (style.display !== 'none') {
			return child;
		}
	}

	return null; // if none are visible
}
function presentStandardBGA() {
  let dTable = mDom('dMain');
  mClass('dPage', 'wood');
  let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dTable); mFlexWrap(dOpenTable)
  mDom(dRechts, {}, { id: 'dStats' });
}
function presentStandardRoundTable() {
  d = mDom('dMain'); mCenterFlex(d);
  mDom(d, { className: 'instruction' }, { id: 'dInstruction' }); mLinebreak(d); // instruction
  mDom(d, {}, { id: 'dStats' }); mLinebreak(d);
  let minTableSize = 400;
  let dTable = mDom(d, { hmin: minTableSize, wmin: minTableSize, margin: 20, round: true, className: 'wood' }, { id: 'dTable' });
  mCenterCenter(dTable);
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function isMyTurn(table) { return table.turn.includes(UGetName()) }

function applyOpts(d, opts = {}) {
	const aliases = {
		classes: 'className',
		inner: 'innerHTML',
		html: 'innerHTML',
		w: 'width',
		h: 'height',
	};
	for (const opt in opts) {
		let name = valf(aliases[opt], opt), val = opts[opt];
		if (name == 'fClick') { d.onclick = async (ev) => { recUserEvent(); await val(ev); } }
		else if (['style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
		else d.setAttribute(name, val);
	}
}
function getMaxWordWidth(words, div) {
  if (!div || !Array.isArray(words)) return 0;

  // Create a hidden span to measure word widths
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  span.style.top = '-9999px';
  span.style.left = '-9999px';

  // Copy font and style from the div
  const computedStyle = window.getComputedStyle(div);
  span.style.font = computedStyle.font;
  span.style.fontSize = computedStyle.fontSize;
  span.style.fontFamily = computedStyle.fontFamily;
  span.style.fontWeight = computedStyle.fontWeight;
  span.style.letterSpacing = computedStyle.letterSpacing;
  span.style.wordSpacing = computedStyle.wordSpacing;
  span.style.textTransform = computedStyle.textTransform;

  document.body.appendChild(span);

  let maxWidth = 0;

  for (const word of words) {
    span.textContent = word;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }

  document.body.removeChild(span);
  return maxWidth;
}
function mFlex(d, wrap = true, halign = 'start', valign = 'center', row = true) {
	d = toElem(d);
	mStyle(d, {
		display: 'flex',
		'flex-wrap': wrap ? 'wrap' : 'nowrap',
		'flex-direction': row ? 'row' : 'column',
		'align-items': row ? valign : halign,
		'justify-content': row ? halign : valign
	});
}
async function tablesDeleteAll() {
	let res = await mPhpPost('mox0', { action:'delete_dir', dir: 'tables' });
	console.log('res',res);
	DA.tid = null;
	DA.tData = null;
	localStorage.removeItem('tid');
	M.tables = {};
	mClear('dTopLeft');
	await showGamesAndTables();
}


