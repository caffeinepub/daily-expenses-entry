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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { usePersonExpenses, useListPeople } from '../hooks/useQueries';

interface PersonDetailViewProps {
  personId: string;
  onBack: () => void;
}

const categoryColors = {
  food: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  transport: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  bills: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  entertainment: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  other: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

const categoryLabels = {
  food: 'Food',
  transport: 'Transport',
  bills: 'Bills',
  entertainment: 'Entertainment',
  other: 'Other',
};

export function PersonDetailView({ personId, onBack }: PersonDetailViewProps) {
  const { data: expenses, isLoading: expensesLoading } = usePersonExpenses(personId);
  const { data: people, isLoading: peopleLoading } = useListPeople();

  const person = people?.find((p) => p.id === personId);

  const summary = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { total: BigInt(0), dailyAverage: BigInt(0), uniqueDays: 0 };
    }

    const total = expenses.reduce((sum, expense) => sum + expense.amount, BigInt(0));
    
    const uniqueDates = new Set(
      expenses.map((expense) => {
        const date = new Date(Number(expense.date));
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );
    
    const uniqueDays = uniqueDates.size;
    const dailyAverage = uniqueDays > 0 ? total / BigInt(uniqueDays) : BigInt(0);

    return { total, dailyAverage, uniqueDays };
  }, [expenses]);

  if (expensesLoading || peopleLoading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!person) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Person not found</p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <p className="text-muted-foreground">Expense history and summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{summary.total.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{summary.dailyAverage.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            All expenses for {person.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No expenses recorded yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id.toString()}>
                      <TableCell className="font-medium">
                        {format(new Date(Number(expense.date)), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={categoryColors[expense.category]}>
                          {categoryLabels[expense.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-lg">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
