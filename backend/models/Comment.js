const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // for nested replies
  content: { type: String },
  sections: [{
    type: { type: String, enum: ['text', 'file'], required: true },
    content: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);