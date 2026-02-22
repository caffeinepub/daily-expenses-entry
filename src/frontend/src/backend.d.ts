import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Expense {
    id: bigint;
    date: bigint;
    description: string;
    personId: string;
    category: Category;
    amount: bigint;
}
export interface Person {
    id: string;
    name: string;
    createdAt: bigint;
}
export enum Category {
    other = "other",
    entertainment = "entertainment",
    food = "food",
    transport = "transport",
    bills = "bills"
}
export interface backendInterface {
    createExpense(personId: string, amount: bigint, description: string, date: bigint, category: Category): Promise<bigint>;
    createPerson(name: string): Promise<Person>;
    deletePerson(id: string): Promise<boolean>;
    getPersonExpenses(personId: string, year: bigint | null, month: bigint | null): Promise<Array<Expense>>;
    listPeople(): Promise<Array<Person>>;
    updatePerson(id: string, name: string): Promise<void>;
}
