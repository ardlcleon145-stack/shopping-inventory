const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({ name: String });
const PICSchema = new mongoose.Schema({ name: String, phone: String });

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  pic: { type: mongoose.Schema.Types.ObjectId, ref: 'PIC' }
});

const CustomerSchema = new mongoose.Schema({ name: String, email: String });

const SaleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  date: { type: Date, default: Date.now }
});

const PurchaseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  pricePerItem: Number,
  supplier: String,
  date: { type: Date, default: Date.now }
});

module.exports = {
  Category: mongoose.model('Category', CategorySchema),
  PIC: mongoose.model('PIC', PICSchema),
  Product: mongoose.model('Product', ProductSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Sale: mongoose.model('Sale', SaleSchema),
  Purchase: mongoose.model('Purchase', PurchaseSchema)
};