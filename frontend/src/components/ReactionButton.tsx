'use client';

import { useState, useRef, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

interface Reaction {
  type: 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';
  emoji: string;
  label: string;
  color: string;
}

const reactions: Reaction[] = [
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-green-600' },
  { type: 'support', emoji: '🤝', label: 'Support', color: 'text-blue-600' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-600' },
  { type: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-yellow-600' },
  { type: 'funny', emoji: '😄', label: 'Funny', color: 'text-orange-600' },
];

interface ReactionButtonProps {
  postId: string;
  userReaction: string | null;
  reactionCounts: Record<string, number>;
  totalReactions: number;
  onReact: (type: string) => void;
  onRemoveReaction: () => void;
}

export default function ReactionButton({
  postId,
  userReaction,
  reactionCounts,
  totalReactions,
  onReact,
  onRemoveReaction
}: ReactionButtonProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the top reactions to display
  const topReactions = reactions
    .filter(r => reactionCounts[r.type] > 0)
    .sort((a, b) => (reactionCounts[b.type] || 0) - (reactionCounts[a.type] || 0))
    .slice(0, 3);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 200);
  };

  const handleReactionClick = (type: string) => {
    if (userReaction === type) {
      onRemoveReaction();
    } else {
      onReact(type);
    }
    setShowReactions(false);
  };

  const handleMainButtonClick = () => {
    if (userReaction) {
      onRemoveReaction();
    } else {
      // Default to 'support' if no reaction selected
      onReact('support');
    }
  };

  // Get current reaction display
  const getCurrentReaction = () => {
    if (userReaction) {
      const reaction = reactions.find(r => r.type === userReaction);
      return reaction || reactions[1]; // Default to support
    }
    return null;
  };

  const currentReaction = getCurrentReaction();

  // Close reactions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Reaction Popup */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`relative p-2 hover:scale-125 transition-transform duration-150 ${
                userReaction === reaction.type ? 'bg-gray-100 rounded-full' : ''
              }`}
              title={reaction.label}
              aria-label={`React with ${reaction.label}`}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              
              {/* Tooltip */}
              {hoveredReaction === reaction.type && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  {reaction.label}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleMainButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          userReaction 
            ? 'bg-green-50 text-green-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label={userReaction ? `Remove ${currentReaction?.label} reaction` : 'Add reaction'}
      >
        {currentReaction ? (
          <span className="text-lg">{currentReaction.emoji}</span>
        ) : (
          <ThumbsUp className="h-5 w-5" />
        )}
        <span className={`font-medium ${currentReaction ? currentReaction.color : ''}`}>
          {currentReaction ? currentReaction.label : 'Like'}
        </span>
        {totalReactions > 0 && (
          <span className="text-sm text-gray-500">
            ({totalReactions})
          </span>
        )}
      </button>

      {/* Reaction Summary */}
      {topReactions.length > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <div className="flex -space-x-1">
            {topReactions.map((reaction, index) => (
              <span 
                key={reaction.type}
                className="text-sm bg-white rounded-full border border-gray-200 w-5 h-5 flex items-center justify-center"
                style={{ zIndex: topReactions.length - index }}
                title={`${reaction.label}: ${reactionCounts[reaction.type]}`}
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
      )}
    </div>
  );
}
