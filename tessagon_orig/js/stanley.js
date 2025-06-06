
const stanley_metadata = new TessagonMetadata({
  name: "Stanley Park",
  num_color_patterns: 2,
  classification: "non_convex",
  sides: [12],
  uv_ratio: Math.sqrt(3.0)
});
class StanleyParkTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = false;
  }
  init_verts() {
    return {
      top: { left: null, right: null },
      mid1: { left: null, right: null },
      mid2: { left: null, center: null, right: null },
      mid3: {
        left: { outer: null, inner: null },
        right: { inner: null, outer: null }
      },
      bottom: { left: null, right: null }
    };
  }
  init_faces() {
    return {
      top: { left: null, center: null, right: null },
      bottom: { left: null, center: null, right: null }
    };
  }
  calculate_verts() {
    let vert = this.add_vert(["top", "left"], 2 / 6, 1.0);
    this.set_equivalent_vert(...top_tile(["bottom", "left"]), vert);
    vert = this.add_vert(["top", "right"], 4 / 6, 1.0);
    this.set_equivalent_vert(...top_tile(["bottom", "right"]), vert);
    this.add_vert(["mid1", "left"], 1 / 6, 5 / 6);
    this.add_vert(["mid2", "left"], 1 / 6, 3 / 6);
    this.add_vert(["mid2", "center"], 3 / 6, 3 / 6);
    this.add_vert(["mid3", "left", "outer"], 0.0, 2 / 6, { u_boundary: true });
    this.add_vert(["mid3", "left", "inner"], 2 / 6, 2 / 6);
    vert = this.add_vert(["bottom", "left"], 2 / 6, 0.0);
    this.set_equivalent_vert(...bottom_tile(["top", "left"]), vert);
    vert = this.add_vert(["bottom", "right"], 4 / 6, 0.0);
    this.set_equivalent_vert(...bottom_tile(["top", "right"]), vert);
  }
  calculate_faces() {
    let face = this.add_face(
      ["top", "left"],
      [
        ["mid3", "left", "outer"],
        ["mid2", "left"],
        ["mid1", "left"],
        ["top", "left"],
        top_tile(["mid3", "left", "inner"]),
        top_tile(["mid2", "left"]),
        top_tile(["mid3", "left", "outer"]),
        top_left_tile(["mid2", "right"]),
        top_left_tile(["mid3", "right", "inner"]),
        left_tile(["top", "right"]),
        left_tile(["mid1", "right"]),
        left_tile(["mid2", "right"])
      ],
      { u_boundary: true }
    );
    this.set_equivalent_face(...top_tile(["bottom", "left"]), face);
    this.set_equivalent_face(...top_left_tile(["bottom", "right"]), face);
    this.set_equivalent_face(...left_tile(["top", "right"]), face);
    face = this.add_face(
      ["top", "center"],
      [
        ["top", "left"],
        ["mid1", "left"],
        ["mid2", "left"],
        ["mid3", "left", "inner"],
        ["mid2", "center"],
        ["mid3", "right", "inner"],
        ["mid2", "right"],
        ["mid1", "right"],
        ["top", "right"],
        top_tile(["mid3", "right", "inner"]),
        top_tile(["mid2", "center"]),
        top_tile(["mid3", "left", "inner"])
      ]
    );
    this.set_equivalent_face(...top_tile(["bottom", "center"]), face);
  }
  color_pattern1() {
    this.color_face(["top", "center"], 1);
    this.color_face(["bottom", "center"], 1);
  }
  color_pattern2() {
    if (this.fingerprint[1] % 2 === 0) {
      this.color_face(["top", "left"], 1);
      this.color_face(["top", "center"], 1);
      this.color_face(["top", "right"], 1);
    }
  }
}
class StanleyParkTessagon extends Tessagon {
  static tile_class = StanleyParkTile;
  static metadata = stanley_metadata;
}
