DEFAULT_SUBFOLDER = "clippings/";
PREV_SUBFOLDER = undefined;

function clean_folderName(folderName) {
	var reg = /^[a-zA-Z0-9]+(?:[\w-]*[a-zA-Z0-9]+[\/]?)*$/
	if(!reg.test(folderName)) {
		return undefined;
	}
	if(folderName[folderName.length - 1] != "/") {
		folderName += "/";
	}
	return folderName;
}

function save_options() {
	var dlElement = document.getElementById("dlFolder");
	var dlFolder = dlElement.value;
	dlFolder = clean_folderName(dlFolder);
	console.log(dlFolder);

	if (dlFolder === undefined && PREV_SUBFOLDER !== undefined) {
		populate_settings();
	}
	else {
		dlElement.value = dlFolder;
		chrome.storage.local.set({
			dlFolder: dlFolder
		});
		if (dlFolder != PREV_SUBFOLDER) {
			$("#savedMsg").css({display: "block"}).fadeOut(1000);
		}
		PREV_SUBFOLDER = undefined;
	}
}

function capture_options(response) {
	PREV_SUBFOLDER = response.target.value;
}

function populate_settings() {
	if (PREV_SUBFOLDER === undefined) {
		chrome.storage.local.get("dlFolder", function(obj) {
			dlFolder = obj["dlFolder"];
			if(dlFolder!==0 && !dlFolder) {
				document.getElementById("dlFolder").value = DEFAULT_SUBFOLDER;
				save_options();
			} 
			else {
				document.getElementById("dlFolder").value = dlFolder;
			}
		});
	}
	else {
		document.getElementById("dlFolder").value = PREV_SUBFOLDER;
		PREV_SUBFOLDER = undefined;
	}
}

window.onload = function() {
	populate_settings();
}

document.getElementById("dlFolder").addEventListener("blur", save_options);
document.getElementById("dlFolder").addEventListener("focus", capture_options);


