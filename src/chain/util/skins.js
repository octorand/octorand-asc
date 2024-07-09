exports.genOne = function (prime, colors) {
    let shades = colors.findShades(prime.theme);

    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let params = [];
    for (let j = 0; j < prime.name.length; j++) {
        params.push(alphabet.indexOf(prime.name.charAt(j)));
    }

    let rotate = 0;
    if (prime.skin == 0) {
        rotate = 22.5;
    }

    let blocks = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 230;

        let sangle = ((i + 1) * 360 / prime.name.length) - rotate;
        let sslope = sangle * Math.PI / 180;
        let sx = Math.cos(sslope) * radius + 256;
        let sy = Math.sin(sslope) * radius + 256;

        let eangle = ((i + 2) * 360 / prime.name.length) - rotate;
        let eslope = eangle * Math.PI / 180;
        let ex = Math.cos(eslope) * radius + 256;
        let ey = Math.sin(eslope) * radius + 256;

        let move = 'M ' + sx + ' ' + sy;
        let arc = 'A ' + radius + ' ' + radius + ' 0 0 1 ' + ex + ' ' + ey;
        let curve = move + ' ' + arc;

        let color = colors.findColor(params[i]);

        blocks.push({
            curve: curve,
            color: color
        });
    }

    let arcs = [];
    for (let i = 0; i < prime.name.length; i++) {
        let angle = ((i + 1) * 360 / prime.name.length) - rotate;
        let slope = angle * Math.PI / 180;

        let radius1 = 254;
        let x1 = Math.cos(slope) * radius1 + 256;
        let y1 = Math.sin(slope) * radius1 + 256;

        let radius2 = 208;
        let x2 = Math.cos(slope) * radius2 + 256;
        let y2 = Math.sin(slope) * radius2 + 256;

        arcs.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
        });
    }

    let slices = [];
    for (let i = 0; i < prime.name.length; i++) {
        let angle = (i + 1) * 360 / prime.name.length;
        let slope = angle * Math.PI / 180;
        let radius = 208;

        let x = Math.cos(slope) * radius + 256;
        let y = Math.sin(slope) * radius + 256;

        slices.push({
            x: x,
            y: y
        });
    }

    return {
        shades: shades,
        params: params,
        blocks: blocks,
        arcs: arcs,
        slices: slices,
    }
}

exports.genTwo = function (prime, colors) {
    let shades = colors.findShades(prime.theme);

    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let params = [];
    for (let j = 0; j < prime.name.length; j++) {
        params.push(alphabet.indexOf(prime.name.charAt(j)));
    }

    let full = 115.5;
    let half = 57.75;
    let gap = 25;

    let paths = [
        `M ${half + gap} ${gap} L ${half + gap + full * 1} ${gap}`,
        `M ${half + gap + full * 1} ${gap} L ${half + gap + full * 2} ${gap}`,
        `M ${half + gap + full * 2} ${gap} L ${half + gap + full * 3} ${gap}`,
        `M ${half + gap + full * 3} ${gap} L ${gap + full * 4} ${gap} L ${gap + full * 4} ${half + gap}`,
        `M ${gap + full * 4} ${half + gap} L ${gap + full * 4} ${half + gap + full * 1}`,
        `M ${gap + full * 4} ${half + gap + full * 1} L ${gap + full * 4} ${half + gap + full * 2}`,
        `M ${gap + full * 4} ${half + gap + full * 2} L ${gap + full * 4} ${half + gap + full * 3}`,
        `M ${gap + full * 4} ${half + gap + full * 3} L ${gap + full * 4} ${gap + full * 4} L ${half + gap + full * 3} ${gap + full * 4}`,
        `M ${half + gap + full * 3} ${gap + full * 4} L ${half + gap + full * 2} ${gap + full * 4}`,
        `M ${half + gap + full * 2} ${gap + full * 4} L ${half + gap + full * 1} ${gap + full * 4}`,
        `M ${half + gap + full * 1} ${gap + full * 4} L ${half + gap} ${gap + full * 4}`,
        `M ${half + gap} ${gap + full * 4} L ${gap} ${gap + full * 4} L ${gap} ${half + gap + full * 3}`,
        `M ${gap} ${half + gap + full * 3} L ${gap} ${half + gap + full * 2}`,
        `M ${gap} ${half + gap + full * 2} L ${gap} ${half + gap + full * 1}`,
        `M ${gap} ${half + gap + full * 1} L ${gap} ${half + gap}`,
        `M ${gap} ${half + gap} L ${gap} ${gap} L ${half + gap} ${gap}`,
    ];

    let blocks = [];
    for (let i = 0; i < paths.length; i++) {
        let color = colors.findColor(params[i]);
        blocks.push({
            curve: paths[i],
            color: color
        });
    }

    let arcs = [
        { x1: half + gap, y1: 0, x2: half + gap, y2: gap * 2 },
        { x1: half + gap + full * 1, y1: 0, x2: half + gap + full * 1, y2: gap * 2 },
        { x1: half + gap + full * 2, y1: 0, x2: half + gap + full * 2, y2: gap * 2 },
        { x1: half + gap + full * 3, y1: 0, x2: half + gap + full * 3, y2: gap * 2 },
        { x1: half + gap, y1: full * 4, x2: half + gap, y2: full * 4 + gap * 2 },
        { x1: half + gap + full * 1, y1: full * 4, x2: half + gap + full * 1, y2: full * 4 + gap * 2 },
        { x1: half + gap + full * 2, y1: full * 4, x2: half + gap + full * 2, y2: full * 4 + gap * 2 },
        { x1: half + gap + full * 3, y1: full * 4, x2: half + gap + full * 3, y2: full * 4 + gap * 2 },
        { x1: 0, y1: half + gap, x2: gap * 2, y2: half + gap },
        { x1: 0, y1: half + gap + full * 1, x2: gap * 2, y2: half + gap + full * 1 },
        { x1: 0, y1: half + gap + full * 2, x2: gap * 2, y2: half + gap + full * 2 },
        { x1: 0, y1: half + gap + full * 3, x2: gap * 2, y2: half + gap + full * 3 },
        { x1: full * 4, y1: half + gap, x2: full * 4 + gap * 2, y2: half + gap },
        { x1: full * 4, y1: half + gap + full * 1, x2: full * 4 + gap * 2, y2: half + gap + full * 1 },
        { x1: full * 4, y1: half + gap + full * 2, x2: full * 4 + gap * 2, y2: half + gap + full * 2 },
        { x1: full * 4, y1: half + gap + full * 3, x2: full * 4 + gap * 2, y2: half + gap + full * 3 },
    ];

    let slices = [
        { x1: 50, y1: 50, x2: 462, y2: 462 },
        { x1: 50, y1: 462, x2: 462, y2: 50 },
        { x1: 50, y1: 256, x2: 256, y2: 50 },
        { x1: 256, y1: 462, x2: 462, y2: 256 },
        { x1: 50, y1: 256, x2: 256, y2: 462 },
        { x1: 256, y1: 50, x2: 462, y2: 256 },
    ];

    let crosses = [
        { x: 153, y: 153 },
        { x: 359, y: 153 },
        { x: 359, y: 359 },
        { x: 153, y: 359 },
        { x: 256, y: 256 },
    ];

    return {
        shades: shades,
        params: params,
        blocks: blocks,
        arcs: arcs,
        slices: slices,
        crosses: crosses,
    }
}