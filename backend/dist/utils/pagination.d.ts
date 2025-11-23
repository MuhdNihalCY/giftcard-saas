/**
 * Pagination utility functions
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface PaginationResult {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationResult;
}
/**
 * Parse and validate pagination parameters
 */
export declare function parsePagination(query: PaginationParams): {
    page: number;
    limit: number;
    skip: number;
};
/**
 * Create pagination result
 */
export declare function createPaginationResult(page: number, limit: number, total: number): PaginationResult;
/**
 * Create paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T>;
//# sourceMappingURL=pagination.d.ts.map