const Account = require("../models/account");

exports.createAccount = async (req, res, next) => {
  const { username, password, displayName } = req.body;

  const account = new Account({
    teacher: "630888fc3d353400776c02fa",
    username,
    password,
    displayName,
  });
  await account.save();
  res.status(201).json({ message: "Account created" });
};
