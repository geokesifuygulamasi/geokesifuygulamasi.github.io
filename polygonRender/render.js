import { getAngle, toScreenCoordObj } from "../polygon/helper.js";

/**
 * @param {string} elementID
 * @param {Object} polygonData
 */
export function renderPolygon(elementID, polygonData)
{
    const canvas = document.getElementById(elementID)
    if(!canvas)
    {
        throw new Error("[renderPolygon] passed non-existing elementID : [ELEMENT_ID] : " + elementID);
    }
    else if(!(canvas instanceof HTMLCanvasElement))
    {
        throw new Error("[renderPolygon] passed a non <canvas> element : [ELEMENT_ID] : " + elementID);
    }

    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");
    if (!ctx)
    {
        throw new Error("[renderPolygon] failed to get 2D rendering context");
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderWirePolygon(ctx, polygonData, canvas);
    renderAngles(ctx, polygonData, canvas);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} polygonData
 * @param {HTMLCanvasElement} canvas
 */
function renderWirePolygon(ctx, polygonData, canvas)
{

    /** @type {Object[]} */
    const vertices = polygonData.köşeler;

    /** @type {Object[]} */
    const edges = polygonData.kenarlar;

    /** @type {number} */

    const lineWidth = polygonData.kenarKalınlığı ?? 2;
    const strokeStyle = polygonData.kenarÇizmeStili ?? "black";

    edges.forEach((edge) =>
    {
        if(edge.v1 >= vertices.length)
        {
            throw new Error("[renderPolygon] passed a vertex index that is out of range : [VERTEX_INDEX] : " + edge.v1 + " : [RANGE] : " + (vertices.length - 1));
        }
        if(edge.v2 >= vertices.length)
        {
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

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        ctx.lineWidth = edge.kenarKalınlığı ?? lineWidth;
        ctx.strokeStyle = edge.çizmeStili ?? strokeStyle;

        ctx.stroke();    
    });
}
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} polygonData
 * @param {HTMLCanvasElement} canvas
 */
function renderAngles(ctx, polygonData, canvas)
{
    /** @type {Object[]} */
    const vertices = polygonData.köşeler;
    
    /** @type {Object[]} */
    const edges = polygonData.kenarlar;

    /** @type {Object[]} */
    const angles = polygonData.açılar ?? [];

    const radius = polygonData.açıYarıÇapı ?? 30;
    const fillStyle = polygonData.açıDoldurmaStili ?? "rgba(167, 227, 111, 0.25)";

    

    angles.forEach((angleRequest) => 
    {
        ctx.beginPath();

        /** @param {number} */
        const edge1 = angleRequest.edge1;
        if(edge1 >= edges.length)
        {
            throw new Error("[renderAngles::getAngle] passed an edge index that is out of range : [EDGE_INDEX] : " + edge1 + " : [RANGE] : " + (edges.length - 1));
        }
        /** @param {number} */
        const edge2 = angleRequest.edge2;
        if(edge2 >= edges.length)
        {
            throw new Error("[renderAngles::getAngle] passed an edge index that is out of range : [EDGE_INDEX] : " + edge2 + " : [RANGE] : " + (edges.length - 1));
        }

        const angle = getAngle(edges[edge1], edges[edge2], vertices, canvas);

        ctx.moveTo(angle.center.x, angle.center.y);

        ctx.arc(angle.center.x, angle.center.y, angleRequest.yarıÇap ?? radius, angle.start, angle.end, true);

        ctx.closePath();    

        ctx.fillStyle = angleRequest.doldurmaStili ?? fillStyle;
        ctx.fill();
    });
}

