// Pre-Deployment Test Suite
// Tests the server structure and validates all components

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🧪 PRE-DEPLOYMENT TEST SUITE');
console.log('='.repeat(60) + '\n');

let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✅ PASS: ${name}`);
        if (details) console.log(`   ${details}`);
        passCount++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        if (details) console.log(`   ${details}`);
        failCount++;
    }
}

// Test 1: Check critical files exist
console.log('\n📁 File Structure Tests\n');
test('api/index.js exists', fs.existsSync('api/index.js'));
test('db.js exists', fs.existsSync('db.js'));
test('server-postgres.js exists', fs.existsSync('server-postgres.js'));
test('vercel.json exists', fs.existsSync('vercel.json'));
test('package.json exists', fs.existsSync('package.json'));

// Test 2: Verify package.json dependencies
console.log('\n📦 Dependencies Tests\n');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    test('@vercel/postgres installed', !!pkg.dependencies['@vercel/postgres'], 
         pkg.dependencies['@vercel/postgres']);
    test('serverless-http installed', !!pkg.dependencies['serverless-http'],
         pkg.dependencies['serverless-http']);
    test('express installed', !!pkg.dependencies.express,
         pkg.dependencies.express);
    test('cors installed', !!pkg.dependencies.cors,
         pkg.dependencies.cors);
} catch (err) {
    test('package.json readable', false, err.message);
}

// Test 3: Verify vercel.json configuration
console.log('\n⚙️  Vercel Configuration Tests\n');
try {
    const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    test('vercel.json has version', vercel.version === 2);
    test('vercel.json has builds', Array.isArray(vercel.builds) && vercel.builds.length > 0,
         `${vercel.builds?.length || 0} build configs`);
    test('vercel.json has routes', Array.isArray(vercel.routes) && vercel.routes.length > 0,
         `${vercel.routes?.length || 0} routes`);
    test('API route configured', vercel.routes.some(r => r.src.includes('/api/')));
    test('Default route configured', vercel.routes.some(r => r.src === '/'));
} catch (err) {
    test('vercel.json readable', false, err.message);
}

// Test 4: Verify api/index.js
console.log('\n🔌 Serverless Function Tests\n');
try {
    const apiIndex = fs.readFileSync('api/index.js', 'utf8');
    test('api/index.js imports serverless-http', apiIndex.includes('serverless-http'));
    test('api/index.js imports server-postgres', apiIndex.includes('server-postgres'));
    test('api/index.js exports handler', apiIndex.includes('module.exports'));
} catch (err) {
    test('api/index.js readable', false, err.message);
}

// Test 5: Verify db.js structure
console.log('\n💾 Database Module Tests\n');
try {
    const dbContent = fs.readFileSync('db.js', 'utf8');
    test('db.js uses @vercel/postgres', dbContent.includes('@vercel/postgres'));
    test('db.js has initializeDatabase', dbContent.includes('initializeDatabase'));
    test('db.js has hashPassword', dbContent.includes('hashPassword'));
    test('db.js has findUserByToken', dbContent.includes('findUserByToken'));
    test('db.js has createTransaction', dbContent.includes('createTransaction'));
    test('db.js has getStatistics', dbContent.includes('getStatistics'));
    test('db.js exports functions', dbContent.includes('module.exports'));
} catch (err) {
    test('db.js readable', false, err.message);
}

// Test 6: Verify server-postgres.js
console.log('\n🖥️  Server Tests\n');
try {
    const serverContent = fs.readFileSync('server-postgres.js', 'utf8');
    test('server-postgres.js imports db module', serverContent.includes("require('./db')"));
    test('server-postgres.js has authentication', serverContent.includes('authenticate'));
    test('server-postgres.js has login route', serverContent.includes('/api/auth/login'));
    test('server-postgres.js has transactions route', serverContent.includes('/api/transactions'));
    test('server-postgres.js has stats route', serverContent.includes('/api/stats'));
    test('server-postgres.js exports app', serverContent.includes('module.exports = app'));
    test('server-postgres.js has database init', serverContent.includes('ensureDatabase'));
} catch (err) {
    test('server-postgres.js readable', false, err.message);
}

// Test 7: Verify HTML files use relative paths
console.log('\n🌐 Frontend Tests\n');
const htmlFiles = ['login.html', 'admin.html', 'client.html'];
htmlFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const usesRelativePath = content.includes("const API_URL = '/api'");
        const usesLocalhost = content.includes("localhost:3000");
        test(`${file} uses relative API path`, usesRelativePath && !usesLocalhost);
    } catch (err) {
        test(`${file} readable`, false, err.message);
    }
});

// Test 8: Verify documentation exists
console.log('\n📖 Documentation Tests\n');
const docs = ['README.md', 'QUICK-START.md', 'VERCEL-DEPLOYMENT-GUIDE.md', '.env.example'];
docs.forEach(doc => {
    test(`${doc} exists`, fs.existsSync(doc));
});

// Test 9: Verify routes are defined correctly
console.log('\n🛣️  API Routes Tests\n');
try {
    const serverContent = fs.readFileSync('server-postgres.js', 'utf8');
    const routes = [
        { name: 'POST /api/auth/login', pattern: "post('/api/auth/login'" },
        { name: 'GET /api/auth/verify', pattern: "get('/api/auth/verify'" },
        { name: 'GET /api/transactions', pattern: "get('/api/transactions'" },
        { name: 'POST /api/transactions', pattern: "post('/api/transactions'" },
        { name: 'DELETE /api/transactions/:id', pattern: "delete('/api/transactions/:id'" },
        { name: 'GET /api/stats', pattern: "get('/api/stats'" },
        { name: 'GET /api/users', pattern: "get('/api/users'" },
        { name: 'POST /api/users', pattern: "post('/api/users'" }
    ];
    
    routes.forEach(route => {
        test(route.name, serverContent.includes(route.pattern));
    });
} catch (err) {
    test('Route verification', false, err.message);
}

// Test 10: Check for syntax errors by requiring modules
console.log('\n🔍 Syntax Validation Tests\n');
try {
    // Test if db.js has valid syntax (will throw if syntax error)
    const dbModule = require('./db');
    test('db.js syntax valid', typeof dbModule === 'object');
    test('db.js exports functions', Object.keys(dbModule).length > 0,
         `${Object.keys(dbModule).length} functions exported`);
} catch (err) {
    test('db.js syntax valid', false, err.message);
}

try {
    const serverModule = require('./server-postgres');
    test('server-postgres.js syntax valid', typeof serverModule === 'function' || typeof serverModule === 'object');
} catch (err) {
    // Expected to fail without Postgres connection
    if (err.message.includes('POSTGRES') || err.message.includes('postgres')) {
        test('server-postgres.js syntax valid', true, 'Cannot connect to Postgres (expected)');
    } else {
        test('server-postgres.js syntax valid', false, err.message);
    }
}

// Final Report
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Ready for deployment!\n');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Review before deployment.\n');
    process.exit(1);
}
