const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Category = require("../models/Category");
const auth = require("../middleware/auth");

// Get all items for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    console.log("Getting items for user:", req.user.id);
    const items = await Item.find({ userId: req.user.id })
      .populate("categoryId", "name color")
      .sort({ name: 1 });
    console.log(`Found ${items.length} items`);

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get single item by id
router.get("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("categoryId", "name color");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
    res.json({
      success: true,
      item: item,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// POST - Create new item
router.post("/", auth, async (req, res) => {
  try {
    console.log("Creating item for user:", req.user.id);
    const { name, description, categoryId, quantity, price } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Verify category exists and belongs to user
    const categoryExists = await Category.findOne({
      _id: categoryId,
      userId: req.user.id,
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    const existingItem = await Item.findOne({
      name: name.trim(),
      userId: req.user.id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item with this name already exists",
      });
    }

    const itemData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      categoryId: categoryId,
      quantity: quantity || 0,
      price: price || 0,
      userId: req.user.id,
    };

    console.log("Item data to be saved:", itemData);
    const newItem = new Item(itemData);
    await newItem.save();

    // Populate category info
    await newItem.populate("categoryId", "name color");

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Item with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// PUT - Update item
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("Updating item for user:", req.user.id);
    const { name, description, categoryId, quantity, price } = req.body;

    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.trim() !== item.name) {
      const existingItem = await Item.findOne({
        name: name.trim(),
        userId: req.user.id,
        _id: { $ne: req.params.id },
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Item with this name already exists",
        });
      }
    }

    // Verify category if being updated
    if (categoryId !== undefined) {
      const categoryExists = await Category.findOne({
        _id: categoryId,
        userId: req.user.id,
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Update fields
    if (name !== undefined) item.name = name.trim();
    if (description !== undefined) item.description = description.trim();
    if (categoryId !== undefined) item.categoryId = categoryId;

    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
      }
      item.quantity = quantity;
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }
      item.price = price;
    }

    await item.save();

    // Populate category info before sending response
    await item.populate("categoryId", "name color");

    console.log("Item updated:", item);
    res.json({
      success: true,
      message: "Item updated successfully",
      item: item,
    });
  } catch (error) {
    console.error("Error updating item:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error while updating item",
      error: error.message,
    });
  }
});

// DELETE - Delete item by id
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Deleting item:", req.params.id);

    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    console.log("Item successfully deleted");
    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while deleting item",
      error: error.message,
    });
  }
});

module.exports = router;
