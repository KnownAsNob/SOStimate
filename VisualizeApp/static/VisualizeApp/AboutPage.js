var coll = document.getElementsByClassName("faq_question");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      content.style.display = "none";
    } else {
    	content.style.display = "block";
     	content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

//Create cookie
function setCookie(cname, cvalue, exdays) 
{
  var opts = document.getElementById('textSelectorDrop').options;

  //Delete other cookie
  document.cookie = "TextSize= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";

  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

  //console.log("[Accessibility] " + cname + " cookie updated to " + cvalue);
  location.reload(); 
}