
const valemount_metadata = new TessagonMetadata({
  name: "Valemount",
  num_color_patterns: 1,
  classification: "non_edge",
  shapes: ["rectangles", "squares"],
  sides: [4],
  uv_ratio: 1.0
});
class ValemountTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = false;
    this.v_symmetric = false;
  }
  init_verts() {
    return {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
      11: null,
      12: null,
      13: null,
      14: null,
      15: null,
      16: null
    };
  }
  init_faces() {
    return {
      top_left: null,
      top_right: null,
      bottom_left: null,
      bottom_right: null,
      center: null
    };
  }
  calculate_verts() {
    // Top row
    let vert = this.add_vert([1], 0, 1);
    this.set_equivalent_vert(...left_tile(4), vert);
    this.set_equivalent_vert(...top_tile(13), vert);
    this.set_equivalent_vert(...top_left_tile(16), vert);
    vert = this.add_vert([2], 1/3.0, 1);
    this.set_equivalent_vert(...top_tile(14), vert);
    vert = this.add_vert([3], 2/3.0, 1);
    this.set_equivalent_vert(...top_tile(15), vert);
    vert = this.add_vert([4], 1, 1);
    this.set_equivalent_vert(...right_tile(1), vert);
    this.set_equivalent_vert(...top_tile(16), vert);
    this.set_equivalent_vert(...top_right_tile(13), vert);
    // Next row
    vert = this.add_vert([5], 0, 2/3.0);
    this.set_equivalent_vert(...left_tile(8), vert);
    this.add_vert([6], 1/3.0, 2/3.0);
    this.add_vert([7], 2/3.0, 2/3.0);
    vert = this.add_vert([8], 1, 2/3.0);
    this.set_equivalent_vert(...right_tile(5), vert);
    // Next row
    vert = this.add_vert([9], 0, 1/3.0);
    this.set_equivalent_vert(...left_tile(12), vert);
    this.add_vert([10], 1/3.0, 1/3.0);
    this.add_vert([11], 2/3.0, 1/3.0);
    vert = this.add_vert([12], 1, 1/3.0);
    this.set_equivalent_vert(...right_tile(9), vert);
    // Bottom row
    vert = this.add_vert([13], 0, 0);
    this.set_equivalent_vert(...left_tile(16), vert);
    this.set_equivalent_vert(...bottom_tile(1), vert);
    this.set_equivalent_vert(...bottom_left_tile(4), vert);
    vert = this.add_vert([14], 1/3.0, 0);
    this.set_equivalent_vert(...bottom_tile(2), vert);
    vert = this.add_vert([15], 2/3.0, 0);
    this.set_equivalent_vert(...bottom_tile(3), vert);
    vert = this.add_vert([16], 1, 0);
    this.set_equivalent_vert(...right_tile(13), vert);
    this.set_equivalent_vert(...bottom_tile(4), vert);
    this.set_equivalent_vert(...bottom_right_tile(1), vert);
  }
  calculate_faces() {
    this.add_face("top_left", [1, 2, 6, 10, 9, 5]);
    this.add_face("top_right", [2, 3, 4, 8, 7, 6]);
    this.add_face("bottom_left", [9, 10, 11, 15, 14, 13]);
    this.add_face("bottom_right", [7, 8, 12, 16, 15, 11]);
    this.add_face("center", [6, 7, 11, 10]);
  }
  color_pattern1() {
    this.color_paths([["center"]], 1, 0);
  }
}
class ValemountTessagon extends Tessagon {
  static tile_class = ValemountTile;
  static metadata = valemount_metadata;
}
