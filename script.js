// script.js
document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');

    // Retrieve todos from localStorage or initialize as an empty array
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    /**
     * Saves the current todos array to localStorage.
     */
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    /**
     * Renders a single todo item to the DOM.
     * @param {object} todo - The todo object to render.
     */
    const renderTodo = (todo) => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        listItem.dataset.id = todo.id; // Store ID for easy access
        listItem.setAttribute('aria-label', `Todo: ${todo.text}`);
        listItem.setAttribute('role', 'listitem');

        if (todo.completed) {
            listItem.classList.add('completed');
        }

        listItem.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="action-btn complete-btn" aria-label="Mark task as complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn delete-btn" aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add 'entering' class for animation on new items
        listItem.classList.add('entering');
        todoList.prepend(listItem); // Add to the top of the list for better UX (most recent first)

        // Remove 'entering' class after animation ends to prevent re-triggering
        listItem.addEventListener('animationend', () => {
            listItem.classList.remove('entering');
        }, { once: true });

        // Event listener for complete button
        listItem.querySelector('.complete-btn').addEventListener('click', () => {
            toggleComplete(todo.id);
        });

        // Event listener for delete button
        listItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTodo(todo.id);
        });
    };

    /**
     * Adds a new todo item based on the input field's value.
     */
    const addTodo = () => {
        const text = todoInput.value.trim();
        if (text === '') {
            // Provide user feedback for empty input
            alert('Please enter a task before adding!');
            todoInput.focus();
            return;
        }

        const newTodo = {
            id: Date.now().toString(), // Unique ID based on timestamp
            text: text,
            completed: false
        };

        todos.unshift(newTodo); // Add to the beginning of the array
        saveTodos();
        renderTodo(newTodo); // Render the new todo to the DOM
        todoInput.value = ''; // Clear input field
        todoInput.focus(); // Keep focus on input for quick entry
    };

    /**
     * Toggles the completion status of a todo item.
     * Triggers CSS animations for visual feedback.
     * @param {string} id - The ID of the todo item to toggle.
     */
    const toggleComplete = (id) => {
        const todoIndex = todos.findIndex(todo => todo.id === id);
        if (todoIndex > -1) {
            const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
            if (todoItem) {
                const todoText = todoItem.querySelector('.todo-text');
                
                // Toggle the 'completed' state in the data model
                todos[todoIndex].completed = !todos[todoIndex].completed;
                saveTodos();

                // Add 'completing' class to trigger animation
                // Then immediately toggle 'completed' class which CSS uses to determine animation direction
                todoItem.classList.add('completing');
                todoItem.classList.toggle('completed', todos[todoIndex].completed);

                // Listen for the animation on the text to remove the 'completing' class
                const animationEndHandler = (event) => {
                    // Ensure we're only reacting to the text's specific animation
                    if (event.target === todoText && 
                       (event.animationName === 'strikethroughPulse' || event.animationName === 'removeStrikethroughPulse')) {
                        todoItem.classList.remove('completing');
                        todoText.removeEventListener('animationend', animationEndHandler); // Clean up listener
                    }
                };
                todoText.addEventListener('animationend', animationEndHandler);
            }
        }
    };

    /**
     * Deletes a todo item from the DOM and data model.
     * Triggers CSS exit animation before removal.
     * @param {string} id - The ID of the todo item to delete.
     */
    const deleteTodo = (id) => {
        const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
        if (todoItem) {
            todoItem.classList.add('exiting'); // Add 'exiting' class for animation

            todoItem.addEventListener('animationend', () => {
                // Remove from DOM after animation completes
                todoItem.remove();
                // Remove from todos array and save
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
            }, { once: true }); // Ensure this listener runs only once
        }
    };

    // Event listeners for adding todos
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    /**
     * Loads all saved todos and renders them on page load.
     */
    const loadTodos = () => {
        // Render in reverse order to maintain the unshift/prepend logic visually on refresh
        [...todos].reverse().forEach(todo => renderTodo(todo));
    };

    // Initial load of todos when the DOM is ready
    loadTodos();
});
