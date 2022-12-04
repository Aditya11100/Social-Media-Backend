const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// new post
// private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const new_post = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await new_post.save();
      res.status(200).json(post);
    } catch (err) {
      console.log("err", err);
      res.status(500).send("Server Error");
    }
  }
);

// GET all post
// private
router.get("/", auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.status(200).json(post);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Server Error");
  }
});

// DELETE one post
// private
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id });

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Server Error");
  }
});

// DELETE one post
// private
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "Post removed successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Server Error");
  }
});

// Like a post
// private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (
      post.likes.filter((item) => item.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    console.log("Error", error);
    res.status(500).send("Server Error");
  }
});

// comment a post
// private
router.put(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const post = await Post.findById(id);

      const user = await User.findById(req.user.id).select("-password");

      const new_post = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      post.comments.unshift(new_post);

      await post.save();

      res.status(200).json(post.comments);
    } catch (error) {
      console.log("Error", error);
      res.status(500).send("Server Error");
    }
  }
);

// delete a comment in post
// private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const { id, comment_id } = req.params;
    const post = await Post.findById(id);
    const comment = post.comments.find((item) => item.id === comment_id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    const comments = post.comments.filter(
      (item) => item.id.toString() !== comment_id
    );

    post.comments = comments;
    post.save();

    res.status(200).json({ comments: post.comments });
  } catch (err) {
    console.log("Error", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
