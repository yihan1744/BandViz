// Run with: node preprocess_albums.mjs
import { exec } from "child_process";

// Array of commands to run sequentially
const commands = [
  'NODE_TLS_REJECT_UNAUTHORIZED=0 node fetch_albums.mjs "Deep Purple"',
  'node transform_albums.mjs',
  'node merge_events.mjs'
];

// Helper function to run a command
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running command: ${cmd}\n`, error);
        return reject(error);
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

// Run all commands sequentially
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
