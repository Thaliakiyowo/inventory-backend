const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Category = require("../models/Category");
const Item = require("../models/Item");

// @route   GET api/bootstrap
// @desc    Get all user data in one request (user, categories, items, stats)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Get categories with item count
    const categories = await Category.aggregate([
      { $match: { userId: req.user.id } },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "categoryId",
          as: "items",
        },
      },
      {
        $addFields: {
          itemCount: { $size: "$items" },
        },
      },
      {
        $project: {
          items: 0, // Don't include full items array, just the count
        },
      },
    ]);

    // Get all items with populated category
    const items = await Item.find({ userId: req.user.id })
      .populate("categoryId", "name color")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalCategories: categories.length,
      totalItems: items.length,
      totalValue: items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      ),
      activeCategories: categories.filter((cat) => cat.itemCount > 0).length,
    };

    // Return everything in one response
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
        },
        categories,
        items,
        stats,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
