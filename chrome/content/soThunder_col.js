/*
http://www.wilsonmar.com/1colors.htm
http://snipplr.com/view/14590/hsv-to-rgb/
http://www.csgnetwork.com/csgcolorsel4.html
http://colorschemedesigner.com/
http://johndyer.name/lab/colorpicker/
*/

const XDSL = 0;
const TRUST = 1;
const HOPS = 2;
const TRUST_CURR = 3;
const HOPS_CURR = 4;


var columnHandlerXdsl = {
getCellText:         function(row, col) {
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,XDSL);
},
getSortStringForRow: function(hdr) {return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,XDSL);},
isString:            function() {return true;},
	
getCellProperties:   function(row, col, props){},
getRowProperties:    function(row, props){},
getImageSrc:         function(row, col) {return null;},
getSortLongForRow:   function(hdr) {return 0;}
}
var columnHandlerTrust = {
getCellText:         function(row, col) {
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST);
},
getSortStringForRow: function(hdr) {return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST);},
isString:            function() {return true;},
	
getCellProperties:   function(row, col, props){
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	var trust = getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST);
	if(isNaN(trust))
		return;
	
	var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
  props.AppendElement(atomService.getAtom("yellow"));
	if(trust >= 0.5) 
		props.AppendElement(atomService.getAtom("green"));	
	if(trust > 0.2)
			props.AppendElement(atomService.getAtom("yellow"));
	else
		props.AppendElement(atomService.getAtom("red"));
	return;
},
getRowProperties:    function(row, props){},
getImageSrc:         function(row, col) {return null;},
getSortLongForRow:   function(hdr) {return 0;}
}
var columnHandlerHops = {
getCellText:         function(row, col) {
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,HOPS);
},
getSortStringForRow: function(hdr) {return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,HOPS);},
isString:            function() {return true;},
	
getCellProperties:   function(row, col, props){},
getRowProperties:    function(row, props){},
getImageSrc:         function(row, col) {return null;},
getSortLongForRow:   function(hdr) {return 0;}
}

var columnHandlerTrustCurrent = {
getCellText:         function(row, col) {
	var hdr = gDBView.getMsgHdrAt(row);
	return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST_CURR);
},
getSortStringForRow: function(hdr) {return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST_CURR);},
isString:            function() {return true;},
	
getCellProperties:   function(row, col, props){
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	var trust = getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,TRUST_CURR);
	if(isNaN(trust))
		return;
	
	var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
  props.AppendElement(atomService.getAtom("yellow"));
	if(trust >= 0.5) 
		props.AppendElement(atomService.getAtom("green"));	
	if(trust > 0.2)
		props.AppendElement(atomService.getAtom("yellow"));
	else
		props.AppendElement(atomService.getAtom("red"));
	return;
},
getRowProperties:    function(row, props){},
getImageSrc:         function(row, col) {return null;},
getSortLongForRow:   function(hdr) {return 0;}
}
var columnHandlerHopsCurrent = {
getCellText:         function(row, col) {
	//get the message's header so that we can extract the reply to field
	var hdr = gDBView.getMsgHdrAt(row);
	return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,HOPS_CURR);
},
getSortStringForRow: function(hdr) {return getXdslInfo(hdr.getStringProperty("x-dsl"),hdr,HOPS_CURR);},
isString:            function() {return true;},
	
getCellProperties:   function(row, col, props){},
getRowProperties:    function(row, props){},
getImageSrc:         function(row, col) {return null;},
getSortLongForRow:   function(hdr) {return 0;}
}

function addCustomColumnHandler() {
	gDBView.addColumnHandler("colxdsl_no",columnHandlerXdsl);
	gDBView.addColumnHandler("colxdsl_trust",columnHandlerTrust);
  gDBView.addColumnHandler("colxdsl_hops",columnHandlerHops);
	gDBView.addColumnHandler("colxdsl_trust_current",columnHandlerTrustCurrent);
  gDBView.addColumnHandler("colxdsl_hops_current",columnHandlerHopsCurrent);
  dump("column handler being added: " + columnHandlerTrust + "\n");
}

var CreateDbObserver = {
  // Components.interfaces.nsIObserver
observe: function(aMsgFolder, aTopic, aData)
	{
		addCustomColumnHandler();
	}
}

function getXdslInfo(xdsl, hdr, value){
    if( xdsl == "" || xdsl == -1 )
        return xdsl;
    //&& isNaN(xdsl) 
    if( xdsl.indexOf(",") != -1 ){
        dump("XdslTrust --- "+ xdsl + "\n");
        return xdsl.split(",")[value];
    }

    var url = "https://soemail.garm.comlab.bth.se/proxy/?xdslTrust/?uid=" + uid + "&xdsl=" +xdsl;

    dump("Requesting: " + url + " " );

    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = function (aEvt) {
        if (xmlhttp.readyState == 4) 
            if(xmlhttp.status == 200)  {
                dump(xmlhttp.responseText + "\n");

                xdsl = xdsl + "," + xmlhttp.responseText;
                hdr.setStringProperty("x-dsl", xdsl);
                return xdsl.split(",")[value];
            }
            else
                return -1;
    };
    xmlhttp.open("GET",url,true);
    xmlhttp.send(null);
    return "updating";
}

function doOnceLoaded(){
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);

	var notificationService =
	Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
	.getService(Components.interfaces.nsIMsgFolderNotificationService);
	notificationService.addListener(newMailListener, notificationService.msgAdded);
}

var newMailListener = {
msgAdded: function(aMsgHdr) {   
	dump("\nGot mail.  Look at aMsgHdr's properties for more details: ");
	dump(aMsgHdr.getStringProperty("x-dsl") + "--\n");
	}
}


window.addEventListener("load",doOnceLoaded,false);
