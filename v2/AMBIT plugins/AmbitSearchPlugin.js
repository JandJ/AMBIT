/***
|''Name''|AmbitSearchPlugin|
|''Description''|based on SimpleSearchPlugin by FND|
|''Authors''|Jonathan Lister|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://ambit-plugins.tiddlyspace.com/AmbitSearchPlugin|
|''License''|[[MIT|http://www.opensource.org/licenses/mit-license.php]]|
|''Keywords''|search|

Note: this does not add styles - there are sample styles in http://ambit-theme.tiddlyspace.com/Stylesheet

!Code
***/
//{{{
if(!version.extensions.AmbitSearchPlugin) { //# ensure that the plugin is only installed once
version.extensions.AmbitSearchPlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; }

var $ = jQuery;

config.extensions.AmbitSearchPlugin = {
	heading: "Search Results",
	containerId: "searchResults",
	btnCloseLabel: "close",
	btnCloseTooltip: "dismiss search results",
	btnCloseId: "search_close",
	btnOpenLabel: "Open all",
	btnOpenTooltip: "open all search results",
	btnOpenId: "search_open",

	displayResults: function(matches, query) {
		story.refreshAllTiddlers(true); // update highlighting within story tiddlers
		window.scrollTo(0,0);
		query = '"""' + query + '"""'; // prevent WikiLinks
		var $container = $('<div id="'+this.containerId+'"><div class="jbasewrap"><div class="overlay"></div></div></div>').insertAfter('#header'),
			el = $container.find('.overlay').get(0),
			msg = "!" + this.heading + "\n";
		if(matches.length > 0) {
			msg += "''" + config.macros.search.successMsg.format([matches.length.toString(), query]) + ":''\n";
			this.results = [];
			for(var i = 0 ; i < matches.length; i++) {
				this.results.push(matches[i].title);
				msg += "* [[" + matches[i].title + "]]\n";
			}
		} else {
			msg += "''" + config.macros.search.failureMsg.format([query]) + "''"; // XXX: do not use bold here!?
		}
		createTiddlyButton(el, this.btnCloseLabel, this.btnCloseTooltip, config.extensions.AmbitSearchPlugin.closeResults, "button", this.btnCloseId);
		createTiddlyButton(el, this.btnOpenLabel, this.btnOpenTooltip, config.extensions.AmbitSearchPlugin.openAll, "button", this.btnOpenId);
		wikify(msg, el);
		createTiddlyButton(el, this.btnCloseLabel, this.btnCloseTooltip, config.extensions.AmbitSearchPlugin.closeResults, "button", this.btnCloseId);
		createTiddlyButton(el, this.btnOpenLabel, this.btnOpenTooltip, config.extensions.AmbitSearchPlugin.openAll, "button", this.btnOpenId);
		$container.click(function(e) {
			if($(e.target).hasClass('tiddlyLink')) {
				config.extensions.AmbitSearchPlugin.closeResults();
			}
			return false;
		});
	},

	closeResults: function() {
		var el = document.getElementById(config.extensions.AmbitSearchPlugin.containerId);
		removeNode(el);
		config.extensions.AmbitSearchPlugin.results = null;
		highlightHack = null;
	},

	openAll: function(ev) {
		story.displayTiddlers(null, config.extensions.AmbitSearchPlugin.results);
		return false;
	}
};

// override Story.search()
Story.prototype.search = function(text, useCaseSensitive, useRegExp) {
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(), useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack, null, "excludeSearch"),
		q = useRegExp ? "/" : "'";
	config.extensions.AmbitSearchPlugin.displayResults(matches, q + text + q);
};

// override TiddlyWiki.search() to sort by relevance
TiddlyWiki.prototype.search = function(searchRegExp, sortField, excludeTag, match) {
	var candidates = this.reverseLookup("tags", excludeTag, !!match),
		primary = [],
		secondary = [],
		tertiary = [],
		t,
		results;
	for(t = 0; t < candidates.length; t++) {
		if(candidates[t].title.search(searchRegExp) != -1) {
			primary.push(candidates[t]);
		} else if(candidates[t].tags.join(" ").search(searchRegExp) != -1) {
			secondary.push(candidates[t]);
		} else if(candidates[t].text.search(searchRegExp) != -1) {
			tertiary.push(candidates[t]);
		}
	}
	results = primary.concat(secondary).concat(tertiary);
	if(sortField) {
		results.sort(function(a, b) {
			return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);
		});
	}
	return results;
};

} //# end of "install only once"
//}}}