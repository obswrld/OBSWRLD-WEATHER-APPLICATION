from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
import json
from weather.models import SavedLocation
from weather.utils import get_weather_data, get_forecast_data, get_weather_by_coordinates


def index(request):
    saved_location = []
    if request.user.is_authenticated:
        saved_location = SavedLocation.objects.filter(user=request.user)
    context = {
        'saved_location': saved_location,
    }
    return render(request, 'weather/index.html', context)

def get_weather(request):
    city = request.GET.get('city', '')
    unit = request.GET.get('unit', 'metric')
    if not city:
        return JsonResponse({'error': 'city parameter required'}, status=400)
    weather_data = get_weather_data(city)
    if not weather_data:
        return JsonResponse({'error': 'City not found or API error'}, status=400)
    forecast = get_forecast_data(city)
    response_data = {
        'current': {
            'city': weather_data.get('name'),
            'country': weather_data.get('sys', {}).get('country'),
            'temperature': weather_data.get('main', {}).get('temp'),
            'feels_like': weather_data.get('main', {}).get('feels_like'),
            'humidity': weather_data.get('main', {}).get('humidity'),
            'pressure': weather_data.get('main', {}).get('pressure'),
            'wind_speed': weather_data.get('wind', {}).get('speed'),
            'description': weather_data.get('weather', [{}])[0].get('description'),
            'icon': weather_data.get('weather', [{}])[0].get('icon'),
            'main': weather_data.get('weather', [{}])[0].get('main'),
            'coordinates': {
                'lat': weather_data.get('coord', {}).get('lat'),
                'lon': weather_data.get('coord', {}).get('lon'),
            }
        },
        'forecast': []
    }
    if forecast:
        forecast_list = forecast.get('list', [])[:8]
        for item in forecast_list:
            response_data['forecast'].append({
                'time': item.get('dt_txt'),
                'temperature': item.get('main', {}).get('temp'),
                'description': item.get('weather', [{}])[0].get('description'),
                'icon': item.get('weather', [{}])[0].get('icon'),
            })
    return JsonResponse(response_data)

def get_coords(request):
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    if not lat or not lon:
        return JsonResponse({'error': 'latitude and longitude required'}, status=400)
    weather_data = get_weather_by_coordinates(lat, lon)
    if not weather_data:
        return JsonResponse({'error': 'Unable to fetch weather data'}, status=400)
    response_data = {
        'current': {
            'city': weather_data.get('name'),
            'country': weather_data.get('sys', {}).get('country'),
            'temperature': weather_data.get('main', {}).get('temp'),
            'feels_like': weather_data.get('main', {}).get('feels_like'),
            'humidity': weather_data.get('main', {}).get('humidity'),
            'pressure': weather_data.get('main', {}).get('pressure'),
            'wind_speed': weather_data.get('wind', {}).get('speed'),
            'description': weather_data.get('weather', [{}])[0].get('description'),
            'icon': weather_data.get('weather', [{}])[0].get('icon'),
            'main': weather_data.get('weather', [{}])[0].get('main'),
            'coordinates': {
                'lat': weather_data.get('coord', {}).get('lat'),
                'lon': weather_data.get('coord', {}).get('lon'),
            }
        }
    }
    return JsonResponse(response_data)

@require_http_methods(["POST"])
def save_location(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication Required'}, status=401)
    try:
        data = json.loads(request.body)
        city_name = data.get('city_name')
        country_code = data.get('country_code')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        if not city_name:
            return JsonResponse({'error': 'City name required'}, status=400)
        location, created = SavedLocation.objects.get_or_create(
            user=request.user,
            city_name=city_name,
            defaults={
                'country_code': country_code,
                'latitude': latitude,
                'longitude': longitude,
            }
        )
        return JsonResponse({
            'success': True,
            'message':'Location Saved' if created else 'Location already saved'
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)


@require_http_methods(["DELETE"])
def delete_location(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication Required'}, status=401)
    try:
        location = SavedLocation.objects.get(id=id, user=request.user)
        location.delete()
        return JsonResponse({
            'success': True,
            'message': 'Location Deleted'
        })
    except SavedLocation.DoesNotExist:
        return JsonResponse({'error': 'Location not found'}, status=404)