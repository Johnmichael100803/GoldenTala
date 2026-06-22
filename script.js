const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

let secretWinner = "Khims Ang-els";
let names = [];
let currentRotation = 0;
let spinning = false;

const logo = new Image();
logo.src = "logo2.jpg";
const radius = 410;

const colors = [
"#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#14b8a6",
"#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899",
"#f43f5e","#78716c","#6b7280","#64748b","#a16207","#15803d","#0369a1","#4338ca",
"#7e22ce","#be185d","#b91c1c","#166534","#0f766e","#1d4ed8","#581c87","#9f1239"
];

// ===============================
// HIGH DPI FIX
// ===============================
const scale = window.devicePixelRatio || 1;

const SIZE = 850;

canvas.width = SIZE * scale;
canvas.height = SIZE * scale;

canvas.style.width = SIZE + "px";
canvas.style.height = SIZE + "px";

ctx.setTransform(scale, 0, 0, scale, 0, 0);

// ===============================
// TEXT INPUT (SOURCE OF TRUTH)
// ===============================
function updateNames() {
    const box = document.getElementById("namesBox");
    if (!box) return;

    names = box.value
        .split(/\n|,/g)
        .map(n => n.trim())
        .filter(n => n.length > 0);

    renderNames();
    drawWheel();
}

// ===============================
// WEIGHTED GROUPING
// ===============================
function getWeightedNames(list) {
    const map = {};

    list.forEach(n => {
        const key = n.trim();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map);
}

// ===============================
// RENDER SIDE LIST
// ===============================
function renderNames() {
    const list = document.getElementById("players");
    if (!list) return;

    list.innerHTML = names.map((n, i) => `
        <div class="player-item">
            <span>${n}</span>
            <button onclick="removeName(${i})">X</button>
        </div>
    `).join("");
}

// optional remove
function removeName(index) {
    names.splice(index, 1);

    const box = document.getElementById("namesBox");
    if (box) box.value = names.join("\n");

    renderNames();
    drawWheel();
}

// ===============================
// DRAW WHEEL
// ===============================
function drawWheel() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    if (names.length === 0) return;

    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    const radius = 400;

    const weighted = getWeightedNames(names);
    const totalWeight = weighted.reduce((s, [, w]) => s + w, 0);

    let currentAngle = 0;

    weighted.forEach(([name, weight], i) => {

        const sliceAngle = (weight / totalWeight) * Math.PI * 2;

        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // TEXT
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        let fontSize = 18;
        if (weighted.length > 15) fontSize = 12;
        if (weighted.length > 40) fontSize = 9;

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";

        ctx.fillText(`${name} (${weight})`, radius - 20, 5);

        ctx.restore();

        currentAngle += sliceAngle;
    });

    // CENTER
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    if (logo.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(logo, centerX - 60, centerY - 60, 120, 120);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 4;
    ctx.stroke();
}

// ===============================
// SPIN WHEEL
// ===============================
function spinWheel() {
    if (spinning) return;
    if (names.length < 2) {
        alert("Add at least 2 names");
        return;
    }

    spinning = true;

    const weighted = getWeightedNames(names);
    const totalWeight = weighted.reduce((s, [, w]) => s + w, 0);

    let extra = 3600 + Math.floor(Math.random() * 360);

    // SECRET WINNER LOGIC
    const exists = names.some(n =>
        n.trim().toLowerCase() === secretWinner.trim().toLowerCase()
    );

    if (exists) {

        let index = 0;
        let foundAngle = 0;

        for (let i = 0; i < weighted.length; i++) {
            const [name, weight] = weighted[i];

            const sliceAngle = (weight / totalWeight) * 360;

            if (name.toLowerCase() === secretWinner.toLowerCase()) {

    const margin = sliceAngle * 0.15;

    foundAngle =
        index +
        margin +
        Math.random() * (sliceAngle - margin * 2);

    break;
}

            index += sliceAngle;
        }

        const stopAngle = (270 - foundAngle + 360) % 360;

        currentRotation =
            Math.floor(currentRotation / 360) * 360 +
            3600 +
            stopAngle;

    } else {
        currentRotation += extra;
    }

    canvas.style.transition = "none";

requestAnimationFrame(() => {

    canvas.offsetHeight; // force reflow

    canvas.style.transition =
        "transform 20s cubic-bezier(.17,.67,.17,1)";

    canvas.style.transform =
        `rotate(${currentRotation}deg)`;

});
    setTimeout(() => {
        const match = names.find(n =>
            n.trim().toLowerCase() === secretWinner.trim().toLowerCase()
        );

        showWinner(match ? secretWinner : "No winner found");

        spinning = false;
    }, 7500);
}

// ===============================
// WINNER MODAL
// ===============================
function showWinner(name) {
    const box = document.getElementById("winnerName");
    const modal = document.getElementById("winnerModal");

    if (box) box.innerText = name;
    if (modal) modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("winnerModal");
    if (modal) modal.style.display = "none";
}

// ===============================
// INIT
// ===============================
window.addEventListener("load", () => {
    const box = document.getElementById("namesBox");
    if (!box) return;

    box.addEventListener("input", updateNames);
    updateNames();
});

// logo safety
logo.onload = () => drawWheel();

function safeLabel(text) {
    if (!text) return "";
    return text.length > 14 ? text.slice(0, 14) + "..." : text;
}
