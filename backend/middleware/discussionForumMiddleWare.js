// Middleware for discussion forum (optional, for future use)
// Example: check if user is discussion author, or add logging, etc.

const Discussion = require('../models/Discussion');

// Check if the user is the author of the discussion
exports.isDiscussionAuthor = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    if (!discussion.author.equals(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: Not the author' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Example: log discussion forum actions
exports.logDiscussionAction = (req, res, next) => {
  console.log(`[DiscussionForum] ${req.method} ${req.originalUrl} by user ${req.user?.id || 'guest'}`);
  next();
};
