from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name="home"),
    path('weather/', views.weather, name="weather"),
    path('weather/home/', views.home , name="home"),
    path('get_user_location/<path:latitude>/<path:longitude>/', views.get_user_location, name='get_user_location'),
    path('search_suggestions/', views.search_suggestions, name='search_suggestions'),
]