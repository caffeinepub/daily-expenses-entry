import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit2, Loader2, Save, Trash2, UserPlus, X } from 'lucide-react';
import { useListPeople, useCreatePerson, useUpdatePerson, useDeletePerson } from '../hooks/useQueries';
import { toast } from 'sonner';

export function PeopleManagement() {
  const [newPersonName, setNewPersonName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const { data: people, isLoading } = useListPeople();
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newPersonName.trim();
    
    if (!trimmedName) {
      toast.error('Person name cannot be empty');
      return;
    }

    try {
      await createPerson.mutateAsync(trimmedName);
      toast.success('Person added successfully!');
      setNewPersonName('');
    } catch (error) {
      toast.error('Failed to add person');
      console.error('Error adding person:', error);
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    const trimmedName = editingName.trim();
    
    if (!trimmedName) {
      toast.error('Person name cannot be empty');
      return;
    }

    if (!editingId) return;

    try {
      await updatePerson.mutateAsync({ id: editingId, name: trimmedName });
      toast.success('Person updated successfully!');
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      toast.error('Failed to update person');
      console.error('Error updating person:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const success = await deletePerson.mutateAsync(id);
      if (success) {
        toast.success(`${name} deleted successfully!`);
      } else {
        toast.error('Failed to delete person');
      }
    } catch (error) {
      toast.error('Failed to delete person');
      console.error('Error deleting person:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">People Management</CardTitle>
        <CardDescription>
          Add and manage people who can have expenses tracked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddPerson} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="newPerson" className="sr-only">
              Person Name
            </Label>
            <Input
              id="newPerson"
              placeholder="Enter person name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              disabled={createPerson.isPending}
            />
          </div>
          <Button type="submit" disabled={createPerson.isPending}>
            {createPerson.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Add Person
          </Button>
        </form>

        {!people || people.length === 0 ? (
          <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground">No people added yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first person using the form above.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      {editingId === person.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{person.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === person.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              disabled={updatePerson.isPending}
                              title="Save changes"
                            >
                              {updatePerson.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              disabled={updatePerson.isPending}
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(person.id, person.name)}
                              title="Edit person"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete person">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Person</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{person.name}</strong>?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(person.id, person.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
