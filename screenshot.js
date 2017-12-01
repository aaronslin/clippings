// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* HTML populated by background.js */

function setImageEncoding(imgUrl) {
	var prefix = "base64,";
	var num_slice = imgUrl.indexOf(prefix) + prefix.length;
	var base64 = imgUrl.slice(num_slice);

	document.getElementById("imgEncoding").value = base64;
}

function setTabUrl(tabUrl) {
	document.getElementById("tabUrl").value = tabUrl;
}

function setScreenshotUrl(imgUrl) {
	document.getElementById("screenshot").src = imgUrl;
}

function setDownloadCount() {
	el = document.getElementById("downloadCount");
	var store = chrome.storage.local;
	var today = getToday();

	store.get("today", function(dateObj) {
		console.log("date", dateObj);
		if(dateObj["today"] == today) {
			store.get("count", function(countObj) {
				count = countObj["count"] + 1;
				store.set({"count": count});
				el.value = count.toString();
			});
		} else {
			var count = 0;
			store.set({"today": today});
			store.set({"count": count});
			el.value = count.toString();
		}
	});
}

/* Helper functions */

function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

function getToday() {
	var d = new Date;
	var dash = "-";
	var yyyy = d.getFullYear();
	var mm = zeroPad(d.getMonth() + 1, 2);
	var dd = zeroPad(d.getDate(), 2);
	return [yyyy, mm, dd].join(dash);
}

function getFileName() {
	var today = getToday();
	var suffix = "clipping";
	var clipNum = document.getElementById("downloadCount").value;
	var dash = "-";
	return [today, suffix, clipNum.toString()].join(dash);
}

function downloadData(formData) {
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));

	var a = document.createElement("a");
	a.href = "data:" + data;
	a.download = getFileName() + ".json";
	a.click();
}

window.onload = function() {
	document.getElementById("commentBox").focus();
	
	document.getElementById("dataForm").addEventListener("submit", function (e) {
		e.preventDefault();

		// There is a better jQuery method for serializing object
		var keys = ["tabUrl", "imgEncoding", "commentBox"]
		var formData = {};
		for (var i=0; i<keys.length; i++) {
			element = document.getElementById(keys[i]);
			formData[keys[i]] = element.value;
		}
		downloadData(formData);
	});
}


/*
Todo: 

Check that there is actually data in the box
Keyboard shortcut to clip


*/

