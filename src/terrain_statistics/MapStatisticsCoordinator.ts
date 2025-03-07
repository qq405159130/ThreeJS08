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

            // // 手动合并 collectedStats 到 stats
            // for (const key in collectedStats) {
            //     if (key in stats) {
            //         /** Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.
            //         No index signature with a parameter of type 'string' was found on type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.ts(7053) */
            //         if (collectedStats[key] instanceof Map) {
            //             // 如果是 Map，手动合并
            //             collectedStats[key].forEach((value, subKey) => {
            //                 /** Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'MapStatistics'.
            //                 No index signature with a parameter of type 'string' was found on type 'MapStatistics'.ts(7053) */
            //                 stats[key].set(subKey, value);
            //             });
            //         } else {
            //             // 如果是普通对象，直接赋值
            //             /** Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'MapStatistics'.
            //              No index signature with a parameter of type 'string' was found on type 'MapStatistics'.ts(7053) */
            //             /** Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.
            //              No index signature with a parameter of type 'string' was found on type 'ResourceStats | ClimateZoneStats | RiverStats | TerrainStats'.ts(7053) */
            //             Object.assign(stats[key], collectedStats[key]);
            //         }
            //     }
            // }

            // 手动合并 collectedStats 到 stats
            mergeStats(stats, collectedStats);
        });

        console.log('（调试）Generated stats:', stats); // 打印完整的统计数据
        return stats;
    }
}
function mergeStats(stats: MapStatistics, collectedStats: any): void {
    console.log('开始合并 collectedStats 到 stats');
    console.log('collectedStats:', collectedStats);
    console.log('stats（合并前）:', stats);

    for (const key in collectedStats) {
        if (key in stats) {
            const collectedValue = collectedStats[key];
            const statsValue = stats[key as keyof MapStatistics];

            console.log(`处理字段: ${key}`);
            console.log('collectedValue:', collectedValue);
            console.log('statsValue（合并前）:', statsValue);

            if (collectedValue instanceof Map) {
                // 如果 collectedValue 是 Map，手动合并
                if (statsValue instanceof Map) {
                    console.log('合并 Map 数据');
                    collectedValue.forEach((value: any, subKey: any) => {
                        if (value instanceof Map) {
                            // 如果 value 也是 Map，递归合并
                            if (!statsValue.has(subKey)) {
                                statsValue.set(subKey, new Map());
                            }
                            const subStatsValue = statsValue.get(subKey);
                            if (subStatsValue instanceof Map) {
                                mergeStats(subStatsValue as any, value);
                            }
                        } else {
                            // 否则直接设置值
                            statsValue.set(subKey, value);
                        }
                    });
                } else {
                    console.error('statsValue 不是 Map，无法合并');
                }
            } else if (typeof collectedValue === 'object' && collectedValue !== null) {
                // 如果 collectedValue 是普通对象，递归合并
                console.log('合并普通对象数据');
                for (const subKey in collectedValue) {
                    if (subKey in statsValue) {
                        const subCollectedValue = collectedValue[subKey];
                        const subStatsValue = (statsValue as any)[subKey];

                        console.log(`处理嵌套字段: ${subKey}`);
                        console.log('subCollectedValue:', subCollectedValue);
                        console.log('subStatsValue（合并前）:', subStatsValue);

                        if (subCollectedValue instanceof Map) {
                            // 如果 subCollectedValue 是 Map，手动合并
                            if (subStatsValue instanceof Map) {
                                console.log('合并嵌套 Map 数据');
                                subCollectedValue.forEach((value: any, mapKey: any) => {
                                    if (value instanceof Map) {
                                        // 如果 value 也是 Map，递归合并
                                        if (!subStatsValue.has(mapKey)) {
                                            subStatsValue.set(mapKey, new Map());
                                        }
                                        const subSubStatsValue = subStatsValue.get(mapKey);
                                        if (subSubStatsValue instanceof Map) {
                                            mergeStats(subSubStatsValue as any, value);
                                        }
                                    } else {
                                        // 否则直接设置值
                                        subStatsValue.set(mapKey, value);
                                    }
                                });
                            } else {
                                console.error('subStatsValue 不是 Map，无法合并');
                            }
                        } else if (typeof subCollectedValue === 'object' && subCollectedValue !== null) {
                            // 如果 subCollectedValue 是普通对象，递归合并
                            console.log('合并普通对象数据');
                            mergeStats(subStatsValue, subCollectedValue);
                        } else {
                            // 否则直接赋值
                            console.log('直接赋值');
                            (statsValue as any)[subKey] = subCollectedValue;
                        }

                        console.log('subStatsValue（合并后）:', subStatsValue);
                    }
                }
            } else {
                // 如果 collectedValue 是基本类型，直接赋值
                console.log('直接赋值');
                (stats as any)[key] = collectedValue;
            }

            console.log('statsValue（合并后）:', statsValue);
        }
    }

    console.log('stats（合并后）:', stats);
}