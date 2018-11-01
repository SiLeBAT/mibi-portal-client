export interface ActionItemConfiguration {
    label: string;
    onClick: Function;
    type: ActionItemType;
    component: any;
    icon: string;
}

export enum ActionItemType {
    VALIDATE, UPLOAD, EXPORT, SEND
}

export interface ActionItemComponent {
    configuration: ActionItemConfiguration;
}
