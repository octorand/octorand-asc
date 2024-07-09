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

        break;
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

    let svg = builder;
    svg = svg.height(200);
    svg = svg.width(200);
    svg = svg.viewBox('0 0 512 512');

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

    let svg = builder;
    svg = svg.height(200);
    svg = svg.width(200);
    svg = svg.viewBox('0 0 512 512');

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


    let svg = builder;
    svg = svg.height(200);
    svg = svg.width(200);
    svg = svg.viewBox('0 0 512 512');

    return svg.render();
}