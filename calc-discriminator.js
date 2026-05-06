const crypto = require('crypto');

function getDiscriminator(name) {
  const hash = crypto.createHash('sha256');
  hash.update(`global:${name}`);
  const digest = hash.digest();
  return Array.from(digest.slice(0, 8));
}

console.log('initialize_pool:', getDiscriminator('initialize_pool'));
