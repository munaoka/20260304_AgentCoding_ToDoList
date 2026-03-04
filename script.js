// ローカルストレージからデータを読み込む
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let labels = JSON.parse(localStorage.getItem('labels')) || ['その他', '仕事', '買い物', '勉強', '健康'];
let selectedLabel = 'すべて'; // フィルター対象のラベル

// 初期化時にUIを設定
document.addEventListener('DOMContentLoaded', function() {
    // タスクを整理（古いデータでラベルプロパティがない場合は修正）
    tasks = tasks.map(task => ({
        ...task,
        label: task.label || (labels.length > 0 ? labels[0] : 'その他')
    }));
    saveTasks();
    
    updateLabelSelect();
    renderLabelFilters();
    renderLabelList();
    renderTasks();
});

// ラベル管理セクションの表示切り替え
function toggleLabelManagement() {
    const mgmt = document.getElementById('labelManagement');
    mgmt.style.display = mgmt.style.display === 'none' ? 'block' : 'none';
}

// セレクトボックスを更新する関数
function updateLabelSelect() {
    const select = document.getElementById('labelSelect');
    const currentValue = select.value;
    select.innerHTML = '';

    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        select.appendChild(option);
    });

    // 前の選択値がまだあれば復元、なければ最初の項目を選択
    if (labels.includes(currentValue)) {
        select.value = currentValue;
    }
}

// 新しいラベルを追加する関数
function addLabel() {
    const input = document.getElementById('newLabelInput');
    const labelText = input.value.trim();

    if (labelText === '') {
        alert('ラベルを入力してください');
        return;
    }

    if (labels.includes(labelText)) {
        alert('このラベルは既に存在します');
        return;
    }

    labels.push(labelText);
    saveLabels();
    updateLabelSelect();
    renderLabelFilters();
    renderLabelList();
    input.value = '';
    input.focus();
}

// ラベルを削除する関数
function deleteLabel(labelToDelete) {
    if (confirm(`「${labelToDelete}」を削除しますか？`)) {
        // ラベルを配列から削除
        labels = labels.filter(l => l !== labelToDelete);
        
        // そのラベルのタスクを「その他」に変更
        const defaultLabel = labels.length > 0 ? labels[0] : 'その他';
        tasks.forEach(task => {
            if (task.label === labelToDelete) {
                task.label = defaultLabel;
            }
        });
        
        // フィルタが削除されたラベルなら「すべて」に変更
        if (selectedLabel === labelToDelete) {
            selectedLabel = 'すべて';
        }
        
        saveLabels();
        saveTasks();
        updateLabelSelect();
        renderLabelFilters();
        renderLabelList();
        renderTasks();
    }
}

// ラベル一覧を表示する関数
function renderLabelList() {
    const labelList = document.getElementById('labelList');
    labelList.innerHTML = '';

    labels.forEach(label => {
        const item = document.createElement('div');
        item.className = 'label-item';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'label-item-text';
        textSpan.textContent = label;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'label-item-delete';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = () => deleteLabel(label);
        
        item.appendChild(textSpan);
        item.appendChild(deleteBtn);
        labelList.appendChild(item);
    });
}

// ラベルフィルターボタンを生成する関数
function renderLabelFilters() {
    const filterContainer = document.getElementById('labelFilters');
    filterContainer.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.className = `label-filter-btn ${selectedLabel === 'すべて' ? 'active' : ''}`;
    allButton.textContent = 'すべて';
    allButton.onclick = () => {
        selectedLabel = 'すべて';
        renderLabelFilters();
        renderTasks();
    };
    filterContainer.appendChild(allButton);

    labels.forEach(label => {
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

    // デバッグ情報をコンソールに出力
    console.log('Current selectedLabel:', selectedLabel);
    console.log('All tasks:', tasks);

    // 選択されたラベルに基づいてタスクをフィルタリング
    const filteredTasks = selectedLabel === 'すべて' 
        ? tasks 
        : tasks.filter(t => t.label === selectedLabel);

    console.log('Filtered tasks:', filteredTasks);

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

// ローカルストレージにラベルを保存する関数
function saveLabels() {
    localStorage.setItem('labels', JSON.stringify(labels));
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
