
export interface Institution {
    name: string;
    city: string;
    zip: string;
    id: string;
    stateShort: string;
    addendum: string;
    getFullName(): string;
    toString(): string;
}

export interface InstitutionDTO {
    id: string;
    email: string[];
    short: string;
    name: string;
    addendum: string;
    phone: string;
    fax: string;
    city: string;
    zip: string;
}

export class DefaultInstitution implements Institution {
    id: string;
    stateShort: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];

    constructor(entry: InstitutionDTO) {
        this.id = entry.id;
        this.stateShort = entry.short || '';
        this.name = entry.name;
        this.addendum = entry.addendum;
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
        completeName = completeName + ', ' + this.zip + ' ' + this.city;

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
