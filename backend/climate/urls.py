from django.contrib import admin
from django.urls import include,path

urlpatterns = [
    path('', include('weather.urls')),
    path('admin/', admin.site.urls),
]
handler404 = 'climate.views.custom_page_not_found'
handler500 = 'climate.views.custom_server_error'