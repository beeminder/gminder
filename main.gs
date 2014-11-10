// Send inbox (and snoozed email) size to Beeminder.
// by Daniel Reeves and Lillian Karabaic
// ------------------------------------------------------------ (80 chars) ---->

// CHANGEME
//var YOOG = "d/snooze";  // username/goalname to send data to
var DISC = 0.36/365.25; // daily discount rate for snoozed mail


// Create a new trigger that calls a function daily at a given time (HH:MM)
function trig(f, h, m) {
  ScriptApp.newTrigger(f).timeBased().atHour(h).nearMinute(m).everyDays(1)
    .create();
}

// Show the date and time
function shdt() {
  var d = new Date();
  var da = new Array("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT");
  var day = da[d.getDay()];
  var hour = d.getHours();
  if(hour<10) hour = "0"+hour;
  var min = d.getMinutes();
  if(min<10) min = "0"+min;
  return day+" "+hour+":"+min;
}

// http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equa
function arraysEqual(a, b) {
  if(a === b) return true;
  if(a == null || b == null) return false;
  if(a.length != b.length) return false;
  a.sort();
  b.sort();
  for(var i = 0; i < a.length; i++) { if(a[i] !== b[i]) return false; }
  return true;
}

// Special function that gets run when this is deployed as a web app
function doGet() {  
  var app = UiApp.createApplication();
  var form = app.createFormPanel();
  var flow = app.createFlowPanel();
  app.add(app.createHTML(
    "<div class=\"container\" style=\"font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; margin:40px;\">" + 
    "<h1>Enter your username/goalname</h1>"
  ));
  flow.add(app.createTextBox().setName("yoog"));
  flow.add(app.createSubmitButton("Submit"));
  form.add(flow);
  app.add(form);
  app.add(app.createHTML("</div>"));
  return app;
}

function doPost(eventInfo) {
  var yoog = eventInfo.parameter.yoog;
  ScriptProperties.setProperty("yoog", eventInfo.parameter.yoog);

  var app = UiApp.getActiveApplication();
  app.add(app.createHTML(
    "<div class=\"container\" style=\"font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; margin:40px;\">" + 
    "<h1>Your Gmail inbox (and snoozed email) is being minded!</h1> " + 
    "<h2>What's going on?</h2>" + 
    "<p>" + 
    "Roughly hourly during the day, this script will send the total size " + 
    "of your inbox to " + 
    "beeminder.com/" + yoog + ". " + 
    "Also, if you use " +
    "Gmail Snooze (messymatters.com/snooze) then it " + 
    "will count snoozed messages as well." + 
    "</p>" + 
    "</div>"));

  //app.add(app.createLabel("Form submitted. The text box's value was '" +
  //     eventInfo.parameter.yoog + "'."));
  
  var t = ScriptApp.getProjectTriggers(); // was getScriptTriggers
  if(arraysEqual(t.map(function(x){ return x.getHandlerFunction(); }), 
                 ["lily"])) {
    Logger.log("Triggers already set up");
  } else { // delete all triggers from last time we ran this script
    var n = t.length;
    for(var i=0; i < n; i++) {
      Logger.log("Deleting trigger: id "+t[i].getUniqueId()
                       +", source "     +t[i].getTriggerSourceId()
                       +", func "       +t[i].getHandlerFunction()
                       +", eventtype "  +t[i].getEventType());
      //if(t[i].getTriggerSource() == ScriptApp.EventType.CLOCK) {}
      ScriptApp.deleteTrigger(t[i]);
    }
    //ScriptApp.newTrigger("lily").timeBased().everyHours(1).create();
    trig("lily", 09,00);
    trig("lily", 10,00);
    trig("lily", 11,00);
    trig("lily", 12,00);
    trig("lily", 13,00);
    trig("lily", 14,00);
    trig("lily", 15,00);
    trig("lily", 16,00);
    trig("lily", 17,00);
    trig("lily", 18,00);
    trig("lily", 19,00);
    trig("lily", 20,00);
    trig("lily", 21,00);
    trig("lily", 22,00);
    trig("lily", 23,00);
    trig("lily", 00,00);
    trig("lily", 01,00);
    trig("lily", 02,00);
    trig("lily", 02,59);
  }
  
  //return HtmlService.createTemplateFromFile('allset').evaluate();
  return app;
}

// Return labels that are (nonnegative) integers, sorted numerically
function intlabels() {
  var l = GmailApp.getUserLabels();
  var ls = l.map(function(x){ return x.getName(); }); // label names (strings)
  var nh = {}; // name hash: maps string name of the label to label object
  for(var i = 0; i < l.length; i++) nh[ls[i]] = l[i];
  var re = new RegExp('^\\d+$');
  return ls.filter(function(x){ return x.match(re); })
   .sort(function(a,b){ parseInt(a) - parseInt(b); })
   .map(function(x){ return nh[x]; });
}

// Return the total number of threads for a label l
function threadCount(l) {
  tot = 0;
  var page 
  do {
    page = l.getThreads(0,100);
    tot += page.length;
  } while(page.length==100);
  return tot;
}

function lily() {
  var all = intlabels();
  var ns = 0; // number snoozed
  var nps = 0; // like NPV but net present number snoozed
  var i, n; // label number, message count for label i
  for(var li = 0; li < all.length; ++li) {
    i = parseInt(all[li].getName());
    n = threadCount(all[li]);
    ns += n;
    nps += n*Math.exp(-DISC*i);
  }
  nin = GmailApp.search('in:inbox').length; // number in inbox
  ninu = GmailApp.getInboxUnreadCount();    // number in inbox unread
  ninr = nin-ninu;                          // number in inbox read
  MailApp.sendEmail("bot@beeminder.com", ScriptProperties.getProperty("yoog"), 
                    "^ "+(nin+nps)+
                    " \"auto-entered by Gminder ("+
                      ninu+" unread + "+
                      ninr+" read = "+
                      nin+" inbox + "+
                      ns+" snoozed)\"");
}

// ------------------------------------------------------------ (80 chars) ---->
