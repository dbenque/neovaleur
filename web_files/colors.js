var percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

function getColorForPercentage(pct) {
	if (pct == "0")
		pct = 0.0001;
    for (var i = 0; i < percentColors.length; i++) {
        if (pct <= percentColors[i].pct) {
            var lower = percentColors[i - 1];
            var upper = percentColors[i];
            var range = upper.pct - lower.pct;
            var rangePct = (pct - lower.pct) / range;
            var pctLower = 1 - rangePct;
            var pctUpper = rangePct;
            var color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };
			
			/*var R = color.r.toString(16);
			R = (R < 10 ? "0"+R : R);
			var G = color.g.toString(16);
			G = (G < 10 ? "0"+G : G);
			var B = color.b.toString(16);
			B = (B < 10 ? "0"+B : B);
            return R + G + B;*/
			return color.r + ", " + color.g + ", " + color.b
            // or output as hex if preferred
        }
    }
}  
