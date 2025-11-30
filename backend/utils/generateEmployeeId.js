const User = require('../models/User');

const generateEmployeeId = async () => {
  let employeeId;
  let isUnique = false;

  while (!isUnique) {
    // Generate EMP + 4 digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    employeeId = `EMP${randomNum}`;

    const existingUser = await User.findOne({ employeeId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return employeeId;
};

module.exports = generateEmployeeId;


