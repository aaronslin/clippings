/*

Todo:

X Settings page to set default download path
- Add a shortcut for using this chrome extension
- include timestamp on .json file
- html showing title of extension on options/landing pages
- design stuff generally
- Bug when you have multiple screenshot.html windows open.
- Close window after downloading
- Options page should be linked in the landing page
- Write something to listen for file updates in the clippings/ directory
- 

Allow the user to crop the image

*/

var DEFAULT_FORMAT = "png";
var DEFAULT_SUBFOLDER = "clippings/";

function defaultPopulateFolder() {
	chrome.storage.local.get("dlFolder", function(obj) {
		dlFolder = obj["dlFolder"];
		if(dlFolder!==0 && !dlFolder) {
			chrome.storage.local.set({
				dlFolder: DEFAULT_SUBFOLDER
			});
		} 
	});
}

function downloadData(dataURL, filename) { 
	chrome.storage.local.get("dlFolder", function(obj) {
		dlFolder = obj["dlFolder"];
		chrome.downloads.download({
			url: dataURL,
			filename: dlFolder + filename,
			conflictAction: "uniquify",
			saveAs: false
		});
	});
}
chrome.runtime.onMessage.addListener(function(msg, sender) {
	if ((msg.action === 'downloadData')
			&& (msg.dataURL !== undefined)) {
		downloadData(msg.dataURL, msg.filename);
	}
});

defaultPopulateFolder();

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function(homeTab) {
	chrome.tabs.captureVisibleTab(null, {"format": DEFAULT_FORMAT}, function(screenshotUrl) {
		var viewTabUrl = chrome.extension.getURL('screenshot.html');
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
					view.setTabInformation(homeTab);
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
