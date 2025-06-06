
const penta_metadata = new TessagonMetadata({
  name: "Pentagons",
  num_color_patterns: 1,
  classification: "laves",
  shapes: ["pentagons"],
  sides: [5],
  uv_ratio: 1.0
});
class PentaTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: {
          u_boundary: null,
          v_boundary: null,
          interior: null
        },
        middle: null,
        bottom: {
          u_boundary: null,
          v_boundary: null,
          interior: null
        }
      },
      center: {
        top: null,
        bottom: null
      },
      right: {
        top: {
          u_boundary: null,
          v_boundary: null,
          interior: null
        },
        middle: null,
        bottom: {
          u_boundary: null,
          v_boundary: null,
          interior: null
        }
      }
    };
  }
  init_faces() {
    return {
      left: {
        top: {
          u_boundary: null,
          v_boundary: null
        },
        middle: null,
        bottom: {
          u_boundary: null,
          v_boundary: null
        }
      },
      center: {
        top: null,
        bottom: null
      },
      right: {
        top: {
          u_boundary: null,
          v_boundary: null
        },
        middle: null,
        bottom: {
          u_boundary: null,
          v_boundary: null
        }
      }
    };
  }
  calculate_verts() {
    const u_unit = 1.0 / (1.0 + Math.sqrt(3));
    const u0 = 0, v0 = 0;
    const u1 = u_unit / (2 * Math.sqrt(3));
    const v1 = u_unit / (2 * Math.sqrt(3));
    const u3 = (0.5 + 1 / Math.sqrt(3)) * u_unit;
    const v3 = (0.5 + 1 / Math.sqrt(3)) * u_unit;
    const u2 = 0.5 * (u1 + u3);
    const v2 = 0.5 * (v1 + v3);
    const u4 = 0.5, v4 = 0.5;
    
    this.add_vert(["left", "bottom", "u_boundary"], u0, v1, { u_boundary: true });
    this.add_vert(["left", "bottom", "v_boundary"], u3, v0, { v_boundary: true });
    this.add_vert(["left", "bottom", "interior"], u2, v2);
    this.add_vert(["left", "middle"], u1, v4);
    this.add_vert(["center", "bottom"], u4, v3);
  }
  calculate_faces() {
    this.add_face(
      ["left", "bottom", "u_boundary"],
      [
        ["left", "bottom", "u_boundary"],
        ["left", "bottom", "interior"],
        ["left", "middle"],
        left_tile(["right", "middle"]),
        left_tile(["right", "bottom", "interior"])
      ],
      { u_boundary: true }
    );
    
    this.add_face(
      ["left", "bottom", "v_boundary"],
      [
        ["left", "bottom", "u_boundary"],
        ["left", "bottom", "interior"],
        ["left", "bottom", "v_boundary"],
        bottom_tile(["left", "top", "interior"]),
        bottom_tile(["left", "top", "u_boundary"])
      ],
      { v_boundary: true }
    );
    
    this.add_face(
      ["left", "middle"],
      [
        ["left", "middle"],
        ["left", "bottom", "interior"],
        ["center", "bottom"],
        ["center", "top"],
        ["left", "top", "interior"]
      ]
    );
    
    this.add_face(
      ["center", "bottom"],
      [
        ["left", "bottom", "interior"],
        ["center", "bottom"],
        ["right", "bottom", "interior"],
        ["right", "bottom", "v_boundary"],
        ["left", "bottom", "v_boundary"]
      ]
    );
  }
  color_pattern1() {
    this.color_paths(
      [
        ["right", "middle"],
        ["center", "bottom"],
        ["right", "bottom", "v_boundary"],
        ["right", "bottom", "u_boundary"]
      ],
      1,
      0
    );
  }
}
class PentaTessagon extends Tessagon {
  static tile_class = PentaTile;
  static metadata = penta_metadata;
}
