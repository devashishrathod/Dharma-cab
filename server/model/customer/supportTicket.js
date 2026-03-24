const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "passenger",
        required: true,
    },
    ticketId: { type: String, unique: true, },
    category: {
        type: String,
        enum: [
            "PAYMENT",
            "ORDER",
            "TECHNICAL",
            "ACCOUNT",
            "REFUND",
            "OTHER"
        ],
        required: true,
    },
    subject: { type: String, required: true, },
    description: { type: String, required: true, },
    attachments: [{ url: String, type: String, },],
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        default: "LOW",
    },
    status: {
        type: String,
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
        default: "OPEN",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "admin", },
    responses: [
        {
            sender: {
                type: String, // USER / ADMIN
                enum: ["USER", "ADMIN"],
            },
            message: String,
            attachments: [{ url: String, },],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastResponseAt: Date,
    isClosed: {
        type: Boolean, default: false,
    },
    closedAt: Date,
}, { timestamps: true, versionKey: false });

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ ticketId: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);