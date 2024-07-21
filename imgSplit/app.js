const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

function isWhitePixel(ctx,x,y){
	let pix = ctx.getImageData(x, y, 1, 1).data;	
	//console.log('pix',pix, pix[0]);
	return pix[0]+pix[1]+pix[2]>725;
}
function getPixelSum(ctx,x,y){
	let pix = ctx.getImageData(x, y, 1, 1).data;	
	//console.log('pix',pix, pix[0]);
	return pix[0]+pix[1]+pix[2];
}
function getImageBoundariesX(ctx,fromx, maxx){
	let x=fromx;
	let from,to;
	while(x<=maxx && isWhitePixel(ctx,x,20)) x++;
	from=x; //first non-white pixel
	while(x<=maxx && !isWhitePixel(ctx,x,20)) x++;
	to=x; //first white pixel
	return {from,to};
}
function getImageBoundariesY(ctx,fromy, maxy){
	let y=fromy;
	let from,to;
	while(y<=maxy && isWhitePixel(ctx,20,y)) y++;
	from=y;
	while(y<=maxy && !isWhitePixel(ctx,20,y)) y++;
	to=y; //last non
	return {from,to};
}

function getImageBoundariesX(ctx,fromx, maxwhite, minnonwhite, maxx){
	let x=fromx;
	let from,to;
	while(x<=maxx && x<=maxwhite && isWhitePixel(ctx,x,20)) x++;
	from=x; //first non-white pixel
	while(x<=maxx && (x<=minnonwhite || !isWhitePixel(ctx,x,20))) x++;
	to=x; //first white pixel
	return {from,to};
}
function getImageBoundariesY(ctx,fromy,maxwhite,minnonwhite, maxy){
	let y=fromy;
	let from,to;
	while(y<=maxy && y<=maxwhite && isWhitePixel(ctx,20,y)) y++;
	from=y;
	while(y<=maxy && (y<=minnonwhite || !isWhitePixel(ctx,20,y))) y++;
	to=y; //last non
	return {from,to};
}
async function splitImage(inputImagePath, outputDirectory, stem) {
	const image = await loadImage(inputImagePath);
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, image.width, image.height);

	let x=0, maxx=image.width, iPartX=0;
	console.log('maxx',maxx)
	while(x<maxx){
		let bd=getImageBoundariesX(ctx,x,x+10,x+300,maxx);
		// console.log('bdX',bd);	console.log('getPixelSum',getPixelSum(ctx,bd.from,0));
		console.log('from',bd.from,'sum='+getPixelSum(ctx,bd.from,20));	
		console.log('to',bd.to,'sum='+getPixelSum(ctx,bd.to,20));	

		let w=bd.to-bd.from;
		if (w > 5) {
			iPartX++;
			const partCanvas = createCanvas(w, canvas.height);
			const partCtx = partCanvas.getContext('2d');
			partCtx.drawImage(canvas, bd.from, 0, w, canvas.height, 0, 0, w, canvas.height);
			let y=0, maxy=image.height, iPartY=0;
			while(y<maxy){
				let bdY=getImageBoundariesY(partCtx,y,y+10,y+310,maxy);
				console.log('bdY',bdY);
				let h=bdY.to-bdY.from;
				if (h > 5) {
					iPartY++;
					const partCanvasRow = createCanvas(w, h);
					const partCtxRow = partCanvasRow.getContext('2d');
					partCtxRow.drawImage(canvas, bd.from, bdY.from, w, h, 0, 0, w, h);
					const partFileName = `${outputDirectory}/${stem}${iPartX}${iPartY}.png`;
					fs.writeFileSync(partFileName, partCanvasRow.toBuffer());
					console.log(`Part ${iPartX},${iPartY} saved as ${partFileName}`);
				}
				y=bdY.to;
			}
		}
		x=bd.to;
	}
}

async function __splitImage(inputImagePath, outputDirectory, stem) {
	const image = await loadImage(inputImagePath);
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, image.width, image.height);

	let x=0, maxx=image.width, iPartX=0;
	console.log('maxx',maxx)
	while(x<10){
		let xsum=getPixelSum(ctx,x,20,1,1);
		console.log('from',x,'sum='+xsum);	
		x++;
	}
}

// Example usage
const stem='amanda',from=7,to=15,ext='JPG';
//beim 5er gibt es ein problem weil viel weisser hintergrund!
const outputDirectory = __dirname; //'path/to/your/output/directory';
for(let i=from;i<=to;i++){
	console.log('JA mache',i)
	const inputImagePath = `${stem}${i}.${ext}`; //'amanda4.JPG'; //'path/to/your/input/image.png';
	splitImage(inputImagePath, outputDirectory,`${stem}${i}_`);
}

