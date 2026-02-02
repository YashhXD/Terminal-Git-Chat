#!/usr/bin/env node
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
// Configuration
const CHAT_FILE = path.join(__dirname, 'chat.txt');
const CONFIG_FILE = path.join(__dirname, '.chatconfig.json');
const SYNC_INTERVAL = 10000; // 10 seconds
// ANSI color codes (works without chalk dependency)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};
// User colors for different chatters
const userColors = [colors.cyan, colors.magenta, colors.yellow, colors.green, colors.blue];
const userColorMap = new Map();
let colorIndex = 0;
function getUserColor(username) {
  if (!userColorMap.has(username)) {
    userColorMap.set(username, userColors[colorIndex % userColors.length]);
    colorIndex++;
  }
  return userColorMap.get(username);
}
// Load or create config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    // Config file corrupted, create new one
  }
  return null;
}
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
// Git operations
function gitPull() {
  try {
    execSync('git pull --rebase', { 
      cwd: __dirname, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    // Try to handle merge conflicts
    try {
      execSync('git rebase --abort', { cwd: __dirname, stdio: 'pipe' });
      execSync('git pull', { cwd: __dirname, stdio: 'pipe' });
      return true;
    } catch (e) {
      return false;
    }
  }
}
function gitPush(message) {
  try {
    execSync('git add chat.txt', { cwd: __dirname, stdio: 'pipe' });
    execSync(`git commit -m "${message}"`, { cwd: __dirname, stdio: 'pipe' });
    execSync('git push', { cwd: __dirname, stdio: 'pipe' });
    return true;
  } catch (error) {
    // If push fails, try pull and push again
    try {
      gitPull();
      execSync('git push', { cwd: __dirname, stdio: 'pipe' });
      return true;
    } catch (e) {
      return false;
    }
  }
}
// Chat file operations
function readMessages() {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      return fs.readFileSync(CHAT_FILE, 'utf8');
    }
  } catch (e) {
    // File doesn't exist yet
  }
  return '';
}
function appendMessage(username, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const formattedMessage = `[${timestamp}] ${username}: ${message}\n`;
  
  fs.appendFileSync(CHAT_FILE, formattedMessage);
  return formattedMessage;
}
function getUniqueUsers() {
  const content = readMessages();
  const users = new Set();
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/\[.+?\] (.+?):/);
    if (match) {
      users.add(match[1]);
    }
  }
  
  return Array.from(users);
}
// Display functions
function clearScreen() {
  console.clear();
}
function printHeader() {
  console.log(`${colors.bgBlue}${colors.white}${colors.bright}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              🚀 GitHub CLI Chat                            ║');
  console.log('║     Type /help for commands • Messages sync via Git        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
}
function printMessages(content, lastLineCount = 0) {
  const lines = content.split('\n').filter(line => line.trim());
  const newLines = lines.slice(lastLineCount);
  
  for (const line of newLines) {
    const match = line.match(/\[(.+?)\] (.+?): (.+)/);
    if (match) {
      const [, timestamp, username, message] = match;
      const userColor = getUserColor(username);
      console.log(
        `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${userColor}${colors.bright}${username}${colors.reset}: ` +
        `${message}`
      );
    } else {
      console.log(line);
    }
  }
  
  return lines.length;
}
function printHelp() {
  console.log(`\n${colors.cyan}${colors.bright}Available Commands:${colors.reset}`);
  console.log(`${colors.yellow}/refresh${colors.reset}        - Manually fetch new messages`);
  console.log(`${colors.yellow}/clear${colors.reset}          - Clear the terminal screen`);
  console.log(`${colors.yellow}/name <name>${colors.reset}    - Change your display name`);
  console.log(`${colors.yellow}/users${colors.reset}          - Show all users who have chatted`);
  console.log(`${colors.yellow}/help${colors.reset}           - Show this help message`);
  console.log(`${colors.yellow}/quit${colors.reset} or ${colors.yellow}/exit${colors.reset} - Exit the chat\n`);
}
function printStatus(message, type = 'info') {
  const colorMap = {
    info: colors.blue,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
  };
  console.log(`${colorMap[type]}${colors.dim}[${type.toUpperCase()}]${colors.reset} ${message}`);
}
// Main chat application
async function main() {
  clearScreen();
  printHeader();
  
  // Check if we're in a git repository
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: __dirname, stdio: 'pipe' });
  } catch (e) {
    console.log(`${colors.red}Error: This directory is not a Git repository.${colors.reset}`);
    console.log('Please clone the repository first or initialize Git.');
    process.exit(1);
  }
  
  // Load or create user config
  let config = loadConfig();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  // First-time setup: get username
  if (!config || !config.username) {
    console.log(`${colors.cyan}Welcome to GitHub CLI Chat!${colors.reset}\n`);
    const username = await question(`${colors.yellow}Enter your display name: ${colors.reset}`);
    
    if (!username.trim()) {
      console.log(`${colors.red}Username cannot be empty. Exiting.${colors.reset}`);
      rl.close();
      process.exit(1);
    }
    
    config = { username: username.trim() };
    saveConfig(config);
    console.log(`\n${colors.green}Welcome, ${config.username}! You're ready to chat.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}Welcome back, ${config.username}!${colors.reset}\n`);
  }
  
  // Initial sync
  printStatus('Syncing messages...', 'info');
  gitPull();
  
  // Display existing messages
  let content = readMessages();
  let lastLineCount = 0;
  
  if (content.trim()) {
    console.log(`\n${colors.dim}--- Chat History ---${colors.reset}\n`);
    lastLineCount = printMessages(content);
    console.log(`\n${colors.dim}--- End of History ---${colors.reset}\n`);
  } else {
    console.log(`${colors.dim}No messages yet. Be the first to say hello!${colors.reset}\n`);
  }
  
  // Auto-sync interval
  const syncInterval = setInterval(() => {
    gitPull();
    const newContent = readMessages();
    if (newContent !== content) {
      content = newContent;
      const newLineCount = printMessages(content, lastLineCount);
      lastLineCount = newLineCount;
    }
  }, SYNC_INTERVAL);
  
  // Input prompt
  const promptUser = () => {
    rl.question(`${colors.green}${config.username}${colors.reset}> `, async (input) => {
      const trimmedInput = input.trim();
      
      if (!trimmedInput) {
        promptUser();
        return;
      }
      
      // Handle commands
      if (trimmedInput.startsWith('/')) {
        const [command, ...args] = trimmedInput.slice(1).split(' ');
        
        switch (command.toLowerCase()) {
          case 'quit':
          case 'exit':
            printStatus('Goodbye! 👋', 'success');
            clearInterval(syncInterval);
            rl.close();
            process.exit(0);
            break;
            
          case 'help':
            printHelp();
            break;
            
          case 'clear':
            clearScreen();
            printHeader();
            printStatus(`Logged in as ${config.username}`, 'info');
            break;
            
          case 'refresh':
            printStatus('Fetching new messages...', 'info');
            if (gitPull()) {
              const newContent = readMessages();
              if (newContent !== content) {
                content = newContent;
                lastLineCount = printMessages(content, lastLineCount);
              }
              printStatus('Messages synced!', 'success');
            } else {
              printStatus('Failed to sync messages', 'error');
            }
            break;
            
          case 'name':
            if (args.length > 0) {
              const newName = args.join(' ');
              config.username = newName;
              saveConfig(config);
              printStatus(`Display name changed to: ${newName}`, 'success');
            } else {
              printStatus('Usage: /name <new_name>', 'warning');
            }
            break;
            
          case 'users':
            const users = getUniqueUsers();
            if (users.length > 0) {
              console.log(`\n${colors.cyan}Users who have chatted:${colors.reset}`);
              users.forEach(user => {
                const isYou = user === config.username ? ` ${colors.dim}(you)${colors.reset}` : '';
                console.log(`  ${getUserColor(user)}• ${user}${colors.reset}${isYou}`);
              });
              console.log('');
            } else {
              printStatus('No users have chatted yet', 'info');
            }
            break;
            
          default:
            printStatus(`Unknown command: /${command}. Type /help for available commands.`, 'warning');
        }
      } else {
        // Send message
        appendMessage(config.username, trimmedInput);
        
        // Update local state
        content = readMessages();
        lastLineCount = content.split('\n').filter(l => l.trim()).length;
        
        // Push to GitHub
        printStatus('Sending...', 'info');
        if (gitPush(`chat: ${config.username} sent a message`)) {
          process.stdout.write('\x1b[1A\x1b[2K'); // Clear the "Sending..." line
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          console.log(
            `${colors.dim}[${timestamp}]${colors.reset} ` +
            `${getUserColor(config.username)}${colors.bright}${config.username}${colors.reset}: ` +
            `${trimmedInput} ${colors.green}✓${colors.reset}`
          );
        } else {
          printStatus('Failed to send message. Check your Git connection.', 'error');
        }
      }
      
      promptUser();
    });
  };
  
  printStatus(`Auto-syncing every ${SYNC_INTERVAL / 1000} seconds. Type /help for commands.`, 'info');
  console.log('');
  promptUser();
}
// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Interrupted. Goodbye! 👋${colors.reset}`);
  process.exit(0);
});
// Run the app
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
  process.exit(1);
});