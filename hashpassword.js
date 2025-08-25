const bcrypt = require('bcryptjs');

const plainPassword = process.argv[2];  // Command line se password lega

if (!plainPassword) {
  console.log("Usage: node hashPassword.js your_password_here");
  process.exit(1);
}

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    process.exit(1);
  }
  console.log("Hashed password:");
  console.log(hash);
});
