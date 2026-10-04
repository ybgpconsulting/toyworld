import { useEffect, useState } from 'react';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({ onLoadMore, hasMore, isLoading, threshold = 100 }: UseInfiniteScrollProps) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (windowHeight + scrollTop >= documentHeight - threshold) {
        setIsNearBottom(true);
      } else {
        setIsNearBottom(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  useEffect(() => {
    if (isNearBottom && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [isNearBottom, hasMore, isLoading, onLoadMore]);
};
