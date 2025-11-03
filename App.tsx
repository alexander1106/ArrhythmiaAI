
import React, { useState, useCallback, ChangeEvent } from 'react';
import { analyzeECGImage, fileToBase64 } from './services/geminiService';
import { AnalysisResult } from './types';
import AnalysisResultDisplay from './components/AnalysisResult';
import Loader from './components/Loader';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);
            setResult(null);
            setError(null);

            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
        }
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError("Por favor, selecciona una imagen primero.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const analysisResult = await analyzeECGImage(base64Image, imageFile.type);
            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const resetState = () => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
                    Analizador de Arritmias ECG
                </h1>
                <p className="mt-2 text-lg text-slate-400">
                    Sube una imagen de un ECG para obtener un análisis con la potencia de IA de Gemini.
                </p>
                 <p className="mt-2 text-sm text-yellow-400/80">
                    Aviso: Esta herramienta es solo para fines informativos y no sustituye el consejo médico profesional.
                </p>
            </header>

            <main className="w-full max-w-4xl flex flex-col items-center space-y-6">
                {!imagePreviewUrl ? (
                    <label className="w-full max-w-lg flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300">
                        <UploadIcon className="w-12 h-12 text-slate-500 mb-4" />
                        <span className="text-xl font-semibold text-slate-300">Haz clic para subir la imagen del ECG</span>
                        <span className="text-sm text-slate-500 mt-1">PNG, JPG, o WEBP</span>
                        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
                    </label>
                ) : (
                    <div className="w-full max-w-2xl p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        <img src={imagePreviewUrl} alt="ECG Preview" className="w-full h-auto object-contain rounded-md" />
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4">
                     {imageFile && (
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={isLoading}
                            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg transform hover:scale-105"
                        >
                            {isLoading ? 'Analizando...' : 'Analizar ECG'}
                        </button>
                    )}
                    {imagePreviewUrl && (
                        <button
                            onClick={resetState}
                            disabled={isLoading}
                            className="px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-full hover:bg-slate-600 disabled:opacity-50 transition-all duration-300"
                        >
                            Quitar Imagen
                        </button>
                    )}
                </div>

                <div className="w-full mt-8 flex justify-center">
                    {isLoading && <Loader />}
                    {error && (
                        <div className="w-full max-w-2xl p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {result && <AnalysisResultDisplay result={result} />}
                </div>
            </main>
        </div>
    );
};

export default App;
