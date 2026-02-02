# GitHub CLI Chat
A CLI chat application that uses a GitHub repository as a shared message database. Anyone who clones the repo can join the conversation!
## How It Works
1. All messages are stored in `chat.txt` in the repository
2. When you send a message, it automatically commits and pushes to GitHub
3. The chat file is visible on GitHub's website
4. Other users pull changes to see new messages
## Setup
### Prerequisites
- Node.js
- Git installed and configured
- A GitHub repository (clone this or create your new one)
### Installation
1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/cli-chat
```
2. Install dependencies:
```bash
npm install
```
3. Run the chat:
```bash
npm start
```
## Usage
### First Time
When you start the app for the very first time, you'll be required to enter your name. This name will be displayed before your messages.
### Commands
| Command | Description |
|---------|-------------|
| Type message + Enter | Send a message |
| `/refresh` | Manually fetch new messages |
| `/clear` | Clear your terminal screen |
| `/name <newname>` | Change your display name |
| `/users` | Show all users who have chatted |
| `/help` | Show available commands |
| `/quit` or `/exit` | Exit the chat |
### Auto-Sync
The app automatically:
- Pulls new messages every 10 seconds
- Pushes your messages immediately when you send them
## Chat File Format
Messages are saved in `chat.txt` with this format:
```
[2024-01-15 14:30:25] Yash: Hola amigo!
[2024-01-15 14:30:45] Krishna: Hey Yash, wassup!
```
## Troubleshooting
### Push/Pull Errors
- Make sure you have commit permission of the repository.
- Ensure you are logged in with your Git credentials
- Check your internet connection
### Merge Conflict
In case of merge conflict, the app will firstly try to automatically resolve them. If it can't, you may need to run `/refresh`.
## Contributing
Feel free to fork and help me improve this chat app to eradicate the dependency on big tech companies for just chatting !

