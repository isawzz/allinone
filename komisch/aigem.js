
function cropImage(imageUrl,d) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    d.appendChild(canvas);
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let isCropping = false;
    let startX, startY, endX, endY;

    canvas.addEventListener('mousedown', (e) => {
      isCropping = true;
      startX = e.offsetX;
      startY = e.offsetY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (isCropping) {
        endX = e.offsetX;
        endY = e.offsetY;
        drawCropRect();
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (isCropping) {
        isCropping = false;
        cropImage();
      }
    });

    function drawCropRect() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }

    function cropImage() {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = endX - startX;
      croppedCanvas.height = endY - startY;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(img, startX, startY, endX - startX, endY - startY, 0, 0, endX - startX, endY - startY);

      const link = document.createElement('a');
      link.download = 'cropped_image.png';
      link.href = croppedCanvas.toDataURL('image/png');
      link.click();
    }
  };
  img.src = imageUrl;
}


