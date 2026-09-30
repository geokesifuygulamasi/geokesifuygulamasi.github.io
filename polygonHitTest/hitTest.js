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
    const vertices = polygonData.köşeler;
    
    /** @type {Object[]} */
    const edges = polygonData.kenarlar;

    /** @type {Object[]} */
    const angles = polygonData.açılar ?? [];

    const radius = polygonData.açıYarıÇapı ?? 30;

    canvas.addEventListener("pointerdown", (event) => 
    {
        const rect = canvas.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        angles.forEach((value, id) => 
        {
            const checkRadius = value.yarıÇap ?? radius;

            const angle = getAngle(edges[value.edge1], edges[value.edge2], vertices, canvas);

            const dist = distance({x: x, y: y}, angle.center)

            
            if(dist < checkRadius)
            {
                console.log(dist);
                document.dispatchEvent(new CustomEvent("PolygonAngleHit", {detail: { id: id }}))
                return;
            }

        });
        
    });
}

function distance(a, b)
{
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
}