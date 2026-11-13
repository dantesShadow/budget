export interface Budget {
    id: string;
    periodName: string;
    initialBalance?: number;
    incomes: PosteBudgetaire[];
}

export interface PosteBudgetaire {
    uuid: string;
    source: string;
    plannedAmount?: number;
    reelAmount?: number;
    note?: string;
}