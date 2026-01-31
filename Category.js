const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name must be less than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be less than 500 characters"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    color: {
      type: String,
      default: "#FFFFFF",
      match: [/^#([0-9A-F]{3}){1,2}$/i, "Invalid color format"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

CategorySchema.virtual("itemCount", {
  ref: "Item",
  localField: "_id",
  foreignField: "categoryId",
  count: true,
});

CategorySchema.pre("remove", async function (next) {
  const Item = mongoose.model("Item");
  const ItemCount = await Item.countDocuments({ categoryId: this._id });

  if (itemCount > 0) {
    const error = new Error(
      `Cannot delete category. it contains ${itemCount} items.`
    );
    return next(error);
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
