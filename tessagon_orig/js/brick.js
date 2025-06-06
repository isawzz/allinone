
const brick_metadata = new TessagonMetadata({
	name: "Bricks",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["rectangles"],
	sides: [4],
	uv_ratio: 1.0
});
class BrickTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			left: { top: null, middle: null, bottom: null },
			right: { top: null, middle: null, bottom: null }
		};
	}
	init_faces() {
		return {
			left: null,
			right: null,
			top: null,
			bottom: null
		};
	}
	calculate_verts() {
		// corners: set bottom-left ... symmetry takes care of other 3 corners
		this.add_vert(["left", "bottom"], 0.25, 0.0, { v_boundary: true });
		// left middle, symmetry also creates right middle
		this.add_vert(["left", "middle"], 0.25, 0.5);
	}
	calculate_faces() {
		// Add left, symmetry gives the right side face
		this.add_face(
			"left",
			[
				["left", "top"],
				["left", "middle"],
				["left", "bottom"],
				left_tile(["right", "bottom"]),
				left_tile(["right", "middle"]),
				left_tile(["right", "top"])
			],
			{ u_boundary: true }
		);
		// Add bottom, symmetry gives the top face
		this.add_face(
			"bottom",
			[
				["right", "bottom"],
				["right", "middle"],
				["left", "middle"],
				["left", "bottom"],
				bottom_tile(["left", "middle"]),
				bottom_tile(["right", "middle"])
			],
			{ v_boundary: true }
		);
	}
	color_pattern1() {
		this.color_paths([["left"], ["right"]], 1, 0);
	}
}
class BrickTessagon extends Tessagon {
	static tile_class = BrickTile;
	static metadata = brick_metadata;
}