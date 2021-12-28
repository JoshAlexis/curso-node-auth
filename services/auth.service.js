const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserService = require('./user.service');
const service = new UserService();
const { config } = require('../config/config');

class AuthService {
  async getUser(email, password) {
    const user = await service.findByEmail(email);
    if (!user) throw boom.unauthorized();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw boom.unauthorized();
    delete user.dataValues.password;
    return user;
  }

  signToken(user) {
    const payload = {
      sub: user.id,
      role: user.role,
    }
    const token = jwt.sign(payload, config.jwtSecret)
    return token
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOne(payload.sub);
      if (user.recovery_token !== token) throw boom.unauthorized();
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, { recovery_token: null, password: hash })
      return { message: 'password changed' }
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async sendRecovery(email) {
    const user = await service.findByEmail(email);
    if (!user) throw boom.unauthorized();
    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15min' });
    const link = `http://frontend.com/recovery?token=${token}`
    await service.update(user.id, { recovery_token: token });
    const mail = {
      from: '',
      to: `${user.email}`,
      subject: 'Email para recuperación de contraseña',
      html: `<p>Ingresa a este link ${link} </p>`
    }
    const response = await this.sendMail(mail);
    return response;
  }

  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: 'smtp',
      secure: true,
      port: 465,
      auth: {
        user: 'nicobytes.demo@gmail.com',
        pass: ''
      }
    })
    await transporter.sendMail(infoMail)
    return { message: 'mail sended' };
  }
}

module.exports = AuthService;
