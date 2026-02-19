const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather for user's location
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    // Get user's location from profile
    const user = await User.findById(req.user.id).select('location');
    
    if (!user) {
      return res.status(400).json({ 
        msg: 'User not found' 
      });
    }
    
    // If user doesn't have a location set, use a default location (Nairobi, Kenya)
    let userLocation = user.location;
    if (!userLocation || userLocation.trim() === '') {
      userLocation = 'Nairobi, Kenya'; // Default to Nairobi if no location set
    }

    // Call WeatherAPI with the provided API key
    const apiKey = 'V64645b6bb2da41c48c631303261902'; // Using the API key provided
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(userLocation)}&aqi=no`;
    
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.current) {
      return res.status(500).json({ 
        msg: 'Unable to fetch weather data from WeatherAPI' 
      });
    }

    // Extract and format the weather data
    const current = response.data.current;
    const location = response.data.location;

    const weatherData = {
      temperature: Math.round(current.temp_c), // Round to nearest degree
      condition: current.condition.text,
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph), // Convert to km/h
      windDirection: current.wind_dir,
      location: `${location.name}, ${location.region}`,
      timestamp: new Date().toISOString(),
      feelsLike: Math.round(current.feelslike_c),
      pressure: current.pressure_mb,
      uvIndex: current.uv,
      visibility: current.vis_km
    };

    res.json(weatherData);
  } catch (err) {
    console.error('Weather API error:', err.message);
    
    // Return error if it's a WeatherAPI specific error
    if (err.response && err.response.status === 400) {
      return res.status(400).json({ 
        msg: 'Invalid location or WeatherAPI error' 
      });
    }
    
    // Return generic server error
    res.status(500).json({ 
      msg: 'Unable to fetch weather data' 
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get weather forecast for user's location
// @access  Private
router.get('/forecast', auth, async (req, res) => {
  try {
    // Get user's location from profile
    const user = await User.findById(req.user.id).select('location');
    
    if (!user) {
      return res.status(400).json({ 
        msg: 'User not found' 
      });
    }
    
    // If user doesn't have a location set, use a default location (Nairobi, Kenya)
    let userLocation = user.location;
    if (!userLocation || userLocation.trim() === '') {
      userLocation = 'Nairobi, Kenya'; // Default to Nairobi if no location set
    }

    // Call WeatherAPI forecast endpoint
    const apiKey = 'V64645b6bb2da41c48c631303261902'; // Using the API key provided
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(userLocation)}&days=3&aqi=no&alerts=no`;
    
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.forecast) {
      return res.status(500).json({ 
        msg: 'Unable to fetch forecast data from WeatherAPI' 
      });
    }

    // Extract and format the forecast data
    const forecast = response.data.forecast.forecastday;
    const location = response.data.location;

    const forecastData = {
      location: `${location.name}, ${location.region}`,
      forecast: forecast.map((day, index) => {
        const dayNames = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const date = new Date(day.date);
        const dayName = dayNames[date.getDay()];
        
        return {
          day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayName,
          condition: day.day.condition.text,
          high: Math.round(day.day.maxtemp_c),
          low: Math.round(day.day.mintemp_c),
          precipitation: day.day.daily_chance_of_rain,
          icon: day.day.condition.icon
        };
      }),
      timestamp: new Date().toISOString()
    };

    res.json(forecastData);
  } catch (err) {
    console.error('Weather forecast API error:', err.message);
    
    // Return error if it's a WeatherAPI specific error
    if (err.response && err.response.status === 400) {
      return res.status(400).json({ 
        msg: 'Invalid location or WeatherAPI error' 
      });
    }
    
    // Return generic server error
    res.status(500).json({ 
      msg: 'Unable to fetch forecast data' 
    });
  }
});

module.exports = router;