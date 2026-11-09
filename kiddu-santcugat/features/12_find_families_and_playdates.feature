@pilot
Feature: Find families from my class and propose playdates
  As a parent in a class group
  I want to see which families from my class are on Kiddu and propose playdates
  So that our kids can play together without searching through chat history

  Background:
    Given the AFA created the group "P4 - Class A" with an invite link

  Scenario: Families in my class
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    And another parent joined "P4 - Class A" as "Lia" without sharing ages
    When I open the group page
    Then I see "Ana", "Marc" and "Lia" in the list of families
    And each family shows only a first name and the ages they chose to share
    And no last name, phone number or email is shown

  Scenario: Find families with a child of a similar age
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    And another parent joined "P4 - Class A" as "Lia" without sharing ages
    When I filter families by child age 4
    Then I see "Ana" and "Marc" in the list of families
    And I do not see "Lia" in the list of families

  Scenario: Only members see the families
    Given another parent joined "P4 - Class A" as "Marc" with a child aged 5
    When someone who has not joined opens the group page address
    Then they do not see any family names
    And they are told to ask the class rep for the invite link

  Scenario: Propose a playdate to the class
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    When I tap "Propose a playdate"
    And I choose the place "Central test park", Saturday 11:00 and write "Bring scooters"
    Then the playdate appears under "Upcoming playdates" on the group page
    And it shows "1 family going"

  Scenario: Another family joins the playdate
    Given another parent joined "P4 - Class A" as "Ana" with a child aged 4
    And Ana proposed a playdate in the group for Saturday 11:00
    And I joined "P4 - Class A" as "Marc" with a child aged 5
    When I open the playdate from the group page and choose "I'm in"
    Then the playdate shows "2 families going"
    And my name "Marc" is already filled in

  Scenario: Leave and be forgotten
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    When I tap "Leave group"
    Then the group page no longer shows "Ana" to the other families
    And I am no longer a member of the group
