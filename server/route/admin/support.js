const express = require("express");
const router = express.Router();
const SupportTicket = require("../../model/customer/supportTicket");

// GET /admin/tickets
router.get("/admin/tickets", async (req, resp) => {
    try {
        const { status, category, priority } = req.query;
        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const tickets = await SupportTicket.find(query)
            .populate("userId", "name email mobileNumber")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

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

// PUT /admin/assign-ticket
router.put("/admin/assign-ticket", async (req, resp) => {
    try {
        const { ticketId, adminId } = req.body;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }

        ticket.assignedTo = adminId;
        await ticket.save();

        resp.json({
            success: true,
            msg: "Ticket assigned successfully",
            data: ticket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// PUT /admin/update-status
router.put("/admin/update-status", async (req, resp) => {
    try {
        const { ticketId, status } = req.body;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }

        ticket.status = status;

        if (status === "CLOSED") {
            ticket.isClosed = true;
            ticket.closedAt = Date.now();
        } else {
            ticket.isClosed = false;
        }

        await ticket.save();

        resp.json({
            success: true,
            msg: "Ticket status updated successfully",
            data: ticket
        });
    } catch (err) {
        resp.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

// POST /admin/reply
router.post("/admin/reply", async (req, resp) => {
    try {
        const { ticketId, message, attachments } = req.body;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return resp.status(404).json({ success: false, msg: "Ticket not found" });
        }

        if (ticket.isClosed || ticket.status === "CLOSED") {
            return resp.status(400).json({ success: false, msg: "Cannot reply to a closed ticket" });
        }

        ticket.responses.push({
            sender: "ADMIN",
            message,
            attachments: (attachments || []).map(a => typeof a === 'string' ? { url: a } : a)
        });

        ticket.lastResponseAt = Date.now();
        // optionally transition status if needed, e.g., to IN_PROGRESS or RESOLVED

        await ticket.save();

        resp.json({
            success: true,
            msg: "Admin reply added successfully",
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
