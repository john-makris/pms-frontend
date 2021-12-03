import { Presence } from "../presences/presence.model";

export class ExcuseApplication {
    constructor(
        public id: number,
        public absence: Presence,
        public status: boolean
    ) {}
}