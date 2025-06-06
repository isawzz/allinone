
const dissected_hex_tri_metadata = new TessagonMetadata({
	name: "Hexagons Dissected with Triangles",
	num_color_patterns: 1,
	classification: "laves",
	shapes: ["triangles"],
	sides: [3],
	uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DissectedHexTriTile extends DissectedHexQuadTile {
	init_faces() {
		return {
			left: {
				top: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,  // Touches corner
					interior2: null
				},
				bottom: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				}
			},
			right: {
				top: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				},
				bottom: {
					v_boundary: null,
					u_boundary: null,
					middle: null,
					center: null,
					interior1: null,
					interior2: null
				}
			}
		};
	}
	calculate_faces() {
		this.add_face(
			["left", "top", "v_boundary"],
			[
				["left", "top", "corner"],
				["center", "top", "v_boundary"],
				["center", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "interior1"],
			[
				["left", "top", "corner"],
				["center", "top", "interior"],
				["left", "top", "interior"]
			]
		);
		this.add_face(
			["left", "top", "u_boundary"],
			[
				["left", "top", "corner"],
				["left", "top", "interior"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "middle"],
			[
				["center", "middle"],
				["left", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "interior2"],
			[
				["left", "top", "interior"],
				["center", "middle"],
				["left", "top", "u_boundary"]
			]
		);
		this.add_face(
			["left", "top", "center"],
			[
				["center", "middle"],
				["left", "top", "interior"],
				["center", "top", "interior"]
			]
		);
	}
	color_pattern1() {
		this.color_paths(
			[
				["left", "top", "v_boundary"],
				["left", "top", "u_boundary"],
				["left", "top", "middle"],
				["left", "top", "center"],
				["right", "top", "interior1"],
				["right", "top", "interior2"],
				["right", "bottom", "v_boundary"],
				["right", "bottom", "u_boundary"],
				["right", "bottom", "middle"],
				["right", "bottom", "center"],
				["left", "bottom", "interior1"],
				["left", "bottom", "interior2"]
			],
			1,
			0
		);
	}
}
class DissectedHexTriTessagon extends Tessagon {
	static tile_class = DissectedHexTriTile;
	static metadata = dissected_hex_tri_metadata;
}

