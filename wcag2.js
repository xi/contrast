export const levels = [3, 4.5, 7];

var sRGBtoY = function(srgb) {
  var pre = c => c < 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  var r = pre(srgb[0] / 255);
  var g = pre(srgb[1] / 255);
  var b = pre(srgb[2] / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export var contrast = function(fg, bg) {
  // NOTE: this returns a "signed" value.
  // `c >= 1 ? c : 1 / c` gives you the actual value.
  // See also `getAbsRange()`.

  var yfg = sRGBtoY(fg);
  var ybg = sRGBtoY(bg);
  return (ybg + 0.05) / (yfg + 0.05);
};

export var abs = function(c) {
  return c < 1 ? 1 / c : c;
};

export var getAbsRange = function(range) {
  if (range[0] >= 1) {
    return range;
  } else if (range[1] <= 1) {
    return [1 / range[1], 1 / range[0]];
  } else {
    return [1, Math.max(1 / range[0], range[1])];
  }
};

var alphaBlend = function(fg, bg) {
  return [
    fg[0] * fg[3] + bg[0] * (1 - fg[3]),
    fg[1] * fg[3] + bg[1] * (1 - fg[3]),
    fg[2] * fg[3] + bg[2] * (1 - fg[3]),
  ];
};

export var getContrastRange = function(afg, abg) {
  var bgBlack = alphaBlend(abg, [0, 0, 0]);
  var fgBlack = alphaBlend(afg, bgBlack);
  var cBlack = contrast(fgBlack, bgBlack);

  var bgWhite = alphaBlend(abg, [255, 255, 255]);
  var fgWhite = alphaBlend(afg, bgWhite);
  var cWhite = contrast(fgWhite, bgWhite);

  return [
    Math.min(cBlack, cWhite),
    Math.max(cBlack, cWhite),
  ];
};

