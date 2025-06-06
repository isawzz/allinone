
function showPre(dParent, text) { return mDom(dParent, {}, { tag: 'pre', html: text }); }

function xmlGet(text,tag){	return stringBetween(text,`<${tag}>`,`</${tag}>`);}






