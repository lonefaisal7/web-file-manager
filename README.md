# 🚀 Web File Manager Pro

<div align="center">
  
[![Telegram](https://img.shields.io/badge/Telegram-@lonefaisal-blue?style=for-the-badge&logo=telegram)](https://t.me/lonefaisal)

![Web File Manager Pro](https://via.placeholder.com/800x400/1a1a1a/00ff88?text=Web+File+Manager+Pro)

**Complete web-based file management with terminal access**

✨ **Created by LONE FAISAL** ✨

---

### 🌐 Powered By

<div align="center">
  
[![ARROW NETWORK](https://img.shields.io/badge/📡_ARROW_NETWORK-Join_Channel-red?style=for-the-badge&logo=telegram)](https://t.me/arrow_network)
[![KMRI NETWORK](https://img.shields.io/badge/🔗_KMRI_NETWORK-Join_Channel-green?style=for-the-badge&logo=telegram)](https://t.me/kmri_network_reborn)

</div>

---

</div>

## ✨ Features

### 🎯 Core Features

🗂️ **Complete File Management** - Create, delete, rename, upload, download files and folders  
💻 **Web Terminal** - Full command-line access through web interface  
🎨 **Beautiful UI** - Modern, responsive design with drag & drop support  
📊 **Real-time Monitoring** - Live CPU, Memory, and Disk usage  
🔐 **Secure Authentication** - Password-protected access with session management  
⚡ **Auto-start Service** - Systemd integration for VPS deployment

### 🛡️ Security Features

🔒 Password hashing with Werkzeug  
🎫 Session-based authentication  
🔧 Secure file operations  
✅ Input validation and sanitization  
🛡️ CSRF protection

### 🎨 UI/UX Features

🌈 Professional gradient themes  
📋 Context menu for file operations  
📝 Modal dialogs for all operations  
📎 Drag & drop file uploads  
📈 Real-time system information  
📱 Mobile-responsive design

---

## 🚀 One-Line Installation

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/lonefaisal7/web-file-manager/main/install.sh)"
```

### 🔧 Custom Installation with Username/Password

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/lonefaisal7/web-file-manager/main/install.sh)" -- -u yourusername -p yourpassword
```

---

## 📋 Manual Installation

### 📦 Prerequisites

- 🐧 Ubuntu/Debian VPS
- 🐍 Python 3.8+
- 👑 Root access

### 🔨 Step by Step

```bash
# 1. Clone the repository
git clone https://github.com/lonefaisal7/web-file-manager.git
cd web-file-manager

# 2. Run installation script
sudo chmod +x install.sh
sudo ./install.sh
```

---

## 🌐 Access Your File Manager

After installation, access your Web File Manager at:

🏠 **Local:** `http://localhost:8000`  
🌍 **VPS:** `http://YOUR_VPS_IP:8000`

### 🔑 Default Credentials:
- 👤 **Username:** `admin`
- 🔐 **Password:** `admin123`

---

## 🎮 Service Management

```bash
# Start the service
sudo systemctl start webfm

# Stop the service
sudo systemctl stop webfm

# Restart the service
sudo systemctl restart webfm

# Check status
sudo systemctl status webfm

# View logs
sudo journalctl -u webfm -f
```

---

## 🔧 Configuration

### 👥 User Management

Edit `/opt/webfm/config/users.json` to add/modify users:

```json
{
  "1": {
    "username": "admin",
    "password_hash": "hashed_password_here"
  },
  "2": {
    "username": "user2",
    "password_hash": "another_hashed_password"
  }
}
```

### 🌐 Port Configuration

Modify `/etc/systemd/system/webfm.service` to change port:

```ini
Environment=PORT=8000
```

---

## 🔒 Security Considerations

### ⚠️ Important Security Notes:

🚨 This tool provides full system access through web interface  
🌐 Only use on trusted networks or with proper firewall rules  
🔑 Change default credentials immediately after installation  
🔐 Consider using HTTPS in production environments  
🛡️ Implement proper network security measures

---

## 🛠️ Development

### 📁 Project Structure

```
web-file-manager/
├── 🐍 app.py                 # Main Flask application
├── ⚙️ install.sh            # One-line installer
├── 📋 requirements.txt      # Python dependencies
├── 📁 systemd/
│   └── 🔧 webfm.service    # Systemd service file
├── 📁 templates/
│   ├── 🌐 index.html       # Main UI template
│   └── 🔐 login.html       # Login page template
├── 📁 static/
│   ├── 🎨 css/
│   ├── ⚡ js/
│   │   └── 📜 app.js       # Frontend JavaScript
│   └── 🖼️ img/
└── 📁 config/
    └── 👥 users.json       # User credentials
```

### 💻 Local Development

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

If you encounter any issues or need help:

1. 📋 Check the [Issues](../../issues) page
2. 💬 Contact me on Telegram: [@lonefaisal](https://t.me/lonefaisal)
3. 🐛 Create a new issue with detailed information

---

## 🌟 Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

---

<div align="center">

### 📞 Connect With Me

[![Telegram](https://img.shields.io/badge/📱_Telegram-@lonefaisal-blue?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/lonefaisal)

### 🌐 Our Networks

[![ARROW NETWORK](https://img.shields.io/badge/📡_ARROW_NETWORK-Join_Now-ff4444?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/arrow_network)
[![KMRI NETWORK](https://img.shields.io/badge/🔗_KMRI_NETWORK-Join_Now-00aa00?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/kmri_network_reborn)

---

**Made with ❤️ by LONE FAISAL**

[![GitHub](https://img.shields.io/badge/GitHub-lonefaisal7-333?style=for-the-badge&logo=github)](https://github.com/lonefaisal7)

</div>
