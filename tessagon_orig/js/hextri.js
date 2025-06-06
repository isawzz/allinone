
const hex_tri_metadata = new TessagonMetadata({
  name: "Hexagons and Triangles",
  num_color_patterns: 1,
  classification: "archimedean",
  shapes: ["hexagons", "triangles"],
  sides: [6, 3],
  uv_ratio: 1.0 / Math.sqrt(3.0)
});
class HexTriTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      top: null,
      left: {
        top: null,
        middle: null,
        bottom: null
      },
      right: {
        top: null,
        middle: null,
        bottom: null
      },
      bottom: null
    };
  }
  init_faces() {
    return {
      center: {
        top: null,
        middle: null,
        bottom: null
      },
      left: {
        top: { triangle: null, hexagon: null },
        bottom: { triangle: null, hexagon: null }
      },
      right: {
        top: { triangle: null, hexagon: null },
        bottom: { triangle: null, hexagon: null }
      }
    };
  }
  calculate_verts() {
    // Top left verts
    this.add_vert("top", 0.5, 1, { v_boundary: true });
    this.add_vert(["left", "top"], 0.25, 0.75);
    this.add_vert(["left", "middle"], 0, 0.5, { u_boundary: true });
  }
  calculate_faces() {
    // Middle hexagon
    this.add_face(
      ["center", "middle"],
      [
        ["left", "top"],
        ["left", "middle"],
        ["left", "bottom"],
        ["right", "bottom"],
        ["right", "middle"],
        ["right", "top"]
      ],
      { face_type: "hexagon" }
    );
    
    // Interior top triangle
    this.add_face(
      ["center", "top"],
      [
        ["top"],
        ["left", "top"],
        ["right", "top"]
      ],
      { face_type: "triangle" }
    );
    
    // Exterior left triangle
    this.add_face(
      ["left", "top", "triangle"],
      [
        ["left", "top"],
        ["left", "middle"],
        left_tile(["right", "top"])
      ],
      { face_type: "triangle", u_boundary: true }
    );
    
    // Exterior top-left hexagon
    this.add_face(
      ["left", "top", "hexagon"],
      [
        ["top"],
        ["left", "top"],
        left_tile(["right", "top"]),
        left_tile("top"),
        left_top_tile(["right", "bottom"]),
        top_tile(["left", "bottom"])
      ],
      { face_type: "hexagon", corner: true }
    );
  }
  color_pattern1() {
    this.color_face(["center", "middle"], 1);
    this.color_face(["left", "top", "hexagon"], 1);
  }
}
class HexTriTessagon extends Tessagon {
  static tile_class = HexTriTile;
  static metadata = hex_tri_metadata;
}
