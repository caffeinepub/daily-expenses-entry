# Specification

## Summary
**Goal:** Add a comprehensive people management system with person selector in expense forms and individual expense tracking per person.

**Planned changes:**
- Create backend data model and CRUD operations for managing people (name, id, timestamps)
- Build a People Management interface with add, edit, and delete functionality
- Replace free-text person input with searchable dropdown selector in expense form
- Add quick-add option to create new people directly from expense form dropdown
- Create individual person detail pages showing complete expense history and statistics
- Add People tab to main navigation
- Make person names clickable throughout the app to view individual expense details
- Implement React Query hooks for all people-related operations

**User-visible outcome:** Users can manage a list of people, select from that list when entering expenses (with quick-add option), navigate to dedicated pages showing each person's complete expense history with total spending and daily averages, and access the people management system through a new People tab in the main navigation.
