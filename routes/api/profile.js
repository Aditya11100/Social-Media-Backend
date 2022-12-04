const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");

// Get current profile user
// access private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.find({ user: req.user.id }).populate("user", [
      "-password",
    ]);
    if (profile.length === 0) {
      return res.status(400).json({ message: "No profile for this User" });
    }
    console.log("Profile", profile);
    res.json(profile);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err, "err");
  }
});

// Create or update profile user
// access private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    // build profile object
    const profileField = {};
    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (status) profileField.status = status;
    if (bio) profileField.bio = bio;
    if (githubusername) profileField.githubusername = githubusername;
    if (skills) {
      profileField.skills = skills.split(",").map((item) => item.trim());
    }

    //Build social object
    profileField.social = {};
    if (youtube) profileField.social.youtube = youtube;
    if (twitter) profileField.social.twitter = twitter;
    if (facebook) profileField.social.facebook = facebook;
    if (linkedin) profileField.social.linkedin = linkedin;
    if (instagram) profileField.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileField },
          { new: true }
        );

        return res.json(profile);
      }

      profile = new Profile(profileField);

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log("err", err);
      res.status(500).send("Server Error");
    }
  }
);

// Get all profile user
// access private
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["-password"]);
    res.status(200).json(profiles);
  } catch (err) {
    console.log("err", err);
  }
});

// Get one profile user
// access private
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.find({ user: req.params.user_id }).populate(
      "user",
      ["-password"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "Profile not available" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.log("err", err);
    res.status(500).send("Server Error");
  }
});

// Delete user and profile
// access private
router.delete("/", auth, async (req, res) => {
  try {
    await Profile.deleteOne({ user: req.user.id });

    await User.deleteOne({ _id: req.user.id });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.status(200).json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

//Delete experience from profile
router.delete("/experience/:exp_id", auth, async (req, res) => {
  const { exp_id } = req.params;
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const new_arr = profile.experience.filter((item) => item.id !== exp_id);
    profile.experience = new_arr;
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//Update education from profile
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field Of Study is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

//Delete experience from profile
router.delete("/education/:edu_id", auth, async (req, res) => {
  const { edu_id } = req.params;
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const new_arr = profile.education.filter((item) => item.id !== edu_id);
    profile.education = new_arr;
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
