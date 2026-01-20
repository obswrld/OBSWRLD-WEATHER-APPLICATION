from django.urls import path
from . import views

app_name = 'weather'

urlpatterns = [
    path('', views.index, name='weather'),
    path('api/weather', views.get_weather, name='get_weather'),
    path('api/weather/coords', views.get_weather_by_coordinates, name='get_weather_by_coordinates'),
    path('api/weather/save', views.save_location, name='save_location'),
    path('api/weather/delete/<int:id>', views.delete_location, name='delete_location'),
]