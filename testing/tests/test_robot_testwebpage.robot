*** Settings ***
Library           SeleniumLibrary
Suite Setup       Open Browser To Homepage
Suite Teardown    Close Browser
Test Teardown     Run Keyword If Test Failed    Capture Page Screenshot

*** Keywords ***
Open Browser To Homepage
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method    ${options}    add_argument    --headless
    Call Method    ${options}    add_argument    --no-sandbox
    Call Method    ${options}    add_argument    --disable-dev-shm-usage
    Call Method    ${options}    add_argument    --ignore-certificate-errors
    Call Method    ${options}    add_argument    --allow-insecure-localhost
    Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}
    Maximize Browser Window
    Set Window Size    1920    1080
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
    Wait Until Element Is Visible    css=div[class="modal active"] .bookings-list .booking-item-card    15s

    ${booking_cards}=    Get WebElements    css=div[class="modal active"] .bookings-list .booking-item-card
    ${num_bookings}=    Get Length    ${booking_cards}
    Should Be True    ${num_bookings} >= 1
    # Close the modal so logout can work
    # Ensure modal is in view
    Scroll Element Into View    css=div[class="modal active"] .close-modal
    Execute Javascript    document.querySelector('div[class="modal active"] .close-modal').click();
    Wait Until Keyword Succeeds    5x    2s    Element Should Not Be Visible    css=div[class="modal active"]

Safe Sign Out
<<<<<<< HEAD
    Run Keyword And Ignore Error    Click Element    css=#successModal .close-modal
    Run Keyword And Ignore Error    Click Element    css=#signInModal .close-modal
    Run Keyword And Ignore Error    Click Element    css=#signUpModal .close-modal

    # Scroll Sign Out into view and click it
    ${sign_out}=    Get WebElement    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]
    Execute Javascript    arguments[0].scrollIntoView({block: "center", inline: "center"});    ${sign_out}
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]    15s
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]

    # Wait for logged-out state: Sign In appears, View My Bookings disappears
    Wait Until Element Is Visible       xpath=//nav[@id='mainNav']//button[normalize-space(text())='Sign In']    15s
    Wait Until Element Is Not Visible   css=.view-bookings-btn    15s
=======
    # Close any potential modals that may block the header
    Run Keyword And Ignore Error    Click Button    css=#successModal .close-modal
    Run Keyword And Ignore Error    Click Button    css=#signInModal .close-modal
    Run Keyword And Ignore Error    Click Button    css=#signUpModal .close-modal

    # Scroll Sign Out button into view
    ${sign_out}=    Get WebElement    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]
    Execute JavaScript    arguments[0].scrollIntoView({block: "center", inline: "center"});    ${sign_out}

    # Wait until clickable and click
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]    15s
    Click Element    xpath=//nav[@id='mainNav']//button[contains(text(),"Sign Out")]

    # Wait for page to update: Sign In button appears, View My Bookings disappears
    Wait Until Element Is Visible    xpath=//nav[@id='mainNav']//button[normalize-space(text())='Sign In']    15s
    Element Should Not Be Visible    css=.view-bookings-btn
>>>>>>> 0fc73a62f9ceaebda36ff40eab6668c254fb48e1

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
