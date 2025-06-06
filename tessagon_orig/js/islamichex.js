
const islamic_hex_metadata = new TessagonMetadata({
  name: "Islamic Hexagons and Stars",
  num_color_patterns: 1,
  classification: "non_convex",
  shapes: ["hexagons", "stars"],
  sides: [6, 12],
  uv_ratio: Math.sqrt(3.0)
});
class IslamicHexStarsTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: {
        top: {
          boundary: null,
          mid: { outer: null, mid: null, inner: null }
        },
        middle: { inner: null, outer: null },
        bottom: {
          boundary: null,
          mid: { outer: null, mid: null, inner: null }
        }
      },
      center: { top: null, bottom: null },
      right: {
        top: {
          boundary: null,
          mid: { outer: null, mid: null, inner: null }
        },
        middle: { inner: null, outer: null },
        bottom: {
          boundary: null,
          mid: { outer: null, mid: null, inner: null }
        }
      }
    };
  }
  init_faces() {
    return {
      left: {
        top: { star: null, hexagon: null },
        middle: { hexagon: null },
        bottom: { star: null, hexagon: null }
      },
      center: { star: null },
      right: {
        top: { star: null, hexagon: null },
        middle: { hexagon: null },
        bottom: { star: null, hexagon: null }
      }
    };
  }
  calculate_verts() {
    // Left verts
    this.add_vert(['left', 'top', 'boundary'], 2/12.0, 1, { v_boundary: true });
    this.add_vert(['left', 'top', 'mid', 'outer'], 1/12.0, 0.75);
    this.add_vert(['left', 'top', 'mid', 'mid'], 3/12.0, 0.75);
    this.add_vert(['left', 'top', 'mid', 'inner'], 5/12.0, 0.75);
    this.add_vert(['left', 'middle', 'outer'], 0, 0.5, { u_boundary: true });
    this.add_vert(['left', 'middle', 'inner'], 4/12, 0.5);
    // Center vert
    this.add_vert(['center', 'top'], 0.5, 1, { v_boundary: true });
  }
  calculate_faces() {
    this.add_face(
      ['left', 'top', 'star'],
      [
        ['left', 'top', 'boundary'],
        ['left', 'top', 'mid', 'mid'],
        ['left', 'top', 'mid', 'outer'],
        ['left', 'middle', 'outer'],
        left_tile(['right', 'top', 'mid', 'outer']),
        left_tile(['right', 'top', 'mid', 'mid']),
        left_tile(['right', 'top', 'boundary']),
        top_left_tile(['right', 'bottom', 'mid', 'mid']),
        top_left_tile(['right', 'bottom', 'mid', 'outer']),
        top_tile(['left', 'middle', 'outer']),
        top_tile(['left', 'bottom', 'mid', 'outer']),
        top_tile(['left', 'bottom', 'mid', 'mid'])
      ],
      { face_type: "star", corner: true }
    );
    this.add_face(
      ['left', 'top', 'hexagon'],
      [
        ['center', 'top'],
        ['left', 'top', 'mid', 'inner'],
        ['left', 'top', 'mid', 'mid'],
        ['left', 'top', 'boundary'],
        top_tile(['left', 'bottom', 'mid', 'mid']),
        top_tile(['left', 'bottom', 'mid', 'inner'])
      ],
      { face_type: "hexagon", v_boundary: true }
    );
    this.add_face(
      ['left', 'middle', 'hexagon'],
      [
        ['left', 'middle', 'outer'],
        ['left', 'top', 'mid', 'outer'],
        ['left', 'top', 'mid', 'mid'],
        ['left', 'middle', 'inner'],
        ['left', 'bottom', 'mid', 'mid'],
        ['left', 'bottom', 'mid', 'outer']
      ],
      { face_type: "hexagon" }
    );
    this.add_face(
      ['center', 'star'],
      [
        ['center', 'top'],
        ['right', 'top', 'mid', 'inner'],
        ['right', 'top', 'mid', 'mid'],
        ['right', 'middle', 'inner'],
        ['right', 'bottom', 'mid', 'mid'],
        ['right', 'bottom', 'mid', 'inner'],
        ['center', 'bottom'],
        ['left', 'bottom', 'mid', 'inner'],
        ['left', 'bottom', 'mid', 'mid'],
        ['left', 'middle', 'inner'],
        ['left', 'top', 'mid', 'mid'],
        ['left', 'top', 'mid', 'inner']
      ],
      { face_type: "star" }
    );
  }
  color_pattern1() {
    this.color_face(['left', 'top', 'star'], 1);
    this.color_face(['center', 'star'], 1);
  }
}
class IslamicHexStarsTessagon extends Tessagon {
  static tile_class = IslamicHexStarsTile;
  static metadata = islamic_hex_metadata;
}
