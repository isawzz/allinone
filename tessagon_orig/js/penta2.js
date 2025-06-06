
const penta2_metadata = new TessagonMetadata({
  name: "Other Pentagons",
  num_color_patterns: 1,
  classification: "laves",
  shapes: ["pentagons"],
  sides: [5],
  uv_ratio: 1.0 / (2.0 + Math.sqrt(3.0))
});
class Penta2Tile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: {
          corner: null,
          u_boundary: null
        },
        bottom: {
          corner: null,
          u_boundary: null
        }
      },
      right: {
        top: {
          corner: null,
          u_boundary: null
        },
        bottom: {
          corner: null,
          u_boundary: null
        }
      },
      center: {
        top: null,
        middle: null,
        bottom: null
      }
    };
  }
  init_faces() {
    return {
      left: {
        top: null,
        bottom: null
      },
      right: {
        top: null,
        bottom: null
      },
      center: {
        top: null,
        bottom: null
      }
    };
  }
  calculate_verts() {
    const v_unit = 1.0 / (2.0 + Math.sqrt(3.0));
    const v0 = 0;
    const v1 = v_unit * 0.5 * (1.0 + 1.0 / Math.sqrt(3.0));
    const v2 = 0.5 - v1;
    this.add_vert(["left", "bottom", "corner"], 0, v0, { corner: true });
    this.add_vert(["left", "bottom", "u_boundary"], 0, v1, { u_boundary: true });
    this.add_vert(["center", "bottom"], 0.5, v2);
    this.add_vert(["center", "middle"], 0.5, 0.5);
  }
  calculate_faces() {
    this.add_face(
      ["center", "bottom"],
      [
        ["left", "bottom", "corner"],
        ["left", "bottom", "u_boundary"],
        ["center", "bottom"],
        ["right", "bottom", "u_boundary"],
        ["right", "bottom", "corner"]
      ]
    );
    this.add_face(
      ["left", "bottom"],
      [
        ["center", "middle"],
        ["center", "bottom"],
        ["left", "bottom", "u_boundary"],
        left_tile(["center", "bottom"]),
        left_tile(["center", "middle"])
      ],
      { u_boundary: true }
    );
  }
  color_pattern1() {
    this.color_paths(
      [
        ["center", "top"],
        ["left", "bottom"],
        ["right", "bottom"]
      ],
      1,
      0
    );
  }
}
class Penta2Tessagon extends Tessagon {
  static tile_class = Penta2Tile;
  static metadata = penta2_metadata;
}
