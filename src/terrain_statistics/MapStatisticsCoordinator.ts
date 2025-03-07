import { HexCell } from "@/terrain/HexCell";
import { eResource, eTerrain } from "@/terrain/enums";
import { ClimateZoneStats, MapStatistics, ResourceStats, RiverStats, TerrainStats } from "./TerrainStatsTypes";
import { ClimateZoneStatsCollector, ResourceStatsCollector, RiverStatsCollector, TerrainStatsCollector } from "./TerrainStatsCollector";

export class MapStatisticsCoordinator {
    private collectors = [
        new TerrainStatsCollector(),
        new ResourceStatsCollector(),
        new RiverStatsCollector(),
        new ClimateZoneStatsCollector(),
        // 其他统计器...
    ];

    generate(cells: HexCell[]): MapStatistics {
        // const stats: Partial<MapStatistics> = {};
        const stats: MapStatistics = {
            terrain: { counts: new Map(), proportions: new Map() },
            height: { counts: new Map(), proportions: new Map() },
            humidity: { counts: new Map(), proportions: new Map() },
            resources: { counts: new Map(), terrainDistribution: new Map() },
            cities: { counts: new Map(), terrainDistribution: new Map() },
            infrastructure: { roadCount: 0, bridgeCount: 0 },
            rivers: { riverCount: 0, riverProportion: 0 },
            specialFeatures: { volcanoCount: 0, snowCount: 0 },
            adjacency: { riverAdjacentCount: 0 },
            climateZones: { zones: new Map() },
            numericalRanges: { minHeight: Infinity, maxHeight: -Infinity, avgHumidity: 0 },
        };
        console.log('（调试）this.collectors.length: ' + this.collectors.length);
        this.collectors.forEach(collector => {
            const collectedStats = collector.collect(cells);
            console.log('Collected stats:', collectedStats); // 打印每个统计器的结果
            // Object.assign(stats, collectedStats);//禁用，只是浅拷贝，会丢失非顶层数据；

            // 手动合并 collectedStats 到 stats
            for (const key in collectedStats) {
                if (key in stats) {
                    /** Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.
  No index signature with a parameter of type 'string' was found on type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.ts(7053) */
                    if (collectedStats[key] instanceof Map) {
                        // 如果是 Map，手动合并
                        collectedStats[key].forEach((value, subKey) => {
                            stats[key].set(subKey, value);
                        });
                    } else {
                        // 如果是普通对象，直接赋值
                        Object.assign(stats[key], collectedStats[key]);
                    }
                }
            }
        });

        console.log('（调试）Generated stats:', stats); // 打印完整的统计数据
        return stats;
    }
}
