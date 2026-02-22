import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Users } from 'lucide-react';
import { useGetAllExpenses, useListPeople } from '../hooks/useQueries';

interface PersonBreakdownProps {
  year: number;
  month?: number;
  onPersonClick?: (personId: string) => void;
}

interface PersonSummary {
  personId: string;
  personName: string;
  totalExpenses: bigint;
  dailyAverage: bigint;
  expenseCount: number;
}

export function PersonBreakdown({ year, month, onPersonClick }: PersonBreakdownProps) {
  const { data: expenses, isLoading: expensesLoading } = useGetAllExpenses();
  const { data: people, isLoading: peopleLoading } = useListPeople();

  const personSummaries = useMemo(() => {
    if (!expenses || !people) return [];

    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    const endDate = month
      ? new Date(year, month, 0, 23, 59, 59, 999)
      : new Date(year, 11, 31, 23, 59, 59, 999);

    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(Number(expense.date));
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const personMap = new Map<string, PersonSummary>();

    filteredExpenses.forEach((expense) => {
      const person = people.find((p) => p.id === expense.personId);
      const personName = person?.name || expense.personId;
      
      const existing = personMap.get(expense.personId);
      if (existing) {
        existing.totalExpenses += expense.amount;
        existing.expenseCount += 1;
      } else {
        personMap.set(expense.personId, {
          personId: expense.personId,
          personName,
          totalExpenses: expense.amount,
          dailyAverage: BigInt(0),
          expenseCount: 1,
        });
      }
    });

    const daysInPeriod = month ? 30 : 365;

    const summaries = Array.from(personMap.values()).map((summary) => ({
      ...summary,
      dailyAverage: summary.totalExpenses / BigInt(daysInPeriod),
    }));

    return summaries.sort((a, b) => Number(b.totalExpenses - a.totalExpenses));
  }, [expenses, people, year, month]);

  if (expensesLoading || peopleLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (personSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Per-Person Breakdown
          </CardTitle>
          <CardDescription>
            {month
              ? `Expenses by person for ${new Date(year, month - 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}`
              : `Expenses by person for ${year}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses for this period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Per-Person Breakdown
        </CardTitle>
        <CardDescription>
          {month
            ? `Expenses by person for ${new Date(year, month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}`
            : `Expenses by person for ${year}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead className="text-right">Total Expenses</TableHead>
                <TableHead className="text-right">Daily Average</TableHead>
                <TableHead className="text-right">Entries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personSummaries.map((summary) => (
                <TableRow key={summary.personId}>
                  <TableCell className="font-medium">
                    {onPersonClick ? (
                      <button
                        onClick={() => onPersonClick(summary.personId)}
                        className="text-primary hover:underline"
                      >
                        {summary.personName}
                      </button>
                    ) : (
                      <span>{summary.personName}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-lg">
                    ₹{summary.totalExpenses.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{summary.dailyAverage.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {summary.expenseCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
