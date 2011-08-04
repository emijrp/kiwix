var currentTabId = "00000000";

/* Display the tab header */
function showTabHeaders() {
    var tabHeaders = document.getElementById("tab-headers");
    tabHeaders.style.display = "block";
}

/* Make the tabs (in)visible */
function changeTabsVisibilityStatus(set_visible, save) {
    var tabHeaders = document.getElementById("tab-headers");
    var is_visible = (tabHeaders.style.display == "block" ? true : false);
    alert(set_visible);
    var vis_value = (set_visible == undefined ? !is_visible : set_visible);
    tabHeaders.style.display = (vis_value == true ? "block" : "none");
    document.getElementById('display-tabs').setAttribute('checked', vis_value);
    if (save) 
	settings.displayTabs(vis_value);
}

/* Add a new tab */
function openNewTab() {
    changeTabsVisibilityStatus(true);

    var id=randomString();

    var newHtmlRenderer = document.createElement("browser");
    newHtmlRenderer.setAttribute("type", "content");
    newHtmlRenderer.setAttribute("flex", "1");
    newHtmlRenderer.id = "html-renderer-" + id; 

    var addButton = document.getElementById('tabs-add-button');

    var tabPanels = document.getElementById("tab-panels");
    var newTabPanel = document.createElement("tabpanel");
    newTabPanel.id = "tab-panel-" + id; 
    newTabPanel.appendChild(newHtmlRenderer);
    if (tabPanels.lastChild == null)
        tabPanels.appendChild(newTabPanel);
    else
        tabPanels.insertBefore(newTabPanel, tabPanels.lastChild.nextSibling);

    var tabHeaders = document.getElementById("tab-headers");
    var newTabHeader = document.createElement("tab");
    newTabHeader.id = "tab-header-" + id; 
    newTabHeader.setAttribute("onclick", "switchTab(null, this)");
    newTabHeader.setAttribute("class", "tab-header");

    var closeButton = document.createElement("toolbarbutton");
    closeButton.id = 'tab-close-button-' + id;
    closeButton.setAttribute('oncommand', 'closeThatTab("'+ id +'")');
    closeButton.setAttribute('class', 'tabs-close-button');

    var newTabHeaderLabel = document.createElement("label");
    newTabHeaderLabel.setAttribute("class", "tab-header-label");
    newTabHeaderLabel.setAttribute("crop", "right");
    newTabHeader.appendChild(newTabHeaderLabel);
    tabHeaders.insertBefore(newTabHeader, addButton);
    tabHeaders.insertBefore(closeButton, tabHeaders.lastChild);

    switchTab(id);

    initHtmlRendererEventListeners();
}

function closeThatTab(tabId) {
    var tabs = document.getElementById("tabs");
    var tabHeaders = document.getElementById("tab-headers");
    var tabPanels = document.getElementById("tab-panels");
    var tabPanel = document.getElementById("tab-panel-" + tabId);
    var tabHeader = document.getElementById("tab-header-" + tabId);
    var closeButton = document.getElementById('tab-close-button-' + tabId);

    // default fall back destination
    var newCurrentTab = '000000';

    // we try to get next tab on right as destination
    // if there's none, we get the one on left.
    // *anyway* if current page is not the one removed, we stay there.
    try { var rightTab = closeButton.nextSibling; } catch (e) { var rightTab = null; }
    if (rightTab.id == 'tabs-add-button') {
        // no tab on the right, let's retrieve the one on the left.
        try {
            leftTab = closeButton.previousSibling.previousSibling.previousSibling;
            newCurrentTab = tabIDfromID(leftTab.id);
        } catch (e) { var leftTab = null; }
    } else {
        newCurrentTab = tabIDfromID(rightTab.id);
    }

    // remove tab elements including close button.
	tabHeaders.removeChild(tabHeader);
	tabPanels.removeChild(tabPanel);
    tabHeaders.removeChild(closeButton);

    // if current page is not the one being deleted
    // we stay where we are.
    if (currentTabId != tabId)
        newCurrentTab = currentTabId;

    // if we removed all tabs, disable tab mode and display help page.
    if (document.getElementsByTagName('tab').length == 0) {
        showHelp(true);
        changeTabsVisibilityStatus(false, true);
        return;
    }

    switchTab(newCurrentTab, null);
}

function tabIDfromID(id) {
    var x = id.split('tab-header-', 2);
    return x[1];
}

/* Switch Tab */
function switchTab(tabId, tab) {
    if (tabId == null)
        var tabId = tabIDfromID(tab.id);
    var tabBox = document.getElementById("tab-box");
    var tabHeader = document.getElementById("tab-header-" + tabId);
    var tabPanel = document.getElementById("tab-panel-" + tabId);
    tabBox.selectedTab = tabHeader;
    tabBox.selectedPanel = tabPanel;
    currentTabId = tabId;
    updateHistoryNavigationButtons();
    getFindBar().browser = getHtmlRenderer();
    var title = getHtmlRenderer(tabId).contentTitle;
    setWindowsTitle(title);
}

/* Update the tab header */
function updateTabHeader(tabId) {
    var tabHeaderId = "tab-header-" + tabId;
    var tabHeader = document.getElementById(tabHeaderId);
    var title = getHtmlRenderer(tabId).contentTitle;
    var titleNode = tabHeader.childNodes[0];
    titleNode.setAttribute("value", title);
    tabHeader.setAttribute("tooltiptext", title);
    setWindowsTitle(title);
}

/* Update windows title */
function setWindowsTitle(title) {
    if (title != "") {
	document.title = title + " - " + getWindow().getAttribute("titlemodifier");
    }
}

/* Return the HTML rendering object */
function getHtmlRenderer(tabId) {
    if (tabId == undefined) {
	tabId = currentTabId;
    }
    return document.getElementById("html-renderer-" + tabId);  
}

/* create new tab. open it and adjust UI */
function switchToNewTab() {
    openNewTab();
    getSearchBox().value = '';
    getSearchBox().focus();
}
