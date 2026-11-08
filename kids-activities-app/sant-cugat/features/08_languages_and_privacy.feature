@mvp
Feature: Languages and privacy
  Scenario Outline: Choose language
    When I choose "<lang>"
    Then all interface text is in "<lang>"
    And item descriptions are shown in "<lang>" when a translation exists, otherwise in the original language

    Examples:
      | lang    |
      | Català  |
      | Español |
      | English |

  Scenario: Default language follows the browser
    Given my browser language is English
    When I open the site for the first time
    Then the site is in English

  Scenario: No tracking without consent
    When I open any page
    Then no third-party tracking cookie is set
    And only privacy-friendly, cookieless page counts are recorded

  Scenario: No child data
    Then no form on the site asks for a child's name, photo or school
