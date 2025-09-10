import React, { useState, useCallback, useMemo } from 'react';
import { GenerationMode, InputImage } from './types';
import { FIGURINE_PROMPT } from './constants';
import { generateWithNanoBanana } from './services/geminiService';
import ModeSelector from './components/ModeSelector';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { GenerateIcon } from './components/Icon';

const App: React.FC = () => {
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.TextToImage);
  const [prompt, setPrompt] = useState<string>('');
  const [inputImages, setInputImages] = useState<InputImage[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (isLoading) return;

    if (mode !== GenerationMode.TextToImage && inputImages.length === 0) {
      setError("此模式請上傳至少一張圖片。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    const currentPrompt = mode === GenerationMode.Figurine ? FIGURINE_PROMPT : prompt;

    try {
      const { image, text } = await generateWithNanoBanana(currentPrompt, inputImages, mode);
      setGeneratedImage(image);
      setGeneratedText(text);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "發生未知錯誤。";
      console.error(e);
      setError(`生成失敗: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, mode, inputImages, prompt]);

  const isGeneratorDisabled = useMemo(() => {
    if (isLoading) return true;
    if (mode === GenerationMode.TextToImage) return prompt.trim() === '';
    if (mode === GenerationMode.Figurine) return inputImages.length === 0;
    return inputImages.length === 0 || prompt.trim() === '';
  }, [isLoading, mode, prompt, inputImages]);

  const maxImages = mode === GenerationMode.MultiImage ? 5 : 1;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex items-center justify-center p-4">
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-900/10 p-8">
        {/* Control Panel */}
        <div className="flex flex-col space-y-6">
          <header>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              AI 圖像融合工作室
            </h1>
            <p className="text-gray-400 mt-2">
              使用 Gemini 的強大功能製作令人驚嘆的視覺效果。選擇一個模式開始。
            </p>
          </header>

          <ModeSelector currentMode={mode} onModeChange={setMode} />

          <ImageUploader
            key={mode} // Re-mount component on mode change to reset state
            onImagesChange={setInputImages}
            maxImages={maxImages}
            disabled={mode === GenerationMode.TextToImage}
          />

          <div className="flex flex-col space-y-2">
            <label htmlFor="prompt-input" className="text-sm font-medium text-gray-300">
              {mode === GenerationMode.Figurine ? "公仔生成 (自動指令)" : "您的創意指令"}
            </label>
            <textarea
              id="prompt-input"
              value={mode === GenerationMode.Figurine ? FIGURINE_PROMPT : prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === GenerationMode.Figurine ? "上傳圖片以生成公仔..." : "例如：一隻戴著皇冠的雄偉獅子，電影般的燈光..."}
              disabled={isLoading || mode === GenerationMode.Figurine}
              className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGeneratorDisabled}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <GenerateIcon />
            {isLoading ? '生成中...' : '生成圖片'}
          </button>
        </div>

        {/* Result Display */}
        <ResultDisplay
          isLoading={isLoading}
          error={error}
          generatedImage={generatedImage}
          generatedText={generatedText}
        />
      </main>
    </div>
  );
};

export default App;