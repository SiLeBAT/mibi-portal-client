
export interface Institution {
    name: string;
    city: string;
    zip: string;
    _id: string;
    stateShort: string;
    addendum: string;
    getFullName(): string;
}

export interface InstitutionDTO {
    _id: string;
    email: string[];
    state_short: string;
    name1: string;
    name2: string;
    location: string;
    phone: string;
    fax: string;
    city: string;
    zip: string;
}

export class DefaultInstitution implements Institution {
    _id: string;
    stateShort: string;
    name: string;
    addendum: string;
    location: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];

    constructor(entry: InstitutionDTO) {
        this._id = entry._id;
        this.stateShort = entry.state_short || '';
        this.name = entry.name1;
        this.addendum = entry.name2;
        this.location = entry.location;
        this.city = entry.city;
        this.zip = entry.zip;
        this.phone = entry.phone;
        this.fax = entry.fax;
        this.email = entry.email;
    }

    toString = (): string => {
        let completeName = this.name;
        if (this.addendum) {
            completeName = completeName + ', ' + this.addendum;
        }
        completeName = completeName + ', ' + this.location;

        return completeName;
    }

    getFullName(): string {
        let fullName = this.name;
        if (this.addendum) {
            fullName = fullName + ', ' + this.addendum;
        }
        return fullName;
    }

}
export function fromDTOToInstitution(entry: InstitutionDTO): Institution {
    return new DefaultInstitution(entry);
}
