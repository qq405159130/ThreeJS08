import { eResource, eTerrain } from "@/terrain/enums";
import { ClimateZoneStats, MapStatistics, ResourceStats, RiverStats, TerrainStats } from "./TerrainStatsTypes";

export class StatisticsLogger {
    static log(stats: MapStatistics) {
        console.groupCollapsed('=== 地图统计详情 ===');
        if (stats.terrain) this.logTerrain(stats.terrain);
        if (stats.resources) this.logResources(stats.resources);
        if (stats.rivers) this.logRivers(stats.rivers);
        if (stats.climateZones) this.logClimateZones(stats.climateZones);
        console.groupEnd();
    }

    private static logTerrain(stats: TerrainStats) {
        console.group('地形统计');
        stats.counts.forEach((count, terrain) => {
            console.log(`${eTerrain[terrain]}: ${count} (${stats.proportions.get(terrain)! * 100}%)`);
        });
        console.groupEnd();
    }

    private static logResources(stats: ResourceStats) {
        console.group('资源统计');
        stats.counts.forEach((count, resource) => {
            console.log(`${eResource[resource]}: ${count}`);
        });
        console.groupEnd();
    }

    private static logRivers(stats: RiverStats) {
        console.group('河流统计');
        console.log(`河流格子数量: ${stats.riverCount}`);
        console.log(`河流占比: ${(stats.riverProportion * 100).toFixed(2)}%`);
        console.groupEnd();
    }

    private static logClimateZones(stats: ClimateZoneStats) {
        console.group('气候带统计');
        stats.zones.forEach((count, zone) => {
            console.log(`${zone}: ${count}`);
        });
        console.groupEnd();
    }
}