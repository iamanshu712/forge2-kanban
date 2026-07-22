const OpenClawAgent = require('./openclaw/agent');

async function test() {
  console.log('Testing OpenClaw AI Agent locally...\n');
  const agent = new OpenClawAgent('http://127.0.0.1:8000', '4|rkG3s6M11iACXNzrgUsDHkpwExfedSukr9hjVplX29c218cf');

  // Test 1: List Tasks
  console.log('--- Test 1: List Tasks ---');
  const listReply = await agent.processCommand('list tasks');
  console.log(listReply);
  console.log('\n');

  // Test 2: Create Task
  console.log('--- Test 2: Create Task ---');
  const createReply = await agent.processCommand('create task "Build Slack Integration" in "To Do" priority high');
  console.log(createReply);
  console.log('\n');

  // Test 3: List Tasks again
  console.log('--- Test 3: List Tasks After Creation ---');
  const listReply2 = await agent.processCommand('list tasks');
  console.log(listReply2);
}

test().catch(err => console.error(err));
