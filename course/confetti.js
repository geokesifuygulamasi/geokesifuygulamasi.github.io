
const confettiCanvas = document.createElement("canvas");

confettiCanvas.style.position = "fixed";
confettiCanvas.style.inset = "0";
confettiCanvas.style.width = "100%";
confettiCanvas.style.height = "100%";
confettiCanvas.style.pointerEvents = "none";
confettiCanvas.style.zIndex = "99999";

document.body.appendChild(confettiCanvas);

const confettiContext = confettiCanvas.getContext("2d");

const confettiColors = [
    "#ff4757",
    "#ffa502",
    "#2ed573",
    "#1e90ff",
    "#a55eea",
    "#ff6b81",
    "#feca57"
];

let confettiParticles = [];
let confettiAnimationID = null;

function resizeConfettiCanvas() {
    const scale = window.devicePixelRatio || 1;

    confettiCanvas.width = window.innerWidth * scale;
    confettiCanvas.height = window.innerHeight * scale;

    confettiContext.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

export function celebrate(x = null, y = null, gravityFactor = 1) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Önceki animasyon varsa devam ettir.
    if (confettiAnimationID === null) {
        confettiParticles = [];
    }

    // Ekranın ortasından patlama.
    if(x == null)
        x = width / 2;
    if(y == null)
        y = height * 0.42;

    for (let i = 0; i < 180; ++i) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 10;

        confettiParticles.push({
            x: x,
            y: y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,

            gravity: (0.13 + Math.random() * 0.12) * gravityFactor,

            width: 4 + Math.random() * 6,
            height: 5 + Math.random() * 8,

            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,

            color: confettiColors[
                Math.floor(Math.random() * confettiColors.length)
            ],

            life: 1,
            decay: 0.003 + Math.random() * 0.004
        });
    }

    if (confettiAnimationID === null) {
        animateConfetti();
    }
}

function animateConfetti() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    confettiContext.clearRect(0, 0, width, height);

    for (let i = confettiParticles.length - 1; i >= 0; --i) {
        const p = confettiParticles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vy += p.gravity;
        p.vx *= 0.995;

        p.rotation += p.rotationSpeed;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > height + 30) {
            confettiParticles.splice(i, 1);
            continue;
        }

        confettiContext.save();

        confettiContext.globalAlpha = Math.min(1, p.life);
        confettiContext.fillStyle = p.color;

        confettiContext.translate(p.x, p.y);
        confettiContext.rotate(p.rotation);

        confettiContext.fillRect(
            -p.width / 2,
            -p.height / 2,
            p.width,
            p.height
        );

        confettiContext.restore();
    }

    if (confettiParticles.length > 0) {
        confettiAnimationID = requestAnimationFrame(animateConfetti);
    } else {
        confettiContext.clearRect(0, 0, width, height);
        confettiAnimationID = null;
    }
}
