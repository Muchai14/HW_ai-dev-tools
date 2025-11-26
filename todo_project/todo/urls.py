from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('toggle/<int:pk>/', views.toggle_done, name='toggle_done'),
    path('delete/<int:pk>/', views.delete_todo, name='delete_todo'),
]
