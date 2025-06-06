
const floret_metadata = new TessagonMetadata({
  name: "Florets",
  num_color_patterns: 3,
  classification: "laves",
  shapes: ["pentagons"],
  sides: [5],
  uv_ratio: 1.0 / Math.sqrt(3)
});
class FloretTile extends AlternatingTile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = false;
    this.v_symmetric = false;
    this.uv_ratio = this.tessagon.metadata.uv_ratio;
    const theta_offset1 = Math.PI / 3 - Math.atan2(Math.sqrt(3), 9);
    const theta_offset2 = Math.PI / 6;
    this.hexagons = [
      {
        radius: 4 / Math.sqrt(21),
        hex_theta: Array.from({ length: 6 }, (_, number) => theta_offset1 + number * Math.PI / 3)
      },
      {
        radius: 2 / (3 * this.uv_ratio),
        hex_theta: Array.from({ length: 6 }, (_, number) => theta_offset2 + number * Math.PI / 3)
      }
    ];
  }
  hex_vert_coord(hexagon_num, center, number) {
    const hexagon = this.hexagons[hexagon_num];
    return [
      center[0] + hexagon.radius * Math.cos(hexagon.hex_theta[number]),
      center[1] + hexagon.radius * Math.sin(hexagon.hex_theta[number]) * this.uv_ratio
    ];
  }
  init_verts() {
    let verts = {};
    if (this.tile_type === 0) {
      for (let i = 0; i < 6; i++) {
        verts[i] = null;
      }
    } else {
      for (let i = 6; i < 14; i++) {
        verts[i] = null;
      }
    }
    return verts;
  }
  init_faces() {
    let faces = {};
    if (this.tile_type === 0) {
      for (const c of ['A', 'B', 'C', 'D']) {
        faces[c] = null;
      }
    } else {
      for (const c of ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) {
        faces[c] = null;
      }
    }
    return faces;
  }
  calculate_verts() {
    if (this.tile_type === 0) {
      this.add_vert([2], ...this.hex_vert_coord(0, [0, 0], 0));
      this.add_vert([3], ...this.hex_vert_coord(0, [1, 1], 3));
    } else {
      this.add_vert([6], 1, 0, { equivalent: [right_tile(0), bottom_right_tile(13), bottom_tile(5)] });
      this.add_vert([7], ...this.hex_vert_coord(0, [1, 0], 2));
      this.add_vert([8], ...this.hex_vert_coord(1, [0, 1], 4), { equivalent: [left_tile(1)] });
      this.add_vert([9], ...this.hex_vert_coord(0, [0, 1], 4));
      this.add_vert([10], ...this.hex_vert_coord(0, [1, 0], 1));
      this.add_vert([11], ...this.hex_vert_coord(1, [0, 1], 5), { equivalent: [right_tile(4)] });
      this.add_vert([12], ...this.hex_vert_coord(0, [0, 1], 5));
      this.add_vert([13], 0, 1, { equivalent: [left_tile(5), top_left_tile(6), top_tile(0)] });
    }
  }
  calculate_faces() {
    if (this.tile_type === 0) {
      return;
    }
    this.add_face('G', [6, 10, 9, 8, 7]);
    this.add_face('H', [11, 10, 6, right_tile(2), right_tile(3)], { equivalent: [right_tile('B')] });
    this.add_face('I', [8, 9, 13, left_tile(3), left_tile(2)], { equivalent: [left_tile('C')] });
    this.add_face('J', [13, 9, 10, 11, 12]);
    this.add_face('K', [12, 11, right_tile(3), right_tile(5), top_right_tile(7)], { equivalent: [right_tile('D'), top_right_tile('E')] });
    this.add_face('L', [13, 12, top_right_tile(7), top_tile(1), top_tile(2)], { equivalent: [top_right_tile('F'), top_tile('A')] });
  }
  floret_fingerprint(face) {
    let fingerprint = [...this.fingerprint];
    fingerprint[0] = Math.floor(fingerprint[0] / 2) + Math.floor(fingerprint[1] / 2);
    if (face === 'F') {
      fingerprint[0] -= 1;
    } else if (face === 'K') {
      fingerprint[0] += 1;
    }
    if (this.fingerprint[0] % 2 === 0) {
      if (['A', 'B'].includes(face)) {
        fingerprint[0] -= 1;
      }
    } else {
      if (['C', 'D'].includes(face)) {
        fingerprint[0] += 1;
      }
    }
    if (['A', 'B', 'E', 'F', 'G', 'H'].includes(face)) {
      fingerprint[1] -= 1;
    }
    return fingerprint;
  }
  color_pattern1() {
    const pattern = [0, 0, 1];
    for (const face in this.faces) {
      const fp = this.floret_fingerprint(face);
      const offset = (fp[0] + fp[1]) % 3;
      this.color_face(face, pattern[offset]);
    }
  }
  color_pattern2() {
    for (const face in this.faces) {
      const fp = this.floret_fingerprint(face);
      const color = (fp[0] + fp[1]) % 3;
      this.color_face(face, color);
    }
  }
  color_pattern3() {
    const pattern = [
      [2, 0, 2, 2, 0, 2],
      [2, 1, 2, 0, 0, 0]
    ];
    for (const face in this.faces) {
      const fp = this.floret_fingerprint(face);
      const row = fp[1] % 2;
      const column = ((fp[0] - 2 * fp[1]) % 6 + 6) % 6; // ensure non-negative modulo
      this.color_face(face, pattern[row][column]);
    }
  }
}
class FloretTessagon extends Tessagon {
  static tile_class = FloretTile;
  static metadata = floret_metadata;
}
