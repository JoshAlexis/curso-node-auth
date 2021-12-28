const boom = require('@hapi/boom');

const { models: { Order, OrderProduct } } = require('./../libs/sequelize');

class OrderService {

  constructor() {
  }

  async create(data) {
    const newOrder = await Order.create(data);
    return newOrder;
  }

  async addItem(data) {
    const newItem = await OrderProduct.create(data);
    return newItem;
  }

  async find() {
    return [];
  }

  async findByUser(userId) {
    const orders = await Order.findAll({
      where: {
        '$customer.user.id$': userId
      },
      include: [
        {
          association: 'customer',
          include: ['user']
        }
      ]
    });
    return orders
  }

  async findOne(id) {
    const order = await Order.findByPk(id, {
      include: [
        {
          association: 'customer',
          include: ['user']
        },
        'items'
      ]
    });
    return order;
  }

  async update(id, changes) {
    return {
      id,
      changes,
    };
  }

  async delete(id) {
    return { id };
  }

}

module.exports = OrderService;
