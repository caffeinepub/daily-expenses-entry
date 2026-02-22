import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useGetAllExpenses, useListPeople } from '../hooks/useQueries';

interface ExpenseListProps {
  onPersonClick?: (personId: string) => void;
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

export function ExpenseList({ onPersonClick }: ExpenseListProps) {
  const { data: expenses, isLoading } = useGetAllExpenses();
  const { data: people } = useListPeople();

  const getPersonName = (personId: string) => {
    return people?.find((p) => p.id === personId)?.name || personId;
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Your expense history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses recorded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first expense using the form above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>All Expenses</CardTitle>
        <CardDescription>
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Person</TableHead>
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
                    {onPersonClick ? (
                      <button
                        onClick={() => onPersonClick(expense.personId)}
                        className="text-primary hover:underline font-medium"
                      >
                        {getPersonName(expense.personId)}
                      </button>
                    ) : (
                      <span>{getPersonName(expense.personId)}</span>
                    )}
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
      </CardContent>
    </Card>
  );
}
