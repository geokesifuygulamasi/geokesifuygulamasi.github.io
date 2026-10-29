import { renderPolygon } from "./polygonRender/render.js";
import { createHitTesterForPolygon } from "./polygonHitTest/hitTest.js"
import { createEdgeColorSelectorWindow, createAngleColorSelectorWindow, playWarningSound, playVerificationSound, playCongralationSound } from "./polygonColoring/coloring.js"
import { createNavBar } from "../page/navBar.js"
import { createContactBar } from "../page/contactBar.js"
import { notify } from "./toast/toast.js";
import { celebrate } from "./confetti.js";

createNavBar("header", false, true);
createContactBar("iletisim")

const canvas = document.getElementById("renderCanvas");
const container = document.getElementById("canvasContainer");

const DESIRED_WIDTH = 800.0;
const DESIRED_HEIGHT = 600.0;

const list = document.getElementById("selectorList");
const sideBar = document.getElementById("styleSidebar");

localStorage.removeItem("questionMode");

const data = await (await fetch("../courseSelector/courses.json")).json();
localStorage.setItem("courses", JSON.stringify(data));

const restartCourseButton = document.getElementById("restartCourse");
restartCourseButton.disabled = true;


function checkQuestionState() {
    let hasError = false;
    const letterArray = ["a", "b", "c", "d", "e", "f", "g"];

    let edges = polygonData.kenarlar ?? [];
    edges.forEach((edge, index) => {
        if (edge.doğruŞekil != null && edge.doğruRenkID != null) {
            if (edge.şekil !== edge.doğruŞekil || edge.renkID !== edge.doğruRenkID) {
                hasError = true;
                if (hasError) {

                    notify(`${edge.ismi ?? letterArray[index]} Kenarı eksiktir lütfen tammalayınız`, "error", 3000);
                    restartCourseButton.disabled = true;
                }
            }
        }
    })
    let angles = polygonData.açılar ?? [];

    angles.forEach((angle, index) => {
        if (angle.doğruŞekil != null && angle.doğruRenkID != null) {
            if (angle.şekil !== angle.doğruŞekil || angle.renkID !== angle.doğruRenkID) {
                hasError = true;

                let angleName = "error";
                if (!angle.ismi) {
                    const v0 = polygonData.kenarlar[angle.edge1].v1;
                    const v1 = polygonData.kenarlar[angle.edge1].v2;
                    const v2 = polygonData.kenarlar[angle.edge2].v1;
                    const v3 = polygonData.kenarlar[angle.edge2].v2;

                    let other1 = null;
                    let other2 = null;
                    let common = null;
                    if (v0 == v1) {
                        common = v0;
                        other1 = v2;
                        other2 = v3;
                    }
                    else if (v0 == v2) {
                        common = v0;
                        other1 = v1;
                        other2 = v3;
                    }
                    else if (v1 == v2) {
                        common = v1;
                        other1 = v0;
                        other2 = v3;
                    }
                    else if (v1 == v3) {
                        common = v1;
                        other1 = v0;
                        other2 = v2;
                    }
                    else if (v2 == v3) {
                        common = v2;
                        other1 = v0;
                        other2 = v1;
                    }
                    else {
                        common = v1;
                        other1 = v0;
                        other2 = v2;
                    }

                    angleName = "m("
                        + letterArray[other1].toUpperCase()
                        + letterArray[common].toUpperCase()
                        + letterArray[other2].toUpperCase()
                        + ")";
                }
                if (hasError) {
                    notify(`${angle.ismi ?? angleName} eksiktir lütfen tammalayınız`, "error", 3000);
                    restartCourseButton.disabled = true;
                }
            }
        }
    })

    if (!hasError) {
        playCongralationSound();
        for (let i = 0; i < 30; i++) {
            celebrate(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 0.54);
        }

        notify(`Kurs tamamlanmıştır soldaki panelden "Sonraki Kurs"'a tıklayaraktan bir sonraki içeriğe erişebilirsiniz`, "success", 7000);
        restartCourseButton.disabled = false;
    }

}

let globalData = data;
let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
function createDragBehaviourForSymbolfulObjects(item, selectedColor = null, selectedShape = null, extraText = null) {
    item.className = "dragStyle";
    item.draggable = true;

    let clr = null;

    let shp = null;

    let clrData = null;
    let clrID = null;
    if (selectedColor !== null) {
        globalData.renkler.forEach((c, index) => {
            if (c.name.toLowerCase() === selectedColor || c.eng_name.toLowerCase() === selectedColor) {
                clr = c.eng_name;
                clrID = index;
                clrData = c;
                return;
            }
        });
    }

    if (selectedShape !== null) {
        globalData.şekiller.forEach((s, index) => {
            if (s.name.toLowerCase() === selectedShape || s.type.toLowerCase() === selectedShape) {
                shp = s.type;
                return;
            }
        });
    }


    const symbol = document.createElement("span");
    symbol.className = `symbol symbol-${selectedShape ?? "empty"}`;
    symbol.style.setProperty("--symbol-color", clr ? `rgb(${clrData.rgba[0]}, ${clrData.rgba[1]}, ${clrData.rgba[2]})` : "siyah");

    item.append(symbol);

    if (extraText !== null) {
        const label = document.createElement("span");
        label.textContent = extraText;

        item.append(label);
    }

    /**
     * @type {Object}
     */
    let data = null;
    if (clr !== null) {
        data =
        {
            color: clrID
        };
    }
    else {
        data =
        {
            color: globalData.renkler.length - 1
        }
    }


    if (shp !== null) {
        data.shape = shp
    }


    item.addEventListener("dragstart", event => {
        event.dataTransfer.setData("application/json", JSON.stringify(data));
        event.dataTransfer.effectAllowed = "copy";
    });







}

function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    // const sideBarRect = sideBar.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
        return;
    }

    const scale = Math.min(
        (rect.width) / DESIRED_WIDTH,
        (rect.height) / DESIRED_HEIGHT,
    );


    const width = Math.round(DESIRED_WIDTH * scale);
    const height = Math.round(DESIRED_HEIGHT * scale);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // createStyleBar();
    renderPolygon(canvas.id);
    createHitTesterForPolygon(canvas.id, polygonData.açıTestiAktif ?? true, polygonData.kenarTestiAktif ?? true);
}
const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(container);

resizeCanvas();

canvas.addEventListener("dragover", event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
});
canvas.addEventListener("drop", (event) => {

    event.preventDefault();
    if (event.dataTransfer.getData("application/json").length <= 0)
        return;

    const style = JSON.parse(
        event.dataTransfer.getData("application/json")
    );

    function PolygonAngleHitOverride(hit) {
        let shapeIsValid = false;
        if (style.shape !== null && style.shape !== undefined) {
            if (polygonData.açılar[hit.detail.id].doğruŞekil === polygonData.açılar[hit.detail.id].şekil)
                return;
            if (style.shape !== polygonData.açılar[hit.detail.id].doğruŞekil) {
                playWarningSound();
                return;
            }
            shapeIsValid = true;

        }
        if (style.color !== null && style.color !== undefined) {
            if (polygonData.açılar[hit.detail.id].doğruRenkID === polygonData.açılar[hit.detail.id].renkID)
                return;
            if (style.color !== polygonData.açılar[hit.detail.id].doğruRenkID) {
                playWarningSound();
                return;
            }
            playVerificationSound();
            if (shapeIsValid) {
                polygonData.açılar[hit.detail.id].şekil = style.shape;
            }

            polygonData.açılar[hit.detail.id].renkID = style.color;
        }

        localStorage.setItem("courses", JSON.stringify(globalData));

        renderPolygon(canvas.id);
    }
    function PolygonEdgeHitOverride(hit) {
        let shapeIsValid = false;
        if (style.shape !== null && style.shape !== undefined) {
            if (polygonData.kenarlar[hit.detail.id].doğruŞekil === polygonData.kenarlar[hit.detail.id].şekil)
                return;
            if (style.shape !== polygonData.kenarlar[hit.detail.id].doğruŞekil) {
                playWarningSound();
                return;
            }
            shapeIsValid = true;

        }
        if (style.color !== null && style.color !== undefined) {

            if (polygonData.kenarlar[hit.detail.id].doğruRenkID === polygonData.kenarlar[hit.detail.id].renkID)
                return;
            if (style.color !== polygonData.kenarlar[hit.detail.id].doğruRenkID) {
                playWarningSound();
                return;
            }
            if (shapeIsValid) {
                polygonData.kenarlar[hit.detail.id].şekil = style.shape;
            }
            playVerificationSound();
            polygonData.kenarlar[hit.detail.id].renkID = style.color;
        }

        localStorage.setItem("courses", JSON.stringify(globalData));
        renderPolygon(canvas.id);
    }


    document.addEventListener("PolygonAngleHit", PolygonAngleHitOverride)
    document.addEventListener("PolygonEdgeHit", PolygonEdgeHitOverride)

    canvas.dispatchEvent(new MouseEvent('pointerdown', { view: window, bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY }))
    canvas.dispatchEvent(new MouseEvent('pointerup', { view: window, bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY }))

    document.removeEventListener("PolygonAngleHit", PolygonAngleHitOverride)
    document.removeEventListener("PolygonEdgeHit", PolygonEdgeHitOverride)

    // createStyleBar();
    renderPolygon(canvas.id);
});


let currentCourseIndex = Number.parseInt(
    localStorage.getItem("course") ?? "0",
    10
);

let currentQuestionIndex = localStorage.getItem("question") === null
    ? -1
    : Number.parseInt(localStorage.getItem("question"), 10);

const previousCourseButton = document.getElementById("previousCourse");
const showCoursesButton = document.getElementById("showCourses");
const nextCourseButton = document.getElementById("nextCourse");
const checkTheQuestionButton = document.getElementById("checkQuestion");

function getCurrentCourse() {
    return globalData.kurslar[currentCourseIndex];
}

function getCurrentQuestion() {
    const course = getCurrentCourse();

    if (currentQuestionIndex < 0)
        return null;

    return course.sorular?.[currentQuestionIndex] ?? null;
}

const questionNumber = document.getElementById("questionNumber");
const questionCategory = document.getElementById("questionCategory");
const questionHint = document.getElementById("questionHint");

function renderSymbols(element) {
    const text = element.textContent;
    element.replaceChildren();

    const regex = /\{([^:]+):([^}]+)\}/g;
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const index = match.index;
        element.append(
            document.createTextNode(text.slice(lastIndex, index))
        );

        const color = match[1].trim();
        const shape = match[2].trim();

        const item = document.createElement("span");
        createDragBehaviourForSymbolfulObjects(item, color ? color.toLowerCase() : "siyah", shape);

        element.append(item);
        lastIndex = index + match[0].length;
    }

    element.append(
        document.createTextNode(text.slice(lastIndex))
    );
}

function updatePage() {
    const course = getCurrentCourse();
    const question = getCurrentQuestion();
    const questionText = document.getElementById("questionText");
    const questionReminderText = document.getElementById("questionReminder");
    questionReminderText.innerText = '\n\nKenarlara doğru götürmenize rağmen kabul etmiyorsa açıları bitirmemenizden kaynaklanıyor olabilir bu yüzden ilk olarak açılar tamamlayınız eğer halen düzelmediyse en aşağıdaki "Geliştiricilerle iletişim" iletişime tıklayaraktan sorununuzu e-mail üzerinden gönderebilirsiniz'

    previousCourseButton.disabled = currentCourseIndex <= 0;
    nextCourseButton.disabled =
        currentCourseIndex >= globalData.kurslar.length - 1;


    questionNumber.textContent = currentQuestionIndex >= 0
        ? `Soru ${currentQuestionIndex + 1}`
        : "Kurs";


    questionCategory.textContent =
        course.ismi ?? course.isim ?? "GEOMETRİ";

    const text = "\n" + (question?.soru ?? question?.soruMetni ?? course.aciklama ?? "") + `\n\nSembolleri sürükleyip bırakarak eksik bırakılan yerleri tamamlayınız\n\n`;

    questionText.textContent = text;

    renderSymbols(questionText)


    const hint = question?.ipucu ?? question?.hint ?? "";

    questionHint.textContent = hint;
    questionHint.hidden = !hint;

    polygonData = question ?? course;

    createHitTesterForPolygon(canvas.id);

    renderPolygon(canvas.id);
}

async function selectCourse(courseIndex) {
    currentCourseIndex = courseIndex;
    currentQuestionIndex = -1;

    const data = await (await fetch("../courseSelector/courses.json")).json();
    localStorage.setItem("courses", JSON.stringify(data));
    localStorage.setItem("course", String(currentCourseIndex));

    window.location.href = "/course/index.html";
}

window.addEventListener("courseFinished", (e) => {
    console.log("Soru tamamlandı:", e.detail);
});

previousCourseButton.addEventListener("click", () => {
    if (currentCourseIndex > 0)
        selectCourse(currentCourseIndex - 1);
});

nextCourseButton.addEventListener("click", () => {
    if (currentCourseIndex < globalData.kurslar.length - 1)
        selectCourse(currentCourseIndex + 1);
});

showCoursesButton.addEventListener("click", () => {
    window.location.href = "/courseSelector/index.html";
});

checkTheQuestionButton.addEventListener("click", checkQuestionState)

restartCourseButton.addEventListener("click", () => {
    selectCourse(currentCourseIndex);
    restartCourseButton.disabled = true;
});

updatePage();
