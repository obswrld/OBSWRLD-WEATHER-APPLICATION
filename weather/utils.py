import requests
from django.conf import settings
from django.core.cache import cache


def get_weather_data(city):
    cache_key = f'weather_{city}'
    cached_data = cache.get(cache_key)

    if cached_data:
        return cached_data

    api_key = settings.OPENWEATHER_API_KEY
    base_url = "http://api.openweathermap.org/data/2.5/weather"  # Changed to HTTP

    params = {
        'q': city,
        'appid': api_key,
        'units': 'metric',
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)  # Added timeout
        response.raise_for_status()
        data = response.json()

        cache.set(cache_key, data, 600)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather: {e}")
        return None


def get_forecast_data(city):
    cache_key = f'forecast_{city}'
    cached_data = cache.get(cache_key)

    if cached_data:
        return cached_data

    api_key = settings.OPENWEATHER_API_KEY
    base_url = "http://api.openweathermap.org/data/2.5/forecast"  # Changed to HTTP

    params = {
        'q': city,
        'appid': api_key,
        'units': 'metric',
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)  # Added timeout
        response.raise_for_status()
        data = response.json()

        cache.set(cache_key, data, 1800)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching forecast: {e}")
        return None


def get_weather_by_coordinates(lat, lon):
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "http://api.openweathermap.org/data/2.5/weather"  # Changed to HTTP

    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)  # Added timeout
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather by coords: {e}")
        return None