from django.test import TestCase
from django.urls import reverse
from .models import Todo

class TodoTests(TestCase):
    def test_create_todo(self):
        response = self.client.post(reverse('home'), {
            'title': 'Test task',
            'description': 'Test description',
            'due_date': '2030-01-01',
            'create': '1',
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 1)
