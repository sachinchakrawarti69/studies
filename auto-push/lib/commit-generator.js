const path = require('path');
const config = require('../config');

class CommitGenerator {
  constructor() {
    this.fileTypes = config.FILE_TYPES;
    this.emojis = config.EMOJIS;
    this.disciplines = config.DISCIPLINES;
  }

  // Detect discipline from file path
  detectDiscipline(filePath) {
    const parts = filePath.split(path.sep);
    for (const part of parts) {
      if (this.disciplines[part]) {
        return { name: part, emoji: this.disciplines[part] };
      }
    }
    return null;
  }

  // Main commit message generator
  generateCommitMessage(files, pushNumber) {
    const types = {};
    const disciplines = new Set();
    const fileNames = [];
    
    files.forEach(file => {
      const ext = path.extname(file);
      const base = path.basename(file);
      const key = ext || base;
      types[key] = (types[key] || 0) + 1;
      fileNames.push(base);
      
      // Track disciplines
      const discipline = this.detectDiscipline(file);
      if (discipline) {
        disciplines.add(discipline);
      }
    });

    // Find most common type
    let maxCount = 0;
    let mainType = '📁 Update files';
    let mainExt = '';
    for (const [ext, count] of Object.entries(types)) {
      if (count > maxCount) {
        maxCount = count;
        mainExt = ext;
        mainType = this.fileTypes[ext] || `📁 Update ${ext || 'files'}`;
      }
    }

    const total = files.length;
    let message = '';

    // Discipline-specific messages
    const disciplineArray = Array.from(disciplines);
    let disciplinePrefix = '';
    if (disciplineArray.length === 1) {
      const d = disciplineArray[0];
      disciplinePrefix = `${d.emoji} ${d.name.charAt(0).toUpperCase() + d.name.slice(1)}: `;
    } else if (disciplineArray.length > 1) {
      disciplinePrefix = `📚 Multi-discipline: `;
    }

    if (total === 1) {
      const singleFile = fileNames[0];
      const ext = path.extname(singleFile);
      const type = this.fileTypes[ext] || `📁 Update ${singleFile}`;
      message = `${disciplinePrefix}${type}`;
    } else {
      const countText = ` (${total} files)`;
      const typeText = mainType.includes('Update') ? 
        mainType.replace('Update', `Update ${total}`) : 
        `${mainType}${countText}`;
      message = `${disciplinePrefix}${typeText}`;
      
      if (total >= 10) {
        message = `${disciplinePrefix}📦 Bulk update ${total} files`;
      } else if (total >= 5) {
        message = `${disciplinePrefix}📚 Update ${total} files`;
      }
    }

    return `[#${pushNumber}] ${message}`;
  }

  // Generate discipline-specific commit
  generateDisciplineCommit(files, pushNumber) {
    const disciplineMap = {};
    files.forEach(file => {
      const disc = this.detectDiscipline(file);
      if (disc) {
        disciplineMap[disc.name] = (disciplineMap[disc.name] || 0) + 1;
      }
    });

    const discEntries = Object.entries(disciplineMap);
    if (discEntries.length === 0) {
      return this.generateCommitMessage(files, pushNumber);
    }

    let message = `[#${pushNumber}] `;
    if (discEntries.length === 1) {
      const [name, count] = discEntries[0];
      const emoji = this.disciplines[name] || '📚';
      message += `${emoji} ${name.charAt(0).toUpperCase() + name.slice(1)}: ${count} file${count > 1 ? 's' : ''}`;
    } else {
      const total = files.length;
      const discList = discEntries.map(([name, count]) => 
        `${this.disciplines[name] || '📚'} ${name}(${count})`
      ).join(' ');
      message += `${discList} (${total} total files)`;
    }
    return message;
  }

  // Generate emoji-based commit
  generateEmojiCommit(files, pushNumber) {
    const types = {};
    files.forEach(file => {
      const ext = path.extname(file);
      const base = path.basename(file);
      const key = ext || base;
      types[key] = (types[key] || 0) + 1;
    });

    let mainExt = '';
    let maxCount = 0;
    for (const [ext, count] of Object.entries(types)) {
      if (count > maxCount) {
        maxCount = count;
        mainExt = ext;
      }
    }

    const emoji = this.emojis[mainExt] || '📁';
    const total = files.length;
    const fileCount = total > 1 ? ` (${total} files)` : '';
    
    // Check if it's a discipline update
    const disc = this.detectDiscipline(files[0]);
    const discPrefix = disc ? `${disc.emoji} ` : '';
    
    return `[#${pushNumber}] ${discPrefix}${emoji} Update ${path.extname(files[0]) || 'files'}${fileCount}`;
  }

  // Study-specific commit
  generateStudyCommit(files, pushNumber) {
    const studyFiles = files.filter(f => 
      f.includes('studies/') || 
      f.includes('disciplines/') ||
      /\.(study|note|quiz|exam|assignment|lecture|tutorial|worksheet)$/.test(f)
    );
    
    if (studyFiles.length === 0) {
      return this.generateCommitMessage(files, pushNumber);
    }

    const total = files.length;
    const studyCount = studyFiles.length;
    const disc = this.detectDiscipline(studyFiles[0]);
    const discPrefix = disc ? `${disc.emoji} ` : '';
    
    return `[#${pushNumber}] ${discPrefix}📚 Study Update (${studyCount} of ${total} files)`;
  }

  // Smart commit that combines everything
  generateSmartCommit(files, pushNumber) {
    // Detect if there are study-specific files
    const hasStudyFiles = files.some(f => 
      f.includes('studies/') || 
      f.includes('disciplines/') ||
      /\.(study|note|quiz|exam|assignment|lecture|tutorial|worksheet)$/.test(f)
    );

    if (hasStudyFiles) {
      return this.generateStudyCommit(files, pushNumber);
    }

    // Detect discipline patterns
    const discs = files.map(f => this.detectDiscipline(f)).filter(Boolean);
    if (discs.length > 0) {
      return this.generateDisciplineCommit(files, pushNumber);
    }

    // Default to regular commit
    return this.generateCommitMessage(files, pushNumber);
  }
}

module.exports = new CommitGenerator();