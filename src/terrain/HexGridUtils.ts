type HexCoordinate = { q: number; r: number };

export class HexGridUtils {
    private static directions = [
        [1, 0], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [0, 1]
    ];

    static getNeighbors(q: number, r: number): HexCoordinate[] {
        return this.directions.map(([dq, dr]) => ({
            q: q + dq,
            r: r + dr
        }));
    }

    static getDistance(a: HexCoordinate, b: HexCoordinate): number {
        return (Math.abs(a.q - b.q)
            + Math.abs(a.q + a.r - b.q - b.r)
            + Math.abs(a.r - b.r)) / 2;
    }

    static generateHexGrid(width: number, height: number): HexCoordinate[] {
        const grid: HexCoordinate[] = [];
        for (let q = 0; q < width; q++) {
            const offset = q >> 1;
            for (let r = -offset; r < height - offset; r++) {
                grid.push({ q, r });
            }
        }
        return grid;
    }
}