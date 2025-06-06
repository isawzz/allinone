
function test0_ValueBlend() {
	const vb = new ValueBlend({
		u_range: [0, 1],
		v_range: [0, 1]
	});

	console.log(vb.blend(0.5, 0.5));  // → [0.5, 0.5]

}
