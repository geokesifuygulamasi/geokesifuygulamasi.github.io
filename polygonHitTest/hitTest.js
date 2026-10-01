import { fromScreenCoord, fromScreenCoordObj, getAngle, toScreenCoordObj } from "../polygon/helper.js";

/**
 * @param {string} elementID
 * @param {Object} polygonData
 */
export function createHitTesterForPolygon(elementID, polygonData)
{
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById(elementID)
    if(!canvas)
    {
        throw new Error("[createHitTesterForPolygon] passed non-existing elementID : [ELEMENT_ID] : " + elementID);
    }
    else if(!(canvas instanceof HTMLCanvasElement))
    {
        throw new Error("[createHitTesterForPolygon] passed a non <canvas> element : [ELEMENT_ID] : " + elementID);
    }

    /** @type {Object[]} */
    const vertices = polygonData.köşeler ?? [];
    
    /** @type {Object[]} */
    const edges = polygonData.kenarlar ?? [];

    /** @type {Object[]} */
    const angles = polygonData.açılar ?? [];

    const radius = polygonData.açıYarıÇapı ?? 30;

    const lineWidth = polygonData.kenarKalınlığı ?? 2;

    canvas.addEventListener("pointerdown", (event) => 
    {
        const rect = canvas.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let minDist = Infinity;
        let sendID = 0;


        angles.forEach((value, id) => 
        {
            const checkRadius = value.yarıÇap ?? radius;

            const angle = getAngle(edges[value.edge1], edges[value.edge2], vertices, canvas);

            const dist = distance({x: x, y: y}, angle.center)

            if(dist < checkRadius)
            {
                if(dist < minDist)
                {
                    minDist = dist;
                    sendID = id;
                }
            }
        });


        if(minDist !== Infinity)
        {
            document.dispatchEvent(new CustomEvent("PolygonAngleHit", {detail: { id: sendID }}));
            return;
        }

        edges.forEach((edge, id) => 
        {
            const width = edge.kenarKalınlığı ?? lineWidth;

            const v1 = vertices[edge.v1]
            const v2 = vertices[edge.v2]

            const coord1 = toScreenCoordObj(v1, canvas)

            const x1 = coord1.x;
            const y1 = coord1.y
            
            const coord2 = toScreenCoordObj(v2, canvas)

            const x2 = coord2.x;
            const y2 = coord2.y

            if(pointOnLine(x, y, x1, y1, x2, y2, width))
            {
                document.dispatchEvent(new CustomEvent("PolygonEdgeHit", {detail: { id: id }}));
                return;
            }
        });
    });
}

function pointOnLine(px, py, x1, y1, x2, y2, width)
{
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lengthSquared = dx * dx + dy * dy;

    if(lengthSquared === 0)
    {
        const distX = px - x1;
        const distY = py - y1;

        return Math.sqrt(distX * distX + distY * distY) <= width / 2;
    }


    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const distX = px - closestX;
    const distY = py - closestY;

    return Math.sqrt(distX * distX + distY * distY) <= width / 2;
}

function distance(a, b)
{
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}