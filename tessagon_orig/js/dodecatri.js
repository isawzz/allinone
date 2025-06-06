
const dodeca_tri_metadata = new TessagonMetadata({
  name: "Dodecagons and Triangles",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["dodecagons", "triangles"],
  sides: [12, 3],
  uv_ratio: Math.sqrt(3.0)
});
class DodecaTriTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: { v_boundary: null, diag: null, tri: null },
        middle: null,
        bottom: { v_boundary: null, diag: null, tri: null }
      },
      right: {
        top: { v_boundary: null, diag: null, tri: null },
        middle: null,
        bottom: { v_boundary: null, diag: null, tri: null }
      }
    };
  }
  init_faces() {
    return {
      dodec: {
        left: { top: null, bottom: null },
        right: { top: null, bottom: null },
        center: null
      },
      tri: {
        left: { top: null, middle: null, bottom: null },
        right: { top: null, middle: null, bottom: null }
      }
    };
  }
  calculate_verts() {
    const u_unit = 1.0 / (3.0 + 2.0 * Math.sqrt(3));
    const u_h = 0.5 * Math.sqrt(3) * u_unit; // height of triangle of side u_unit
    const u1 = 0.5 * u_unit;
    const u2 = u1 + u_h;
    const u3 = u2 + u1;
    const u4 = u3 + u_h;
    const v_unit = 1.0 / (2.0 + Math.sqrt(3));
    const v_h = 0.5 * Math.sqrt(3) * v_unit; // height of triangle of side v_unit
    const v1 = 0;
    const v2 = 0.5 * v_unit;
    const v3 = v2 + v_h;
    const v4 = 0.5;
    // Sweet symmetry makes this easy work
    this.add_vert(["left", "middle"], u1, v4);
    this.add_vert(["left", "bottom", "v_boundary"], u4, v1, { v_boundary: true });
    this.add_vert(["left", "bottom", "diag"], u3, v2);
    this.add_vert(["left", "bottom", "tri"], u2, v3);
  }
  calculate_faces() {
    // Top left Dodecagon
    this.add_face(
      ["dodec", "left", "bottom"],
      [
        ["left", "middle"],
        ["left", "bottom", "tri"],
        ["left", "bottom", "diag"],
        bottom_tile(["left", "top", "diag"]),
        bottom_tile(["left", "top", "tri"]),
        bottom_tile(["left", "middle"]),
        bottom_left_tile(["right", "middle"]),
        bottom_left_tile(["right", "top", "tri"]),
        bottom_left_tile(["right", "top", "diag"]),
        left_tile(["right", "bottom", "diag"]),
        left_tile(["right", "bottom", "tri"]),
        left_tile(["right", "middle"])
      ],
      { face_type: "dodecagon", corner: true }
    );
    // Middle Dodecagon
    this.add_face(
      ["dodec", "center"],
      [
        ["left", "bottom", "tri"],
        ["left", "bottom", "diag"],
        ["left", "bottom", "v_boundary"],
        ["right", "bottom", "v_boundary"],
        ["right", "bottom", "diag"],
        ["right", "bottom", "tri"],
        ["right", "top", "tri"],
        ["right", "top", "diag"],
        ["right", "top", "v_boundary"],
        ["left", "top", "v_boundary"],
        ["left", "top", "diag"],
        ["left", "top", "tri"]
      ],
      { face_type: "dodecagon" }
    );
    // Left triangle
    this.add_face(
      ["tri", "left", "middle"],
      [
        ["left", "top", "tri"],
        ["left", "bottom", "tri"],
        ["left", "middle"]
      ],
      { face_type: "triangle" }
    );
    // Bottom-left triangle
    this.add_face(
      ["tri", "left", "bottom"],
      [
        ["left", "bottom", "diag"],
        ["left", "bottom", "v_boundary"],
        bottom_tile(["left", "top", "diag"])
      ],
      { face_type: "triangle", v_boundary: true }
    );
  }
  color_pattern1() {
    this.color_paths([["dodec", "left", "bottom"], ["dodec", "center"]], 1, 0);
  }
}
class DodecaTriTessagon extends Tessagon {
  static tile_class = DodecaTriTile;
  static metadata = dodeca_tri_metadata;
}

