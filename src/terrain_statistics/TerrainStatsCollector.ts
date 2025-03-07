import { HexCell } from "@/terrain/HexCell";
import { eResource, eTerrain } from "@/terrain/enums";
import { MapStatistics, StatValue } from "./TerrainStatsTypes";


export class TerrainStatsCollector {
    collect(cells: HexCell[]): MapStatistics {
        const stats = new Map<string, StatValue>();

        // 计算地形数量
        const counts = new Map<eTerrain, number>();
        cells.forEach(cell => {
            const terrain = cell.data.terrainType;
            counts.set(terrain, (counts.get(terrain) || 0) + 1);
        });
        stats.set("terrain/counts", counts);

        // 计算地形比例
        const proportions = new Map<eTerrain, number>();
        const totalCells = cells.length;
        counts.forEach((count, terrain) => {
            proportions.set(terrain, count / totalCells);
        });
        stats.set("terrain/proportions", proportions);

        return stats;
    }
}

/** 资源统计器 */
export class ResourceStatsCollector {
    collect(cells: HexCell[]): MapStatistics {
        const stats = new Map<string, StatValue>();

        // 计算资源数量
        const counts = new Map<eResource, number>();
        cells.forEach(cell => {
            const resource = cell.data.resourceType;
            if (resource !== null) {
                counts.set(resource, (counts.get(resource) || 0) + 1);
            }
        });
        stats.set("resources/counts", counts);

        return stats;
    }
}

/** 河流统计器 */
export class RiverStatsCollector {
    collect(cells: HexCell[]): MapStatistics {
        const stats = new Map<string, StatValue>();

        // 计算河流数量
        let riverCount = 0;
        cells.forEach(cell => {
            if (cell.data.riverLevel > 0) riverCount++;
        });
        stats.set("rivers/count", riverCount);

        return stats;
    }
}

/** 气候带统计器 */
export class ClimateZoneStatsCollector {
    collect(cells: HexCell[]): MapStatistics {
        const stats = new Map<string, StatValue>();

        // 计算气候带分布
        const zones = new Map<string, number>();
        cells.forEach(cell => {
            const key = `${cell.data.heightLevel}-${cell.data.humidityLevel}`;
            zones.set(key, (zones.get(key) || 0) + 1);
        });
        stats.set("climate/zones", zones);

        return stats;
    }
}