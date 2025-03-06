// types.ts
import { eTerrain, eHeightLevel, eHumidityLevel, eResource, eBuild } from '../terrain/enums';

export type MapStatistics = {
  terrain: TerrainStats;
  height: HeightStats;
  humidity: HumidityStats;
  resources: ResourceStats;
  cities: CityStats;
  infrastructure: InfrastructureStats;
  rivers: RiverStats;
  specialFeatures: SpecialFeatureStats;
  adjacency: AdjacencyStats;
  climateZones: ClimateZoneStats;
  numericalRanges: NumericalRangeStats;
};

export interface TerrainStats {
  counts: Map<eTerrain, number>;
  proportions: Map<eTerrain, number>;
}

export interface HeightStats {
  counts: Map<eHeightLevel, number>;
  proportions: Map<eHeightLevel, number>;
}

export interface HumidityStats {
  counts: Map<eHumidityLevel, number>;
  proportions: Map<eHumidityLevel, number>;
}

export interface ResourceStats {
  counts: Map<eResource, number>;
  terrainDistribution: Map<eTerrain, Map<eResource, number>>;
}

export interface CityStats {
  counts: Map<eBuild, number>;
  terrainDistribution: Map<eTerrain, Map<eBuild, number>>;
}

export interface InfrastructureStats {
  roadCount: number;
  bridgeCount: number;
}

export interface RiverStats {
  riverCount: number;
  riverProportion: number;
}

export interface SpecialFeatureStats {
  volcanoCount: number;
  snowCount: number;
}

export interface AdjacencyStats {
  riverAdjacentCount: number;
}

export interface ClimateZoneStats {
  zones: Map<string, number>;
}

export interface NumericalRangeStats {
  minHeight: number;
  maxHeight: number;
  avgHumidity: number;
}