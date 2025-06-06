
const dissected_suqare_metadata = new TessagonMetadata({
  name: "Dissected Square",
  num_color_patterns: 2,
  classification: "laves",
  shapes: ["triangles"],
  sides: [3],
  uv_ratio: 1.0
});
class DissectedSquareTile extends Tile {
  constructor(tessagon, options = {}) {
    super(tessagon, options);
    this.u_symmetric = true;
    this.v_symmetric = true;
  }
  init_verts() {
    return {
      top: { left: null, center: null, right: null },
      middle: { left: null, center: null, right: null },
      bottom: { left: null, center: null, right: null }
    };
  }
  init_faces() {
    return {
      top: {
        left: { middle: null, center: null },
        right: { middle: null, center: null }
      },
      bottom: {
        left: { middle: null, center: null },
        right: { middle: null, center: null }
      }
    };
  }
  calculate_verts() {
    this.add_vert(["top", "left"], 0, 1.0, { corner: true });
    this.add_vert(["middle", "left"], 0, 0.5, { u_boundary: true });
    this.add_vert(["top", "center"], 0.5, 1.0, { v_boundary: true });
    this.add_vert(["middle", "center"], 0.5, 0.5);
  }
  calculate_faces() {
    this.add_face(
      ["top", "left", "middle"],
      [
        ["top", "left"],
        ["middle", "left"],
        ["middle", "center"]
      ]
    );
    this.add_face(
      ["top", "left", "center"],
      [
        ["top", "left"],
        ["middle", "center"],
        ["top", "center"]
      ]
    );
  }
  color_pattern1() {
    this.color_paths(
      [
        ["top", "left", "center"],
        ["top", "right", "middle"],
        ["bottom", "right", "center"],
        ["bottom", "left", "middle"]
      ],
      1,
      0
    );
  }
  color_pattern2() {
    if ((Math.floor(this.fingerprint[0] / 2) + Math.floor(this.fingerprint[1] / 2)) % 2 === 0) {
      this.color_tiles(1, 0);
    } else {
      this.color_tiles(0, 1);
    }
  }
  color_tiles(color1, color2) {
    if (this.fingerprint[0] % 2 === 0) {
      if (this.fingerprint[1] % 2 === 0) {
        this.color_paths(
          [
            ["top", "left", "center"],
            ["bottom", "right", "middle"]
          ],
          color2,
          color1
        );
      } else {
        this.color_paths(
          [
            ["bottom", "left", "center"],
            ["top", "right", "middle"]
          ],
          color2,
          color1
        );
      }
    } else {
      if (this.fingerprint[1] % 2 === 0) {
        this.color_paths(
          [
            ["top", "right", "center"],
            ["bottom", "left", "middle"]
          ],
          color2,
          color1
        );
      } else {
        this.color_paths(
          [
            ["bottom", "right", "center"],
            ["top", "left", "middle"]
          ],
          color2,
          color1
        );
      }
    }
  }
}
class DissectedSquareTessagon extends Tessagon {
  static tile_class = DissectedSquareTile;
  static metadata = dissected_suqare_metadata;
}
