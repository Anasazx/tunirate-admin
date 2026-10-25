// Spring Data page as returned by the backend
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const emptyPage = <T>(): Page<T> => ({
  content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true
});
