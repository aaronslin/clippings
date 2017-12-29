import argparse
import os
import re
import json
import codecs

"""
configurable parameters:

 - the json keys ("clipDate")
 - inFolder (default is "./clippings")
 - name of template, feed, wrapper.html
 - folder in the Downloads folder

"""

FOLDER_CURRENT = "/Users/aaronlin/Dropbox/Blog/clippings/current"
FOLDER_QUEUE = "/Users/aaronlin/Dropbox/Blog/clippings/queue"
FOLDER_OUT = "/Users/aaronlin/Dropbox/Blog/clippings/"
MAX_CLIPPINGS = 100


parser = argparse.ArgumentParser()
parser.add_argument("-i", "--inFolder", default=FOLDER_CURRENT)
parser.add_argument("-o", "--outFolder", default=FOLDER_OUT)
parser.add_argument("-n", "--numClippings", default=MAX_CLIPPINGS, type=int)
args = parser.parse_args()
inFolder = args.inFolder
outFolder = args.outFolder
numClippings = args.numClippings


def write_to_file(filename, text, append=True):
	mode="w+" if append else "w"
	file = codecs.open(filename, mode, "utf-8")
	file.write(text)
	file.close()

def read_template(filename):
	varPattern = r"\{\{\{[\w]*\}\}\}"
	with open(filename, "r") as f:
		text = f.read()
		f.close()
	placeholders = re.findall(varPattern, text)
	return text, placeholders

def _listdir(folder):
	"""
	Lists all files in a folder that match the clipping.json format.
	"""
	filePattern = r"^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])\-clipping\-[\d]*\.json$"
	filenames = [f for f in os.listdir(folder) if re.match(filePattern, f)]
	return filenames

def move_clippings(source, dest):
	filenames = _listdir(source)
	for f in filenames:
		os.rename(os.path.join(source, f), os.path.join(dest, f))

def load_clippings(clipFolder):
	files = [os.path.join(clipFolder, f) for f in _listdir(clipFolder)]
	clips = [json.loads(open(f).read().decode("utf-8-sig")) for f in files]
	
	if len(files) == 0:
		return files, clips
	if numClippings >= 0:
		dateArranged = zip(*sorted(zip(files, clips), \
					key=lambda x: x[0], reverse=True))
		files, clips = [list(t)[:numClippings] for t in dateArranged]
	return files, clips



def _get_clipping_value(clipping, key):
	"""
	To handle exceptions. Some .jsons may not have the same keys.
	"""
	if key in clipping:
		return clipping[key]
	return "N/A"

def build_template(templateFile, clipping):
	def ph_to_var(ph):
		return ph.replace("{", "").replace("}", "")

	text, placeholders = read_template(templateFile)
	keys = [ph_to_var(ph) for ph in placeholders]
	values = [_get_clipping_value(clipping, key) for key in keys]
	for (ph, val) in zip(placeholders, values):
		text = text.replace(ph, val)
	return text

def build_HTML(inFolder, wrapperFile, templateFile, outFile, optionalCondition=None):
	outFile = os.path.join(outFolder, outFile)
	print outFile
	wrapper, wrapPH = read_template(wrapperFile)
	assert len(wrapPH) == 1
	wrapPH = wrapPH[0]

	filenames, clippings = load_clippings(inFolder)
	clipHTML = [build_template(templateFile, c) for (f,c) in zip(filenames, clippings)]
	htmlFull = wrapper.replace(wrapPH, "\n".join(clipHTML))
	write_to_file(outFile, htmlFull)




def rebase_add_encoding_prefix():
	"""
	One-time use function. Method for rebasing .json files. 
	Previous file versions did not include the base64 prefix.
	"""
	filenames, clippings = load_clippings(inFolder)
	for file, clip in zip(filenames, clippings):
		img = clip["imgEncoding"]
		str = "data:image/png;base64,"
		if str not in img:
			clip["imgEncoding"] = str + img
			with open(file, "w") as outfile:
				json.dump(clip, outfile)

def rebase_add_date():
	"""
	One-time use function. Method for rebasing .json files. 
	Add a "clipDate" key to clippings.
	"""
	filenames, clippings = load_clippings(inFolder)
	for file, clip in zip(filenames, clippings):
		date = "-".join(file.split("-")[:3])
		date = date.split("/")[-1]
		clip["clipDate"] = date
		with open(file, "w") as outfile:
			json.dump(clip, outfile)

if __name__ == "__main__":
	build_HTML(FOLDER_CURRENT, "wrapper.html", "template.html", "feed_current.html")
	build_HTML(FOLDER_QUEUE, "wrapper.html", "template.html", "feed_queue.html")



"""

Maybe we're better off writing our own kind of template library?
Handle exceptions? For example, later want to have clippings["date"], 
	but earlier versions of json files won't have a date attribute

Need some kind of system to manage the clippings. If I find a clip
	that I want to delete, how do I find which file to delete?

The inFolder system sucks.

Where I left off:
-------------------
Write separate template files for debug interface? (Or a toggle mode)
	Display the filename (may require rebasing clippings obj)
	Allow editing? (maybe this is too advanced.)
Put this is in a github with the chrome extension too

"""














