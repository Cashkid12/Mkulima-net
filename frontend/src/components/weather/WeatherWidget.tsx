'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye, AlertTriangle } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  location: string;
  timestamp: string;
  feelsLike?: number;
  pressure?: number;
  uvIndex?: number;
  visibility?: number;
}

interface ForecastData {
  location: string;
  forecast: Array<{
    day: string;
    condition: string;
    high: number;
    low: number;
    precipitation: number;
    icon?: string;
  }>;
  timestamp: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Check if user is authenticated
        if (!token) {
          // For unauthenticated users, we can't fetch personalized weather
          // But we can show a message or default weather
          setError('Please log in to see personalized weather');
          return;
        }

        // Fetch current weather
        const weatherResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (!weatherResponse.ok) {
          if (weatherResponse.status === 401) {
            // Authentication failed - token might be expired
            // Try to refresh or just show a login suggestion
            setError('Please log in to see personalized weather');
            return;
          }
          const errorData = await weatherResponse.json();
          throw new Error(errorData.msg || 'Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        setWeather(weatherData);

        // Fetch forecast
        const forecastResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (!forecastResponse.ok) {
          if (forecastResponse.status === 401) {
            // Authentication failed - token might be expired
            // Try to refresh or just show a login suggestion
            setError('Please log in to see personalized weather');
            return;
          }
          const errorData = await forecastResponse.json();
          throw new Error(errorData.msg || 'Failed to fetch forecast data');
        }

        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'An error occurred while fetching weather data');
        } else {
          setError('An unknown error occurred while fetching weather data');
        }
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('storm') || lowerCondition.includes('shower')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (lowerCondition.includes('snow')) {
      return <CloudSnow className="h-8 w-8 text-blue-300" />;
    } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else if (lowerCondition.includes('wind')) {
      return <Wind className="h-8 w-8 text-gray-500" />;
    } else {
      return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };



  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[280px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-10 w-10 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[280px]">
        <div className="text-center text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[280px]">
        <div className="text-center text-gray-500 text-sm">Weather data unavailable</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[280px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-gray-600">{weather.location}</div>
          </div>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={expanded ? "Collapse weather details" : "Expand weather details"}
        >
          <svg 
            className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Droplets className="h-4 w-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-4 w-4" />
          <span>{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{weather.windDirection}</span>
        </div>
        {weather.feelsLike && (
          <div className="flex items-center gap-1">
            <Thermometer className="h-4 w-4" />
            <span>Feels {weather.feelsLike}°</span>
          </div>
        )}
      </div>

      {expanded && forecast && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-2">3-Day Forecast</h3>
          <div className="space-y-2">
            {forecast.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 w-16">{day.day}</span>
                  <div className="flex items-center gap-1">
                    {getWeatherIcon(day.condition)}
                    {day.precipitation > 30 && (
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-xs ml-1">{day.precipitation}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{day.low}°</span>
                  <span className="text-sm font-medium text-gray-900">{day.high}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}