"use strict";

// define namespace
IMIXS.namespace("org.imixs.workflow.adminclient");

// define core module
IMIXS.org.imixs.workflow.adminclient = (function() {
	if (!BENJS.org.benjs.core) {
		console.error("ERROR - missing dependency: benjs.js");
	}
	if (!IMIXS.org.imixs.core) {
		console.error("ERROR - missing dependency: imixs-core.js");
	}
	if (!IMIXS.org.imixs.xml) {
		console.error("ERROR - missing dependency: imixs-xml.js");
	}

	var benJS = BENJS.org.benjs.core, imixs = IMIXS.org.imixs.core, imixsXML = IMIXS.org.imixs.xml,
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
	},

	/* WorklistController */
	Workitem = function(itemarray) {
		imixs.ItemCollection.call(this, itemarray);
		this.id = '';

		
		/* return summary or txtname */
		this.getSummary = function() {
			var val = this.getItem("txtworkflowsummary");
			if (!val)
				val = this.getItem("txtname");
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
		model : new Workitem()
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
			$("#imixs-nav ul li").removeClass('active');
			$("#imixs-nav ul li:nth-child(2)").addClass('active');
			worklistController.loadWorklist();
		}
	}),

	workitemRoute = benJS.createRoute({
		id : "workitem-route",
		templates : {
			"content" : "view_workitem.html"
		},
		afterRoute : function(router) {
			$("#imixs-nav ul li").removeClass('active');
			$("#imixs-nav ul li:nth-child(2)").addClass('active');
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

		// start view
		benJS.start({
			"loadTemplatesOnStartup" : false
		});

		worklistRoute.route();
		$("#imixs-error").hide();
	};

	/* Custom method to process a single workitem */
	workitemController.processWorkitem = function(workitem) {

		var xmlData = imixsXML.json2xml(workitem);
		// console.debug(xmlData);
		console.debug("process workitem: '" + workitem.getItem('$uniqueid')
				+ "'...");

		var url = "";
		url = url + "/workflow/rest-service/workflow/workitem/";

		$.ajax({
			type : "POST",
			url : url,
			data : xmlData,
			contentType : "text/xml",
			dataType : "xml",
			cache : false,
			error : function(jqXHR, error, errorThrown) {
				var message = errorThrown;
				var json = imixsXML.xml2json(jqXHR.responseXML);
				var workitem = new Workitem(json);
				workitemController.model.item = json.entity.item;
				var uniqueid = workitem.getItem('$uniqueid');
				var error_code = workitem.getItem('$error_code');
				var error_message = workitem.getItem('$error_message');

				printLog("<br />" + uniqueid + " : " + error_code + " - "
						+ error_message, true);

				$("#error-message").text("BulkUpdate failed");
				$("#imixs-error").show();
			},
			success : function(xml) {
				printLog(".", true);
			}
		});

	};

	
	/* Custom method to load a single workite */
	workitemController.loadWorkitem = function(context) {

		var entry = $('span', context);
		if (entry.length == 1) {

			var id = $(entry).text();

			workitemController.model.id = id;
		}

		console
				.debug("load workitem: '" + workitemController.model.id
						+ "'...");

		var url = "";
		url = url + "/workflow/rest-service/workflow/workitem/" + workitemController.model.id;

		$.ajax({
			type : "GET",
			url : url,
			dataType : "xml",
			success : function(response) {
				console.debug(response);
				workitemController.model.item = imixsXML.xml2entity(response);
				workitemRoute.route();
				//workitemController.push();
			},
			error : function(jqXHR, error, errorThrown) {
				$("#error-message").text(errorThrown);
				$("#imixs-error").show();
			}
		});

	}

	
	
	

	/* Custom method to load a worklist */
	worklistController.loadWorklist = function() {
		worklistController.pull();
		console.debug("load worklist: '" + worklistController.model.query
				+ "'...");

		var url = "./rest-service";
		url = url + "/workflow/worklist/";
		url = url + "?start=" + worklistController.model.start + "&count="
				+ worklistController.model.count;

		$.ajax({
			type : "GET",
			url : url,
			dataType : "xml",
			success : function(response) {
				worklistController.model.view = imixsXML
						.xml2collection(response);
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
		worklistController : worklistController,
		workitemController : workitemController,
		worklistRoute : worklistRoute,
		start : start
	};

}());

function layoutSection(templ, context) {
	// $(context).i18n();
	// $(context).imixsLayout();
	$("#imixs-error").hide();
	
	
};

