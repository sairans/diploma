const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

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

    if (user?.email) {
      const html = `
        <h2>Добро пожаловать в приложение Sports Booking!</h2>
        <p>Спасибо за регистрацию, ${user.name || 'пользователь'}.</p>
        <p>Теперь вы можете бронировать спортивные площадки через наше приложение.</p>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Добро пожаловать!',
        html
      });
    }
  } catch (error) {
    console.error(error);
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
    const users = await User.find().select('-password');
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
    user.payments = user.payments.filter(
      (p) => p._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: 'Карта удалена', payments: user.payments });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления карты' });
  }
};

exports.getUserCards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('payments');
    if (!user)
      return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user.payments);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения карт пользователя' });
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

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: 'Пользователь не найден' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Неверный текущий пароль' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Пароль успешно обновлен' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при смене пароля' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email обязателен' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Пользователь не найден' });

    const tempPassword = Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(tempPassword, salt);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Ваш временный пароль',
      html: `
        <p>Здравствуйте, ${user.name || 'пользователь'}!</p>
        <p>Ваш временный пароль для входа: <strong>${tempPassword}</strong></p>
        <p>Пожалуйста, войдите и смените пароль в профиле.</p>
      `
    });

    res.json({ message: 'Временный пароль отправлен на email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сброса пароля' });
  }
};
