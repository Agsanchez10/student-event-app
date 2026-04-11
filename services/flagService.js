/**
 * Flag Service - Handles all flag/report-related database operations
 * Functions for managing user reports and content moderation
 */

import { withDB } from "@/lib/mongodb";
import Flag from "@/models/Flag";

/**
 * Get all flags
 * @returns {Promise<Array>} All flag documents
 */
export const getFlags = withDB(async () => {
    const flags = await Flag.find({});
    return flags;
});

/**
 * Get all unresolved flags (for admin review)
 * @returns {Promise<Array>} Unresolved flag documents
 */
export const getUnresolvedFlags = withDB(async () => {
    const flags = await Flag.find({ isResolved: false }).sort({ reportedAt: -1 });
    return flags;
});

/**
 * Get a specific flag by ID
 * @param {number} flagid - The numeric flag ID
 * @returns {Promise<Object>} Flag document
 * @throws {Error} If flag not found
 */
export const getFlag = withDB(async (flagid) => {
    const flag = await Flag.findOne({ _id: Number(flagid) });
    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});

/**
 * Create a new flag/report
 * @param {Object} body - Flag data (type, posterId, ownderId, notes, etc.)
 * @returns {Promise<Object>} Newly created flag document
 */
export const createFlag = withDB(async (body) => {
    const lastID = await Flag.findOne().sort({ _id: -1 });
    const newId = lastID ? lastID._id + 1 : 1;

    const flag = await Flag.create({ ...body, _id: newId });
    return flag;
});

/**
 * Delete a flag by ID
 * @param {number} flagid - The numeric flag ID
 * @returns {Promise<Object>} Deleted flag document
 * @throws {Error} If flag not found
 */
export const deleteFlag = withDB(async (flagid) => {
    const flag = await Flag.findByIdAndDelete(flagid);

    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});

/**
 * Update flag information (e.g., mark as resolved)
 * @param {number} flagid - The numeric flag ID
 * @param {Object} body - Fields to update (isResolved, dateResolved, etc.)
 * @returns {Promise<Object>} Updated flag document
 * @throws {Error} If flag not found
 */
export const updateFlag = withDB(async (flagid, body) => {
    const flag = await Flag.findByIdAndUpdate(flagid, body, { new: true });
    if (!flag) {
        throw new Error("404: Flag not found");
    }
    return flag;
});