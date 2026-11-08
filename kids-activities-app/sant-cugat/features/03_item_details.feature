@mvp
Feature: Item details and trust
  As a parent
  I want to see reliable details and where the information comes from
  So that I don't travel to something closed or cancelled

  Scenario: Place detail page
    When I open the page of a place, for example a trampoline park
    Then I see address, opening hours, age range, price, indoor/outdoor, facilities
    And I see a link to the official source
    And I see "Directions" that opens my maps app

  Scenario: Event detail page
    When I open the page of an event
    Then I see date, start and end time, place, age range, price and booking link if any
    And I see the language of the activity (ca/es/en)

  Scenario: Expired events disappear
    Given an event ended yesterday
    When I open the home page
    Then I do not see that event in the map or the list
    And its page shows "This event has finished" with similar upcoming items

  Scenario: Stale information is flagged
    Given an item was last checked more days ago than the freshness limit in site config
    Then its card shows "Information may be out of date"
    And if it is older than the hide limit it is not shown at all

  Scenario: AI-written text is labelled
    When an item description was generated or translated by AI
    Then the page shows a small "AI summary - check the source" label
