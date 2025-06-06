const big_hex_tri_metadata = new TessagonMetadata({
	name: "Big Hexagons and Triangles",
	num_color_patterns: 1,
	classification: "archimedean",
	shapes: ["hexagons", "triangles"],
	sides: [6, 3],
	uv_ratio: 1.0 / Math.sqrt(3),
	extra_parameters: {
		hexagon_ratio: {
			type: "float",
			min: 0.0,
			max: 0.70,
			default: 0.5,
			description: "Control the size of the Hexagons"
		}
	}
});
class BigHexTriTile extends AlternatingTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = false;
		this.v_symmetric = false;
		this.hexagon_ratio = options.hasOwnProperty("hexagon_ratio")
			? options.hexagon_ratio
			: 0.5;
		this.hex_radius = (4 * this.hexagon_ratio) / Math.sqrt(7);
		this.uv_ratio = tessagon.metadata.uv_ratio;
		this.theta_offset = -Math.atan2(1, 3 * Math.sqrt(3)) + Math.PI / 6;
		this.hex_theta = [];
		for (let number = 0; number < 6; number++) {
			this.hex_theta.push(this.theta_offset + (number * Math.PI) / 3.0);
		}
	}
	hex_vert_coord(center, number) {
		return [
			center[0] + this.hex_radius * Math.cos(this.hex_theta[number]),
			center[1] + this.hex_radius * Math.sin(this.hex_theta[number]) * this.uv_ratio
		];
	}
	init_verts() {
		if (this.tile_type === 0) {
			return { 0: null, 1: null };
		} else {
			return { 2: null, 3: null, 4: null, 5: null };
		}
	}
	init_faces() {
		if (this.tile_type === 0) {
			return {
				A: null,
				B: null,
				C: null,
				D: null,
				E: null,
				F: null,
				G: null,
				H: null
			};
		} else {
			return {
				I: null,
				J: null,
				K: null,
				L: null,
				M: null,
				N: null,
				O: null,
				P: null,
				Q: null,
				R: null
			};
		}
	}
	calculate_verts() {
		if (this.tile_type === 0) {
			this.add_vert([0], ...this.hex_vert_coord([0, 1], 5));
			this.add_vert([1], ...this.hex_vert_coord([1, 0], 2));
		} else {
			this.add_vert([2], ...this.hex_vert_coord([1, 1], 3));
			this.add_vert([3], ...this.hex_vert_coord([1, 1], 4));
			this.add_vert([4], ...this.hex_vert_coord([0, 0], 1));
			this.add_vert([5], ...this.hex_vert_coord([0, 0], 0));
		}
	}
	calculate_faces() {
		if (this.tile_type === 0) {
			this.add_face(
				"A",
				[
					0,
					top_tile(5),
					top_tile(4),
					top_left_tile(1),
					left_tile(2),
					left_tile(3)
				],
				{ equivalent: [top_tile("T"), top_left_tile("H"), left_tile("I")] }
			);
			this.add_face(
				"B",
				[0, right_tile(2), top_tile(5)],
				{ equivalent: [top_tile("S"), right_tile("K")] }
			);
			this.add_face(
				"C",
				[0, right_tile(4), right_tile(2)],
				{ equivalent: [right_tile("L")] }
			);
			this.add_face(
				"D",
				[0, 1, right_tile(4)],
				{ equivalent: [right_tile("M")] }
			);
			this.add_face(
				"E",
				[1, 0, left_tile(3)],
				{ equivalent: [left_tile("P")] }
			);
			this.add_face(
				"F",
				[1, left_tile(3), left_tile(5)],
				{ equivalent: [left_tile("Q")] }
			);
			this.add_face(
				"G",
				[1, left_tile(5), bottom_tile(2)],
				{ equivalent: [left_tile("R")] }
			);
		} else {
			this.add_face("N", [2, 4, 3]);
			this.add_face("O", [3, 4, 5]);
		}
	}
	color_pattern1() {
		if (this.tile_type === 0) {
			this.color_face("A", 2);
			this.color_face("B", 1);
			this.color_face("D", 1);
			this.color_face("F", 1);
		} else {
			this.color_face("N", 1);
		}
	}
}
class BigHexTriTessagon extends Tessagon {
	static tile_class = BigHexTriTile;
	static metadata = big_hex_tri_metadata;
}
