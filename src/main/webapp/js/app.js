"use strict";

// define namespace
IMIXS.namespace("org.imixs.workflow.sample.app");

// define core module
IMIXS.org.imixs.workflow.sample.app = (function() {
	if (!BENJS.org.benjs.core) {
		console.error("ERROR - missing dependency: benjs.js");
	}
	if (!IMIXS.org.imixs.core) {
		console.error("ERROR - missing dependency: imixs-core.js");
	}
	if (!IMIXS.org.imixs.xml) {
		console.error("ERROR - missing dependency: imixs-xml.js");
	}
	if (!IMIXS.org.imixs.ui) {
		console.error("ERROR - missing dependency: imixs-ui.js");
	}
	if (!IMIXS.org.imixs.workflow) {
		console.error("ERROR - missing dependency: imixs-workflow.js");
	}

	var benJS = BENJS.org.benjs.core, 
		imixs = IMIXS.org.imixs.core, 
		imixsXML = IMIXS.org.imixs.xml, 
		imixsUI = IMIXS.org.imixs.ui, 
		imixsWorkflow = IMIXS.org.imixs.workflow,
		
	/***************************************************************************
	 * 
	 * MODELS
	 * 
	 **************************************************************************/

	/* WorklistController */
	Worklist = function() {
		this.query = "SELECT entity FROM Entity entity where entity.type='workitem' ORDER BY entity.modified DESC";
		this.view;
		this.start = 0;
		this.count = 10;
		this.$activityid = 0;
		this.selectedUniqueID;
	},

	/* WorklistController */
	Workitem = function(itemarray) {
		imixs.ItemCollection.call(this, itemarray);
		this.id = '';
 
		/* Example computed value: return summary or subject */
		this.getSummary = function() {
			var val = this.getItem("txtworkflowsummary");
			if (!val)
				val = this.getItem("subject");
			if (!val)
				val = " - no title - ";
			return val;
		}

	},

	/***************************************************************************
	 * 
	 * CONTROLLERS
	 *  
	 **************************************************************************/

	worklistController = benJS.createController({
		id : "worklistController",
		model : new Worklist()
	}),

	workitemController = benJS.createController({
		id : "workitemController",
		model : new Workitem(),
		afterPull : function(controller, context) {
			// convert date objects into ISO 8601 format
	 		imixsUI.convertDateTimeInput(controller.model);
	
		},
		afterPush : function(controller, context) {
			// jquery-ui
			$(context).imixsLayout();
			
			imixsUI.layoutActivities({
				context : "#workitem_activities",
				workitem : workitemController.model,
				styleClass : "btn",
				onclick : function() {
					workitemController.pull();
				},
				onsuccess : function() {
					workitemController.push();
				},
				onerror : function() {
					alert('process failed');
				}
			
			})
		}
	}),

	/***************************************************************************
	 * 
	 * ROUTES & TEMPLATES
	 * 
	 **************************************************************************/

	worklistRoute = benJS.createRoute({
		id : "worklist-route",
		templates : {
			"content" : "view_worklist.html"
		},
		afterRoute : function(router) {
			worklistController.loadWorklist();
		}
	}),

	workitemRoute = benJS
			.createRoute({
				id : "workitem-route",
				templates : {
					"content" : "view_workitem.html"
				}
	}),

	contentTemplate = benJS.createTemplate({
		id : "content",
		afterLoad : layoutSection
	}),

	/**
	 * Start the ben Application
	 */
	start = function() {
		console.debug("starting application...");

		// init service base URL
		imixsWorkflow.serviceURL = "/imixs-script/rest-service";

		// start view
		benJS.start({
			"loadTemplatesOnStartup" : false
		});

		worklistRoute.route();
		$("#imixs-error").hide();

		// set default date format
		imixsUI.dateFormat = 'dd.mm.yy';
	};

	/* Custom method to load a single workitem */
	workitemController.loadWorkitem = function(context) {

		// get workitem out of view model....
		var entry = $(context).closest('[data-ben-entry]');
		var entryNo = $(entry).attr("data-ben-entry");
		var workitem = new imixs.ItemCollection(
				worklistController.model.view[entryNo].item);
		worklistController.model.selectedUniqueID = workitem
				.getItem('$uniqueid');

		imixsWorkflow.loadWorkitem({
			uniqueID : worklistController.model.selectedUniqueID,
			success : function(workitem) {
				workitemController.model.item = workitem.item;
				workitemRoute.route();
			},
			error : function(jqXHR, error, errorThrown) {
				$("#error-message").text(errorThrown);
				$("#imixs-error").show();
			}
		})

	}

	/*
	 * Loads the workList. The method loads only a subset of attributes defined
	 * by the query param 'items'
	 */
	worklistController.loadWorklist = function() {
		worklistController.pull();

		imixsWorkflow.loadWorklist({
			service : "/workflow/worklist",
			sortorder : 2,
			start : worklistController.model.start,
			count : worklistController.model.count,
			items : [ '$uniqueid', 'txtworkflowsummary', '$creator', 'txtsubject',
					'$modified', 'txtworkflowstatus', 'namcurrenteditor', 'namowner' ],
			success : function(entities) {
				worklistController.model.view = entities;
				// push content
				worklistController.push();
			},
			error : function(jqXHR, error, errorThrown) {
				$("#error-message").text(errorThrown);
				$("#imixs-error").show();
			}
		});

	}

	// public API
	return { 
		Workitem : Workitem,
		workitemController : workitemController,
 		worklistRoute : worklistRoute,
 		start : start
	};

}());

function layoutSection(templ, context) {

	// $(context).i18n();
	$("#imixs-error").hide();

	// jquery-ui
	$(context).imixsLayout();

	// layout tinymce
	$('textarea.imixs-editor').tinymce({
	// options
	});

};

var app = IMIXS.org.imixs.workflow.sample.app;
 
$(document).ready(function() {
	// add ajax waiting feature
	var $body = $("body");
	$(document).on({
		ajaxStart : function() { 
			$body.addClass("loading");
		},
		ajaxStop : function() {
			$body.removeClass("loading");
		}
	});
	// start sample application
	app.start();

});

