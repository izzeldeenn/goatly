import { useState, useEffect } from 'react';

interface GitHubRepo {
  stargazers_count: number;
}

export function useGitHubStars() {
  const [stars, setStars] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.github.com/repos/izzeldeenn/FROGO');
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub stars');
        }
        const data: GitHubRepo = await response.json();
        setStars(data.stargazers_count || 0);
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
        setStars(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
    
    // Refresh stars every 5 minutes
    const interval = setInterval(fetchStars, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { stars, loading };
}
