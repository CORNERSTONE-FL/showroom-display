import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // One row per file served by the site (each photo size is its own file).
    media: defineTable({
        key: v.string(), // e.g. "gallery/showroom-floor-1280.webp"
        storageId: v.id("_storage"),
        sha256: v.string(),
        contentType: v.string(),
        size: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
    }).index("by_key", ["key"]),
    // Files replaced or removed by a sync, kept until `purgeRetired` deletes them.
    retired: defineTable({
        key: v.string(),
        storageId: v.id("_storage"),
        retiredAt: v.number(),
    }).index("by_retiredAt", ["retiredAt"]),
});
