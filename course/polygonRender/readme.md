# Üçgen ve Çokgen çizimi için kullanımı 

## çizim için gereken giriş verisi

```json
{
    "kenarKalınlığı": 2, // Opsiyonel default 2
    "kenarÇizmeStili": "black", // Opsiyonel default black
    "açıYarıÇapı": 25, // Opsiyonel default 30
    "açıDoldurmaStili": "rgba(227, 167, 111, 0.25)", // Opsiyonel default rgba(167, 227, 111, 0.25)

    "köşeler": [
        { "x": 0.2, "y": 0.1},
        { "x": 0.2, "y": -0.1},
        { "x": -0.2, "y": -0.1}
    ],
    "kenarlar": [
        { "v1": 0, "v2": 1, "çizmeStili": "black" /* Opsiyonel default rootdaki kenarRengi */},
        { "v1": 1, "v2": 2, "kenarKalınlığı": 4 /* Opsiyonel default rootdaki kenarKalınlığı */},
        { "v1": 2, "v2": 0},
    ],
    "açılar": [
        { 
            "edge1": 0,
            "edge2": 1,
            "doldurmaStili": "rgba(227, 167, 111, 0.25)", // Opsiyonel default rootdaki açıRengi
            "yarıÇap": 30 // Opsiyonel default rootdaki açıYarıÇapı
        },
    ],
}
```

### ÖNEMLİ
-> Koordinat sistemi NDC yani x de en sol -1 en sağ 1 y de en üst 1 en alt -1

-> kenarlar köşelere 0-indexed biçimde referans ediyor

-> açılar kenarlara 0-indexed biçimde referans ediyor


## Örnek

```html 
...
    <canvas id="test" width="800" height="600"></canvas>
...
```

```js 
import {renderPolygon} from "polygonRender/render.js"

const data = {
    kenarKalınlığı: 2,
    köşeler: [
        { x: 0.2, y: 0.1},
        { x: 0.2, y: -0.1},
        { x: -0.2, y: -0.1}
    ],
    kenarlar: [
        { v1: 0, v2: 1},
        { v1: 1, v2: 2},
        { v1: 2, v2: 0},
    ],
    açılar:  [
        { 
            "edge1": 0,
            "edge2": 1
        },
    ]
};
renderPolygon("test", data);
```