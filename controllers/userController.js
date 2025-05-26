const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { name, email, password, phone, avatar, isAdmin } = req.body;

  if (!email?.trim() || !password?.trim() || !phone?.trim()) {
    return res.status(400).json({
      message: 'Email, password, and phone are required and cannot be empty'
    });
  }

  try {
    const userExists = await User.findOne({
      $or: [{ email: email }, { phone: phone }]
    });

    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      avatar,
      isAdmin
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error); // helpful for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // не возвращай пароли
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения пользователей' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: 'Пользователь не найден' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password && req.body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({ message: 'Данные обновлены', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления данных пользователя' });
  }
};

exports.addUserCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { cardholderName, cardNumber, expiryDate, brand } = req.body;

    if (!cardholderName || !cardNumber || !expiryDate) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    const last4 = cardNumber.slice(-4);
    user.payments.push({
      cardholderName,
      cardNumber,
      expiryDate,
      brand,
      last4
    });

    await user.save();
    res.json({ message: 'Карта добавлена', payments: user.payments });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка добавления карты' });
  }
};

exports.deleteUserCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.payments = user.payments.filter((p) => p.last4 !== req.params.last4);
    await user.save();
    res.json({ message: 'Карта удалена', payments: user.payments });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления карты' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения данных пользователя' });
  }
};
