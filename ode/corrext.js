
function clearDiv(dParent, styles = {}, opts = {}) {
  if (nundef(dParent)) dParent = document.body;
  addKeys({ className: 'h100', hline: 0 }, styles);
  addKeys({ html: '&nbsp;' }, opts);
  dParent.innerHTML = '';
  return mDom(dParent, styles, opts);
}
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
  let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
  mStyle(dParent, styles);
  let res = [];
  for (let i = 0; i < chflex.length; i++) {
    let bg = isdef(bgs) ? bgs[i] : null;
    let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
    res.push(d1);
  }
  return res;
}
function _mStyle(elem, styles = {}) {
  styles = jsCopy(styles);
	elem = toElem(elem);

  if (isdef(styles.bg) || isdef(styles.fg)) {
    console.log(styles.bg,styles.fg);
    let [bg,fg] = [styles.bg, styles.fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha); console.log(bg,fg);

  }
	if (isdef(styles.w100)) {delete styles.w100; styles.w = '100%';}
	if (isdef(styles.h100)) {delete styles.h100; styles.h = '100%';}
	if (isdef(styles.box)) {delete styles.box; styles['box-sizing'] = 'border-box';}
	if (isdef(styles.round)) {delete styles.round; styles.rounding = '50%';}
	let styleParams = STYLE_PARAMS;
	for (const k in styles) {
		if (['w100', 'h100', 'round', 'box'].includes(k)) continue;
		let val = styles[k];
		let key = valf(styleParams[k],k);
		if (k.includes('class')) elem.classList.add(val); 
    else if (k.startsWith('grid')) elem.style.setProperty(key, `repeat(${val}, 1fr)`);
		else elem.style.setProperty(key, isNumber(val) ? val + 'px' : val);
	}
}
function colorToHex79(c) {
  if (colorIsHex79(c)) return c;
  ColorDi = M.colorByName;
  let tString = isString(c), tArr = isList(c), tObj = isDict(c);
  if (tString && c[0] == '#') return colorHex45ToHex79(c);
  else if (tString && isdef(ColorDi) && lookup(ColorDi, [c])) return ColorDi[c].hex;
  else if (tString && c.startsWith('rand')) {
    let spec = capitalize(c.substring(4));
    let func = window['color' + spec];
    c = isdef(func) ? func() : rColor();
    assertion(colorIsHex79(c), 'ERROR coloFrom!!!!!!!!! (rand)');
    return c;
  } else if (tString && (c.startsWith('linear') || c.startsWith('radial'))) return c;
  else if (tString && c.startsWith('rgb')) return colorRgbStringToHex79(c);
  else if (tString && c.startsWith('hsl')) return colorHsl360StringToHex79(c);
  else if (tString && c == 'transparent') return '#00000000';
  else if (tString && c == 'inherit') return 'inherit';
  else if (tString) { ensureColorDict(); let c1 = ColorDi[c]; assertion(isdef(c1), `UNKNOWN color ${c}`); return c1.hex; }
  else if (tArr && (c.length == 3 || c.length == 4) && isNumber(c[0])) return colorRgbArrayToHex79(c);
  else if (tArr) return colorToHex79(rChoose(tArr));
  else if (tObj && 'h' in c && c.h > 1) { return colorHsl360ObjectToHex79(c); } //console.log('!!!');
  else if (tObj && 'h' in c) return colorHsl01ObjectToHex79(c);
  else if (tObj && 'r' in c) return colorRgbArgsToHex79(c.r, c.g, c.b, c.a);
  assertion(false, `NO COLOR FOUND FOR ${c}`);
}



