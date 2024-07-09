require('dotenv').config();

const fs = require('fs');
const builder = require('svg-builder');
const colors = require('./../../../../chain/util/colors');
const skins = require('./../../../../chain/util/skins');

exports.execute = async function () {

    let graphics = JSON.parse(fs.readFileSync('src/deploy/mainnet/gen1/prime/graphics.json'));
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

        fs.writeFileSync('src/deploy/mainnet/gen1/prime/graphics/svg/' + prime.id + '.svg', svg);

        console.log('updated graphic svg ' + i);
    }

    console.log('updated graphic svgs');
}

exports.skin0 = function (prime) {
    let info = skins.genOne(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;

    let arms = [];
    for (let i = 0; i < prime.name.length; i++) {
        let angle = (i + 1) * 360 / prime.name.length;
        let slope = angle * Math.PI / 180;
        let radius = 50 + params[i] * 5;

        let nx = Math.cos(slope) * radius + 256;
        let ny = Math.sin(slope) * radius + 256;
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
        svg = svg.circle({ 'cx': arm.x, 'cy': arm.y, 'r': '20', 'fill': arm.color, 'stroke-width': '4', 'stroke': '#25282c' });
    }

    svg = exports.svgCenter(svg, shades);

    return svg.render();
}

exports.skin1 = function (prime) {
    let info = skins.genOne(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;

    let pies = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 50 + params[i] * 5;

        let sangle = (i + 1) * 360 / prime.name.length;
        let sslope = sangle * Math.PI / 180;
        let sx = Math.cos(sslope) * radius + 256;
        let sy = Math.sin(sslope) * radius + 256;

        let eangle = (i + 2) * 360 / prime.name.length;
        let eslope = eangle * Math.PI / 180;
        let ex = Math.cos(eslope) * radius + 256;
        let ey = Math.sin(eslope) * radius + 256;

        let move = 'M ' + sx + ' ' + sy;
        let arc = 'A ' + radius + ' ' + radius + ' 0 0 1 ' + ex + ' ' + ey;
        let line = 'L 256 256';
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
    svg = exports.svgCenter(svg, shades);

    return svg.render();
}

exports.skin2 = function (prime) {
    let info = skins.genOne(prime, colors);
    let shades = info.shades;
    let params = info.params;
    let blocks = info.blocks;
    let arcs = info.arcs;
    let slices = info.slices;

    let twirls = [];
    for (let i = 0; i < prime.name.length; i++) {
        let radius = 50 + params[i] * 5;
        let color = colors.findColor(params[i]);

        twirls.push({
            radius: radius,
            color: color
        });
    }

    twirls.sort((first, second) => second.radius - first.radius);

    let borders = [
        { radius: Math.max(...twirls.slice(0, 8).map(t => t.radius)) }
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
        svg = svg.circle({ 'r': twirl.radius, 'cx': '256', 'cy': '256', 'fill': twirl.color });
    }

    for (let i = 0; i < borders.length; i++) {
        let border = borders[i];
        svg = svg.circle({ 'r': border.radius, 'cx': '256', 'cy': '256', 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });
    }

    svg = exports.svgCenter(svg, shades);

    return svg.render();
}

exports.svgBackground = function (svg, shades) {
    svg = svg.circle({ 'r': '250', 'cx': '256', 'cy': '256', 'stroke-width': '0', 'fill': shades[2] });

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

    svg = svg.circle({ 'r': '254', 'cx': '256', 'cy': '256', 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });
    svg = svg.circle({ 'r': '208', 'cx': '256', 'cy': '256', 'stroke-width': '4', 'stroke': '#25282c', 'fill': 'none' });

    return svg;
}

exports.svgSlices = function (svg, slices) {
    for (let i = 0; i < slices.length; i++) {
        let slice = slices[i];
        svg = svg.line({ 'x1': '256', 'y1': '256', 'x2': slice.x, 'y2': slice.y, 'stroke-width': '4', 'stroke': '#25282c' });
    }

    return svg;
}

exports.svgCenter = function (svg, shades) {
    svg = svg.circle({ 'r': '30', 'cx': '256', 'cy': '256', 'stroke-width': '4', 'stroke': '#25282c', 'fill': shades[6] });

    return svg;
}