@mvp
Feature: Browse places, events and activities on a map and a list
  As a parent in Sant Cugat
  I want to see what I can do with my kids near me
  So that I can decide quickly without searching many websites

  Background:
    Given the catalogue contains published items in "Sant Cugat del Vallès" and nearby towns

  Scenario: First visit shows the map centred on the active area
    When I open the home page
    Then I see a map centred on "Sant Cugat del Vallès"
    And the map shows only items within the default radius from site config
    And I see a list of the same items under the map, ordered by distance

  Scenario: Map and list stay in sync
    Given I am on the home page
    When I tap an item in the list
    Then the map highlights the same item
    When I tap a pin on the map
    Then the list scrolls to the same item

  Scenario: Use my location only after I agree
    Given I am on the home page
    When I tap "Near me"
    Then the browser asks for my location
    And if I refuse, the map stays centred on the active area and shows a short note
    And my location is never sent to the server or stored

  Scenario: Item card shows the essentials
    When I look at any item card
    Then I see its title, theme icon, age range, price label, distance and when it happens or opens
    And I see a "last checked" date
