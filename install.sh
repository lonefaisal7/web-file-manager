#!/usr/bin/env bash
set -euo pipefail

# ╔═════════════════════════════════════════════════════════════╗
# ║                    WEB FILE MANAGER PRO                     ║
# ║                   by LONE FAISAL                            ║
# ║              https://github.com/lonefaisal7                 ║
# ║                 Telegram: @lonefaisal                       ║
# ║                                                             ║
# ║  Complete web-based file management with terminal access    ║
# ╚═════════════════════════════════════════════════════════════╝

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/lonefaisal7/web-file-manager.git"
BRANCH="main"
INSTALL_DIR="/opt/webfm"
SERVICE_NAME="webfm"
PORT="8000"

# Default credentials
USERNAME="admin"
PASSWORD="admin123"

# Parse command line arguments
while getopts "u:p:h" opt; do
  case $opt in
    u) USERNAME="$OPTARG" ;;
    p) PASSWORD="$OPTARG" ;;
    h) 
      echo "Usage: install.sh [-u username] [-p password]"
      echo "Options:"
      echo "  -u username    Set admin username (default: admin)"
      echo "  -p password    Set admin password (default: admin123)"
      echo "  -h            Show this help message"
      exit 0
      ;;
    \?) 
      echo "Invalid option: -$OPTARG" >&2
      echo "Use -h for help"
      exit 1
      ;;
  esac
done

# Print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Print banner
print_banner() {
    clear
    print_color $CYAN "
╔═════════════════════════════════════════════════════════════╗
║                    WEB FILE MANAGER PRO                     ║
║                   by LONE FAISAL                            ║
║              https://github.com/lonefaisal7                 ║
║                 Telegram: @lonefaisal                       ║
║                                                             ║
║  Complete web-based file management with terminal access    ║
╚═════════════════════════════════════════════════════════════╝
    "
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_color $RED "❌ This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check system compatibility
check_system() {
    if ! command -v apt-get &> /dev/null; then
        print_color $RED "❌ This installer is designed for Ubuntu/Debian systems"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_color $YELLOW "⚠️  Python3 not found, will be installed"
    fi
}

# Install system dependencies
install_dependencies() {
    print_color $YELLOW "📦 Installing system dependencies..."
    
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq \
        git \
        curl \
        python3 \
        python3-venv \
        python3-pip \
        build-essential \
        python3-dev
    
    print_color $GREEN "✅ System dependencies installed!"
}

# Clone repository
clone_repository() {
    print_color $YELLOW "📡 Cloning Web File Manager repository..."
    
    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        print_color $YELLOW "⚠️  Removing existing installation..."
        rm -rf "$INSTALL_DIR"
    fi
    
    # Clone repository
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$INSTALL_DIR"
    
    print_color $GREEN "✅ Repository cloned successfully!"
}

# Setup Python environment
setup_python_env() {
    print_color $YELLOW "🐍 Setting up Python virtual environment..."
    
    cd "$INSTALL_DIR"
    
    # Create virtual environment
    python3 -m venv .venv
    
    # Activate virtual environment and install dependencies
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_color $GREEN "✅ Python environment setup complete!"
}

# Create user configuration
create_user_config() {
    print_color $YELLOW "👤 Creating user configuration..."
    
    mkdir -p "$INSTALL_DIR/config"
    
    # Generate password hash
    cd "$INSTALL_DIR"
    source .venv/bin/activate
    
    HASHED=$(python3 -c "
from werkzeug.security import generate_password_hash
print(generate_password_hash('$PASSWORD'))
")
    
    # Create users.json
    cat > "$INSTALL_DIR/config/users.json" <<JSON
{
  "1": {
    "username": "$USERNAME",
    "password_hash": "$HASHED"
  }
}
JSON
    
    chmod 600 "$INSTALL_DIR/config/users.json"
    
    print_color $GREEN "✅ User configuration created!"
    print_color $CYAN "   Username: $USERNAME"
    print_color $CYAN "   Password: [PROTECTED]"
}

# Create systemd service
create_systemd_service() {
    print_color $YELLOW "⚙️  Creating systemd service..."
    
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<UNIT
[Unit]
Description=Web File Manager Pro by LONE FAISAL
Documentation=https://github.com/lonefaisal7/web-file-manager
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment=PORT=$PORT
Environment=FLASK_ENV=production
ExecStart=$INSTALL_DIR/.venv/bin/python $INSTALL_DIR/app.py
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$INSTALL_DIR

[Install]
WantedBy=multi-user.target
UNIT
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    print_color $GREEN "✅ Systemd service created and enabled!"
}

# Set proper permissions
set_permissions() {
    print_color $YELLOW "🔐 Setting file permissions..."
    
    chown -R root:root "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    chmod 600 "$INSTALL_DIR/config/users.json"
    
    # Create logs directory
    mkdir -p "$INSTALL_DIR/logs"
    chmod 755 "$INSTALL_DIR/logs"
    
    print_color $GREEN "✅ Permissions set correctly!"
}

# Configure firewall (if available)
configure_firewall() {
    print_color $YELLOW "🔥 Configuring firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw allow ${PORT}/tcp >/dev/null 2>&1 || true
        print_color $GREEN "✅ Firewall configured (UFW)"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=${PORT}/tcp >/dev/null 2>&1 || true
        firewall-cmd --reload >/dev/null 2>&1 || true
        print_color $GREEN "✅ Firewall configured (FirewallD)"
    else
        print_color $YELLOW "⚠️  No firewall detected - please manually open port $PORT"
    fi
}

# Start service
start_service() {
    print_color $YELLOW "🚀 Starting Web File Manager service..."
    
    systemctl start "$SERVICE_NAME"
    sleep 3
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_color $GREEN "✅ Web File Manager started successfully!"
    else
        print_color $RED "❌ Failed to start Web File Manager!"
        print_color $YELLOW "📋 Checking logs..."
        journalctl -u "$SERVICE_NAME" --no-pager -n 20
        exit 1
    fi
}

# Show final information
show_final_info() {
    local server_ip
    server_ip=$(curl -fsSL https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}' || echo "YOUR_VPS_IP")
    
    print_color $GREEN "
╔══════════════════════════════════════════════════════════════╗
║                    🎉 INSTALLATION COMPLETE! 🎉             ║
╚══════════════════════════════════════════════════════════════╝

🌐 ACCESS INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 URLs:
   • Local:   http://localhost:$PORT
   • Network: http://$server_ip:$PORT

👤 Login Credentials:
   • Username: $USERNAME
   • Password: [PROTECTED]

📋 MANAGEMENT COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Service Control:
   sudo systemctl start $SERVICE_NAME      # Start service
   sudo systemctl stop $SERVICE_NAME       # Stop service
   sudo systemctl restart $SERVICE_NAME    # Restart service
   sudo systemctl status $SERVICE_NAME     # Check status

📊 Monitoring:
   sudo journalctl -u $SERVICE_NAME -f     # View live logs
   sudo systemctl is-active $SERVICE_NAME  # Check if running

🔧 Configuration:
   nano $INSTALL_DIR/config/users.json     # Edit users
   nano /etc/systemd/system/$SERVICE_NAME.service # Edit service

🚀 FEATURES AVAILABLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Complete file management (upload, download, edit, delete)
✨ Web-based terminal with full system access
✨ Beautiful responsive UI with drag & drop
✨ Real-time system monitoring (CPU, Memory, Disk)
✨ Secure authentication and session management
✨ Context menus and modal dialogs
✨ Auto-start on system boot

🛡️  SECURITY REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Change default password immediately after first login
⚠️  Only use on trusted networks or with proper firewall rules  
⚠️  This tool provides full system access - use responsibly
⚠️  Consider implementing HTTPS for production use

📞 SUPPORT & CONTACT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Telegram: https://t.me/lonefaisal
🐙 GitHub:   https://github.com/lonefaisal7
📁 Project:  https://github.com/lonefaisal7/web-file-manager

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created with ❤️  by LONE FAISAL
Thank you for using Web File Manager Pro! 🚀
    "
}

# Main installation function
main() {
    print_banner
    
    print_color $BLUE "🔍 Starting Web File Manager Pro installation..."
    print_color $YELLOW "📋 This will install a complete web-based file management system."
    
    # Run installation steps
    check_root
    check_system
    install_dependencies
    clone_repository
    setup_python_env
    create_user_config
    create_systemd_service
    set_permissions
    configure_firewall
    start_service
    show_final_info
    
    print_color $GREEN "🎊 Installation completed successfully!"
    print_color $CYAN "🌐 Access your Web File Manager at: http://$server_ip:$PORT"
}

# Handle script interruption
trap 'print_color $RED "❌ Installation interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
