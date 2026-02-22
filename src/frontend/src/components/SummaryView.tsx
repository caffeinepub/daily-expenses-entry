import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useGetAllExpenses } from '../hooks/useQueries';
import { PersonBreakdown } from './PersonBreakdown';

export function SummaryView({ onPersonClick }: { onPersonClick?: (personId: string) => void }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: allExpenses, isLoading } = useGetAllExpenses();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const monthlySummary = useMemo(() => {
    if (!allExpenses) return null;

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    const filtered = allExpenses.filter((expense) => {
      const expenseDate = new Date(Number(expense.date));
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const totalExpenses = filtered.reduce((sum, expense) => sum + expense.amount, BigInt(0));
    const daysInMonth = 30;
    const dailyAverage = totalExpenses / BigInt(daysInMonth);

    return { totalExpenses, dailyAverage };
  }, [allExpenses, selectedYear, selectedMonth]);

  const yearlySummary = useMemo(() => {
    if (!allExpenses) return null;

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    const filtered = allExpenses.filter((expense) => {
      const expenseDate = new Date(Number(expense.date));
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const totalExpenses = filtered.reduce((sum, expense) => sum + expense.amount, BigInt(0));
    const daysInYear = 365;
    const dailyAverage = totalExpenses / BigInt(daysInYear);

    return { totalExpenses, dailyAverage };
  }, [allExpenses, selectedYear]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Summary</CardTitle>
              <CardDescription>View your expenses for a specific month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month-year">Year</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger id="month-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger id="month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : monthlySummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        ₹{monthlySummary.totalExpenses.toLocaleString('en-IN')}
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
                      <div className="text-3xl font-bold">
                        ₹{monthlySummary.dailyAverage.toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          <PersonBreakdown year={selectedYear} month={selectedMonth} onPersonClick={onPersonClick} />
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Expense Summary</CardTitle>
              <CardDescription>View your expenses for an entire year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-xs">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : yearlySummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        ₹{yearlySummary.totalExpenses.toLocaleString('en-IN')}
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
                      <div className="text-3xl font-bold">
                        ₹{yearlySummary.dailyAverage.toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          <PersonBreakdown year={selectedYear} onPersonClick={onPersonClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
