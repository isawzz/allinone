
function catsInclude(o){
	let list = Array.from(arguments).slice(1); 
	for(const cat of o.cats){
		if (list.some(x=>cat.includes(x))) return true;
	}
	return false;
}
function catsIncludeCaseInsensitive(o){
	let list = Array.from(arguments).slice(1); 
	for(const cat of o.cats){
		if (list.some(x=>cat.toLowerCase().includes(x))) return true;
	}
	return false;
}
async function clearCityGood(){
	let text = await mGetText('../y/citygood.yaml');
	console.log('text', text.length);
	let lines = text.split('\n');
	console.log(lines.length); //return;
	let di = {};
	for (let i = 0; i < lines.length; i += 3) {
		let l = lines[i];//console.log(l);return;

		//if (['diving','public','airport','north','west','south','suburbs','east','railway','prefecture','central','disambig','province','district','_to_','_war_of'].some(x=>l.includes(x)) || l.length > 30) continue;

		if (l.trim().endsWith(':')) {
			//console.log(l);return;
			let k = stringBefore(l, ':'); //console.log(k)
			if (isdef(di[k])) console.log('duplicate', k);
			else {
				let cityline = lines[i + 1];
				let titleline = lines[i + 2];
				let city = stringAfter(cityline, ':').trim()
				let title = stringAfter(titleline, ':').trim()
				di[k] = { city, title };
			}
		}
	}
	//sortDictionary(keys);
	console.log(Object.keys(di).length)
	downloadAsYaml(di,'new_citygood');
}
function firstAfter(s, sSub, start, end) {
	let rest = stringAfter(s, sSub);
	return stringBetween(rest, start, end);
}
function getBanner() {
	mByClass('wpb-name');
}
async function getChatGptCity(title){
	let info=await getInfo(title);
	console.log('info',info)
	if (isCity(info)){
		let prompt=`for the City of ${title}, provide a yaml object with the following properties: country,longitude,latitude,population,language,climate,famous_for.`;
		let result = await mPostRoute('askyaml',{prompt,key:title});
		console.log(result);
	}
}
function getImages(s) {
	let parts = s.split('<img');
	let list = [];
	for (const p of parts) {
		//console.log(p);
		//console.log(list)
		let url = stringAfter(p, 'src="');
		url = stringBefore(url, '"');


		list.push(url);
	}
	return list;
}
async function getInfo(title){
	let di=await mGetYaml(`../wikisaves/bytitle.yaml`);
	return di[title];
}
function getPageList(di,func){
	let list=[];
	for(const k in di){
		let o= di[k];
		o.id=k;
		if (func(o)) list.push(o)
	}
	return list;
}
function getShortInfo(s){
	let parts = s.split('class="mw-body-content"');
	assertion(parts.length == 2,s)
	console.log(parts);
}
async function generateFileNoFile() {
	//generates files with category info for each page of wikivoyage
	console.log('DONE! next: downloads => filenofile10-167!')
	max=168000; return;
	for(let i=117400;i<max;i+=100){
		let [di,nodi]=await sammelPages(i,100);
		downloadAsYaml(di,`file_${i}`);
		downloadAsYaml(nodi,`nofile_${i}`);
		//console.log(di,nodi);
	}
}
function isCity(o){return catsInclude(o,'City','Huge city');}

async function onclickGo() {
	let inp = mBy('inpCity');
	let city = inp.value;
	if (isEmpty(city)) { setRandomCity(); return; }

	if (city.length == 1){
		//await processGenerateCitiesYaml(city.toUpperCase());
		console.log('processGenerateCitiesYaml FINISHED!')
		return;
	}

	await processCityData(city);
}
async function processGenerateCitiesYaml(letter){
	let kcities=Object.keys(M.cities);
	let kpages=Object.values(M.pageTitles);
	console.log('cities',kcities.length,'pages',kpages.length);

	let di={};
	let keys = kcities.filter(x=>x[0].toUpperCase() == letter); 
	//console.log(keys);// return;
	for(const city of keys){
		console.log(city)
		let nc=normalizeString(city);
		for(const k in M.pageTitles){
			if (['file_','category_','talk_','user_'].some(x=>k.startsWith(x))) continue;
			let title=M.pageTitles[k];
			//let nt=normalizeString(title);
			let twords=toWords(title);
			let cwords=toWords(city);
			if (cwords.some(x=>!twords.includes(x))) continue;
			di[k]={city,title};
			console.log('yes');
			//else if (nt.includes(nc)) di[k]={city,title,needkeys:true};
		}
		//break;
	}
	downloadAsYaml(di,`included_${letter}`);
}
async function processCityData(city) {
	let data = await mGetRoute('city', { city });
	if (!data) { setRandomCity(); data = 'Try again!'; }

	//mBy('preResult').innerText = data;

	//let doc = mCreateFrom(data);
	//mAppend('dMain',doc);
	console.log(typeof data);

	getShortInfo(data)

	let o = DA.bdata[city.toLowerCase()] = {};

	let d = mBy('dMain'); mClear(d);

	let s = stringAfter(data, '<h1 class="wpb-name">');
	let title = stringBefore(s, '</h1>'); o.title = title;
	mDom(d, {}, { html: `<h1>${title}</h1>` });

	let weg = stringBefore(s, '<img');
	let html = '<img' + stringBefore(stringAfter(s, '<img'), '</a>');
	mDom(d, {}, { html });
	let rest = stringAfter(s, '</a>');
	o.banner = stringAfter(html, 'src="');
	o.banner = stringBefore(o.banner, '"');

	o.pics = getImages(rest);

	console.log('*** THE END ***')

	console.log(o);


	for (const url of o.pics) {
		if (url.startsWith('//upload')) mDom(d, {}, { tag: 'img', src: url });
	}
	//mBy('preResult').innerText = rest;

}
async function sammelPages(istart,inum){
	let di = {}, nodi={};
	max=168000;
	for (let id = istart; id < Math.min(istart + inum, max); id++) {
		let result = await mGetRoute(`pageInfo/${encodeURIComponent(id)}`);
		assertion(isdef(result),`problem page id ${id}`);
		let kpage = Object.keys(result)[0];
		let o = result[kpage];
		let cats = o.categories;
		if (isList(cats) && cats.some(x => x.title.includes('articles'))) {
				let entry = di[id] = { title:o.title, cats:cats.map(x=>stringAfter(x.title,':')) };
				console.log(`${id}:`,entry);
		}else {
			let ono={title:o.title};addKeys(o,ono);nodi[id]=ono;
		}
	}
	return [di,nodi]; //
	//downloadAsYaml(di,`file_${istart}`);
	//downloadAsYaml(nodi,`nofile_${istart}`);
}
function setRandomCity() { mBy('inpCity').value = rChoose(M.capitals); }

function showPageTitles(list){console.log(list.map(x=>x.title))}


