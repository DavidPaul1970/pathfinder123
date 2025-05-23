// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const multer = require('multer');
const Visit = require('../models/Visit');

// كل الراوتات المتعلقة بالمجموعات

router.post('/save-location', async (req, res) => {
  try {
    const { latitude, longitude, groupId, position } = req.body;

    const visit = new Visit({
      group: groupId,
      latitude,
      longitude,
      position
    });

    await visit.save();
    res.json({ message: 'تم حفظ الموقع بنجاح' });
  } catch (err) {
    // console.error(err);
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
    const { name, description, link, subscribersCount } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newGroup = new Group({
      image,
      name,
      description,
      link,
      subscribersCount
    });

    await newGroup.save();
    res.redirect('/home/S3766@'); // بعد الحفظ، يعيد التوجيه للصفحة الرئيسية
  } catch (err) {
    // console.error(err);
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
    // console.log(err);
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
