// game/src/map/HexGridUtils.ts
type HexCoordinate = { q: number; r: number };

export class HexGridUtils {
    private static directions = [
        [1, 0], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [0, 1]
    ];

    /**
     * 获取邻居单元格
     * @param q 列坐标
     * @param r 行坐标
     * @returns 邻居单元格坐标
     */
    static getNeighbors(q: number, r: number): HexCoordinate[] {
        return this.directions.map(([dq, dr]) => ({
            q: q + dq,
            r: r + dr
        }));
    }

    /**
     * 计算两个单元格之间的距离
     * @param a 单元格A
     * @param b 单元格B
     * @returns 距离
     */
    static getDistance(a: HexCoordinate, b: HexCoordinate): number {
        return (Math.abs(a.q - b.q)
            + Math.abs(a.q + a.r - b.q - b.r)
            + Math.abs(a.r - b.r)) / 2;
    }

    /**
     * 生成六边形网格
     * @param width 宽度
     * @param height 高度
     * @returns 六边形网格坐标
     */
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