
//#ignore_export
export type StatValue = 
  | number 
  | Map<string | number, number> 
  | { [key: string]: number };

export type MapStatistics = Map<string, StatValue>;
