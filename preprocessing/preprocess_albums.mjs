// preprocess_albums.mjs
// Run with: node preprocess_albums.mjs
import { spawn } from "child_process";

const commands = [
  ['node', ['fetch_albums.mjs', 'Deep Purple'], { env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' } }],
  ['node', ['transform_albums.mjs']],
  ['node', ['merge_events.mjs']]
];

async function runCommand([cmd, args, options = {}]) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, { stdio: 'pipe', ...options });

    child.stdout.on('data', data => process.stdout.write(data));
    child.stderr.on('data', data => process.stderr.write(data));

    child.on('close', code => {
      if (code !== 0) return reject(new Error(`${cmd} exited with code ${code}`));
      resolve();
    });
  });
}

(async () => {
  try {
    for (const cmd of commands) {
      await runCommand(cmd);
    }
    console.log("All preprocessing scripts finished successfully!");
  } catch (err) {
    console.error("Processing stopped due to error:", err);
  }
})();
