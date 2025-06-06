
const tri_metadata = new TessagonMetadata({
  name: "Regular Triangles",
  num_color_patterns: 3,
  classification: "regular",
  shapes: ["triangles"],
  sides: [3],
  uv_ratio: Math.sqrt(3.0)
});
class TriTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: { top: null, bottom: null },
      middle: null,
      right: { top: null, bottom: null }
    };
  }
  init_faces() {
    return {
      left: { top: null, middle: null, bottom: null },
      right: { top: null, middle: null, bottom: null }
    };
  }
  calculate_verts() {
    this.add_vert(["left", "top"], 0, 1, { corner: true });
    this.add_vert("middle", 0.5, 0.5);
  }
  calculate_faces() {
    this.add_face(
      ["left", "top"],
      [
        ["left", "top"],
        ["middle"],
        top_tile(["middle"])
      ],
      { v_boundary: true }
    );
    this.add_face(
      ["left", "middle"],
      [
        ["left", "top"],
        ["left", "bottom"],
        ["middle"]
      ]
    );
  }
  color_pattern1() {
    this.color_face(["left", "top"], 0);
    this.color_face(["right", "top"], 1);
    this.color_face(["left", "middle"], 1);
    this.color_face(["right", "middle"], 0);
    this.color_face(["left", "bottom"], 0);
    this.color_face(["right", "bottom"], 1);
  }
  color_pattern2() {
    if (!this.fingerprint) return;
    if (this.fingerprint[1] % 3 === 0) {
      if (this.fingerprint[0] % 3 === 0) {
        this.color_0_0();
      } else if (this.fingerprint[0] % 3 === 1) {
        this.color_0_1();
      }
    } else if (this.fingerprint[1] % 3 === 1) {
      if (this.fingerprint[0] % 3 === 0) {
        this.color_1_0();
      } else if (this.fingerprint[0] % 3 === 1) {
        this.color_1_1();
      } else {
        this.color_1_2();
      }
    } else {
      if (this.fingerprint[0] % 3 === 0) {
        this.color_2_0();
      } else if (this.fingerprint[0] % 3 === 1) {
        this.color_2_1();
      } else {
        this.color_2_2();
      }
    }
  }
  color_pattern3() {
    if (!this.fingerprint) return;
    if (this.fingerprint[1] % 3 === 2) {
      this.color_paths([["left", "middle"], ["right", "bottom"]], 1, 0);
    } else if (this.fingerprint[1] % 3 === 1) {
      this.color_paths([["right", "top"], ["right", "bottom"]], 1, 0);
    } else {
      this.color_paths([["left", "middle"], ["right", "top"]], 1, 0);
    }
  }
  color_0_0() {
    this.color_paths([], 0, 1);
  }
  color_0_1() {
    const paths = [
      ["left", "top"],
      ["left", "bottom"],
      ["right", "middle"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_1_0() {
    const paths = [
      ["left", "top"],
      ["left", "bottom"],
      ["right", "bottom"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_1_1() {
    const paths = [
      ["left", "bottom"],
      ["right", "top"],
      ["right", "middle"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_1_2() {
    const paths = [
      ["left", "top"],
      ["left", "middle"],
      ["right", "middle"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_2_0() {
    const paths = [
      ["left", "top"],
      ["left", "bottom"],
      ["right", "top"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_2_1() {
    const paths = [
      ["left", "top"],
      ["right", "middle"],
      ["right", "bottom"]
    ];
    this.color_paths(paths, 1, 0);
  }
  color_2_2() {
    const paths = [
      ["left", "middle"],
      ["left", "bottom"],
      ["right", "middle"]
    ];
    this.color_paths(paths, 1, 0);
  }
}
class TriTessagon extends Tessagon {
  static tile_class = TriTile;
  static metadata = tri_metadata;
}

