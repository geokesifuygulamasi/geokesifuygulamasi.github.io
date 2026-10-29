import { getAngle, getCommonVertex, toScreenCoordObj } from "../polygon/helper.js";

/**
 * @param {string} elementID
 */
export function renderPolygon(elementID) {
    const canvas = document.getElementById(elementID)
    if (!canvas) {
        throw new Error("[renderPolygon] passed non-existing elementID : [ELEMENT_ID] : " + elementID);
    }
    else if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("[renderPolygon] passed a non <canvas> element : [ELEMENT_ID] : " + elementID);
    }

    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("[renderPolygon] failed to get 2D rendering context");
    }
    /**
    * @type {Object}
    */
    let globalData = JSON.parse(localStorage.getItem("courses"));
    let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
    if (localStorage.getItem("question") !== null) {
        polygonData = polygonData.sorular[Number.parseInt(localStorage.getItem("question"))]
    }

    ctx.stroke();
    ctx.fill();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderLines(ctx, globalData, polygonData);
    renderWirePolygon(ctx, globalData, polygonData, canvas);
    renderEdges(ctx, globalData, polygonData, canvas);
    renderAngles(ctx, globalData, polygonData, canvas);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} globalData
 * @param {Object} polygonData
 */
function renderQuestion(ctx, globalData, polygonData) {

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} globalData
 * @param {Object} polygonData
 */
function renderLines(ctx, globalData, polygonData) {
    const lineSpacing = (globalData.çizgiBoşluğu ?? 0.04)

    const lineWidth = 0.5;


    ctx.reset();

    ctx.moveTo(0, ctx.canvas.height / 2);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);

    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);

    ctx.strokeStyle = (globalData.sıfırASıfırÇizimŞekli) ?? "gray";
    ctx.lineWidth = lineWidth * 4;
    ctx.stroke();
    for (let x = -1.0; x < 1.0; x += lineSpacing) {
        if (x == 0)
            continue;
        ctx.moveTo((x + 1) / 2 * ctx.canvas.width, ctx.canvas.height)
        ctx.lineTo((x + 1) / 2 * ctx.canvas.width, 0);
    }
    for (let y = -1.0; y < 1.0; y += lineSpacing) {
        if (y == 0)
            continue;
        ctx.moveTo(0, (1 - y) / 2 * ctx.canvas.height);
        ctx.lineTo(ctx.canvas.width, (1 - y) / 2 * ctx.canvas.height)
    }
    ctx.strokeStyle = globalData.çizgiCizimŞekli ?? "black";
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} globalData
 * @param {Object} polygonData
 * @param {HTMLCanvasElement} canvas
 */
function renderWirePolygon(ctx, globalData, polygonData, canvas) {

    /** @type {Object[]} */
    const vertices = polygonData.köşeler;

    /** @type {Object[]} */
    const edges = polygonData.kenarlar;

    /** @type {number} */

    const lineWidth = polygonData.kenarKalınlığı ?? globalData.kenarKalınlığı ?? 2;

    // const letterArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

    edges.forEach((edge, index) => {
        const edgeColorID = edge.renkID ?? edge.benzelikID ?? polygonData.kenarRengiID ?? globalData.kenarRengiID ?? 1;

        const edgeColor = globalData.renkler[edgeColorID].rgba ?? [255, 255, 0, 255];
        if (edge.v1 >= vertices.length) {
            throw new Error("[renderPolygon] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge.v1 + " : [RANGE] : " + (vertices.length - 1));
        }
        if (edge.v2 >= vertices.length) {
            throw new Error("[renderPolygon] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge.v2 + " : [RANGE] : " + (vertices.length - 1));
        }
        const v1 = vertices[edge.v1]
        const v2 = vertices[edge.v2]

        const coord1 = toScreenCoordObj(v1, canvas)

        const x1 = coord1.x;
        const y1 = coord1.y

        const coord2 = toScreenCoordObj(v2, canvas)

        const x2 = coord2.x;
        const y2 = coord2.y

        const currentEdgeColorID = edgeColorID
        const currentEdgeColor = globalData.renkler[currentEdgeColorID].rgba ?? edgeColor;

        const color = `rgb(${currentEdgeColor[0]}, ${currentEdgeColor[1]}, ${currentEdgeColor[2]})`;;

        const currentEdgeShapeType = edge.şekil;
        const shapeSize = edge.şekilBoyutu ?? polygonData.şekilBoyutu ?? globalData.şekilBoyutu ?? 50;
        const shapeDistance = edge.şekilUzaklığı ?? polygonData.şekilUzaklığı ?? globalData.şekilUzaklığı ?? 10;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);
        const dirX = dx / length;
        const dirY = dy / length;
        const normalX = -dirY;
        const normalY = dirX;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const x = centerX + normalX * shapeDistance;
        const y = centerY + normalY * shapeDistance;
        const halfSize = shapeSize / 2;
        if (currentEdgeShapeType) {
            let fillDraw = true;
            if (currentEdgeShapeType === "triangle") {
                ctx.beginPath();
                ctx.moveTo(x, y - halfSize);
                ctx.lineTo(x - halfSize, y + halfSize);
                ctx.lineTo(x + halfSize, y + halfSize);
                ctx.closePath();
            }
            else if (currentEdgeShapeType === "square" || currentEdgeShapeType === "rect") {
                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    shapeSize,
                    shapeSize
                );
            }
            else if (currentEdgeShapeType === "circle") {
                ctx.beginPath();
                ctx.arc(
                    x,
                    y,
                    halfSize,
                    0,
                    Math.PI * 2
                );
            }
            else if (currentEdgeShapeType === "parallel") {
                const borderSize = halfSize / 2;
                const size = shapeSize;
                const gap = size * 0.3;
                ctx.beginPath();

                ctx.moveTo(x - size, y - gap);
                ctx.lineTo(x + size, y - gap);

                ctx.moveTo(x - size, y + gap);
                ctx.lineTo(x + size, y + gap);
                
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentEdgeShapeType === "emptyTriangle") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.moveTo(x, y - halfSize);
                ctx.lineTo(x - halfSize, y + halfSize);
                ctx.lineTo(x + halfSize, y + halfSize);
                ctx.closePath();
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentEdgeShapeType === "emptySquare" || currentEdgeShapeType === "emptyRect") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    shapeSize,
                    shapeSize
                );
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentEdgeShapeType === "emptyCircle") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.arc(
                    x,
                    y,
                    halfSize,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentEdgeShapeType === "empty") {
                const borderSize = halfSize / 2;

                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    halfSize * 2,
                    halfSize * 2
                );

                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            if (edge.kilitli ?? false) {
                const lockSize = edge.kilitBoyutu ?? polygonData.kilitBoyutu ?? globalData.kilitBoyutu ?? 102;
                drawLock(ctx, centerX, centerY, lockSize, "yellow")
            }


            ctx.save();

            if (fillDraw) {
                ctx.lineWidth = edge.şekilÇizgiKalınlığı ?? polygonData.şekilÇizgiKalınlığı ?? globalData.şekilÇizgiKalınlığı ?? 5;
                ctx.fillStyle = color;
                ctx.fill();
            }


            ctx.restore();

        }

        ctx.beginPath();


        const textDistance = edge.yazıUzaklığı ?? polygonData.yazıUzaklığı ?? -halfSize;

        ctx.lineWidth = edge.yazıKalınlığı ?? polygonData.yazıKalınlığı ?? globalData.yazıKalınlığı ?? 1;
        ctx.font = edge.yazıFontu ?? polygonData.yazıFontu ?? globalData.yazıFontu ?? "20px Arial";
        ctx.fillStyle = color;
        // ctx.fillText(letterArray[index], x + normalX * textDistance * 7, y - normalY * -textDistance * 7)


        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.lineWidth = edge.kenarKalınlığı ?? lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();


    });
}
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} globalData
 * @param {Object} polygonData
 * @param {HTMLCanvasElement} canvas
 */
function renderEdges(ctx, globalData, polygonData, canvas) {
    /** @type {Object[]} */
    const vertices = polygonData.köşeler;

    /** @type {Object[]} */
    const edges = polygonData.kenarlar;
    const angleColorID = polygonData.açıRengiID ?? globalData.açıRengiID ?? 0;
    // const letterArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];


    vertices.forEach((vertex, index) => {
        const coord = toScreenCoordObj(vertex, canvas);
        const textDistance =
            vertex.yazıUzaklığı ??
            polygonData.yazıUzaklığı ??
            20;

        const xDir =
            vertex.yönXYazı ??
            polygonData.yönXYazı ??
            globalData.yönXYazı ??
            0.5;

        const yDir =
            vertex.yönYYazı ??
            polygonData.yönYYazı ??
            globalData.yönYYazı ??
            1;

        const x = coord.x + xDir * textDistance;
        const y = coord.y + yDir * textDistance;

        ctx.font =
            vertex.yazıFontu ??
            polygonData.yazıFontu ??
            globalData.yazıFontu ??
            "20px Arial";

        ctx.lineWidth =
            vertex.yazıKalınlığı ??
            polygonData.yazıKalınlığı ??
            globalData.yazıKalınlığı ??
            1;

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // ctx.fillText(letterArray[index] ?? String(index), x, y);
    })
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} globalData
 * @param {Object} polygonData
 * @param {HTMLCanvasElement} canvas
 */
function renderAngles(ctx, globalData, polygonData, canvas) {
    /** @type {Object[]} */
    const vertices = polygonData.köşeler;

    /** @type {Object[]} */
    const edges = polygonData.kenarlar;

    /** @type {Object[]} */
    const angles = polygonData.açılar ?? [];


    angles.forEach((angleRequest, index) => {
        const radius = polygonData.açıYarıÇapı ?? globalData.açıYarıÇapı ?? angleRequest.açıYarıÇapı ?? 30;
        const angleColorID = angleRequest.renkID ?? angleRequest.benzelikID ?? polygonData.kenarRengiID ?? globalData.kenarRengiID ?? 0;

        const angleColor = globalData.renkler[angleColorID].rgba ?? [255, 255, 0, 255];

        ctx.beginPath();

        /** @param {number} */
        const edge1 = angleRequest.edge1;
        if (edge1 >= edges.length) {
            throw new Error("[renderAngles::getAngle] passed an edge index that is out of range : [EDGE_INDEX] : " + edge1 + " : [RANGE] : " + (edges.length - 1));
        }
        /** @param {number} */
        const edge2 = angleRequest.edge2;
        if (edge2 >= edges.length) {
            throw new Error("[renderAngles::getAngle] passed an edge index that is out of range : [EDGE_INDEX] : " + edge2 + " : [RANGE] : " + (edges.length - 1));
        }

        const angle = getAngle(edges[edge1], edges[edge2], vertices, canvas);

        ctx.moveTo(angle.center.x, angle.center.y);

        ctx.arc(angle.center.x, angle.center.y, angleRequest.yarıÇap ?? radius, angle.start, angle.end, angle.diff < 0);

        ctx.closePath();

        const currentAngleColorID = angleRequest.renkID ?? angleColorID;
        const currentAngleColor = globalData.renkler[currentAngleColorID].rgba ?? angleColor;

        const color = `rgba(${currentAngleColor[0]}, ${currentAngleColor[1]}, ${currentAngleColor[2]}, ${currentAngleColor[3]})`;;

        ctx.fillStyle = color;
        ctx.fill();

        const angleValue = angleRequest.değer;

        const textDistance =
            angleRequest.yazıUzaklığı ??
            polygonData.yazıUzaklığı ??
            globalData.yazıUzaklığı ??
            35;

        const xDir = angle.direction.x *
            (angleRequest.yönXYazı ?? polygonData.yönXYazı ?? globalData.yönXYazı ?? 1.4);

        const yDir = angle.direction.y *
            (angleRequest.yönYYazı ?? polygonData.yönYYazı ?? globalData.yönYYazı ?? 1);

        const x = angle.center.x + xDir * textDistance;
        const y = angle.center.y + yDir * textDistance;

        ctx.save();
        ctx.font = angleRequest.yazıFontu ??
            polygonData.yazıFontu ??
            globalData.yazıFontu ??
            "20px Arial";

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (angleValue !== undefined && angleValue !== null) {
            ctx.fillText(String(angleValue), x, y);
        }

        ctx.restore();

        const currentAngleShapeType = angleRequest.şekil;

        if (currentAngleShapeType) {
            const shapeSize = angleRequest.şekilBoyutu ?? polygonData.şekilBoyutu ?? 20;
            const shapeDistance = angleRequest.şekilUzaklığı ?? polygonData.şekilUzaklığı ?? -50;

            const xDir = -angle.direction.x * (angleRequest.yönXŞekil ?? 1);;
            const yDir = -angle.direction.y * (angleRequest.yönYŞekil ?? 1);;;

            const x = angle.center.x + xDir * shapeDistance;
            const y = angle.center.y + yDir * shapeDistance;

            const halfSize = shapeSize / 2;

            let fillDraw = true;
            if (currentAngleShapeType === "triangle") {
                ctx.beginPath();
                ctx.moveTo(x, y - halfSize);
                ctx.lineTo(x - halfSize, y + halfSize);
                ctx.lineTo(x + halfSize, y + halfSize);
                ctx.closePath();
            }
            else if (currentAngleShapeType === "square" || currentAngleShapeType === "rect") {
                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    shapeSize,
                    shapeSize
                );
            }
            else if (currentAngleShapeType === "circle") {
                ctx.beginPath();
                ctx.arc(
                    x,
                    y,
                    halfSize,
                    0,
                    Math.PI * 2
                );
            }
            else if (currentAngleShapeType === "emptyTriangle") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.moveTo(x, y - halfSize);
                ctx.lineTo(x - halfSize, y + halfSize);
                ctx.lineTo(x + halfSize, y + halfSize);
                ctx.closePath();
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentAngleShapeType === "emptySquare" || currentAngleShapeType === "emptyRect") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    shapeSize,
                    shapeSize
                );
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentAngleShapeType === "emptyCircle") {
                const borderSize = halfSize / 2;
                ctx.beginPath();
                ctx.arc(
                    x,
                    y,
                    halfSize,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            else if (currentAngleShapeType === "empty") {
                const borderSize = halfSize / 2;

                ctx.beginPath();
                ctx.rect(
                    x - halfSize,
                    y - halfSize,
                    halfSize * 2,
                    halfSize * 2
                );

                ctx.lineWidth = borderSize;
                ctx.strokeStyle = color;
                ctx.stroke();
                fillDraw = false;
            }
            if (fillDraw) {
                ctx.lineWidth = polygonData.şekilÇizgiKalınlığı ?? 2;
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

    });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} color
 */
function drawLock(ctx, x, y, size = 12, color = "black") {
    const w = size * 0.65;
    const bodyH = size * 0.55;
    const bodyY = y + size * 0.05;
    const shackleR = w * 0.35;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.09);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.arc(
        x,
        bodyY,
        shackleR,
        Math.PI,
        0,
        false
    );
    ctx.lineTo(x + shackleR, bodyY + size * 0.12);
    ctx.moveTo(x - shackleR, bodyY);
    ctx.lineTo(x - shackleR, bodyY + size * 0.12);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(
        x - w / 2,
        bodyY + size * 0.12,
        w,
        bodyH
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
        x,
        bodyY + size * 0.29,
        size * 0.07,
        0,
        Math.PI * 2
    );
    ctx.moveTo(x, bodyY + size * 0.34);
    ctx.lineTo(x, bodyY + size * 0.43);
    ctx.stroke();

    ctx.restore();
}