@mvp
Feature: Plan with friends through a share link
  As a parent
  I want to invite other families from my class to join a plan
  So that our kids can go together, without anyone installing an app

  Scenario: Create a plan from an item
    Given I am on the page of "Parc Central" playground
    When I tap "Plan with friends"
    And I choose Saturday 11:00 and write "Bringing a football"
    Then a plan page is created with a private link
    And I can share the link to WhatsApp with one tap

  Scenario: A friend answers without an account
    Given a friend opens my plan link
    When they enter a first name and choose "I'm in"
    Then the plan shows "2 families going"
    And no email, phone or child data is asked

  Scenario: Plan links are private and expire
    Then a plan page is not indexed by search engines
    And it cannot be found from the public site
    And it is deleted automatically the number of days after the plan date set in site config

  Scenario: Organiser can cancel
    Given I created a plan
    When I open my plan with the organiser link and tap "Cancel plan"
    Then everyone who opens the link sees "Plan cancelled"
