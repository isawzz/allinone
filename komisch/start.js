
onload=start;

async function start(){await test0();}

async function test0(){
	let d1=mDom(document.body,{className:'content'});
	let d=mDom(d1,{w100:true,h100:true,bg:'#242430'})

	for(const n of range(1,9)){
		let url=`../assets/icons/stars/blue${n}.png`;
		mDom(d, {w:100, h:100},{tag:'img',src:url});
	}

	//cropImage('../assets/icons/stars_blue.jpg',d);
	//loadAndDivideImage('../assets/icons/stars_blue.jpg',d);
	//mDom(document.body,{hmin:300,bg:'violet',sdisplay:'flex',gap:20,justify:'center',align:'center'});
}







