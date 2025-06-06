
function createCard(rank = "10", suit = "♣", height=200, width) {
  if (nundef(width)) width=height*.7;
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = Math.max(4,width/20) + 'px';//`${width/20}px;`; //"12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";
  card.style.fontFamily = '"DejaVu Sans", "Arial Unicode MS", sans-serif';

  const centerX = width / 2;
  const colOffset = width * 0.2;
  const colX = [centerX - colOffset, centerX, centerX + colOffset];

  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3.3;

  const pipPatterns = {
    1:  [[1, [1.5]]],
    2:  [[1, [0, 3]]],
    3:  [[1, [0, 1.5, 3]]],
    4:  [[0, [0, 3]], [2, [0, 3]]],
    5:  [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6:  [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7:  [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8:  [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9:  [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]],
    11:  [[0, [0, 1, 2, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1, 2, 3]]],
    //10: [[0, [0, 1, 2, 3]], [1, [1, 2]], [2, [0, 1, 2, 3]]], // 4-2-4 layout
  };

  const value = parseInt(rank);
  const pipData = pipPatterns[value];
  const pipFontSize = height * .2;// 0.09;

  pipData.forEach(([col, rows]) => {
    rows.forEach(rowIndex => {
      const pip = document.createElement("div");
      pip.textContent = suit;
      pip.style.position = "absolute";
      pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
      pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
      pip.style.fontSize = pipFontSize + "px";
      if (rowIndex === 3) pip.style.transform = "rotate(180deg)";
      card.appendChild(pip);
    });
  });
  // pipData.forEach(([col, rows]) => {
  //   rows.forEach(rowIndex => {
  //     const pip = document.createElement("div");
  //     pip.textContent = suit;
  //     pip.style.position = "absolute";
  //     pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
  //     pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
  //     pip.style.fontSize = pipFontSize + "px";
  //     card.appendChild(pip);
  //   });
  // });

  // Top-left corner
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.innerHTML = `<div style="line-height:1">${rank}<span style="display:block; line-height:0.9;">${suit}</span></div>`;

  top.style.position = "absolute";
  top.style.left = "3px";
  top.style.top = "3px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right corner, rotated
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "3px";
  bottom.style.top = "";
  bottom.style.bottom = "3px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}

function createCard1(rank = "10", suit = "♣", width = 240, height = 336) {
  const layout = {
    '2': [[1, 0], [1, 4]],
    '3': [[1, 0], [1, 2], [1, 4]],
    '4': [[0, 0], [2, 0], [0, 4], [2, 4]],
    '5': [[0, 0], [2, 0], [1, 2], [0, 4], [2, 4]],
    '6': [[0, 0], [2, 0], [0, 2], [2, 2], [0, 4], [2, 4]],
    '7': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4]],
    '8': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4], [1, 3]],
    '9': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4], [1, 3], [1, 2]],
    '10': [[0, 0], [2, 0], [0, 1.5], [2, 1.5], [1, 1], [1, 2], [1, 3], [0, 3.5], [2, 3.5], [0, 4]],
  };

  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = "12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";

  const colX = [0.2, 0.5, 0.8].map(x => x * width);
  const rowY = [0.08, 0.23, 0.38, 0.53, 0.68].map(y => y * height);

  layout[rank].forEach(([col, row]) => {
    const pip = document.createElement("div");
    pip.textContent = suit;
    pip.style.position = "absolute";
    pip.style.left = (colX[col] - 10) + "px";
    pip.style.top = (rowY[row] - 12) + "px";
    pip.style.fontSize = Math.floor(height * 0.09) + "px";
    card.appendChild(pip);
  });

  // Top-left corner: rank and suit
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.style.position = "absolute";
  top.style.left = "4px";
  top.style.top = "2px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right corner (rotated)
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "4px";
  bottom.style.top = "";
  bottom.style.bottom = "2px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}
function createCard2(rank = "10", suit = "♣", width = 240, height = 336) {
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = "12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";

  const centerX = width / 2;
  const colOffset = width * 0.25; // for left/right columns
  const colX = [centerX - colOffset, centerX, centerX + colOffset];

  const numRows = 4; // max for side columns
  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / (numRows - 1);

  // Pip positions for 10: 4-3-4 in 3 columns
  const pipData = [
    [0, [0, 1, 2, 3]],     // left column
    [1, [0.5, 2, 3.5]],    // center column (slightly staggered)
    [2, [0, 1, 2, 3]]      // right column
  ];

  pipData.forEach(([col, rows]) => {
    rows.forEach(rowIndex => {
      const pip = document.createElement("div");
      pip.textContent = suit;
      pip.style.position = "absolute";
      pip.style.left = (colX[col] - width * 0.035) + "px";
      pip.style.top = (topMargin + pipSpacing * rowIndex - height * 0.045) + "px";
      pip.style.fontSize = Math.floor(height * 0.09) + "px";
      card.appendChild(pip);
    });
  });

  // Top-left: rank and suit
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.style.position = "absolute";
  top.style.left = "6px";
  top.style.top = "4px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right: rotated rank and suit
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "6px";
  bottom.style.top = "";
  bottom.style.bottom = "4px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}
function createCard3(rank = "10", suit = "♣", width = 240, height = 336) {
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = "12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";

  const centerX = width / 2;
  const colOffset = width * 0.25;
  const colX = [centerX - colOffset, centerX, centerX + colOffset];

  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3;

  // Pip patterns for ranks 1 (Ace) to 10
  const pipPatterns = {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1.5, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1.5, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2, 3.5]], [2, [0, 1, 2, 3]]]
  };

  const value = parseInt(rank);
  const pipData = pipPatterns[value];
  const pipFontSize = height * 0.09;

  pipData.forEach(([col, rows]) => {
    rows.forEach(rowIndex => {
      const pip = document.createElement("div");
      pip.textContent = suit;
      pip.style.position = "absolute";
      pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
      pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
      pip.style.fontSize = pipFontSize + "px";
      card.appendChild(pip);
    });
  });

  // Top-left: rank and suit
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.style.position = "absolute";
  top.style.left = "6px";
  top.style.top = "4px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right: rotated rank and suit
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "6px";
  bottom.style.top = "";
  bottom.style.bottom = "4px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}
function createCardGrid(rank = "10", suit = "♣", width = 240, height = 336) {
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = "12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";
  card.style.display = "grid";
  card.style.gridTemplateColumns = "1fr 1fr 1fr";
  card.style.gridTemplateRows = "repeat(12, 1fr)";
  card.style.boxSizing = "border-box";

  const pipFontSize = height * 0.09;

  // Left column (4 pips spanning 3 rows each)
  [0, 3, 6, 9].forEach(row => {
    const pip = document.createElement("div");
    pip.textContent = suit;
    pip.style.gridColumn = "1";
    pip.style.gridRow = `${row + 1} / span 3`;
    pip.style.fontSize = `${pipFontSize}px`;
    pip.style.display = "flex";
    pip.style.alignItems = "center";
    pip.style.justifyContent = "center";
    card.appendChild(pip);
  });

  // Right column (4 pips spanning 3 rows each)
  [0, 3, 6, 9].forEach(row => {
    const pip = document.createElement("div");
    pip.textContent = suit;
    pip.style.gridColumn = "3";
    pip.style.gridRow = `${row + 1} / span 3`;
    pip.style.fontSize = `${pipFontSize}px`;
    pip.style.display = "flex";
    pip.style.alignItems = "center";
    pip.style.justifyContent = "center";
    card.appendChild(pip);
  });

  // Center column (2 pips spanning 4 rows each, centered vertically)
  [2, 6].forEach(row => {
    const pip = document.createElement("div");
    pip.textContent = suit;
    pip.style.gridColumn = "2";
    pip.style.gridRow = `${row + 1} / span 4`;
    pip.style.fontSize = `${pipFontSize}px`;
    pip.style.display = "flex";
    pip.style.alignItems = "center";
    pip.style.justifyContent = "center";
    card.appendChild(pip);
  });

  // Top-left corner: rank and suit
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.style.position = "absolute";
  top.style.left = "6px";
  top.style.top = "4px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right corner: rotated rank and suit
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "6px";
  bottom.style.top = "";
  bottom.style.bottom = "4px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}
function createCard343(rank = "10", suit = "♣", width = 240, height = 336) {
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = "12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";
  card.style.display = "grid";
  card.style.gridTemplateColumns = "1fr 1fr 1fr";
  card.style.gridTemplateRows = "repeat(12, 1fr)";
  card.style.boxSizing = "border-box";

  const pipFontSize = height * 0.09;

  // Utility to create and place a pip
  function placePip(col, row, span) {
    const pip = document.createElement("div");
    pip.textContent = suit;
    pip.style.gridColumn = col;
    pip.style.gridRow = `${row} / span ${span}`;
    pip.style.fontSize = `${pipFontSize}px`;
    pip.style.display = "flex";
    pip.style.alignItems = "center";
    pip.style.justifyContent = "center";
    card.appendChild(pip);
  }

  // Left column: 3 pips (each spans 3 rows), centered in 12 rows
  [1, 5, 9].forEach(r => placePip(1, r, 3));

  // Center column: 4 pips (each spans 2 rows), evenly spaced
  [1, 4, 7, 10].forEach(r => placePip(2, r, 2));

  // Right column: 3 pips (each spans 3 rows), same as left
  [1, 5, 9].forEach(r => placePip(3, r, 3));

  // Top-left corner: rank and suit
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.style.position = "absolute";
  top.style.left = "6px";
  top.style.top = "4px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);

  // Bottom-right corner: rotated rank and suit
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "6px";
  bottom.style.top = "";
  bottom.style.bottom = "4px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);

  return card;
}

function createImageSymbol(src, id) {
  return `
			<symbol id="${id}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
				<image href="${src}" x="0" y="0" width="100" height="100" />
			</symbol>
		`;
}
function createCardSVG(face, valueSymbolId, suitSymbolId) {
  const xmlns = "http://www.w3.org/2000/svg";
  const xlink = "http://www.w3.org/1999/xlink";

  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("class", "card");
  svg.setAttribute("face", face);
  svg.setAttribute("viewBox", "-120 -168 240 336");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("xmlns", xmlns);
  svg.setAttribute("xmlns:xlink", xlink);

  // Background rect
  const rect = document.createElementNS(xmlns, "rect");
  rect.setAttribute("x", "-119.5");
  rect.setAttribute("y", "-167.5");
  rect.setAttribute("width", "239");
  rect.setAttribute("height", "335");
  rect.setAttribute("rx", "12");
  rect.setAttribute("ry", "12");
  rect.setAttribute("fill", "white");
  rect.setAttribute("stroke", "black");
  svg.appendChild(rect);

  // Top left value
  const valueUse = document.createElementNS(xmlns, "use");
  valueUse.setAttributeNS(xlink, "xlink:href", `#${valueSymbolId}`);
  valueUse.setAttribute("x", "-114.4");
  valueUse.setAttribute("y", "-156");
  valueUse.setAttribute("height", "32");
  svg.appendChild(valueUse);

  // Top left suit
  const suitUse = document.createElementNS(xmlns, "use");
  suitUse.setAttributeNS(xlink, "xlink:href", `#${suitSymbolId}`);
  suitUse.setAttribute("x", "-111.784");
  suitUse.setAttribute("y", "-119");
  suitUse.setAttribute("height", "26.769");
  svg.appendChild(suitUse);

  // Center pip
  const centerUse = document.createElementNS(xmlns, "use");
  centerUse.setAttributeNS(xlink, "xlink:href", `#${suitSymbolId}`);
  centerUse.setAttribute("x", "-35");
  centerUse.setAttribute("y", "-135.501");
  centerUse.setAttribute("height", "70");
  svg.appendChild(centerUse);

  // Mirrored bottom
  const g = document.createElementNS(xmlns, "g");
  g.setAttribute("transform", "rotate(180)");

  const valueUse2 = valueUse.cloneNode();
  const suitUse2 = suitUse.cloneNode();
  const centerUse2 = centerUse.cloneNode();

  g.appendChild(valueUse2);
  g.appendChild(suitUse2);
  g.appendChild(centerUse2);
  svg.appendChild(g);

  return svg;
}
function generateSvgWithImage(imageSrc, width = 100, height = 100) {
  if (!imageSrc || typeof imageSrc !== 'string') {
    console.error("Invalid image source provided to generateSvgWithImage.");
    return ''; // Return empty string or handle error as appropriate
  }

  const svgCode = `
			<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<image xlink:href="${imageSrc}" x="0" y="0" width="${width}" height="${height}"/>
			</svg>
	`;

  return svgCode;
}
function displaySymbol(symbolString, containerDiv) {
  // Create an SVG wrapper and insert the symbol into <defs>
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Extract the symbol ID
  const idMatch = symbolString.match(/<symbol[^>]*id=['"]([^'"]+)['"]/);
  if (!idMatch) {
    console.error("Symbol ID not found");
    return;
  }
  const symbolId = idMatch[1];

  // Insert the symbol definition
  tempSvg.innerHTML = `
    <defs>${symbolString}</defs>
    <use href="#${symbolId}" x="0" y="0" />
  `;

  // Style it (optional)
  tempSvg.setAttribute("width", "100");
  tempSvg.setAttribute("height", "100");

  // Append the SVG to the container div
  containerDiv.innerHTML = ""; // Clear previous content
  containerDiv.appendChild(tempSvg);
}

function filterKeys(collection, cat, func) {
  let keys = isdef(collection) ? M.byCollection[collection] : M.names;
  if (isdef(cat)) {
    let catKeys = M.byCat[cat]; //console.log(catKeys)
    keys = keys.filter(x => catKeys.includes(x));
  }
  if (isdef(func)) keys = keys.filter(x => func(M.superdi[x]));
  return keys;
}

function updateSuit(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 1); }
function updateRank(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 0); }
function updateCardValue(svgStr, newLabel, index = 0) {
  // Step 1: Extract all symbol IDs
  const symbolIdMatches = [...svgStr.matchAll(/<symbol id='([^']+)'/g)];
  const symbolIds = symbolIdMatches.map(match => match[1]);

  console.log('symbolIds', symbolIds); //return;

  // Step 2: Find the one for the value label (starts with 'VD')
  const valueSymbolId = symbolIds[index]; // symbolIds.find(id => id.startsWith('VD'));
  if (!valueSymbolId) return svgStr; // Fail-safe: nothing to change

  // Step 3: Replace the contents of that symbol with a text element
  const updatedSvg = svgStr.replace(
    new RegExp(`<symbol id='${valueSymbolId}'[^>]*>[\\s\\S]*?<\\/symbol>`),
    `<symbol id='${valueSymbolId}' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
       <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
     </symbol>`
  );

  return updatedSvg;
}
function replaceCardLabel(svgStr, newLabel) {
  // Replace the #VD2 symbol definition with a text element
  svgStr = svgStr.replace(
    /<symbol id='VD2'[^>]*>[\s\S]*?<\/symbol>/,
    `<symbol id='VD2' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
      <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
    </symbol>`
  );

  return svgStr;
}
function replaceCardRank(svgStr, newLabel) {
  // Match the value symbol ID, e.g., id='VD2', id='VDQ', etc.
  const match = svgStr.match(/<symbol id='(VD[^']*)'/);
  if (!match) return svgStr; // Fail-safe: return original if not found

  const symbolId = match[1]; console.log('symbolId', symbolId)

  // Replace that symbol's content with a <text> element showing newLabel
  const updatedSvg = svgStr.replace(
    new RegExp(`<symbol id='${symbolId}'[^>]*>[\\s\\S]*?<\\/symbol>`),
    `<symbol id='${symbolId}' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
       <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
     </symbol>`
  );

  return updatedSvg;
}


function extractSymbols(svgString, symbolDict) {
  const symbolRegex = /<symbol id='([^']+)'[^>]*>[\s\S]*?<\/symbol>/g;

  let match;
  while ((match = symbolRegex.exec(svgString)) !== null) {
    const id = match[1];
    const fullSymbol = match[0];
    symbolDict[id] = fullSymbol;
  }

}

function downloadAsYaml(o, filename) {
  let y = jsyaml.dump(o);
  downloadAsText(y, filename + '.yaml');
}

function downloadAsText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
