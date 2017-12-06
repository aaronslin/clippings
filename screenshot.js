// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* HTML populated by background.js */

function setTabInformation(homeTab) {
	document.getElementById("tabUrl").value = homeTab.url;
	document.getElementById("tabTitle").value = homeTab.title;
}

function setScreenshotUrl(imgUrl) {
	var prefix = "base64,";
	var num_slice = imgUrl.indexOf(prefix) + prefix.length;
	var base64 = imgUrl.slice(num_slice);

	document.getElementById("imgEncoding").value = base64;
	document.getElementById("screenshot").src = imgUrl;
}

function setDownloadCount() {
	var el = document.getElementById("downloadCount");
	var store = chrome.storage.local;
	var today = _getToday();

	store.get("today", function(dateObj) {
		if(dateObj["today"] == today) {
			store.get("count", function(countObj) {
				count = countObj["count"] + 1;
				store.set({"count": count});
				setFileName(count);
			});
		} else {
			var count = 0;
			store.set({"today": today});
			store.set({"count": count});
			setFileName(count);
		}
	});
}

function setFileName(clipNum) {
	var today = _getToday();
	var suffix = "clipping";
	var dash = "-";
	var filename = [today, suffix, clipNum.toString()].join(dash) + ".json";
	document.getElementById("savefileName").value = filename;
	setSaveAddress();
}

function setSaveAddress() {
	var rootFolder = "[Downloads]/";
	var fn = document.getElementById("savefileName").value;

	chrome.storage.local.get("dlFolder", function(obj) {
		console.log(obj);
		subfolder = obj["dlFolder"];
		document.getElementById("saveAddress").innerHTML = rootFolder + subfolder + fn;
	})
}

/* Helper functions */

function _zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

function _getToday() {
	var d = new Date;
	var dash = "-";
	var yyyy = d.getFullYear();
	var mm = _zeroPad(d.getMonth() + 1, 2);
	var dd = _zeroPad(d.getDate(), 2);
	return [yyyy, mm, dd].join(dash);
}

// function _getFileName() {
// 	var today = _getToday();
// 	var suffix = "clipping";
// 	var clipNum = document.getElementById("downloadCount").value;
// 	var dash = "-";
// 	return [today, suffix, clipNum.toString()].join(dash) + ".json";
// }

function sendDownloadMessage(formData) {
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
	var fn = document.getElementById("savefileName").value;

	chrome.runtime.sendMessage({
		action: 'downloadData',
		dataURL: "data:" + data, 
		filename: fn
	});
}

window.onload = function() {
	document.getElementById("commentBox").focus();

	// document.getElementById("commentBox").addEventListener("keypress", function (e) {
	// 	// Remap ENTER to submit
	// 	console.log(e);
	// 	if(e.which == 13 && !e.shiftKey) {        
	// 		document.getElementById("submitButton").click();
	// 		e.preventDefault();
	// 		return false;
	// 	}
	// });

	document.getElementById("dataForm").addEventListener("submit", function (e) {
		e.preventDefault();

		// There is a better jQuery method for serializing object
		var keys = ["tabUrl", "tabTitle", "imgEncoding", "commentBox"]
		var formData = {};
		for (var i=0; i<keys.length; i++) {
			element = document.getElementById(keys[i]);
			formData[keys[i]] = element.value;
		}
		sendDownloadMessage(formData);
	});
}


/*
Todo: 

Check that there is actually data in the box
Keyboard shortcut to clip


*/

