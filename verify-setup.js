#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * This script checks if your Cloudflare upload fix is properly configured
 * 
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Cloudflare Upload Setup Verification\n');
console.log('=' .repeat(60));

let allChecksPassed = true;
const errors = [];
const warnings = [];

// Check 1: Firebase.json exists
console.log('\n📋 Checking configuration files...');
if (fs.existsSync('./firebase.json')) {
  console.log('✅ firebase.json found');
} else {
  console.log('❌ firebase.json NOT found');
  errors.push('firebase.json is missing');
  allChecksPassed = false;
}

// Check 2: Functions directory exists
if (fs.existsSync('./functions')) {
  console.log('✅ functions/ directory found');
  
  // Check functions/package.json
  if (fs.existsSync('./functions/package.json')) {
    console.log('✅ functions/package.json found');
    
    // Check dependencies
    const functionsPackage = JSON.parse(fs.readFileSync('./functions/package.json', 'utf8'));
    const requiredDeps = ['firebase-admin', 'firebase-functions', 'form-data', 'node-fetch', 'cors'];
    const missingDeps = requiredDeps.filter(dep => !functionsPackage.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies present');
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      errors.push(`Install missing dependencies: cd functions && npm install ${missingDeps.join(' ')}`);
      allChecksPassed = false;
    }
  } else {
    console.log('❌ functions/package.json NOT found');
    errors.push('Run: cd functions && npm init');
    allChecksPassed = false;
  }
  
  // Check functions/index.js
  if (fs.existsSync('./functions/index.js')) {
    console.log('✅ functions/index.js found');
    
    const indexContent = fs.readFileSync('./functions/index.js', 'utf8');
    if (indexContent.includes('uploadToCloudflareImages') && indexContent.includes('uploadToCloudflareStream')) {
      console.log('✅ Both upload functions present');
    } else {
      console.log('⚠️  Upload functions may be incomplete');
      warnings.push('Check functions/index.js for uploadToCloudflareImages and uploadToCloudflareStream');
    }
  } else {
    console.log('❌ functions/index.js NOT found');
    errors.push('functions/index.js is missing');
    allChecksPassed = false;
  }
} else {
  console.log('❌ functions/ directory NOT found');
  errors.push('Run: firebase init functions');
  allChecksPassed = false;
}

// Check 3: Updated utility files
console.log('\n🔧 Checking utility files...');

const checkUtilityFile = (filePath, functionName) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('FUNCTIONS_BASE_URL')) {
      console.log(`✅ ${path.basename(filePath)} updated`);
      
      if (content.includes('YOUR_PROJECT_ID')) {
        console.log(`⚠️  ${path.basename(filePath)} still has placeholder PROJECT_ID`);
        warnings.push(`Update YOUR_PROJECT_ID in ${filePath}`);
      }
    } else {
      console.log(`❌ ${path.basename(filePath)} NOT updated`);
      errors.push(`${filePath} needs to be updated to use Firebase Functions`);
      allChecksPassed = false;
    }
  } else {
    console.log(`❌ ${path.basename(filePath)} NOT found`);
    errors.push(`${filePath} is missing`);
    allChecksPassed = false;
  }
};

checkUtilityFile('./src/utils/cloudflareImages.js', 'uploadToCloudflareImages');
checkUtilityFile('./src/utils/cloudflareStream.js', 'uploadToCloudflareStream');

// Check 4: Updated contentService.js
if (fs.existsSync('./src/services/contentService.js')) {
  const content = fs.readFileSync('./src/services/contentService.js', 'utf8');
  
  if (content.includes('isBase64Url')) {
    console.log('✅ contentService.js updated with base64 validation');
  } else {
    console.log('⚠️  contentService.js may not have base64 validation');
    warnings.push('Ensure contentService.js includes isBase64Url() function');
  }
  
  if (!content.includes('uploadBytes') && !content.includes('Firebase Storage')) {
    console.log('✅ Firebase Storage imports removed');
  } else {
    console.log('⚠️  Firebase Storage references still present');
    warnings.push('Remove Firebase Storage imports from contentService.js');
  }
} else {
  console.log('❌ contentService.js NOT found');
  errors.push('src/services/contentService.js is missing');
  allChecksPassed = false;
}

// Check 5: Environment variables
console.log('\n🔐 Checking environment variables...');

if (fs.existsSync('./.env')) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync('./.env', 'utf8');
  
  if (envContent.includes('REACT_APP_FUNCTIONS_URL')) {
    console.log('✅ REACT_APP_FUNCTIONS_URL set');
    
    if (envContent.includes('YOUR_PROJECT_ID')) {
      console.log('⚠️  REACT_APP_FUNCTIONS_URL has placeholder');
      warnings.push('Replace YOUR_PROJECT_ID in .env with actual Firebase project ID');
    }
  } else {
    console.log('⚠️  REACT_APP_FUNCTIONS_URL not set');
    warnings.push('Add REACT_APP_FUNCTIONS_URL to .env file');
  }
} else {
  console.log('⚠️  .env file NOT found');
  warnings.push('Create .env file (see .env.example)');
}

// Check 6: .gitignore
console.log('\n🔒 Checking .gitignore...');

if (fs.existsSync('./.gitignore')) {
  const gitignoreContent = fs.readFileSync('./.gitignore', 'utf8');
  
  const requiredEntries = ['.env', 'functions/node_modules', '.runtimeconfig.json'];
  const missingEntries = requiredEntries.filter(entry => !gitignoreContent.includes(entry));
  
  if (missingEntries.length === 0) {
    console.log('✅ .gitignore properly configured');
  } else {
    console.log(`⚠️  Missing gitignore entries: ${missingEntries.join(', ')}`);
    warnings.push(`Add to .gitignore: ${missingEntries.join(', ')}`);
  }
} else {
  console.log('⚠️  .gitignore NOT found');
  warnings.push('Create .gitignore file');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (allChecksPassed && errors.length === 0) {
  console.log('✅ All critical checks passed!');
} else {
  console.log(`❌ ${errors.length} critical error(s) found`);
}

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warning(s) found`);
}

// Display errors
if (errors.length > 0) {
  console.log('\n🔴 ERRORS (must fix):');
  errors.forEach((error, i) => {
    console.log(`${i + 1}. ${error}`);
  });
}

// Display warnings
if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (should fix):');
  warnings.forEach((warning, i) => {
    console.log(`${i + 1}. ${warning}`);
  });
}

// Next steps
console.log('\n' + '='.repeat(60));
console.log('📝 NEXT STEPS');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log(`
1. ✅ Setup is complete!
2. Set Firebase Functions config:
   firebase functions:config:set cloudflare.account_id="..."
3. Deploy functions:
   firebase deploy --only functions
4. Test upload in your app
5. Check Firebase Functions logs if issues occur:
   firebase functions:log
  `);
} else {
  console.log(`
1. Fix all errors listed above
2. Address warnings
3. Run this script again: node verify-setup.js
4. Once all checks pass, deploy functions:
   firebase deploy --only functions
  `);
}

console.log('\n📚 For detailed setup instructions, see:');
console.log('   - CLOUDFLARE_UPLOAD_FIX.md (complete guide)');
console.log('   - QUICK_SETUP.md (quick reference)');
console.log('');

// Exit with error code if checks failed
process.exit(allChecksPassed && errors.length === 0 ? 0 : 1);
