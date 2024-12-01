var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var template = '"ABCDEFGHIJKLMNOPQRSTUVXYZ123456789ABCDEFGHIJKLMNOPQRSTUVXYZ123456789\
ABCDEFGHIJKLMNOPQRSTUVXYZ123456789ABCDEFGHIJKLMNOPQRSTUVXYZ123456789ABCDEFGHIJKLMNOP\
QRSTUVXYZ123456789ABCDEFGHIJKLMNOPQRSTUVXYZ123456789";';
template = template.split('');

var fontSize = 14,
    columns = canvas.width / fontSize;

var drops = [];
for (var i = 0; i < columns; i++) {
    drops[i] = 1;
}

var colors = ['#00f', '#0f0', '#f00', '#800080'];
var currentColor = 0;

function draw() {
    if (Math.floor(Date.now() / 10000) % 4 === 0) {
        currentColor = 0;
    } else if (Math.floor(Date.now() / 10000) % 4 === 1) {
        currentColor = 1;
    } else if (Math.floor(Date.now() / 10000) % 4 === 2) {
        currentColor = 2;
    } else {
        currentColor = 3;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, .1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < drops.length; i++) {
        var text = template[Math.floor(Math.random() * template.length)];
        ctx.fillStyle = colors[currentColor];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;

        if (drops[i] * fontSize > canvas.height && Math.random() > .95) {
            drops[i] = 0;
        }
    }
}

setInterval(draw, 33);