
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeECGImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const prompt = `
    Como asistente de IA especializado en cardiología, analiza la imagen del electrocardiograma (ECG) proporcionada.
    Tu tarea es identificar un conjunto completo de métricas clave, evaluar el nivel de arritmia y proporcionar un breve resumen.
    
    Asegúrate de incluir las siguientes métricas si son observables en la imagen, además de otras que consideres relevantes:
    - Frecuencia Cardíaca (tasa)
    - Ritmo
    - Intervalo PR
    - Duración del QRS
    - Intervalo QT/QTc
    - Eje Cardíaco
    - Análisis del Segmento ST (ej. elevación, depresión, normal)
    - Morfología de la onda P
    - Morfología de la onda T

    Devuelve el análisis en un formato JSON válido según el esquema proporcionado.
    El campo 'arrhythmiaLevel' debe ser uno de los siguientes valores exactos en español: 'Ninguna', 'Baja', 'Moderada', 'Alta', 'Severa', 'Indeterminada'.
    El resumen debe ser una interpretación concisa y profesional de los hallazgos, en español.
    Las interpretaciones de las métricas y sus nombres también deben estar en español.
  `;
  
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };

  const textPart = {
    text: prompt
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metrics: {
                type: Type.ARRAY,
                description: "Lista de métricas clave del ECG extraídas de la imagen.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "Nombre de la métrica (ej. 'Frecuencia Cardíaca', 'Intervalo PR')."
                    },
                    value: {
                      type: Type.STRING,
                      description: "Valor de la métrica (ej. '75 lpm', '0.16s')."
                    },
                    interpretation: {
                      type: Type.STRING,
                      description: "Breve interpretación del valor de la métrica (ej. 'Normal', 'Ligeramente Elevado')."
                    }
                  },
                  required: ["name", "value", "interpretation"]
                }
              },
              arrhythmiaLevel: {
                type: Type.STRING,
                description: "El nivel evaluado de arritmia.",
                enum: ['Ninguna', 'Baja', 'Moderada', 'Alta', 'Severa', 'Indeterminada']
              },
              summary: {
                type: Type.STRING,
                description: "Un resumen conciso de los hallazgos generales."
              }
            },
            required: ["metrics", "arrhythmiaLevel", "summary"]
          }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing ECG image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Error al analizar la imagen. Error de la API de Gemini: ${error.message}`);
    }
    throw new Error("Ocurrió un error desconocido durante el análisis de la imagen.");
  }
};
