const Discussion = require('../../models/Discussion');
const User = require('../../models/User');

// Get all discussions (with debug)
exports.getAllDiscussions = async (req, res) => {
  try {
    console.log('[DEBUG] getAllDiscussions called');
    const discussions = await Discussion.find()
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    console.log('[DEBUG] getAllDiscussions result:', discussions);
    res.json(discussions);
  } catch (err) {
    console.error('[DEBUG] getAllDiscussions error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single discussion by ID
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar');
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a discussion (author only)
exports.editDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    if (!discussion.author.equals(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    discussion.title = req.body.title || discussion.title;
    discussion.sections = req.body.sections || discussion.sections;
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a discussion (author only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    if (!discussion.author.equals(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    await discussion.deleteOne();
    res.json({ message: 'Discussion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like a discussion
exports.likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    const userId = req.user.id;
    if (!discussion.likes.includes(userId)) {
      discussion.likes.push(userId);
      discussion.dislikes = discussion.dislikes.filter(id => id.toString() !== userId);
    }
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Dislike a discussion
exports.dislikeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    const userId = req.user.id;
    if (!discussion.dislikes.includes(userId)) {
      discussion.dislikes.push(userId);
      discussion.likes = discussion.likes.filter(id => id.toString() !== userId);
    }
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new discussion (with debug)
exports.createDiscussion = async (req, res) => {
  try {
    console.log('[DEBUG] createDiscussion called, body:', req.body, 'user:', req.user);
    const { title, sections } = req.body;
    const author = req.user.id;
    const discussion = await Discussion.create({
      title,
      sections,
      author,
    });
    await discussion.populate('author', 'name avatar');
    console.log('[DEBUG] createDiscussion created:', discussion);
    res.status(201).json(discussion);
  } catch (err) {
    console.error('[DEBUG] createDiscussion error:', err);
    res.status(400).json({ error: err.message });
  }
};