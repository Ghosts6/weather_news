from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('get_weather_data/', views.get_weather_data, name='get_weather_data'),
    path('get_time_zone/', views.get_time_zone , name='get_time_zone'),
    path('get_user_location/', views.get_user_location_view, name='get_user_location'),
    path('get_news/', views.get_news_view, name='get_news'),
    path('search_suggestions/', views.search_suggestions, name='search_suggestions'),
    path('map_tile/<str:layer>/<int:z>/<int:x>/<int:y>/', views.map_tile_proxy, name='map_tile_proxy'),
]