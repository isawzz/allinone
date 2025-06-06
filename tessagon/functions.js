
function rightTile(indexKeys) {
	return [['right'], indexKeys];
}

function leftTile(indexKeys) {
	return [['left'], indexKeys];
}

function topTile(indexKeys) {
	return [['top'], indexKeys];
}

function bottomTile(indexKeys) {
	return [['bottom'], indexKeys];
}

function leftTopTile(indexKeys) {
	return [['left', 'top'], indexKeys];
}

function leftBottomTile(indexKeys) {
	return [['left', 'bottom'], indexKeys];
}

function rightTopTile(indexKeys) {
	return [['right', 'top'], indexKeys];
}

function rightBottomTile(indexKeys) {
	return [['right', 'bottom'], indexKeys];
}

function bottomLeftTile(indexKeys) {
	return [['bottom', 'left'], indexKeys];
}

function bottomRightTile(indexKeys) {
	return [['bottom', 'right'], indexKeys];
}

function topLeftTile(indexKeys) {
	return [['top', 'left'], indexKeys];
}

function topRightTile(indexKeys) {
	return [['top', 'right'], indexKeys];
}

function getTessagonList(){
	return ["HexTessagon"];
	return  [
		'BigHexTriTessagon',
		'BrickTessagon',
		'CloverdaleTessagon',
		'DissectedHexQuadTessagon',
		"DissectedHexTriTessagon",
		"DissectedSquareTessagon",
		"DissectedTriangleTessagon",
		"DodecaTessagon",
		"DodecaTriTessagon",
		"FloretTessagon",
		"HexBigTriTessagon",
		"HexSquareTriTessagon",
		"HexTessagon",
		"HexTriTessagon",
		"IslamicHexStarsTessagon",
		"IslamicStarsCrossesTessagon",
		"OctoTessagon",
		"PentaTessagon",
		"Penta2Tessagon",
		"PythagoreanTessagon",
		"RhombusTessagon",
		"SquareTessagon",
		"SquareTriTessagon",
		"SquareTri2Tessagon",
		"StanleyParkTessagon",
		"TriTessagon",
		"ValemountTessagon",
		"WeaveTessagon",
		"ZigZagTessagon",
	];
}