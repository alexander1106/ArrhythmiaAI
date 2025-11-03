
import React from 'react';
import { AnalysisResult, ArrhythmiaLevel } from '../types';

interface AnalysisResultProps {
  result: AnalysisResult;
}

const getArrhythmiaLevelClass = (level: ArrhythmiaLevel): string => {
  switch (level) {
    case ArrhythmiaLevel.NONE:
    case ArrhythmiaLevel.LOW:
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case ArrhythmiaLevel.MODERATE:
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case ArrhythmiaLevel.HIGH:
    case ArrhythmiaLevel.SEVERE:
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case ArrhythmiaLevel.INDETERMINATE:
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.344-.688 11.855 11.855 0 01-1.897-1.13l-.001-.001c-.115-.062-.229-.124-.343-.187a10.025 10.025 0 01-4.283-5.542A9.96 9.96 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10c0 1.343-.275 2.617-.764 3.793a10.026 10.026 0 01-4.283 5.542 9.957 9.957 0 01-3.242 1.875c-.114.062-.228.125-.342.187a11.863 11.863 0 01-1.897 1.13 15.247 15.247 0 01-1.344.688l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-lg p-6 space-y-6 border border-slate-700 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-300">Resultados del Análisis</h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold border ${getArrhythmiaLevelClass(result.arrhythmiaLevel)}`}>
          <HeartIcon className="w-6 h-6" />
          <span>Nivel de Arritmia: {result.arrhythmiaLevel}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-200">Resumen</h3>
        <p className="text-slate-300 bg-slate-900/50 p-4 rounded-md">{result.summary}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Métricas Predictivas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="p-3 text-sm font-semibold tracking-wide text-slate-300">Métrica</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-slate-300">Valor</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-slate-300 hidden md:table-cell">Interpretación</th>
              </tr>
            </thead>
            <tbody>
              {result.metrics.map((metric, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-800 transition-colors duration-200">
                  <td className="p-3 font-medium text-slate-200">{metric.name}</td>
                  <td className="p-3 text-cyan-400">{metric.value}</td>
                  <td className="p-3 text-slate-400 hidden md:table-cell">{metric.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultDisplay;
