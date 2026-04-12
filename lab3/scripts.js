const N = 4; //4x4 grid

const tiles = []; //tiles list {id: ..., x: row, y: col, img: ...}
for (let i = 0; i < N * N; i++) {
    tiles.push({ id: i, x: Math.floor(i / N), y: i % N, img: null });
}
let solvedImgs = [];
let moves = 0;
let minSwaps = 0;
let startTime = null;

const canvas = document.getElementById("puzzle");
const ctx = canvas.getContext("2d");

let dim = (() => {
    let w = canvas.width;
    let h = canvas.height;

    return { w: w / N, h: h / N };
})();

const STATE = {
    active: false,
    hover: { x: null, y: null },
    drag: { tileIdx: null, cursorX: null, cursorY: null },
};

function initMap() {
    var map = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return map;
}

function centerMap(map) {
    navigator.geolocation.getCurrentPosition((position) => {
        map.setView([position.coords.latitude, position.coords.longitude]);
    });
}

function initCanvas() {
    window.addEventListener("resize", resizeCanvas);

    let w = canvas.width;
    let h = canvas.height;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
}

function getCoords(i) {
    let pieceDim = dim;

    return {
        row: Math.floor((i * pieceDim.w) / (N * pieceDim.w)),
        col: Math.floor(i % N),
    };
}

function startPuzzle() {
    leafletImage(map, function (err, mapCanvas) {
        if (err) {
            console.error("leafletImage error:", err);
            return;
        }

        let tileW = mapCanvas.width / N;
        let tileH = mapCanvas.height / N;

        for (let i = 0; i < tiles.length; i++) {
            let t = tiles[i];
            let offscreen = document.createElement("canvas");
            offscreen.width = tileW;
            offscreen.height = tileH;
            offscreen
                .getContext("2d")
                .drawImage(mapCanvas, t.y * tileW, t.x * tileH, tileW, tileH, 0, 0, tileW, tileH);
            t.img = offscreen;
        }

        solvedImgs = tiles.map((t) => t.img);

        let imgs = tiles.map((t) => t.img);
        shuffleArray(imgs);
        tiles.forEach((t, i) => (t.img = imgs[i]));

        moves = 0;
        minSwaps = calcMinSwaps();
        startTime = Date.now();
        STATE.active = true;
        render();
    });
}

function initPuzzle() {
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    }

    canvas.addEventListener("mousedown", function (e) {
        if (!STATE.active) return;

        let { x: xPX, y: yPX } = getMousePos(canvas, e);

        let col = Math.floor(xPX / dim.w);
        let row = Math.floor(yPX / dim.h);

        if (col >= 0 && col < N && row >= 0 && row < N) {
            STATE.drag.tileIdx = row * N + col;
            STATE.drag.cursorX = xPX;
            STATE.drag.cursorY = yPX;
            canvas.style.cursor = "grabbing";
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!STATE.active) return;

        let { x: xPX, y: yPX } = getMousePos(canvas, e);

        let col = Math.floor(xPX / dim.w);
        let row = Math.floor(yPX / dim.h);
        STATE.hover = { x: col, y: row };

        if (STATE.drag.tileIdx !== null) {
            STATE.drag.cursorX = xPX;
            STATE.drag.cursorY = yPX;
        }

        render();
    });

    canvas.addEventListener("mouseleave", function () {
        if (!STATE.active) return;
        STATE.hover = { x: null, y: null };
        render();
    });

    window.addEventListener("mouseup", function (e) {
        if (STATE.drag.tileIdx === null) return;
        let { x: xPX, y: yPX } = getMousePos(canvas, e);
        let col = Math.floor(xPX / dim.w);
        let row = Math.floor(yPX / dim.h);
        if (col >= 0 && col < N && row >= 0 && row < N) {
            let targetIdx = row * N + col;
            if (targetIdx !== STATE.drag.tileIdx) {
                let tmp = tiles[STATE.drag.tileIdx].img;
                tiles[STATE.drag.tileIdx].img = tiles[targetIdx].img;
                tiles[targetIdx].img = tmp;
                moves++;
                checkWin();
            }
        }
        STATE.drag.tileIdx = null;
        canvas.style.cursor = "default";
        render();
    });
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    dim = (() => {
        let w = canvas.width;
        let h = canvas.height;

        return { w: w / N, h: h / N };
    })();

    console.log(dim);

    render();
}

function drawSquare(x, y, w, h, color) {
    ctx.beginPath();
    ctx.fillStyle = color;

    ctx.rect(x, y, w, h);
    ctx.fill();
}

function drawTile(t, x, y, hovered) {
    ctx.drawImage(t.img, x, y, dim.w, dim.h);
    if (hovered) {
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(x, y, dim.w, dim.h);
    }

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, dim.w, dim.h);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < N * N; i++) {
        let t = tiles[i];
        let x = t.y * dim.w;
        let y = t.x * dim.h;
        if (!t.img) {
            drawSquare(x, y, dim.w, dim.h, "#cccccc");
            continue;
        }

        let hovered = STATE.hover.x === t.y && STATE.hover.y === t.x;

        if (STATE.drag.tileIdx === i) {
            ctx.globalAlpha = 0.3;
            drawTile(t, x, y, false);
            ctx.globalAlpha = 1;
            continue;
        }

        drawTile(t, x, y, hovered);
    }

    if (STATE.drag.tileIdx !== null) {
        let t = tiles[STATE.drag.tileIdx];
        drawTile(t, STATE.drag.cursorX - dim.w / 2, STATE.drag.cursorY - dim.h / 2, false);
    }
}

// 100% chatgpt copilot, nie mam pojecia o kolorach
function lighten(hex, amount) {
    const raw = hex.replace("#", "").padStart(6, "0");
    let r = parseInt(raw.slice(0, 2), 16) / 255;
    let g = parseInt(raw.slice(2, 4), 16) / 255;
    let b = parseInt(raw.slice(4, 6), 16) / 255;

    // RGB → HSL
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min;
    let h = 0,
        s = 0,
        l = (max + min) / 2;
    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    l = Math.min(1, l + amount);

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    let r2, g2, b2;
    if (s === 0) {
        r2 = g2 = b2 = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r2 = hue2rgb(p, q, h + 1 / 3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, "0");
    return "#" + toHex(r2) + toHex(g2) + toHex(b2);
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//inspo: https://www.geeksforgeeks.org/dsa/minimum-number-swaps-required-sort-array/
function calcMinSwaps() {
    const perm = tiles.map((t) => solvedImgs.indexOf(t.img));
    const visited = new Array(perm.length).fill(false);
    let cycles = 0;
    for (let i = 0; i < perm.length; i++) {
        if (visited[i]) continue;
        cycles++;
        let j = i;
        while (!visited[j]) {
            visited[j] = true;
            j = perm[j];
        }
    }
    return perm.length - cycles;
}

function checkWin() {
    if (tiles.every((t, i) => t.img === solvedImgs[i])) {
        STATE.active = false;
        showWin();
    }
}

function showWin() {
    const elapsed = Date.now() - startTime;
    const mm = String(Math.floor(elapsed / 60000)).padStart(2, "0");
    const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Puzzle Solved!", {
            body: `Moves: ${moves} (minimum: ${minSwaps})\nTime: ${mm}:${ss}`,
        });
    } else {
        document.getElementById("win-moves").textContent = moves;
        document.getElementById("win-minswaps").textContent = minSwaps;
        document.getElementById("win-time").textContent = `${mm}:${ss}`;
        document.getElementById("win-overlay").style.display = "flex";
    }
}

function randomLocation(map) {
    let lat = Math.random() * 140 - 70;
    let lng = Math.random() * 360 - 180;
    map.setView([lat, lng]);
}

let map = initMap();
centerMap(map);

initCanvas();
initPuzzle();

document.getElementById("btn-winclose").addEventListener("click", () => {
    document.getElementById("win-overlay").style.display = "none";
});

document.getElementById("btn-locate").addEventListener("click", () => centerMap(map));
document.getElementById("btn-randomloc").addEventListener("click", () => randomLocation(map));
document.getElementById("btn-puzzlestart").addEventListener("click", () => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
    startPuzzle();
});

resizeCanvas();
render();
