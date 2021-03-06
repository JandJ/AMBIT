//background position functions
var $ = jQuery;
function getBgPosY(elem) {
	var bgPos = $(elem).css('backgroundPosition');
	if(bgPos) {
		return bgPos.split(" ")[1];
	}
}
function setBgPosY(elem, pos) {
	var bgPos = $(elem).css('backgroundPosition'),
		posX;
	if(bgPos) {
		posX = bgPos.split(" ")[0];
		$(elem).css('backgroundPosition', posX+" "+pos);
	}
}
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
function positionPage(open) {
	var newLeft,
		viewportWidth = $(window).width(),
		sidebarWidth,
		sidebarGutter = 30,
		paperWidth = 720,
		sidePanelWidth = 210;
	if(open) {
		sidebarWidth = 10;
	} else {
		sidebarWidth = 270;
	}
	if(viewportWidth >= sidebarWidth + paperWidth + sidePanelWidth) {
		// center paper between sidebar and sidePanel
		newLeft = (sidebarWidth+sidebarGutter)/2 + (viewportWidth-paperWidth-sidePanelWidth)/2;
	} else if(viewportWidth >= sidebarWidth + paperWidth) {
		// stick paper to sidebar
		newLeft = sidebarWidth;
	} else {
		// let paper move to left side
		newLeft = viewportWidth - paperWidth;
		if(newLeft < 0) {
			newLeft = 0;
		}
	}
	if(newLeft) {
		$('#screenWidth').stop(true,true).animate( {
			left: newLeft
		}, 200);
	}
}

// the sidebar

$('#sidebarIcons').click(function(e) {
	e.preventDefault();
	var curLeft = parseInt($('#sidebar').css('left'),10),
		open = curLeft===0,
		$target = $(e.target),
		$panel = $('#sidebar').find('.panel').eq($target.index()-1);
	if($target.attr('id')==="toggle") {				
		$('#sidebar').animate( {
			left: open ? "-260px" : "0px"
		}, 200);
		// determine whether the screen is wide enough to centre between the statuspanel and sidebar
		positionPage(open);
		setBgPosY('#toggle', open ? "-540px" : "-490px");
	} else {
		if(!open) {
			$('#toggle').click();
		}
		if($target.attr('id')==="search") {
			$('#searchBox').find('input').click().focus();
		} else {
			if($panel.hasClass("closed")) {
				$panel.children('h2').click();
			}
		}
	}
});

// keep Currently Open count up-to-date
function updateCurrentlyOpenCounter(e, closing) {
	var count = $('#contentWrapper .tiddler').length;
	if(closing) {
		count -= 1;
	}
	if(count<0) {
		count=0;
	}
	$('#sidebarIcons #current span').each(function() {
		if(!count) {
			$(this).hide().text('');
		} else {
			$(this).show().text(count);
		}
	});
}
updateCurrentlyOpenCounter();
$(document).bind("StoryUpdated", updateCurrentlyOpenCounter);

$(window).resize(function() {
	delay(function() {
		var open = parseInt($('#sidebar').css('left'),10)!==0;
		positionPage(open);
	}, 500);
});

/*
	sidebar toggle 
		always toggles sidebar in/out

	click on icon
		if sidebar is open  
			opens accordion section
		if sidebar is closed 
			opens accordion section and sidebar
		
	
	-width
		find screen width
		when sidebar opens
			change #screenWidth to be screen width minus the width of the sidebar
		when sidebar closes
			vice versa
			
		240
		
		if the #screenwidth is large enough for the statuspanel to not overlap the tiddlers
			centre the tiddler content between the statuspanel and the extended sidebar
		
		is the screenwidth wide enough? 
			statuspanel+padding = 240px
			sidebar+padding 	= 300px
			tiddler				= 720px
			
			Total				= 1260px
			
			so if viewport width is 1260+, add right:240px and width:-240 to #screenWidth 
			
			if sidebar is closed and width is 1000+, add right:240px and width:-240 to #screenWidth 

*/


/* 
the accordion generic click behaviour
principle: make the sidebar handle clicks;
if click on panel>h2 or input, toggle accordion stage, unless noToggle exists on panel
*/

var viewportHeight = $(window).height() / 3;
$('#sidebar .panel').not('.closed').find('ul.browsingTool').height(viewportHeight);

$('#sidebar .panel').click(function(e) {
	var $target = $(e.target),
		$panel = $(this),
		panelClosed = $panel.hasClass('closed'),
		$otherPanels = $(this).siblings('.panel');

	if(!$target.is('input[type=search], h2') && !$target.parent().is('h2')) {
		return true;
	}

	// close other panels
	$otherPanels.each(function() {
		var $panel = $(this),
			$ul = $panel.find('ul.browsingTool'),
			panelClosed = $panel.hasClass('closed');
		if($ul.length && !panelClosed) {
			$ul.stop().animate({
				height: 0
			}, function() {
				$panel.addClass('closed');
			});
			setBgPosY($panel.find('h2'), "-391px");
		}
	});
	
	// toggle this panel
	if($panel.hasClass('noToggle')) {
		return;
	}
	$panel.find('.browsingTool').animate({
		height: panelClosed ? viewportHeight : 0
	}, function() {
		$panel.toggleClass('closed');
	});
	setBgPosY($panel.find('h2'), panelClosed ? "-437px" : "-391px");
});


// the info toggle

$('.infoToggle a').live('click', function() {
	$(this).parent().siblings('div.info').slideToggle(200, function() {
		if ($(this).is(':visible')) {
			$('.infoToggle a span').text('-');
		} else {
			$('.infoToggle a span').text('+');
		}
	});
	return false;
});

// the status panel timeout

window.setTimeout(function() {
	if($('#statusTab span').hasClass('panelOpen')) {
		$('#statusTab span').click();
	}
},5000);

// the status panel overall toggle

$('#statusTab span').live('click', function() {
	var $clicked = $(this);
	if($clicked.hasClass('panelOpen')) {
		$('#rightPanel').animate({'right': '-210px'}, 100);
	} else {
		$('#rightPanel').animate({'right': '0px'}, 100);
	}
	$clicked.toggleClass('panelOpen');
});


// the status panel internal toggles
$('#statusPanel a').live('click', function() {
	var $clicked = $(this);
	if($clicked.hasClass('current')) {
		$clicked.parent().next().slideToggle(100);
		$clicked.toggleClass('open');
	}
});
$('#statusPanel #modeStatus a').live('click', function(e) {
	e.preventDefault();
	var $clicked = $(this),
		$dropDownContainer,
		$current;
	if(!$clicked.hasClass('current')) {
		$dropDownContainer = $clicked.closest('.dropDown');
		$current = $dropDownContainer.prev().children('.current');
		$clicked.insertBefore($current).addClass('current');
		$current.prependTo($dropDownContainer).removeClass('current');
	}
	
	// handle advanced toggling
	if($clicked.hasClass('advanced')) {
		if(!backstage.isVisible()) {
			backstage.show();
			$('#app-picker').show().css({'visibility':'visible'});
		}	
	} else {
		if(backstage.isVisible()) {
			backstage.hide();
			$('#app-picker').hide().css({'visibility':'hidden'});
		}
	}
	if($clicked.hasClass('browsing')) {
		readOnly = true;
		refreshElements(document.getElementById('tiddlerDisplay'));
		$('#statusTab span').addClass('browsing');
	} else {
		if(readOnly) {
			readOnly = false;
			refreshElements(document.getElementById('tiddlerDisplay'));
			$('#statusTab span').removeClass('browsing');
		}		
	}
});

$('#statusPanel').mouseleave(function() {
	if ($('div.dropDown').is(':visible')) {
		$('div.dropDown').slideUp(100);
		$('#statusPanel a.current').removeClass('open');
	}
});


// login/logout box
function updateAccountDisplay(name) {
	var $status = $('#statusPanel #accountStatus'),
		$title =  $status.children('.title'),
		$current = $status.children('.value').children('.current'),
		$dropDown = $status.children('.dropDown');
	if(!name) {
		$title.text('Not logged in');
		$current.text('').css('visibility','hidden');
	} else {
		$title.text('Logged in as:');
		$current.text(name).css('visibility','visible');
	}
}
function addLoginForm() {
	var $loginForm = $('#loginForm').show();
}
function disableModeToggle() {
	$('#statusPanel #modeStatus a').click(function() {
		return false;
	});
}

config.extensions.tiddlyweb.getUserInfo(function(info) {
	var anon = info.anon,
		name = info.name;
	if(anon) {
		disableModeToggle();
		updateAccountDisplay();
		addLoginForm();
	} else {
		updateAccountDisplay(name);
	}
});

$('#statusPanel #accountStatus form').submit(function(e) {
	e.preventDefault();
	var token = config.extensions.tiddlyspace.getCSRFToken();
	this.action += "?csrf_token="+token;
	this.submit();
});

// sidebar links
createTiddlyLink($('#feedback').get(0),'Feedback please!',true);
createTiddlyLink($('#manualizingOurWork').get(0),'+ Manualize our work',true);


