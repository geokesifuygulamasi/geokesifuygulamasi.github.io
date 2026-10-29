import { createNavBar } from "../page/navBar.js";
import { createContactBar } from "../page/contactBar.js";
import { renderPolygon } from "../course/polygonRender/render.js";

const DESIRED_WIDTH = 800.0;
const DESIRED_HEIGHT = 600.0;

function renderSymbols(element) {
    const text = element.textContent;

    let globalData = JSON.parse(localStorage.getItem("courses"));

    element.replaceChildren();

    const regex = /\{([^:]+):([^}]+)\}/g;
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const index = match.index;

        // Sembolün öncesindeki normal metin
        element.append(
            document.createTextNode(text.slice(lastIndex, index))
        );

        const color = match[1].trim();
        const shape = match[2].trim();

        let clr = null;
        let shp = null;

        globalData.renkler.forEach((c) => {
            if (c.name.toLowerCase() === color) {
                clr = c.eng_name;
                return;
            }
        });


        const symbol = document.createElement("span");
        symbol.className = `symbol symbol-${shape}`;
        symbol.style.setProperty("--symbol-color", clr);

        element.append(symbol);
        lastIndex = index + match[0].length;
    }

    // Sondaki normal metin
    element.append(
        document.createTextNode(text.slice(lastIndex))
    );
}

async function createCourseSelector() {
    const list = document.getElementById("courseList");
    const container = document.getElementById("canvasContainer");
    const canvas = document.getElementById("previewCanvas");
    const startButton = document.getElementById("startCourse");

    const data = await (await fetch("./courses.json")).json();
    localStorage.setItem("courses", JSON.stringify(data));

    let selectedItem = null;
    let selectedData = null;
    let openedCourse = null;

    /**
     * Kurs veya soru seçer ve önizlemeyi günceller.
     *
     * @param {HTMLButtonElement} item
     * @param {Object} itemData
     * @param {number} courseIndex
     * @param {number | null} questionIndex
     */
    function selectCourse(item, itemData, courseIndex, questionIndex) {
        selectedItem?.classList.remove("selected");

        item.classList.add("selected");
        selectedItem = item;
        selectedData = itemData;

        localStorage.setItem("course", courseIndex.toString());

        if (questionIndex !== null) {
            localStorage.setItem("question", questionIndex.toString());
        }
        else {
            localStorage.removeItem("question");
        }

        renderPolygon(canvas.id);
    }

    /**
     * Açılır-kapanır açıklama metni oluşturur.
     *
     * @param {string} text
     * @param {string} className
     * @returns {HTMLParagraphElement}
     */
    function createDescription(text, className) {
        const description = document.createElement("p");

        description.className = className;
        description.textContent = text;

        renderSymbols(description);

        return description;
    }

    list.replaceChildren();

    data.kurslar.forEach((course, courseIndex) => {
        const courseGroup = document.createElement("div");
        courseGroup.className = "courseGroup";

        const courseItem = document.createElement("button");
        courseItem.type = "button";
        courseItem.className = "courseItem";
        courseItem.textContent = course.ismi ?? `Kurs ${courseIndex + 1}`;
        courseItem.setAttribute("aria-expanded", "false");

        const courseContent = document.createElement("div");
        courseContent.className = "courseContent";
        courseContent.hidden = true;

        courseItem.addEventListener("click", () => {
            const shouldOpen = openedCourse !== courseGroup;

            if (openedCourse !== null) {
                const previousButton =
                    openedCourse.querySelector(":scope > .courseItem");

                const previousContent =
                    openedCourse.querySelector(":scope > .courseContent");

                previousContent.hidden = true;
                previousButton.setAttribute("aria-expanded", "false");
                openedCourse.classList.remove("open");
            }

            if (shouldOpen) {
                openedCourse = courseGroup;

                courseContent.hidden = false;
                courseItem.setAttribute("aria-expanded", "true");
                courseGroup.classList.add("open");
            }
            else {
                openedCourse = null;
            }

            selectCourse(courseItem, course, courseIndex, null);
        });

        courseGroup.appendChild(courseItem);

        if (course.aciklama) {
            courseContent.appendChild(
                createDescription(course.aciklama, "courseDescription")
            );
        }

        if (Array.isArray(course.sorular) && course.sorular.length > 0) {
            const questionList = document.createElement("div");
            questionList.className = "questionList";

            course.sorular.forEach((question, questionIndex) => {
                const questionGroup = document.createElement("div");
                questionGroup.className = "questionGroup";

                const questionItem = document.createElement("button");
                questionItem.type = "button";
                questionItem.className = "questionItem";
                questionItem.textContent =
                    question.ismi ?? `Soru ${questionIndex + 1}`;

                questionItem.addEventListener("click", () => {
                    selectCourse(
                        questionItem,
                        question,
                        courseIndex,
                        questionIndex
                    );
                });

                questionGroup.appendChild(questionItem);

                if (question.aciklama) {
                    questionGroup.appendChild(
                        createDescription(
                            question.aciklama,
                            "questionDescription"
                        )
                    );
                }

                questionList.appendChild(questionGroup);
            });

            courseContent.appendChild(questionList);
        }

        courseGroup.appendChild(courseContent);
        list.appendChild(courseGroup);
    });

    function resizePreview() {
        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const scale = Math.min(
            rect.width / DESIRED_WIDTH,
            rect.height / DESIRED_HEIGHT
        );

        canvas.width = Math.round(DESIRED_WIDTH * scale);
        canvas.height = Math.round(DESIRED_HEIGHT * scale);

        canvas.style.width =  `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;



        if (selectedData !== null) {
            renderPolygon(canvas.id);
        }
    }

    const resizeObserver = new ResizeObserver(resizePreview);
    resizeObserver.observe(container);

    resizePreview();

    startButton.addEventListener("click", () => {
        if (selectedData !== null) {
            window.location.href = "/course/index.html";
        }
    });
}

createNavBar("header", false, true);
createContactBar("iletisim");

createCourseSelector();