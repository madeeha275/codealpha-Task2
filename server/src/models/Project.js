// server/src/models/Project.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const columnSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
});

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
});

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#ffffff' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    columns: [columnSchema],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Project', projectSchema);