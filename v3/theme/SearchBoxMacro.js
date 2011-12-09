/*{{{*/
var $ = jQuery;

config.macros.searchBox = {
	handler: function(place, macroName, params) {
		var $input = $('<input type="search" results="5" accessKey="4" autocomplete="off" autosave="unique" name="s" placeholder="Search" lastSearchText="" />').appendTo(place),
			$clearButton = $('<button id="clearSearch">&#215;</button>'),
			input = $input.get(0);
		if(config.browser.isSafari) {
			$input.css({
				height: '28px',
				width: '230px',
				'background-image': 'none',
				'-webkit-appearance': 'none'
			});
		} else {
			$clearButton.appendTo(place)
				.click(function() {
					var $searchBox = $('#searchBox');
					$clearButton.hide();
					$input.val('').click();
				});
			$input.keyup(function() {
				if($(this).val()) {
					$('#clearSearch').show();
				} else {
					$('#clearSearch').click();
				}
			});
		}
		input.onkeyup = config.macros.search.onKeyPress;
		input.onfocus = config.macros.search.onFocus;
		
		/*
		this is adding specific behaviour that happens before click on panels are processed
		if click on input and there are search results, add noToggle
		if click on input and there are no search results, remove noToggle
		if keyup and there is nothing in the search string, click on input
		*/
		$input.click(function() {
			var $searchBox = $('#searchBox'),
				$ul = $('#searchBox').find('ul.browsingTool'),
				$results = $ul.children('li');
			if($results.length) {
				$searchBox.addClass('noToggle');
			} else {
				$searchBox.removeClass('noToggle');
			}
		}).keyup(function() {
			// if we've started typing without clicking on the search box, it won't have opened
			if($('#searchBox').hasClass('closed')) {
				$(this).click();
			}
			// if empty, click to open
			if(!$input.val()) {
				$input.click();
			}
		});
		
		$('<ul class="browsingTool" id="searchResults"></ul>').appendTo(place);
	}
};

/* aiming for:
<input type="text" placeholder="Search" />
<button id="clearSearch">&#215;</button>
<ul class="browsingTool">
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
	<li><a href="#">Object</a></li>
</ul>
*/

//--
//-- Search macro
//--

config.macros.search.handler = function(place,macroName,params)
{
	var searchTimeout = null;
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,"searchButton");
	var txt = createTiddlyElement(null,"input",null,"txtOptionInput searchField");
	if(params[0])
		txt.value = params[0];
	if(config.browser.isSafari) {
		txt.setAttribute("type","search");
		txt.setAttribute("results","5");
	} else {
		txt.setAttribute("type","text");
	}
	place.appendChild(txt);
	txt.onkeyup = this.onKeyPress;
	txt.onfocus = this.onFocus;
	txt.setAttribute("size",this.sizeTextbox);
	txt.setAttribute("accessKey",params[1] || this.accessKey);
	txt.setAttribute("autocomplete","off");
	txt.setAttribute("lastSearchText","");
};

// Global because there's only ever one outstanding incremental search timer
config.macros.search.timeout = null;

config.macros.search.doSearch = function(txt)
{
	if(txt.value.length > 0) {
		story.search(txt.value,config.options.chkCaseSensitiveSearch,config.options.chkRegExpSearch);
		txt.setAttribute("lastSearchText",txt.value);
	}
};

config.macros.search.onClick = function(e)
{
	config.macros.search.doSearch(this.nextSibling);
	return false;
};

config.macros.search.onKeyPress = function(ev)
{
	var e = ev || window.event;
	switch(e.keyCode) {
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
			config.macros.search.doSearch(this);
			break;
		case 27: // Escape
			this.value = "";
			clearMessage();
			break;
	}
	if(config.options.chkIncrementalSearch) {
		if(this.value.length > 2) {
			if(this.value != this.getAttribute("lastSearchText")) {
				if(config.macros.search.timeout)
					clearTimeout(config.macros.search.timeout);
				var txt = this;
				config.macros.search.timeout = setTimeout(function() {config.macros.search.doSearch(txt);},500);
			}
		} else {
			if(config.macros.search.timeout)
				clearTimeout(config.macros.search.timeout);
		}
	}
	return true;
};

config.macros.search.onFocus = function(e)
{
	this.select();
};



/*}}}*/