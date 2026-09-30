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


export function getCommonVertex(edge1, edge2)
{
    if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2)
        return edge1.v1;
    if (edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2)
        return edge1.v2;
    return -1;
}
/**
 * 
 * @param {EdgeObject} edge1 
 * @param {EdgeObject} edge2 
 * @param {VertexObject[]} vertices 
 * @param {HTMLCanvasElement} canvas 
 * @returns {AngleObject}
 */
export function getAngle(edge1, edge2, vertices, canvas)
{
    if(edge1.v1 >= vertices.length)
    {
        throw new Error("[renderAngles::getAngle] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge1.v1 + " : [RANGE] : " + (vertices.length - 1));
    }
    if(edge1.v2 >= vertices.length)
    {
        throw new Error("[renderAngles::getAngle] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge1.v2 + " : [RANGE] : " + (vertices.length - 1));
    }
    if(edge2.v1 >= vertices.length)
    {
        throw new Error("[renderAngles::getAngle] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge2.v1 + " : [RANGE] : " + (vertices.length - 1));
    }
    if(edge2.v2 >= vertices.length)
    {
        throw new Error("[renderAngles::getAngle] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge2.v2 + " : [RANGE] : " + (vertices.length - 1));
    }

    const commonVertexID = getCommonVertex(edge1, edge2);
    if(commonVertexID === -1)
    {
        throw new Error("[renderAngles::getAngle] passed edges don't have a common vertex : [EDGE1] : " + edge1 + " : [EDGE2] : " + edge2);
    }
    const commonVertex = toScreenCoordObj(vertices[commonVertexID], canvas);

    const otherVertexID1 = (edge1.v1 === commonVertexID) ? (edge1.v2) : (edge1.v1);
    const otherVertex1 = toScreenCoordObj(vertices[otherVertexID1], canvas);
    
    const startAngle = Math.atan2(otherVertex1.y - commonVertex.y, otherVertex1.x - commonVertex.x);

    const otherVertexID2 = (edge2.v1 === commonVertexID) ? (edge2.v2) : (edge2.v1);
    const otherVertex2 = toScreenCoordObj(vertices[otherVertexID2], canvas);

    const endAngle = Math.atan2(otherVertex2.y - commonVertex.y, otherVertex2.x - commonVertex.x);

    return {
        center: commonVertex,
    
        start: startAngle,
        end: endAngle
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