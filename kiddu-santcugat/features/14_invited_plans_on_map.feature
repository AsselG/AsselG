@pilot
Feature: Private family events I am invited to, on my map
  As a parent
  I want to see on the map the family events I am invited to
  So that I can decide quickly, while nobody else can see them

  Background:
    Given the AFA created the group "P4 - Class A" with an invite link
    And I have a family profile as "Ana" with a child aged 4
    And another parent has a family profile as "Marc" with a child aged 5
    And another parent has a family profile as "Lia" with a child aged 6
    And I am connected with "Marc"
    And "Marc" is connected with "Lia"

  Scenario: A friend's invitation appears on my map
    Given Marc invited his friends to a playdate at "Central test park" on Saturday 11:00
    When I open the home page
    Then I see an invitation pin at "Central test park" on the map
    And "Your plans and invitations" lists "Central test park" with "Invited by Marc"

  Scenario: Only the invited friends see the event
    Given Marc invited only "Ana" to a playdate at "Central test park" on Saturday 11:00
    When Lia opens the playdate link
    Then Lia is told this event is private and sees none of its details
    And Lia's map shows no invitation pin

  Scenario: Someone who is not connected cannot see a friends-only event
    Given Marc invited his friends to a playdate at "Central test park" on Saturday 11:00
    When someone who is not connected to Marc opens the playdate link
    Then they are told this event is private and see none of its details

  Scenario: Events at someone's home never get a pin
    Given Marc invited his friends to a playdate at his place "Marc's place" with address "Carrer de Prova 5, 2n" on Saturday 11:00
    When I open the home page
    Then "Your plans and invitations" lists "Marc's place" with "Invited by Marc"
    And the map has no invitation pin for "Marc's place"
    And I can read the address "Carrer de Prova 5, 2n" on the playdate page
    But someone who is not connected to Marc cannot read the address

  Scenario: My own private plans show on my map
    Given I created a playdate at "Central test park" for my friends on Saturday 11:00
    When I open the home page
    Then I see an invitation pin at "Central test park" on the map
    And "Your plans and invitations" lists "Central test park" with "Organised by you"

  Scenario: Answering an invitation
    Given Marc invited his friends to a playdate at "Central test park" on Saturday 11:00
    When I open the invitation from my list and choose "I'm in"
    Then the playdate shows "2 families going"
    And Marc sees "Ana" in the list of who is going

  Scenario: Playdates proposed to my class show on the map of class members only
    Given I joined "P4 - Class A"
    And Marc proposed a playdate in the class at "Central test park" on Saturday 11:00
    When I open the home page
    Then I see an invitation pin at "Central test park" on the map
    And Lia's map shows no invitation pin
