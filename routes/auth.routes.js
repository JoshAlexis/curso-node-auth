const express = require('express');
const passport = require('passport');
const router = express.Router();
const AuthService = require('../services/auth.service');
const service = new AuthService();

router.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res, next) => {
    try {
      const token = service.signToken(req.user);
      res.json({ token })
    } catch (error) {
      next(error);
    }
  }
)

router.post('/recovery',
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const response = await service.sendRecovery(email);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
)

router.post('/change-password',
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      const response = await service.changePassword(token, newPassword);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
)



module.exports = router;
