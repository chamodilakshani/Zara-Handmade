const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'zarah_secret_key_123';

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zarahhandmade';
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.log("MongoDB Connection Error: ", err));

// ---- SCHEMAS ----
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' }
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    icon: { type: String, default: '🌸' },
    desc: { type: String },
    image: { type: String, default: "" }
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    userId: String,
    username: String,
    flowerType: String,
    wrapColor: String,
    customNotes: String,
    price: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// ---- API ROUTES ----
app.get('/', (req, res) => {
    res.send('Zarah Handmade Backend is Running Successfully!');
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role: role || 'customer' });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Username already exists or error occurred." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET);
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save order" });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { userId, role } = req.query;
        let orders;
        if (role === 'admin') {
            orders = await Order.find().sort({ date: -1 });
        } else {
            orders = await Order.find({ userId }).sort({ date: -1 });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

// Port settings
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;