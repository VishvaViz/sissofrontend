const sessionSchema = require('../models/sessionsModel');

// Get all sessions for a user
const getSessions = async (req, res) => {
    const { userId } = req.params;
    try {
        const sessions = await sessionSchema.find({ userId }).sort({ lastAccessed: -1 });
        res.status(200).json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching sessions', err });
    }
};

// Delete a session
const deleteSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        await sessionSchema.findByIdAndDelete(sessionId);
        res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting session', err });
    }
};

module.exports = { getSessions, deleteSession };
