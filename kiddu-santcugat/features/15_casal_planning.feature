@pilot
Feature: Plan casals (summer camps) ahead
  As a parent
  I want to see next summer's casals, plan the weeks and see where my friends go
  So that I register in time and the kids can be together

  Scenario: Browse casals for next summer
    When I open the casals page
    Then I see the casals "Test Forest Casal", "Test Sports Casal" and "Test Art Casal"
    And each casal shows its weeks, price per week, hours and when registration opens

  Scenario: Filter casals by child age
    When I filter casals by child age 5
    Then I see the casals "Test Forest Casal" and "Test Art Casal"
    And I do not see the casal "Test Sports Casal"

  Scenario: Filter casals by week
    When I filter casals by the week "5–9 Jul"
    Then I see the casals "Test Forest Casal" and "Test Sports Casal"
    And I do not see the casal "Test Art Casal"

  Scenario: I need a family profile to plan
    When I try to add week "28 Jun–2 Jul" of "Test Forest Casal" without a family profile
    Then I am asked to create my family profile first

  Scenario: Add a casal week to my plan
    Given I have a family profile as "Ana" with a child aged 5
    When I add week "28 Jun–2 Jul" of "Test Forest Casal" to my casal plan
    Then my casal plan shows "28 Jun–2 Jul" with "Test Forest Casal" as "Interested"
    And it tells me registration opens on "15 March 2027", in the number of days from today

  Scenario: Weeks with nothing planned are visible
    Given I have a family profile as "Ana" with a child aged 5
    And I added week "28 Jun–2 Jul" of "Test Forest Casal" to my casal plan
    When I open my casal plan
    Then the week "21–25 Jun" says "Nothing planned yet"
    And the week "28 Jun–2 Jul" does not say "Nothing planned yet"

  Scenario: Mark a casal as registered
    Given I have a family profile as "Ana" with a child aged 5
    And I added week "28 Jun–2 Jul" of "Test Forest Casal" to my casal plan
    When I mark "Test Forest Casal" in week "28 Jun–2 Jul" as registered
    Then my casal plan shows "28 Jun–2 Jul" with "Test Forest Casal" as "Registered"

  Scenario: See friends going to the same week when they share
    Given I have a family profile as "Ana" with a child aged 5
    And another parent has a family profile as "Marc" with a child aged 5
    And I am connected with "Marc"
    And Marc added week "28 Jun–2 Jul" of "Test Forest Casal" and shows his casal plan to his friends
    When I open my casal plan
    Then I see "Marc" with "Test Forest Casal" in week "28 Jun–2 Jul"

  Scenario: Casal plans are private unless shared
    Given I have a family profile as "Ana" with a child aged 5
    And another parent has a family profile as "Marc" with a child aged 5
    And I am connected with "Marc"
    And Marc added week "28 Jun–2 Jul" of "Test Forest Casal" without sharing
    When I open my casal plan
    Then I do not see "Marc" in week "28 Jun–2 Jul"
