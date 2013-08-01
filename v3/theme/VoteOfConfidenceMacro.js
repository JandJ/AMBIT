/*{{{*/

/*
	What we're doing
		- go find all content that is cloned from this space (on init)
		- when running the macro, try to find this tiddler in the content
			- if found, show count of tiddlers
		- when you click on the count, open up a popup with the information:
			- title of tiddler / space / date cloned

*/

var voteOfConfidenceMacro = config.macros.voteOfConfidence = {
	/* Vote of Confidence macro checks how many times a tiddler has been cloned and display some information about those clones. */
	searchURL: '/search.json?fat=1&q=',
	clonedTiddlers: [],
	init: function() {
		var plugin = config.macros.communityOfPractice,
			$ = jQuery,		
			whitelist = store.getTiddler('AMBIT community of practice - members').text.split('\n'),
			bagFilters = [],
			currentSpace = config.extensions.tiddlyspace.currentSpace.name,
			url = "http://tiddlyspace.com/search?q=tiddler.source:"+currentSpace;

		$.ajax({
			url: url,
			dataType: "json",
			success: function(tiddlers) {
				// make sure we are not including any non-ambit tiddlers
				tiddlers = $.grep(tiddlers, function(t, i) {
					return t.bag.indexOf('ambit')!==-1;
				});
				// index all the cloned tiddlers by title
				$.each(tiddlers, function(i, tiddler) {
					var title = tiddler.title;
					if(!plugin.clonedTiddlers[title]) {
						plugin.clonedTiddlers[title] = [];
					}
					plugin.clonedTiddlers[title].push(tiddler);
				});
			},
			error: function() {
				// TO-DO: decide what to do in the event of an error
			}
		});
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var plugin = config.macros.communityOfPractice,
			$ = jQuery,
			$place = $(place),
			title = tiddler.title,
			clones = plugin.clonedTiddlers[title],
			clonedCount = clones && clones.length;
		if(!clonedCount) {
			return;
		}
		$place.html('<a href="#">cloned '+clonedCount+' times</a>')
			.children('a')
			.click(function(e) {
				e.preventDefault();
				var popup = Popup.create(this),
					$popup = $(popup),
					htmlPieces = ["<div>"];
				$.each(clones, function(i, t) {
					"<div class='grid2col left'></div><div class='grid2col left'></div><div class='grid2col left'></div><br class='clearboth' />"
				});
				htmlPieces.push("</div>");
				html = htmlPieces.join("\n");
				$(html).appendTo($popup);
				Popup.show();
				return false;
			});
	}
};
/*}}}*/