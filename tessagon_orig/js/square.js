
const square_metadata = new TessagonMetadata({
	name: "Regular Squares",
	num_color_patterns: 8,
	classification: "regular",
	shapes: ["squares"],
	sides: [4],
	uv_ratio: 1.0
});
class SquareTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.u_symmetric = true;
		this.v_symmetric = true;
	}
	init_verts() {
		return {
			top: { left: null, right: null },
			bottom: { left: null, right: null }
		};
	}
	init_faces() {
		return {
			middle: null
		};
	}
	calculate_verts() {
		this.add_vert(["top", "left"], 0, 1, { corner: true });
	}
	calculate_faces() {
		this.add_face("middle", [
			["top", "left"],
			["top", "right"],
			["bottom", "right"],
			["bottom", "left"]
		]);
	}
	color_pattern1() {
		if (((this.fingerprint[0] + this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern2() {
		if (((this.fingerprint[0] + this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else if ((this.fingerprint[0] % 2) === 0) {
			this.color_face(["middle"], 1);
		} else {
			this.color_face(["middle"], 2);
		}
	}
	color_pattern3() {
		if (((this.fingerprint[0] * this.fingerprint[1]) % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern4() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if (((Math.floor(this.fingerprint[1] / 2) + this.fingerprint[0]) % 2) === 0) {
				this.color_face(["middle"], 0);
			} else {
				this.color_face(["middle"], 1);
			}
		}
	}
	color_pattern5() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			this.color_face(["middle"], 1);
		}
	}
	color_pattern6() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 1);
			} else {
				this.color_face(["middle"], 2);
			}
		}
	}
	color_pattern7() {
		if ((this.fingerprint[1] % 2) === 0) {
			this.color_face(["middle"], 0);
		} else {
			if (((Math.floor(this.fingerprint[1] / 2) + this.fingerprint[0]) % 2) === 0) {
				this.color_face(["middle"], 1);
			} else {
				this.color_face(["middle"], 2);
			}
		}
	}
	color_pattern8() {
		if ((this.fingerprint[1] % 2) === 0) {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 0);
			} else {
				this.color_face(["middle"], 1);
			}
		} else {
			if ((this.fingerprint[0] % 2) === 0) {
				this.color_face(["middle"], 2);
			} else {
				this.color_face(["middle"], 3);
			}
		}
	}
}
class SquareTessagon extends Tessagon {
	static tile_class = SquareTile;
	static metadata = big_hex_tri_metadata;
}



