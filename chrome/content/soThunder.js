var uid;

window.addEventListener("load", init, false);
//window.addEventListener( "compose-send-message", send_event_handler, true );

function init(){
	try{
		document.getElementById("threadTree").addEventListener("select", refreshXDSL, false);
	}catch(e) {}
	
	window.addEventListener( "compose-send-message", send_event_handler, true );
	
	try{
		document.getElementById( "msgcomposeWindow" )
		.addEventListener( "compose-window-reopen", function(e){//alert("Compose reuse");
											document.getElementById("soPath-split").setAttribute( "state","collapsed");
											document.getElementById("xdsl-loader").hidden=true;
											document.getElementById("SP").innerHTML="";					
											}, false );
	}catch (e) {}
	myPrefObserver.register();
	try{
		showSoThunder();	
	}catch(e) {}
}

var myPrefObserver = {
register: function() {
	// First we'll need the preference services to look for preferences.
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService);
	
	// For this._branch we ask that the preferences for extensions.myextension. and children
	this._branch = prefService.getBranch("extensions.SoThunder.");
	
	// Now we queue the interface called nsIPrefBranch2. This interface is described as:  
	// "nsIPrefBranch2 allows clients to observe changes to pref values."
	this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	
	// Finally add the observer.
	this._branch.addObserver("", this, false);
	
	//Register the values into our vars.
	uid = this._branch.getIntPref("uid");
	dispSoThunder = this._branch.getBoolPref("dispSoThunder");
},
	
unregister: function() {
	if (!this._branch) return;
	this._branch.removeObserver("", this);
},
	
observe: function(aSubject, aTopic, aData) {
	if(aTopic != "nsPref:changed") return;
	// aSubject is the nsIPrefBranch we're observing (after appropriate QI)
	// aData is the name of the pref that's been changed (relative to aSubject)
	switch (aData) {
		case "uid":
			uid = this._branch.getIntPref("uid");
			break;
		case "dispSoThunder":
			dispSoThunder = this._branch.getBoolPref("dispSoThunder");
			break;
	}
}
}

function refreshXDSL( event ){
	document.getElementById("xdsl-loader").hidden = false;
	document.getElementById("xdslSocialPath").hidden = true;
	document.getElementById("xdslSocialPathDiv").innerHTML = "";
	
	dump("refreshXDSL: ");
	try {
		// Find first selected message
		var mailKey = gDBView.keyForFirstSelectedMessage;
		var hdr = gDBView.hdrForFirstSelectedMessage;
		var xdsl = hdr.getStringProperty("x-dsl");
		var to = hdr.recipients + "," + hdr.ccList + "," + hdr.bccList;
		
		//		document.getElementById("SP").innerHTML += xdsl;
		
		//clean x-dsl
		if( xdsl.indexOf(",") != -1 ){
			xdsl = xdsl.split(",")[XDSL];
		}
		
		if( !isNaN(xdsl) && xdsl != -1 && xdsl != "" ){	 
			to = cleanEmail(to);
			dump("'" + isNaN(xdsl) + "' to: " + to +"\n");
			
			/** For real..		
			 let url = "http://www.example.com/";
			 let request =
			 Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].
			 createInstance(Ci.nsIXMLHttpRequest);
			 
			 request.onload =
			 function(aEvent) {
			 window.alert("Response Text: " + aEvent.target.responseText);
			 };
			 request.onerror =
			 function(aEvent) {
			 window.alert("Error Status: " + aEvent.target.status);
			 };
			 request.open("GET", url, true);
			 request.send(null);
			 */	
			var toArray = to.split(",");
			for(var i in toArray)
			{
				if(toArray[i] == "")
					continue;
				var url = "https://soemail.garm.comlab.bth.se/api/verifyXdsl/?uid=" + uid;
				url += "&xdsl=" + xdsl + "&to=" + toArray[i];
				
				dump("Requesting: " + url + "\n" );
				
				xmlhttp=new XMLHttpRequest();
				xmlhttp.open("GET",url,false);
				xmlhttp.onreadystatechange = function (aEvt) {
				
				dump(xmlhttp.status + " " + injectHtml(xmlhttp.responseText) + "\n");
				
				if(xmlhttp.status == 200)
					if(xmlhttp.responseText != "Can't verify X-DSL.")
					{
						document.getElementById("xdslSocialPathDiv").innerHTML += injectHtml(xmlhttp.responseText);	
						var xdslLength = hdr.getStringProperty("x-dsl").toString().split(",").length;
						if(xdslLength == 1)//We have not updated our xdsl yet..
						{	
							hdr.setStringProperty("x-dsl", document.getElementById("xdslTrust").innerHTML);
						}
						else// if(xdslLength == 3)//We only have 'orig' values, but do we care??
						{
							hdr.setStringProperty("x-dsl", document.getElementById("xdslTrust").innerHTML);
							//hdr.setStringProperty("x-dsl",hdr.getStringProperty("x-dsl") + "," + 
						}
					}
				};
				xmlhttp.send(null);
			}
		}
		else
		{
			dump("--NO x-dsl--\n");
		}
		if(document.getElementById("xdslSocialPathDiv").innerHTML == "")
			document.getElementById("xdslSocialPathDiv").innerHTML = "Can't verify X-DSL.";
		document.getElementById("xdsl-loader").hidden = true;
		document.getElementById("xdslSocialPath").hidden = false;
		//Hide find social path loader and show the SP.
		
	} catch (err) {
		//Components.utils.reportError("showLinkedTask " + err);
		dump("showLinkedTask " + err);
	}
}

function findPaths( evt ) {
	var myLoader = document.getElementById("xdsl-loader");
	var mySP = document.getElementById("SP");
	
	if(!myLoader || !mySP)
		return;
	
	myLoader.hidden=false;
	document.getElementById("soPath-split").setAttribute( "state","open");
	mySP.innerHTML = "";
	
	var url="https://soemail.garm.comlab.bth.se/api/findPath/?uid="+uid;

	var msgCompFields = gMsgCompose.compFields;
	var toList = new Array();
	var ccList = new Array();
	var bccList = new Array();
	
	collectAddresses(msgCompFields, toList, ccList, bccList);
	var to = new Array();
	var from;
	
	to = Array().concat(toList, ccList, bccList);
	from = document.getElementById("msgIdentity").description;
	url += "&from=" + cleanEmail(from) + "&to=" + cleanEmail(to);
	
	dump( url + "\n" );
	
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET",url,false);
	xmlhttp.onreadystatechange = function (aEvt) {
	
	var txt;
	if(xmlhttp.responseText == "")
			txt = "No social path found.<html:br/>"
	else
	txt = injectHtml(xmlhttp.responseText);
	
	dump("Formatted response: "+txt +"\n");
	
	/* Not used *jet*
	 var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
	 var injectHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"] 
	 .getService(Components.interfaces.nsIScriptableUnescapeHTML) 
	 .parseFragment(txt, false, null, body); 
	 */
	mySP.innerHTML = txt;
	myLoader.hidden=true;
	};
	xmlhttp.send(null);
}

function injectHtml(str){
	//var returnString = "";
	//str = str.split(
	str = str.replace(/\</g,"<html:");
	str = str.replace(/br\>/g,"br/>");
	str = str.replace(/.jpg\'\>/g,".jpg'/>");
										str = str.replace(/<html:\//g,"</html:");
										str = str.replace(/CHECKED>/g,"checked=\"checked\"/>");
	str = str.replace(/&nbsp;/g,"&#160;");
	return str;
	
}

function cleanEmail(str){
	var newString = "";
	str = str.toString().split(",");
	//if();
	for(var row in str)
		str[row].indexOf("<") != -1 ? newString += str[row].substring(str[row].indexOf("<")+1,str[row].indexOf(">")) + "," : 
		newString += str[row].replace(" ","") + ",";
//	dump(newString.length + "\n");
	return newString;
}

function send_event_handler( evt ) {
	var msgcomposeWindow = document.getElementById( "msgcomposeWindow" );
	var msg_type = msgcomposeWindow.getAttribute( "msgtype" );
	
	// do not continue unless this is an actual send event
	if( !(msg_type == nsIMsgCompDeliverMode.Now || msg_type == nsIMsgCompDeliverMode.Later) )
		return;
	
	var xdsl = -1;
	
	var inputXdsl = document.getElementsByClassName("inputXdsl");
	var row = 0;
	var paths = "";
	while(true)
	{
		var inputRadio = inputXdsl[row];
		if(inputRadio==null)
			break;
		row++;
		var fieldValue = inputRadio.value;
		if(fieldValue== null)
			fieldValue = inputRadio.getAttribute("value");
		paths +=fieldValue +":";
		dump(paths+"\n");
	}
	
	//AJAX!
	var url = "https://soemail.garm.comlab.bth.se/api/registerXdsl/?uid=" + uid + "&paths=" + paths;
	
	dump( url + " -> " );
	
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET",url,false);
	xmlhttp.onreadystatechange = function (aEvt) {
	
	xdsl = xmlhttp.responseText;
	
	if(xdsl > 0)
	{
		// alter headers to include X-DSL feild.
		if( gMsgCompose.compFields.otherRandomHeaders != "" )
			gMsgCompose.compFields.otherRandomHeaders += "\n";
		gMsgCompose.compFields.otherRandomHeaders += "X-DSL: "+xdsl+"\n";
		dump("X-DSL: "+xdsl+"\n");
	}
	else
		dump(xdsl+"\n");
	};
	xmlhttp.send(null);
	return;	
}

function collectAddresses(msgCompFields, toList, ccList, bccList){
	
	if (msgCompFields == null){
		return;
	}
	var gMimeHeaderParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);
	
	var row = 1;
	while(true){
		var inputField = document.getElementById("addressCol2#" + row);
		
		if(inputField == null){
			break;
		}else{
			row++;
		}
		var fieldValue = inputField.value;
		if (fieldValue == null){
			fieldValue = inputField.getAttribute("value");
		}
		
		if (fieldValue != ""){
			
			var recipient = null;
			
			try {
				recipient = gMimeHeaderParser.reformatUnquotedAddresses(fieldValue);
			} catch (ex) {
				recipient = fieldValue;
			}
			
			var recipientType = "";
			var popupElement = document.getElementById("addressCol1#" + row);
			if(popupElement != null){
				recipientType = popupElement.selectedItem.getAttribute("value");
			}
			
			switch (recipientType){
				case "addr_to":
					toList.push(recipient);
					break;
				case "addr_cc":
					ccList.push(recipient);
					break;
				case "addr_bcc":
					bccList.push(recipient);
					break;
				default:
					toList.push(recipient);
					break;
			}
		}
	}
}


