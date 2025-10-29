// 1. Get references to the necessary HTML elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const errorMessage = document.getElementById('error-message');

// --- HELPER FUNCTION: Renders a task <li> element ---
function createTaskElement(taskText, isCompleted) {
    const listItem = document.createElement('li');
    if (isCompleted) {
        listItem.classList.add('completed');
    }
    
    // Structure now includes the span for display and the Edit button
    listItem.innerHTML = `
        <span class="task-text">${taskText}</span>
        <div>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    return listItem;
}

// --- CORE STORAGE AND RENDERING LOGIC ---

// Function to save ALL tasks to Local Storage
function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(listItem => {
        tasks.push({
            // Ensure we get the text from the current display element
            text: listItem.querySelector('.task-text').textContent, 
            completed: listItem.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from Local Storage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    taskList.innerHTML = ''; 
    savedTasks.forEach(task => {
        const listItem = createTaskElement(task.text, task.completed);
        taskList.appendChild(listItem);
    });
}


// --- APPLICATION LOGIC ---

// Handles adding a new task
function addTask() {
    const taskText = taskInput.value.trim();

    // VALIDATION CHECK
    if (taskText === "") {
        errorMessage.textContent = "Task description cannot be empty.";
        errorMessage.classList.add('visible');
        taskInput.focus();
        return; 
    }
    
    // Clear any previous error message
    errorMessage.textContent = "";
    errorMessage.classList.remove('visible');

    // Proceed with adding the task
    const listItem = createTaskElement(taskText, false); 
    taskList.appendChild(listItem);
    taskInput.value = '';
    
    saveTasks(); 
}

// 🛑 NEW: Function to handle editing a task
function editTask(listItem) {
    const taskSpan = listItem.querySelector('.task-text');
    
    // Create a new input field, pre-filled with the current text
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = taskSpan.textContent;
    
    // Replace the <span> with the new <input>
    listItem.replaceChild(editInput, taskSpan);
    
    // Hide the buttons while editing
    listItem.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
    
    editInput.focus(); // Focus on the input for immediate typing

    // Function to save the changes
    const saveEdit = () => {
        const newText = editInput.value.trim();
        if (newText === "") {
            // Revert if left empty
            listItem.replaceChild(taskSpan, editInput);
            taskSpan.textContent = taskSpan.textContent;
        } else {
            // Save the new text and replace the input with the span
            taskSpan.textContent = newText;
            listItem.replaceChild(taskSpan, editInput);
        }
        
        // Show buttons again
        listItem.querySelectorAll('button').forEach(btn => btn.style.display = '');

        saveTasks(); // Persist the changes
    };

    // Save changes when user presses Enter
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });

    // Save changes when input loses focus (user clicks away)
    editInput.addEventListener('blur', saveEdit);
}


// 5. Handles all clicks within the task list area (Event Delegation)
taskList.addEventListener('click', function(event) {
    const listItem = event.target.closest('li');

    if (!listItem) return; 

    // A. Handle DELETE
    if (event.target.classList.contains('delete-btn')) {
        listItem.remove(); 
        saveTasks(); // Save after deleting
    } 
    // B. Handle EDIT
    else if (event.target.classList.contains('edit-btn')) {
        editTask(listItem); // Call the new edit function
    }
    // C. Handle MARK COMPLETE/INCOMPLETE
    else if (event.target.tagName === 'LI' || event.target.classList.contains('task-text')) {
        // Ensure we don't toggle completion when in edit mode (checking for input)
        if (!listItem.querySelector('.edit-input')) {
            listItem.classList.toggle('completed');
            saveTasks(); // Save after completing
        }
    }
});


// --- INITIALIZATION ---

// 6. INITIALIZATION: Run the load function when the page is ready
document.addEventListener('DOMContentLoaded', loadTasks);

// 7. Event listeners for the input and button
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
