
const octo_metadata = new TessagonMetadata({
  name: "Octagons and Squares",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["octagons", "squares"],
  sides: [8, 4],
  uv_ratio: 1.0
});
class OctoTile extends Tile {
  static CORNER_TO_VERT_RATIO = 1.0 / (2.0 + Math.sqrt(2));
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: { u_boundary: null, v_boundary: null },
        bottom: { u_boundary: null, v_boundary: null }
      },
      right: {
        top: { u_boundary: null, v_boundary: null },
        bottom: { u_boundary: null, v_boundary: null }
      }
    };
  }
  init_faces() {
    return {
      middle: null,
      left: { top: null, bottom: null },
      right: { top: null, bottom: null }
    };
  }
  calculate_verts() {
    this.add_vert(
      ["left", "top", "v_boundary"],
      OctoTile.CORNER_TO_VERT_RATIO,
      1,
      { v_boundary: true }
    );
    this.add_vert(
      ["left", "top", "u_boundary"],
      0,
      1.0 - OctoTile.CORNER_TO_VERT_RATIO,
      { u_boundary: true }
    );
  }
  calculate_faces() {
    // Middle interior face
    this.add_face(
      "middle",
      [
        ["left", "top", "v_boundary"],
        ["left", "top", "u_boundary"],
        ["left", "bottom", "u_boundary"],
        ["left", "bottom", "v_boundary"],
        ["right", "bottom", "v_boundary"],
        ["right", "bottom", "u_boundary"],
        ["right", "top", "u_boundary"],
        ["right", "top", "v_boundary"]
      ]
    );
    // Four faces defining top left corner, others via symmetry
    this.add_face(
      ["left", "top"],
      [
        ["left", "top", "v_boundary"],
        ["left", "top", "u_boundary"],
        left_tile(["right", "top", "v_boundary"]),
        top_tile(["left", "bottom", "u_boundary"])
      ],
      { corner: true }
    );
  }
  color_pattern1() {
    this.color_face(["middle"], 1);
  }
}
class OctoTessagon extends Tessagon {
  static tile_class = OctoTile;
  static metadata = octo_metadata;
}
