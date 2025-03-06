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

        this.collectors.forEach(collector => {
            Object.assign(stats, collector.collect(cells));
        });

        return stats;
    }
}
