/** Slug-based filters for the public question browser. */
export interface BrowseFilters {
  subject?: string;
  topic?: string;
}

export interface BrowseQuery extends BrowseFilters {
  page: number;
  pageSize: number;
}
