
const zigzag_metadata = new TessagonMetadata({
	name: "Zig-Zag",
	num_color_patterns: 1,
	classification: "non_edge",
	shapes: ["rectangles"],
	sides: [4],
	uv_ratio: 1.0
});
class ZigZagTile extends Tile {
	init_verts() {
		return {
			1: { 1: null, 2: null, 3: null, 4: null, 5: null },
			2: { 1: null, 2: null, 3: null, 4: null, 5: null },
			3: { 1: null, 2: null, 3: null, 4: null, 5: null },
			4: { 1: null, 2: null, 3: null, 4: null, 5: null },
			5: { 1: null, 2: null, 3: null, 4: null, 5: null }
		};
	}
	init_faces() {
		return {
			1: null, 2: null, 3: null, 4: null, 5: null,
			6: null, 7: null, 8: null, 9: null, 10: null
		};
	}
	calculate_verts() {
		const c = {
			1: 0.0,
			2: 1 / 4.0,
			3: 2 / 4.0,
			4: 3 / 4.0,
			5: 1.0
		};
		for (const colKey in this.verts) {
			const col = parseInt(colKey);
			for (const rowKey in this.verts[col]) {
				const row = parseInt(rowKey);
				if (col === 5) {
					if (!this.get_neighbor_tile(["right"])) {
						if (!this.get_neighbor_tile(["top"])) {
							if (row === 5) continue;
							if (row === 4) continue;
						}
						if (!this.get_neighbor_tile(["bottom"])) {
							if (row === 1) continue;
						}
					}
				}
				const vert = this.add_vert([col, row], c[col], c[row]);
				if (col === 1) {
					this.set_equivalent_vert(...left_tile([5, row]), vert);
					if (row === 5) {
						this.set_equivalent_vert(...left_top_tile([5, 1]), vert);
					} else if (row === 1) {
						this.set_equivalent_vert(...left_bottom_tile([5, 5]), vert);
					}
				} else if (col === 5) {
					this.set_equivalent_vert(...right_tile([1, row]), vert);
					if (row === 5) {
						this.set_equivalent_vert(...right_top_tile([1, 1]), vert);
					} else if (row === 1) {
						this.set_equivalent_vert(...right_bottom_tile([1, 5]), vert);
					}
				}
				if (row === 5) {
					this.set_equivalent_vert(...top_tile([col, 1]), vert);
				} else if (row === 1) {
					this.set_equivalent_vert(...bottom_tile([col, 5]), vert);
				}
			}
		}
	}
	calculate_faces() {
		this.add_face(1, [[1, 5],
		[1, 4],
		[2, 4],
		[3, 4],
		[3, 5],
		[2, 5]]);
		this.add_face(2, [[3, 5],
		[3, 4],
		[3, 3],
		[4, 3],
		[4, 4],
		[4, 5]]);
		let face = this.add_face(3, [[4, 5],
		[4, 4],
		[5, 4],
		[5, 5],
		top_tile([5, 2]),
		top_tile([4, 2])]);
		this.set_equivalent_face(...top_tile(10), face);
		face = this.add_face(4, [[1, 3],
		[2, 3],
		[2, 4],
		[1, 4],
		left_tile([4, 4]),
		left_tile([4, 3])]);
		this.set_equivalent_face(...left_tile(6), face);
		this.add_face(5, [[3, 2],
		[3, 3],
		[3, 4],
		[2, 4],
		[2, 3],
		[2, 2]]);
		face = this.add_face(6, [[5, 4],
		[4, 4],
		[4, 3],
		[5, 3],
		right_tile([2, 3]),
		right_tile([2, 4])]);
		this.set_equivalent_face(...right_tile(4), face);
		this.add_face(7, [[2, 1],
		[2, 2],
		[2, 3],
		[1, 3],
		[1, 2],
		[1, 1]]);
		this.add_face(8, [[5, 2],
		[5, 3],
		[4, 3],
		[3, 3],
		[3, 2],
		[4, 2]]);
		this.add_face(9, [[4, 1],
		[4, 2],
		[3, 2],
		[2, 2],
		[2, 1],
		[3, 1]]);
		face = this.add_face(10, [[5, 1],
		[5, 2],
		[4, 2],
		[4, 1],
		bottom_tile([4, 4]),
		bottom_tile([5, 4])]);
		this.set_equivalent_face(...bottom_tile(3), face);
	}
	color_pattern1() {
		this.color_face(1, 1);
		this.color_face(2, 1);
		this.color_face(7, 1);
		this.color_face(8, 1);
	}
}
class ZigZagTessagon extends Tessagon {
	static tile_class = ZigZagTile;
	static metadata = zigzag_metadata;
}
