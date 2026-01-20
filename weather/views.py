from django.http import JsonResponse
from django.shortcuts import render
from weather.models import SavedLocation
from weather.utils import get_weather_data, get_forecast_data


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