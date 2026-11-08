@pilot
Feature: AFA pilot - class group page
  As an AFA volunteer
  I want a private page for each class
  So that families of the same class see each other's plans and the activities other kids go to

  Scenario: Join a class group with an invite link
    Given the AFA created the group "P4 - Class A" with an invite link
    When a parent opens the invite link
    Then they can join the group with a first name only

  Scenario: Class group page
    Given I joined "P4 - Class A"
    When I open the group page
    Then I see upcoming plans shared to the group
    And I see "Popular in your class" items (only counts, no names)

  Scenario: Leave and delete
    When I tap "Leave group"
    Then my name is removed from the group and from all its plans
