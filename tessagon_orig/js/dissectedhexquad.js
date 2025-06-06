
const dissected_hex_quad_metadata = new TessagonMetadata({
	name: "Hexagons Dissected with Quads",
	num_color_patterns: 2,
	classification: "laves",
	shapes: ["quads"],
	sides: [4],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DissectedHexQuadTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { corner: null, interior: null, u_boundary: null },
				middle: null,
				bottom: { corner: null, interior: null, u_boundary: null }
			},
			right: {
				top: { corner: null, interior: null, u_boundary: null },
				middle: null,
				bottom: { corner: null, interior: null, u_boundary: null }
			},
			center: {
				middle: null,
				top: { v_boundary: null, interior: null },
				bottom: { v_boundary: null, interior: null }
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { v_boundary: null, u_boundary: null, middle: null },
				bottom: { v_boundary: null, u_boundary: null, middle: null }
			},
			right: {
				top: { v_boundary: null, u_boundary: null, middle: null },
				bottom: { v_boundary: null, u_boundary: null, middle: null }
			},
			center: { top: null, bottom: null }
		};
	}
	calculate_verts() {
		this.add_vert(["left", "top", "corner"], 0, 1, { corner: true });
		this.add_vert(["left", "top", "interior"], 0.25, 0.75);
		this.add_vert(["left", "top", "u_boundary"], 0, 2.0 / 3.0, { u_boundary: true });
		this.add_vert(["left", "middle"], 0, 0.5, { u_boundary: true });
		this.add_vert(["center", "middle"], 0.5, 0.5);
		this.add_vert(["center", "top", "v_boundary"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["center", "top", "interior"], 0.5, 5.0 / 6.0);
	}
	calculate_faces() {
		this.add_face(
			["left", "top", "v_boundary"],
			[
				["left", "top", "corner"],
				["center", "top", "v_boundary"],
				["center", "top", "interior"],
				["left", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "u_boundary"],
			[
				["left", "top", "corner"],
				["left", "top", "interior"],
				["left", "top", "u_boundary"],
				left_tile(["right", "top", "interior"])
			],
			{ u_boundary: true }
		);
		this.add_face(
			["left", "top", "middle"],
			[
				["left", "top", "interior"],
				["center", "middle"],
				["left", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["center", "top"],
			[
				["center", "middle"],
				["left", "top", "interior"],
				["center", "top", "interior"],
				["right", "top", "interior"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["left", "top", "middle"],
				["center", "top"],
				["right", "top", "middle"],
				["left", "bottom", "middle"],
				["center", "bottom"],
				["right", "bottom", "middle"]
			],
			1,
			0
		);
	}
	color_pattern2() {
		if (this.fingerprint[0] % 3 === 0) {
			this.color_paths(
				[
					["left", "top", "middle"],
					["center", "top"],
					["right", "top", "middle"],
					["left", "bottom", "middle"],
					["center", "bottom"],
					["right", "bottom", "middle"]
				],
				1,
				0
			);
		} else if (this.fingerprint[0] % 3 === 1) {
			this.color_paths(
				[
					["right", "top", "v_boundary"],
					["right", "bottom", "v_boundary"]
				],
				1,
				0
			);
		} else if (this.fingerprint[0] % 3 === 2) {
			this.color_paths(
				[
					["left", "top", "v_boundary"],
					["left", "top", "u_boundary"],
					["left", "bottom", "v_boundary"],
					["left", "bottom", "u_boundary"]
				],
				1,
				0
			);
		}
	}
}
class DissectedHexQuadTessagon extends Tessagon {
	static tile_class = DissectedHexQuadTile;
	static metadata = dissected_hex_quad_metadata;
}
