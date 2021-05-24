const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error('Seems it is not valid email address!')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(val) {
      if (validator.contains(val, 'password', { ignoreCase: true })) {
        throw new Error('String should not contain "password" word!')
      }
      if (val.length <= 6) {
        throw new Error('Password mast be more then 6 characters!')
      }
    }
  },
  age: {
    type: Number,
    default: true,
    validate(val) {
      if (val < 0) {
        throw new Error('Age must be a positive number!');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer,
  }
}, {
  timestamps: true,
});



userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Enable to login!');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Enable to login!');
  }

  return user;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userProfile = user.toObject();

  delete userProfile.password;
  delete userProfile.tokens;
  delete userProfile.avatar;

  return userProfile;
};

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// Hash password before saving.
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Delete al user's task on user delete.
userSchema.pre('remove', async function(next) {
  const user = this;

  await Task.deleteMany({ owner: user.id });

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
