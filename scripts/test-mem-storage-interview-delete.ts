import assert from 'assert';
import { MemStorage } from '../server/mem-storage';

async function run() {
  const store = new MemStorage();

  // Create a fake interview request
  const req = await store.createInterviewRequest({
    requestedById: 1,
    managerId: 2,
    position: 'Test Position',
    description: 'Test interview request',
    status: 'pending'
  } as any);

  console.log('Created interview request id=', req.id);

  // Ensure it appears in the list
  const all = await store.getInterviewRequests();
  const found = all.find(r => r.id === req.id);
  assert.ok(found, 'Created request must be present');

  // Delete it
  const deleted = await store.deleteInterviewRequest(req.id);
  assert.strictEqual(deleted, true, 'deleteInterviewRequest should return true');

  // Ensure it's gone
  const after = await store.getInterviewRequests();
  const still = after.find(r => r.id === req.id);
  assert.strictEqual(still, undefined, 'Deleted request should no longer be present');

  // Deleting again should return false
  const deletedAgain = await store.deleteInterviewRequest(req.id);
  assert.strictEqual(deletedAgain, false, 'Second delete should return false');

  console.log('PASS: mem-storage interview delete test');
}

run().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
