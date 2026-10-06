import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Writes are limited to whoever holds MEDIA_UPLOAD_SECRET, set on the deployment with
// `npx convex env set MEDIA_UPLOAD_SECRET <value>` and in the local .env for the sync script.
function assertSecret(secret: string) {
    const expected = process.env.MEDIA_UPLOAD_SECRET;
    if (!expected || secret !== expected) {
        throw new ConvexError("Invalid media upload secret");
    }
}

export const list = query({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db.query("media").collect();
        return Promise.all(
            rows.map(async (row) => ({
                key: row.key,
                sha256: row.sha256,
                width: row.width,
                height: row.height,
                url: await ctx.storage.getUrl(row.storageId),
            })),
        );
    },
});

export const generateUploadUrl = mutation({
    args: { secret: v.string() },
    handler: async (ctx, { secret }) => {
        assertSecret(secret);
        return await ctx.storage.generateUploadUrl();
    },
});

export const save = mutation({
    args: {
        secret: v.string(),
        key: v.string(),
        storageId: v.id("_storage"),
        sha256: v.string(),
        contentType: v.string(),
        size: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
    },
    handler: async (ctx, { secret, ...file }) => {
        assertSecret(secret);
        const existing = await ctx.db
            .query("media")
            .withIndex("by_key", (q) => q.eq("key", file.key))
            .unique();
        if (existing) {
            if (existing.storageId !== file.storageId) await ctx.storage.delete(existing.storageId);
            await ctx.db.patch(existing._id, file);
        } else {
            await ctx.db.insert("media", file);
        }
        return await ctx.storage.getUrl(file.storageId);
    },
});

export const remove = mutation({
    args: { secret: v.string(), key: v.string() },
    handler: async (ctx, { secret, key }) => {
        assertSecret(secret);
        const existing = await ctx.db
            .query("media")
            .withIndex("by_key", (q) => q.eq("key", key))
            .unique();
        if (!existing) return false;
        await ctx.storage.delete(existing.storageId);
        await ctx.db.delete(existing._id);
        return true;
    },
});
