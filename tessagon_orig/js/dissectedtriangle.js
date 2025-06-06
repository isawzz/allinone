
const dissectedt_triangle_metadata = new TessagonMetadata({
	name: "Dissected Triangle",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: Math.sqrt(3.0)
});
class DissectedTriangleTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: {
				top: { corner: null, v_boundary: null },
				middle: null,
				bottom: { corner: null, v_boundary: null }
			},
			right: {
				top: { corner: null, v_boundary: null },
				middle: null,
				bottom: { corner: null, v_boundary: null }
			},
			center: null
		};
	}
	init_faces() {
		return {
			left: {
				top: { center: null, interior1: null, interior2: null },
				middle: null,
				bottom: { center: null, interior1: null, interior2: null }
			},
			right: {
				top: { center: null, interior1: null, interior2: null },
				middle: null,
				bottom: { center: null, interior1: null, interior2: null }
			}
		};
	}
	calculate_verts() {
		this.add_vert(["left", "top", "corner"], 0, 1, { corner: true });
		this.add_vert("center", 0.5, 0.5);
		this.add_vert(["left", "top", "v_boundary"], 1.0 / 3.0, 1, { v_boundary: true });
		this.add_vert(["left", "middle"], 1.0 / 6.0, 0.5);
	}
	calculate_faces() {
		this.add_face(
			["left", "middle"],
			[
				["left", "middle"],
				["left", "top", "corner"],
				["left", "bottom", "corner"]
			]
		);
		this.add_face(
			["left", "top", "center"],
			[
				["center"],
				["left", "top", "v_boundary"],
				top_tile(["center"])
			],
			{ v_boundary: true }
		);
		this.add_face(
			["left", "top", "interior1"],
			[
				["center"],
				["left", "top", "v_boundary"],
				["left", "top", "corner"]
			]
		);
		this.add_face(
			["left", "top", "interior2"],
			[
				["center"],
				["left", "middle"],
				["left", "top", "corner"]
			]
		);
	}
	color_pattern1() {
		if (this.fingerprint[1] % 3 === 0) {
			this.color_paths(
				[
					["left", "middle"],
					["right", "middle"]
				],
				1,
				0
			);
		} else if (this.fingerprint[1] % 3 === 2) {
			this.color_paths(
				[
					["left", "top", "interior2"],
					["right", "top", "interior2"],
					["left", "top", "interior1"],
					["right", "top", "interior1"]
				],
				1,
				0
			);
			this.color_paths(
				[
					["left", "bottom", "center"],
					["right", "bottom", "center"]
				],
				1,
				0
			);
		} else {
			this.color_paths(
				[
					["left", "bottom", "interior2"],
					["right", "bottom", "interior2"],
					["left", "bottom", "interior1"],
					["right", "bottom", "interior1"]
				],
				1,
				0
			);
		}
	}
}
class DissectedTriangleTessagon extends Tessagon {
	static tile_class = DissectedTriangleTile;
	static metadata = dissectedt_triangle_metadata;
}
