export interface TypeMetrics {
    type: string;
    metrics: Array<string>;
}
  
export interface BarchartData {
    triplestore: string;
    value: number;
    [key: string]: string | number;
}
  
export interface BoxplotData extends BarchartData {}

export interface ScatterplotData {
    triplestore: string;
    resultSize: number;
    QPS: number;
    [key: string]: number | string;
}