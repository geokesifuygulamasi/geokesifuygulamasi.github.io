/**
 * @typedef {Object} VertexObject
 * @property  {number} x 
 * @property  {number} y
 */

/**
 * @typedef {Object} EdgeObject
 * @property  {VertexObject} v1
 * @property  {VertexObject} v2
 */

/**
 * @typedef {Object} AngleObject
 * @property  {VertexObject} center
 * @property  {number} start
 * @property  {number} end
 */


/**
 * 
 * @param {EdgeObject} edge1 
 * @param {EdgeObject} edge2 
 *
 * iki kenar arasındaki ortak köşeyi döndürüyor eğer yoksa -1
 */
export function getCommonVertex(edge1, edge2)
{
    if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2)
        return edge1.v1;
    if (edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2)
        return edge1.v2;
    return -1;
}
/**
 * @param {EdgeObject} edge2
 * @param {VertexObject[]} vertices
 * @param {HTMLCanvasElement} canvas
 * @returns {AngleObject}
 */
export function getAngle(edge1, edge2, vertices, canvas)
{
    if (edge1.v1 >= vertices.length)
        throw new Error("[getAngle] edge1.v1 out of range : " + edge1.v1 + " : " + (vertices.length - 1));
    if (edge1.v2 >= vertices.length)
        throw new Error("[getAngle] edge1.v2 out of range : " + edge1.v2 + " : " + (vertices.length - 1));
    if (edge2.v1 >= vertices.length)
        throw new Error("[getAngle] edge2.v1 out of range : " + edge2.v1 + " : " + (vertices.length - 1));
    if (edge2.v2 >= vertices.length)
        throw new Error("[getAngle] edge2.v2 out of range : " + edge2.v2 + " : " + (vertices.length - 1));

    const commonVertexID = getCommonVertex(edge1, edge2);
    if (commonVertexID === -1)
        throw new Error("[getAngle] passed edges don't have a common vertex");

    const otherVertexID1 = (edge1.v1 === commonVertexID) ? edge1.v2 : edge1.v1;
    const otherVertexID2 = (edge2.v1 === commonVertexID) ? edge2.v2 : edge2.v1;

    const P = toScreenCoordObj(vertices[commonVertexID], canvas);
    const A = toScreenCoordObj(vertices[otherVertexID1], canvas);
    const B = toScreenCoordObj(vertices[otherVertexID2], canvas);

    const a1 = Math.atan2(A.y - P.y, A.x - P.x);
    const a2 = Math.atan2(B.y - P.y, B.x - P.x);

    let diff = a2 - a1;
    while (diff > Math.PI)  diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    const v1x = A.x - P.x, v1y = A.y - P.y;
    const v2x = B.x - P.x, v2y = B.y - P.y;
    const l1 = Math.hypot(v1x, v1y);
    const l2 = Math.hypot(v2x, v2y);

    let degree = 0;
    if (l1 > 1e-9 && l2 > 1e-9)
    {
        const c = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (l1 * l2)));
        degree = Math.acos(c) * 180 / Math.PI;
    }

    const bis = a1 + diff / 2;
    const direction =
    {
        x: Math.cos(bis),
        y: Math.sin(bis)
    };

    return {
        center: P,
        start: a1,
        end:   a1 + diff,
        diff:  diff,
        degree: degree,
        direction: direction,
        commonVertexID: commonVertexID
    };
}
/**
 * @param {number} x
 * @param {number} y 
 * @param {HTMLCanvasElement} canvas 
 */
export function toScreenCoord(x, y, canvas)
{   
    const xOut = (x + 1) / 2 * canvas.width;
    const yOut = (1 - y) / 2 * canvas.height;
    return {
        x: xOut,
        y: yOut
    };
}
/**
 * @param {Object} coord 
 * @param {HTMLCanvasElement} canvas 
 */
export function toScreenCoordObj(coord, canvas)
{
    const x = (coord.x + 1) / 2 * canvas.width;
    const y = (1 - coord.y) / 2 * canvas.height;
    return {
        x: x,
        y: y
    };
}

/**
 * @param {number} x
 * @param {number} y 
 * @param {HTMLCanvasElement} canvas 
 */
export function fromScreenCoord(x, y, canvas)
{   
    const xOut = (x / canvas.width) * 2 - 1;
    const yOut = -((y / canvas.height) * 2) + 1;

    return {
        x: xOut,
        y: yOut
    };
}
/**
 * @param {Object} coord 
 * @param {HTMLCanvasElement} canvas 
 */
export function fromScreenCoordObj(coord, canvas)
{
    const x = (coord.x / canvas.width) * 2 - 1;
    const y = -((coord.y / canvas.height) * 2) + 1;
    return {
        x: x,
        y: y
    };
}