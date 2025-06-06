
class ValueBlend {
	constructor(options = {}) {
		this._init_corners(options);
	}
	_init_corners(options) {
		// Corners should be a list of tuples (arrays in JavaScript):
		// [bottomleft, bottomright, topleft, topright]
		if ('corners' in options) {
			this.corners = options.corners;
			if (this.corners.length !== 4 || this.corners.some(v => v.length !== 2)) {
				throw new Error("corner should be a list of four tuples, set either option 'corners' or options 'u_range' and 'v_range'");
			}
		} else if ('u_range' in options && 'v_range' in options) {
			this.corners = [
				[options['u_range'][0], options['v_range'][0]],
				[options['u_range'][1], options['v_range'][0]],
				[options['u_range'][0], options['v_range'][1]],
				[options['u_range'][1], options['v_range'][1]]
			];
		} else {
			throw new Error("Must set either option 'corners' or options 'u_range' and 'v_range'");
		}
	}
	_blend_tuples(tuple1, tuple2, ratio) {
		const out = [null, null];
		for (let i = 0; i < 2; i++) {
			out[i] = (1 - ratio) * tuple1[i] + ratio * tuple2[i];
		}
		return out;
	}

	blend(ratio_u, ratio_v) {
		// Interpolate along the U direction for the bottom and top edges.
		const uv0 = this._blend_tuples(this.corners[0], this.corners[1], ratio_u);
		const uv1 = this._blend_tuples(this.corners[2], this.corners[3], ratio_u);
		// Interpolate between the two results along the V direction.
		return this._blend_tuples(uv0, uv1, ratio_v);
	}
}

class AbstractTile extends ValueBlend {
	constructor(tessagon, options = {}) {
		super(options);
		this.tessagon = tessagon;
		this.f = tessagon.f;
		this.u_symmetric = options.hasOwnProperty('u_symmetric') ? options.u_symmetric : false;
		this.v_symmetric = options.hasOwnProperty('v_symmetric') ? options.v_symmetric : false;
		this.rot_symmetric = options.hasOwnProperty('rot_symmetry') ? options.rot_symmetry : null;
		this.id = options.hasOwnProperty('id') ? options.id : null;
		this.fingerprint = options.hasOwnProperty('fingerprint') ? options.fingerprint : null;
		this.corners = null;
		this._init_corners(options);
		this.neighbors = {
			top: null,
			bottom: null,
			left: null,
			right: null
		};
		this.twist = {
			top: false,
			bottom: false,
			left: false,
			right: false
		};
	}
	set_neighbors(options = {}) {
		if (options.hasOwnProperty('top')) {
			this.neighbors.top = options.top;
		}
		if (options.hasOwnProperty('bottom')) {
			this.neighbors.bottom = options.bottom;
		}
		if (options.hasOwnProperty('left')) {
			this.neighbors.left = options.left;
		}
		if (options.hasOwnProperty('right')) {
			this.neighbors.right = options.right;
		}
	}
	get_neighbor_tile(neighbor_keys) {
		let tile = this;
		for (const key of this._neighbor_path(neighbor_keys)) {
			if (!tile.neighbors[key]) {
				return null;
			}
			tile = tile.neighbors[key];
		}
		return tile;
	}
	get left() {
		return this.get_neighbor_tile(["left"]);
	}
	get right() {
		return this.get_neighbor_tile(["right"]);
	}
	get top() {
		return this.get_neighbor_tile(["top"]);
	}
	get bottom() {
		return this.get_neighbor_tile(["bottom"]);
	}
	inspect(options = {}) {
		if (!this.id) return;
		let prefix = 'Tile';
		if (options.hasOwnProperty('tile_number')) {
			prefix += " #" + options.tile_number;
		}
		console.log(`${prefix} (${this.constructor.name}):`);
		console.log(`  - self:      ${this.id}`);
		console.log('  - neighbors:');
		['top', 'left', 'right', 'bottom'].forEach(key => {
			if (this.neighbors[key]) {
				const tile = this.neighbors[key];
				if (tile.id) {
					console.log(`    - ${this._neighbor_str(key)}`);
				}
			}
		});
		console.log(`  - corners: (${this.corners[2][0].toFixed(4)}, ${this.corners[2][1].toFixed(4)})  (${this.corners[3][0].toFixed(4)}, ${this.corners[3][1].toFixed(4)})`);
		console.log(`             (${this.corners[0][0].toFixed(4)}, ${this.corners[0][1].toFixed(4)})  (${this.corners[1][0].toFixed(4)}, ${this.corners[1][1].toFixed(4)})`);
		console.log("  - twist:", this.twist);
		if (this.fingerprint) {
			console.log("  - fingerprint:", this.fingerprint);
		}
		console.log('');
	}
	_get_nested_list_value(nested_list, index_keys) {
		//console.log('.....',nested_list,index_keys);
		if (!Array.isArray(index_keys)) {
			return nested_list[index_keys];
		}
		let value = nested_list;
		//console.log('..value...', value);
		for (const index of index_keys) {
			value = value[index];
		}
		return value;
	}
	_set_nested_list_value(nested_list, index_keys, value) {
		if (!Array.isArray(index_keys)) {
			nested_list[index_keys] = value;
			return;
		}
		let reference = nested_list;
		for (let i = 0; i < index_keys.length - 1; i++) {
			reference = reference[index_keys[i]];
		}
		reference[index_keys[index_keys.length - 1]] = value;
	}
	_neighbor_path(neighbor_keys) {
		if (neighbor_keys.length < 2) {
			return neighbor_keys;
		}
		if (this._should_twist_u(neighbor_keys)) {
			if (['top', 'bottom'].includes(neighbor_keys[0])) {
				return [neighbor_keys[1], neighbor_keys[0]];
			}
		} else if (this._should_twist_v(neighbor_keys)) {
			if (['left', 'right'].includes(neighbor_keys[0])) {
				return [neighbor_keys[1], neighbor_keys[0]];
			}
		}
		return neighbor_keys;
	}
	_index_path(index_keys, neighbor_keys) {
		let path = index_keys;
		if (this._should_twist_u(neighbor_keys)) {
			path = this._u_flip(path);
		}
		if (this._should_twist_v(neighbor_keys)) {
			path = this._v_flip(path);
		}
		return path;
	}
	_permute_value(index_keys, vals) {
		if (Array.isArray(index_keys)) {
			return index_keys.map(u => this._permute_value(u, vals));
		}
		for (let i = 0; i < vals.length; i++) {
			if (index_keys === vals[i]) {
				return vals[(i + 1) % vals.length];
			}
		}
		return index_keys;
	}
	_swap_value(index_keys, val1, val2) {
		return this._permute_value(index_keys, [val1, val2]);
	}
	_u_flip(index_keys) {
		if (!this.u_symmetric) {
			return index_keys;
		}
		return this._swap_value(index_keys, 'left', 'right');
	}
	_v_flip(index_keys) {
		if (!this.v_symmetric) {
			return index_keys;
		}
		return this._swap_value(index_keys, 'bottom', 'top');
	}
	_rotate_index(index_keys) {
		if (!this.rot_symmetric) {
			return index_keys;
		} else if (this.rot_symmetric === 180) {
			let keys = this._permute_value(index_keys, ['rotate0', 'rotate180']);
			keys = this._permute_value(keys, ['left', 'right']);
			keys = this._permute_value(keys, ['top', 'bottom']);
			return keys;
		} else if (this.rot_symmetric === 90) {
			return this._permute_value(index_keys, ['rotate0', 'rotate90', 'rotate180', 'rotate270']);
		}
	}
	_v_index(index_keys) {
		if (index_keys.indexOf('bottom') !== -1) {
			return 'bottom';
		}
		if (index_keys.indexOf('top') !== -1) {
			return 'top';
		}
		throw new Error(`no v_index found in ${index_keys}`);
	}
	_u_index(index_keys) {
		if (index_keys.indexOf('left') !== -1) {
			return 'left';
		}
		if (index_keys.indexOf('right') !== -1) {
			return 'right';
		}
		throw new Error(`no u_index found in ${index_keys}`);
	}
	_should_twist_u(neighbor_keys) {
		for (const twist of ['top', 'bottom']) {
			if (this.twist[twist] && neighbor_keys.indexOf(twist) !== -1) {
				return true;
			}
		}
		return false;
	}
	_should_twist_v(neighbor_keys) {
		for (const twist of ['left', 'right']) {
			if (this.twist[twist] && neighbor_keys.indexOf(twist) !== -1) {
				return true;
			}
		}
		return false;
	}
	_neighbor_str(key) {
		const tile = this.neighbors[key];
		if (tile) {
			return `${(key + ":").padEnd(9, ' ')}${tile.id}`;
		}
		return `${key}: None`;
	}
}

class Tile extends AbstractTile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.mesh_adaptor = tessagon.mesh_adaptor;
		this.verts = this.init_verts();
		this.faces = this.init_faces();
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		if (this.faces && this.color_pattern) {
			this.face_paths = this.all_face_paths();
		}
	}
	validate() {
		// Subclass decides if this should be done
	}
	add_vert(index_keys, ratio_u, ratio_v, options = {}) {
		let vert = this._get_vert(index_keys);
		console.log('!!!!!Tile.add_vert',vert)
		if (vert === null || vert === undefined) {
			const coords = this.f(...this.blend(ratio_u, ratio_v));
			vert = this.mesh_adaptor.create_vert(coords);
			this._set_vert(index_keys, vert);
			if (options.hasOwnProperty('vert_type')) {
				if (!this.tessagon.vert_types.hasOwnProperty(options.vert_type)) {
					this.tessagon.vert_types[options.vert_type] = [];
				}
				this.tessagon.vert_types[options.vert_type].push(vert);
			}
		}
		if (vert !== null && vert !== undefined) {
			const equivalent_verts = options.hasOwnProperty('equivalent') ? options.equivalent : [];
			for (const equivalent_vert of equivalent_verts) {
				this.set_equivalent_vert(...equivalent_vert, vert);
			}
		}
		this._create_symmetric_verts(index_keys, ratio_u, ratio_v, options);
		this._set_equivalent_neighbor_verts(index_keys, vert, options);
		return vert;
	}
	set_equivalent_vert(neighbor_keys, index_keys, vert, options = {}) {
		if (vert === null || vert === undefined) {
			return null;
		}
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		tile._set_vert(this._index_path(index_keys, neighbor_keys), vert);
	}
	add_face(index_keys, vert_index_keys_list, options = {}) {
		let face = this._get_face(index_keys);
		if (face === null || face === undefined) {
			const verts = this._get_verts_from_list(vert_index_keys_list);
			if (verts !== null && verts !== undefined) {
				face = this._make_face(index_keys, verts, options);
			}
		}
		if (face !== null && face !== undefined) {
			const equivalent_faces = options.hasOwnProperty('equivalent') ? options.equivalent : [];
			for (const equivalent_face of equivalent_faces) {
				this.set_equivalent_face(...equivalent_face, face);
			}
		}
		this._create_symmetric_faces(index_keys, vert_index_keys_list, options);
		return face;
	}
	_make_face(index_keys, verts, options = {}) {
		const face = this.mesh_adaptor.create_face(verts);
		this._set_face(index_keys, face);
		if (options.hasOwnProperty('face_type')) {
			if (!this.tessagon.face_types.hasOwnProperty(options.face_type)) {
				this.tessagon.face_types[options.face_type] = [];
			}
			this.tessagon.face_types[options.face_type].push(face);
		}
		this._set_equivalent_neighbor_faces(index_keys, face, options);
		return face;
	}
	num_color_patterns() {
		return this.tessagon.num_color_patterns();
	}
	calculate_colors() {
		if (this.color_pattern > this.num_color_patterns()) {
			throw new Error("color_pattern must be below " + this.num_color_patterns());
		}
		const method_name = "color_pattern" + this.color_pattern;
		const method = this[method_name];
		if (typeof method !== 'function') {
			throw new Error(method_name + " is not a callable color pattern");
		}
		method.call(this);
	}
	color_face(index_keys, color_index) {
		const face = this._get_face(index_keys);
		if (face === null || face === undefined) {
			return;
		}
		this.mesh_adaptor.color_face(face, color_index);
	}
	set_equivalent_face(neighbor_keys, index_keys, face, options = {}) {
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		tile._set_face(this._index_path(index_keys, neighbor_keys), face);
	}
	all_face_paths(faces = null, base_path = null) {
		if (faces === null) {
			faces = this.faces;
		}
		if (base_path === null) {
			base_path = [];
		}
		let paths = [];
		for (const index in faces) {
			const new_base_path = base_path.concat([index]);
			if (typeof faces[index] === 'object' && !Array.isArray(faces[index]) && faces[index] !== null) {
				paths = paths.concat(this.all_face_paths(faces[index], new_base_path));
			} else {
				paths.push(new_base_path);
			}
		}
		return paths;
	}
	color_paths(paths, color, color_other = null) {
		for (const path of this.face_paths) {
			if (paths.some(p => JSON.stringify(p) === JSON.stringify(path))) {
				this.color_face(path, color);
			} else if (color_other) {
				this.color_face(path, color_other);
			}
		}
	}
	color_paths_hash(hash, color_other = null) {
		for (const path of this.face_paths) {
			let done = false;
			for (const color in hash) {
				if (hash[color].some(p => JSON.stringify(p) === JSON.stringify(path))) {
					this.color_face(path, color);
					done = true;
					break;
				}
			}
			if (color_other && !done) {
				this.color_face(path, color_other);
			}
		}
	}
	_get_vert(index_keys) {
		return this._get_nested_list_value(this.verts, index_keys);
	}
	_set_vert(index_keys, value) {
		this._set_nested_list_value(this.verts, index_keys, value);
	}
	_get_face(index_keys) {
		return this._get_nested_list_value(this.faces, index_keys);
	}
	_set_face(index_keys, value) {
		this._set_nested_list_value(this.faces, index_keys, value);
	}
	_get_neighbor_vert(neighbor_keys, index_keys) {
		const tile = this.get_neighbor_tile(neighbor_keys);
		if (tile === null) {
			return null;
		}
		return tile._get_vert(this._index_path(index_keys, neighbor_keys));
	}
	_create_symmetric_verts(index_keys, ratio_u, ratio_v, options = {}) {
		if (!options.hasOwnProperty('symmetry')) {
			const extra_args = { symmetry: true };
			if (this.rot_symmetric === 180) {
				let rot_keys = this._rotate_index(index_keys);
				this.add_vert(rot_keys, 1.0 - ratio_u, 1 - ratio_v, Object.assign({}, options, extra_args));
			} else if (this.rot_symmetric === 90) {
				let rot_keys = this._rotate_index(index_keys);
				this.add_vert(rot_keys, 1.0 - ratio_v, ratio_u, Object.assign({}, options, extra_args));
				rot_keys = this._rotate_index(rot_keys);
				this.add_vert(rot_keys, 1.0 - ratio_u, 1 - ratio_v, Object.assign({}, options, extra_args));
				rot_keys = this._rotate_index(rot_keys);
				this.add_vert(rot_keys, ratio_v, 1 - ratio_u, Object.assign({}, options, extra_args));
			}
			if (this.u_symmetric) {
				let u_flip_keys = this._u_flip(index_keys);
				this.add_vert(u_flip_keys, 1.0 - ratio_u, ratio_v, Object.assign({}, options, extra_args));
				if (this.v_symmetric) {
					let uv_flip_keys = this._v_flip(u_flip_keys);
					this.add_vert(uv_flip_keys, 1.0 - ratio_u, 1.0 - ratio_v, Object.assign({}, options, extra_args));
				}
			}
			if (this.v_symmetric) {
				let v_flip_keys = this._v_flip(index_keys);
				this.add_vert(v_flip_keys, ratio_u, 1.0 - ratio_v, Object.assign({}, options, extra_args));
			}
		}
	}
	_set_equivalent_neighbor_verts(index_keys, vert, options = {}) {
		if (options.hasOwnProperty('u_boundary')) {
			this._set_u_equivalent_vert(index_keys, vert, options);
		}
		if (options.hasOwnProperty('v_boundary')) {
			this._set_v_equivalent_vert(index_keys, vert, options);
		}
		if (options.hasOwnProperty('corner')) {
			this._set_u_equivalent_vert(index_keys, vert, options);
			this._set_v_equivalent_vert(index_keys, vert, options);
			this._set_uv_equivalent_vert(index_keys, vert, options);
		}
	}
	_set_u_equivalent_vert(index_keys, vert, options = {}) {
		const u_index = this._u_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		this.set_equivalent_vert([u_index], u_flip_keys, vert, options);
	}
	_set_v_equivalent_vert(index_keys, vert, options = {}) {
		const v_index = this._v_index(index_keys);
		const v_flip_keys = this._v_flip(index_keys);
		this.set_equivalent_vert([v_index], v_flip_keys, vert, options);
	}
	_set_uv_equivalent_vert(index_keys, vert, options = {}) {
		const u_index = this._u_index(index_keys);
		const v_index = this._v_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		const uv_flip_keys = this._v_flip(u_flip_keys);
		this.set_equivalent_vert([u_index, v_index], uv_flip_keys, vert, options);
	}
	_get_verts_from_list(vert_index_keys_list) {
		const verts = [];
		for (const vert_index_keys of vert_index_keys_list) {
			let vert;
			if (Array.isArray(vert_index_keys) && Array.isArray(vert_index_keys[0])) {
				vert = this._get_neighbor_vert(vert_index_keys[0], vert_index_keys[1]);
			} else {
				vert = this._get_vert(vert_index_keys);
			}
			if (vert === null || vert === undefined) {
				return null;
			}
			verts.push(vert);
		}
		return verts;
	}
	_create_symmetric_faces(index_keys, vert_index_keys_list, options = {}) {
		if (!options.hasOwnProperty('symmetry')) {
			const extra_args = { symmetry: true };
			if (this.rot_symmetric === 180) {
				let rot_keys = this._rotate_index(index_keys);
				let rot_vert_index_keys_list = this._rotate_index(vert_index_keys_list);
				if (options.hasOwnProperty('equivalent')) {
					const equivalent_faces = options.equivalent;
					const new_opts = Object.assign({}, options);
					new_opts.equivalent = equivalent_faces.map(equiv => this._rotate_index(equiv));
					options = new_opts;
				}
				this.add_face(rot_keys, rot_vert_index_keys_list, Object.assign({}, options, extra_args));
			}
			if (this.u_symmetric) {
				let u_flip_keys = this._u_flip(index_keys);
				let u_flip_vert_index_keys_list = this._u_flip(vert_index_keys_list);
				this.add_face(u_flip_keys, u_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
				if (this.v_symmetric) {
					let uv_flip_keys = this._v_flip(u_flip_keys);
					let uv_flip_vert_index_keys_list = this._v_flip(u_flip_vert_index_keys_list);
					this.add_face(uv_flip_keys, uv_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
				}
			}
			if (this.v_symmetric) {
				let v_flip_keys = this._v_flip(index_keys);
				let v_flip_vert_index_keys_list = this._v_flip(vert_index_keys_list);
				this.add_face(v_flip_keys, v_flip_vert_index_keys_list, Object.assign({}, options, extra_args));
			}
		}
	}
	_set_equivalent_neighbor_faces(index_keys, face, options = {}) {
		if (options.hasOwnProperty('u_boundary')) {
			this._set_u_equivalent_face(index_keys, face, options);
		}
		if (options.hasOwnProperty('v_boundary')) {
			this._set_v_equivalent_face(index_keys, face, options);
		}
		if (options.hasOwnProperty('corner')) {
			this._set_u_equivalent_face(index_keys, face, options);
			this._set_v_equivalent_face(index_keys, face, options);
			this._set_uv_equivalent_face(index_keys, face, options);
		}
	}
	_set_u_equivalent_face(index_keys, face, options = {}) {
		const u_index = this._u_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		this.set_equivalent_face([u_index], u_flip_keys, face, options);
	}
	_set_v_equivalent_face(index_keys, face, options = {}) {
		const v_index = this._v_index(index_keys);
		const v_flip_keys = this._v_flip(index_keys);
		this.set_equivalent_face([v_index], v_flip_keys, face, options);
	}
	_set_uv_equivalent_face(index_keys, face, options = {}) {
		const u_index = this._u_index(index_keys);
		const v_index = this._v_index(index_keys);
		const u_flip_keys = this._u_flip(index_keys);
		const uv_flip_keys = this._v_flip(u_flip_keys);
		this.set_equivalent_face([u_index, v_index], uv_flip_keys, face, options);
	}
}

class TileGenerator extends ValueBlend {
	constructor(tessagon, options = {}) {
		super(options);
		this.tessagon = tessagon;
		this.corners = null;
		this._init_corners(options);
		this.u_num = options.u_num;
		this.v_num = options.v_num;
		if (!this.u_num || !this.v_num) {
			throw new Error("Make sure u_num and v_num intervals are set");
		}
		this.u_cyclic = options.hasOwnProperty('u_cyclic') ? options.u_cyclic : true;
		this.v_cyclic = options.hasOwnProperty('v_cyclic') ? options.v_cyclic : true;
		this.v_twist = options.hasOwnProperty('v_twist') ? options.v_twist : false;
		this.u_twist = options.hasOwnProperty('u_twist') ? options.u_twist : false;
		this.u_phase = options.hasOwnProperty('u_phase') ? options.u_phase : 0.0;
		this.v_phase = options.hasOwnProperty('v_phase') ? options.v_phase : 0.0;
		this.u_shear = options.hasOwnProperty('u_shear') ? options.u_shear : 0.0;
		this.v_shear = options.hasOwnProperty('v_shear') ? options.v_shear : 0.0;
		this.id_prefix = tessagon.constructor.name;
		if (options.hasOwnProperty('id_prefix')) {
			this.id_prefix = options.id_prefix;
		}
		this.fingerprint_offset = options.hasOwnProperty('fingerprint_offset') ? options.fingerprint_offset : null;
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
	}
	create_tile(u, v, corners, options = {}) {
		const extra_args = {
			corners: corners,
			fingerprint: [u, v]
		};
		if (this.fingerprint_offset) {
			extra_args.fingerprint[0] += this.fingerprint_offset[0];
			extra_args.fingerprint[1] += this.fingerprint_offset[1];
		}
		if (this.id_prefix) {
			extra_args.id = `${this.id_prefix}[${u}][${v}]`;
		}
		if (this.color_pattern) {
			extra_args.color_pattern = this.color_pattern;
		}
		const extra_parameters = this.tessagon.extra_parameters;
		if (extra_parameters) {
			for (const parameter in extra_parameters) {
				if (extra_parameters.hasOwnProperty(parameter)) {
					extra_args[parameter] = extra_parameters[parameter];
				}
			}
		}
		const tile_class = this.tessagon.constructor.tile_class;
		return new tile_class(this.tessagon, Object.assign({}, options, extra_args));
	}
	create_tiles() {
		this.initialize_tiles();
		this.initialize_neighbors();
		const tiles = this.get_tiles();
		for (const tile of tiles) {
			tile.validate();
		}
		return tiles;
	}
}

class AlternatingTile extends Tile {
	validate() {
		const this_tile_type = this.tile_type;
		for (const name in this.neighbors) {
			const neighbor = this.neighbors[name];
			if (neighbor && (neighbor.tile_type + this_tile_type !== 1)) {
				throw new Error("Tiles have bad parity (hint: maybe use an even number of tiles)");
			}
		}
	}
	get tile_type() {
		return this.fingerprint.reduce((sum, value) => sum + value, 0) % 2;
	}
}

class GridTileGenerator extends TileGenerator {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.tiles = null;
	}
	initialize_tiles(options = {}) {
		let tiles = [];
		for (let u = 0; u < this.u_num; u++) {
			tiles[u] = new Array(this.v_num).fill(null);
		}
		for (let u = 0; u < this.u_num; u++) {
			let u_ratio0 = u / this.u_num;
			let u_ratio1 = (u + 1) / this.u_num;
			let v_shear0 = u * this.v_shear;
			let v_shear1 = (u + 1) * this.v_shear;
			for (let v = 0; v < this.v_num; v++) {
				let v_ratio0 = v / this.v_num;
				let v_ratio1 = (v + 1) / this.v_num;
				let u_shear0 = v * this.u_shear;
				let u_shear1 = (v + 1) * this.u_shear;
				let corners = [
					this.blend(u_ratio0 + u_shear0 + this.u_phase, v_ratio0 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear0 + this.u_phase, v_ratio0 + v_shear1 + this.v_phase),
					this.blend(u_ratio0 + u_shear1 + this.u_phase, v_ratio1 + v_shear0 + this.v_phase),
					this.blend(u_ratio1 + u_shear1 + this.u_phase, v_ratio1 + v_shear1 + this.v_phase)
				];
				tiles[u][v] = this.create_tile(u, v, corners, options);
			}
		}
		this.tiles = tiles;
		return tiles;
	}
	initialize_neighbors(options = {}) {
		let tiles = this.tiles;
		for (let u = 0; u < this.u_num; u++) {
			let u_prev = (u - 1 + this.u_num) % this.u_num;
			let u_next = (u + 1) % this.u_num;
			for (let v = 0; v < this.v_num; v++) {
				let v_prev = (v - 1 + this.v_num) % this.v_num;
				let v_next = (v + 1) % this.v_num;
				let tile = tiles[u][v];
				let left, top, right, bottom;
				if (!this.u_cyclic && u === 0) {
					left = null;
				} else if (this.v_twist && u === 0) {
					left = tiles[u_prev][this.v_num - v - 1];
					tile.twist['left'] = true;
				} else {
					left = tiles[u_prev][v];
				}
				if (!this.v_cyclic && v === this.v_num - 1) {
					top = null;
				} else if (this.u_twist && v === this.v_num - 1) {
					top = tiles[this.u_num - u - 1][v_next];
					tile.twist['top'] = true;
				} else {
					top = tiles[u][v_next];
				}
				if (!this.u_cyclic && u === this.u_num - 1) {
					right = null;
				} else if (this.v_twist && u === this.u_num - 1) {
					right = tiles[u_next][this.v_num - v - 1];
					tile.twist['right'] = true;
				} else {
					right = tiles[u_next][v];
				}
				if (!this.v_cyclic && v === 0) {
					bottom = null;
				} else if (this.u_twist && v === 0) {
					bottom = tiles[this.u_num - u - 1][v_prev];
					tile.twist['bottom'] = true;
				} else {
					bottom = tiles[u][v_prev];
				}
				tile.set_neighbors({ left: left, right: right, top: top, bottom: bottom });
			}
		}
	}
	get_tiles() {
		return this.tiles.flat();
	}
}

class ParallelogramTileGenerator extends TileGenerator {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		this.p = options.parallelogram_vectors;
		this.determinant = this.p[0][0] * this.p[1][1] - this.p[1][0] * this.p[0][1];
		this.validate_parallelogram();
		this.inverse = [
			[this.p[1][1] / (this.determinant * this.u_num), -this.p[1][0] / (this.determinant * this.u_num)],
			[-this.p[0][1] / (this.determinant * this.v_num), this.p[0][0] / (this.determinant * this.v_num)]
		];
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		this.id_prefix = 'parallelogram_tiles';
		this.tiles = {};
	}
	validate_parallelogram() {
		let error = null;
		if (this.p[0][0] <= 0) {
			error = "First parallelogram vector can't have negative u";
		} else if (this.p[1][1] <= 0) {
			error = "Second parallelogram vector can't have negative v";
		}
		if (this.determinant === 0) {
			error = "Parallelogram vector are colinear";
		} else if (this.determinant < 0) {
			error = "First parallelogram vector is to the left of second";
		}
		if (error) {
			throw new Error(error);
		}
	}
	initialize_tiles() {
		let tiles = {};
		const fingerprintRange = this.fingerprint_range();
		for (let u = fingerprintRange.u_range[0]; u < fingerprintRange.u_range[1]; u++) {
			for (let v = fingerprintRange.v_range[0]; v < fingerprintRange.v_range[1]; v++) {
				const fingerprint = this.normalize_fingerprint(u, v);
				const fingerprint_str = fingerprint.toString();
				if (!tiles.hasOwnProperty(fingerprint_str)) {
					if (this.valid_fingerprint(...fingerprint)) {
						tiles[fingerprint_str] = this.make_tile(...fingerprint);
					}
				}
			}
		}
		this.tiles = tiles;
		return tiles;
	}
	initialize_neighbors() {
		for (const tile of this.get_tiles()) {
			const u = tile.fingerprint[0];
			const v = tile.fingerprint[1];
			let fingerprint = this.normalize_fingerprint(u - 1, v);
			let left = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u + 1, v);
			let right = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u, v - 1);
			let bottom = this.tiles[fingerprint.toString()] || null;
			fingerprint = this.normalize_fingerprint(u, v + 1);
			let top = this.tiles[fingerprint.toString()] || null;
			tile.set_neighbors({ left: left, right: right, top: top, bottom: bottom });
		}
	}
	get_tiles() {
		return Object.values(this.tiles);
	}
	make_tile(...fingerprint) {
		const corners = this.make_corners(...fingerprint);
		return this.create_tile(fingerprint[0], fingerprint[1], corners);
	}
	make_corners(...fingerprint) {
		const u = fingerprint[0];
		const v = fingerprint[1];
		return [
			this.make_corner(u, v),
			this.make_corner(u + 1, v),
			this.make_corner(u, v + 1),
			this.make_corner(u + 1, v + 1)
		];
	}
	make_corner(u, v) {
		const c0 = this.inverse[0][0] * u + this.inverse[0][1] * v;
		const c1 = this.inverse[1][0] * u + this.inverse[1][1] * v;
		return this.blend(c0, c1);
	}
	valid_fingerprint(u, v) {
		if (!this.point_in_parallelogram(u, v)) return false;
		let fingerprint = this.normalize_fingerprint(u + 1, v);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		fingerprint = this.normalize_fingerprint(u, v + 1);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		fingerprint = this.normalize_fingerprint(u + 1, v + 1);
		if (!this.point_in_parallelogram(...fingerprint)) return false;
		return true;
	}
	parallelogram_coord(u, v) {
		const u_coord = (u * this.p[1][1] - v * this.p[1][0]) / this.determinant;
		const v_coord = (v * this.p[0][0] - u * this.p[0][1]) / this.determinant;
		return [u_coord, v_coord];
	}
	point_in_parallelogram(u, v) {
		const parallelogram_uv = this.parallelogram_coord(u, v);
		if (0.0 <= parallelogram_uv[0] && parallelogram_uv[0] <= this.u_num) {
			if (0.0 <= parallelogram_uv[1] && parallelogram_uv[1] <= this.v_num) {
				return true;
			}
		}
		return false;
	}
	normalize_fingerprint(u, v) {
		while (true) {
			const u_old = u;
			const v_old = v;
			const parallelogram_uv = this.parallelogram_coord(u, v);
			if (this.u_cyclic) {
				if (parallelogram_uv[0] >= this.u_num) {
					u -= (this.u_num * this.p[0][0]);
					v -= (this.u_num * this.p[0][1]);
				} else if (parallelogram_uv[0] < 0.0) {
					u += (this.u_num * this.p[0][0]);
					v += (this.u_num * this.p[0][1]);
				}
			}
			if (this.v_cyclic) {
				if (parallelogram_uv[1] >= this.v_num) {
					u -= (this.v_num * this.p[1][0]);
					v -= (this.v_num * this.p[1][1]);
				} else if (parallelogram_uv[1] < 0.0) {
					u += (this.v_num * this.p[1][0]);
					v += (this.v_num * this.p[1][1]);
				}
			}
			if (u === u_old && v === v_old) {
				return [u, v];
			}
		}
	}
	fingerprint_range() {
		const u_min = Math.min(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const u_max = Math.max(
			0,
			this.u_num * this.p[0][0],
			this.v_num * this.p[1][0],
			this.u_num * this.p[0][0] + this.v_num * this.p[1][0]
		);
		const v_min = Math.min(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);
		const v_max = Math.max(
			0,
			this.u_num * this.p[0][1],
			this.v_num * this.p[1][1],
			this.u_num * this.p[0][1] + this.v_num * this.p[1][1]
		);
		return {
			u_range: [u_min, u_max],
			v_range: [v_min, v_max]
		};
	}
}

class TessagonMetadata {
	static CLASSIFICATION_MAP = {
		'regular': 'Regular tiling',
		'archimedean': 'Archimedean tiling',
		'laves': 'Laves tiling',
		'non_edge': 'Non-edge-to-edge tiling',
		'non_convex': 'Non-convex tiling'
	};
	constructor(options = {}) {
		this._name = options.name;
		if (!this._name) {
			throw new Error('No name set');
		}
		this._num_color_patterns = options.num_color_patterns !== undefined ? options.num_color_patterns : 0;
		this._classification = options.classification || 'misc';
		this._shapes = options.shapes || [];
		this._sides = options.sides || [];
		this._uv_ratio = options.hasOwnProperty('uv_ratio') ? options.uv_ratio : null;
		this._extra_parameters = options.extra_parameters || {};
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
	constructor(options = {}) {
		if (options.hasOwnProperty('tile_generator')) {
			this.tile_generator = new options.tile_generator(this, options);
		} else if (options.hasOwnProperty('rot_factor')) {
			const rot_factor = options.rot_factor;
			const extra_args = {
				parallelogram_vectors: [[rot_factor, -1], [1, rot_factor]]
			};
			this.tile_generator = new ParallelogramTileGenerator(this, Object.assign({}, options, extra_args));
		} else if (options.hasOwnProperty('parallelogram_vectors')) {
			this.tile_generator = new ParallelogramTileGenerator(this, options);
		} else {
			this.tile_generator = new GridTileGenerator(this, options);
		}
		this._initialize_function(options);
		this.post_process = options.hasOwnProperty('post_process') ? options.post_process : null;
		if (options.hasOwnProperty('adaptor_class')) {
			const adaptor_class = options.adaptor_class;
			const adaptor_options = {};
			for (const option of adaptor_class.ADAPTOR_OPTIONS) {
				if (options.hasOwnProperty(option)) {
					adaptor_options[option] = options[option];
				}
			}
			this.mesh_adaptor = new adaptor_class(adaptor_options);
		} else {
			throw new Error('Must provide a mesh adaptor class');
		}
		this.color_pattern = options.hasOwnProperty('color_pattern') ? options.color_pattern : null;
		this.tiles = null;
		this.face_types = {};
		this.vert_types = {};
		this._process_extra_parameters(options);
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
	static num_color_patterns() {
		if (this.metadata === null) {
			return 0;
		}
		return this.metadata.num_color_patterns;
	}
	static num_extra_parameters() {
		if (this.metadata === null) {
			return 0;
		}
		return Object.keys(this.metadata.extra_parameters).length;
	}
	// Protected methods
	_initialize_function(options = {}) {
		this.f = null;
		if (options.hasOwnProperty('simple_2d')) {
			let u_multiplier_2d = 1.0;
			let v_multiplier_2d = 1.0;
			if (Tessagon.metadata && Tessagon.metadata.uv_ratio) {
				v_multiplier_2d = 1.0 / Tessagon.metadata.uv_ratio;
			}
			const tile_aspect = this.tile_generator.v_num / this.tile_generator.u_num;
			const multiplier_2d = options.hasOwnProperty('multiplier_2d') ? options.multiplier_2d : 1.0;
			u_multiplier_2d *= multiplier_2d;
			v_multiplier_2d *= multiplier_2d * tile_aspect;
			const translate_2d = options.hasOwnProperty('translate_2d') ? options.translate_2d : [0, 0];
			this.f = (u, v) => {
				return (
					translate_2d[0] + u_multiplier_2d * u,
					translate_2d[1] + v_multiplier_2d * v,
					0.0
				);
			};
			// Alternatively, to return as an array:
			this.f = (u, v) => [
				translate_2d[0] + u_multiplier_2d * u,
				translate_2d[1] + v_multiplier_2d * v,
				0.0
			];
		} else if (options.hasOwnProperty('function')) {
			this.f = options.function;
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
	_process_extra_parameters(options = {}) {
		this.extra_parameters = {};
		const parameters_info = Tessagon.metadata ? Tessagon.metadata.extra_parameters : null;
		if (!parameters_info) {
			return;
		}
		for (const parameter in parameters_info) {
			if (!options.hasOwnProperty(parameter)) {
				continue;
			}
			const value = options[parameter];
			if (parameters_info[parameter]['type'] === 'float') {
				this._process_float_extra_parameter(parameter, value, parameters_info[parameter]);
			}
		}
	}
	_process_float_extra_parameter(parameter, value, parameter_info) {
		const max_value = parameter_info.hasOwnProperty('max') ? parameter_info.max : null;
		const min_value = parameter_info.hasOwnProperty('min') ? parameter_info.min : null;
		if (max_value !== null && value > max_value) {
			throw new Error(`Parameter ${parameter} (${value}) exceeds maximum (${max_value})`);
		}
		if (min_value !== null && value < min_value) {
			throw new Error(`Parameter ${parameter} (${value}) below minimum (${min_value})`);
		}
		this.extra_parameters[parameter] = value;
	}
}

class BaseAdaptor {
	static ADAPTOR_OPTIONS = [];
}

class ListAdaptor extends BaseAdaptor {
	constructor(options = {}) {
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
		// No operation
	}
	get_mesh() {
		return {
			vert_list: this.vert_list,
			face_list: this.face_list,
			color_list: this.color_list
		};
	}
}

class SvgAdaptor extends ListAdaptor {
	static ADAPTOR_OPTIONS = ['svg_root_tag', 'svg_style', 'svg_fill_color', 'svg_fill_colors', 'svg_stroke_color', 'svg_stroke_width'];
	constructor(options = {}) {
		super(options);
		this.svg_root_tag = options.hasOwnProperty('svg_root_tag') ? options.svg_root_tag : false;
		this.style = options.svg_style;
		this.svg_fill_colors = options.svg_fill_colors;
		this.svg_fill_color = options.svg_fill_color;
		this.svg_stroke_color = options.svg_stroke_color;
		this.svg_stroke_width = options.svg_stroke_width;
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
				if (!(i in color_indices)) {
					continue;
				}
				const fill_color = this.svg_fill_colors[i];
				const faces = color_indices[i].map(j => this.face_list[j]);
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
		buffer += '</g>\n';
		return buffer;
	}
	make_face(face) {
		const verts = face.map(v => this.vert_list[v]);
		const points_string = verts.map(vert => `${vert[0]},${vert[1]}`).join(" ");
		return `<polygon points="${points_string}" />`;
	}
}

function right_tile(index_keys) {
	return [['right'], index_keys];
}
function left_tile(index_keys) {
	return [['left'], index_keys];
}
function top_tile(index_keys) {
	return [['top'], index_keys];
}
function bottom_tile(index_keys) {
	return [['bottom'], index_keys];
}
function left_top_tile(index_keys) {
	return [['left', 'top'], index_keys];
}
function left_bottom_tile(index_keys) {
	return [['left', 'bottom'], index_keys];
}
function right_top_tile(index_keys) {
	return [['right', 'top'], index_keys];
}
function right_bottom_tile(index_keys) {
	return [['right', 'bottom'], index_keys];
}
function bottom_left_tile(index_keys) {
	return [['bottom', 'left'], index_keys];
}
function bottom_right_tile(index_keys) {
	return [['bottom', 'right'], index_keys];
}
function top_left_tile(index_keys) {
	return [['top', 'left'], index_keys];
}
function top_right_tile(index_keys) {
	return [['top', 'right'], index_keys];
}
















