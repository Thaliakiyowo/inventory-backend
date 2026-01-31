const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Item = require("../models/Item");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    console.log("Getting categories for user:", req.user.id);

    const categories = await Category.find({ userId: req.user.id }).sort({
      name: 1,
    });

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await Item.countDocuments({
          categoryId: category._id,
          userId: req.user.id,
        });
        return {
          ...category.toObject(),
          itemCount,
        };
      })
    );

    console.log(`Found ${categories.length} categories`);

    res.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const itemCount = await Item.countDocuments({
      categoryId: category._id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        itemCount,
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    console.log("Creating category for user:", req.user.id);

    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name,
      userId: req.user.id,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      userId: req.user.id,
      color: color || "#FFFFFF",
    };
    console.log("Category data to be saved:", categoryData);

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created succesfully",
      category: {
        ...category.toObject(),
        itemCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: error.message,
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    console.log("Updating category for users:", req.user.id);

    const { name, description, color, isActive } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        userId: req.user.id,
        _id: { $ne: req.params.id },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }
    // Fix: gunakan !== undefined bukan !name == undefined
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (color !== undefined) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    await category.save();

    const itemCount = await Item.countDocuments({
      categoryId: category._id,
      userId: req.user.id,
    });

    console.log("Category updated:", category);

    res.json({
      success: true,
      message: "Category updated successfully",
      category: {
        ...category.toObject(),
        itemCount,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error.name == "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      error: error.message,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Delete category:", req.params.id);

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    const itemCount = await Item.countDocuments({
      categoryId: category._id,
      userId: req.user.id,
    });

    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${itemCount} items. Please move or delete the item first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    console.log("Category successfully deleted");

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: error.message,
    });
  }
});

module.exports = router;
