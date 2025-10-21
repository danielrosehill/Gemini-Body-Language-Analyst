
import React, { useState, useCallback } from 'react';
import { analyzeBodyLanguage } from './services/geminiService';
import type { TaggedImage, Tag } from './types';
import ImageTagger from './components/ImageTagger';
import { UploadIcon, SparklesIcon } from './components/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export default function App() {
  const [taggedImages, setTaggedImages] = useState<TaggedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: TaggedImage[] = [];
    // FIX: The original for...of loop over `Array.from(files)` caused a TypeScript
    // type inference issue, where `file` was incorrectly typed as `unknown`.
    // Switching to a standard `for` loop with an index and using `files.item(i)`
    // ensures that `file` is correctly typed as `File | null`, resolving the errors.
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          id: `${file.name}-${Date.now()}`,
          file,
          base64,
          tags: [],
        });
      } catch (err) {
        console.error("Error converting file to base64", err);
        setError("Could not process one of the uploaded images.");
      }
    }
    setTaggedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = useCallback((idToRemove: string) => {
    setTaggedImages((prev) => prev.filter((img) => img.id !== idToRemove));
  }, []);

  const handleAddTag = useCallback((imageId: string, tag: Tag) => {
    setTaggedImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, tags: [...img.tags, tag] } : img
      )
    );
  }, []);

  const handleAnalyzeClick = async () => {
    if (taggedImages.length === 0) {
      setError("Please upload at least one image to analyze.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysis('');
    try {
      const result = await analyzeBodyLanguage(prompt, taggedImages);
      setAnalysis(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            Body Language Analyst AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Uncover the unspoken stories in your photos with Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Controls */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-2 text-sky-400">1. Upload Photos</h2>
                <label htmlFor="file-upload" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 rounded-lg p-6 flex flex-col items-center justify-center transition-colors">
                    <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="font-semibold text-gray-300">Click to upload or drag & drop</span>
                    <span className="text-sm text-gray-400">PNG, JPG, WEBP, etc.</span>
                </label>
                <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-2 text-sky-400">2. Add Context (Optional)</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'This is a photo from a family reunion.' or 'A team meeting discussing a new project.'"
                    className="w-full h-32 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
            </div>
            
            <button
                onClick={handleAnalyzeClick}
                disabled={isLoading || taggedImages.length === 0}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-sky-600 text-white font-bold text-lg rounded-lg hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-6 h-6" />
                        Analyze Body Language
                    </>
                )}
            </button>
            {error && <p className="text-red-400 text-center mt-2">{error}</p>}
          </div>

          {/* Right Panel: Images & Results */}
          <div className="flex flex-col gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 min-h-[300px]">
                <h2 className="text-2xl font-bold mb-4 text-indigo-400">Uploaded Images</h2>
                {taggedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {taggedImages.map((image) => (
                            <ImageTagger
                                key={image.id}
                                image={image}
                                onAddTag={handleAddTag}
                                onRemoveImage={handleRemoveImage}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>Your photos will appear here.</p>
                        <p>Click on them to tag people!</p>
                    </div>
                )}
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 min-h-[300px]">
                <h2 className="text-2xl font-bold mb-4 text-indigo-400">Analysis Results</h2>
                {isLoading && <p className="text-gray-400">Gemini is analyzing the images...</p>}
                {!isLoading && !analysis && <p className="text-gray-500">Your expert analysis will be displayed here.</p>}
                {analysis && (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
                    </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
