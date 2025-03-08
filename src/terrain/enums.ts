/** 地形 */
export enum eTerrain {
    Ocean = 0,
    Plain = 1,
    Hill = 2,
    Mountain = 3,
    HighMountain = 4,
    Lake = 5
}

/** 地貌 */
export enum eTerrainFace {
    Grassland,
    Forest,
    Swamp,
    Rainforest,
    Desert,
    Oasis,
    Snow,
    Tundra,
    Volcano
}

/** 高度等级 */
export enum eHeightLevel {
    None,
    Level1,
    Level2,
    Level3,
    Level4
}

/** 湿度等级 */
export enum eHumidityLevel {
    None,
    Low,
    Medium,
    High,
    Full
}

/** 建筑类型 */
export enum eBuild {
    PrimaryCity,
    SecondaryCity,
    TertiaryCity,
    HeavyFactory,
    Airport,
    Fortress
}

/** 资源类型 */
export enum eResource {
    Mineral,
    Forest,
    Fish,
    Agriculture
}