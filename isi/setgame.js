const symbols = ['●', '▲', '■'];     // Oval, Triangle, Square
const colors = ['red', 'green', 'purple'];
const shadings = ['solid', 'striped', 'open'];

// Decode card from index (0–80)
function decodeCard(index) {
  const number = (index % 3) + 1;
  const symbol = Math.floor(index / 3) % 3;
  const shading = Math.floor(index / 9) % 3;
  const color = Math.floor(index / 27) % 3;
  return { number, symbol, shading, color };
}

// Render card into a <div>
function renderCard(index) {
  const card = decodeCard(index);
  const symbolChar = symbols[card.symbol];
  const color = colors[card.color];
  const container = document.createElement('div');
  container.className = 'card';
  container.style.border = '1px solid #333';
  container.style.padding = '10px';
  container.style.margin = '5px';
  container.style.display = 'inline-block';
  container.style.textAlign = 'center';
  container.style.fontSize = '32px';
  container.style.color = color;

  let display = '';
  for (let i = 0; i < card.number; i++) {
    display += symbolChar + ' ';
  }

  if (card.shading === 1) {
    container.style.opacity = 0.5; // striped = semi-transparent
  } else if (card.shading === 2) {
    container.style.backgroundColor = '#fff'; // open = white bg
    container.style.borderStyle = 'dashed';
  }

  container.textContent = display.trim();
  return container;
}
function setDrawCard(card, dParent, colors, sz = 100) {
	const paths = {
		diamond: "M25 0 L50 50 L25 100 L0 50 Z",
		squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
		oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
	}
	let [color, shape, num, fill] = card.split('_');
	var attr = {
		d: paths[shape],
		fill: fill == 'striped' ? `url(#striped-${color})` : fill == 'solid' ? colors[color] : 'none',
		stroke: colors[color],
		'stroke-width': 2,
	};
	let h = sz, w = sz / .65;
	let ws = w / 4;
	let hs = 2 * ws;
	let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
	mStyle(d0, { justify: 'center', 'align-items': 'center', gap: 6 })
	let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
	for (const i of range(num)) {
		let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
	}
	return d0;
}

// Example usage:
function showCards(indices=null){
	//if indices is undefined add 12 random numbers between 0 and 80
	if (!indices){
		indices = Array.from({length: 12}, () => Math.floor(Math.random() * 81));
	
	}
	
	const area = document.getElementById('game-area');
  for (const i of indices) {
    area.appendChild(renderCard(i));
  }
}  
