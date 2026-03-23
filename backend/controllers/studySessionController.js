const Topic = require("../models/Topic");
const StudySession = require("../models/StudySession");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

const saveStudySession = async (req, res, next) => {
  try {
    const { topicId, durationSeconds, startedAt } = req.body;

    if (!topicId) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    const duration = Number(durationSeconds);
    if (Number.isNaN(duration) || duration < 1) {
      return res.status(400).json({ success: false, message: "Duration must be at least 1 second" });
    }

    const topic = await Topic.findOne({ _id: topicId, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const started = startedAt ? new Date(startedAt) : new Date(Date.now() - duration * 1000);
    const ended = new Date(started.getTime() + duration * 1000);

    let proofImageUrl = "";
    let proofImagePublicId = "";

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "study-planner/sessions"
      );
      proofImageUrl = uploaded.secure_url;
      proofImagePublicId = uploaded.public_id;
    }

    const session = await StudySession.create({
      userId: req.user._id,
      subjectId: topic.subjectId,
      topicId: topic._id,
      startedAt: started,
      endedAt: ended,
      durationSeconds: duration,
      proofImageUrl,
      proofImagePublicId,
    });

    return res.status(201).json({
      success: true,
      message: "Study session saved",
      data: {
        id: session._id,
        durationSeconds: session.durationSeconds,
        proofImageUrl: session.proofImageUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudySessionProof = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Screenshot is required" });
    }

    const session = await StudySession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const uploaded = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "study-planner/sessions"
    );

    await deleteFromCloudinary(session.proofImagePublicId);

    session.proofImageUrl = uploaded.secure_url;
    session.proofImagePublicId = uploaded.public_id;
    await session.save();

    return res.json({
      success: true,
      message: "Screenshot updated",
      data: {
        id: session._id,
        proofImageUrl: session.proofImageUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const listEvidenceSessions = async (req, res, next) => {
  try {
    const { subjectId, from, to } = req.query;
    const filter = {
      userId: req.user._id,
      proofImageUrl: { $ne: "" },
    };

    if (subjectId) {
      filter.subjectId = subjectId;
    }

    if (from || to) {
      const start = from ? new Date(`${from}T00:00:00.000Z`) : null;
      const end = to ? new Date(`${to}T23:59:59.999Z`) : null;
      filter.startedAt = {};
      if (start) filter.startedAt.$gte = start;
      if (end) filter.startedAt.$lte = end;
    }

    const sessions = await StudySession.find(filter)
      .sort({ startedAt: -1 })
      .populate("subjectId", "name")
      .populate("topicId", "title")
      .lean();

    const data = sessions.map((session) => ({
      id: session._id,
      proofImageUrl: session.proofImageUrl,
      startedAt: session.startedAt,
      durationSeconds: session.durationSeconds,
      subjectId: session.subjectId?._id || session.subjectId,
      subjectName: session.subjectId?.name || "Subject",
      topicId: session.topicId?._id || session.topicId,
      topicTitle: session.topicId?.title || "Topic",
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  saveStudySession,
  updateStudySessionProof,
  listEvidenceSessions,
};