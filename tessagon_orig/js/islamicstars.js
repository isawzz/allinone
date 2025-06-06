
const islamic_stars_metadata = new TessagonMetadata({
  name: "Islamic Stars and Crosses",
  num_color_patterns: 1,
  classification: "non_convex",
  shapes: ["stars", "crosses"],
  sides: [16],
  uv_ratio: 1.0
});
class IslamicStarsCrossesTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  
  init_verts() {
    return {
      left: {
        top: { v_dominant: null, point: null, u_dominant: null },
        middle: null,
        bottom: { v_dominant: null, point: null, u_dominant: null }
      },
      center: { top: null, bottom: null },
      right: {
        top: { v_dominant: null, point: null, u_dominant: null },
        middle: null,
        bottom: { v_dominant: null, point: null, u_dominant: null }
      }
    };
  }
  
  init_faces() {
    return {
      left: { top: null, bottom: null },
      center: null,
      right: { top: null, bottom: null }
    };
  }
  
  calculate_verts() {
    const c = 1.0 / (2 * (Math.sqrt(2) + 1));
    const a = c / Math.sqrt(2);
    // left top corner
    this.add_vert(["left", "middle"], 0.0, 0.5, { u_boundary: true });
    this.add_vert(["left", "top", "u_dominant"], a, 0.5 + a);
    this.add_vert(["left", "top", "point"], a, 1.0 - a);
    this.add_vert(["left", "top", "v_dominant"], 0.5 - a, 1.0 - a);
    this.add_vert(["center", "top"], 0.5, 1.0, { v_boundary: true });
  }
  
  calculate_faces() {
    // Middle star
    this.add_face(
      ["center"],
      [
        ["left", "middle"],
        ["left", "top", "u_dominant"],
        ["left", "top", "point"],
        ["left", "top", "v_dominant"],
        ["center", "top"],
        ["right", "top", "v_dominant"],
        ["right", "top", "point"],
        ["right", "top", "u_dominant"],
        ["right", "middle"],
        ["right", "bottom", "u_dominant"],
        ["right", "bottom", "point"],
        ["right", "bottom", "v_dominant"],
        ["center", "bottom"],
        ["left", "bottom", "v_dominant"],
        ["left", "bottom", "point"],
        ["left", "bottom", "u_dominant"]
      ],
      { face_type: "star" }
    );
    // Top left cross
    this.add_face(
      ["left", "top"],
      [
        ["center", "top"],
        ["left", "top", "v_dominant"],
        ["left", "top", "point"],
        ["left", "top", "u_dominant"],
        ["left", "middle"],
        left_tile(["right", "top", "u_dominant"]),
        left_tile(["right", "top", "point"]),
        left_tile(["right", "top", "v_dominant"]),
        left_tile(["center", "top"]),
        top_left_tile(["right", "bottom", "v_dominant"]),
        top_left_tile(["right", "bottom", "point"]),
        top_left_tile(["right", "bottom", "u_dominant"]),
        top_left_tile(["right", "middle"]),
        top_tile(["left", "bottom", "u_dominant"]),
        top_tile(["left", "bottom", "point"]),
        top_tile(["left", "bottom", "v_dominant"])
      ],
      { face_type: "cross", corner: true }
    );
  }
  
  color_pattern1() {
    this.color_face(["left", "top"], 1);
    this.color_face(["center"], 0);
  }
}
class IslamicStarsCrossesTessagon extends Tessagon {
  static tile_class = IslamicStarsCrossesTile;
  static metadata = islamic_stars_metadata;
}
