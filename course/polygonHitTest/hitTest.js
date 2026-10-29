import { getAngle, toScreenCoordObj } from "../polygon/helper.js";

/**
 * @param {string} elementID
 */
export function createHitTesterForPolygon(elementID, angleEnabled, edgeEnabled) {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById(elementID);
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("[createHitTesterForPolygon] passed a non <canvas> element : [ELEMENT_ID] : " + elementID);
    }

    let globalData = JSON.parse(localStorage.getItem("courses"));
    let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
    if (localStorage.getItem("question") !== null) {
        polygonData = polygonData.sorular[Number.parseInt(localStorage.getItem("question"))]
    }

    /** @type {Object[]} */
    const vertices = polygonData.köşeler ?? [];
    /** @type {Object[]} */
    const edges = polygonData.kenarlar ?? [];
    /** @type {Object[]} */
    const angles = polygonData.açılar ?? [];

    const defaultRadius = polygonData.açıYarıÇapı ?? 45;
    const defaultLineWidth = polygonData.kenarKalınlığı ?? 2;

    // --- Hit test toleransları (px) ---
    const ANGLE_TOLERANCE = globalData.açıToleransı ?? polygonData.açıToleransı ?? 14; // arc'ın çevresinde bu kadar piksel bandı
    const MIN_ANGLE_RADIUS = 6;  // merkeze çok yakın tıklamaları yoksay
    const EDGE_MIN_TOL = globalData.kenarToleransı ?? polygonData.kenarToleransı ?? 50;  // ince kenarların bile rahat tıklanabilmesi için
    // Önceki listener varsa kaldır (idempotent)
    if (canvas._geoHitTestHandler) {
        canvas.removeEventListener("pointerdown", canvas._geoHitTestHandler);
        canvas._geoHitTestHandler = null;
    }

    const handler = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;

        let bestAngleID = -1;
        let bestAngleScore = Infinity;

        let globalData = JSON.parse(localStorage.getItem("courses"));
        let polygonData = globalData.kurslar[Number.parseInt(localStorage.getItem("course"))];
        if (localStorage.getItem("question") !== null) {
            polygonData = polygonData.sorular[Number.parseInt(localStorage.getItem("question"))]
        }

        /** @type {Object[]} */
        const vertices = polygonData.köşeler ?? [];
        /** @type {Object[]} */
        const edges = polygonData.kenarlar ?? [];
        /** @type {Object[]} */
        const angles = polygonData.açılar ?? [];

        if (angleEnabled) {
            for (let id = 0; id < angles.length; id++) {
                const req = angles[id];
                if ((!req.doğruŞekil && !req.doğruRenkID))
                    continue;

                if (req.doğruŞekil != null) {
                    if (req.şekil == req.doğruŞekil)
                        continue;
                    console.log("shape");

                    console.log(req.doğruŞekil);
                    console.log(req.şekil);

                }
                if (req.doğruRenkID != null) {
                    if (req.renkID == req.doğruRenkID)
                        continue;
                    console.log("color");

                    console.log(req.doğruRenkID);
                    console.log(req.renkID);
                }


                const b1 = req.doğruŞekil ? req.doğruŞekil == req.şekil : true;
                const b2 = req.doğruRenkID ? req.doğruRenkID == req.renkID : true;
                if (b1 && b2)
                    continue;
                const angle = getAngle(edges[req.edge1], edges[req.edge2], vertices, canvas);
                if (!angle) continue;

                const baseRadius =
                    (req.yarıÇap ?? defaultRadius) +
                    (req.şekilUzaklığı ?? polygonData.şekilUzaklığı ?? 0);
                const radius = Math.max(16, baseRadius);

                const score = angleHitScore(mx, my, angle, radius * 10, ANGLE_TOLERANCE, MIN_ANGLE_RADIUS);
                if (score >= 0 && score < bestAngleScore) {
                    bestAngleScore = score;
                    bestAngleID = id;
                }
            }

            console.log(bestAngleID);

            if (bestAngleID !== -1) {
                document.dispatchEvent(new CustomEvent("PolygonAngleHit", { detail: { id: bestAngleID } }));
                return;
            }
        }

        if (edgeEnabled) {
            let bestEdgeID = -1;
            let bestEdgeScore = Infinity;

            for (let id = 0; id < edges.length; id++) {
                const edge = edges[id];

                if ((!edge.doğruŞekil && !edge.doğruRenkID))
                    continue;

                if (edge.doğruŞekil && edge.doğruŞekil === edge.şekil)
                    continue;
                if (edge.doğruRenkID && edge.renkID === edge.şekil)
                    continue;

                const width = edge.kenarKalınlığı ?? defaultLineWidth;
                const tol = Math.max(width * 3, EDGE_MIN_TOL);

                const v1 = vertices[edge.v1];
                const v2 = vertices[edge.v2];
                if (!v1 || !v2) continue;

                let c1 = toScreenCoordObj(v1, canvas);
                let c2 = toScreenCoordObj(v2, canvas);

                const d = pointSegmentDistance(mx, my, c1.x, c1.y, c2.x, c2.y);

                if (d <= tol && d < bestEdgeScore) {
                    bestEdgeScore = d;
                    bestEdgeID = id;
                }
            }

            if (bestEdgeID !== -1) {
                document.dispatchEvent(new CustomEvent("PolygonEdgeHit", { detail: { id: bestEdgeID } }));
                return;
            }
        }

        document.dispatchEvent(new CustomEvent("PolygonMiss"));
    };

    canvas._geoHitTestHandler = handler;
    canvas.addEventListener("pointerdown", handler);
}

/* ============================================================
   YARDIMCILAR
   ============================================================ */

/**
 * Bir tıklamanın verilen açıya ne kadar iyi denk geldiğini döndürür.
 * Uymuyorsa -1, uyuyorsa küçük pozitif sayı (küçük = daha iyi).
 *
 * Kontroller:
 *   1) Tıklama açının yarıçapı civarında mı? (arc bandı)
 *   2) Tıklama yönü açının sektörü içinde mi? (start → end, diff yönünde)
 *
 * @param {number} mx
 * @param {number} my
 * @param {{center:{x:number,y:number}, start:number, end:number, diff:number}} angle
 * @param {number} radius
 * @param {number} tolerance
 * @param {number} minRadius
 * @returns {number}
 */
function angleHitScore(mx, my, angle, radius, tolerance, minRadius) {
    const dx = mx - angle.center.x;
    const dy = my - angle.center.y;
    const dist = Math.hypot(dx, dy);

    // Merkeze çok yakın → ayırt edilemez, yoksay
    if (dist < minRadius) return -1;

    // Arc bandının dışında mı?
    if (dist > radius + tolerance) return -1;

    // Tıklamanın açı yönü
    const mouseAngle = Math.atan2(dy, dx);

    let diff = mouseAngle - angle.start;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    // angle.diff yönüne göre sektör içi kontrolü
    const inside = (angle.diff >= 0)
        ? (diff >= 0 && diff <= angle.diff)
        : (diff <= 0 && diff >= angle.diff);

    if (!inside) return -1;

    // Skor: arc çizgisine ne kadar yakın + açıortaya ne kadar yakın
    const arcDist = Math.abs(dist - radius);

    const halfDiff = Math.abs(angle.diff) / 2;
    let bisectorBonus = 0;
    if (halfDiff > 1e-6) {
        const offBisector = Math.abs(diff - angle.diff / 2); // 0 = tam ortada
        bisectorBonus = (1 - offBisector / halfDiff) * 6;    // [0, 6] arası bonus
    }

    // Küçük skor = daha iyi eşleşme
    return arcDist - bisectorBonus;
}

/**
 * Noktanın doğru parçasına en kısa mesafesini döndürür.
 * @returns {number}
 */
function pointSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const cx = x1 + t * dx;
    const cy = y1 + t * dy;

    return Math.hypot(px - cx, py - cy);
}