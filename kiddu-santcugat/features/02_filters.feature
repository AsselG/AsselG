@mvp
Feature: Filter by theme, age, time, price and indoor/outdoor
  As a parent
  I want to narrow the options to what fits my kids and my time
  So that I only see relevant things

  Scenario Outline: Filter by theme
    When I select the theme "<theme>"
    Then I only see items tagged "<theme>"

    Examples:
      | theme     |
      | Sport     |
      | Art       |
      | Education |
      | Fun       |
      | Nature    |

  Scenario: Filter by child age
    When I set the child age to 4
    Then I only see items whose age range includes 4
    And items with no age information are shown last with the label "Age not specified"

  Scenario Outline: Filter by time
    Given today is "<today>"
    When I choose "<when>"
    Then I only see events happening in that period and places open in that period

    Examples:
      | today      | when         |
      | Wednesday  | Today        |
      | Wednesday  | This weekend |
      | Saturday   | Tomorrow     |

  Scenario: Free only
    When I switch on "Free only"
    Then I only see items with price 0 or labelled free

  Scenario: Rainy day
    Given the weather forecast for the active area says rain today
    When I open the home page
    Then I see a "Rainy day" suggestion chip
    When I tap it
    Then I only see indoor items

  Scenario: Filters are kept in the URL
    Given I selected "Art", age 6 and "This weekend"
    When I copy the page link and open it on another phone
    Then the same filters are applied
