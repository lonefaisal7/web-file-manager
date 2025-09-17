let currentPath = '/';
let selectedFile = null;
let socket = null;
let terminalId = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Web File Manager Pro - Initializing...');
    loadFiles('/');
    updateSystemInfo();
    setInterval(updateSystemInfo, 5000);
    
    // Initialize drag and drop
    initializeDragDrop();
    
    // Initialize modals
    initializeModals();
    
    // Initialize context menu
    initializeContextMenu();
    
    console.log('✅ Web File Manager Pro - Ready!');
});

// Switch between views
function switchView(view) {
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (view === 'files') {
        document.getElementById('files-view').style.display = 'block';
        document.getElementById('terminal-view').style.display = 'none';
    } else if (view === 'terminal') {
        document.getElementById('files-view').style.display = 'none';
        document.getElementById('terminal-view').style.display = 'block';
        if (!socket) {
            initializeTerminal();
        }
    }
}

// Load files
async function loadFiles(path) {
    try {
        console.log(`📁 Loading files from: ${path}`);
        const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Error loading files:', data.error);
            showNotification('Error: ' + data.error, 'error');
            return;
        }
        
        currentPath = data.path;
        document.getElementById('breadcrumb').textContent = currentPath;
        
        const grid = document.getElementById('file-grid');
        grid.innerHTML = '';
        
        if (data.items.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-folder-open" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #999; margin-bottom: 10px;">This folder is empty</h3>
                <p style="color: #bbb;">Upload files or create a new folder to get started</p>
            `;
            emptyState.style.cssText = 'text-align: center; padding: 60px; grid-column: 1 / -1;';
            grid.appendChild(emptyState);
            return;
        }
        
        data.items.forEach(item => {
            const fileElement = createFileElement(item);
            grid.appendChild(fileElement);
        });
        
        console.log(`✅ Loaded ${data.items.length} items`);
    } catch (error) {
        console.error('❌ Error loading files:', error);
        showNotification('Failed to load files', 'error');
    }
}

// Create file element
function createFileElement(item) {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.dataset.path = item.path;
    div.dataset.type = item.type;
    div.dataset.name = item.name;
    
    const iconClass = item.type === 'directory' ? 'fas fa-folder folder-icon' : getFileIcon(item.name);
    
    div.innerHTML = `
        <div class="file-icon ${item.type}">
            <i class="${iconClass}"></i>
        </div>
        <div class="file-name" title="${item.name}">${truncateFilename(item.name, 20)}</div>
        <div class="file-info">
            ${item.size} ${item.modified !== '-' ? '• ' + item.modified : ''}
        </div>
    `;
    
    // Double-click handler
    div.addEventListener('dblclick', function() {
        if (item.type === 'directory') {
            loadFiles(item.path);
        } else {
            // For files, show download option or edit if text file
            if (isTextFile(item.name)) {
                editFile(item);
            } else {
                downloadFile(item.path);
            }
        }
    });
    
    // Single-click handler
    div.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        selectedFile = item;
    });
    
    // Right-click handler
    div.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (item.name !== '..') {
            selectedFile = item;
            showContextMenu(e.clientX, e.clientY);
        }
    });
    
    return div;
}

// Get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        // Images
        'jpg': 'fas fa-image',
        'jpeg': 'fas fa-image',
        'png': 'fas fa-image',
        'gif': 'fas fa-image',
        'svg': 'fas fa-image',
        'webp': 'fas fa-image',
        
        // Videos
        'mp4': 'fas fa-video',
        'avi': 'fas fa-video',
        'mov': 'fas fa-video',
        'wmv': 'fas fa-video',
        'flv': 'fas fa-video',
        'webm': 'fas fa-video',
        
        // Audio
        'mp3': 'fas fa-music',
        'wav': 'fas fa-music',
        'flac': 'fas fa-music',
        'aac': 'fas fa-music',
        'ogg': 'fas fa-music',
        
        // Documents
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'txt': 'fas fa-file-alt',
        'rtf': 'fas fa-file-alt',
        
        // Spreadsheets
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'csv': 'fas fa-file-excel',
        
        // Presentations
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        
        // Archives
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        '7z': 'fas fa-file-archive',
        'tar': 'fas fa-file-archive',
        'gz': 'fas fa-file-archive',
        
        // Code
        'html': 'fas fa-code',
        'css': 'fas fa-code',
        'js': 'fas fa-code',
        'php': 'fas fa-code',
        'py': 'fas fa-code',
        'java': 'fas fa-code',
        'cpp': 'fas fa-code',
        'c': 'fas fa-code',
        'json': 'fas fa-code',
        'xml': 'fas fa-code'
    };
    
    return iconMap[ext] || 'fas fa-file file';
}

// Check if file is text-based for editing
function isTextFile(filename) {
    const textExtensions = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'php', 'py', 'java', 'cpp', 'c', 'sh', 'yml', 'yaml', 'conf', 'cfg', 'ini', 'log'];
    const ext = filename.split('.').pop().toLowerCase();
    return textExtensions.includes(ext);
}

// Truncate filename for display
function truncateFilename(filename, maxLength) {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop();
    const name = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = name.substring(0, maxLength - ext.length - 4) + '...';
    return truncatedName + '.' + ext;
}

// Navigation functions
function goBack() {
    if (currentPath !== '/') {
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        loadFiles(parentPath || '/');
    }
}

function goHome() {
    loadFiles('/');
}

function refreshFiles() {
    loadFiles(currentPath);
    showNotification('Files refreshed', 'success');
}

// System info
async function updateSystemInfo() {
    try {
        const response = await fetch('/api/system_info');
        const data = await response.json();
        
        document.getElementById('cpu-usage').innerHTML = `<i class="fas fa-microchip"></i> CPU: ${data.cpu}`;
        document.getElementById('memory-usage').innerHTML = `<i class="fas fa-memory"></i> Memory: ${data.memory}`;
        document.getElementById('disk-usage').innerHTML = `<i class="fas fa-hdd"></i> Disk: ${data.disk}`;
    } catch (error) {
        console.error('Error updating system info:', error);
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function initializeModals() {
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.style.overflow = '';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = '';
        }
    });
}

// File operations
async function createFolder() {
    const name = document.getElementById('folderName').value.trim();
    if (!name) {
        showNotification('Please enter a folder name', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/create_folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent_path: currentPath,
                name: name
            })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('createFolder');
            document.getElementById('folderName').value = '';
            refreshFiles();
            showNotification(`Folder "${name}" created successfully`, 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error creating folder:', error);
        showNotification('Failed to create folder', 'error');
    }
}

async function deleteFile() {
    if (!selectedFile) return;
    
    const itemType = selectedFile.type === 'directory' ? 'folder' : 'file';
    if (confirm(`Are you sure you want to delete this ${itemType}?\n\n"${selectedFile.name}"\n\nThis action cannot be undone.`)) {
        try {
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: selectedFile.path
                })
            });
            
            const data = await response.json();
            if (data.success) {
                refreshFiles();
                hideContextMenu();
                showNotification(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`, 'success');
            } else {
                showNotification('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            showNotification('Failed to delete ' + itemType, 'error');
        }
    }
}

async function renameFile() {
    const newName = document.getElementById('newName').value.trim();
    if (!newName || !selectedFile) {
        showNotification('Please enter a new name', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_path: selectedFile.path,
                new_name: newName
            })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('renameFile');
            document.getElementById('newName').value = '';
            refreshFiles();
            hideContextMenu();
            showNotification(`Renamed to "${newName}"`, 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error renaming file:', error);
        showNotification('Failed to rename item', 'error');
    }
}

function downloadFile(path = null) {
    const filePath = path || (selectedFile ? selectedFile.path : null);
    if (filePath) {
        const link = document.createElement('a');
        link.href = `/api/download?path=${encodeURIComponent(filePath)}`;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        hideContextMenu();
        showNotification('Download started', 'success');
    }
}

async function editFile(file = null) {
    const fileToEdit = file || selectedFile;
    if (!fileToEdit || fileToEdit.type === 'directory') return;
    
    try {
        const response = await fetch(`/api/edit?path=${encodeURIComponent(fileToEdit.path)}`);
        const data = await response.json();
        
        if (data.error) {
            showNotification('Error: ' + data.error, 'error');
            return;
        }
        
        document.getElementById('fileContent').value = data.content;
        openModal('editFile');
        hideContextMenu();
    } catch (error) {
        console.error('Error loading file content:', error);
        showNotification('Failed to load file content', 'error');
    }
}

async function saveFile() {
    if (!selectedFile) return;
    
    const content = document.getElementById('fileContent').value;
    
    try {
        const response = await fetch('/api/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: selectedFile.path,
                content: content
            })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editFile');
            showNotification('File saved successfully', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showNotification('Failed to save file', 'error');
    }
}

// File upload
function initializeDragDrop() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });
}

async function handleFileUpload(files) {
    let successCount = 0;
    let totalFiles = files.length;
    
    showNotification(`Uploading ${totalFiles} file(s)...`, 'info');
    
    for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                successCount++;
            } else {
                console.error(`Error uploading ${file.name}:`, data.error);
                showNotification(`Error uploading ${file.name}: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification(`Failed to upload ${file.name}`, 'error');
        }
    }
    
    if (successCount > 0) {
        refreshFiles();
        showNotification(`${successCount} of ${totalFiles} file(s) uploaded successfully`, 'success');
    }
}

async function uploadFiles() {
    const fileInput = document.getElementById('upload-input');
    if (fileInput.files.length === 0) {
        showNotification('Please select files to upload', 'error');
        return;
    }
    
    await handleFileUpload(fileInput.files);
    closeModal('uploadFile');
    fileInput.value = '';
}

// Context menu
function initializeContextMenu() {
    document.addEventListener('click', hideContextMenu);
    
    // Prepare rename modal when opened
    document.addEventListener('click', function(e) {
        if (e.target.onclick && e.target.onclick.toString().includes("openModal('renameFile')")) {
            setTimeout(() => {
                if (selectedFile) {
                    document.getElementById('newName').value = selectedFile.name;
                }
            }, 100);
        }
    });
}

function showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    // Adjust position if menu goes off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = (y - rect.height) + 'px';
    }
}

function hideContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
}

// Terminal functions
function initializeTerminal() {
    console.log('🖥️ Initializing terminal...');
    socket = io();
    
    socket.on('connect', function() {
        console.log('🔌 Connected to server');
        socket.emit('start_terminal');
    });
    
    socket.on('terminal_started', function(data) {
        terminalId = data.terminal_id;
        console.log('✅ Terminal started:', terminalId);
        const terminal = document.getElementById('terminal-output');
        terminal.innerHTML = '<span style="color: #00ff41;">🚀 Web File Manager Pro Terminal - Ready!</span><br><span style="color: #888;">Type commands and press Enter. Use "exit" to close terminal.</span><br><br>';
    });
    
    socket.on('terminal_output', function(data) {
        if (data.terminal_id === terminalId) {
            const terminal = document.getElementById('terminal-output');
            terminal.innerHTML += data.output.replace(/\n/g, '<br>');
            terminal.scrollTop = terminal.scrollHeight;
        }
    });
    
    socket.on('terminal_error', function(data) {
        const terminal = document.getElementById('terminal-output');
        terminal.innerHTML += `<span style="color: #ff6b6b;">❌ Error: ${data.error}</span><br>`;
        terminal.scrollTop = terminal.scrollHeight;
    });
    
    // Terminal input handler
    document.getElementById('terminal-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            this.value = '';
            
            if (command === 'clear') {
                document.getElementById('terminal-output').innerHTML = '';
                return;
            }
            
            if (terminalId && command) {
                socket.emit('terminal_input', {
                    terminal_id: terminalId,
                    command: command
                });
                
                const terminal = document.getElementById('terminal-output');
                terminal.innerHTML += `<span style="color: #00d4ff;">$ ${command}</span><br>`;
                terminal.scrollTop = terminal.scrollHeight;
            }
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f1aeb5' : '#bee5eb'};
        border-radius: 8px;
        padding: 15px 20px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification button {
            background: none;
            border: none;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
        }
        .notification button:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Global click handler to deselect files
document.addEventListener('click', function(e) {
    if (!e.target.closest('.file-item') && !e.target.closest('.context-menu')) {
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
        selectedFile = null;
    }
});
