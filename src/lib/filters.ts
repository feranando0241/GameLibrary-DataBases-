/** Library filter state. When the database lands, this maps to the query params. */
export interface FilterBarState {
  search: string;
  genre: string;
  year: string;
  platform: string;
  status: string;
  sort: string;
}

export const DEFAULT_FILTERS: FilterBarState = {
  search: '',
  genre: '',
  year: '',
  platform: '',
  status: '',
  sort: 'SCORE_DESC',
};
