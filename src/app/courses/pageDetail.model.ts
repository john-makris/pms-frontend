export class PageDetail {
    
    constructor(
        public currentPage: number,
        public totalItems: number,
        public totalPages: number,
        public currentPageItems: number
    ) {}
}