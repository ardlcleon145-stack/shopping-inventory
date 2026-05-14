require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Product, Sale, Category } = require('./models');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Terhubung ke MongoDB Atlas'))
  .catch(err => console.error('❌ Error Koneksi:', err));

// --- 1. ROUTE READ (SUDAH ADA) ---
app.get('/products', async (req, res) => {
  const products = await Product.find().populate('category pic');
  res.json(products);
});

// --- 2. ROUTE CREATE (BARU - UNTUK TAMBAH BARANG MANUAL) ---
app.post('/products', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ message: "Produk Berhasil Ditambah!", data: newProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cari produk berdasarkan kategori tertentu
app.get('/products/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    // 1. Cari dulu ID kategorinya berdasarkan nama
    const category = await Category.findOne({ name: new RegExp(categoryName, 'i') });
    
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // 2. Cari produk yang punya category ID tersebut
    const products = await Product.find({ category: category._id }).populate('category pic');
    
    res.json({
      category: categoryName,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. ROUTE UPDATE (BARU - UNTUK EDIT HARGA/STOK) ---
app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Data Produk Diperbarui!", data: updatedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- 4. ROUTE DELETE (BARU - UNTUK HAPUS BARANG) ---
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produk Berhasil Dihapus!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- 5. ROUTE SALES (SUDAH ADA) ---
app.post('/sales', async (req, res) => {
  try {
    const { customerId, items } = req.body;
    let total = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok ${product.name} tidak cukup!` });
      }
      product.stock -= item.quantity;
      await product.save();
      total += item.price * item.quantity;
    }

    const sale = await Sale.create({ customer: customerId, items, totalAmount: total });
    res.json({ message: 'Penjualan Berhasil!', data: sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 6. ROUTE MONITORING LOW STOCK (BARU) ---
app.get('/products/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Product.find({ stock: { $lt: 10 } }).populate('category pic');
    res.json({ 
      status: "Warning",
      total_items: lowStockItems.length,
      data: lowStockItems 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 7. ROUTE REPORT (SUDAH ADA) ---
app.get('/report/stock-value', async (req, res) => {
  try {
    const report = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          totalItems: { $sum: "$stock" }
        }
      }
    ]);
    res.json(report[0] || { totalValue: 0, totalItems: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/report/sales-product', async (req, res) => {
  try {
    const report = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetail"
        }
      }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server jalan di http://localhost:${PORT}`));