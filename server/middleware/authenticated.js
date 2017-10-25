
const {User} = require('../models/user');

const authenticated = async (req, res, next) => {
  try {
    const token = req.header('x-auth');
    const user = await User.findByToken(token);
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    return res.status(401).send();
  }
}

module.exports = {authenticated};
