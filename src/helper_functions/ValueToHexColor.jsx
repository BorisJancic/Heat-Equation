const getHexColor = function(value) {
    // Convert value to a hue value between 240 (blue) and 0 (red)
    var hue = (value) * 240;
    // Convert hue to an RGB value
    var rgb = hslToRgb(hue/360, 1, 0.5);
    // Convert RGB to hex
    var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return hex;
}
export default getHexColor
  
  // Helper function to convert HSL to RGB
  function hslToRgb(h, s, l) {
    var r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      var hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  // Helper function to convert RGB to hex
  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }