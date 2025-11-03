
export interface ECGMetric {
  name: string;
  value: string;
  interpretation: string;
}

export enum ArrhythmiaLevel {
    NONE = 'Ninguna',
    LOW = 'Baja',
    MODERATE = 'Moderada',
    HIGH = 'Alta',
    SEVERE = 'Severa',
    INDETERMINATE = 'Indeterminada'
}

export interface AnalysisResult {
  metrics: ECGMetric[];
  arrhythmiaLevel: ArrhythmiaLevel;
  summary: string;
}
