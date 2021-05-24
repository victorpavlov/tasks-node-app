const express = require('express');
const sharp =  require('sharp');
const multer = require('multer');
const auth = require('./../middleware/auth');
const User = require('./../models/user');
const { sendWelcomeEmail, sendBayEmail } = require('./../emails/account');
const router = new express.Router();

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/.(j|p|e|n|g)+$/gi)) {
      console.log(file.originalname);
      return cb(new Error('File must be an image in .jpg/jpeg or .png format'));
    }
    cb(undefined, true);
    // cb(undefined, false);
  }
});

//
// Users API
//
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (error) {
    res.status(400);
    res.send(error.message)
  }
});

router.post('/users/signup', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    res.send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.post('/users/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedFields = ['name', 'email', 'age', 'password'];
  const isValidUpdate = updates.every(update => allowedFields.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({error: 'Invalid filed to update!'});
  }

  try {
    const user = req.user;

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendBayEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150 }).jpeg().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  }, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

router.delete( '/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.set('Content-Type', 'image/jpeg');
    res.send(user.avatar);

    if (!user || !user.avatar) {
      throw new Error();
    }
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
