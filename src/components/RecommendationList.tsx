import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onLike: (index: number) => void;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, onLike }) => {
  return (
    <ul className="space-y-4">
      {recommendations.map((rec, index) => (
        <li key={index} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <img src={rec.iconUrl} alt={rec.name} className="w-8 h-8 mr-2 rounded" />
            <h2 className="text-lg font-semibold">{rec.name}</h2>
          </div>
          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{rec.category}</span>
            <span>{rec.updated}</span>
            <button
              onClick={() => onLike(index)}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {rec.likes}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecommendationList;