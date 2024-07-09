require('dotenv').config();

const fs = require('fs');
const builder = require('svg-builder');
const colors = require('./../../../../chain/util/colors');
const skins = require('./../../../../chain/util/skins');

exports.execute = async function () {

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen2/prime/graphics.json'));
    let primes = graphics['primes'];

    for (let i = 0; i < primes.length; i++) {
        let prime = primes[i];

        let svg = '';

        if (prime.skin == 0) {
            svg = exports.skin0(prime);
        } else if (prime.skin == 1) {
            svg = exports.skin1(prime);
        } else if (prime.skin == 2) {
            svg = exports.skin2(prime);
        }

        fs.writeFileSync('src/deploy/mainnet/gen2/prime/graphics/svg/' + prime.id + '.svg', svg);

        console.log('updated graphic svg ' + i);
    }

    console.log('updated graphic svgs');
}

exports.skin0 = function (prime) {
    let info = skins.genTwo(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;
    let crosses = info.crosses;

    let arms = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 40 + params[i] * 2;

        let center = crosses[0];
        if (i < 4) {
            center = crosses[0];
        } else if (i < 8) {
            center = crosses[1];
        } else if (i < 12) {
            center = crosses[2];
        } else {
            center = crosses[3];
        }

        let angle = (((i % 4) + 1) * 360 / 4) - 135;
        let slope = angle * Math.PI / 180;

        let nx = Math.cos(slope) * radius + center.x;
        let ny = Math.sin(slope) * radius + center.y;
        let color = colors.findColor(params[i]);

        arms.push({
            x: nx,
            y: ny,
            color: color
        });
    }

    let svg = builder.newInstance();
    svg = svg.height(512);
    svg = svg.width(512);
    svg = svg.viewBox('0 0 512 512');

    svg = exports.svgBackground(svg, shades);
    svg = exports.svgBlocks(svg, blocks);
    svg = exports.svgArcs(svg, arcs);
    svg = exports.svgSlices(svg, slices);

    for (let i = 0; i < arms.length; i++) {
        let arm = arms[i];
        svg = svg.circle({ 'cx': arm.x, 'cy': arm.y, 'r': '16', 'fill': arm.color, 'stroke-width': '4', 'stroke': '#25282c' });
    }

    svg = exports.svgCrosses(svg, crosses, shades);

    return svg.render();
}

exports.skin1 = function (prime) {
    let info = skins.genTwo(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;
    let crosses = info.crosses;

    let pies = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 40 + params[i] * 2;

        let center = crosses[0];
        if (i < 4) {
            center = crosses[0];
        } else if (i < 8) {
            center = crosses[1];
        } else if (i < 12) {
            center = crosses[2];
        } else {
            center = crosses[3];
        }

        let sangle = (((i % 4) + 1) * 360 / 4) - 135;
        let sslope = sangle * Math.PI / 180;
        let sx = Math.cos(sslope) * radius + center.x;
        let sy = Math.sin(sslope) * radius + center.y;

        let eangle = (((i % 4) + 2) * 360 / 4) - 135;
        let eslope = eangle * Math.PI / 180;
        let ex = Math.cos(eslope) * radius + center.x;
        let ey = Math.sin(eslope) * radius + center.y;

        let move = 'M ' + sx + ' ' + sy;
        let arc = 'A ' + radius + ' ' + radius + ' 0 0 1 ' + ex + ' ' + ey;
        let line = 'L ' + center.x + ' ' + center.y;
        let curve = move + ' ' + arc;
        let path = curve + ' ' + line;

        let color = colors.findColor(params[i]);

        pies.push({
            curve: curve,
            path: path,
            color: color
        });
    }

    let svg = builder.newInstance();
    svg = svg.height(512);
    svg = svg.width(512);
    svg = svg.viewBox('0 0 512 512');

    svg = exports.svgBackground(svg, shades);
    svg = exports.svgBlocks(svg, blocks);
    svg = exports.svgArcs(svg, arcs);

    for (let i = 0; i < pies.length; i++) {
        let pie = pies[i];
        svg = svg.path({ 'd': pie.path, 'fill': pie.color });
    }

    for (let i = 0; i < pies.length; i++) {
        let pie = pies[i];
        svg = svg.path({ 'd': pie.curve, 'fill': 'none', 'stroke-width': '4', 'stroke': '#25282c' });
    }

    svg = exports.svgSlices(svg, slices);
    svg = exports.svgCrosses(svg, crosses, shades);

    return svg.render();
}

exports.skin2 = function (prime) {
    let info = skins.genTwo(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;
    let crosses = info.crosses;

    let twirls = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 40 + params[i] * 2;

        let center = crosses[0];
        if (i < 4) {
            center = crosses[0];
        } else if (i < 8) {
            center = crosses[1];
        } else if (i < 12) {
            center = crosses[2];
        } else {
            center = crosses[3];
        }

        let color = colors.findColor(params[i]);

        twirls.push({
            x: center.x,
            y: center.y,
            radius: radius,
            color: color
        });
    }

    twirls = [
        ...twirls.slice(0, 4).sort((first, second) => second.radius - first.radius),
        ...twirls.slice(4, 8).sort((first, second) => second.radius - first.radius),
        ...twirls.slice(8, 12).sort((first, second) => second.radius - first.radius),
        ...twirls.slice(12, 16).sort((first, second) => second.radius - first.radius),
    ];

    let borders = [
        { x: crosses[0].x, y: crosses[0].y, radius: Math.max(...twirls.slice(0, 4).map(t => t.radius)) },
        { x: crosses[1].x, y: crosses[1].y, radius: Math.max(...twirls.slice(4, 8).map(t => t.radius)) },
        { x: crosses[2].x, y: crosses[2].y, radius: Math.max(...twirls.slice(8, 12).map(t => t.radius)) },
        { x: crosses[3].x, y: crosses[3].y, radius: Math.max(...twirls.slice(12, 16).map(t => t.radius)) }
    ];

    let svg = builder.newInstance();
    svg = svg.height(512);
    svg = svg.width(512);
    svg = svg.viewBox('0 0 512 512');

    svg = exports.svgBackground(svg, shades);
    svg = exports.svgBlocks(svg, blocks);
    svg = exports.svgArcs(svg, arcs);
    svg = exports.svgSlices(svg, slices);

    for (let i = 0; i < twirls.length; i++) {
        let twirl = twirls[i];
        svg = svg.circle({ 'r': twirl.radius, 'cx': twirl.x, 'cy': twirl.y, 'fill': twirl.color });
    }

    for (let i = 0; i < borders.length; i++) {
        let border = borders[i];
        svg = svg.circle({ 'r': border.radius, 'cx': border.x, 'cy': border.y, 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });
    }

    svg = exports.svgCrosses(svg, crosses, shades);

    return svg.render();
}

exports.svgBackground = function (svg, shades) {
    svg = svg.rect({ 'x': '0', 'y': '0', 'width': '512', 'height': '512', 'fill': shades[2] });

    return svg;
}

exports.svgBlocks = function (svg, blocks) {
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        svg = svg.path({ 'd': block.curve, 'stroke-width': '50', 'stroke': block.color, 'fill': 'none' });
    }

    return svg;
}

exports.svgArcs = function (svg, arcs) {
    for (let i = 0; i < arcs.length; i++) {
        let arc = arcs[i];
        svg = svg.line({ 'x1': arc.x1, 'y1': arc.y1, 'x2': arc.x2, 'y2': arc.y2, 'stroke-width': '4', 'stroke': '#25282c' });
    }

    svg = svg.rect({ 'x': '2', 'y': '2', 'width': '508', 'height': '508', 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });
    svg = svg.rect({ 'x': '50', 'y': '50', 'width': '412', 'height': '412', 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });

    return svg;
}

exports.svgSlices = function (svg, slices) {
    for (let i = 0; i < slices.length; i++) {
        let slice = slices[i];
        svg = svg.line({ 'x1': slice.x1, 'y1': slice.y1, 'x2': slice.x2, 'y2': slice.y2, 'stroke-width': '4', 'stroke': '#25282c' });
    }

    return svg;
}

exports.svgCrosses = function (svg, crosses, shades) {
    for (let i = 0; i < crosses.length; i++) {
        let cross = crosses[i];
        svg = svg.circle({ 'r': '16', 'cx': cross.x, 'cy': cross.y, 'stroke-width': '4', 'stroke': '#25282c', 'fill': shades[6] });
    }

    return svg;
}