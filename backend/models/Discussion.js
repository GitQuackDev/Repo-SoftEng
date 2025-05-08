// Discussion model
const mongoose = require('mongoose')

const DiscussionSectionSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'file'], required: true },
  content: { type: String }, // for text
  fileUrl: { type: String }, // for file (image/pdf/etc)
  fileType: { type: String },
});

const DiscussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  sections: [DiscussionSectionSchema], // advanced, sectioned content
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Discussion', DiscussionSchema);
