const express = require('express');
const router = express.Router();
const AboutUs = require('../../model/aboutUs/aboutUs');

// Create
router.post('/create', async (req, res) => {
  try {
    const about = new AboutUs(req.body);
    const saved = await about.save();
    res.status(201).json({
      success: true,
      message: 'About Us created successfully',
      data: saved,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to create About Us',
      error: err.message,
    });
  }
});

// Read All
router.get('/aboutUs', async (req, res) => {
  try {
    const about = await AboutUs.findOne().select('aboutUs');
    res.json({
      success: true,
      message: 'About Us records fetched successfully',
      data: about,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch About Us records',
      error: err.message,
    });
  }
});

router.get('/termsAndCondition', async (req, res) => {
  try {
    const about = await AboutUs.findOne().select('termsAndCondition');
    res.json({
      success: true,
      message: 'Terms And Condition  records fetched successfully',
      data: about,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Terms And Condition  records',
      error: err.message,
    });
  }
});


router.get('/helpAndSupport', async (req, res) => {
  try {
    const about = await AboutUs.findOne().select('helpAndSupport');
    res.json({
      success: true,
      message: 'Help And Support  records fetched successfully',
      data: about,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Help And Support  records',
      error: err.message,
    });
  }
});

router.get('/privacyPolicies', async (req, res) => {
  try {
    const about = await AboutUs.findOne().select('privacyPolicies');
    res.json({
      success: true,
      message: 'Privacy Policies  records fetched successfully',
      data: about,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Privacy Policies  records',
      error: err.message,
    });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await AboutUs.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'About Us not found',
      });
    }
    res.json({
      success: true,
      message: 'About Us updated successfully',
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to update About Us',
      error: err.message,
    });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await AboutUs.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'About Us not found',
      });
    }
    res.json({
      success: true,
      message: 'About Us deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete About Us',
      error: err.message,
    });
  }
});

module.exports = router;
