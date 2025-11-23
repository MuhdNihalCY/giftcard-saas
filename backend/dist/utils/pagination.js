"use strict";
/**
 * Pagination utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.createPaginationResult = createPaginationResult;
exports.createPaginatedResponse = createPaginatedResponse;
/**
 * Parse and validate pagination parameters
 */
function parsePagination(query) {
    const page = Math.max(1, parseInt(String(query.page || 1), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 20), 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
/**
 * Create pagination result
 */
function createPaginationResult(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
/**
 * Create paginated response
 */
function createPaginatedResponse(data, page, limit, total) {
    return {
        data,
        pagination: createPaginationResult(page, limit, total),
    };
}
//# sourceMappingURL=pagination.js.map