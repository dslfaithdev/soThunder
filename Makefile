VERSION:=$(shell cat install.rdf | sed '/em:version/!d' | sed -e :a -e 's/<[^>]*>//g;/</N;//ba' | sed 's/ //g')

UPLOADPATH:=fer@cyrus.cs.ucdavis.edu:public_html/sothunder

DEPS:= chrome/ \
 chrome.manifest \
 chrome/content/ \
 chrome/content/about.xul \
 chrome/content/compose.xul \
 chrome/content/messageWindow.xul \
 chrome/content/messenger.xul \
 chrome/content/options.xul \
 chrome/content/soThunder.js \
 chrome/content/soThunder_col.js \
 chrome/locale/en-US/about.dtd \
 chrome/locale/en-US/options.dtd \
 chrome/locale/en-US/overlay.dtd \
 chrome/locale/en-US/overlay.properties \
 chrome/skin/ \
 chrome/skin/ajax-loader.gif \
 chrome/skin/seal_blue-gold.png \
 chrome/skin/Logo_BTH.png \
 chrome/skin/window.css \
 defaults/preferences/prefs.js \
 install.rdf

sothunder.xpi: ${DEPS}
	zip $@ ${DEPS}
	cp $@ sothunder-$(VERSION).xpi

all: sothunder.xpi

clean: 
	rm sothunder.xpi

upload: sothunder.xpi
	scp sothunder*.xpi $(UPLOADPATH)
