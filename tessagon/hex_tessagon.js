
// Metadata object
const metaHex = {
	name: "Regular Hexagons",
	num_color_patterns: 2,
	classification: "regular",
	shapes: ["hexagons"],
	sides: [6],
	uv_ratio: 1.0 / Math.sqrt(3.0),
};

class HexTile extends Tile {
	// VERTS:
	// ..|..
	// ..a..  a = ['top', 'center']
	// ^  ./.\.  b = ['top', 'left']
	// |  b...c  c = ['top', 'right']
	// |  |...|  d = ['bottom', 'left']
	// |  d...e  e = ['bottom', 'right']
	// |  .\./.  f = ['bottom', 'center']
	//    ..f..
	// V  ..|..
	//
	//     U --->

	// FACES:
	// A.|.B
	// ..o..  A = ['top', 'left']
	// ^  ./.\.  B = ['top', 'right']
	// |  o...o  C = ['middle']
	// |  |.C.|  D = ['bottom', 'left']
	// |  o...o  E = ['bottom', 'right']
	// |  .\./.
	//    ..o..
	// V  D.|.E
	//
	//     U --->

	constructor(tessagon, kwargs = {}) {
		super(tessagon, kwargs);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}

	initVerts() {
		return {
			top: { left: null, center: null, right: null },
			bottom: { left: null, center: null, right: null },
		};
	}

	initFaces() {
		return {
			top: { left: null, right: null },
			middle: null,
			bottom: { left: null, right: null },
		};
	}

	calculateVerts() {
		// Symmetry allows you to get six verts for the price of two.

		// Also defines ['bottom', 'center']
		this.addVert(["top", "center"], 0.5, 5.0 / 6.0);

		// Also defines ['bottom', 'left'], ['bottom', 'right'], ['top', 'right']
		this.addVert(["top", "left"], 0, 2.0 / 3.0, { u_boundary: true });
	}

	calculateFaces() {
		// Symmetry allows creating five faces for the price of two

		this.addFace(
			"middle",
			[
				["top", "center"],
				["top", "left"],
				["bottom", "left"],
				["bottom", "center"],
				["bottom", "right"],
				["top", "right"],
			]
		);

		this.addFace(
			["top", "left"],
			[
				["top", "left"],
				["top", "center"],
				this.topTile(["bottom", "center"]),
				this.topTile(["bottom", "left"]),
				this.topLeftTile(["bottom", "center"]),
				this.leftTile(["top", "center"]),
			],
			{ corner: true }
		);
	}

	colorPattern1() {
		if (this.fingerprint[0] % 3 === 0) {
			this.colorPaths([["top", "left"], ["bottom", "left"]], 1, 0);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.colorPaths([["middle"]], 1, 0);
		} else {
			this.colorPaths([["top", "right"], ["bottom", "right"]], 1, 0);
		}
	}

	colorPattern2() {
		if (this.fingerprint[0] % 3 === 0) {
			this.colorPathsHash(
				{
					1: [["top", "left"], ["bottom", "left"]],
					2: [["top", "right"], ["bottom", "right"]],
				},
				0
			);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.colorPathsHash(
				{ 1: [["middle"]], 2: [["top", "left"], ["bottom", "left"]] },
				0
			);
		} else {
			this.colorPathsHash(
				{ 2: [["middle"]], 1: [["top", "right"], ["bottom", "right"]] },
				0
			);
		}
	}
}

class HexTessagon extends Tessagon {
	static tile_class = HexTile;
	static metadata = metaHex;
}
