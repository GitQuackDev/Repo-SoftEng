const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');
const discussionController = require('../../controllers/discussionForum/discussionController');
const commentController = require('../../controllers/discussionForum/commentController');
const fileUploadController = require('../../controllers/discussionForum/discussionFileUploadController');

// Discussion routes
router.post('/discussions', auth, discussionController.createDiscussion);
router.get('/discussions', discussionController.getAllDiscussions);
router.get('/discussions/:id', discussionController.getDiscussionById);
router.put('/discussions/:id', auth, discussionController.editDiscussion);
router.delete('/discussions/:id', auth, discussionController.deleteDiscussion);
router.post('/discussions/:id/like', auth, discussionController.likeDiscussion);
router.post('/discussions/:id/dislike', auth, discussionController.dislikeDiscussion);

// Comment routes
router.post('/comments', auth, commentController.createComment);
router.get('/comments/:discussionId', commentController.getCommentsByDiscussion);
router.put('/comments/:id', auth, commentController.editComment);
router.delete('/comments/:id', auth, commentController.deleteComment);
router.post('/comments/:id/like', auth, commentController.likeComment);
router.post('/comments/:id/dislike', auth, commentController.dislikeComment);
// Add RESTful route for creating a comment under a discussion
router.post('/discussions/:discussionId/comments', auth, (req, res, next) => {
    req.body.discussionId = req.params.discussionId;
    commentController.createComment(req, res, next);
});

// File upload (for discussion/comment sections)
router.post('/upload', auth, upload.single('file'), fileUploadController.uploadFile);

module.exports = router;
