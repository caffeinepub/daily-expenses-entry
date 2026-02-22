import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Migration "migration";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  let people = Map.empty<Text, Person>();
  let expenses = Map.empty<Nat, Expense>();
  var nextExpenseId = 0;

  type Person = {
    id : Text;
    name : Text;
    createdAt : Int;
  };

  type Category = {
    #food;
    #transport;
    #bills;
    #entertainment;
    #other;
  };

  type Expense = {
    id : Nat;
    personId : Text;
    amount : Nat;
    description : Text;
    date : Int;
    category : Category;
  };

  module Person {
    public func compareByName(a : Person, b : Person) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  module Expense {
    public func compareByDate(a : Expense, b : Expense) : Order.Order {
      Int.compare(b.date, a.date);
    };
  };

  // Person Management
  public shared ({ caller }) func createPerson(name : Text) : async Person {
    let id = name.toLower().trim(#char ' ');
    let person = {
      id;
      name;
      createdAt = Time.now();
    };
    people.add(id, person);
    person;
  };

  public query ({ caller }) func listPeople() : async [Person] {
    let peopleArray = people.toArray().map(
      func((_, person)) { person }
    );
    peopleArray.sort(Person.compareByName);
  };

  public shared ({ caller }) func updatePerson(id : Text, name : Text) : async () {
    switch (people.get(id)) {
      case (null) { Runtime.trap("Person not found") };
      case (?person) {
        let updatedPerson = {
          id;
          name;
          createdAt = person.createdAt;
        };
        people.add(id, updatedPerson);
      };
    };
  };

  public shared ({ caller }) func deletePerson(id : Text) : async Bool {
    switch (people.get(id)) {
      case (null) { false };
      case (?_) {
        people.remove(id);
        true;
      };
    };
  };

  // Expense Management (Unchanged)
  public shared ({ caller }) func createExpense(personId : Text, amount : Nat, description : Text, date : Int, category : Category) : async Nat {
    let expense = {
      id = nextExpenseId;
      personId;
      amount;
      description;
      date;
      category;
    };
    expenses.add(nextExpenseId, expense);
    nextExpenseId += 1;
    expense.id;
  };

  // Person Expenses Query
  public query ({ caller }) func getPersonExpenses(personId : Text, year : ?Nat, month : ?Nat) : async [Expense] {
    let allExpenses = expenses.values().toArray();
    let filtered = List.empty<Expense>();

    for (expense in allExpenses.values()) {
      if (expense.personId == personId and matchesDate(expense.date, year, month)) {
        filtered.add(expense);
      };
    };

    filtered.toArray().sort(Expense.compareByDate);
  };

  func matchesDate(date : Int, year : ?Nat, month : ?Nat) : Bool {
    switch (year, month) {
      case (null, null) {
        true;
      };
      case (?year, null) {
        let start = getYearStartTimestamp(year);
        let end = getYearEndTimestamp(year);
        date >= start and date <= end;
      };
      case (?year, ?month) {
        let start = getMonthStartTimestamp(year, month);
        let end = getMonthEndTimestamp(year, month);
        date >= start and date <= end;
      };
      case (null, ?_) {
        false;
      };
    };
  };

  func getMonthStartTimestamp(year : Nat, month : Nat) : Int {
    ((year * 12 + (month - 1)) * 30 * 24 * 60 * 60 * 1000).toInt();
  };

  func getMonthEndTimestamp(year : Nat, month : Nat) : Int {
    getMonthStartTimestamp(year, month) + (30 * 24 * 60 * 60 * 1000) - 1;
  };

  func getYearStartTimestamp(year : Nat) : Int {
    (year * 365 * 24 * 60 * 60 * 1000).toInt();
  };

  func getYearEndTimestamp(year : Nat) : Int {
    getYearStartTimestamp(year) + (365 * 24 * 60 * 60 * 1000) - 1;
  };
};
