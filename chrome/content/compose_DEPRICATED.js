var dispSoThunder = false;

function showSoThunder(){
	dispSoThunder = !dispSoThunder;
	document.getElementById("menu_viewSoThunder").checked = dispSoThunder;
	document.getElementById("soPath-box").hidden = !dispSoThunder;
}

function findPaths( evt ) {
	var url="http://cyrus.cs.ucdavis.edu/~fer/findpaths.php?uid="+uid; //should not be hardcoded but gathered from prefPane.
/*	if(document.compose.send_to.value != ""){
		url+= "&send_to=" + document.compose.send_to.value;
	}
	if(document.compose.send_to_cc.value != ""){
		url+= "&send_to_cc=" + document.compose.send_to_cc.value;
	}
	if(document.compose.send_to_bcc.value != ""){
		url+= "&send_to_bcc=" + document.compose.send_to_bcc.value;
	}
*/
	var msgCompFields = gMsgCompose.compFields;
	var toList = new Array();
	var ccList = new Array();
	var bccList = new Array();

	collectAddresses(msgCompFields, toList, ccList, bccList);
/*	dump("[TO] "+ toList + "\n");
	dump("[CC] "+ ccList + "\n");
	dump("[BCC] "+ bccList + "\n");
*/
	var to = new Array();
	var from;
	
	to = Array().concat(toList, ccList, bccList);
	from = document.getElementById("msgIdentity").description;
	url += "&send_from=" + from + "&send_to=" + to;
	
	dump( url + "\n" );
	
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET",url,false);
	xmlhttp.send(null);

	var txt = injectHtml(xmlhttp.responseText);
	
	dump("Formatted response: "+txt +"\n");

/* Not used *jet*
	var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
	var injectHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"] 
	.getService(Components.interfaces.nsIScriptableUnescapeHTML) 
	.parseFragment(txt, false, null, body); 
*/
	var win = document.getElementById("SP");
	
	if (win)
		win.innerHTML = txt;
}

function injectHtml(str)
{
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

function cleanEmail(str)
{
	var newString = "";
	str = str.split(",");
	//if();
	for(var row in str)
		str[row].indexOf("<") != -1 ? newString += str[row].substr(str[row].indexOf("<")+1,str[row].indexOf(">")-3) : 
			newString += str[row];
	return newString;
}

function send_event_handler( evt ) {
	alert("send_event_handler FER");
	var msgcomposeWindow = document.getElementById( "msgcomposeWindow" );
	var msg_type = msgcomposeWindow.getAttribute( "msgtype" );
	
		// do not continue unless this is an actual send event
	if( !(msg_type == nsIMsgCompDeliverMode.Now || msg_type == nsIMsgCompDeliverMode.Later) )
		return;
	
	var xdsl = -1;
	
	var inputXdsl = document.getElementsByClassName("inputXdsl");
	alert(inputXdsl);
	var row = 0;	
	while(true)
	{
		var inputRadio = inputXdsl[row];
		alert(inputRadio);
		if(inputRadio==null)
			break;
		alert(inputRadio);
		row++;
		
		var fieldValue = inputRadio.value;
		
		if(fieldValue== null)
			fieldValue = inputRadio.getAttribute("value");
		
		alert(fieldValue);
	}
	
		// alter headers to include X-DSL feild.
	if( gMsgCompose.compFields.otherRandomHeaders != "" )
		gMsgCompose.compFields.otherRandomHeaders += "\n";
	gMsgCompose.compFields.otherRandomHeaders += "X-DSL: "+xdsl+"\n";
	
	return false;
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


// could use document.getElementById("msgcomposeWindow") instead of window
//document.getElementById("findSocialPaths").addEventListener('command', findPaths, true);
window.addEventListener( "compose-send-message", send_event_handler, true );