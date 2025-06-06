
const square_tri2_metadata = new TessagonMetadata({
  name: "Other Squares and Triangles",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["squares", "triangles"],
  sides: [4, 3],
  uv_ratio: 1.0 / (2.0 + Math.sqrt(3.0))
});
class SquareTri2Tile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: { u_boundary: null },
        bottom: { u_boundary: null }
      },
      right: {
        top: { u_boundary: null },
        bottom: { u_boundary: null }
      },
      center: {
        top: null,
        bottom: null
      }
    };
  }
  init_faces() {
    return {
      left: {
        top: { corner: null, u_boundary: null },
        bottom: { corner: null, u_boundary: null }
      },
      right: {
        top: { corner: null, u_boundary: null },
        bottom: { corner: null, u_boundary: null }
      },
      center: {
        top: null,
        middle: null,
        bottom: null
      }
    };
  }
  calculate_verts() {
    const v_unit = 1.0 / (2 + Math.sqrt(3));
    const v1 = v_unit * 0.5;
    const v2 = 0.5 - v1;
    // Other verts defined through symmetry
    this.add_vert(["center", "bottom"], 0.5, v1);
    this.add_vert(["left", "bottom", "u_boundary"], 0, v2, { u_boundary: true });
  }
  calculate_faces() {
    this.add_face(
      ["left", "bottom", "corner"],
      [
        ["center", "bottom"],
        [["left"], ["center", "bottom"]],
        [["left", "bottom"], ["center", "top"]],
        [["bottom"], ["center", "top"]]
      ],
      { face_type: "square", corner: true }
    );
    
    this.add_face(
      ["left", "bottom", "u_boundary"],
      [
        ["center", "bottom"],
        ["left", "bottom", "u_boundary"],
        [["left"], ["center", "bottom"]]
      ],
      { face_type: "triangle", u_boundary: true }
    );
    
    this.add_face(
      ["center", "bottom"],
      [
        ["left", "bottom", "u_boundary"],
        ["center", "bottom"],
        ["right", "bottom", "u_boundary"]
      ],
      { face_type: "triangle" }
    );
    
    this.add_face(
      ["center", "middle"],
      [
        ["left", "bottom", "u_boundary"],
        ["right", "bottom", "u_boundary"],
        ["right", "top", "u_boundary"],
        ["left", "top", "u_boundary"]
      ],
      { face_type: "square" }
    );
  }
  color_pattern1() {
    this.color_paths(
      [
        ["left", "bottom", "corner"],
        ["center", "middle"]
      ],
      1,
      0
    );
  }
}
class SquareTri2Tessagon extends Tessagon {
  static tile_class = SquareTri2Tile;
  static metadata = square_tri2_metadata;
}
