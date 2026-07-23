class AchievementManager {
  constructor() {
    this.achievements = [];
    this.definitions = {
      FIRST_PUSH: { 
        id: 'first_push', 
        name: 'First Push', 
        icon: '🏆', 
        description: 'Made your first push!',
        condition: (count) => count === 1 
      },
      TEN_PUSHES: { 
        id: 'ten_pushes', 
        name: '10 Pushes', 
        icon: '🥈', 
        description: 'Completed 10 pushes!',
        condition: (count) => count === 10 
      },
      FIFTY_PUSHES: { 
        id: 'fifty_pushes', 
        name: '50 Pushes', 
        icon: '🥇', 
        description: 'Completed 50 pushes!',
        condition: (count) => count === 50 
      },
      HUNDRED_PUSHES: { 
        id: 'hundred_pushes', 
        name: '100 Pushes', 
        icon: '👑', 
        description: 'Completed 100 pushes!',
        condition: (count) => count === 100 
      },
      NIGHT_OWL: { 
        id: 'night_owl', 
        name: 'Night Owl', 
        icon: '🦉', 
        description: 'Pushed between midnight and 5 AM',
        condition: (count, hour) => hour >= 0 && hour < 5 
      },
      EARLY_BIRD: { 
        id: 'early_bird', 
        name: 'Early Bird', 
        icon: '🐦', 
        description: 'Pushed between 5 AM and 8 AM',
        condition: (count, hour) => hour >= 5 && hour < 8 
      },
      PRODUCTIVE_DAY: { 
        id: 'productive_day', 
        name: 'Productive Day', 
        icon: '📈', 
        description: 'Made 10+ pushes in a day',
        condition: (count, hour, todayCount) => todayCount >= 10 
      },
      CODE_WARRIOR: { 
        id: 'code_warrior', 
        name: 'Code Warrior', 
        icon: '⚔️', 
        description: 'Pushed 100+ files total',
        condition: (count, hour, todayCount, totalFiles) => totalFiles >= 100 
      },
      DOC_MASTER: { 
        id: 'doc_master', 
        name: 'Doc Master', 
        icon: '📚', 
        description: 'Pushed documentation files',
        condition: (count, hour, todayCount, totalFiles, fileTypes) => {
          return fileTypes && (fileTypes['.md'] || 0) > 10;
        }
      }
    };
    this.unlocked = [];
  }

  check(pushCount, hour, todayPushes, totalFilesChanged, fileTypes = {}) {
    const unlocked = [];
    for (const [key, definition] of Object.entries(this.definitions)) {
      if (this.unlocked.includes(key)) continue;
      
      let condition = false;
      try {
        if (key === 'NIGHT_OWL' || key === 'EARLY_BIRD') {
          condition = definition.condition(pushCount, hour);
        } else if (key === 'PRODUCTIVE_DAY') {
          condition = definition.condition(pushCount, hour, todayPushes);
        } else if (key === 'CODE_WARRIOR') {
          condition = definition.condition(pushCount, hour, todayPushes, totalFilesChanged);
        } else if (key === 'DOC_MASTER') {
          condition = definition.condition(pushCount, hour, todayPushes, totalFilesChanged, fileTypes);
        } else {
          condition = definition.condition(pushCount);
        }
      } catch (error) {
        // Skip if condition fails
      }
      
      if (condition) {
        this.unlocked.push(key);
        unlocked.push(definition);
      }
    }
    return unlocked;
  }

  getUnlocked() {
    return this.unlocked.map(key => this.definitions[key]).filter(Boolean);
  }

  getCount() {
    return this.unlocked.length;
  }

  isUnlocked(id) {
    return this.unlocked.includes(id);
  }

  reset() {
    this.unlocked = [];
  }

  getProgress() {
    const total = Object.keys(this.definitions).length;
    const unlocked = this.unlocked.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100)
    };
  }
}

module.exports = new AchievementManager();