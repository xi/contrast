import * as wcag2 from './wcag2.js';
import * as favicon from './favicon.js';

var fgInput = document.querySelector('#fgInput');
var bgInput = document.querySelector('#bgInput');
var swapButton = document.querySelector('#swap');
var output = document.querySelector('#output');

var score = function(range, levels) {
  var biggerThan = function(t) {
    if (range[0] > t) {
      return 1;
    } else if (range[1] > t) {
      return (range[1] - t) / (range[1] - range[0]);
    } else {
      return 0;
    }
  };

  var result = [];
  var sum = 0;
  levels.forEach(level => {
    var v = biggerThan(-level) - biggerThan(level);
    result.push(v - sum);
    sum = v;
  });
  result.push(1 - sum);

  return result;
};

var makeGradient = function(scores) {
  const colors = [
    'hsl(0, 100%, 40%)',
    'hsl(40, 100%, 45%)',
    'hsl(80, 60%, 45%)',
    'hsl(95, 60%, 41%)',
  ];

  var stops = [];
  var prevScore = 0;
  var scale = x => x * 70 + 15;  // compensate for border radius

  for (var i = 0; i < scores.length; i++) {
    if (scores[i] > 0) {
      var newScore = prevScore + scores[i];
      stops.push(`${colors[i]} ${scale(prevScore)}%`, `${colors[i]} ${scale(newScore)}%`);
      prevScore = newScore;
    }
  }

  return `linear-gradient(135deg, ${stops.join(', ')})`;
};

var parseColor = function(s) {
  var rgba = s.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
  if (!rgba) {
    return null;
  }
  rgba.shift();
  if (rgba[3] === undefined) {
    rgba[3] = 1;
  }
  rgba = rgba.map(x => parseFloat(x, 10));
  return rgba;
};

var setColor = function(input, key) {
  var old = getComputedStyle(document.body)[key];
  document.body.style[key] = input.value;
  var value = getComputedStyle(document.body)[key];
  return value !== old;
};

var formatRange = function(range, places) {
  var avg = (range[0] + range[1]) / 2;
  var delta = avg - range[0];
  if (delta.toFixed(places) === (0).toFixed(places)) {
    return `${avg.toFixed(places)}`;
  } else {
    return `${avg.toFixed(places)} ±${delta.toFixed(places)}`;
  }
};

var oninput = function() {
  // NOTE: | to prevent lazy evaluation
  if (setColor(bgInput, 'backgroundColor') | setColor(fgInput, 'color')) {
    var fgUrl = encodeURIComponent(fgInput.value);
    var bgUrl = encodeURIComponent(bgInput.value);
    location.hash = `${fgUrl}-on-${bgUrl}`;

    favicon.setFavicon(bgInput.value, fgInput.value);

    var computed = getComputedStyle(document.body);
    var bg = parseColor(computed.backgroundColor);
    var fg = parseColor(computed.color);

    var wcag2Range = wcag2.contrastAlpha(fg, bg, wcag2.contrast);
    output.style.backgroundImage = makeGradient(score(wcag2Range.map(Math.log), wcag2.levels.map(Math.log)));
    output.textContent = formatRange(wcag2.getAbsRange(wcag2Range), 2);
  }
};

var onhashchange = function() {
  var colors = location.hash.slice(1).split('-on-');
  fgInput.value = decodeURIComponent(colors[0]);
  bgInput.value = decodeURIComponent(colors[1]);
  oninput();
};

var onswap = function() {
  var tmp = bgInput.value;
  bgInput.value = fgInput.value;
  fgInput.value = tmp;
  oninput();
};

fgInput.addEventListener('input', oninput);
bgInput.addEventListener('input', oninput);
swapButton.addEventListener('click', onswap);
window.addEventListener('hashchange', onhashchange);

if (location.hash) {
  onhashchange();
} else {
  oninput();
}
