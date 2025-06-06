
const rhombus_metadata = new TessagonMetadata({
  name: 'Rhombuses',
  num_color_patterns: 2,
  classification: 'laves',
  shapes: ['rhombuses'],
  sides: [4],
  uv_ratio: 1.0 / Math.sqrt(3.0)
});
class RhombusTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      left: { top: null, middle: null, bottom: null },
      center: {
        top: { boundary: null, interior: null },
        bottom: { boundary: null, interior: null }
      },
      right: { top: null, middle: null, bottom: null }
    };
  }
  init_faces() {
    return {
      middle: null,
      left: {
        top: { interior: null, exterior: null },
        bottom: { interior: null, exterior: null }
      },
      right: {
        top: { interior: null, exterior: null },
        bottom: { interior: null, exterior: null }
      }
    };
  }
  calculate_verts() {
    // 10 verts, do top left quadrant, others via symmetry
    this.add_vert(['center', 'top', 'boundary'], 0.5, 1, { v_boundary: true });
    this.add_vert(['left', 'top'], 0, 5.0 / 6.0, { u_boundary: true });
    this.add_vert(['center', 'top', 'interior'], 0.5, 2.0 / 3.0);
    this.add_vert(['left', 'middle'], 0, 1.0 / 2.0, { u_boundary: true });
  }
  calculate_faces() {
    // One middle face
    this.add_face(
      'middle',
      [
        ['center', 'top', 'interior'],
        ['left', 'middle'],
        ['center', 'bottom', 'interior'],
        ['right', 'middle']
      ],
      { face_type: 'horizontal' }
    );
    // Eight others, define only left top, others by symmetry
    this.add_face(
      ['left', 'top', 'interior'],
      [
        ['center', 'top', 'boundary'],
        ['left', 'top'],
        ['left', 'middle'],
        ['center', 'top', 'interior']
      ],
      { face_type: 'upward' }
    );
    this.add_face(
      ['left', 'top', 'exterior'],
      [
        ['center', 'top', 'boundary'],
        ['left', 'top'],
        left_tile(['center', 'top', 'boundary']),
        top_tile(['left', 'bottom'])
      ],
      { face_type: 'horizontal', corner: true }
    );
  }
  color_pattern1() {
    this.color_face(['middle'], 1);
    this.color_face(['left', 'top', 'exterior'], 1);
    this.color_face(['left', 'top', 'interior'], 2);
    this.color_face(['right', 'bottom', 'interior'], 2);
  }
  color_pattern2() {
    this.color_face(['left', 'top', 'interior'], 1);
    this.color_face(['right', 'top', 'interior'], 1);
    this.color_face(['left', 'bottom', 'interior'], 2);
    this.color_face(['right', 'bottom', 'interior'], 2);
  }
}
class RhombusTessagon extends Tessagon {
  static tile_class = RhombusTile;
  static metadata = rhombus_metadata;
}
