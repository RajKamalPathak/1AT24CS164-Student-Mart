const express = require('express');
const router = express.Router();
const {
  getUserCards,
  addCard,
  deleteCard,
  setDefaultCard,
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUserCards)
  .post(protect, addCard);

router.route('/:id')
  .delete(protect, deleteCard);

router.route('/:id/default')
  .put(protect, setDefaultCard);

module.exports = router;
