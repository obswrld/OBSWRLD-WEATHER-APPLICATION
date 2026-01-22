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
const saveLocationBtn = document.getElementById('saveLocationBtn'); // FIXED: was 'saveLocation'
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

console.log('DOM Elements Check:');
console.log('cityInput:', cityInput);
console.log('searchBtn:', searchBtn);
console.log('useLocationBtn:', useLocationBtn);
console.log('toggleUnitBtn:', toggleUnitBtn);
console.log('saveLocationBtn:', saveLocationBtn);
console.log('weatherDisplay:', weatherDisplay);
console.log('loadingSpinner:', loadingSpinner);

if (!cityInput || !searchBtn || !useLocationBtn || !toggleUnitBtn) {
    console.error('CRITICAL: Some DOM elements are missing!');
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

useLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            (error) => {
                showLoading(false);
                showError('Unable to get your location. Please enable location services.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

toggleUnitBtn.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    if (currentWeatherData) {
        displayWeatherData(currentWeatherData);
    }
});

saveLocationBtn.addEventListener('click', () => {
    if (currentWeatherData) {
        saveLocation(currentWeatherData);
    }
});

async function getWeatherByCity(city) {
    showLoading(true);
    hideError();

    try {
        const response = await fetch(`/api/weather/?city=${encodeURIComponent(city)}&unit=${currentUnit}`);
        const data = await response.json();

        if (response.ok) {
            currentCity = city;
            currentWeatherData = data;
            displayWeatherData(data);
            changeBackground(data.current.main);
        } else {
            showError(data.error || 'City not found. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
        console.error('Error fetching weather:', error);
    } finally {
        showLoading(false);
    }
}

async function getWeatherByCoords(lat, lon) {
    showLoading(true);
    hideError();

    try {
        const response = await fetch(`/api/weather/coords/?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (response.ok) {
            currentCity = data.current.city;
            currentWeatherData = data;
            displayWeatherData(data);
            changeBackground(data.current.main);
            cityInput.value = data.current.city;
        } else {
            showError(data.error || 'Unable to fetch weather data.');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
        console.error('Error fetching weather:', error);
    } finally {
        showLoading(false);
    }
}

function displayWeatherData(data) {
    const current = data.current;

    let temp = current.temperature;
    let feels = current.feels_like;
    let unitSymbol = '°C';

    if (currentUnit === 'imperial') {
        temp = (temp * 9/5) + 32;
        feels = (feels * 9/5) + 32;
        unitSymbol = '°F';
    }

    cityName.textContent = current.city;
    country.textContent = current.country;
    temperature.textContent = Math.round(temp);
    tempUnit.textContent = unitSymbol;
    description.textContent = current.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${current.icon}@2x.png`;
    weatherIcon.alt = current.description;

    feelsLike.textContent = `${Math.round(feels)}${unitSymbol}`;
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${current.wind_speed} km/h`;
    pressure.textContent = `${current.pressure} hPa`;

    if (data.forecast && data.forecast.length > 0) {
        displayForecast(data.forecast);
    }

    weatherDisplay.style.display = 'block';
}

function displayForecast(forecast) {
    forecastContainer.innerHTML = '';

    forecast.forEach(item => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        const dateTime = new Date(item.time);
        const timeString = dateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
        let temp = item.temperature;
        let unitSymbol = '°C';
        if (currentUnit === 'imperial') {
            temp = (temp * 9/5) + 32;
            unitSymbol = '°F';
        }
        forecastItem.innerHTML = `
            <div class="forecast-time">${timeString}</div>
            <img src="https://openweathermap.org/img/wn/${item.icon}.png" 
                 alt="${item.description}" 
                 class="forecast-icon">
            <div class="forecast-temp">${Math.round(temp)}${unitSymbol}</div>
            <div class="forecast-desc">${item.description}</div>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

function changeBackground(weatherMain) {
    document.body.classList.remove('clear', 'clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'fog', 'haze');

    const weatherLower = weatherMain.toLowerCase();

    if (weatherLower.includes('clear')) {
        document.body.classList.add('clear');
    } else if (weatherLower.includes('cloud')) {
        document.body.classList.add('clouds');
    } else if (weatherLower.includes('rain')) {
        document.body.classList.add('rain');
    } else if (weatherLower.includes('drizzle')) {
        document.body.classList.add('drizzle');
    } else if (weatherLower.includes('thunderstorm')) {
        document.body.classList.add('thunderstorm');
    } else if (weatherLower.includes('snow')) {
        document.body.classList.add('snow');
    } else if (weatherLower.includes('mist') || weatherLower.includes('fog') || weatherLower.includes('haze')) {
        document.body.classList.add('mist');
    }
}

async function saveLocation(data) {
    const current = data.current;

    try {
        const response = await fetch('/api/locations/save/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                city_name: current.city,
                country_code: current.country,
                latitude: current.coordinates.lat,
                longitude: current.coordinates.lon
            })
        });

        const result = await response.json();

        if (response.ok) {
            showError(result.message, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            if (response.status === 401) {
                showError('Please log in to save locations');
            } else {
                showError(result.error || 'Failed to save location');
            }
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Error saving location:', error);
    }
}

async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) {
        return;
    }

    try {
        const response = await fetch(`/api/locations/delete/${locationId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        const result = await response.json();

        if (response.ok) {
            showError('Location deleted successfully', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showError(result.error || 'Failed to delete location');
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Error deleting location:', error);
    }
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.location-card') && !e.target.closest('.btn-delete')) {
        const locationCard = e.target.closest('.location-card');
        const city = locationCard.dataset.city;
        cityInput.value = city;
        getWeatherByCity(city);
    }

    if (e.target.closest('.btn-delete')) {
        e.stopPropagation();
        const deleteBtn = e.target.closest('.btn-delete');
        const locationId = deleteBtn.dataset.id;
        deleteLocation(locationId);
    }
});

function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

function showError(message, type = 'error') {
    searchError.textContent = message;
    searchError.className = 'error-message show';

    if (type === 'success') {
        searchError.style.background = 'rgba(76, 175, 80, 0.9)';
        searchError.style.color = '#fff';
    } else {
        searchError.style.background = 'rgba(244, 67, 54, 0.9)';
        searchError.style.color = '#fff';
    }

    setTimeout(hideError, 5000);
}

function hideError() {
    searchError.classList.remove('show');
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Weather App initialized successfully! 🌤️');
});