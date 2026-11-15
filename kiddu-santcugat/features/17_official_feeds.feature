@mvp @pipeline
Feature: Official structured feeds are read without AI
  As the product owner
  I want official agendas with structured data read directly
  So that dates and places come from the source itself, at no AI cost

  Scenario: The town hall children's feed fills the review queue
    When the pipeline reads the town hall children's feed
    Then the upcoming events are queued with the date, time, place and map location given by the feed
    And no AI was used for them
    And events that already happened are not queued

  Scenario: Missing coordinates are flagged
    When the pipeline reads the town hall children's feed
    Then an event without coordinates is flagged "Location unknown: choose a place for the map"

  Scenario: Age and price are read from the description
    When the pipeline reads the town hall children's feed
    Then an event described as "Edat: +6 anys" is for ages from 6
    And an event described as "Activitat familiar gratuïta" is free

  Scenario: The feed's own text is not copied to the public site
    When the pipeline reads the town hall children's feed
    And the editor publishes one of its events
    Then families see the facts and a link to the town hall page, but not the town hall's description text
