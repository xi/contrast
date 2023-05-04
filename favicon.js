var favicon = document.querySelector('link[rel="shortcut icon"]');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 16;
canvas.height = 16;
canvas.hidden = true;

export var setFavicon = function(bg, fg) {
  ctx.clearRect(0, 0, 16, 16);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 8, 16);

  ctx.fillStyle = fg;
  ctx.fillRect(8, 0, 8, 16);

  favicon.href = canvas.toDataURL();
};
