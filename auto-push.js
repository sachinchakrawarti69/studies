const chokidar = require('chokidar');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const notifier = require('node-notifier');
const cliProgress = require('cli-progress');
const chalk = require('chalk');
const ora = require('ora');

const git = simpleGit();

// ============ CONFIGURATION ============
const DEBOUNCE_MS = 5000;
const BATCH_INTERVAL_MS = 60000;
const FORCE_PUSH_INTERVAL = 120000;

let timeoutId = null;
let isPushing = false;
let pushCount = 0;
let todayPushes = 0;
let totalFilesChanged = 0;
let startTime = new Date();
let xpPoints = 0;
let achievements = [];
let pendingChanges = new Set();
let isProcessing = false;
let lastPushTime = null;

// ============ COMMIT MESSAGES CONFIG ============
const COMMIT_MESSAGES = {
  disciplines: {
    "career": { "emoji": "💼", "name": "Career", "message": "Career Development" },
    "commerce": { "emoji": "💹", "name": "Commerce", "message": "Commerce & Business" },
    "health": { "emoji": "🏥", "name": "Health", "message": "Health & Wellness" },
    "language": { "emoji": "🌍", "name": "Language", "message": "Language Learning" },
    "mission": { "emoji": "🎯", "name": "Mission", "message": "Mission & Goals" },
    "relationships": { "emoji": "💕", "name": "Relationships", "message": "Relationships" },
    "science": { "emoji": "🔬", "name": "Science", "message": "Science & Research" },
    "social-science": { "emoji": "🧠", "name": "Social Science", "message": "Social Sciences" },
    "general": { "emoji": "📚", "name": "General", "message": "General Studies" },
    "studies": { "emoji": "📚", "name": "Studies", "message": "Academic Studies" },
    "mathematics": { "emoji": "📐", "name": "Mathematics", "message": "Mathematics" },
    "physics": { "emoji": "⚛️", "name": "Physics", "message": "Physics" },
    "chemistry": { "emoji": "🧪", "name": "Chemistry", "message": "Chemistry" },
    "biology": { "emoji": "🧬", "name": "Biology", "message": "Biology" },
    "history": { "emoji": "📜", "name": "History", "message": "History" },
    "geography": { "emoji": "🌍", "name": "Geography", "message": "Geography" },
    "philosophy": { "emoji": "🧠", "name": "Philosophy", "message": "Philosophy" },
    "psychology": { "emoji": "🧠", "name": "Psychology", "message": "Psychology" },
    "sociology": { "emoji": "👥", "name": "Sociology", "message": "Sociology" },
    "economics": { "emoji": "💰", "name": "Economics", "message": "Economics" },
    "finance": { "emoji": "💳", "name": "Finance", "message": "Finance" },
    "marketing": { "emoji": "📈", "name": "Marketing", "message": "Marketing" },
    "management": { "emoji": "📊", "name": "Management", "message": "Management" },
    "engineering": { "emoji": "⚙️", "name": "Engineering", "message": "Engineering" },
    "architecture": { "emoji": "🏗️", "name": "Architecture", "message": "Architecture" },
    "design": { "emoji": "🎨", "name": "Design", "message": "Design" },
    "art": { "emoji": "🎭", "name": "Art", "message": "Art" },
    "music": { "emoji": "🎵", "name": "Music", "message": "Music" },
    "dance": { "emoji": "💃", "name": "Dance", "message": "Dance" },
    "theater": { "emoji": "🎭", "name": "Theater", "message": "Theater" },
    "film": { "emoji": "🎬", "name": "Film", "message": "Film & Cinema" },
    "photography": { "emoji": "📸", "name": "Photography", "message": "Photography" },
    "journalism": { "emoji": "📰", "name": "Journalism", "message": "Journalism" },
    "writing": { "emoji": "✍️", "name": "Writing", "message": "Creative Writing" },
    "literature": { "emoji": "📚", "name": "Literature", "message": "Literature" },
    "poetry": { "emoji": "🎭", "name": "Poetry", "message": "Poetry" },
    "fiction": { "emoji": "📖", "name": "Fiction", "message": "Fiction" },
    "nonfiction": { "emoji": "📕", "name": "Non-Fiction", "message": "Non-Fiction" },
    "research": { "emoji": "🔬", "name": "Research", "message": "Research" },
    "academic": { "emoji": "🏛️", "name": "Academic", "message": "Academic" },
    "professional": { "emoji": "💼", "name": "Professional", "message": "Professional" },
    "personal": { "emoji": "👤", "name": "Personal", "message": "Personal" },
    "fitness": { "emoji": "💪", "name": "Fitness", "message": "Fitness & Health" },
    "nutrition": { "emoji": "🥗", "name": "Nutrition", "message": "Nutrition" },
    "meditation": { "emoji": "🧘", "name": "Meditation", "message": "Meditation & Mindfulness" },
    "yoga": { "emoji": "🧘", "name": "Yoga", "message": "Yoga" },
    "coding": { "emoji": "💻", "name": "Coding", "message": "Coding & Programming" },
    "webdev": { "emoji": "🌐", "name": "Web Development", "message": "Web Development" },
    "mobile": { "emoji": "📱", "name": "Mobile Development", "message": "Mobile Development" },
    "ai": { "emoji": "🤖", "name": "AI", "message": "Artificial Intelligence" },
    "ml": { "emoji": "🧠", "name": "ML", "message": "Machine Learning" },
    "datascience": { "emoji": "📊", "name": "Data Science", "message": "Data Science" },
    "cybersecurity": { "emoji": "🔒", "name": "Cybersecurity", "message": "Cybersecurity" },
    "blockchain": { "emoji": "⛓️", "name": "Blockchain", "message": "Blockchain" },
    "devops": { "emoji": "⚡", "name": "DevOps", "message": "DevOps" },
    "cloud": { "emoji": "☁️", "name": "Cloud", "message": "Cloud Computing" },
    "sex-education": { "emoji": "❤️", "name": "Sex Education", "message": "Sex Education" },
    "sexual-health": { "emoji": "🏥", "name": "Sexual Health", "message": "Sexual Health" },
    "reproductive-health": { "emoji": "👶", "name": "Reproductive Health", "message": "Reproductive Health" },
    "human-sexuality": { "emoji": "💕", "name": "Human Sexuality", "message": "Human Sexuality" },
    "gender-studies": { "emoji": "⚧️", "name": "Gender Studies", "message": "Gender Studies" },
    "lgbtq": { "emoji": "🏳️‍🌈", "name": "LGBTQ+", "message": "LGBTQ+ Studies" },
    "consent": { "emoji": "🤝", "name": "Consent", "message": "Consent Education" },
    "relationships-sex": { "emoji": "💞", "name": "Relationships & Sex", "message": "Relationships & Sex" },
    "intimacy": { "emoji": "💕", "name": "Intimacy", "message": "Intimacy" },
    "puberty": { "emoji": "🌱", "name": "Puberty", "message": "Puberty Education" },
    "pregnancy": { "emoji": "🤰", "name": "Pregnancy", "message": "Pregnancy" },
    "contraception": { "emoji": "🛡️", "name": "Contraception", "message": "Contraception" },
    "std": { "emoji": "⚠️", "name": "STD", "message": "STD Education" },
    "stis": { "emoji": "⚠️", "name": "STIs", "message": "STI Education" },
    "safe-sex": { "emoji": "🛡️", "name": "Safe Sex", "message": "Safe Sex" },
    "sex-therapy": { "emoji": "🛋️", "name": "Sex Therapy", "message": "Sex Therapy" },
    "couples": { "emoji": "💑", "name": "Couples", "message": "Couples" },
    "dating": { "emoji": "💘", "name": "Dating", "message": "Dating" },
    "marriage": { "emoji": "💍", "name": "Marriage", "message": "Marriage" },
    "family-planning": { "emoji": "👨‍👩‍👧‍👦", "name": "Family Planning", "message": "Family Planning" },
    "parenting": { "emoji": "👶", "name": "Parenting", "message": "Parenting" },
    "child-development": { "emoji": "🧒", "name": "Child Development", "message": "Child Development" },
    "adolescence": { "emoji": "🧑", "name": "Adolescence", "message": "Adolescence" },
    "menstruation": { "emoji": "🩸", "name": "Menstruation", "message": "Menstruation" },
    "menopause": { "emoji": "🌺", "name": "Menopause", "message": "Menopause" },
    "fertility": { "emoji": "🌱", "name": "Fertility", "message": "Fertility" },
    "abortion": { "emoji": "⚖️", "name": "Abortion", "message": "Abortion Education" }
  },
  fileTypes: {
    '.js': { "emoji": "⚡", "message": "JavaScript Update", "category": "programming" },
    '.jsx': { "emoji": "⚛️", "message": "React Component Update", "category": "programming" },
    '.ts': { "emoji": "📘", "message": "TypeScript Update", "category": "programming" },
    '.tsx': { "emoji": "⚛️", "message": "React TypeScript Update", "category": "programming" },
    '.py': { "emoji": "🐍", "message": "Python Script Update", "category": "programming" },
    '.java': { "emoji": "☕", "message": "Java Code Update", "category": "programming" },
    '.cpp': { "emoji": "⚙️", "message": "C++ Code Update", "category": "programming" },
    '.c': { "emoji": "⚙️", "message": "C Code Update", "category": "programming" },
    '.go': { "emoji": "🐹", "message": "Go Code Update", "category": "programming" },
    '.rs': { "emoji": "🦀", "message": "Rust Code Update", "category": "programming" },
    '.rb': { "emoji": "💎", "message": "Ruby Code Update", "category": "programming" },
    '.php': { "emoji": "🐘", "message": "PHP Code Update", "category": "programming" },
    '.sh': { "emoji": "🐚", "message": "Shell Script Update", "category": "programming" },
    '.bat': { "emoji": "🪟", "message": "Batch Script Update", "category": "programming" },
    '.ps1': { "emoji": "🖥️", "message": "PowerShell Script Update", "category": "programming" },
    '.html': { "emoji": "🌐", "message": "HTML Update", "category": "web" },
    '.htm': { "emoji": "🌐", "message": "HTML Update", "category": "web" },
    '.css': { "emoji": "🎨", "message": "CSS Style Update", "category": "web" },
    '.scss': { "emoji": "🎨", "message": "SCSS Style Update", "category": "web" },
    '.sass': { "emoji": "🎨", "message": "Sass Style Update", "category": "web" },
    '.less': { "emoji": "🎨", "message": "Less Style Update", "category": "web" },
    '.json': { "emoji": "📦", "message": "JSON Configuration Update", "category": "config" },
    '.yml': { "emoji": "🔧", "message": "YAML Configuration Update", "category": "config" },
    '.yaml': { "emoji": "🔧", "message": "YAML Configuration Update", "category": "config" },
    '.toml': { "emoji": "⚙️", "message": "TOML Configuration Update", "category": "config" },
    '.env': { "emoji": "🔐", "message": "Environment Variable Update", "category": "config" },
    '.gitignore': { "emoji": "🚫", "message": "Gitignore Update", "category": "config" },
    '.dockerignore': { "emoji": "🐳", "message": "Dockerignore Update", "category": "config" },
    '.eslintrc': { "emoji": "📏", "message": "ESLint Configuration Update", "category": "config" },
    '.prettierrc': { "emoji": "💅", "message": "Prettier Configuration Update", "category": "config" },
    'package.json': { "emoji": "📦", "message": "NPM Dependencies Update", "category": "config" },
    'package-lock.json': { "emoji": "🔒", "message": "NPM Lockfile Update", "category": "config" },
    'yarn.lock': { "emoji": "📦", "message": "Yarn Lockfile Update", "category": "config" },
    '.md': { "emoji": "📝", "message": "Markdown Documentation Update", "category": "docs" },
    '.markdown': { "emoji": "📝", "message": "Markdown Documentation Update", "category": "docs" },
    '.txt': { "emoji": "📄", "message": "Text File Update", "category": "docs" },
    '.pdf': { "emoji": "📄", "message": "PDF Document Update", "category": "docs" },
    '.doc': { "emoji": "📄", "message": "Word Document Update", "category": "docs" },
    '.docx': { "emoji": "📄", "message": "Word Document Update", "category": "docs" },
    '.xls': { "emoji": "📊", "message": "Excel Spreadsheet Update", "category": "docs" },
    '.xlsx': { "emoji": "📊", "message": "Excel Spreadsheet Update", "category": "docs" },
    '.ppt': { "emoji": "📽️", "message": "PowerPoint Presentation Update", "category": "docs" },
    '.pptx': { "emoji": "📽️", "message": "PowerPoint Presentation Update", "category": "docs" },
    '.png': { "emoji": "🖼️", "message": "PNG Image Update", "category": "media" },
    '.jpg': { "emoji": "🖼️", "message": "JPG Image Update", "category": "media" },
    '.jpeg': { "emoji": "🖼️", "message": "JPEG Image Update", "category": "media" },
    '.svg': { "emoji": "🎨", "message": "SVG Graphic Update", "category": "media" },
    '.gif': { "emoji": "🖼️", "message": "GIF Image Update", "category": "media" },
    '.webp': { "emoji": "🖼️", "message": "WebP Image Update", "category": "media" },
    '.ico': { "emoji": "🖼️", "message": "Icon Update", "category": "media" },
    '.mp3': { "emoji": "🎵", "message": "Audio File Update", "category": "media" },
    '.mp4': { "emoji": "🎬", "message": "Video File Update", "category": "media" },
    '.avi': { "emoji": "🎬", "message": "Video File Update", "category": "media" },
    '.mov': { "emoji": "🎬", "message": "Video File Update", "category": "media" },
    '.wav': { "emoji": "🎵", "message": "Audio File Update", "category": "media" },
    '.zip': { "emoji": "📦", "message": "Archive File Update", "category": "archive" },
    '.rar': { "emoji": "📦", "message": "Archive File Update", "category": "archive" },
    '.7z': { "emoji": "📦", "message": "Archive File Update", "category": "archive" },
    '.tar': { "emoji": "📦", "message": "Archive File Update", "category": "archive" },
    '.gz': { "emoji": "📦", "message": "Archive File Update", "category": "archive" },
    '.study': { "emoji": "📚", "message": "Study Material Update", "category": "study" },
    '.note': { "emoji": "📝", "message": "Study Notes Update", "category": "study" },
    '.notes': { "emoji": "📝", "message": "Study Notes Update", "category": "study" },
    '.quiz': { "emoji": "📝", "message": "Quiz Material Update", "category": "study" },
    '.exam': { "emoji": "📝", "message": "Exam Material Update", "category": "study" },
    '.assignment': { "emoji": "📝", "message": "Assignment Update", "category": "study" },
    '.lecture': { "emoji": "📚", "message": "Lecture Notes Update", "category": "study" },
    '.tutorial': { "emoji": "📚", "message": "Tutorial Material Update", "category": "study" },
    '.worksheet': { "emoji": "📝", "message": "Worksheet Update", "category": "study" },
    '.project': { "emoji": "📁", "message": "Project File Update", "category": "study" },
    '.research': { "emoji": "🔬", "message": "Research Material Update", "category": "study" },
    '.paper': { "emoji": "📄", "message": "Academic Paper Update", "category": "study" },
    '.thesis': { "emoji": "📚", "message": "Thesis Update", "category": "study" },
    '.dissertation': { "emoji": "📚", "message": "Dissertation Update", "category": "study" },
    '.summary': { "emoji": "📝", "message": "Summary Update", "category": "study" },
    '.review': { "emoji": "📝", "message": "Review Material Update", "category": "study" },
    '.flashcards': { "emoji": "🃏", "message": "Flashcards Update", "category": "study" },
    '.mindmap': { "emoji": "🧠", "message": "Mind Map Update", "category": "study" },
    '.cheatsheet': { "emoji": "📋", "message": "Cheatsheet Update", "category": "study" },
    '.template': { "emoji": "📋", "message": "Template Update", "category": "study" },
    '.syllabus': { "emoji": "📋", "message": "Syllabus Update", "category": "study" },
    '.curriculum': { "emoji": "📋", "message": "Curriculum Update", "category": "study" },
    '.sex-ed': { "emoji": "❤️", "message": "Sex Education Material Update", "category": "sex-education" },
    '.sexual-health': { "emoji": "🏥", "message": "Sexual Health Material Update", "category": "sexual-health" },
    '.reproductive': { "emoji": "👶", "message": "Reproductive Health Material Update", "category": "reproductive-health" },
    '.gender': { "emoji": "⚧️", "message": "Gender Studies Material Update", "category": "gender-studies" },
    '.lgbtq': { "emoji": "🏳️‍🌈", "message": "LGBTQ+ Material Update", "category": "lgbtq" },
    '.consent': { "emoji": "🤝", "message": "Consent Education Update", "category": "consent" },
    '.relationship': { "emoji": "💞", "message": "Relationship Material Update", "category": "relationships" },
    '.intimacy': { "emoji": "💕", "message": "Intimacy Material Update", "category": "intimacy" },
    '.puberty': { "emoji": "🌱", "message": "Puberty Education Update", "category": "puberty" },
    '.pregnancy': { "emoji": "🤰", "message": "Pregnancy Material Update", "category": "pregnancy" },
    '.contraception': { "emoji": "🛡️", "message": "Contraception Education Update", "category": "contraception" },
    '.std': { "emoji": "⚠️", "message": "STD Education Update", "category": "std" },
    '.stis': { "emoji": "⚠️", "message": "STI Education Update", "category": "stis" },
    '.safe-sex': { "emoji": "🛡️", "message": "Safe Sex Education Update", "category": "safe-sex" },
    '.sex-therapy': { "emoji": "🛋️", "message": "Sex Therapy Material Update", "category": "sex-therapy" },
    '.couples': { "emoji": "💑", "message": "Couples Material Update", "category": "couples" },
    '.dating': { "emoji": "💘", "message": "Dating Material Update", "category": "dating" },
    '.marriage': { "emoji": "💍", "message": "Marriage Material Update", "category": "marriage" },
    '.family-planning': { "emoji": "👨‍👩‍👧‍👦", "message": "Family Planning Update", "category": "family-planning" },
    '.parenting': { "emoji": "👶", "message": "Parenting Material Update", "category": "parenting" },
    '.child-development': { "emoji": "🧒", "message": "Child Development Update", "category": "child-development" },
    '.adolescence': { "emoji": "🧑", "message": "Adolescence Material Update", "category": "adolescence" },
    '.menstruation': { "emoji": "🩸", "message": "Menstruation Education Update", "category": "menstruation" },
    '.menopause': { "emoji": "🌺", "message": "Menopause Education Update", "category": "menopause" },
    '.fertility': { "emoji": "🌱", "message": "Fertility Education Update", "category": "fertility" },
    '.abortion': { "emoji": "⚖️", "message": "Abortion Education Update", "category": "abortion" }
  }
};

// Color-coded logging
const log = {
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  highlight: (msg) => console.log(chalk.magenta(`✨ ${msg}`)),
  dim: (msg) => console.log(chalk.dim(msg))
};

// ============ DISCIPLINE DETECTION ============
function detectDiscipline(filePath) {
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (COMMIT_MESSAGES.disciplines[part]) {
      return COMMIT_MESSAGES.disciplines[part];
    }
  }
  return null;
}

function getFileType(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  const key = ext || base;
  return COMMIT_MESSAGES.fileTypes[key] || null;
}

// ============ COMMIT MESSAGE GENERATOR ============
function generateCommitMessage(files, pushNumber) {
  const total = files.length;
  const disciplines = new Set();
  const fileTypes = {};
  
  files.forEach(file => {
    const disc = detectDiscipline(file);
    if (disc) disciplines.add(disc);
    
    const type = getFileType(file);
    if (type) {
      const key = type.message || 'unknown';
      fileTypes[key] = (fileTypes[key] || 0) + 1;
    }
  });

  // Find most common file type
  let mainType = null;
  let maxCount = 0;
  for (const [type, count] of Object.entries(fileTypes)) {
    if (count > maxCount) {
      maxCount = count;
      mainType = type;
    }
  }

  // Single file
  if (total === 1) {
    const file = files[0];
    const discipline = detectDiscipline(file);
    const fileType = getFileType(file);
    const filename = path.basename(file);
    
    if (discipline) {
      return `[#${pushNumber}] ${discipline.emoji} ${discipline.name}: ${fileType ? fileType.emoji : '📁'} ${fileType ? fileType.message : 'Update'} ${filename}`;
    }
    if (fileType) {
      return `[#${pushNumber}] ${fileType.emoji} ${fileType.message}: ${filename}`;
    }
    return `[#${pushNumber}] 📁 Update: ${filename}`;
  }

  // Multiple files
  const disciplineArray = Array.from(disciplines);
  
  // Single discipline
  if (disciplineArray.length === 1) {
    const disc = disciplineArray[0];
    return `[#${pushNumber}] ${disc.emoji} ${disc.name}: ${total} files`;
  }
  
  // Multiple disciplines
  if (disciplineArray.length > 1) {
    const discList = disciplineArray.map(d => `${d.emoji}${d.name}`).join(' ');
    return `[#${pushNumber}] 📚 Multi-discipline: ${discList} (${total} files)`;
  }

  // Bulk update
  if (total >= 10) {
    return `[#${pushNumber}] 📦 Bulk update ${total} files`;
  }

  // Default
  if (mainType) {
    return `[#${pushNumber}] ${mainType} (${total} files)`;
  }
  
  return `[#${pushNumber}] 📚 Update ${total} files`;
}

// ============ ACHIEVEMENTS ============
const ACHIEVEMENTS = {
  FIRST_PUSH: { id: 'first_push', name: 'First Push', icon: '🏆', condition: (count) => count === 1 },
  TEN_PUSHES: { id: 'ten_pushes', name: '10 Pushes', icon: '🥈', condition: (count) => count === 10 },
  FIFTY_PUSHES: { id: 'fifty_pushes', name: '50 Pushes', icon: '🥇', condition: (count) => count === 50 },
  HUNDRED_PUSHES: { id: 'hundred_pushes', name: '100 Pushes', icon: '👑', condition: (count) => count === 100 },
  NIGHT_OWL: { id: 'night_owl', name: 'Night Owl', icon: '🦉', condition: (count, hour) => hour >= 0 && hour < 5 },
  EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', icon: '🐦', condition: (count, hour) => hour >= 5 && hour < 8 },
  PRODUCTIVE_DAY: { id: 'productive_day', name: 'Productive Day', icon: '📈', condition: (count, hour, todayCount) => todayCount >= 10 }
};

function checkAchievements(count, hour, todayCount) {
  const unlocked = [];
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!achievements.includes(key)) {
      let condition = false;
      if (key === 'NIGHT_OWL' || key === 'EARLY_BIRD') {
        condition = achievement.condition(count, hour);
      } else if (key === 'PRODUCTIVE_DAY') {
        condition = achievement.condition(count, hour, todayCount);
      } else {
        condition = achievement.condition(count);
      }
      if (condition) {
        achievements.push(key);
        unlocked.push(achievement);
      }
    }
  }
  return unlocked;
}

// ============ UTILITY FUNCTIONS ============
function getFormattedDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return { date, time, full: `${date} ${time}`, hour: now.getHours() };
}

function printSeparator(char = '═', length = 70) {
  console.log(chalk.dim(char.repeat(length)));
}

function sendNotification(title, message) {
  try {
    notifier.notify({
      title: title,
      message: message,
      sound: true,
      wait: false
    });
  } catch (error) {}
}

// ============ LOGGING ============
function saveToLog(data) {
  try {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    
    const logFile = path.join(logDir, `push-log-${new Date().toISOString().split('T')[0]}.txt`);
    const logEntry = `${new Date().toISOString()} | Push #${pushCount} | ${data.filesChanged} files | ${data.commitHash} | ${data.commitMessage}\n`;
    fs.appendFileSync(logFile, logEntry);
    
    const jsonLog = path.join(logDir, 'push-history.json');
    let history = [];
    if (fs.existsSync(jsonLog)) {
      history = JSON.parse(fs.readFileSync(jsonLog, 'utf8'));
    }
    history.push({
      timestamp: new Date().toISOString(),
      pushNumber: pushCount,
      filesChanged: data.filesChanged || 0,
      commitHash: data.commitHash || '',
      commitMessage: data.commitMessage || '',
      xpEarned: data.xpEarned || 0
    });
    fs.writeFileSync(jsonLog, JSON.stringify(history, null, 2));
  } catch (error) {}
}

// ============ MAIN PUSH FUNCTION ============
async function pushChanges(trigger = 'auto') {
  if (isPushing || isProcessing) {
    log.warning('Already pushing, skipping...');
    return;
  }
  isProcessing = true;
  
  try {
    const status = await git.status();
    
    if (status.files.length === 0 && status.staging.length === 0) {
      const { time } = getFormattedDateTime();
      log.warning(`No changes to commit (${time})`);
      isProcessing = false;
      return;
    }

    isPushing = true;
    
    const progressBar = new cliProgress.SingleBar({
      format: '📤 Push Progress |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total} steps',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: true
    });

    const filePaths = status.files.map(f => f.path);
    const uniqueFiles = pendingChanges.size || filePaths.length;
    const triggerText = trigger === 'timer' ? '⏰ Scheduled' : 
                       trigger === 'force' ? '💪 Force' : 
                       trigger === 'initial' ? '🚀 Initial' : '📦 Batch';
    
    pushCount++;
    todayPushes++;
    totalFilesChanged += filePaths.length;
    
    const { date, time, full, hour } = getFormattedDateTime();
    
    // Generate commit message
    const commitMessage = generateCommitMessage(filePaths, pushCount);
    
    printSeparator('═');
    log.highlight(`📦 BATCH PUSH #${pushCount} - ${triggerText} - ${full}`);
    printSeparator('─');
    log.info(`📄 Total files changed: ${filePaths.length}`);
    log.info(`📄 Unique files: ${uniqueFiles}`);
    log.info(`📝 Commit message: ${chalk.yellow(commitMessage)}`);
    
    // Show changed files (limit to 20)
    if (filePaths.length > 0 && filePaths.length <= 20) {
      filePaths.forEach(file => {
        if (!file.includes('logs/') && !file.includes('reports/')) {
          const disc = detectDiscipline(file);
          const prefix = disc ? `${disc.emoji} ` : '📄 ';
          console.log(`   ${prefix}${chalk.cyan(file)}`);
        }
      });
    } else if (filePaths.length > 20) {
      log.info(`Showing first 20 of ${filePaths.length} files:`);
      let count = 0;
      filePaths.forEach(file => {
        if (!file.includes('logs/') && !file.includes('reports/') && count < 20) {
          const disc = detectDiscipline(file);
          const prefix = disc ? `${disc.emoji} ` : '📄 ';
          console.log(`   ${prefix}${chalk.cyan(file)}`);
          count++;
        }
      });
      log.dim(`   ... and ${filePaths.length - count} more`);
    }
    
    printSeparator('─');
    
    // Start progress
    progressBar.start(4, 0);
    
    progressBar.update(1);
    log.info('📤 Staging all files...');
    await git.add('.');
    
    progressBar.update(2);
    log.info('📝 Committing batch...');
    const commitResult = await git.commit(commitMessage);
    
    if (commitResult.commit) {
      progressBar.update(3);
      log.info('📤 Pushing batch to remote...');
      await git.push();
      
      progressBar.update(4);
      progressBar.stop();
      
      // Calculate XP
      const xpEarned = Math.floor(filePaths.length * 2) + 15;
      xpPoints += xpEarned;
      
      log.success(`✅ Batch push #${pushCount} successful!`);
      log.success(`✅ Committed: ${commitResult.commit.substring(0, 7)}`);
      log.success(`✅ Message: ${chalk.yellow(commitMessage)}`);
      console.log(chalk.magenta(`⭐ +${xpEarned} XP (Total: ${xpPoints} XP)`));
      
      pendingChanges.clear();
      lastPushTime = Date.now();
      
      // Show uptime
      const uptime = Math.floor((new Date() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      log.info(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
      
      // Check achievements
      const unlockedAchievements = checkAchievements(pushCount, hour, todayPushes);
      if (unlockedAchievements.length > 0) {
        printSeparator('─');
        log.highlight('🏆 ACHIEVEMENT UNLOCKED! 🏆');
        unlockedAchievements.forEach(ach => {
          console.log(chalk.magenta(`   ${ach.icon} ${ach.name}`));
          sendNotification(`🏆 Achievement Unlocked!`, `${ach.icon} ${ach.name}`);
        });
      }
      
      sendNotification(
        `✅ Batch Push #${pushCount} Successful`,
        `${filePaths.length} files pushed | ⭐ +${xpEarned} XP`
      );
      
      saveToLog({
        filesChanged: filePaths.length,
        commitHash: commitResult.commit.substring(0, 7),
        commitMessage: commitMessage,
        xpEarned: xpEarned
      });
      
      printSeparator('═');
      log.highlight(`✨ Batch #${pushCount} complete!\n`);
      
    } else {
      progressBar.stop();
      log.warning('Nothing to commit');
      printSeparator('─');
    }
    
  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.message.includes('Authentication failed')) {
      log.warning('💡 Please check your Git credentials');
      sendNotification('❌ Push Failed', 'Authentication error - check Git credentials');
    }
    printSeparator('─');
  } finally {
    isPushing = false;
    isProcessing = false;
  }
}

// ============ FILE WATCHER ============
const IGNORED_PATHS = [
  /(^|[\/\\])\../,
  /node_modules/,
  /\.git/,
  /build/,
  /dist/,
  /\.docusaurus/,
  /\.cache/,
  /package-lock\.json/,
  /Out-Null/,
  /logs/,
  /reports/,
  /auto-push/
];

const watcher = chokidar.watch('.', {
  ignored: (path) => {
    for (const pattern of IGNORED_PATHS) {
      if (pattern.test(path)) return true;
    }
    return false;
  },
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  }
});

// Animated spinner
const spinner = ora({
  text: 'Watching for file changes...',
  color: 'cyan',
  spinner: 'dots12'
}).start();

// ============ SCHEDULE PUSH ============
function schedulePush() {
  if (timeoutId) clearTimeout(timeoutId);
  spinner.text = `⏳ Waiting for changes to settle... (${pendingChanges.size} files collected)`;
  spinner.color = 'yellow';
  timeoutId = setTimeout(() => {
    spinner.stop();
    if (pendingChanges.size > 0) {
      log.info(`📦 Pushing all ${pendingChanges.size} files together...`);
      pushChanges('batch');
    }
    spinner.start();
    timeoutId = null;
  }, DEBOUNCE_MS);
}

// File change handler
watcher
  .on('change', (filePath) => {
    if (filePath.includes('logs/') || filePath.includes('reports/')) return;
    if (filePath.includes('auto-push/')) return;
    
    const { time } = getFormattedDateTime();
    const fileName = path.basename(filePath);
    pendingChanges.add(filePath);
    spinner.text = `📝 Modified: ${fileName} (${pendingChanges.size} files) (${time})`;
    spinner.color = 'yellow';
    schedulePush();
  })
  .on('add', (filePath) => {
    if (filePath.includes('logs/') || filePath.includes('reports/')) return;
    if (filePath.includes('auto-push/')) return;
    
    const { time } = getFormattedDateTime();
    const fileName = path.basename(filePath);
    pendingChanges.add(filePath);
    spinner.text = `➕ Added: ${fileName} (${pendingChanges.size} files) (${time})`;
    spinner.color = 'green';
    schedulePush();
  })
  .on('unlink', (filePath) => {
    if (filePath.includes('logs/') || filePath.includes('reports/')) return;
    if (filePath.includes('auto-push/')) return;
    
    const { time } = getFormattedDateTime();
    const fileName = path.basename(filePath);
    pendingChanges.add(filePath);
    spinner.text = `➖ Deleted: ${fileName} (${pendingChanges.size} files) (${time})`;
    spinner.color = 'red';
    schedulePush();
  })
  .on('error', (error) => {
    spinner.text = `⚠️  Watcher error: ${error.message}`;
    spinner.color = 'red';
  });

// ============ TIME-BASED BATCH PUSH ============
setInterval(async () => {
  try {
    const status = await git.status();
    if (status.files.length > 0) {
      spinner.stop();
      log.info('⏰ Scheduled batch push triggered');
      await pushChanges('timer');
      spinner.start();
    }
  } catch (error) {}
}, BATCH_INTERVAL_MS);

// ============ FORCE PUSH ============
setInterval(async () => {
  try {
    const status = await git.status();
    if (status.files.length > 0) {
      spinner.stop();
      log.warning('💪 Force push triggered - pushing all changes');
      await pushChanges('force');
      spinner.start();
    }
  } catch (error) {}
}, FORCE_PUSH_INTERVAL);

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGINT', async () => {
  spinner.stop();
  printSeparator('═');
  log.info('\n👋 Shutting down auto-push...');
  const { full } = getFormattedDateTime();
  log.info(`📅 Stopped at: ${full}`);
  log.info(`📊 Total batch pushes: ${pushCount}`);
  log.info(`📊 Total files pushed: ${totalFilesChanged}`);
  log.info(`⭐ Total XP: ${xpPoints}`);
  log.info(`🏆 Achievements: ${achievements.length}`);
  
  try {
    const status = await git.status();
    if (status.files.length > 0) {
      log.info('📤 Pushing final batch...');
      await pushChanges('final');
    }
  } catch (error) {}
  
  const report = generateReport();
  console.log(report);
  
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
  const reportFile = path.join(reportDir, `report-${new Date().toISOString().split('T')[0]}.txt`);
  fs.writeFileSync(reportFile, report);
  log.info(`📊 Report saved to: ${reportFile}`);
  
  await watcher.close();
  log.success('✅ Auto-push stopped');
  printSeparator('═');
  process.exit(0);
});

// ============ GENERATE REPORT ============
function generateReport() {
  const { date, time } = getFormattedDateTime();
  const uptime = Math.floor((new Date() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  const report = `
╔═══════════════════════════════════════════════════════════════╗
║                    📊 PUSH REPORT                           ║
╚═══════════════════════════════════════════════════════════════╝

📅 Date: ${date}
⏰ Time: ${time}
⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s

📊 Statistics:
   • Total Pushes: ${pushCount}
   • Today's Pushes: ${todayPushes}
   • Total Files Changed: ${totalFilesChanged}
   • XP Points: ${xpPoints} ⭐

🏆 Achievements Unlocked: ${achievements.length}
   ${achievements.map(a => `   ${ACHIEVEMENTS[a]?.icon || '🏅'} ${ACHIEVEMENTS[a]?.name || a}`).join('\n   ') || '   None yet'}

📈 Performance:
   • Average Files per Push: ${pushCount > 0 ? (totalFilesChanged / pushCount).toFixed(1) : 0}
   • Push Rate: ${pushCount > 0 ? (pushCount / (uptime / 3600)).toFixed(1) : 0} pushes/hour

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  return report;
}

// ============ STARTUP ============
console.log(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║   📦 BATCH AUTO-PUSH WATCHER STARTED                             ║'));
console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════════════╝'));
console.log(`\n📁 Root: ${chalk.cyan(process.cwd())}`);
console.log(`⏱️  Debounce: ${chalk.yellow(DEBOUNCE_MS/1000)} seconds`);
console.log(`⏰ Scheduled Batch: ${chalk.yellow(BATCH_INTERVAL_MS/60000)} minutes`);
console.log(`💪 Force Push: ${chalk.yellow(FORCE_PUSH_INTERVAL/60000)} minutes`);
console.log(`📅 Started: ${chalk.green(getFormattedDateTime().full)}`);
console.log(`🤖 Auto Commit Messages: ${chalk.magenta('ENABLED')}`);
console.log(`🏆 Achievements: ${chalk.magenta('Enabled')}`);
console.log(`⭐ XP System: ${chalk.magenta('Enabled')}`);
console.log(`🔔 Notifications: ${chalk.magenta('Enabled')}`);
console.log(`📦 Batch Mode: ${chalk.magenta('ALL CHANGES BATCHED TOGETHER')}`);
console.log(`🚫 Ignored: ${chalk.dim('logs/, reports/, node_modules/, .git/, auto-push/')}`);
console.log('🔒 Press Ctrl+C to stop\n');
printSeparator('─');

// Initial check
setTimeout(async () => {
  try {
    const status = await git.status();
    if (status.files.length > 0) {
      const { full } = getFormattedDateTime();
      log.info(`📄 Found ${status.files.length} uncommitted changes at ${full}`);
      spinner.stop();
      await pushChanges('initial');
      spinner.start();
    } else {
      log.success('✅ Repository clean');
      printSeparator('─');
    }
  } catch (error) {}
}, 1000);