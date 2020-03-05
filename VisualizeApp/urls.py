from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='site-home'), #Home
    path('about/', views.about, name='site-about'), #About
    path('map/', views.map, name='site-map'), #Map
    path('visualizations/', views.visualizations, name='site-visualizations'), #Visualizations
    path('map/get_overall_data/', views.get_overall_data, name='get-overall-data'),
    path('map/get_calls_unit/', views.get_calls_unit, name='get-calls-unit'), #Get calls/unit
    path('map/get_incidents/', views.get_incidents, name='get-incidents'),
    path('map/get_avg_response/', views.get_avg_response, name='get-avg-response'),
    #path('map/get_total_cats/', views.get_total_cats, name='get-total-cats'),
    path('map/get_avg_travel/', views.get_avg_travel, name='get-average-travel'),
    path('map/get_incident_lengths/', views.get_incident_lengths, name='get-incident-lengths'),

    path('map/get_calls_year/', views.get_calls_year, name='get-calls-year')
]