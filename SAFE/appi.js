const sharp = require('sharp');
const path = require("path");
const assetsDirectory = path.join(__dirname, '..', 'assets');

async function changeDarkPixelsToTransparent(inputPath, outputPath, lightnessThreshold = 50, blueThreshold = 12) {
  try {
    // Load the image
    const image = sharp(inputPath).ensureAlpha();

    // Extract image data (raw pixel data)
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    // Iterate over pixels and modify those matching the dark tones
    const pixels = Buffer.from(data);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Convert RGB to HSL to check lightness
      const { l } = rgbToHsl(r, g, b);

      // If the lightness is below the threshold, make the pixel transparent
      // if (l <= lightnessThreshold && a > 0 && b>g && b>r) {
      // if (l <= lightnessThreshold && a > 0 && b>g && b>r) {
      if (l <= lightnessThreshold && a > 0 && (b<=g+blueThreshold || b<=r+blueThreshold)) {
          // Set the alpha channel to 0 (transparent)
        pixels[i + 3] = 0;
      }
    }

    // Write the modified image back to disk
    await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
      .toFile(outputPath);

    console.log(`Image saved to ${outputPath}`);
  } catch (err) {
    console.error('Error processing the image:', err);
  }
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  // Return only the lightness, since we only care about that in this case
  return { h, s, l: l * 100 }; // Return lightness as a percentage (0-100)
}

// Example usage: Change all pixels darker than a threshold to transparent

for(let i of [3,7]){
  let fname = path.join(assetsDirectory, 'icons', 'stars', `blue${i}.png`);
  let outname = path.join(assetsDirectory, 'icons', 'stars', `bl${i}.png`);
  changeDarkPixelsToTransparent(fname, outname, 18, 24);
}

