import { School } from "../schools/school.model";

export class Department {
    
    constructor(
        public id: number,
        public name: string,
        public school: School,
        public isDeleting?: boolean
    ) {}
}