export interface Budget {
    id: string;
    periodName: string;
    initialBalance?: number;
    incomes: PosteBudgetaire[];
}

export interface PosteBudgetaire {
    uuid: string;
    source: string;
    amount?: number;
    note?: string;
}