const path = require('path');

const MOBILE_WIDTH = 375;
const DESKTOP_WIDTH = 1024;


const defaultTestDom = `
    <nav id="headerNav">
        <div id="swapButton">
            <ul class="inline-list" role="menu" aria-labelledby="burgerImage">
                <li role="none">
                    <button id="burgerImage" type="button" aria-haspopup="true" 
                        aria-controls="headerNav" aria-label="Toggle Navigation">
                        <svg id="hamburger-nav"></svg>
                    </button>
                </li>
            </ul>
        </div>
    </nav>
`

let headerNav;
let burgerImage;
let burgerIcon;
let burgerXIcon;

/**********************
 * Test Helpers
 **********************/
function setViewportWidth(width) {
    Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        configurable: true,
        value: width
    });
    window.dispatchEvent(new window.Event('resize'));
}

function getNavIcons() {
    return {
        burgerIcon: document.querySelector('#hamburger-nav'),
        burgerXIcon: document.querySelector(`#hamburger-nav-x`),
    };
}

/**********************
 * Test Setup
 **********************/
beforeEach(() => {
    // Set-up the default DOM
    document.body.innerHTML = defaultTestDom;

    // Import our script
    jest.isolateModules(() => {
        require(path.resolve(__dirname, '../../../assets/js/hamburger-nav.js'));
    });

    // Set clientWidth to mobile (otherwise defaults to 0)
    setViewportWidth(MOBILE_WIDTH);

    // Get our handles
    headerNav = document.querySelector('#headerNav');
    burgerImage = document.querySelector('#burgerImage');
});

/**********************
 * Tests
 **********************/
it('should swap burger icons and headerNav visibility when burgerImage is clicked', () => {
    let {burgerIcon, burgerXIcon} = getNavIcons();

    // Confirm initial state (headerNav style is '', button expanded is null, icon is burger)
    expect(headerNav.style.display).toBe("");
    expect(burgerImage.getAttribute('aria-expanded')).toBeNull();
    expect(burgerIcon).not.toBeNull();
    expect(burgerXIcon).toBeNull();
    
    // Click burgerImage to open, re-grab our icon elements
    burgerImage.click();
    ({burgerIcon, burgerXIcon} = getNavIcons());

    // Confirm state now (headerNav style is flex, button expanded is true, icon is X)
    expect(headerNav.style.display).toBe('flex');
    expect(burgerImage.getAttribute('aria-expanded')).toBe('true');
    expect(burgerIcon).toBeNull();
    expect(burgerXIcon).not.toBeNull();
    
    // Click burgerImage to close, re-grab our icon elements
    burgerImage.click();
    ({burgerIcon, burgerXIcon} = getNavIcons());

    // Confirm state now (headerNav style is none, button expanded is false, icon is burger)
    expect(headerNav.style.display).toBe('none');
    expect(burgerImage.getAttribute('aria-expanded')).toBe('false');
    expect(burgerIcon).not.toBeNull();
    expect(burgerXIcon).toBeNull();
});

it('should reset the navbar properties when resizing the window >767', () => {
    let {burgerIcon, burgerXIcon} = getNavIcons();

    // Confirm initial state (headerNav style is '', button expanded is null, icon is burger)
    expect(headerNav.style.display).toBe("");
    expect(burgerImage.getAttribute('aria-expanded')).toBeNull();
    expect(burgerIcon).not.toBeNull();
    expect(burgerXIcon).toBeNull();

    // Click to update the style and icon
    burgerImage.click();
    ({burgerIcon, burgerXIcon} = getNavIcons());

    // Confirm state now (headerNav style is flex, button expanded is true, icon is X)
    expect(headerNav.style.display).toBe('flex');
    expect(burgerImage.getAttribute('aria-expanded')).toBe('true');
    expect(burgerIcon).toBeNull();
    expect(burgerXIcon).not.toBeNull();

    // Resize the Viewport
    setViewportWidth(DESKTOP_WIDTH);
    ({burgerIcon, burgerXIcon} = getNavIcons());

    // Confirm state now (headerNav style is null, button is expanded, icon is burger)
    expect(headerNav.style.display).toBe('');
    expect(burgerImage.getAttribute('aria-expanded')).toBe('true'); // doesn't get reset
    expect(burgerIcon).not.toBeNull();
    expect(burgerXIcon).toBeNull();
    
});