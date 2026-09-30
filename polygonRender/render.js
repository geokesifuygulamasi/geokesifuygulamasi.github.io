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

    function getAngle(edge1, edge2)
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
        function getCommonVertex(edge1, edge2)
        {
            if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2)
                return edge1.v1;

            if (edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2)
                return edge1.v2;

            return -1;
        }

        const commonVertexID = getCommonVertex(edge1, edge2);
        if(commonVertexID === -1)
        {
            throw new Error("[renderAngles::getAngle] passed edges don't have a common vertex : [EDGE1] : " + edge1 + " : [EDGE2] : " + edge2);
        }
        const commonVertex = vertices[commonVertexID];

        const otherVertexID1 = (edge1.v1 === commonVertexID) ? (edge1.v2) : (edge1.v1);
        const otherVertex1 = vertices[otherVertexID1];
        
        const startAngle = Math.atan2(otherVertex1.y - commonVertex.y, otherVertex1.x - commonVertex.x);

        const otherVertexID2 = (edge2.v1 === commonVertexID) ? (edge2.v2) : (edge2.v1);
        const otherVertex2 = vertices[otherVertexID2];
        const endAngle = Math.atan2(otherVertex2.y - commonVertex.y, otherVertex2.x - commonVertex.x);


        return {
            center: commonVertex,
        
            start: startAngle,
            end: endAngle
        };
    }

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

        const angle = getAngle(edges[edge1], edges[edge2]);
        const center = toScreenCoordObj(angle.center, canvas);

        ctx.moveTo(center.x, center.y);

        ctx.arc(center.x, center.y, angleRequest.yarıÇap ?? radius, angle.start, angle.end);

        ctx.closePath();    

        ctx.fillStyle = angleRequest.doldurmaStili ?? fillStyle;
        ctx.fill();
    });
}

/**
 * @param {number} x
 * @param {number} y 
 * @param {HTMLCanvasElement} canvas 
 */
function toScreenCoord(x, y, canvas)
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
function toScreenCoordObj(coord, canvas)
{
    const x = (coord.x + 1) / 2 * canvas.width;
    const y = (1 - coord.y) / 2 * canvas.height;
    return {
        x: x,
        y: y
    };
}