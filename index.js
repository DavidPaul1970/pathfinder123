const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const routes = require('./routes/routes');
const path = require('path');
const mongoose = require('mongoose');

const Group = require('./models/Group');
const groupRoutes = require('./routes/groupRoutes');

dotenv.config();
const app = express();

// إعداد EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// استقبال بيانات JSON من الفورم
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // لتفكيك JSON من الطلبات

// إعداد ملفات static (مثل CSS)
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
connectDB();

// راوت API لإضافة مستخدم وغيره
app.use('/api/users', routes);
app.use('/groups', groupRoutes);

// راوت رئيسي يعرض المستخدمين من MongoDB داخل صفحة EJS
app.get('/home/S3766@', async (req, res) => {
  try {
    const groups = await Group.find();
    // نجيب الدومين الأساسي من الطلب
    const baseUrl = req.protocol + '://' + req.get('host');
    res.render('index', { groups, baseUrl });
  } catch (err) {
    // console.log(err);
    res.status(500).send('حدث خطأ أثناء تحميل المجموعات');
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
