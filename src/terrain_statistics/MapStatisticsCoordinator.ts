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

    public generate(cells: HexCell[]): MapStatistics {
        const stats: Partial<MapStatistics> = {};
        this.collectors.forEach(collector => {
            Object.assign(stats, collector.collect(cells));
        });
        return stats as MapStatistics;
    }
}