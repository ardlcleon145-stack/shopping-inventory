require('dotenv').config();
const mongoose = require('mongoose');
const { Product, Category, PIC, Customer, Purchase, Sale } = require('./models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Bersihkan data lama
  await Promise.all([
    Product.deleteMany({}), Category.deleteMany({}), PIC.deleteMany({}),
    Customer.deleteMany({}), Purchase.deleteMany({}), Sale.deleteMany({})
  ]);

  // 1. Buat Data PIC
  const pic1 = await PIC.create({ name: 'Andi PIC', phone: '08123' });
  const pic2 = await PIC.create({ name: 'Siti Gudang', phone: '08567' });

  // 2. Buat Data Kategori
  const catElektronik = await Category.create({ name: 'Elektronik' });
  const catAksesoris = await Category.create({ name: 'Aksesoris' });
  const catPeriferal = await Category.create({ name: 'Periferal' });

  // 3. Buat Data Customer
  const cust = await Customer.create({ name: 'Budi Pembeli', email: 'budi@mail.com' });

  // 4. Buat Data Produk Beragam
  const products = [
    {
      name: 'Laptop ASUS VivoBook',
      price: 10000000,
      stock: 50,
      category: catElektronik._id,
      pic: pic1._id
    },
    {
      name: 'Mouse Gaming Razer',
      price: 850000,
      stock: 5, // Stok sedikit untuk tes fitur Low-Stock
      category: catPeriferal._id,
      pic: pic1._id
    },
    {
      name: 'Keyboard Mechanical Rexus',
      price: 450000,
      stock: 20,
      category: catPeriferal._id,
      pic: pic2._id
    },
    {
      name: 'Monitor LG 24 Inch',
      price: 2100000,
      stock: 12,
      category: catElektronik._id,
      pic: pic2._id
    },
    {
      name: 'Kabel HDMI 2.0',
      price: 75000,
      stock: 100,
      category: catAksesoris._id,
      pic: pic1._id
    }
  ];

  const createdProducts = await Product.insertMany(products);

  // 5. Buat Data Pembelian Awal (Purchase History)
  await Purchase.create({
    product: createdProducts[0]._id,
    quantity: 10,
    pricePerItem: 8000000,
    supplier: 'ASUS Corp'
  });

  console.log('✅ Database Berhasil di-Seed!');
  console.log('-------------------------------');
  console.log('Customer ID untuk test:', cust._id);
  console.log('ID Mouse Razer (Low Stock):', createdProducts[1]._id);
  console.log('-------------------------------');
  
  process.exit();
}

seed();