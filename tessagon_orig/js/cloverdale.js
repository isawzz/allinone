
const cloverdale_metadata = new TessagonMetadata({
	name: "Cloverdale",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["squares", "pentagons"],
	sides: [4, 5],
	uv_ratio: 1.0
});
class CloverdaleTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { inner: null, outer: null, u_border: null, v_border: null },
				middle: { inner: null, outer: null },
				bottom: { inner: null, outer: null, u_border: null, v_border: null }
			},
			center: {
				top: { inner: null, outer: null },
				middle: null,
				bottom: { inner: null, outer: null }
			},
			right: {
				top: { inner: null, outer: null, u_border: null, v_border: null },
				middle: { inner: null, outer: null },
				bottom: { inner: null, outer: null, u_border: null, v_border: null }
			}
		};
	}
	init_faces() {
		return {
			left: {
				top: { square: null, u_pentagon: null, v_pentagon: null },
				bottom: { square: null, u_pentagon: null, v_pentagon: null },
				middle: { square: null }
			},
			center: {
				top: { square: null },
				bottom: { square: null }
			},
			right: {
				top: { square: null, u_pentagon: null, v_pentagon: null },
				bottom: { square: null, u_pentagon: null, v_pentagon: null },
				middle: { square: null }
			}
		};
	}
	calculate_verts() {
		// a is the side length of square, c is half diagonal of square
		const c = 1.0 / (Math.sqrt(2.0) + 4.0);
		const a = Math.sqrt(2.0) * c;
		// left top corner
		this.add_vert(["left", "top", "inner"], a / 2.0 + c, 1.0 - (a / 2.0 + c));
		this.add_vert(["left", "top", "outer"], a / 2.0, 1.0 - a / 2.0);
		this.add_vert(["left", "top", "u_border"], 0.0, 1.0 - a / 2.0, { u_boundary: true });
		this.add_vert(["left", "top", "v_border"], a / 2.0, 1.0, { v_boundary: true });
		this.add_vert(["left", "middle", "inner"], a / 2.0, 0.5);
		this.add_vert(["left", "middle", "outer"], 0.0, 0.5, { u_boundary: true });
		this.add_vert(["center", "top", "inner"], 0.5, 1.0 - a / 2.0);
		this.add_vert(["center", "top", "outer"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["center", "middle"], 0.5, 0.5);
	}
	calculate_faces() {
		// Middle star face
		this.add_face(
			["left", "top", "square"],
			[
				["left", "top", "v_border"],
				["left", "top", "outer"],
				["left", "top", "u_border"],
				left_tile(["right", "top", "outer"]),
				left_tile(["right", "top", "v_border"]),
				top_left_tile(["right", "bottom", "outer"]),
				top_tile(["left", "bottom", "u_border"]),
				top_tile(["left", "bottom", "outer"])
			],
			{ face_type: "star", corner: true }
		);
		this.add_face(
			["left", "top", "u_pentagon"],
			[
				["left", "top", "u_border"],
				["left", "top", "outer"],
				["left", "top", "inner"],
				["left", "middle", "inner"],
				["left", "middle", "outer"]
			]
		);
		this.add_face(
			["left", "top", "v_pentagon"],
			[
				["left", "top", "v_border"],
				["center", "top", "outer"],
				["center", "top", "inner"],
				["left", "top", "inner"],
				["left", "top", "outer"]
			]
		);
		this.add_face(
			["center", "top", "square"],
			[
				["center", "middle"],
				["left", "top", "inner"],
				["center", "top", "inner"],
				["right", "top", "inner"]
			]
		);
		this.add_face(
			["left", "middle", "square"],
			[
				["center", "middle"],
				["left", "bottom", "inner"],
				["left", "middle", "inner"],
				["left", "top", "inner"]
			]
		);
	}
	color_pattern1() {
		this.color_face(["left", "top", "square"], 1);
		this.color_face(["left", "middle", "square"], 1);
		this.color_face(["center", "top", "square"], 1);
		this.color_face(["right", "middle", "square"], 1);
		this.color_face(["center", "bottom", "square"], 1);
		this.color_face(["left", "top", "u_pentagon"], 0);
		this.color_face(["left", "top", "v_pentagon"], 0);
	}
}
class CloverdaleTessagon extends Tessagon {
	static tile_class = CloverdaleTile;
	static metadata = cloverdale_metadata;
}