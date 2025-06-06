
const pythagorean_metadata = new TessagonMetadata({
  name: "Pythagorean",
  num_color_patterns: 1,
  classification: "non_edge",
  shapes: ["squares"],
  sides: [4],
  uv_ratio: 1.0
});
class PythagoreanTile extends Tile {
  init_verts() {
    return {
      "1": { "1": null, "2": null, "4": null, "5": null, "6": null },
      "2": { "2": null, "3": null, "4": null, "5": null },
      "3": { "1": null, "2": null, "3": null, "5": null, "6": null },
      "4": { "1": null, "3": null, "4": null, "5": null, "6": null },
      "5": { "1": null, "2": null, "3": null, "4": null, "6": null },
      "6": { "1": null, "2": null, "4": null, "5": null, "6": null }
    };
  }
  calculate_verts() {
    const c = {
      "1": 0.0,
      "2": 1 / 5.0,
      "3": 2 / 5.0,
      "4": 3 / 5.0,
      "5": 4 / 5.0,
      "6": 1.0
    };
    for (const col in this.verts) {
      for (const row in this.verts[col]) {
        const colNum = Number(col);
        const rowNum = Number(row);
        if (colNum === 1) {
          if (!this.get_neighbor_tile(["left"])) {
            if (rowNum === 6 && !this.get_neighbor_tile(["top"])) {
              continue;
            }
            if (!this.get_neighbor_tile(["bottom"])) {
              if (rowNum === 1 || rowNum === 2) {
                continue;
              }
            }
          }
        }
        const vert = this.add_vert([colNum, rowNum], c[col], c[row]);
        if (colNum === 1) {
          this.set_equivalent_vert(...left_tile([6, rowNum]), vert);
          if (rowNum === 6) {
            this.set_equivalent_vert(...left_top_tile([6, 1]), vert);
          } else if (rowNum === 1) {
            this.set_equivalent_vert(...left_bottom_tile([6, 6]), vert);
          }
        } else if (colNum === 6) {
          this.set_equivalent_vert(...right_tile([1, rowNum]), vert);
          if (rowNum === 6) {
            this.set_equivalent_vert(...right_top_tile([1, 1]), vert);
          } else if (rowNum === 1) {
            this.set_equivalent_vert(...right_bottom_tile([1, 6]), vert);
          }
        }
        if (rowNum === 6) {
          this.set_equivalent_vert(...top_tile([colNum, 1]), vert);
        } else if (rowNum === 1) {
          this.set_equivalent_vert(...bottom_tile([colNum, 6]), vert);
        }
      }
    }
  }
  init_faces() {
    return {
      "1": null, "2": null, "3": null, "4": null, "5": null, "6": null,
      "7": null, "8": null, "9": null, "10": null, "11": null, "12": null
    };
  }
  calculate_faces() {
    let face = this.add_face(1, [
      [1, 6],
      [1, 5],
      [2, 5],
      [3, 5],
      [3, 6],
      top_tile([3, 2]),
      top_tile([2, 2]),
      top_tile([1, 2])
    ]);
    this.set_equivalent_face(...top_tile(11), face);
    this.add_face(2, [
      [3, 6],
      [4, 6],
      [4, 5],
      [3, 5]
    ]);
    this.add_face(3, [
      [4, 6],
      [5, 6],
      [6, 6],
      [6, 5],
      [6, 4],
      [5, 4],
      [4, 4],
      [4, 5]
    ]);
    this.add_face(4, [
      [1, 5],
      [2, 5],
      [2, 4],
      [1, 4]
    ]);
    this.add_face(5, [
      [2, 5],
      [3, 5],
      [4, 5],
      [4, 4],
      [4, 3],
      [3, 3],
      [2, 3],
      [2, 4]
    ]);
    face = this.add_face(6, [
      [1, 4],
      [2, 4],
      [2, 3],
      [2, 2],
      [1, 2],
      left_tile([5, 2]),
      left_tile([5, 3]),
      left_tile([5, 4])
    ]);
    this.set_equivalent_face(...left_tile(8), face);
    this.add_face(7, [
      [4, 4],
      [5, 4],
      [5, 3],
      [4, 3]
    ]);
    face = this.add_face(8, [
      [6, 4],
      [5, 4],
      [5, 3],
      [5, 2],
      [6, 2],
      right_tile([2, 2]),
      right_tile([2, 3]),
      right_tile([2, 4])
    ]);
    this.set_equivalent_face(...right_tile(6), face);
    this.add_face(9, [
      [2, 3],
      [3, 3],
      [3, 2],
      [2, 2]
    ]);
    this.add_face(10, [
      [3, 3],
      [4, 3],
      [5, 3],
      [5, 2],
      [5, 1],
      [4, 1],
      [3, 1],
      [3, 2]
    ]);
    face = this.add_face(11, [
      [1, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [3, 1],
      bottom_tile([3, 5]),
      bottom_tile([2, 5]),
      bottom_tile([1, 5])
    ]);
    this.set_equivalent_face(...bottom_tile(1), face);
    this.add_face(12, [
      [5, 2],
      [6, 2],
      [6, 1],
      [5, 1]
    ]);
  }
  color_pattern1() {
    this.color_face([1], 1);
    this.color_face([3], 1);
    this.color_face([5], 1);
    this.color_face([6], 1);
    this.color_face([8], 1);
    this.color_face([10], 1);
    this.color_face([11], 1);
  }
}
class PythagoreanTessagon extends Tessagon {
  static tile_class = PythagoreanTile;
  static metadata = pythagorean_metadata;
}
