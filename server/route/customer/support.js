const express = require("express");
const router = express.Router();
const SupportTicket = require("../../model/customer/supportTicket");
const accountMiddleware = require("../../middleware/account");

// POST /support/create-ticket
router.post("/support/create-ticket", accountMiddleware, async (req, resp) => {
    try {
        const { category, subject, description, priority, attachments } = req.body;

        const currentYear = new Date().getFullYear();
        const latestTicket = await SupportTicket.findOne({
            ticketId: { $regex: `^SUP-${currentYear}-` }
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (latestTicket && latestTicket.ticketId) {
            const parts = latestTicket.ticketId.split("-");
            if (parts.length === 3) {
                sequence = parseInt(parts[2]) + 1;
            }
        }
        const ticketId = `SUP-${currentYear}-${sequence.toString().padStart(4, "0")}`;

        const newTicket = new SupportTicket({
            userId: req.accountId,
            ticketId,
            category,
            subject,
            description,
            priority: priority || "LOW",
            attachments: (attachments || []).map(a => typeof a === 'string' ? { url: a } : a)
        });

        await newTicket.save();

        resp.status(201).json({
            success: true,
            msg: "Support ticket created successfully",
            data: newTicket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// GET /support/my-tickets
router.get("/support/my-tickets", accountMiddleware, async (req, resp) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.accountId }).sort({ createdAt: -1 });
        resp.json({
            success: true,
            msg: "Tickets fetched successfully",
            data: tickets
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// GET /support/ticket/:id
router.get("/support/ticket/:id", accountMiddleware, async (req, resp) => {
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.accountId });
        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }
        resp.json({
            success: true,
            msg: "Ticket details fetched successfully",
            data: ticket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// POST /support/reply/:id
router.post("/support/reply/:id", accountMiddleware, async (req, resp) => {
    try {
        const { message, attachments } = req.body;
        const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.accountId });

        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }

        if (ticket.isClosed || ticket.status === "CLOSED") {
            return resp.status(400).json({ success: false, msg: "Cannot reply to a closed ticket" });
        }

        ticket.responses.push({
            sender: "USER",
            message,
            attachments: (attachments || []).map(a => typeof a === 'string' ? { url: a } : a)
        });
        ticket.lastResponseAt = Date.now();
        // Update status to OPEN if it was RESOLVED, as user replied
        if (ticket.status === "RESOLVED") {
            ticket.status = "OPEN";
        }

        await ticket.save();

        resp.json({
            success: true,
            msg: "Reply added successfully",
            data: ticket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// PUT /support/close/:id
router.put("/support/close/:id", accountMiddleware, async (req, resp) => {
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.accountId });

        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }

        ticket.status = "CLOSED";
        ticket.isClosed = true;
        ticket.closedAt = Date.now();

        await ticket.save();

        resp.json({
            success: true,
            msg: "Ticket closed successfully",
            data: ticket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = router;
