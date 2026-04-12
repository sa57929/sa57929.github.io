class Todo {
    constructor() {
        this.storageKey = 'ptw-lab-b-tasks';
        this.tasks = this.load();
        this.searchPhrase = '';
        this.editingId = null;

        this.taskListEl = document.querySelector('#taskList');
        this.taskFormEl = document.querySelector('#taskForm');
        this.taskInputEl = document.querySelector('#taskInput');
        this.deadlineInputEl = document.querySelector('#deadlineInput');
        this.searchInputEl = document.querySelector('#searchInput');
        this.messageBoxEl = document.querySelector('#messageBox');

        this.bindEvents();
        this.draw();
    }

    bindEvents() {
        this.taskFormEl.addEventListener('submit', (event) => {
            event.preventDefault();
            this.add(this.taskInputEl.value, this.deadlineInputEl.value);
        });

        this.searchInputEl.addEventListener('input', (event) => {
            this.searchPhrase = event.target.value.trim();
            this.draw();
        });

        document.addEventListener('click', (event) => {
            if (this.editingId === null) {
                return;
            }

            const clickedInsideEditedRow = event.target.closest('.task-item.editing');
            if (!clickedInsideEditedRow) {
                this.saveEdit(this.editingId);
            }
        });
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('localstorage retrieval didnt work', error);
            return [];
        }
    }

    persist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    validateText(text) {
        const trimmed = text.trim();
        if (trimmed.length < 3) {
            return 'zadanie musi miec wiecej niz 3 znaki';
        }
        if (trimmed.length > 255) {
            return 'zadanie moze miec max 255 znakow.';
        }
        return '';
    }

    validateDate(deadline) {
        if (!deadline) {
            return '';
        }

        const parsedDate = new Date(deadline);
        if (Number.isNaN(parsedDate.getTime())) {
            return 'nie data';
        }

        if (parsedDate.getTime() <= Date.now()) {
            return 'termin musi byc nieustawiony albo w przyszlosci';
        }

        return '';
    }

    setMessage(message = '', isError = false) {
        this.messageBoxEl.textContent = message;
        this.messageBoxEl.className = isError ? 'message error' : 'message';
    }

    add(text, deadline) {
        const textError = this.validateText(text);
        const dateError = this.validateDate(deadline);

        if (textError || dateError) {
            this.setMessage(textError || dateError, true);
            return;
        }

        this.tasks.unshift({
            id: crypto.randomUUID(),
            text: text.trim(),
            deadline: deadline || '',
            done: false,
        });

        this.persist();
        this.taskFormEl.reset();
        this.setMessage('Dodano zadanie.');
        this.draw();
    }

    remove(id) {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.persist();
        this.setMessage('usunieto zadanie.');
        this.draw();
    }

    toggleDone(id) {
        this.tasks = this.tasks.map((task) => (
            task.id === id ? { ...task, done: !task.done } : task
        ));
        this.persist();
        this.draw();
    }

    startEdit(id) {
        this.editingId = id;
        this.setMessage('');
        this.draw();

        const row = document.querySelector(`.task-item[data-id="${id}"]`);
        const textInput = row?.querySelector('.edit-input');
        if (textInput) {
            textInput.focus();
            textInput.select();
        }
    }

    saveEdit(id) {
        const row = document.querySelector(`.task-item[data-id="${id}"]`);
        if (!row) {
            this.editingId = null;
            this.draw();
            return;
        }

        const text = row.querySelector('.edit-input')?.value ?? '';
        const deadline = row.querySelector('.edit-date-input')?.value ?? '';

        const textError = this.validateText(text);
        const dateError = this.validateDate(deadline);

        if (textError || dateError) {
            this.setMessage(textError || dateError, true);
            return;
        }

        this.tasks = this.tasks.map((task) => (
            task.id === id ? { ...task, text: text.trim(), deadline } : task
        ));

        this.editingId = null;
        this.persist();
        this.setMessage('apisano zmiany');
        this.draw();
    }

    cancelEdit() {
        this.editingId = null;
        this.setMessage('aanulowano edycje');
        this.draw();
    }

    getFilteredTasks() {
        const phrase = this.searchPhrase.trim().toLowerCase();
        if (phrase.length < 2) {
            return this.tasks;
        }

        return this.tasks.filter((task) => task.text.toLowerCase().includes(phrase));
    }

    escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    highlight(text) {
        const safeText = this.escapeHtml(text);
        const phrase = this.searchPhrase.trim();

        if (phrase.length < 2) {
            return safeText;
        }

        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedPhrase})`, 'gi');
        return safeText.replace(regex, '<mark>$1</mark>');
    }

    formatDeadline(deadline) {
        if (!deadline) {
            return 'Brak terminu';
        }

        const date = new Date(deadline);
        if (Number.isNaN(date.getTime())) {
            return 'Brak terminu';
        }

        return new Intl.DateTimeFormat('pl-PL', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    }

    draw() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const noResultsMessage = this.searchPhrase.trim().length >= 2
                ? 'Brak wynikow'
                : 'Lista zadan pusta';

            this.taskListEl.innerHTML = `<li class="empty-state">${noResultsMessage}</li>`;
            return;
        }

        this.taskListEl.innerHTML = filteredTasks.map((task) => {
            const isEditing = this.editingId === task.id;

            if (isEditing) {
                return `
            <li class="task-item editing" data-id="${task.id}">
              <input class="edit-checkbox" type="checkbox" ${task.done ? 'checked' : ''}>
              <div class="edit-container task-main">
                <input class="edit-input" type="text" value="${this.escapeHtml(task.text)}">
                <input class="edit-date-input" type="datetime-local" value="${task.deadline}">
                <div class="edit-actions">
                  <button type="button" class="save-btn">Zapisz</button>
                  <button type="button" class="cancel-btn">Anuluj</button>
                </div>
              </div>
            </li>
          `;
            }

            return `
  <li class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
    <input class="toggle-checkbox" type="checkbox" ${task.done ? 'checked' : ''}>
    <div class="task-main">
      <div class="task-text">${this.highlight(task.text)}</div>
    </div>
    <div class="task-date">${this.formatDeadline(task.deadline)}</div>
    <button type="button" class="icon-btn edit-btn">Edytuj</button>
    <button type="button" class="icon-btn delete-btn">X</button>
  </li>
`;
        }).join('');

        this.attachRowEvents();
    }

    attachRowEvents() {
        this.taskListEl.querySelectorAll('.toggle-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => {
                const id = event.target.closest('.task-item')?.dataset.id;
                if (id) {
                    this.toggleDone(id);
                }
            });
        });

        const openEditor = (event) => {
            event.stopPropagation();

            const id = event.target.closest('.task-item')?.dataset.id;
            if (!id) {
                return;
            }

            if (this.editingId !== null && this.editingId !== id) {
                const previousEditingId = this.editingId;
                this.saveEdit(previousEditingId);

                if (this.editingId !== null) {
                    return;
                }
            }

            this.startEdit(id);
        };

        this.taskListEl.querySelectorAll('.task-text').forEach((textEl) => {
            textEl.addEventListener('click', openEditor);
        });

        this.taskListEl.querySelectorAll('.edit-btn').forEach((button) => {
            button.addEventListener('click', openEditor);
        });

        this.taskListEl.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const id = event.target.closest('.task-item')?.dataset.id;
                if (!id) {
                    return;
                }

                if (this.editingId !== null && this.editingId !== id) {
                    this.saveEdit(this.editingId);
                    if (this.editingId !== null) {
                        return;
                    }
                }

                this.remove(id);
            });
        });

        this.taskListEl.querySelectorAll('.save-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const id = event.target.closest('.task-item')?.dataset.id;
                if (id) {
                    this.saveEdit(id);
                }
            });
        });

        this.taskListEl.querySelectorAll('.cancel-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                this.cancelEdit();
            });
        });

        this.taskListEl.querySelectorAll('.edit-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => {
                const id = event.target.closest('.task-item')?.dataset.id;
                if (!id) {
                    return;
                }
                this.toggleDone(id);
                this.editingId = id;
                this.draw();
            });
        });

        this.taskListEl.querySelectorAll('.edit-input, .edit-date-input').forEach((input) => {
            input.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.todo = new Todo();
});