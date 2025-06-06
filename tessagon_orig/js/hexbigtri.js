
const hex_big_tri_metadata = new TessagonMetadata({
  name: "Hexagons and Big Triangles",
  num_color_patterns: 2,
  classification: "non_edge",
  shapes: ["hexagons", "triangles"],
  sides: [6, 3],
  uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexBigTriTile extends AlternatingTile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = false;
    this.v_symmetric = false;
    this.hexagon_ratio = 0.5;
    this.hex_radius = 4 * this.hexagon_ratio / Math.sqrt(7);
    this.uv_ratio = this.tessagon.metadata.uv_ratio;
    this.theta_offset = -Math.atan2(1, 3 * Math.sqrt(3)) + Math.PI / 6;
    this.hex_theta = Array.from({ length: 6 }, (_, number) => this.theta_offset + number * Math.PI / 3);
  }
  hex_vert_coord(center, number) {
    return [
      center[0] + this.hex_radius * Math.cos(this.hex_theta[number]),
      center[1] + this.hex_radius * Math.sin(this.hex_theta[number]) * this.uv_ratio
    ];
  }
  init_verts() {
    if (this.tile_type === 0) {
      return { 0: null, 1: null };
    } else {
      return { 2: null, 3: null, 4: null, 5: null };
    }
  }
  init_faces() {
    if (this.tile_type === 0) {
      return { A: null, B: null, C: null, D: null };
    } else {
      return { E: null, F: null, G: null, H: null, I: null, J: null };
    }
  }
  calculate_verts() {
    if (this.tile_type === 0) {
      this.add_vert([0], ...this.hex_vert_coord([0, 1], 5));
      this.add_vert([1], ...this.hex_vert_coord([1, 0], 2));
    } else {
      this.add_vert([2], ...this.hex_vert_coord([1, 1], 3));
      this.add_vert([3], ...this.hex_vert_coord([1, 1], 4));
      this.add_vert([4], ...this.hex_vert_coord([0, 0], 1));
      this.add_vert([5], ...this.hex_vert_coord([0, 0], 0));
    }
  }
  calculate_faces() {
    if (this.tile_type !== 0) {
      return;
    }
    // Top Hexagon
    this.add_face(
      'A',
      [
        0,
        left_tile(3),
        left_tile(2),
        top_left_tile(1),
        top_tile(4),
        top_tile(5)
      ],
      { equivalent: [left_tile('F'), top_left_tile('D'), top_tile('I')] }
    );
    // Left Triangle
    this.add_face(
      'B',
      [
        1,
        0,
        left_tile(3),
        left_tile(4),
        left_tile(5),
        bottom_tile(2)
      ],
      { equivalent: [bottom_tile('E'), left_tile('H')] }
    );
    // Right Triangle
    this.add_face(
      'C',
      [
        0,
        1,
        right_tile(4),
        right_tile(3),
        right_tile(2),
        top_tile(5)
      ],
      { equivalent: [right_tile('G'), top_tile('J')] }
    );
  }
  color_pattern1() {
    if (this.tile_type === 0) {
      this.color_face('A', 1);
    }
  }
  color_pattern2() {
    if (this.tile_type === 0) {
      this.color_face('A', 1);
      this.color_face('B', 2);
    }
  }
}
class HexBigTriTessagon extends Tessagon {
  static tile_class = HexBigTriTile;
  static metadata = hex_big_tri_metadata;
}
