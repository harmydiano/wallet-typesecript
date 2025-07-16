export interface PaginationOptions {
  page?: number;
  limit?: number;
  totalCount?: number;
}

export default class Pagination {
  public page: number;
  public limit: number;
  public totalCount: number;
  public totalPages: number;
  public hasNext: boolean;
  public hasPrev: boolean;

  constructor(options: PaginationOptions = {}) {
    this.page = options.page || 1;
    this.limit = options.limit || 10;
    this.totalCount = options.totalCount || 0;
    this.totalPages = Math.ceil(this.totalCount / this.limit);
    this.hasNext = this.page < this.totalPages;
    this.hasPrev = this.page > 1;
  }

  /**
   * Get offset for database queries
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Get pagination metadata
   */
  getMeta(): any {
    return {
      page: this.page,
      limit: this.limit,
      totalCount: this.totalCount,
      totalPages: this.totalPages,
      hasNext: this.hasNext,
      hasPrev: this.hasPrev
    };
  }
} 