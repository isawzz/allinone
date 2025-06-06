onload = start;

async function start() { await test10_getPage(); }

async function test10_getPage(){ return;
	let di = await mGetYaml('../wikisaves/chunkindex.yaml');
	let allkeys = Object.keys(di);
	console.log(allkeys.length);
	let max=1000;

	let newdi;let newi=0;
	for(let i=0;i<allkeys.length;i+=max){
		if (i%max == 0){
			if (isdef(newdi)) {
				downloadAsYaml(newdi,`ch_${newi}`);
				newdi={};
				newi++;
			}
		}

		let {ifile,title,id,len}=di[k];
		let f=await mGetText(`../wikisaves/chunkxml/chunk_${ifile}.xml`);
		let pages = f.split('</page>');
		let page;
		for(const p of pages){
			let id1 = getXml(p,'id');
			if (id1 == id) {page=p+'</page>'; break;}
		}
		if (isdef(page)) newdi[id]={ifile:newi,title,id,len,page};

	}


	// let newdi={};let newi=0;,count=0,lastk;
	// let keys=Object.keys(di);


	// for(const k of keys){
	// 	let {ifile,title,id,len}=di[k];
	// 	let f=await mGetText(`../wikisaves/chunkxml/chunk_${ifile}.xml`);
	// 	let pages = f.split('</page>');
	// 	let page;
	// 	for(const p of pages){
	// 		let id1 = getXml(p,'id');
	// 		if (id1 == id) {page=p+'</page>'; break;}
	// 	}
	// 	if (isdef(page)) newdi[id]={ifile:newi,title,id,len,page};
	// 	if (Object.keys(newdi).length>=max) {lastk=k;break;}
	// }
	// doanloadAsYaml(newdi,'newdi');
}
async function test10_xml() {
	let di = {};

	for (let ifile = 551; ifile <= 553; ifile++) {
		// addToXmlIndex(di,i);

		let text = await mGetText(`../wikisaves/chunkxml/chunk_${ifile}.xml`); //console.log(text);
		const pages = text.split(/<\/page>/); console.log('pages', pages.length);

		for (const page of pages) {
			let id = xmlGet(page, 'id');
			let title = xmlGet(page, 'title');
			if (title.includes('Mexico')) { console.log(ifile, title); }
			let list=lookup(di,[title]);
			if (list && list.some(x=>x.id == id)) continue;
			lookupAddToList(di, [title], { ifile, id });

		}

	}

	//downloadAsYaml(di, 'di')
}
async function addToXmlIndex(di, i) {
	console.log('i', i);
	let text = await mGetText(`../wikisaves/chunkxml/chunk_${i}.xml`); //console.log(text);
	const pages = text.split(/<\/page>/); console.log('pages', pages.length);

	for (const page of pages) {
		let title = xmlGet(page, 'title'); console.log(title);
		di[title] = i;

	}

}
async function test10_dest0() {
	let title = 'Destinations';
	//let path='../enwikivoyage-20240220-pages-meta-current.xml';
	let path = '../enmini.xml';
	let xml = await mGetText(path);
	console.log(xml.length)
	let prefix = `<title>${title}</title>`;
	let parts = xml.split(prefix);
	let page = `<page>\n${prefix}\n${stringBefore(parts[1], '</page>')}`;
	console.log(page);
	showPre(clearFlex(), page);
	//let html = await mGetRoute(`cityxml`,{query:normalizeString(title)}); ///${encodeURIComponent(title)}`);
	//console.log(html)
	//let di = await mGetYaml('../wikisaves/pagetitles.yaml'); 
}
async function test10_destinations() {
	let di = await mGetYaml('../wikisaves/pagetitles.yaml');
	let diout = {};
	for (const k in di) {
		if (k.includes('destination')) {
			let title = di[k];
			let result = await mGetRoute(`details/${encodeURIComponent(title)}`);
			let kpage = Object.keys(result)[0];
			let o = result[kpage];
			let cats = o.categories;
			if (nundef(cats)) { console.log(o); diout[title] = o; continue; }
			let entry = { title, cats: cats.map(x => stringAfter(x.title, ':')) };
			diout[title] = entry;
		}
	}
	console.log(diout)
}
async function test10_no() {
	let title = 'Destinations'; //console.log('abort!');return;
	let di = await mGetYaml('../wikisaves/pagetitles.yaml');
	let chat = await getChatGptCity(title);
}
async function test10_WTF() {
	let di = await mGetYaml('../wikisaves/pagetitles.yaml');
	let list = Object.values(di);
	let list2 = arrRemoveDuplicates(list);
	console.log(list.length, list2.length); //return;
	let diold = await mGetYaml('../wikisaves/steps/di.yaml');
	let dioldlist = Object.keys(diold);
	console.log('diold keys', dioldlist.length)
	let dititle = await mGetYaml('../wikisaves/bytitle.yaml');
	let titles = Object.keys(dititle);
	console.log(titles.length);
	return;
	//let list = dict2list(di); console.log(list.length); //return;
	let result = [];
	for (const a of list) {
		let title = a; // a.title; console.log(title)
		let o = dititle[title]; if (isdef(o)) addIf(result, o)
	}
	console.log(result.length, result.map(x => x.title).join(','))
}
async function test10_Articles() {
	let di = await mGetYaml('../wikisaves/bytitle.yaml');
	let list = dict2list(di); console.log(list.length); return;
	let props = ['Star ', 'Guide ', 'Country ']; //,'Usable '];
	props = ['country ']; //,'Usable '];

	//star+guide:586, star+guide+usable:6700, 
	let result = list.filter(x => x.cats.some(y => props.some(z => y.includes(z))));
	console.log(result.length, result.map(x => x.title).join(','))
}
async function test10_Cities() {
	let list = await mGetYaml('../wikisaves/cities.yaml');
	let props = ['Star ', 'Guide ', 'Usable '];
	//star+guide:581, star+guide+usable:6687, 
	let result = list.filter(x => x.cats.some(y => props.some(z => y.includes(z))));
	console.log(result.length, result.map(x => x.title).join(','))
}
async function test10() {
	let title = 'Vienna'; //console.log('abort!');return;
	let chat = await getChatGptCity(title);
}
async function test9_holeXmlPage() {
	let title = 'Vienna'; //console.log('abort!');return;
	let d = clearFlex();
	let norm = normalizeString(title);
	let page = await mGetText(`../wikisaves/pages/${norm}.yaml`);
	//let html = await mGetRoute(`cityweb/${encodeURIComponent(title)}`); 
	mDom(d, {}, { tag: 'pre', html });
	//d.innerHTML = page;
}

async function test9_FindAllLocationCats() {
	let list = await mGetYaml('../wikisaves/all_categories.yaml'); return;
	//let byt = await mGetYaml('../wikisaves/bytitle.yaml');
	let locs = [];
	for (const cat of list) {
		let catci = cat.toLowerCase();
		if (['topics', 'airport', 'previous', 'climate', 'travel', ' with ', 'itineraries', 'voyage', 'unesco', 'regions', 'diving', 'maps ', 'outline', 'listing', 'article', 'pages', 'usable ', 'star ', 'guide ', 'has '].some(x => catci.includes(x))) continue;
		console.log(cat);
		addIf(locs, cat);
	}
	console.log(locs)
	downloadAsYaml(locs, 'locations');
}
async function test9_FindLocationCat() {
	let list = await mGetYaml('../wikisaves/cities.yaml');
	for (const c of list) {
		let cats = c.cats;

	}
}
async function test9_CityUseByNorm() {
	let di = await mGetYaml('../wikisaves/bynorm.yaml');
	let cities = getPageList(di, isCity);
	let citiesCI = getPageList(di, x => catsIncludeCaseInsensitive(x, 'city'));
	let citiesA = getPageList(di, x => catsInclude(x, 'City article', 'Huge city article', 'City listing'));
	console.log(cities.length, citiesCI.length, citiesA.length, arrMinus(citiesCI, citiesA));
	downloadAsYaml(citiesA, 'cities');
}
async function test9_City() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	let cities = getPageList(di, isCity);
	let citiesCI = getPageList(di, x => catsIncludeCaseInsensitive(x, 'city'));
	let citiesA = getPageList(di, x => catsInclude(x, 'City article', 'Huge city article', 'City listing'));
	console.log(cities.length, citiesCI.length, citiesA.length, arrMinus(citiesCI, citiesA));
	downloadAsYaml(citiesA, 'cities');
}
async function test9_collectAllCategories() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	let allcats = [];
	for (const id in di) {
		let o = di[id];
		o.cats.map(x => addIf(allcats, x));
	}
	console.log(allcats);
	downloadAsYaml(allcats, 'allcats');
}
async function test8_duplicateTitles() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	let list = getPageList(di, isCity);
	let titles = {};
	let dupl = [];
	for (const o of list) {
		let title = o.title;
		if (nundef(title)) { console.log(`missing title`, o); return; }
		if (isdef(titles[title])) addIf(dupl, title);
		lookupAddIfToList(titles, [title], o);
	}
	console.log(titles);
	titles = sortDictionary(titles);

	let just1 = {};
	let bytitle = {};
	for (const t in titles) {
		let list = titles[t];
		let norm = normalizeString(t); if (nundef(norm)) return;
		if (list.length == 1) { just1[norm] = list[0]; }//console.log(`${t} unique`);}
		else {
			let o = { title: t };
			o.cats = unionOfArrays(list.map(x => x.cats));
			o.pageids = list.map(x => x.id);
			o.id = arrLast(list).id;
			just1[norm] = o;
			let lencats = o.cats.length;
			let samecats = true;
			for (const el of list) {
				if (el.cats.length != lencats) {
					samecats = false;
					break;
				}
			}
			if (!samecats) {
				console.log('___', t);
				console.log('cats', o.cats);
				list.map(x => console.log(x.id + `(${x.cats.length}): ` + x.cats.join(',')));
			}
		}
	}
	for (const k in just1) {
		let o = just1[k]; assertion(isdef(o.title), k)
		bytitle[o.title] = o;
	}
	//downloadAsYaml(just1,'just1');
	//downloadAsYaml(bytitle,'bytitle');
	console.log(Object.keys(bytitle));
}
async function test8_getAllPages() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	let list = getPageList(di, isCity);
	console.log(list);
	showPageTitles(list);

}
async function test2_cities() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	for (const k in di) {
		let o = di[k];
		let cats = o.cats;
		assertion(isList(cats), 'WTF!!!');

		//was will ich jetzt rausfinden ueber eine city?


	}

}
async function test2_articles() {
	let di = await mGetYaml('../wikisaves/di.yaml');
	console.log(Object.keys(di).length);
	let cities = {}, byTitle = {};
	for (const k in di) {
		let o = di[k];
		let cats = o.cats;
		assertion(isList(cats), `problem! ${k}`);
		if (cats.some(x => x.toLowerCase().includes('city'))) cities[k] = o;
	}
	console.log(Object.values(cities).map(x => x.title));
}
async function test2_zusammen() {
	let dir = '../wikisaves/filenofile80';
	let files = await mGetFiles(dir);
	files.sort();
	let di = {}, nodi = {};
	for (const f of files) {
		let o = await mGetYaml(`${dir}/${f}`);
		if (f.startsWith('file')) addKeys(o, di); else break;//addKeys(o,nodi);
	}
	downloadAsYaml(di, 'di');

}
async function test1_quoteFrom() {
	let d = clearFlex();
	let title = 'Johann Sebastian Bach'; //'Wolfgang Amadeus Mozart';
	let result = await mGetRoute(`quotes/${encodeURIComponent(title)}`);
	console.log('was', result);
	d.innerHTML = result;

	let q = [];
	let lis = Array.from(d.querySelectorAll('li'));
	lis = Array.from(document.querySelectorAll('div>ul>li'));
	console.log(lis);
	for (const li of lis) {
		let text = li.textContent;
		let parts = splitAtAnyOf(text, '\n(')
		q.push(parts[0]);
	}
	console.log(q)


}
async function test1_quote() {
	clearFlex();
	let url = 'http://localhost:3000/testquote';
	const response = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors',
	});

	let res = tryJSONParse(await response.text());
	console.log('was', res);


}
async function test7_pageTitles() {
	//to each page title 
	//console.log(Object.keys(M.pageTitles).length);
	let vals = ['Vienna']; //
	//vals = Object.values(M.pageTitles); //'Vienna';
	let di = {}, nodi = {};
	let istart = 0, inum = 20, keys = Object.keys(M.pageTitles);
	for (let i = istart; i < Math.min(istart + inum, keys.length); i++) {
		let k = keys[i];
		let title = M.pageTitles[k]; //title of arrTake(vals,20)){
		//console.log(title);return;
		if (isNumber(title)) continue;
		//console.log(encodeURIComponent(title));
		let result = await mGetRoute(`details/${encodeURIComponent(title)}`);
		let kpage = Object.keys(result)[0];
		let o = result[kpage];
		let cats = o.categories;
		if (isList(cats) && cats.some(x => x.title.includes('articles'))) {
			di[k] = { title, cats: cats.map(x => stringAfter(x.title, ':')) };
			console.log(`${i}:`, o);
			//return;
		} else nodi[k] = { title, o };
		//console.log(cats); //return;

	}
	downloadAsYaml(di, `file_${istart}`);
	downloadAsYaml(nodi, `nofile_${istart}`);
}
async function test6_consolidateCityInfo() {
	let dir = '../y/cityinfo'
	let files = await mGetFiles(dir);
	console.log(files);
	let di = {};
	let star = [], usable = [], cities = [], goodcities = [];
	let status = [];
	for (const fname of files) {
		let odi = await mGetYaml(dir + '/' + fname);
		for (const k in odi) {
			let c = odi[k];
			di[k] = c;
			addIf(status, c.status);
			if (c.status == 'star') star.push(k)
			if (c.status == 'usable') usable.push(k)
			if (c.isCity) cities.push(k);
			if (c.isCity && c.status != 'unknown') goodcities.push(k)
		}
	}
	star.sort(); usable.sort(); cities.sort(); goodcities.sort();
	let newdi = sortDictionary(di)
	console.log('star', star)
	console.log('usable', usable)
	console.log('cities', cities)
	console.log('goodcities', goodcities);
	downloadAsYaml(newdi, 'di');
	downloadAsYaml({ star, usable, cities, goodcities }, 'lists');
}
async function test5_pagetitles3() {
	//await clearCityGood();
}
async function test5_pagetitles2() {
	//which titles are also cities? how many of them?
	let incities = {};
	for (const c in M.cities) {
		let norm = normalizeString(c);
		let title = diTitles[norm];
		if (nundef(title)) { console.log('NOT in titles', norm); continue; }
		incities[norm] = { cities_entry: c, voyage_entry: diTitles[norm] };
	}
	console.log(Object.keys(incities)); //6601 cities sind da
	//das ist perfekt!
	//von all denen hol ich jetzt die images
	//schauen wir ob die banners alle da sind
	let diPics = {};
	for (const norm in incities) { //}.filter(x=>!x.includes(' '))){
		let city = incities[norm].voyage_entry;
		console.log('city', city)
		let html = await mGetRoute(`cityweb/${encodeURIComponent(city)}`); //'cityweb',{city:c});
		if (!html) continue;
		//console.log(typeof html,html); return;
		diPics[norm] = getImages(html.text);
		//break;
	}
	console.log('diPics', diPics);
	downloadAsYaml(diPics, 'pics.yaml');
}
async function test6_pics() {
	let di = await mGetYaml('../y/pagepics.yaml');
	console.log(di.a_coruna);
	//return;
	let d = clearFlex({ bg: 'red' }); //mDom(d,{},{html:'hello'});
	let dinew = {}; let nogo = {};
	let keys = Object.keys(di); //['a_coruna'];
	keys = keys.filter(x => x.startsWith('a'));
	for (const k of keys) { //arrTake(keys,10)) {

		mDom(d, {}, { tag: 'h1', html: k });
		let list = di[k];
		dinew[k] = [];
		nogo[k] = [];
		let started = false;
		for (const url of list) {
			if (['commons', 'banner', '2560px'].some(x => url.toLowerCase().includes(x))) started = true;
			if (!started) { nogo[k].push(url); continue; }
			if (['gpx_', 'icon', '25px', '1x1', '50px', 'maps', 'load.php', '.svg', 'flag'].some(x => url.toLowerCase().includes(x))) continue;
			try {
				console.log(url)
				mDom(d, {}, { tag: 'img', src: url });
				dinew[k].push(url);
			} catch {
				console.log('NOT', k, url);
				nogo[k].push(url);
			}
		}
		mLinebreak(d);
	}
	console.log(dinew, nogo);
	downloadAsYaml(dinew, 'dinew');
	downloadAsYaml(nogo, 'nogo');
}
async function test5_pagetitles() {
	let diTitles = M.pageTitles = await mGetYaml(`../y/pagetitles.yaml`);
	console.log(Object.values(diTitles)); //167843 titles in wikivoyage

	//which titles are also cities? how many of them?
	let incities = {};
	for (const c in M.cities) {
		let norm = normalizeString(c);
		let title = diTitles[norm];
		if (nundef(title)) { console.log('NOT in titles', norm); continue; }
		incities[norm] = { cities_entry: c, voyage_entry: diTitles[norm] };
	}
	console.log(Object.keys(incities)); //6601 cities sind da
	//das ist perfekt!
	//von all denen hol ich jetzt die images
	//schauen wir ob die banners alle da sind
	let diPics = {};
	for (const norm in incities) { //}.filter(x=>!x.includes(' '))){
		let city = incities[norm].voyage_entry;
		console.log('city', city)
		let html = await mGetRoute(`cityweb/${encodeURIComponent(city)}`); //'cityweb',{city:c});
		if (!html) continue;
		//console.log(typeof html,html); return;
		diPics[norm] = getImages(html.text);
		//break;
	}
	console.log('diPics', diPics);
	downloadAsYaml(diPics, 'pics.yaml');
}
async function test4_big() {
	let dict = M.bigdata = await mGetYaml('../bigdata.yaml');

	let d = clearFlex();

	let city = rChoose(M.capitals); console.log(city)
	let s = dict[city];

	let dOben = mDom(d, {}, { html: 'info' })
	let dpre = mDom(d, {}, { tag: 'pre' });
	//console.log(dict)
	dpre.innerText = s;

	let title = firstAfter(s, 'wpb-banner-image-panorama', 'wpb-name">', '<');
	let d1 = mDom(dOben, {}, { html: title, tag: 'h1' });
	console.log(title);

	let banner = firstAfter(s, 'wpb-banner-image-panorama', 'src="', '"');
	let img = mDom(dOben, {}, { tag: 'img', src: banner });
	console.log(banner);

	let rest = stringAfter(s, banner);
	let pics = getImages(rest).filter(x => { let y = x.toLowerCase(); return !['flag', '.svg'].some(z => y.includes(z)); });
	for (const pic of pics) { img = mDom(dOben, {}, { tag: 'img', src: pic }); }
	console.log(pics);

	//let extract=

}
async function test3() {

	console.log(Object.keys(M.cities)); //return;
	let dict = {};
	for (const city in M.cities) { //arrTake(M.capitals,200)){

		let data;
		try {
			data = await mGetRoute('city', { city });
			if (!data) continue;
			dict[city] = data;
			getShortInfo(data)
		} catch {
			downloadAsYaml(dict, 'dict');
			return;
		}

	}

}
async function test2() {

	let bdata = await mGetYaml('../bigdata.yaml');
	for (const ci in bdata) {
		console.log(ci, bdata[ci].length);
	}
	console.log('number', Object.keys(bdata));
}
async function test1() {

	let dict = {};
	for (const city of arrTake(M.capitals, 200)) {
		let data = await mGetRoute('city', { city });
		if (!data) continue;
		dict[city] = data;
		getShortInfo(data)

	}
	downloadAsYaml(dict, 'dict');

}
async function test0() {

	//console.log(M.cities);
	setRandomCity();

	DA.bdata = {};

}

async function prelims() {
	await loadAssets();
	M.pageTitles = await mGetYaml(`../wikisaves/pagetitles.yaml`);
	getCapitals();
	mBy('bGo').onclick = onclickGo;
	mBy('bNewCity').onclick = setRandomCity;
}
