import { HexCell } from "@/terrain/HexCell";
import { eResource, eTerrain } from "@/terrain/enums";
import { ClimateZoneStats, ResourceStats, RiverStats, TerrainStats } from "./TerrainStatsTypes";

/** 地形统计器 */
export class TerrainStatsCollector {
    collect(cells: HexCell[]): TerrainStats {
        const counts = new Map<eTerrain, number>();
        cells.forEach(cell => {
            const terrain = cell.data.terrainType;
            counts.set(terrain, (counts.get(terrain) || 0) + 1);
        });
        return {
            counts,
            proportions: this.calculateProportions(counts, cells.length),
        };
    }

    private calculateProportions(counts: Map<eTerrain, number>, total: number) {
        const proportions = new Map<eTerrain, number>();
        counts.forEach((value, key) => proportions.set(key, value / total));
        return proportions;
    }
}

/** 资源统计器 */
export class ResourceStatsCollector {
    collect(cells: HexCell[]): ResourceStats {
        const counts = new Map<eResource, number>();
        const terrainDistribution = new Map<eTerrain, Map<eResource, number>>();

        cells.forEach(cell => {
            const resource = cell.data.resourceType;
            if (resource !== null) {
                counts.set(resource, (counts.get(resource) || 0) + 1);

                const terrain = cell.data.terrainType;
                if (!terrainDistribution.has(terrain)) {
                    terrainDistribution.set(terrain, new Map());
                }
                const resourceMap = terrainDistribution.get(terrain)!;
                resourceMap.set(resource, (resourceMap.get(resource) || 0) + 1);
            }
        });

        return { counts, terrainDistribution };
    }
}

/** 河流统计器 */
export class RiverStatsCollector {
    collect(cells: HexCell[]): RiverStats {
        let riverCount = 0;
        cells.forEach(cell => {
            if (cell.data.riverLevel > 0) riverCount++;
        });
        return {
            riverCount,
            riverProportion: riverCount / cells.length,
        };
    }
}

/** 气候带统计器 */
export class ClimateZoneStatsCollector {
    collect(cells: HexCell[]): ClimateZoneStats {
        const zones = new Map<string, number>();
        cells.forEach(cell => {
            const key = `${cell.data.heightLevel}-${cell.data.humidityLevel}`;
            zones.set(key, (zones.get(key) || 0) + 1);
        });
        return { zones };
    }
}