
const dodeca_metadata = new TessagonMetadata({
  name: "Dodecagons, Hexagons, and Squares",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["dodecagons", "hexagons", "squares"],
  sides: [12, 6, 4],
  uv_ratio: 1.0 / Math.sqrt(3.0)
});
class DodecaTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      top: {
        left: {
          u_square: null,
          v_square: null,
          sq1: null,
          sq2: null,
          sq3: null,
          sq4: null
        },
        right: {
          u_square: null,
          v_square: null,
          sq1: null,
          sq2: null,
          sq3: null,
          sq4: null
        }
      },
      bottom: {
        left: {
          u_square: null,
          v_square: null,
          sq1: null,
          sq2: null,
          sq3: null,
          sq4: null
        },
        right: {
          u_square: null,
          v_square: null,
          sq1: null,
          sq2: null,
          sq3: null,
          sq4: null
        }
      }
    };
  }
  init_faces() {
    return {
      dodec: {
        top: { left: null, right: null },
        bottom: { left: null, right: null },
        middle: null
      },
      hex: {
        top: { left: null, center: null, right: null },
        bottom: { left: null, center: null, right: null }
      },
      square: {
        top: { left: null, center: null, right: null },
        bottom: { left: null, center: null, right: null },
        middle: { left: null, right: null }
      }
    };
  }
  calculate_verts() {
    // u_unit: edge length as a proportion of the tile
    const u_unit = 1.0 / (3.0 + Math.sqrt(3));
    const u_h = 0.5 * Math.sqrt(3) * u_unit; // height of triangle with side u_unit
    const u1 = 0.5 * u_unit;
    const u2 = 0.5 - u1 - u_h;
    const u3 = 0.5 - u_unit;
    const u4 = 0.5 - u1;
    const v_unit = 1.0 / (3.0 * (1.0 + Math.sqrt(3)));
    const v_h = 0.5 * Math.sqrt(3) * v_unit; // height of triangle with side v_unit
    const v1 = 1.0 - 0.5 * v_unit;
    const v2 = v1 - v_h;
    const v3 = 0.5 + 2 * v_h + 0.5 * v_unit;
    const v4 = 0.5 + v_h + v_unit;
    const v5 = 0.5 + v_h + 0.5 * v_unit;
    const v6 = 0.5 + 0.5 * v_unit;
    // Define top left region (other vertices defined via symmetry)
    this.add_vert(["top", "left", "v_square"], u4, v1);
    this.add_vert(["top", "left", "u_square"], u1, v6);
    this.add_vert(["top", "left", "sq1"], u2, v5);
    this.add_vert(["top", "left", "sq2"], u4, v4);
    this.add_vert(["top", "left", "sq3"], u1, v3);
    this.add_vert(["top", "left", "sq4"], u3, v2);
  }
  calculate_faces() {
    // Top left Dodecagon
    this.add_face(
      ["dodec", "top", "left"],
      [
        ["top", "left", "v_square"],
        ["top", "left", "sq4"],
        ["top", "left", "sq3"],
        left_tile(["top", "right", "sq3"]),
        left_tile(["top", "right", "sq4"]),
        left_tile(["top", "right", "v_square"]),
        left_top_tile(["bottom", "right", "v_square"]),
        left_top_tile(["bottom", "right", "sq4"]),
        left_top_tile(["bottom", "right", "sq3"]),
        top_tile(["bottom", "left", "sq3"]),
        top_tile(["bottom", "left", "sq4"]),
        top_tile(["bottom", "left", "v_square"])
      ],
      { face_type: 'dodecagon', corner: true }
    );
    // Middle Dodecagon
    this.add_face(
      ["dodec", "middle"],
      [
        ["top", "left", "u_square"],
        ["top", "left", "sq1"],
        ["top", "left", "sq2"],
        ["top", "right", "sq2"],
        ["top", "right", "sq1"],
        ["top", "right", "u_square"],
        ["bottom", "right", "u_square"],
        ["bottom", "right", "sq1"],
        ["bottom", "right", "sq2"],
        ["bottom", "left", "sq2"],
        ["bottom", "left", "sq1"],
        ["bottom", "left", "u_square"]
      ],
      { face_type: 'dodecagon' }
    );
    // Upper square
    this.add_face(
      ["square", "top", "center"],
      [
        ["top", "left", "v_square"],
        ["top", "right", "v_square"],
        top_tile(["bottom", "right", "v_square"]),
        top_tile(["bottom", "left", "v_square"])
      ],
      { face_type: 'square', v_boundary: true }
    );
    // Left square
    this.add_face(
      ["square", "middle", "left"],
      [
        ["top", "left", "u_square"],
        ["bottom", "left", "u_square"],
        left_tile(["bottom", "right", "u_square"]),
        left_tile(["top", "right", "u_square"])
      ],
      { face_type: 'square', u_boundary: true }
    );
    // Interior square
    this.add_face(
      ["square", "top", "left"],
      [
        ["top", "left", "sq1"],
        ["top", "left", "sq2"],
        ["top", "left", "sq4"],
        ["top", "left", "sq3"]
      ],
      { face_type: 'square' }
    );
    // Top Hex
    this.add_face(
      ["hex", "top", "center"],
      [
        ["top", "left", "sq2"],
        ["top", "left", "sq4"],
        ["top", "left", "v_square"],
        ["top", "right", "v_square"],
        ["top", "right", "sq4"],
        ["top", "right", "sq2"]
      ],
      { face_type: 'hexagon' }
    );
    // Left Hex
    this.add_face(
      ["hex", "top", "left"],
      [
        ["top", "left", "sq3"],
        ["top", "left", "sq1"],
        ["top", "left", "u_square"],
        left_tile(["top", "right", "u_square"]),
        left_tile(["top", "right", "sq1"]),
        left_tile(["top", "right", "sq3"])
      ],
      { face_type: 'hexagon', u_boundary: true }
    );
  }
  color_pattern1() {
    this.color_face(["dodec", "middle"], 1);
    this.color_face(["dodec", "top", "left"], 1);
    this.color_face(["hex", "top", "left"], 2);
    this.color_face(["hex", "top", "center"], 2);
    this.color_face(["hex", "bottom", "left"], 2);
    this.color_face(["hex", "bottom", "center"], 2);
  }
}
class DodecaTessagon extends Tessagon {
  static tile_class = DodecaTile;
  static metadata = dodeca_metadata;
}
