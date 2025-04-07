export enum ActionTypeEnum {
    STILL = 'still',
    MOVE = 'move',
    REPRODUCE = 'reproduce',
    EAT = 'eat'
}

export type ActionType = typeof ActionTypeEnum[keyof typeof ActionTypeEnum];

export const ActionTypes = Object.values(ActionTypeEnum);
