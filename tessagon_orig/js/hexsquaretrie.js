
const hex_square_tri_metadata = new TessagonMetadata({
  name: "Hexagons, Squares, and Triangles",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["hexagons", "squares", "triangles"],
  sides: [6, 4, 3],
  uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexSquareTriTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      top: {
        left: { u_boundary: null, u_square: null, v_square: null },
        right: { u_boundary: null, u_square: null, v_square: null },
        center: null
      },
      bottom: {
        left: { u_boundary: null, u_square: null, v_square: null },
        right: { u_boundary: null, u_square: null, v_square: null },
        center: null
      }
    };
  }
  init_faces() {
    return {
      hex: {
        top: { left: null, right: null },
        bottom: { left: null, right: null },
        middle: null
      },
      tri: {
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
    const u_unit = 1.0 / (1.0 + Math.sqrt(3));
    const u0 = 0;
    const u1 = 0.5 * u_unit;
    const u2 = 0.5 * (1.0 - u_unit);
    const u3 = 0.5;
    const v_unit = 1.0 / (3.0 + Math.sqrt(3));
    const v0 = 1.0 - 0.5 * v_unit;
    const v1 = 1.0 - v_unit;
    const v2 = 0.5 + v_unit;
    const v3 = 0.5 + 0.5 * v_unit;
    // Define top left square, others defined through symmetry
    this.add_vert(["top", "left", "v_square"], u2, v0);
    this.add_vert(["top", "center"], u3, v2);
    this.add_vert(["top", "left", "u_square"], u1, v3);
    this.add_vert(["top", "left", "u_boundary"], u0, v1, { u_boundary: true });
  }
  calculate_faces() {
    // Middle hexagon
    this.add_face(
      ["hex", "middle"],
      [
        ["top", "center"],
        ["top", "left", "u_square"],
        ["bottom", "left", "u_square"],
        ["bottom", "center"],
        ["bottom", "right", "u_square"],
        ["top", "right", "u_square"]
      ],
      { face_type: "hexagon" }
    );
    // Top square
    this.add_face(
      ["square", "top", "center"],
      [
        ["top", "left", "v_square"],
        ["top", "right", "v_square"],
        top_tile(["bottom", "right", "v_square"]),
        top_tile(["bottom", "left", "v_square"])
      ],
      { face_type: "square", v_boundary: true }
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
      { face_type: "square", u_boundary: true }
    );
    // Interior square
    this.add_face(
      ["square", "top", "left"],
      [
        ["top", "left", "v_square"],
        ["top", "center"],
        ["top", "left", "u_square"],
        ["top", "left", "u_boundary"]
      ],
      { face_type: "square" }
    );
    // Upper triangle
    this.add_face(
      ["tri", "top", "center"],
      [
        ["top", "center"],
        ["top", "left", "v_square"],
        ["top", "right", "v_square"]
      ],
      { face_type: "triangle" }
    );
    // Left triangle
    this.add_face(
      ["tri", "top", "left"],
      [
        ["top", "left", "u_square"],
        ["top", "left", "u_boundary"],
        left_tile(["top", "right", "u_square"])
      ],
      { face_type: "triangle", u_boundary: true }
    );
    // Corner hexagon
    this.add_face(
      ["hex", "top", "left"],
      [
        ["top", "left", "v_square"],
        ["top", "left", "u_boundary"],
        left_tile(["top", "right", "v_square"]),
        left_top_tile(["bottom", "right", "v_square"]),
        top_tile(["bottom", "left", "u_boundary"]),
        top_tile(["bottom", "left", "v_square"])
      ],
      { face_type: "hexagon", corner: true }
    );
  }
  color_pattern1() {
    this.color_face(["hex", "middle"], 1);
    this.color_face(["hex", "top", "left"], 1);
    this.color_face(["square", "top", "center"], 2);
    this.color_face(["square", "top", "left"], 2);
    this.color_face(["square", "top", "right"], 2);
    this.color_face(["square", "middle", "left"], 2);
    this.color_face(["square", "bottom", "left"], 2);
    this.color_face(["square", "bottom", "right"], 2);
  }
}
class HexSquareTriTessagon extends Tessagon {
  static tile_class = HexSquareTriTile;
  static metadata = hex_square_tri_metadata;
}