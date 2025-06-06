
class ValueBlend {
	constructor(options = {}) {
		this._initCorners(options);
	}

	_initCorners(options) {
		if ('corners' in options) {
			this.corners = options.corners;
			if (
				this.corners.length !== 4 ||
				this.corners.some(v => v.length !== 2)
			) {
				throw new Error(
					"corner should be a list of four tuples, " +
					"set either option 'corners' " +
					"or options 'u_range' and 'v_range'"
				);
			}
		} else if ('u_range' in options && 'v_range' in options) {
			this.corners = [
				[options.u_range[0], options.v_range[0]],
				[options.u_range[1], options.v_range[0]],
				[options.u_range[0], options.v_range[1]],
				[options.u_range[1], options.v_range[1]],
			];
		} else {
			throw new Error(
				"Must set either option 'corners' or options 'u_range' and 'v_range'"
			);
		}
	}

	_blendTuples(tuple1, tuple2, ratio) {
		return [
			(1 - ratio) * tuple1[0] + ratio * tuple2[0],
			(1 - ratio) * tuple1[1] + ratio * tuple2[1]
		];
	}

	blend(ratio_u, ratio_v) {
		const uv0 = this._blendTuples(this.corners[0], this.corners[1], ratio_u);
		const uv1 = this._blendTuples(this.corners[2], this.corners[3], ratio_u);
		return this._blendTuples(uv0, uv1, ratio_v);
	}
}
class AbstractTile extends ValueBlend {
	constructor(tessagon, options = {}) {
		super();
		this.tessagon = tessagon;
		this.f = tessagon.f;

		this.u_symmetric = options.u_symmetric || false;
		this.v_symmetric = options.v_symmetric || false;
		this.rot_symmetric = options.rot_symmetry || null;

		this.id = options.id || null;
		this.fingerprint = options.fingerprint || null;

		this.corners = null;
		this._init_corners(options);

		this.neighbors = { top: null, bottom: null, left: null, right: null };
		this.twist = { top: false, bottom: false, left: false, right: false };
	}

	set_neighbors(neighbors = {}) {
		for (const key of ['top', 'bottom', 'left', 'right']) {
			if (neighbors[key]) this.neighbors[key] = neighbors[key];
		}
	}

	get_neighbor_tile(neighbor_keys) {
		let tile = this;
		for (const key of this._neighbor_path(neighbor_keys)) {
			if (!tile.neighbors[key]) return null;
			tile = tile.neighbors[key];
		}
		return tile;
	}

	get left() { return this.get_neighbor_tile(['left']); }
	get right() { return this.get_neighbor_tile(['right']); }
	get top() { return this.get_neighbor_tile(['top']); }
	get bottom() { return this.get_neighbor_tile(['bottom']); }

	inspect(options = {}) {
		if (!this.id) return;
		const prefix = options.tile_number ? `Tile #${options.tile_number}` : 'Tile';
		console.log(`${prefix} (${this.constructor.name}):`);
		console.log(`  - self:      ${this.id}`);
		console.log('  - neighbors:');
		for (const key of ['top', 'left', 'right', 'bottom']) {
			const neighbor = this.neighbors[key];
			if (neighbor && neighbor.id) {
				console.log(`    - ${this._neighbor_str(key)}`);
			}
		}
		console.log(
			`  - corners: (${this.corners[2][0].toFixed(4)}, ${this.corners[2][1].toFixed(4)})  ` +
			`(${this.corners[3][0].toFixed(4)}, ${this.corners[3][1].toFixed(4)})`
		);
		console.log(
			`             (${this.corners[0][0].toFixed(4)}, ${this.corners[0][1].toFixed(4)})  ` +
			`(${this.corners[1][0].toFixed(4)}, ${this.corners[1][1].toFixed(4)})`
		);
		console.log('  - twist:', this.twist);
		if (this.fingerprint) console.log('  - fingerprint:', this.fingerprint);
		console.log('');
	}

	_get_nested_list_value(list, keys) {
		if (!Array.isArray(keys)) return list[keys];
		return keys.reduce((ref, key) => ref[key], list);
	}

	_set_nested_list_value(list, keys, value) {
		if (!Array.isArray(keys)) {
			list[keys] = value;
			return;
		}
		const lastKey = keys.pop();
		const ref = this._get_nested_list_value(list, keys);
		ref[lastKey] = value;
	}

	_neighbor_path(keys) {
		if (keys.length < 2) return keys;
		if (this._should_twist_u(keys) && ['top', 'bottom'].includes(keys[0])) {
			return [keys[1], keys[0]];
		}
		if (this._should_twist_v(keys) && ['left', 'right'].includes(keys[0])) {
			return [keys[1], keys[0]];
		}
		return keys;
	}

	_index_path(keys, neighbor_keys) {
		let path = keys;
		if (this._should_twist_u(neighbor_keys)) path = this._u_flip(path);
		if (this._should_twist_v(neighbor_keys)) path = this._v_flip(path);
		return path;
	}

	_permute_value(keys, vals) {
		if (Array.isArray(keys)) return keys.map(k => this._permute_value(k, vals));
		const i = vals.indexOf(keys);
		return i !== -1 ? vals[(i + 1) % vals.length] : keys;
	}

	_swap_value(keys, a, b) {
		return this._permute_value(keys, [a, b]);
	}

	_u_flip(keys) {
		return this.u_symmetric ? this._swap_value(keys, 'left', 'right') : keys;
	}

	_v_flip(keys) {
		return this.v_symmetric ? this._swap_value(keys, 'top', 'bottom') : keys;
	}

	_rotate_index(keys) {
		if (!this.rot_symmetric) return keys;
		if (this.rot_symmetric === 180) {
			let rotated = this._permute_value(keys, ['rotate0', 'rotate180']);
			rotated = this._permute_value(rotated, ['left', 'right']);
			rotated = this._permute_value(rotated, ['top', 'bottom']);
			return rotated;
		}
		if (this.rot_symmetric === 90) {
			return this._permute_value(keys, ['rotate0', 'rotate90', 'rotate180', 'rotate270']);
		}
		return keys;
	}

	_v_index(keys) {
		if (keys.includes('bottom')) return 'bottom';
		if (keys.includes('top')) return 'top';
		throw new Error(`No v_index in ${keys}`);
	}

	_u_index(keys) {
		if (keys.includes('left')) return 'left';
		if (keys.includes('right')) return 'right';
		throw new Error(`No u_index in ${keys}`);
	}

	_should_twist_u(keys) {
		return ['top', 'bottom'].some(k => this.twist[k] && keys.includes(k));
	}

	_should_twist_v(keys) {
		return ['left', 'right'].some(k => this.twist[k] && keys.includes(k));
	}

	_neighbor_str(key) {
		const neighbor = this.neighbors[key];
		return neighbor ? `${key}: ${neighbor.id}` : `${key}: None`;
	}
}
class Tile extends AbstractTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.meshAdaptor = tessagon.meshAdaptor;
		this.verts = this.initVerts();
		this.faces = this.initFaces();
		this.colorPattern = options.color_pattern || null;

		if (this.faces && this.colorPattern !== null) {
			this.facePaths = this.allFacePaths();
		}
	}

	validate() {
		// Optional override
	}

	addVert(indexKeys, ratioU, ratioV, options = {}) {
		let vert = this._getVert(indexKeys);
		if (!vert) {
			const coords = this.f(...this.blend(ratioU, ratioV));
			vert = this.meshAdaptor.createVert(coords);
			this._setVert(indexKeys, vert);

			if (options.vert_type) {
				if (!this.tessagon.vertTypes[options.vert_type]) {
					this.tessagon.vertTypes[options.vert_type] = [];
				}
				this.tessagon.vertTypes[options.vert_type].push(vert);
			}
		}

		if (vert) {
			(options.equivalent || []).forEach(eq =>
				this.setEquivalentVert(eq[0], eq[1], vert)
			);
		}

		this._createSymmetricVerts(indexKeys, ratioU, ratioV, options);
		this._setEquivalentNeighborVerts(indexKeys, vert, options);

		return vert;
	}

	setEquivalentVert(neighborKeys, indexKeys, vert, options = {}) {
		if (!vert) return null;
		const tile = this.getNeighborTile(neighborKeys);
		if (!tile) return null;
		tile._setVert(this._indexPath(indexKeys, neighborKeys), vert);
	}

	addFace(indexKeys, vertIndexKeysList, options = {}) {
		let face = this._getFace(indexKeys);
		if (!face) {
			const verts = this._getVertsFromList(vertIndexKeysList);
			if (verts) {
				face = this._makeFace(indexKeys, verts, options);
			}
		}

		if (face) {
			(options.equivalent || []).forEach(eq =>
				this.setEquivalentFace(eq[0], eq[1], face)
			);
		}

		this._createSymmetricFaces(indexKeys, vertIndexKeysList, options);
		return face;
	}

	_makeFace(indexKeys, verts, options = {}) {
		const face = this.meshAdaptor.createFace(verts);
		this._setFace(indexKeys, face);

		if (options.face_type) {
			if (!this.tessagon.faceTypes[options.face_type]) {
				this.tessagon.faceTypes[options.face_type] = [];
			}
			this.tessagon.faceTypes[options.face_type].push(face);
		}

		this._setEquivalentNeighborFaces(indexKeys, face, options);
		return face;
	}

	numColorPatterns() {
		return this.tessagon.numColorPatterns();
	}

	calculateColors() {
		if (this.colorPattern >= this.numColorPatterns()) {
			throw new Error(`colorPattern must be below ${this.numColorPatterns()}`);
		}

		const method = this[`colorPattern${this.colorPattern}`];
		if (typeof method !== "function") {
			throw new Error(`colorPattern${this.colorPattern} is not callable`);
		}
		method.call(this);
	}

	colorFace(indexKeys, colorIndex) {
		const face = this._getFace(indexKeys);
		if (face) {
			this.meshAdaptor.colorFace(face, colorIndex);
		}
	}

	setEquivalentFace(neighborKeys, indexKeys, face, options = {}) {
		const tile = this.getNeighborTile(neighborKeys);
		if (tile) {
			tile._setFace(this._indexPath(indexKeys, neighborKeys), face);
		}
	}

	allFacePaths(faces = this.faces, basePath = []) {
		let paths = [];
		for (const key in faces) {
			const newPath = [...basePath, key];
			if (typeof faces[key] === "object" && !Array.isArray(faces[key])) {
				paths.push(...this.allFacePaths(faces[key], newPath));
			} else {
				paths.push(newPath);
			}
		}
		return paths;
	}

	colorPaths(paths, color, colorOther = null) {
		this.facePaths.forEach(path => {
			if (paths.some(p => JSON.stringify(p) === JSON.stringify(path))) {
				this.colorFace(path, color);
			} else if (colorOther !== null) {
				this.colorFace(path, colorOther);
			}
		});
	}

	colorPathsHash(hash, colorOther = null) {
		this.facePaths.forEach(path => {
			let done = false;
			for (const color in hash) {
				if (hash[color].some(p => JSON.stringify(p) === JSON.stringify(path))) {
					this.colorFace(path, color);
					done = true;
					break;
				}
			}
			if (colorOther !== null && !done) {
				this.colorFace(path, colorOther);
			}
		});
	}

	// Protected

	_getVert(indexKeys) {
		return this._getNestedListValue(this.verts, indexKeys);
	}

	_setVert(indexKeys, value) {
		this._setNestedListValue(this.verts, indexKeys, value);
	}

	_getFace(indexKeys) {
		return this._getNestedListValue(this.faces, indexKeys);
	}

	_setFace(indexKeys, value) {
		this._setNestedListValue(this.faces, indexKeys, value);
	}

	_getNeighborVert(neighborKeys, indexKeys) {
		const tile = this.getNeighborTile(neighborKeys);
		return tile ? tile._getVert(this._indexPath(indexKeys, neighborKeys)) : null;
	}

	_createSymmetricVerts(indexKeys, ratioU, ratioV, options = {}) {
		if (!options.symmetry) {
			const extra = { symmetry: true, ...options };

			if (this.rotSymmetric === 180) {
				const rk = this._rotateIndex(indexKeys);
				this.addVert(rk, 1 - ratioU, 1 - ratioV, extra);
			} else if (this.rotSymmetric === 90) {
				let rk = this._rotateIndex(indexKeys);
				this.addVert(rk, 1 - ratioV, ratioU, extra);
				rk = this._rotateIndex(rk);
				this.addVert(rk, 1 - ratioU, 1 - ratioV, extra);
				rk = this._rotateIndex(rk);
				this.addVert(rk, ratioV, 1 - ratioU, extra);
			}

			if (this.uSymmetric) {
				const uk = this._uFlip(indexKeys);
				this.addVert(uk, 1 - ratioU, ratioV, extra);
				if (this.vSymmetric) {
					const uvk = this._vFlip(uk);
					this.addVert(uvk, 1 - ratioU, 1 - ratioV, extra);
				}
			}

			if (this.vSymmetric) {
				const vk = this._vFlip(indexKeys);
				this.addVert(vk, ratioU, 1 - ratioV, extra);
			}
		}
	}

	_setEquivalentNeighborVerts(indexKeys, vert, options = {}) {
		if (options.u_boundary) this._setUEquivalentVert(indexKeys, vert, options);
		if (options.v_boundary) this._setVEquivalentVert(indexKeys, vert, options);
		if (options.corner) {
			this._setUEquivalentVert(indexKeys, vert, options);
			this._setVEquivalentVert(indexKeys, vert, options);
			this._setUVEquivalentVert(indexKeys, vert, options);
		}
	}

	_setUEquivalentVert(indexKeys, vert, options = {}) {
		const uIndex = this._uIndex(indexKeys);
		const flipKeys = this._uFlip(indexKeys);
		this.setEquivalentVert([uIndex], flipKeys, vert, options);
	}

	_setVEquivalentVert(indexKeys, vert, options = {}) {
		const vIndex = this._vIndex(indexKeys);
		const flipKeys = this._vFlip(indexKeys);
		this.setEquivalentVert([vIndex], flipKeys, vert, options);
	}

	_setUVEquivalentVert(indexKeys, vert, options = {}) {
		const uIndex = this._uIndex(indexKeys);
		const vIndex = this._vIndex(indexKeys);
		const flipKeys = this._vFlip(this._uFlip(indexKeys));
		this.setEquivalentVert([uIndex, vIndex], flipKeys, vert, options);
	}

	_getVertsFromList(vertIndexKeysList) {
		const verts = [];

		for (const keys of vertIndexKeysList) {
			let vert;
			if (Array.isArray(keys[0])) {
				vert = this._getNeighborVert(keys[0], keys[1]);
			} else {
				vert = this._getVert(keys);
			}
			if (!vert) return null;
			verts.push(vert);
		}

		return verts;
	}

	_createSymmetricFaces(indexKeys, vertIndexKeysList, options = {}) {
		if (!options.symmetry) {
			const extra = { symmetry: true, ...options };

			const rot = () => {
				const rk = this._rotateIndex(indexKeys);
				const rList = this._rotateIndex(vertIndexKeysList);
				if (options.equivalent) {
					extra.equivalent = options.equivalent.map(this._rotateIndex);
				}
				this.addFace(rk, rList, extra);
			};

			const flipU = () => {
				const uk = this._uFlip(indexKeys);
				const ul = this._uFlip(vertIndexKeysList);
				this.addFace(uk, ul, extra);

				if (this.vSymmetric) {
					const uvk = this._vFlip(uk);
					const uvl = this._vFlip(ul);
					this.addFace(uvk, uvl, extra);
				}
			};

			const flipV = () => {
				const vk = this._vFlip(indexKeys);
				const vl = this._vFlip(vertIndexKeysList);
				this.addFace(vk, vl, extra);
			};

			if (this.rotSymmetric === 180) rot();
			if (this.uSymmetric) flipU();
			if (this.vSymmetric) flipV();
		}
	}
}
class TileGenerator extends ValueBlend {
	// `tessagon` is required, others are options passed as an object
	constructor(tessagon, options = {}) {
		super();
		this.tessagon = tessagon;

		this.corners = null;
		this._initCorners(options); // You must implement _initCorners()

		this.uNum = options.u_num;
		this.vNum = options.v_num;

		if (!this.uNum || !this.vNum) {
			throw new Error("Make sure u_num and v_num intervals are set");
		}

		this.uCyclic = options.u_cyclic !== undefined ? options.u_cyclic : true;
		this.vCyclic = options.v_cyclic !== undefined ? options.v_cyclic : true;
		this.vTwist = options.v_twist || false;
		this.uTwist = options.u_twist || false;

		// These may not be used but are kept for compatibility
		this.uPhase = options.u_phase || 0.0;
		this.vPhase = options.v_phase || 0.0;
		this.uShear = options.u_shear || 0.0;
		this.vShear = options.v_shear || 0.0;

		this.idPrefix = options.id_prefix || this.tessagon.constructor.name;
		this.fingerprintOffset = options.fingerprint_offset || null;
		this.colorPattern = options.color_pattern || null;
	}

	createTile(u, v, corners, extraOptions = {}) {
		const fingerprint = [u, v];
		if (this.fingerprintOffset) {
			fingerprint[0] += this.fingerprintOffset[0];
			fingerprint[1] += this.fingerprintOffset[1];
		}

		const tileOptions = {
			corners,
			fingerprint,
			...extraOptions,
		};

		if (this.idPrefix) {
			tileOptions.id = `${this.idPrefix}[${u}][${v}]`;
		}

		if (this.colorPattern) {
			tileOptions.colorPattern = this.colorPattern;
		}

		const extraParameters = this.tessagon.extraParameters;
		if (extraParameters) {
			Object.assign(tileOptions, extraParameters);
		}

		const TileClass = this.tessagon.constructor.tileClass;
		return new TileClass(this.tessagon, tileOptions);
	}

	createTiles() {
		this.initializeTiles();      // You must implement this
		this.initializeNeighbors();  // You must implement this
		const tiles = this.getTiles(); // You must implement this
		tiles.forEach(tile => tile.validate()); // Each tile must have `validate()`
		return tiles;
	}
}
class AlternatingTile extends Tile {
	validate() {
		const thisTileType = this.tileType;
		for (const name in this.neighbors) {
			const neighbor = this.neighbors[name];
			if (neighbor && (neighbor.tileType + thisTileType !== 1)) {
				throw new Error("Tiles have bad parity (hint: maybe use an even number of tiles)");
			}
		}
	}

	get tileType() {
		return (this.fingerprint[0] + this.fingerprint[1]) % 2;
	}
}
class GridTileGenerator extends TileGenerator {
	constructor(tessagon, kwargs = {}) {
		super(tessagon, kwargs);
		this.tiles = null;
	}

	initializeTiles(kwargs = {}) {
		const tiles = Array.from({ length: this.u_num }, () =>
			new Array(this.v_num).fill(null)
		);

		for (let u = 0; u < this.u_num; u++) {
			const u_ratio0 = u / this.u_num;
			const u_ratio1 = (u + 1) / this.u_num;
			const v_shear0 = u * this.v_shear;
			const v_shear1 = (u + 1) * this.v_shear;

			for (let v = 0; v < this.v_num; v++) {
				const v_ratio0 = v / this.v_num;
				const v_ratio1 = (v + 1) / this.v_num;
				const u_shear0 = v * this.u_shear;
				const u_shear1 = (v + 1) * this.u_shear;

				const corners = [
					this.blend(u_ratio0 + u_shear0 + this.u_phase, v_ratio0 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear0 + this.u_phase, v_ratio0 + v_shear1 + this.v_phase),
					this.blend(u_ratio0 + u_shear1 + this.u_phase, v_ratio1 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear1 + this.u_phase, v_ratio1 + v_shear1 + this.v_phase),
				];

				tiles[u][v] = this.create_tile(u, v, corners, ...Object.values(kwargs));
			}
		}

		this.tiles = tiles;
		return tiles;
	}

	initializeNeighbors() {
		const tiles = this.tiles;
		for (let u = 0; u < this.u_num; u++) {
			const u_prev = (u - 1 + this.u_num) % this.u_num;
			const u_next = (u + 1) % this.u_num;
			for (let v = 0; v < this.v_num; v++) {
				const v_prev = (v - 1 + this.v_num) % this.v_num;
				const v_next = (v + 1) % this.v_num;

				const tile = tiles[u][v];

				let left, right, top, bottom;

				if (!this.u_cyclic && u === 0) {
					left = null;
				} else if (this.v_twist && u === 0) {
					left = tiles[u_prev][this.v_num - v - 1];
					tile.twist.left = true;
				} else {
					left = tiles[u_prev][v];
				}

				if (!this.v_cyclic && v === this.v_num - 1) {
					top = null;
				} else if (this.u_twist && v === this.v_num - 1) {
					top = tiles[this.u_num - u - 1][v_next];
					tile.twist.top = true;
				} else {
					top = tiles[u][v_next];
				}

				if (!this.u_cyclic && u === this.u_num - 1) {
					right = null;
				} else if (this.v_twist && u === this.u_num - 1) {
					right = tiles[u_next][this.v_num - v - 1];
					tile.twist.right = true;
				} else {
					right = tiles[u_next][v];
				}

				if (!this.v_cyclic && v === 0) {
					bottom = null;
				} else if (this.u_twist && v === 0) {
					bottom = tiles[this.u_num - u - 1][v_prev];
					tile.twist.bottom = true;
				} else {
					bottom = tiles[u][v_prev];
				}

				tile.set_neighbors({ left, right, top, bottom });
			}
		}
	}

	getTiles() {
		return this.tiles.flat();
	}
}
class ParallelogramTileGenerator extends TileGenerator {
	// This generates tiles that are rotated and combined
	// with a shear transformation (turning a collection of tiles into a parallelogram).
	// This is done so that the tile patterns can still be cyclic.

	constructor(tessagon, kwargs = {}) {
		super(tessagon, kwargs);

		// parallelogram_vectors is a pair of pairs, e.g, [[9,1], [-1, 3]]
		this.p = kwargs.parallelogram_vectors;

		this.determinant =
			this.p[0][0] * this.p[1][1] - this.p[1][0] * this.p[0][1];

		this.validateParallelogram();

		// Rows
		this.inverse = [
			[
				this.p[1][1] / (this.determinant * this.u_num),
				-this.p[1][0] / (this.determinant * this.u_num),
			],
			[
				-this.p[0][1] / (this.determinant * this.v_num),
				this.p[0][0] / (this.determinant * this.v_num),
			],
		];

		this.color_pattern = kwargs.color_pattern || null;

		this.id_prefix = 'parallelogram_tiles';

		// Mapped via a fingerprint
		this.tiles = {};
	}

	validateParallelogram() {
		let error = null;
		if (this.p[0][0] <= 0) {
			error = "First parallelogram vector can't have negative u";
		} else if (this.p[1][1] <= 0) {
			error = "Second parallelogram vector can't have negative v";
		}
		if (this.determinant === 0) {
			error = 'Parallelogram vectors are colinear';
		} else if (this.determinant < 0) {
			error = 'First parallelogram vector is to the left of second';
		}
		if (error) {
			throw new Error(error);
		}
	}

	initializeTiles() {
		const tiles = {};
		const fingerprintRange = this.fingerprintRange();
		for (const u of fingerprintRange[0]) {
			for (const v of fingerprintRange[1]) {
				const fingerprint = this.normalizeFingerprint(u, v);
				const fingerprintStr = JSON.stringify(fingerprint);
				if (!(fingerprintStr in tiles)) {
					if (this.validFingerprint(...fingerprint)) {
						tiles[fingerprintStr] = this.makeTile(...fingerprint);
					}
				}
			}
		}
		this.tiles = tiles;
		return tiles;
	}

	initializeNeighbors() {
		for (const tile of this.getTiles()) {
			const [u, v] = tile.fingerprint;

			let fingerprint, fingerprintStr;

			fingerprint = this.normalizeFingerprint(u - 1, v);
			fingerprintStr = JSON.stringify(fingerprint);
			const left = this.tiles[fingerprintStr];

			fingerprint = this.normalizeFingerprint(u + 1, v);
			fingerprintStr = JSON.stringify(fingerprint);
			const right = this.tiles[fingerprintStr];

			fingerprint = this.normalizeFingerprint(u, v - 1);
			fingerprintStr = JSON.stringify(fingerprint);
			const bottom = this.tiles[fingerprintStr];

			fingerprint = this.normalizeFingerprint(u, v + 1);
			fingerprintStr = JSON.stringify(fingerprint);
			const top = this.tiles[fingerprintStr];

			tile.setNeighbors({ left, right, top, bottom });
		}
	}

	getTiles() {
		return Object.values(this.tiles);
	}

	makeTile(...fingerprint) {
		const corners = this.makeCorners(...fingerprint);
		return this.createTile(fingerprint[0], fingerprint[1], corners);
	}

	makeCorners(u, v) {
		return [
			this.makeCorner(u, v),
			this.makeCorner(u + 1, v),
			this.makeCorner(u, v + 1),
			this.makeCorner(u + 1, v + 1),
		];
	}

	makeCorner(u, v) {
		const c0 = this.inverse[0][0] * u + this.inverse[0][1] * v;
		const c1 = this.inverse[1][0] * u + this.inverse[1][1] * v;
		return this.blend(c0, c1);
	}

	validFingerprint(u, v) {
		// Valid = all corners of tile with this fingerprint
		//         are in the parallelogram (may be wrapped if cyclic)

		// Assume u, v have been normalized already
		if (!this.pointInParallelogram(u, v)) return false;

		if (!this.pointInParallelogram(...this.normalizeFingerprint(u + 1, v)))
			return false;

		if (!this.pointInParallelogram(...this.normalizeFingerprint(u, v + 1)))
			return false;

		if (!this.pointInParallelogram(...this.normalizeFingerprint(u + 1, v + 1)))
			return false;

		return true;
	}

	parallelogramCoord(u, v) {
		// Convert to be in [0, this.u_num] x [0, this.v_num]
		// (ideally if in the parallelogram)
		const u_coord = (u * this.p[1][1] - v * this.p[1][0]) / this.determinant;
		const v_coord = (v * this.p[0][0] - u * this.p[0][1]) / this.determinant;

		return [u_coord, v_coord];
	}

	pointInParallelogram(u, v) {
		const [pu, pv] = this.parallelogramCoord(u, v);
		return pu >= 0.0 && pu <= this.u_num && pv >= 0.0 && pv <= this.v_num;
	}

	normalizeFingerprint(u, v) {
		while (true) {
			const u_old = u;
			const v_old = v;
			const [pu, pv] = this.parallelogramCoord(u, v);

			if (this.u_cyclic) {
				if (pu >= this.u_num) {
					u -= this.u_num * this.p[0][0];
					v -= this.u_num * this.p[0][1];
				} else if (pu < 0.0) {
					u += this.u_num * this.p[0][0];
					v += this.u_num * this.p[0][1];
				}
			}

			if (this.v_cyclic) {
				if (pv >= this.v_num) {
					u -= this.v_num * this.p[1][0];
					v -= this.v_num * this.p[1][1];
				} else if (pv < 0.0) {
					u += this.v_num * this.p[1][0];
					v += this.v_num * this.p[1][1];
				}
			}

			if (u === u_old && v === v_old) {
				return [u, v];
			}
		}
	}

	fingerprintRange() {
		const uMin = Math.min(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const uMax = Math.max(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const vMin = Math.min(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);
		const vMax = Math.max(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);

		// Create ranges for u and v
		// JavaScript doesn't have a built-in range, so create arrays
		const uRange = [];
		for (let i = uMin; i < uMax; i++) uRange.push(i);

		const vRange = [];
		for (let i = vMin; i < vMax; i++) vRange.push(i);

		return [uRange, vRange];
	}
}
class TessagonMetadata {
	static CLASSIFICATION_MAP = {
		regular: 'Regular tiling',
		archimedean: 'Archimedean tiling',
		laves: 'Laves tiling',
		non_edge: 'Non-edge-to-edge tiling',
		non_convex: 'Non-convex tiling'
	};

	constructor(kwargs = {}) {
		this._name = kwargs.name;
		if (!this._name) {
			throw new Error('No name set');
		}
		this._num_color_patterns = kwargs.num_color_patterns || 0;
		this._classification = kwargs.classification || 'misc';
		this._shapes = kwargs.shapes || [];
		this._sides = kwargs.sides || [];
		this._uv_ratio = kwargs.uv_ratio !== undefined ? kwargs.uv_ratio : null;
		this._extra_parameters = kwargs.extra_parameters || {};
	}

	get name() {
		return this._name;
	}

	get num_color_patterns() {
		return this._num_color_patterns;
	}

	get has_color_patterns() {
		return this._num_color_patterns > 0;
	}

	has_shape(shape) {
		return this._shapes.includes(shape);
	}

	get classification() {
		return this._classification;
	}

	has_classification(classification) {
		return this._classification === classification;
	}

	get human_readable_classification() {
		return TessagonMetadata.CLASSIFICATION_MAP[this._classification];
	}

	get uv_ratio() {
		return this._uv_ratio;
	}

	get extra_parameters() {
		return this._extra_parameters;
	}
}
class Tessagon {
	static tile_class = null;
	static metadata = null;

	constructor(kwargs = {}) {
		console.log('YEAHHH');

		if ('tile_generator' in kwargs) {
			this.tile_generator = new kwargs.tile_generator(this, kwargs);
		} else if ('rot_factor' in kwargs) {
			// Deprecated?
			const rot_factor = kwargs.rot_factor;
			const extra_args = {
				parallelogram_vectors: [[rot_factor, -1], [1, rot_factor]]
			};
			this.tile_generator = new ParallelogramTileGenerator(
				this,
				{ ...kwargs, ...extra_args }
			);
		} else if ('parallelogram_vectors' in kwargs) {
			this.tile_generator = new ParallelogramTileGenerator(this, kwargs);
		} else {
			this.tile_generator = new GridTileGenerator(this, kwargs);
		}

		this._initialize_function(kwargs);

		// Optional post processing function
		this.post_process = kwargs.post_process || null;

		if ('adaptor_class' in kwargs) {
			const adaptor_class = kwargs.adaptor_class;
			// Extract adaptor options only if present in kwargs
			const adaptor_options = {};
			if (adaptor_class.ADAPTOR_OPTIONS) {
				for (const option of adaptor_class.ADAPTOR_OPTIONS) {
					if (option in kwargs) {
						adaptor_options[option] = kwargs[option];
					}
				}
			}
			this.mesh_adaptor = new adaptor_class(adaptor_options);
		} else {
			throw new Error('Must provide a mesh adaptor class');
		}

		this.color_pattern = kwargs.color_pattern || null;

		this.tiles = null;
		this.face_types = {};
		this.vert_types = {};

		this._process_extra_parameters(kwargs);
	}

	create_mesh() {
		this._initialize_tiles();

		this.mesh_adaptor.create_empty_mesh();

		this._calculate_verts();
		this._calculate_faces();

		if (this.color_pattern) {
			this._calculate_colors();
		}

		this.mesh_adaptor.finish_mesh();

		if (this.post_process) {
			// Run user-defined post-processing code, pass this instance
			this.post_process(this);
		}

		return this.mesh_adaptor.get_mesh();
	}

	inspect() {
		console.log(`\n=== ${this.constructor.name} ===\n`);
		for (let i = 0; i < this.tiles.length; i++) {
			this.tiles[i].inspect({ tile_number: i });
		}
	}

	// Class getters similar to Python @classmethods
	static get num_color_patterns() {
		if (this.metadata == null) return 0;
		return this.metadata.num_color_patterns;
	}

	static get num_extra_parameters() {
		if (this.metadata == null) return 0;
		return Object.keys(this.metadata.extra_parameters).length;
	}

	// Protected methods

	_initialize_function(kwargs) {
		this.f = null;

		if ('simple_2d' in kwargs) {
			let u_multiplier_2d = 1.0;
			let v_multiplier_2d = 1.0;
			if (this.constructor.metadata && this.constructor.metadata.uv_ratio) {
				v_multiplier_2d = 1.0 / this.constructor.metadata.uv_ratio;
			}

			const tile_aspect = this.tile_generator.v_num / this.tile_generator.u_num;
			const multiplier_2d = kwargs.multiplier_2d || 1.0;
			u_multiplier_2d *= multiplier_2d;
			v_multiplier_2d *= multiplier_2d * tile_aspect;

			const translate_2d = kwargs.translate_2d || [0, 0];

			this.f = (u, v) => [
				translate_2d[0] + u_multiplier_2d * u,
				translate_2d[1] + v_multiplier_2d * v,
				0.0
			];
		} else if ('function' in kwargs) {
			this.f = kwargs.function;
		} else {
			throw new Error('Must specify a function');
		}
	}

	_initialize_tiles() {
		this.tiles = this.tile_generator.create_tiles();
	}

	_calculate_verts() {
		for (const tile of this.tiles) {
			tile.calculate_verts();
		}
	}

	_calculate_faces() {
		for (const tile of this.tiles) {
			tile.calculate_faces();
		}
	}

	_calculate_colors() {
		this.mesh_adaptor.initialize_colors();
		for (const tile of this.tiles) {
			tile.calculate_colors();
		}
	}

	_process_extra_parameters(kwargs) {
		this.extra_parameters = {};
		const parameters_info = this.constructor.metadata?.extra_parameters;
		if (!parameters_info) return;

		for (const parameter in parameters_info) {
			const parameter_info = parameters_info[parameter];
			if (!(parameter in kwargs)) continue;
			const value = kwargs[parameter];
			if (parameter_info.type === 'float') {
				this._process_float_extra_parameter(parameter, value, parameter_info);
			}
			// Add other types if needed
		}
	}

	_process_float_extra_parameter(parameter, value, parameter_info) {
		const max_value = parameter_info.max;
		const min_value = parameter_info.min;
		if (max_value !== undefined && value > max_value) {
			throw new Error(`Parameter ${parameter} (${value}) exceeds maximum (${max_value})`);
		}
		if (min_value !== undefined && value < min_value) {
			throw new Error(`Parameter ${parameter} (${value}) below minimum (${min_value})`);
		}
		this.extra_parameters[parameter] = value;
	}
}
class BaseAdaptor {
	static ADAPTOR_OPTIONS = [];
}
class ListAdaptor extends BaseAdaptor {
	constructor(kwargs = {}) {
		super();
		this.vert_list = null;
		this.face_list = null;
		this.color_list = null;
	}

	create_empty_mesh() {
		this.vert_list = [];
		this.face_list = [];
		this.color_list = [];
	}

	initialize_colors() {
		this.color_list = new Array(this.face_list.length).fill(0);
	}

	create_vert(coords) {
		this.vert_list.push(coords);
		return this.vert_list.length - 1;
	}

	create_face(verts) {
		this.face_list.push(verts);
		return this.face_list.length - 1;
	}

	color_face(face, color_index) {
		this.color_list[face] = color_index;
	}

	finish_mesh() {
		// no-op
	}

	get_mesh() {
		return {
			vert_list: this.vert_list,
			face_list: this.face_list,
			color_list: this.color_list,
		};
	}
}
class SvgAdaptor extends ListAdaptor {
	static ADAPTOR_OPTIONS = [
		"svg_root_tag",
		"svg_style",
		"svg_fill_color",
		"svg_fill_colors",
		"svg_stroke_color",
		"svg_stroke_width",
	];

	constructor(kwargs = {}) {
		super(kwargs);

		this.svg_root_tag = kwargs.svg_root_tag ?? false;
		this.style = kwargs.svg_style;
		this.svg_fill_colors = kwargs.svg_fill_colors;
		this.svg_fill_color = kwargs.svg_fill_color;
		this.svg_stroke_color = kwargs.svg_stroke_color;
		this.svg_stroke_width = kwargs.svg_stroke_width;
	}

	get_mesh() {
		let buffer = "";
		if (this.svg_root_tag) {
			if (this.svg_root_tag === true) {
				buffer += '<svg xmlns="http://www.w3.org/2000/svg">\n';
			} else {
				buffer += this.svg_root_tag;
			}
		}

		buffer += `<g${this.group_style()}>\n`;

		if (this.style) {
			buffer += `<style>${this.style}</style>`;
		}

		if (this.svg_fill_colors) {
			const color_indices = this.make_color_indices();
			for (let i = 0; i < this.svg_fill_colors.length; i++) {
				if (!(i in color_indices)) continue;
				const fill_color = this.svg_fill_colors[i];
				const faces = color_indices[i].map((j) => this.face_list[j]);
				buffer += this.make_color_group(faces, fill_color);
			}
		} else {
			for (const face of this.face_list) {
				buffer += this.make_face(face);
			}
		}

		buffer += "</g>\n";
		if (this.svg_root_tag) {
			buffer += "</svg>\n";
		}
		return buffer;
	}

	group_style() {
		let style = "";
		if (this.svg_stroke_color) {
			style += `stroke:${this.svg_stroke_color};`;
		}
		if (this.svg_stroke_width) {
			style += `stroke-width:${this.svg_stroke_width};`;
		}
		if (this.svg_fill_color) {
			style += `fill:${this.svg_fill_color};`;
		}
		if (style.length > 0) {
			style = ` style="${style}"`;
		}
		return style;
	}

	make_color_indices() {
		const color_indices = {};
		for (let i = 0; i < this.color_list.length; i++) {
			const color = this.color_list[i];
			if (!(color in color_indices)) {
				color_indices[color] = [];
			}
			color_indices[color].push(i);
		}
		return color_indices;
	}

	make_color_group(faces, fill_color) {
		let buffer = `<g style="fill:${fill_color};">\n`;
		for (const face of faces) {
			buffer += this.make_face(face);
		}
		buffer += "</g>\n";
		return buffer;
	}

	make_face(face) {
		const verts = face.map((v) => this.vert_list[v]);
		const points_string = verts.map((vert) => `${vert[0]},${vert[1]}`).join(" ");
		return `<polygon points="${points_string}" />`;
	}
}

