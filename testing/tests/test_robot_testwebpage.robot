*** Settings ***
Library           SeleniumLibrary
Suite Setup       Open Browser To Homepage
Suite Teardown    Close Browser
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot

*** Keywords ***
Open Browser To Homepage
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method    ${options}    add_argument    --ignore-certificate-errors
    Call Method    ${options}    add_argument    --allow-insecure-localhost
    Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}    remote_url=${REMOTE_URL}
    Maximize Browser Window
    Wait Until Element Is Visible    css=section.hero h1    20s

Login User
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign In')]
    Wait Until Element Is Visible    css=#signInModal .modal-title    10s
    Input Text    css=#signInModal input[name="username"]    ${USERNAME}
    Input Text    css=#signInModal input[name="password"]    ${PASSWORD}
    Click Button    xpath=//div[@id='signInModal']//button[contains(text(),'Sign In')]
    Wait Until Element Is Visible    css=#mainNav button.view-bookings-btn    15s

Verify Booking In My Bookings
    Click Element    css=.view-bookings-btn
    Wait Until Element Is Visible    css=.modal.active .bookings-list .booking-item-card    15s

    ${booking_cards}=    Get WebElements    css=.modal.active .bookings-list .booking-item-card
    ${num_bookings}=    Get Length    ${booking_cards}
    Should Be True    ${num_bookings} >= 1
    # Close the modal so logout can work
    Click Button    css=.modal.active .modal-footer .btn.btn-secondary
    Wait Until Element Is Not Visible    css=.modal.active    10s

Safe Sign Out
    Run Keyword And Ignore Error    Click Button    css=#successModal .close-modal
    Wait Until Element Is Not Visible    css=#successModal.active    5s
    Run Keyword And Ignore Error    Click Button    css=#signInModal .close-modal
    Wait Until Element Is Not Visible    css=#signInModal.active    5s
    Run Keyword And Ignore Error    Click Button    css=#signUpModal .close-modal
    Wait Until Element Is Not Visible    css=#signUpModal.active    5s
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign Out')]
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign In')]    15s
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign Up')]    15s

*** Test Cases ***
Home Page Loads Correctly
    Wait Until Element Is Visible    css=section.hero h1    10s

Navigation Buttons Are Visible (Logged Out)
    Wait Until Element Is Visible    css=#mainNav a[href='./index.html']    10s
    Wait Until Element Is Visible    css=#mainNav a[href='#rooms']         10s
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign In')]    10s
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign Up')]    10s

Sign In Modal Opens and Closes
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign In')]
    Wait Until Element Is Visible    css=#signInModal .modal-title    10s
    Click Button    css=#signInModal .close-modal
    Wait Until Element Is Not Visible    css=#signInModal .modal-title    10s

Sign Up Modal Opens and Closes
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),'Sign Up')]
    Wait Until Element Is Visible    css=#signUpModal .modal-title    10s
    Click Button    css=#signUpModal .close-modal
    Wait Until Element Is Not Visible    css=#signUpModal .modal-title    10s

Rooms Section Is Reachable
    Click Element    css=#mainNav a[href='#rooms']
    Wait Until Element Is Visible    css=#rooms    10s

Logged-In State: View Bookings Button Appears
    Login User

Verify Booking in My Bookings
    Verify Booking In My Bookings

Logout Clears User State
    Safe Sign Out
