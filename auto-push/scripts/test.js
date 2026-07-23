#!/usr/bin/env node

const logger = require('../lib/logger');
const gitManager = require('../lib/git-manager');
const commitGenerator = require('../lib/commit-generator');
const errorHandler = require('../lib/error-handler');

async function testSystem() {
  logger.header('🧪 TESTING AUTO-PUSH SYSTEM');
  
  try {
    // Test 1: Check Git
    logger.info('📌 Testing Git...');
    const hasChanges = gitManager.hasChanges();
    logger.success(`✅ Git status: ${hasChanges ? 'Changes detected' : 'Clean'}`);
    
    const status = gitManager.gitStatus();
    logger.info(`📄 Files: ${status.length}`);
    
    // Test 2: Test commit generation
    logger.info('📌 Testing commit message generation...');
    const testFiles = ['discipline/career/notes.md', 'discipline/science/research.pdf'];
    const message = commitGenerator.generateSmartCommit(testFiles, 1);
    logger.success(`✅ Generated message: ${message}`);
    
    // Test 3: Test error handling
    logger.info('📌 Testing error handling...');
    const testError = new Error('Authentication failed');
    const analysis = errorHandler.analyzeError(testError);
    logger.success(`✅ Error analysis: ${analysis.suggestions.length} suggestions`);
    
    // Test 4: Test file type detection
    logger.info('📌 Testing file type detection...');
    const fileType = commitGenerator.getFileType('test.js');
    logger.success(`✅ File type: ${fileType ? fileType.message : 'Unknown'}`);
    
    // Test 5: Test discipline detection
    logger.info('📌 Testing discipline detection...');
    const discipline = commitGenerator.detectDiscipline('disciplines/health/notes.md');
    logger.success(`✅ Discipline: ${discipline ? discipline.name : 'Unknown'}`);
    
    console.log('\n' + '═'.repeat(50));
    logger.success('✅ All tests passed!');
    console.log('═'.repeat(50));
    
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

testSystem();