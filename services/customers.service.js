const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');
const { models } = require('../libs/sequelize');
const { Customer } = models;

class CustomerService {

  constructor() { }

  async find() {
    const rta = await Customer.findAll({
      include: ['user']
    });
    return rta;
  }

  async findOne(id) {
    const user = await Customer.findByPk(id);
    if (!user) {
      throw boom.notFound('customer not found');
    }
    return user;
  }

  async create(data) {
    const hash = await bcrypt.hash(data.user.password, 10);
    const newData = {
      ...data,
      user: {
        ...data.user,
        password: hash
      }
    }
    const newCustomer = await Customer.create(newData, {
      include: ['user']
    });
    delete newCustomer.user.dataValues.password;
    return newCustomer;
  }

  async update(id, changes) {
    const model = await this.findOne(id);
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { rta: true };
  }

}

module.exports = CustomerService;
