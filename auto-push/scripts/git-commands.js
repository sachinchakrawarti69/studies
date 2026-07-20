#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function color(text, colorName) {
  return `${colors[colorName] || ''}${text}${colors.reset}`;
}

// Root directory (studies folder)
const ROOT_DIR = path.join(__dirname, '..', '..');

// Ensure we're in the right directory
function ensureGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { cwd: ROOT_DIR, stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error(color('❌ Not a git repository!', 'red'));
    console.log(color('💡 Run: git init', 'yellow'));
    return false;
  }
}

// Execute git command
function git(command, options = {}) {
  try {
    const result = execSync(`git ${command}`, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return result.trim();
  } catch (error) {
    return null;
  }
}

// Print header
function printHeader(text) {
  console.log('\n' + color('═'.repeat(60), 'dim'));
  console.log(color(`  ${text}`, 'cyan'));
  console.log(color('═'.repeat(60), 'dim') + '\n');
}

// Get user confirmation
function confirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(color(`${message} (y/n): `, 'yellow'), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// ============ GIT COMMANDS ============

// Status
function gitStatus() {
  printHeader('📊 GIT STATUS');
  
  if (!ensureGitRepo()) return;
  
  const status = git('status');
  if (status) {
    console.log(status);
  }
  
  // Show branch info
  const branch = git('branch --show-current');
  const remote = git('remote -v');
  
  console.log('\n' + color('📍 Branch Info:', 'blue'));
  console.log(`   Current: ${color(branch || 'unknown', 'green')}`);
  if (remote) {
    const remoteLines = remote.split('\n').filter(line => line.includes('origin'));
    if (remoteLines.length > 0) {
      console.log(`   Remote: ${color(remoteLines[0].split(' ')[0] + ' ' + remoteLines[0].split(' ')[1], 'cyan')}`);
    }
  }
}

// Add files
async function gitAdd() {
  printHeader('📤 GIT ADD');
  
  if (!ensureGitRepo()) return;
  
  const status = git('status --porcelain');
  if (!status || status.length === 0) {
    console.log(color('No changes to add', 'yellow'));
    return;
  }
  
  // Show files that will be added
  const files = status.split('\n').filter(line => line.trim());
  console.log(color('📄 Files to add:', 'blue'));
  files.forEach(line => {
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);
    const colorName = statusCode.includes('D') ? 'red' : 
                     statusCode.includes('A') ? 'green' : 'yellow';
    console.log(`   ${color(statusCode, colorName)} ${filePath}`);
  });
  
  const confirmed = await confirm('\nAdd these files?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git('add .');
  if (result !== null) {
    console.log(color('✅ Files added successfully!', 'green'));
    gitStatus();
  } else {
    console.log(color('❌ Failed to add files', 'red'));
  }
}

// Commit
async function gitCommit() {
  printHeader('📝 GIT COMMIT');
  
  if (!ensureGitRepo()) return;
  
  const status = git('status --porcelain');
  if (!status || status.length === 0) {
    console.log(color('No changes to commit', 'yellow'));
    return;
  }
  
  // Show files to commit
  const files = status.split('\n').filter(line => line.trim());
  console.log(color('📄 Files to commit:', 'blue'));
  files.forEach(line => {
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);
    console.log(`   ${color(statusCode, 'yellow')} ${filePath}`);
  });
  
  // Get commit message
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const message = await new Promise((resolve) => {
    rl.question(color('\n📝 Commit message: ', 'cyan'), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  if (!message || message.trim() === '') {
    console.log(color('❌ Commit message cannot be empty', 'red'));
    return;
  }
  
  const confirmed = await confirm('\nCommit with this message?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git(`commit -m "${message.replace(/"/g, '\\"')}"`);
  if (result !== null) {
    console.log(color('✅ Commit successful!', 'green'));
    console.log(result);
    gitStatus();
  } else {
    console.log(color('❌ Failed to commit', 'red'));
  }
}

// Push
async function gitPush() {
  printHeader('📤 GIT PUSH');
  
  if (!ensureGitRepo()) return;
  
  const branch = git('branch --show-current');
  console.log(`📍 Current branch: ${color(branch || 'main', 'green')}`);
  
  // Check if there are commits to push
  const ahead = git('log origin/$(git branch --show-current)..HEAD --oneline');
  if (!ahead || ahead.length === 0) {
    console.log(color('No commits to push', 'yellow'));
    return;
  }
  
  const commits = ahead.split('\n').filter(line => line.trim());
  console.log(color(`📝 ${commits.length} commit(s) to push:`, 'blue'));
  commits.forEach(commit => {
    console.log(`   ${color(commit, 'dim')}`);
  });
  
  const confirmed = await confirm('\nPush to remote?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  console.log(color('📤 Pushing...', 'blue'));
  const result = git('push');
  if (result !== null) {
    console.log(color('✅ Push successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Push failed', 'red'));
    console.log(color('💡 Try: npm run git:push -- --force', 'yellow'));
  }
}

// Pull
async function gitPull() {
  printHeader('📥 GIT PULL');
  
  if (!ensureGitRepo()) return;
  
  const branch = git('branch --show-current');
  console.log(`📍 Current branch: ${color(branch || 'main', 'green')}`);
  
  const confirmed = await confirm('Pull latest changes?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  console.log(color('📥 Pulling...', 'blue'));
  const result = git('pull');
  if (result !== null) {
    console.log(color('✅ Pull successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Pull failed', 'red'));
  }
}

// Log
function gitLog() {
  printHeader('📜 GIT LOG');
  
  if (!ensureGitRepo()) return;
  
  const count = process.argv[3] || 10;
  const log = git(`log --oneline --graph --decorate -${count}`);
  if (log) {
    console.log(log);
  } else {
    console.log(color('No commits found', 'yellow'));
  }
}

// Branch
function gitBranch() {
  printHeader('🌿 GIT BRANCHES');
  
  if (!ensureGitRepo()) return;
  
  const branches = git('branch -a');
  if (branches) {
    console.log(branches);
  }
}

// Checkout
async function gitCheckout() {
  printHeader('🔄 GIT CHECKOUT');
  
  if (!ensureGitRepo()) return;
  
  // Show branches
  const branches = git('branch -a');
  console.log(color('📋 Available branches:', 'blue'));
  console.log(branches);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const branchName = await new Promise((resolve) => {
    rl.question(color('\n🌿 Branch name: ', 'cyan'), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  if (!branchName || branchName.trim() === '') {
    console.log(color('❌ Branch name cannot be empty', 'red'));
    return;
  }
  
  const result = git(`checkout ${branchName}`);
  if (result !== null) {
    console.log(color('✅ Checkout successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Checkout failed', 'red'));
  }
}

// Merge
async function gitMerge() {
  printHeader('🔀 GIT MERGE');
  
  if (!ensureGitRepo()) return;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const branchName = await new Promise((resolve) => {
    rl.question(color('🌿 Branch to merge: ', 'cyan'), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  if (!branchName || branchName.trim() === '') {
    console.log(color('❌ Branch name cannot be empty', 'red'));
    return;
  }
  
  const confirmed = await confirm(`Merge ${branchName} into current branch?`);
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git(`merge ${branchName}`);
  if (result !== null) {
    console.log(color('✅ Merge successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Merge failed', 'red'));
    console.log(color('💡 Resolve conflicts and commit', 'yellow'));
  }
}

// Stash
async function gitStash() {
  printHeader('📦 GIT STASH');
  
  if (!ensureGitRepo()) return;
  
  const status = git('status --porcelain');
  if (!status || status.length === 0) {
    console.log(color('No changes to stash', 'yellow'));
    return;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const message = await new Promise((resolve) => {
    rl.question(color('📝 Stash message (optional): ', 'cyan'), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  const cmd = message ? `stash save "${message}"` : 'stash';
  const result = git(cmd);
  if (result !== null) {
    console.log(color('✅ Stash successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Stash failed', 'red'));
  }
}

// Stash Pop
function gitStashPop() {
  printHeader('📤 GIT STASH POP');
  
  if (!ensureGitRepo()) return;
  
  const result = git('stash pop');
  if (result !== null) {
    console.log(color('✅ Stash pop successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Stash pop failed', 'red'));
  }
}

// Reset
async function gitReset() {
  printHeader('🔄 GIT RESET');
  
  if (!ensureGitRepo()) return;
  
  console.log(color('⚠️  Warning: This will unstage changes', 'yellow'));
  const confirmed = await confirm('Reset staging area?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git('reset');
  if (result !== null) {
    console.log(color('✅ Reset successful!', 'green'));
  } else {
    console.log(color('❌ Reset failed', 'red'));
  }
}

// Clean
async function gitClean() {
  printHeader('🧹 GIT CLEAN');
  
  if (!ensureGitRepo()) return;
  
  console.log(color('⚠️  Warning: This will remove untracked files', 'red'));
  const confirmed = await confirm('Remove untracked files?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git('clean -fd');
  if (result !== null) {
    console.log(color('✅ Clean successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Clean failed', 'red'));
  }
}

// Diff
function gitDiff() {
  printHeader('📊 GIT DIFF');
  
  if (!ensureGitRepo()) return;
  
  const diff = git('diff');
  if (diff && diff.length > 0) {
    console.log(diff);
  } else {
    console.log(color('No changes to show', 'yellow'));
  }
}

// Remote
function gitRemote() {
  printHeader('🔗 GIT REMOTE');
  
  if (!ensureGitRepo()) return;
  
  const remote = git('remote -v');
  if (remote) {
    console.log(remote);
  } else {
    console.log(color('No remote configured', 'yellow'));
    console.log(color('💡 Run: git remote add origin <url>', 'cyan'));
  }
}

// Fetch
function gitFetch() {
  printHeader('📥 GIT FETCH');
  
  if (!ensureGitRepo()) return;
  
  const result = git('fetch');
  if (result !== null) {
    console.log(color('✅ Fetch successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Fetch failed', 'red'));
  }
}

// Rebase
async function gitRebase() {
  printHeader('🔄 GIT REBASE');
  
  if (!ensureGitRepo()) return;
  
  const branch = git('branch --show-current');
  console.log(`📍 Current branch: ${color(branch || 'main', 'green')}`);
  
  const confirmed = await confirm('Rebase current branch?');
  if (!confirmed) {
    console.log(color('❌ Cancelled', 'red'));
    return;
  }
  
  const result = git('rebase');
  if (result !== null) {
    console.log(color('✅ Rebase successful!', 'green'));
    console.log(result);
  } else {
    console.log(color('❌ Rebase failed', 'red'));
  }
}

// Tag
async function gitTag() {
  printHeader('🏷️ GIT TAG');
  
  if (!ensureGitRepo()) return;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const tagName = await new Promise((resolve) => {
    rl.question(color('🏷️ Tag name: ', 'cyan'), (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  if (!tagName || tagName.trim() === '') {
    console.log(color('❌ Tag name cannot be empty', 'red'));
    return;
  }
  
  const result = git(`tag ${tagName}`);
  if (result !== null) {
    console.log(color('✅ Tag created!', 'green'));
    // Show all tags
    const tags = git('tag -l');
    console.log(color('\n📋 All tags:', 'blue'));
    console.log(tags);
  } else {
    console.log(color('❌ Failed to create tag', 'red'));
  }
}

// Git All (status + log + branch)
function gitAll() {
  gitStatus();
  console.log('\n');
  gitBranch();
  console.log('\n');
  console.log(color('📜 Recent commits:', 'blue'));
  gitLog();
}

// ============ COMMAND ROUTER ============
async function main() {
  const command = process.argv[2] || 'status';
  
  switch (command) {
    case 'status':
      gitStatus();
      break;
    case 'add':
      await gitAdd();
      break;
    case 'commit':
      await gitCommit();
      break;
    case 'push':
      await gitPush();
      break;
    case 'pull':
      await gitPull();
      break;
    case 'log':
      gitLog();
      break;
    case 'branch':
      gitBranch();
      break;
    case 'checkout':
      await gitCheckout();
      break;
    case 'merge':
      await gitMerge();
      break;
    case 'stash':
      await gitStash();
      break;
    case 'stash-pop':
      gitStashPop();
      break;
    case 'reset':
      await gitReset();
      break;
    case 'clean':
      await gitClean();
      break;
    case 'diff':
      gitDiff();
      break;
    case 'remote':
      gitRemote();
      break;
    case 'fetch':
      gitFetch();
      break;
    case 'rebase':
      await gitRebase();
      break;
    case 'tag':
      await gitTag();
      break;
    case 'all':
      gitAll();
      break;
    case 'help':
    default:
      console.log(`
${color('📚 AVAILABLE GIT COMMANDS', 'cyan')}
${color('═'.repeat(50), 'dim')}

${color('📊 Status & Info:', 'yellow')}
  npm run git:status     - Show repository status
  npm run git:log        - Show commit history
  npm run git:branch     - List branches
  npm run git:remote     - Show remote repositories
  npm run git:diff       - Show file differences
  npm run git:all        - Show all info (status + log + branch)

${color('📤 Staging & Committing:', 'yellow')}
  npm run git:add        - Stage all changes
  npm run git:commit     - Commit staged changes
  npm run git:push       - Push to remote
  npm run git:pull       - Pull from remote
  npm run git:fetch      - Fetch from remote

${color('🔀 Branching & Merging:', 'yellow')}
  npm run git:checkout   - Switch branches
  npm run git:merge      - Merge branches
  npm run git:rebase     - Rebase current branch

${color('📦 Stashing:', 'yellow')}
  npm run git:stash      - Stash changes
  npm run git:stash-pop  - Apply stashed changes

${color('🔄 Reset & Clean:', 'yellow')}
  npm run git:reset      - Unstage changes
  npm run git:clean      - Remove untracked files

${color('🏷️ Tags:', 'yellow')}
  npm run git:tag        - Create a tag

${color('💡 Examples:', 'yellow')}
  npm run git:status
  npm run git:add
  npm run git:commit
  npm run git:push
`);
      break;
  }
}

// Run the command
main().catch(error => {
  console.error(color(`❌ Error: ${error.message}`, 'red'));
  process.exit(1);
});