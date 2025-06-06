
const weave_metadata = new TessagonMetadata({
  name: "Weave",
  num_color_patterns: 1,
  classification: "non_edge",
  shapes: ["quads", "rectangles"],
  sides: [4],
  uv_ratio: 1.0,
  extra_parameters: {
    square_ratio: {
      type: "float",
      min: 0.0,
      max: 1.0,
      default: 0.5,
      description: "Control the size of the squares"
    }
  }
});
class WeaveTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
    this.square_ratio = options.hasOwnProperty("square_ratio") ? options.square_ratio : 0.5;
  }
  init_verts() {
    return {
      top: {
        left: { u_inner: null, v_inner: null, v_outer: null },
        right: { u_inner: null, v_inner: null, v_outer: null }
      },
      bottom: {
        left: { u_inner: null, v_inner: null, v_outer: null },
        right: { u_inner: null, v_inner: null, v_outer: null }
      }
    };
  }
  init_faces() {
    return {
      square: {
        top: { left: null, right: null },
        bottom: { left: null, right: null }
      },
      oct: {
        top: { left: null, center: null, right: null },
        middle: { left: null, center: null, right: null },
        bottom: { left: null, center: null, right: null }
      }
    };
  }
  calculate_verts() {
    const half_square_size = 0.25 * this.square_ratio;
    const u0 = 0.25 - half_square_size;
    const u1 = 0.25 + half_square_size;
    const v0 = 0.75 - half_square_size;
    const v1 = 0.75 + half_square_size;
    // Define top left square, other verts defined through symmetry
    this.add_vert(["top", "left", "u_inner", "v_inner"], u1, v0);
    this.add_vert(["top", "left", "u_inner", "v_outer"], u1, v1);
    this.add_vert(["top", "left", "u_outer", "v_inner"], u0, v0);
    this.add_vert(["top", "left", "u_outer", "v_outer"], u0, v1);
  }
  calculate_faces() {
    // 4 internal squares (via symmetry)
    this.add_face(
      ["square", "top", "left"],
      [
        ["top", "left", "u_outer", "v_outer"],
        ["top", "left", "u_inner", "v_outer"],
        ["top", "left", "u_inner", "v_inner"],
        ["top", "left", "u_outer", "v_inner"]
      ],
      { face_type: "square" }
    );
    // 1 interior strip
    this.add_face(
      ["oct", "middle", "center"],
      [
        ["top", "left", "u_outer", "v_inner"],
        ["top", "left", "u_inner", "v_inner"],
        ["top", "right", "u_inner", "v_inner"],
        ["top", "right", "u_outer", "v_inner"],
        ["bottom", "right", "u_outer", "v_inner"],
        ["bottom", "right", "u_inner", "v_inner"],
        ["bottom", "left", "u_inner", "v_inner"],
        ["bottom", "left", "u_outer", "v_inner"]
      ],
      { face_type: "oct" }
    );
    // 4 corner strips
    this.add_face(
      ["oct", "top", "left"],
      [
        ["top", "left", "u_inner", "v_outer"],
        ["top", "left", "u_outer", "v_outer"],
        left_tile(["top", "right", "u_outer", "v_outer"]),
        left_tile(["top", "right", "u_inner", "v_outer"]),
        left_top_tile(["bottom", "right", "u_inner", "v_outer"]),
        left_top_tile(["bottom", "right", "u_outer", "v_outer"]),
        top_tile(["bottom", "left", "u_outer", "v_outer"]),
        top_tile(["bottom", "left", "u_inner", "v_outer"])
      ],
      { face_type: "oct", corner: true }
    );
    // 2 side strips
    this.add_face(
      ["oct", "middle", "left"],
      [
        ["top", "left", "u_outer", "v_outer"],
        ["top", "left", "u_outer", "v_inner"],
        ["bottom", "left", "u_outer", "v_inner"],
        ["bottom", "left", "u_outer", "v_outer"],
        left_tile(["bottom", "right", "u_outer", "v_outer"]),
        left_tile(["bottom", "right", "u_outer", "v_inner"]),
        left_tile(["top", "right", "u_outer", "v_inner"]),
        left_tile(["top", "right", "u_outer", "v_outer"])
      ],
      { face_type: "oct", u_boundary: true }
    );
    // 2 top/bottom strips
    this.add_face(
      ["oct", "top", "center"],
      [
        ["top", "left", "u_inner", "v_outer"],
        ["top", "left", "u_inner", "v_inner"],
        ["top", "right", "u_inner", "v_inner"],
        ["top", "right", "u_inner", "v_outer"],
        top_tile(["bottom", "right", "u_inner", "v_outer"]),
        top_tile(["bottom", "right", "u_inner", "v_inner"]),
        top_tile(["bottom", "left", "u_inner", "v_inner"]),
        top_tile(["bottom", "left", "u_inner", "v_outer"])
      ],
      { face_type: "oct", v_boundary: true }
    );
  }
  color_pattern1() {
    this.color_face(["oct", "top", "center"], 1);
    this.color_face(["oct", "middle", "left"], 1);
    this.color_face(["oct", "top", "left"], 2);
    this.color_face(["oct", "middle", "center"], 2);
  }
}
class WeaveTessagon extends Tessagon {
  static tile_class = WeaveTile;
  static metadata = weave_metadata;
}
