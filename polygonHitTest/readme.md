# Üçgen ve Çokgen hit test için kullanımı 

## ÇİZİM İÇİN GEREKEN VERİYİ KULLANIYOR

## Örnek

```html 
...
    <canvas id="test" width="800" height="600"></canvas>
...
```

```js 
import {createHitTesterForPolygon} from "polygonHitTest/hitTest.js"
import {renderPolygon} from "polygonRender/render.js"

const data = {
    kenarKalınlığı: 2,
    köşeler: [
        { x: 0.2, y: 0.1},
        { x: 0.2, y: -0.1},
        { x: -0.2, y: -0.1 }
    ],
    kenarlar: [
        { v1: 0, v2: 1},
        { v1: 1, v2: 2},
        { v1: 2, v2: 0},
    ],
    açılar: [
        { 
            "edge1": 0,
            "edge2": 1
        },
        { 
            "edge1": 1,
            "edge2": 2
        },
        { 
            "edge1": 2,
            "edge2": 0
        },
    ]
};

renderPolygon("test", data);
createHitTesterForPolygon("test", data)

document.addEventListener("PolygonAngleHit", (hit) => { console.log("Angle:" + hit.detail.id); })
document.addEventListener("PolygonEdgeHit", (hit) => { console.log("Edge: " + hit.detail.id); })

```