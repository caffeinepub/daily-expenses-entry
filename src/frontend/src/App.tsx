import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from './components/Layout';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { SummaryView } from './components/SummaryView';
import { PeopleManagement } from './components/PeopleManagement';
import { PersonDetailView } from './components/PersonDetailView';
import { useState } from 'react';

type View = 'main' | 'personDetail';

function App() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('expenses');

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
    setCurrentView('personDetail');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedPersonId(null);
  };

  return (
    <Layout>
      {currentView === 'personDetail' && selectedPersonId ? (
        <PersonDetailView
          personId={selectedPersonId}
          onBack={handleBackToMain}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-8">
            <ExpenseForm />
            <ExpenseList onPersonClick={handlePersonClick} />
          </TabsContent>

          <TabsContent value="people">
            <PeopleManagement />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryView onPersonClick={handlePersonClick} />
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
}

export default App;
