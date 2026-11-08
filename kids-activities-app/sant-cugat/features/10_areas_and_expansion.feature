@phase2
Feature: Add new areas without code changes
  As the product owner
  I want to add a colleague's town by editing config
  So that the site can grow area by area

  Scenario: New area from config
    Given I add the area "Terrassa" with centre and radius in areas config
    When the nightly pipeline runs
    Then items for Terrassa are gathered from the sources listed for that area
    And the area appears in the area picker after at least the minimum number of published items in site config

  Scenario: Area-specific sources
    Given an area has its own list of sources
    Then the pipeline only fetches those sources plus the shared regional sources for that area
