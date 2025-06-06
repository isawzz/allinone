
const square_tri_metadata = new TessagonMetadata({
  name: "Squares and Triangles",
  num_color_patterns: 2,
  classification: "archimedean",
  shapes: ["squares", "triangles"],
  sides: [4, 3],
  uv_ratio: 1.0
});
class SquareTriTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      top: {
        left: { u_boundary: null, v_boundary: null },
        right: { u_boundary: null, v_boundary: null },
        center: null
      },
      bottom: {
        left: { u_boundary: null, v_boundary: null },
        right: { u_boundary: null, v_boundary: null },
        center: null
      },
      middle: {
        left: null,
        right: null
      }
    };
  }
  init_faces() {
    return {
      tri: {
        top: {
          left: { u_boundary: null, v_boundary: null },
          right: { u_boundary: null, v_boundary: null },
          center: null
        },
        bottom: {
          left: { u_boundary: null, v_boundary: null },
          right: { u_boundary: null, v_boundary: null },
          center: null
        },
        middle: {
          left: null,
          right: null
        }
      },
      square: {
        top: { left: null, right: null },
        bottom: { left: null, right: null }
      }
    };
  }
  calculate_verts() {
    const u_unit = 1.0 / (1.0 + Math.sqrt(3));
    const u0 = 0;
    const u1 = 0.5 * u_unit;
    const u2 = 0.5 * (1.0 - u_unit);
    const u3 = 0.5;
    const v_unit = 1.0 / (1.0 + Math.sqrt(3));
    const v0 = 0.5;
    const v1 = 0.5 * (1.0 + v_unit);
    const v2 = 1.0 - 0.5 * v_unit;
    const v3 = 1.0;
    this.add_vert(["top", "left", "u_boundary"], u0, v1, { u_boundary: true });
    this.add_vert(["top", "left", "v_boundary"], u1, v3, { v_boundary: true });
    this.add_vert(["top", "center"], u3, v2);
    this.add_vert(["middle", "left"], u2, v0);
  }
  calculate_faces() {
    this.add_face(
      ["square", "top", "left"],
      [
        ["top", "left", "u_boundary"],
        ["top", "left", "v_boundary"],
        ["top", "center"],
        ["middle", "left"]
      ],
      { face_type: "square" }
    );
    this.add_face(
      ["tri", "top", "left", "u_boundary"],
      [
        ["top", "left", "v_boundary"],
        ["top", "left", "u_boundary"],
        [["left"], ["top", "right", "v_boundary"]]
      ],
      { face_type: "triangle", u_boundary: true }
    );
    this.add_face(
      ["tri", "top", "left", "v_boundary"],
      [
        ["top", "left", "v_boundary"],
        ["top", "center"],
        [["top"], ["bottom", "center"]]
      ],
      { face_type: "triangle", v_boundary: true }
    );
    this.add_face(
      ["tri", "top", "center"],
      [
        ["top", "center"],
        ["middle", "right"],
        ["middle", "left"]
      ],
      { face_type: "triangle" }
    );
    this.add_face(
      ["tri", "middle", "left"],
      [
        ["middle", "left"],
        ["bottom", "left", "u_boundary"],
        ["top", "left", "u_boundary"]
      ],
      { face_type: "triangle" }
    );
  }
  color_pattern1() {
    this.color_face(["square", "top", "left"], 1);
    this.color_face(["square", "top", "right"], 1);
    this.color_face(["square", "bottom", "left"], 1);
    this.color_face(["square", "bottom", "right"], 1);
  }
  color_pattern2() {
    this.color_face(["square", "top", "left"], 1);
    this.color_face(["square", "top", "right"], 1);
    this.color_face(["square", "bottom", "left"], 1);
    this.color_face(["square", "bottom", "right"], 1);
    this.color_face(["tri", "middle", "left"], 2);
    this.color_face(["tri", "middle", "right"], 2);
    this.color_face(["tri", "top", "left", "v_boundary"], 2);
    this.color_face(["tri", "top", "right", "v_boundary"], 2);
  }
}
class SquareTriTessagon extends Tessagon {
  static tile_class = SquareTriTile;
  static metadata = square_tri_metadata;
}
