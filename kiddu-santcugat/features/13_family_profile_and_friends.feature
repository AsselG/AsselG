@pilot
Feature: Family profile and connected friends
  As a parent
  I want a family profile and a list of families I chose to connect with
  So that I can invite them to things and see what they invite me to

  Background:
    Given the AFA created the group "P4 - Class A" with an invite link

  Scenario: Create my family profile
    When I create my family profile as "Ana" with a child aged 4 interested in "Sport" and "Nature" and speaking "Català" and "English"
    Then my profile shows "Ana", "Child aged 4", "Sport, Nature" and "Català, English"
    And the profile form has no field for a last name, photo, phone, email or address

  Scenario: Joining a class uses my profile
    Given I have a family profile as "Ana" with a child aged 4
    When I open the class invite link
    Then I can join the class with one tap as "Ana"
    And the class page shows "Ana" with "Child aged 4"

  Scenario: Connect with a friend through a personal link
    Given I have a family profile as "Ana" with a child aged 4
    And another parent has a family profile as "Marc" with a child aged 5
    When Marc shares his personal link and I open it and connect
    Then "Marc" is in my list of connected families
    And "Ana" is in the list of connected families of Marc

  Scenario: Connect with a family from my class
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    When I ask to connect with "Marc" from the class page
    Then Marc sees a connection request from "Ana"
    And "Marc" is not in my list of connected families
    When Marc accepts the request from "Ana"
    Then "Marc" is in my list of connected families

  Scenario: Declining a request shares nothing
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    When I ask to connect with "Marc" from the class page
    And Marc declines the request from "Ana"
    Then "Marc" is not in my list of connected families
    And "Ana" is not in the list of connected families of Marc

  Scenario: I never see friends of my friends
    Given I have a family profile as "Ana" with a child aged 4
    And another parent has a family profile as "Marc" with a child aged 5
    And another parent has a family profile as "Lia" with a child aged 6
    And I am connected with "Marc"
    And "Marc" is connected with "Lia"
    When I open my family page
    Then "Marc" is in my list of connected families
    And "Lia" is not in my list of connected families

  Scenario: Remove a connection
    Given I have a family profile as "Ana" with a child aged 4
    And another parent has a family profile as "Marc" with a child aged 5
    And I am connected with "Marc"
    When I remove the connection with "Marc"
    Then "Marc" is not in my list of connected families
    And "Ana" is not in the list of connected families of Marc

  Scenario: Use my profile on another phone
    Given I have a family profile as "Ana" with a child aged 4
    When I open my recovery link on another phone
    Then the other phone shows my family profile "Ana"

  Scenario: Delete my family
    Given I joined "P4 - Class A" as "Ana" with a child aged 4
    And another parent joined "P4 - Class A" as "Marc" with a child aged 5
    And I am connected with "Marc"
    When I delete my family
    Then the group page no longer shows "Ana" to the other families
    And "Ana" is not in the list of connected families of Marc
    And I no longer have a family profile
