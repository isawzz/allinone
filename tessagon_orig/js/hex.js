
const hex_metadata = new TessagonMetadata({
	name: "Regular Hexagons",
	num_color_patterns: 2,
	classification: "regular",
	shapes: ["hexagons"],
	sides: [6],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: { left: null, center: null, right: null },
			bottom: { left: null, center: null, right: null }
		};
	}
	init_faces() {
		return {
			top: { left: null, right: null },
			middle: null,
			bottom: { left: null, right: null }
		};
	}
	calculate_verts() {
		// Defines the vertex at ["top", "center"] and ["bottom", "center"]
		this.add_vert(["top", "center"], 0.5, 5.0 / 6.0);
		// Defines the vertices at ["top", "left"], ["bottom", "left"], and ["top", "right"]
		this.add_vert(["top", "left"], 0, 2.0 / 3.0, { u_boundary: true });
	}
	calculate_faces() {
		// Creates the middle face using six vertices
		this.add_face(
			"middle",
			[
				["top", "center"],
				["top", "left"],
				["bottom", "left"],
				["bottom", "center"],
				["bottom", "right"],
				["top", "right"]
			]
		);
		// Creates a corner face shared with neighboring tiles
		this.add_face(
			["top", "left"],
			[
				["top", "left"],
				["top", "center"],
				top_tile(["bottom", "center"]),
				top_tile(["bottom", "left"]),
				top_left_tile(["bottom", "center"]),
				left_tile(["top", "center"])
			],
			{ corner: true }
		);
	}
	color_pattern1() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths([["top", "left"], ["bottom", "left"]], 1, 0);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths([["middle"]], 1, 0);
		} else {
			this.color_paths([["top", "right"], ["bottom", "right"]], 1, 0);
		}
	}
	color_pattern2() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths_hash(
				{
					1: [["top", "left"], ["bottom", "left"]],
					2: [["top", "right"], ["bottom", "right"]]
				},
				0
			);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths_hash(
				{
					1: [["middle"]],
					2: [["top", "left"], ["bottom", "left"]]
				},
				0
			);
		} else {
			this.color_paths_hash(
				{
					2: [["middle"]],
					1: [["top", "right"], ["bottom", "right"]]
				},
				0
			);
		}
	}
}
class HexTessagon extends Tessagon {
	static tile_class = HexTile;
	static metadata = hex_metadata;
}
