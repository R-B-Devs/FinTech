const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { User } = require('../models/user'); // Sequelize model

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('surname').notEmpty().withMessage('Surname is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('id_number').isLength({ min: 13, max: 13 }).withMessage('ID number must be 13 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  // 1. Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, surname, email, password, id_number, phone_number, profile_image } = req.body;

  try {
    // 2. Check for duplicate email or ID number
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email }, { id_number }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with that email or ID number' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const newUser = await User.create({
      name,
      surname,
      email,
      id_number,
      phone_number,
      profile_image,
      password: hashedPassword
    });

    // 5. Return success
    return res.status(201).json({ message: 'User registered successfully', user: { id: newUser.user_id, name: newUser.name } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;