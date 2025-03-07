import { HexCell } from "@/terrain/HexCell";
import { eResource, eTerrain } from "@/terrain/enums";
import { MapStatistics, StatValue } from "./TerrainStatsTypes";
import { ClimateZoneStatsCollector, ResourceStatsCollector, RiverStatsCollector, TerrainStatsCollector } from "./TerrainStatsCollector";

export class MapStatisticsCoordinator {
    private collectors = [
        new TerrainStatsCollector(),
        new ResourceStatsCollector(),
        new RiverStatsCollector(),
        new ClimateZoneStatsCollector(),
    ];

    generate(cells: HexCell[]): MapStatistics {
        const stats = new Map<string, StatValue>();

        this.collectors.forEach(collector => {
            const collectedStats = collector.collect(cells);
            // 直接合并所有键值对
            collectedStats.forEach((value, key) => {
                stats.set(key, value);
            });
        });

        return stats;
    }
}
