# GitHub CLI Chat
A terminal-based chat application that uses a GitHub repository as a shared message store. Anyone who clones the repo can participate in the chat!
## How It Works
1. All messages are stored in `chat.txt` in the repository
2. When you send a message, it automatically commits and pushes to GitHub
3. The chat file is visible on GitHub's website
4. Other users pull changes to see new messages
## Setup
### Prerequisites
- Node.js (v16 or higher)
- Git installed and configured
- A GitHub repository (can be this one or a new one)
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
When you run the app for the first time, you'll be prompted to enter a display name. This name will be shown with your messages.
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
Messages are stored in `chat.txt` with this format:
```
[2024-01-15 14:30:25] Alice: Hello everyone!
[2024-01-15 14:30:45] Bob: Hey Alice, welcome!
```
## Troubleshooting
### Push/Pull Errors
- Make sure you have write access to the repository
- Ensure your Git credentials are configured
- Check your internet connection
### Merge Conflicts
If you get merge conflicts, the app will try to auto-resolve them. If it can't, you may need to manually resolve the conflict in `chat.txt`.
## Contributing
Feel free to fork and improve this chat app!
## License
MIT