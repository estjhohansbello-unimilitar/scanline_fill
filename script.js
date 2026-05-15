/**
 * ============================================================
 * ALGORITMO SCANLINE FILL
 * ============================================================
 */

class ScanlineFill {

    /**
     * Constructor
     */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Método principal
     */
    fill(polygon, color = "black") {

        // ====================================================
        // 1. EDGE TABLE (ET)
        // ====================================================

        const edgeTable = {};
        const n = polygon.length;

        for (let i = 0; i < n; i++) {

            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % n];

            // Ignorar líneas horizontales
            if (p1.y === p2.y) {
                continue;
            }

            let ymin, ymax, xAtYmin, invSlope;

            if (p1.y < p2.y) {

                ymin = p1.y;
                ymax = p2.y;

                xAtYmin = p1.x;

                // dx/dy
                invSlope = (p2.x - p1.x) / (p2.y - p1.y);

            } else {

                ymin = p2.y;
                ymax = p1.y;

                xAtYmin = p2.x;

                invSlope = (p1.x - p2.x) / (p1.y - p2.y);
            }

            // Crear bucket si no existe
            if (!edgeTable[ymin]) {
                edgeTable[ymin] = [];
            }

            // Insertar arista
            edgeTable[ymin].push({
                ymax,
                x: xAtYmin,
                invSlope
            });
        }

        // ====================================================
        // 2. RANGO VERTICAL
        // ====================================================

        const ys = polygon.map(p => p.y);

        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        // ====================================================
        // 3. ACTIVE EDGE TABLE (AET)
        // ====================================================

        let activeEdgeTable = [];

        this.ctx.fillStyle = color;

        // ====================================================
        // 4. RECORRER SCANLINES
        // ====================================================

        for (let y = minY; y <= maxY; y++) {

            // Agregar nuevas aristas
            if (edgeTable[y]) {
                activeEdgeTable.push(...edgeTable[y]);
            }

            // Eliminar aristas terminadas
            activeEdgeTable = activeEdgeTable.filter(
                edge => edge.ymax > y
            );

            // Ordenar por X
            activeEdgeTable.sort((a, b) => a.x - b.x);

            // =================================================
            // RELLENAR ENTRE PARES
            // =================================================

            for (let i = 0; i < activeEdgeTable.length; i += 2) {

                if (i + 1 >= activeEdgeTable.length) {
                    break;
                }

                const xStart = Math.ceil(activeEdgeTable[i].x);
                const xEnd = Math.floor(activeEdgeTable[i + 1].x);

                // Dibujar línea horizontal
                this.ctx.fillRect(
                    xStart,
                    y,
                    xEnd - xStart + 1,
                    1
                );
            }

            // =================================================
            // ACTUALIZAR X
            // =================================================

            for (const edge of activeEdgeTable) {
                edge.x += edge.invSlope;
            }
        }
    }
}

/**
 * ============================================================
 * EJEMPLO DE USO
 * ============================================================
 */

// Obtener canvas
const canvas = document.getElementById("canvas");

// Contexto 2D
const ctx = canvas.getContext("2d");

// Crear instancia
const scanline = new ScanlineFill(ctx);

// ============================================================
// DEFINIR POLÍGONO
// ============================================================

const polygon = [
    { x: 100, y: 100 },
    { x: 300, y: 120 },
    { x: 350, y: 250 },
    { x: 250, y: 350 },
    { x: 120, y: 300 }
];

// ============================================================
// DIBUJAR CONTORNO
// ============================================================

ctx.beginPath();

ctx.moveTo(polygon[0].x, polygon[0].y);

for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
}

ctx.closePath();

ctx.strokeStyle = "red";
ctx.lineWidth = 2;

ctx.stroke();

// ============================================================
// APLICAR SCANLINE FILL
// ============================================================

scanline.fill(polygon, "skyblue");