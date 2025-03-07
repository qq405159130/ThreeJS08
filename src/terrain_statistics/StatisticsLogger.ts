import { eResource, eTerrain } from "@/terrain/enums";
import { MapStatistics } from "./TerrainStatsTypes";

// ANSI 颜色代码
const Colors = {
    Reset: "\x1b[0m",
    Cyan: "\x1b[36m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m",
    Red: "\x1b[31m",
    Bold: "\x1b[1m",
    Underline: "\x1b[4m",
};

export class StatisticsLogger {
    static log(stats: MapStatistics) {
        console.log(`${Colors.Cyan}${Colors.Bold}\n=== 地图统计详情 ===${Colors.Reset}\n`);

        // 地形统计
        this.printSection(
            "地形统计",
            stats.get("terrain/counts") as Map<eTerrain, number>,
            stats.get("terrain/proportions") as Map<eTerrain, number>,
            Colors.Green
        );

        // 资源统计
        this.printSection(
            "资源统计",
            stats.get("resources/counts") as Map<eResource, number>,
            undefined,
            Colors.Blue
        );

        // 河流统计
        const riverCount = stats.get("rivers/count") as number;
        console.log(`${Colors.Yellow}${Colors.Bold}● 河流统计${Colors.Reset}`);
        console.log(`  ${Colors.Yellow}数量:${Colors.Reset} ${riverCount}\n`);

        // 气候带统计
        const climateZones = stats.get("climate/zones") as Map<string, number>;
        console.log(`${Colors.Magenta}${Colors.Bold}● 气候带分布${Colors.Reset}`);
        console.table(this.mapToObject(climateZones));
    }

    private static printSection(
        title: string,
        counts: Map<any, number>,
        proportions?: Map<any, number>,
        color: string = Colors.Reset
    ) {
        console.log(`${color}${Colors.Bold}● ${title}${Colors.Reset}`);

        // 生成表格数据
        const data = Array.from(counts.entries()).map(([key, count]) => {
            const proportion = proportions?.get(key) || 0;
            return {
                "类型": this.getTypeName(key), // 将枚举值转换为可读的名称
                "数量": count,
                "比例": `${(proportion * 100).toFixed(2)}%`
            };
        });

        // 打印表格
        console.table(data);
    }

    private static getTypeName(type: any): string {
        if (typeof type === 'number') {
            // 如果是数值类型，尝试从枚举中获取对应的名称
            if (type in eTerrain) {
                return eTerrain[type];
            } else if (type in eResource) {
                return eResource[type];
            }
        }
        return type.toString(); // 默认返回字符串形式
    }

    private static mapToObject(map: Map<any, number>): { [key: string]: number } {
        return Array.from(map.entries()).reduce((obj, [key, value]) => {
            obj[this.getTypeName(key)] = value; // 将键转换为可读的名称
            return obj;
        }, {} as { [key: string]: number });
    }
}