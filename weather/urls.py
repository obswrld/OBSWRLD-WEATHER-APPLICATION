from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/weather/', views.get_weather, name='get_weather'),
    path('api/weather/coords/', views.get_weather_by_coords, name='weather_coords'),  # FIXED
    path('api/locations/save/', views.save_location, name='save_location'),
    path('api/locations/delete/<int:location_id>/', views.delete_location, name='delete_location'),  # FIXED: use location_id
]