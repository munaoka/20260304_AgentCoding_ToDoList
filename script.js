// ローカルストレージからタスク一覧を読み込む
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let selectedLabel = 'すべて'; // フィルター対象のラベル

const LABELS = ['すべて', 'その他', '仕事', '買い物', '勉強', '健康'];

// 初期化時にタスク一覧を表示
document.addEventListener('DOMContentLoaded', function() {
    renderLabelFilters();
    renderTasks();
});

// ラベルフィルターボタンを生成する関数
function renderLabelFilters() {
    const filterContainer = document.getElementById('labelFilters');
    filterContainer.innerHTML = '';

    LABELS.forEach(label => {
        const button = document.createElement('button');
        button.className = `label-filter-btn ${label === selectedLabel ? 'active' : ''}`;
        button.textContent = label;
        button.onclick = () => {
            selectedLabel = label;
            renderLabelFilters();
            renderTasks();
        };
        filterContainer.appendChild(button);
    });
}

// タスクを追加する関数
function addTask() {
    const input = document.getElementById('taskInput');
    const labelSelect = document.getElementById('labelSelect');
    const taskText = input.value.trim();
    const selectedLabelValue = labelSelect.value;

    if (taskText === '') {
        alert('タスクを入力してください');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        label: selectedLabelValue,
        completed: false,
        createdAt: new Date().toLocaleString('ja-JP')
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
}

// タスクの完了状態を切り替える関数
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// タスクを削除する関数
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// 完了したタスクをすべて削除する関数
function clearCompleted() {
    if (tasks.some(t => t.completed)) {
        if (confirm('完了したタスクをすべて削除しますか？')) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        }
    } else {
        alert('完了したタスクがありません');
    }
}

// タスク一覧を画面に表示する関数
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const totalCount = document.getElementById('totalCount');
    const completedCount = document.getElementById('completedCount');

    taskList.innerHTML = '';

    // 選択されたラベルに基づいてタスクをフィルタリング
    const filteredTasks = selectedLabel === 'すべて' 
        ? tasks 
        : tasks.filter(t => t.label === selectedLabel);

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">タスクがありません</div>';
        totalCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(t => t.completed).length;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-label">${escapeHtml(task.label)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">削除</button>
        `;
        
        taskList.appendChild(li);
    });

    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
}

// ローカルストレージにタスクを保存する関数
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// XSS対策: HTMLをエスケープする関数
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
