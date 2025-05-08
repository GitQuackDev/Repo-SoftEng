const Comment = require('../../models/Comment');
const Discussion = require('../../models/Discussion');

// Get all comments for a discussion (nested, with debug)
exports.getCommentsByDiscussion = async (req, res) => {
  try {
    console.log('[DEBUG] getCommentsByDiscussion called, discussionId:', req.params.discussionId);
    const discussionId = req.params.discussionId;
    const comments = await Comment.find({ discussion: discussionId })
      .populate('author', 'name avatar')
      .lean();
    // Build nested structure
    const map = {};
    comments.forEach(c => (map[c._id] = { ...c, replies: [] }));
    const roots = [];
    comments.forEach(c => {
      if (c.parent) map[c.parent]?.replies.push(map[c._id]);
      else roots.push(map[c._id]);
    });
    console.log('[DEBUG] getCommentsByDiscussion result:', roots);
    res.json(roots);
  } catch (err) {
    console.error('[DEBUG] getCommentsByDiscussion error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a comment (can be root or reply, with debug)
exports.createComment = async (req, res) => {
  try {
    console.log('[DEBUG] createComment called, body:', req.body, 'user:', req.user);
    const { discussionId, parentId, sections } = req.body;
    const author = req.user._id || req.user.id;
    const comment = await Comment.create({
      discussion: discussionId,
      author,
      parent: parentId || null,
      sections,
    });
    console.log('[DEBUG] createComment created:', comment);
    res.status(201).json(comment);
  } catch (err) {
    console.error('[DEBUG] createComment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Edit a comment (author only)
exports.editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    if (!comment.author.equals(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    comment.sections = req.body.sections;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a comment (author or discussion author)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    const discussion = await Discussion.findById(comment.discussion);
    if (
      !comment.author.equals(req.user.id) &&
      !discussion.author.equals(req.user.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Delete all nested replies recursively
    await deleteCommentAndReplies(comment._id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function deleteCommentAndReplies(commentId) {
  const replies = await Comment.find({ parent: commentId });
  for (const reply of replies) {
    await deleteCommentAndReplies(reply._id);
  }
  await Comment.deleteOne({ _id: commentId });
}

// Like/dislike a comment
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    const userId = req.user._id || req.user.id;
    // Remove user from dislikes if present
    comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);
    // Toggle like: if already liked, remove; if not, add
    if (comment.likes.map(id => id.toString()).includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    const userId = req.user._id || req.user.id;
    // Remove user from likes if present
    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    // Toggle dislike: if already disliked, remove; if not, add
    if (comment.dislikes.map(id => id.toString()).includes(userId)) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);
    } else {
      comment.dislikes.push(userId);
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
