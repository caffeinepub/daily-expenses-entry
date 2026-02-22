import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Category } from '../backend';
import { useCreateExpense, useListPeople, useCreatePerson } from '../hooks/useQueries';
import { useState } from 'react';
import { toast } from 'sonner';

interface FormData {
  personId: string;
  amount: string;
  description: string;
  category: Category;
}

export function ExpenseForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>();
  const createExpense = useCreateExpense();
  const { data: people } = useListPeople();
  const createPerson = useCreatePerson();

  const selectedCategory = watch('category');
  const selectedPersonId = watch('personId');

  const handleAddNewPerson = async () => {
    const trimmedName = newPersonName.trim();
    
    if (!trimmedName) {
      toast.error('Person name cannot be empty');
      return;
    }

    try {
      const newPerson = await createPerson.mutateAsync(trimmedName);
      toast.success('Person added successfully!');
      setValue('personId', newPerson.id);
      setNewPersonName('');
      setShowAddPerson(false);
    } catch (error) {
      toast.error('Failed to add person');
      console.error('Error adding person:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data.personId) {
      toast.error('Please select a person');
      return;
    }

    const timestamp = BigInt(date.getTime());
    const amount = BigInt(Math.round(parseFloat(data.amount)));

    try {
      await createExpense.mutateAsync({
        personId: data.personId,
        amount,
        description: data.description,
        date: timestamp,
        category: data.category,
      });
      toast.success('Expense added successfully!');
      reset();
      setDate(new Date());
    } catch (error) {
      toast.error('Failed to add expense');
      console.error('Error saving expense:', error);
    }
  };

  const isLoading = createExpense.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Expense</CardTitle>
        <CardDescription>
          Enter the details of your expense in Indian Rupees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="personId">Person *</Label>
              {showAddPerson ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter person name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    disabled={createPerson.isPending}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddNewPerson}
                      disabled={createPerson.isPending}
                      className="flex-1"
                    >
                      {createPerson.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddPerson(false);
                        setNewPersonName('');
                      }}
                      disabled={createPerson.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Select
                    value={selectedPersonId}
                    onValueChange={(value) => {
                      if (value === '__add_new__') {
                        setShowAddPerson(true);
                      } else {
                        setValue('personId', value);
                      }
                    }}
                  >
                    <SelectTrigger id="personId" className={!selectedPersonId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__add_new__" className="text-primary font-medium">
                        <div className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add new person
                        </div>
                      </SelectItem>
                      {people && people.length > 0 && (
                        <>
                          <div className="h-px bg-border my-1" />
                          {people.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {!selectedPersonId && errors.personId && (
                    <p className="text-sm text-destructive">Person is required</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`pl-8 ${errors.amount ? 'border-destructive' : ''}`}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                  })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value as Category)}
              >
                <SelectTrigger id="category" className={!selectedCategory ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.food}>Food</SelectItem>
                  <SelectItem value={Category.transport}>Transport</SelectItem>
                  <SelectItem value={Category.bills}>Bills</SelectItem>
                  <SelectItem value={Category.entertainment}>Entertainment</SelectItem>
                  <SelectItem value={Category.other}>Other</SelectItem>
                </SelectContent>
              </Select>
              {!selectedCategory && errors.category && (
                <p className="text-sm text-destructive">Category is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter expense description (optional)"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
