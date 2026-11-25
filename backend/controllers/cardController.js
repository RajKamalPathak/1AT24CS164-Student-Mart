const Card = require('../models/Card');

// Helper to determine card brand from prefix
const detectCardType = (number) => {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Debit / Credit';
};

// @desc    Get all saved cards for logged-in user
// @route   GET /api/cards
// @access  Private
const getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error('[Get Cards Error]', error);
    res.status(500).json({ message: error.message || 'Error fetching cards' });
  }
};

// @desc    Save a new credit/debit card
// @route   POST /api/cards
// @access  Private
const addCard = async (req, res) => {
  try {
    const { cardHolder, cardNumber, expiryMonth, expiryYear, cardNickname, isDefault } = req.body;

    if (!cardHolder || !cardNumber || !expiryMonth || !expiryYear) {
      return res.status(400).json({ message: 'Please provide cardholder name, card number, and expiry date' });
    }

    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return res.status(400).json({ message: 'Invalid card number length' });
    }

    const last4 = cleanNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4}`;
    const detectedType = detectCardType(cleanNumber);

    // If marked default or first card, remove existing defaults
    const existingCards = await Card.find({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCards.length === 0;

    if (shouldBeDefault) {
      await Card.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newCard = await Card.create({
      user: req.user._id,
      cardHolder: cardHolder.trim(),
      cardNumber: maskedNumber,
      last4,
      expiryMonth: expiryMonth.padStart(2, '0'),
      expiryYear: expiryYear.toString().slice(-2),
      cardType: detectedType,
      cardNickname: cardNickname ? cardNickname.trim() : `${detectedType} Student Card`,
      isDefault: shouldBeDefault,
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error('[Add Card Error]', error);
    res.status(500).json({ message: error.message || 'Error saving card' });
  }
};

// @desc    Delete a saved card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });

    if (!card) {
      return res.status(404).json({ message: 'Card not found or unauthorized' });
    }

    const wasDefault = card.isDefault;
    await card.deleteOne();

    // If default was deleted, assign another card as default if any exist
    if (wasDefault) {
      const remaining = await Card.findOne({ user: req.user._id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    res.json({ message: 'Card removed successfully' });
  } catch (error) {
    console.error('[Delete Card Error]', error);
    res.status(500).json({ message: error.message || 'Error deleting card' });
  }
};

// @desc    Set a card as default
// @route   PUT /api/cards/:id/default
// @access  Private
const setDefaultCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await Card.updateMany({ user: req.user._id }, { isDefault: false });
    card.isDefault = true;
    await card.save();

    res.json({ message: 'Default card updated successfully', card });
  } catch (error) {
    console.error('[Set Default Card Error]', error);
    res.status(500).json({ message: error.message || 'Error updating default card' });
  }
};

module.exports = {
  getUserCards,
  addCard,
  deleteCard,
  setDefaultCard,
};
