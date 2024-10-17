import React, { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import RecommendationList from './components/RecommendationList';
import { Recommendation } from './types';
import axios from 'axios';

const FIREBASE_FUNCTION_URL = 'https://us-central1-listopenai-71e92.cloudfunctions.net/getRecommendations';

function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url;
      if (url) {
        setCurrentUrl(url);
        const response = await axios.post(FIREBASE_FUNCTION_URL, { url, isPremium });
        setRecommendations(response.data.recommendations);
      } else {
        throw new Error('Unable to get current tab URL');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (index: number) => {
    setRecommendations((prevRecs) => {
      const newRecs = [...prevRecs];
      newRecs[index] = { ...newRecs[index], likes: (newRecs[index].likes || 0) + 1 };
      return newRecs;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">ListOpenAI</h1>
      <button
        onClick={fetchRecommendations}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Search className="w-5 h-5 mr-2" />
        )}
        유사한 AI 도구 찾기
      </button>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      {currentUrl && recommendations.length > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          Recommendations for: {currentUrl}
        </p>
      )}
      <RecommendationList recommendations={recommendations} onLike={handleLike} />
      {!isPremium && recommendations.length > 0 && (
        <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">
            Upgrade to Premium for more recommendations and AI-powered suggestions!
          </p>
        </div>
      )}
    </div>
  );
}

export default App;