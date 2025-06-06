
async function askWiki(query) {
	if (isEmpty(query)) return 'NO QUERY!';
	let response = await mGetRoute('wiki', { question: query });
	return response;
}
async function askHuggingFace(question) {
	//gratis: hugging_face
	if (isEmpty(question)) return 'NO QUESTION!';
	let response = await mGetRoute('fetch_answer', { question });
	return lookup(response, ['answer']) ?? 'ERROR';
}
async function askOpenai(prompt) {
	if (nundef(prompt)) prompt = 'list of 100 very different documentary subjects?';
	let answer = await mPostRoute('ask', { prompt });
	return answer;
}
async function askOpenaiKeyword(word, category = null) {
	if (!category) category = 'def';
	let res = await mPostRoute('ask_details', { word, category });
	return res;
	// if (nundef(word)) return; //prompt = 'list of 100 very different documentary subjects?';
	// //let prompt = pYamlDetails(word,category); =>app.js
	// let answer = await mPostRoute('ask', { prompt });
	// if (answer.includes('```')) answer = stringBeforeLast(stringAfter(answer,'\n'),'\n');
	// let o= jsyaml.load(answer);//console.log('o',o,typeof o);
	// return o;
}
async function askOpenaiListOf(word, num = 100) {
	let res = await mPostRoute('ask_list', { word, num });
	return res;
	// if (nundef(word)) return; //prompt = 'list of 100 very different documentary subjects?';
	// //let prompt = pYamlDetails(word,category); =>app.js
	// let answer = await mPostRoute('ask', { prompt });
	// if (answer.includes('```')) answer = stringBeforeLast(stringAfter(answer,'\n'),'\n');
	// let o= jsyaml.load(answer);//console.log('o',o,typeof o);
	// return o;
}
async function mPostYaml(o, path) {
	return await mPostRoute('postYaml', { o, path });
}
function pListOf(what) { return 'list of 100 ' + what.toLowerCase(); }

function pYamlDetails(keyword, type, props) {
	if (nundef(props)) {
		switch (type) {
			case 'animal': props = 'class, color, food, habitat, lifespan, name, offsprings, reproduction, size, species, weight'; break;
			case 'location': props = 'population, size, longitude, latitude'; break;
			default: props = 'definition, synonyms, antonyms, german, spanish, french'; break;
		}
	}
	let p = `information about ${keyword}, formatted as yaml object with the following properties: `;
	p += props + '.';
	p += `property values should if possible contain numeric information in scientific (European) metrics.`
	return p;
}


