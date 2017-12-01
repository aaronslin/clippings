/*

Todo:
- Open image in new HTML
- Add a textbox to insert comments
- Upon [Enter]/[Submit]:
	- Update chrome.storage with URL, comments, data URL
	- Use base64 encoding => put this in the json
- Make the default filename a timestamp


- Settings page to set default stuff


Potential for many URLs to be broken if the a folder name ever changes

Create a subfolder? But chrome extensions can't do this.
Allow the user to crop the image

*/

var DEFAULT_FORMAT = "png";
var DEFAULT_PATH = "clip_images/";
var DEFAULT_FILENAME = "test.png"
var id = 100;

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function(homeTab) {
	// URL for tab from which the browserAction was clicked
	tabUrl = homeTab.url;

	chrome.tabs.captureVisibleTab(null, {"format": DEFAULT_FORMAT}, function(screenshotUrl) {
		var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++);
		var targetId = null;

		chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
			// We are waiting for the tab we opened to finish loading.
			// Check that the tab's id matches the tab we opened,
			// and that the tab is done loading.
			if (tabId != targetId || changedProps.status != "complete")
				return;

			// Passing the above test means this is the event we were waiting for.
			// There is nothing we need to do for future onUpdated events, so we
			// use removeListener to stop getting called when onUpdated events fire.
			chrome.tabs.onUpdated.removeListener(listener);

			// Look through all views to find the window which will display
			// the screenshot.	The url of the tab which will display the
			// screenshot includes a query parameter with a unique id, which
			// ensures that exactly one view will have the matching URL.
			var views = chrome.extension.getViews();
			for (var i = 0; i < views.length; i++) {
				var view = views[i];
				if (view.location.href == viewTabUrl) {
					view.setScreenshotUrl(screenshotUrl);
					view.setImageEncoding(screenshotUrl);
					view.setTabUrl(tabUrl);
					view.setDownloadCount();
					break;
				}
			}
		});

		chrome.tabs.create({url: viewTabUrl}, function(tab) {
			targetId = tab.id;
		});
	});
});
