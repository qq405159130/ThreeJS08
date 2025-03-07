import { eResource, eTerrain } from "@/terrain/enums";
import { MapStatistics } from "./TerrainStatsTypes";


export class StatisticsLogger {
    static log(stats: MapStatistics) {
        console.groupCollapsed('=== 地图统计详情 ===');

        // 地形统计
        const terrainCounts = stats.get("terrain/counts") as Map<eTerrain, number>;
        const terrainProportions = stats.get("terrain/proportions") as Map<eTerrain, number>;
        console.log("地形数量:", this.formatMap(terrainCounts));
        console.log("地形比例:", this.formatMap(terrainProportions));

        // 资源统计
        const resourceCounts = stats.get("resources/counts") as Map<eResource, number>;
        console.log("资源分布:", this.formatMap(resourceCounts));

        // 河流统计
        const riverCount = stats.get("rivers/count") as number;
        console.log("河流数量:", riverCount);

        // 气候带统计
        const climateZones = stats.get("climate/zones") as Map<string, number>;
        console.log("气候带分布:", this.formatMap(climateZones));

        console.groupEnd();
    }

    private static formatMap(map: Map<any, number>): string {
        return Array.from(map.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
    }
}