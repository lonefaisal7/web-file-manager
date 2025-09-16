import os
import sys
import json
import subprocess
import threading
import time
from datetime import datetime, timedelta
from functools import wraps
import shutil
import mimetypes
import zipfile
import tarfile
from pathlib import Path

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_file, flash, Response
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import psutil

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# User class
class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash

# Load users from config
def load_users():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'users.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'users.json')
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    with open(config_path, 'w') as f:
        json.dump(users, f, indent=2)

@login_manager.user_loader
def load_user(user_id):
    users = load_users()
    if user_id in users:
        user_data = users[user_id]
        return User(user_id, user_data['username'], user_data['password_hash'])
    return None

# Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        users = load_users()
        for user_id, user_data in users.items():
            if user_data['username'] == username and check_password_hash(user_data['password_hash'], password):
                user = User(user_id, username, user_data['password_hash'])
                login_user(user)
                return redirect(url_for('index'))
        
        flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('index.html', username=current_user.username)

@app.route('/api/files')
@login_required
def list_files():
    path = request.args.get('path', '/')
    try:
        if not os.path.exists(path):
            return jsonify({'error': 'Path does not exist'}), 404
        
        files = []
        dirs = []
        
        # Add parent directory link if not root
        if path != '/':
            dirs.append({
                'name': '..',
                'path': os.path.dirname(path),
                'type': 'directory',
                'size': '-',
                'modified': '-'
            })
        
        for item in sorted(os.listdir(path)):
            item_path = os.path.join(path, item)
            try:
                stat = os.stat(item_path)
                modified = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
                
                if os.path.isdir(item_path):
                    dirs.append({
                        'name': item,
                        'path': item_path,
                        'type': 'directory',
                        'size': '-',
                        'modified': modified
                    })
                else:
                    size = f"{stat.st_size:,} bytes"
                    if stat.st_size > 1024:
                        size = f"{stat.st_size/1024:.1f} KB"
                    if stat.st_size > 1024*1024:
                        size = f"{stat.st_size/(1024*1024):.1f} MB"
                    if stat.st_size > 1024*1024*1024:
                        size = f"{stat.st_size/(1024*1024*1024):.1f} GB"
                    
                    files.append({
                        'name': item,
                        'path': item_path,
                        'type': 'file',
                        'size': size,
                        'modified': modified
                    })
            except (OSError, PermissionError):
                continue
        
        return jsonify({
            'path': path,
            'items': dirs + files
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create_folder', methods=['POST'])
@login_required
def create_folder():
    data = request.get_json()
    folder_path = os.path.join(data['parent_path'], data['name'])
    
    try:
        os.makedirs(folder_path, exist_ok=True)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['POST'])
@login_required
def delete_item():
    data = request.get_json()
    path = data['path']
    
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rename', methods=['POST'])
@login_required
def rename_item():
    data = request.get_json()
    old_path = data['old_path']
    new_name = data['new_name']
    new_path = os.path.join(os.path.dirname(old_path), new_name)
    
    try:
        os.rename(old_path, new_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['file']
    target_path = request.form.get('path', '/')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(target_path, filename)
        file.save(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download')
@login_required
def download_file():
    path = request.args.get('path')
    if not path or not os.path.exists(path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(path, as_attachment=True)

@app.route('/api/edit', methods=['GET', 'POST'])
@login_required
def edit_file():
    path = request.args.get('path') if request.method == 'GET' else request.get_json()['path']
    
    if request.method == 'GET':
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            return jsonify({'content': content})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    else:  # POST
        try:
            data = request.get_json()
            with open(path, 'w', encoding='utf-8') as f:
                f.write(data['content'])
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/system_info')
@login_required
def system_info():
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return jsonify({
            'cpu': f"{cpu_percent:.1f}%",
            'memory': f"{memory.percent:.1f}%",
            'disk': f"{(disk.used / disk.total) * 100:.1f}%",
            'uptime': time.time() - psutil.boot_time()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Terminal functionality
active_terminals = {}

@socketio.on('start_terminal')
def handle_start_terminal():
    terminal_id = str(time.time())
    try:
        proc = subprocess.Popen(
            ['bash'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=0
        )
        active_terminals[terminal_id] = proc
        emit('terminal_started', {'terminal_id': terminal_id})
        
        # Start reading output
        def read_output():
            while proc.poll() is None:
                try:
                    output = proc.stdout.readline()
                    if output:
                        socketio.emit('terminal_output', {
                            'terminal_id': terminal_id,
                            'output': output
                        })
                except:
                    break
        
        threading.Thread(target=read_output, daemon=True).start()
        
    except Exception as e:
        emit('terminal_error', {'error': str(e)})

@socketio.on('terminal_input')
def handle_terminal_input(data):
    terminal_id = data['terminal_id']
    command = data['command']
    
    if terminal_id in active_terminals:
        proc = active_terminals[terminal_id]
        try:
            proc.stdin.write(command + '\n')
            proc.stdin.flush()
        except:
            emit('terminal_error', {'error': 'Terminal connection lost'})

@socketio.on('close_terminal')
def handle_close_terminal(data):
    terminal_id = data['terminal_id']
    if terminal_id in active_terminals:
        proc = active_terminals[terminal_id]
        proc.terminate()
        del active_terminals[terminal_id]

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)