from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo

def home(request):
    if request.method == "POST" and "create" in request.POST:
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        due_date = request.POST.get("due_date")

        if title:
            todo = Todo(title=title, description=description)
            if due_date:
                todo.due_date = due_date
            todo.save()
        return redirect("home")

    todos = Todo.objects.all().order_by("is_done", "due_date", "-created_at")
    return render(request, "home.html", {"todos": todos})

def toggle_done(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_done = not todo.is_done
    todo.save()
    return redirect("home")

def delete_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("home")
