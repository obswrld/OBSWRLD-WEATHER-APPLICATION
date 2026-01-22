let currentUnit = 'metric';
let currentCity = '';
let currentWeatherData = null;

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const useLocationBtn = document.getElementById('useLocation');
const toggleUnitBtn = document.getElementById('toggleUnit');
const weatherDisplay = document.getElementById('weatherDisplay');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchError = document.getElementById('searchError');
const saveLocationBtn = document.getElementById('saveLocation');
const locationsGrid = document.getElementById('locationsGrid');

const cityName = document.getElementById('cityName');
const country = document.getElementById('country');
const temperature = document.getElementById('temperature');
const tempUnit = document.getElementById('tempUnit');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

