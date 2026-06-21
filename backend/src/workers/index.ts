// Run this as its OWN process (not inside your main API server):
//   node dist/workers/index.js
// or with pm2 / a separate Docker service / a separate ECS task, etc.
//
// Keeping it separate from the API process means a burst of deposit
// processing never competes with HTTP request handling for CPU/event-loop
// time, and you can scale worker count independently of API instance count.
import './depositWorker.js';

console.log('[Worker] Deposit worker process started');