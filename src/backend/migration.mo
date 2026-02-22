import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import List "mo:core/List";

module {
  type OldExpense = {
    id : Nat;
    person : Text;
    amount : Nat;
    description : Text;
    date : Int;
    category : {
      #food;
      #transport;
      #bills;
      #entertainment;
      #other;
    };
  };

  type OldActor = {
    expenses : Map.Map<Nat, OldExpense>;
    nextId : Nat;
  };

  type Person = {
    id : Text;
    name : Text;
    createdAt : Int;
  };

  type Expense = {
    id : Nat;
    personId : Text;
    amount : Nat;
    description : Text;
    date : Int;
    category : {
      #food;
      #transport;
      #bills;
      #entertainment;
      #other;
    };
  };

  type NewActor = {
    people : Map.Map<Text, Person>;
    expenses : Map.Map<Nat, Expense>;
    nextExpenseId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let expenses = old.expenses.map<Nat, OldExpense, Expense>(
      func(_id, oldExpense) {
        { oldExpense with personId = oldExpense.person };
      }
    );

    {
      people = Map.empty<Text, Person>();
      expenses;
      nextExpenseId = old.nextId;
    };
  };
};
