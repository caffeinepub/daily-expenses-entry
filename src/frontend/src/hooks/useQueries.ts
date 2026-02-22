import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, type Expense, type Person } from '../backend';

// People queries
export function useListPeople() {
  const { actor, isFetching } = useActor();

  return useQuery<Person[]>({
    queryKey: ['people'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPeople();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createPerson(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useUpdatePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updatePerson(data.id, data.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['personExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
    },
  });
}

export function useDeletePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deletePerson(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['personExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
    },
  });
}

// Expense queries
export function usePersonExpenses(personId: string, year?: number, month?: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Expense[]>({
    queryKey: ['personExpenses', personId, year, month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPersonExpenses(
        personId,
        year ? BigInt(year) : null,
        month ? BigInt(month) : null
      );
    },
    enabled: !!actor && !isFetching && !!personId,
  });
}

// Get all expenses by fetching from all people
export function useGetAllExpenses() {
  const { actor, isFetching } = useActor();
  const { data: people } = useListPeople();

  return useQuery<Expense[]>({
    queryKey: ['allExpenses', people?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!actor || !people || people.length === 0) return [];
      
      const allExpenses: Expense[] = [];
      for (const person of people) {
        const expenses = await actor.getPersonExpenses(person.id, null, null);
        allExpenses.push(...expenses);
      }
      
      return allExpenses.sort((a, b) => Number(b.date - a.date));
    },
    enabled: !!actor && !isFetching && !!people && people.length > 0,
  });
}

export function useCreateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      personId: string;
      amount: bigint;
      description: string;
      date: bigint;
      category: Category;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createExpense(
        data.personId,
        data.amount,
        data.description,
        data.date,
        data.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
    },
  });
}
