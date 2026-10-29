import { celebrate } from "../confetti.js";
import { getAngle, toScreenCoord } from "../polygon/helper.js";
import { renderPolygon } from "../polygonRender/render.js";
import { Window } from "../window/window.js";

export class ColorShapeSelector {
    /**
     * @param {Window} window
     * @param {Object} presets
     * @param {Object} polygonData
     */
    constructor(window, presets, polygonData) {
        this.window = window;
        this.presets = presets;
        this.polygonData = polygonData

        this.selectedColor = null;
        this.selectedShape = null;

        this.colorElements = [];
        this.shapeElements = [];

        this.colorChangeCallBacks = [];
        this.shapeChangeCallBacks = [];

        this.create();
    }


    create() {
        this.container = document.createElement("div");
        this.container.classList.add("selector-container");

        this.createColorSelector();
        this.createShapeSelector();

        this.window.add(this.container);
    }


    addColorChangeCallback(fn) {
        this.colorChangeCallBacks.push(fn);
    }
    removeColorChangeCallbacks(fn) {
        this.colorChangeCallBacks.length = 0;
    }

    addShapeChangeCallback(fn) {
        this.shapeChangeCallBacks.push(fn);
    }
    removeShapeChangeCallbacks(fn) {
        this.shapeChangeCallBacks.length = 0;
    }


    createColorSelector() {
        this.colorTitle = document.createElement("div");
        this.colorTitle.classList.add("selector-title");
        this.colorTitle.textContent = "Renkler";

        this.colorContainer = document.createElement("div");
        this.colorContainer.classList.add("color-container");

        for (const color of this.presets.renkler) {
            const element = document.createElement("button");

            element.classList.add("color-item");

            element.style.backgroundColor =
                this.rgbaToCSS(color.rgba);

            element.title = color.name;

            element.addEventListener("click", () => {
                this.selectColor(color);
            });

            this.colorContainer.appendChild(element);

            this.colorElements.push({
                data: color,
                element: element
            });
        }

        this.container.appendChild(this.colorTitle);
        this.container.appendChild(this.colorContainer);
    }


    createShapeSelector() {
        this.shapeTitle = document.createElement("div");
        this.shapeTitle.classList.add("selector-title");
        this.shapeTitle.textContent = "Şekiller";

        this.shapeContainer = document.createElement("div");
        this.shapeContainer.classList.add("shape-container");

        for (const shape of this.presets.şekiller) {
            const element = document.createElement("canvas");

            element.width = 64;
            element.height = 64;

            element.classList.add("shape-item");

            this.drawShape(element, shape);

            element.title = shape.name;

            element.addEventListener("click", () => {
                this.selectShape(shape);
            });

            this.shapeContainer.appendChild(element);

            this.shapeElements.push({
                data: shape,
                element: element
            });
        }

        this.container.appendChild(this.shapeTitle);
        this.container.appendChild(this.shapeContainer);
    }


    selectColor(color) {
        this.selectedColor = color;

        for (const item of this.colorElements) {
            item.element.classList.toggle(
                "selected",
                item.data === color
            );
        }
        this.colorChangeCallBacks.forEach((fn) => { fn(); })
    }


    selectShape(shape) {
        this.selectedShape = shape;

        for (const item of this.shapeElements) {
            item.element.classList.toggle(
                "selected",
                item.data === shape
            );
        }
        this.shapeChangeCallBacks.forEach((fn) => { fn(); })
    }


    rgbaToCSS(rgba) {
        const [r, g, b, a] = rgba;

        return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    }


    drawShapeAt(canvas, x, y, w, h, shape) {
        const ctx = canvas.getContext("2d");

        ctx.beginPath();

        switch (shape.type) {
            case "triangle":
                {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + w, x + h);
                    ctx.lineTo(x - w, x + h);
                    ctx.closePath();

                    break;
                }

            case "square":
                {
                    ctx.rect(
                        x,
                        y,
                        w,
                        h
                    );

                    break;
                }

            case "circle":
                {
                    ctx.arc(
                        x,
                        y,
                        w,
                        0,
                        Math.PI * 2
                    );

                    break;
                }
        }

        ctx.stroke();
    }
    drawShape(canvas, shape) {
        const ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.beginPath();

        switch (shape.type) {
            case "triangle":
                {
                    ctx.moveTo(32, 8);
                    ctx.lineTo(56, 56);
                    ctx.lineTo(8, 56);
                    ctx.closePath();

                    break;
                }

            case "square":
                {
                    ctx.rect(
                        10,
                        10,
                        44,
                        44
                    );

                    break;
                }

            case "circle":
                {
                    ctx.arc(
                        32,
                        32,
                        23,
                        0,
                        Math.PI * 2
                    );

                    break;
                }
        }

        ctx.stroke();
    }
}

let colorShapeSelectorWindow = new Window(null, "açı renk seçiçi", "angle_color_selector");
colorShapeSelectorWindow.addBaseFunctionality();
colorShapeSelectorWindow.addCloseCallback(() => { colorShapeSelectorWindow.hide(); return false; })
colorShapeSelectorWindow.hide();


export function createAngleColorSelectorWindow(canvasID, angleID) {
    const canvas = document.getElementById(canvasID);

    if (!canvas) {
        throw new Error(`[createAngleColorSelectorWindow] canvas "${canvasID}" does not exist!`);
    }

    colorShapeSelectorWindow.hide();
    colorShapeSelectorWindow.clear();

    let globalData = JSON.parse(localStorage.getItem("courses"));
    let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
    if (localStorage.getItem("question") !== null) {
        polygonData = polygonData.sorular[Number.parseInt(localStorage.getItem("question"))]
    }
    const angleData = polygonData.açılar[angleID];

    if (!angleData) {
        throw new Error(`[createAngleColorSelectorWindow] angle "${angleID}" does not exist!`);
    }

    const selector = new ColorShapeSelector(colorShapeSelectorWindow, globalData, polygonData)

    const initialColor = globalData.renkler[angleData.renkID];
    const initialShape = globalData.şekiller.find((shape) => shape.type === angleData.şekil);

    if (initialColor) {
        selector.selectColor(initialColor);
    }

    if (initialShape) {
        selector.selectShape(initialShape);
    }


    selector.addColorChangeCallback(() => {
        if (!selector.selectedColor)
            return;

        const colorID = globalData.renkler.indexOf(
            selector.selectedColor
        );

        if (colorID === -1)
            return;

        if (polygonData.açılar[angleID].kilitli ?? false)
            return;

        if (polygonData.açılar[angleID].orijinalRenk !== colorID) {
            playWarningSound();
            return;
        }

        playVerificationSound();
        if(polygonData.açılar[angleID].orijinalŞekil == polygonData.açılar[angleID].şekil)
        {
            polygonData.açılar[angleID].kilitli = true;
        }

        polygonData.açılar[angleID].renkID = colorID;

        localStorage.setItem(
            "courses",
            JSON.stringify(globalData)
        );
        renderPolygon(canvasID);
    });

    selector.addShapeChangeCallback(() => {
        if (!selector.selectedShape)
            return;

        if (polygonData.açılar[angleID].kilitli ?? false)
            return;

        
        if (polygonData.açılar[angleID].orijinalŞekil !== selector.selectedShape.type) {
            playWarningSound();
            return;
        }

        playVerificationSound();
        if(polygonData.açılar[angleID].orijinalRenk == polygonData.açılar[angleID].renkID)
        {
            polygonData.açılar[angleID].kilitli = true;
        }


        polygonData.açılar[angleID].şekil =
            selector.selectedShape.type;

        localStorage.setItem(
            "courses",
            JSON.stringify(globalData)
        );
        renderPolygon(canvasID);
    });



    colorShapeSelectorWindow.show();
}
export function createEdgeColorSelectorWindow(canvasID, edgeID) {
    const canvas = document.getElementById(canvasID);

    if (!canvas) {
        throw new Error(
            `[createEdgeColorSelectorWindow] canvas "${canvasID}" does not exist!`
        );
    }

    colorShapeSelectorWindow.hide();
    colorShapeSelectorWindow.clear();

    let globalData = JSON.parse(localStorage.getItem("courses"));
    let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
    if (localStorage.getItem("question") !== null) {
        polygonData = polygonData.sorular[Number.parseInt(localStorage.getItem("question"))]
    }

    const edgeData = polygonData.kenarlar[edgeID];

    if (!edgeData) {
        throw new Error(
            `[createEdgeColorSelectorWindow] edge "${edgeID}" does not exist!`
        );
    }

    const selector = new ColorShapeSelector(
        colorShapeSelectorWindow,
        globalData,
        polygonData
    );

    const initialColor = globalData.renkler[edgeData.renkID];

    const initialShape = globalData.şekiller.find(
        (shape) => shape.type === edgeData.şekil
    );

    if (initialColor) {
        selector.selectColor(initialColor);
    }

    if (initialShape) {
        selector.selectShape(initialShape);
    }

    selector.addColorChangeCallback(() => {
        if (!selector.selectedColor)
            return;

        const colorID = globalData.renkler.indexOf(
            selector.selectedColor
        );

        if (colorID === -1)
            return;

        if (polygonData.kenarlar[edgeID].kilitli ?? false)
            return;

        if (polygonData.kenarlar[edgeID].orijinalRenk !== colorID) {
            playWarningSound();
            return;
        }

        playVerificationSound();
        if(polygonData.kenarlar[edgeID].orijinalŞekil == polygonData.kenarlar[edgeID].şekil)
        {
            polygonData.kenarlar[edgeID].kilitli = true;
        }
        polygonData.kenarlar[edgeID].renkID = colorID;

        localStorage.setItem(
            "courses",
            JSON.stringify(globalData)
        );

        renderPolygon(canvasID);
    });

    selector.addShapeChangeCallback(() => {
        if (!selector.selectedShape)
            return;

        if (polygonData.kenarlar[edgeID].kilitli ?? false)
            return;

        if (polygonData.kenarlar[edgeID].orijinalŞekil !== selector.selectedShape.type) {
            playWarningSound();
            return;
        }

        playVerificationSound();
        if(polygonData.kenarlar[edgeID].renkID == polygonData.kenarlar[edgeID].orijinalRenk)
        {
            polygonData.kenarlar[edgeID].kilitli = true;
        }

        polygonData.kenarlar[edgeID].şekil =
            selector.selectedShape.type;



        localStorage.setItem(
            "courses",
            JSON.stringify(globalData)
        );

        renderPolygon(canvasID);
    });

    colorShapeSelectorWindow.show();
}

export function playWarningSound() {
    playBeep(320, 0.00, 0.10);
    playBeep(320, 0.15, 0.10);
}

export function playVerificationSound() {
    playBeep(520, 0.00, 0.08);
    playBeep(520, 0.10, 0.08);
    playBeep(780, 0.20, 0.15);
}


export function playCongralationSound() {
    const notes = [
        [523.25, 0.00, 0.16],
        [659.25, 0.17, 0.16],
        [783.99, 0.34, 0.20],
        [1046.50, 0.56, 0.32],

        [783.99, 1.05, 0.14],
        [880.00, 1.20, 0.14],
        [1046.50, 1.35, 0.24],
        [1174.66, 1.62, 0.36],

        [1046.50, 2.15, 0.16],
        [1174.66, 2.32, 0.16],
        [1318.51, 2.49, 0.16],
        [1567.98, 2.68, 0.42],

        [1318.51, 3.30, 0.18],
        [1567.98, 3.50, 0.18],
        [1760.00, 3.70, 0.18],
        [2093.00, 3.92, 0.70]
    ];

    for (const [freq, start, duration] of notes) {
        playBeep(freq, start, duration, 0.14);
    }

    // Finalin altında yumuşak bir armoni
    playBeep(1046.50, 4.00, 0.60, 0.045);
    playBeep(1318.51, 4.00, 0.60, 0.045);
}


function playBeep(freq, startOffset, duration, volume = 0.18) {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.linearRampToValueAtTime(volume, now + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.03);
}

let questionAudioCtx = null;
function getAudioContext() {
    if (!questionAudioCtx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) questionAudioCtx = new Ctor();
    }
    if (questionAudioCtx && questionAudioCtx.state === "suspended") {
        questionAudioCtx.resume().catch(() => {});
    }
    return questionAudioCtx;
}