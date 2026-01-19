import requests
from django.conf import settings
from django.core.cache import cache

def get_weather_app(city):
    cache_key = f'weather_{city}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    data = {
        'city': city,
        'appid': api_key,
        'units': 'metric',
    }
    try:
        response = requests.get(base_url, params=data)
        response.raise_for_status()
        data = response.json()
        cache.set(cache_key, 600)
        return data
    except requests.exceptions.RequestException as e:
        raise None

def get_forecast_data(city):
    cache_key = f'weather_{city}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "https://api.openweathermap.org/data/2.5/forecast"
    data = {
        'city': city,
        'appid': api_key,
        'units': 'metric',
    }
    try:
        response = requests.get(base_url, params=data)
        response.raise_for_status()
        data = response.json()
        cache.set(cache_key, 1800)
        return data
    except requests.exceptions.RequestException as e:
        raise None

def get_weather_by_coordinates(lat, lon):
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    data = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
    }
    try:
        response = requests.get(base_url, params=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise None
    