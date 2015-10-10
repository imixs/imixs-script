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

	var benJS = BENJS.org.benjs.core, imixs = IMIXS.org.imixs.core, imixsXML = IMIXS.org.imixs.xml, imixsUI = IMIXS.org.imixs.ui, imixsWorkflow = IMIXS.org.imixs.workflow,
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

	workitemController = benJS
			.createController({
				id : "workitemController",
				model : new Workitem(),
				afterPull : function(controller, context) {
					// convert imixs-date objects....
					console.log('mach was');

					// validate xs:dateTime values
					// convert date objects into ISO 8601 format

					$.each(
							controller.model.item,
							function(index, aitem) {
								if (aitem && aitem.value && aitem.value[0]
										&& aitem.value[0]['xsi:type'] === "xs:dateTime") {
									var dateString = aitem.value[0]['$'];

									if (dateString
											.match(/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/)) {
										console.log('alles gut');
									} else {

										// test if Date object....
										// dateTest=new
										// Date("2015-10-09T15:15:06+00:00");
										//					
										var dateObject = $.datepicker
												.parseDate(
														IMIXS.org.imixs.ui.dateFormat,
														dateString);

										// jetzt ins iso format
										// übersetzen

										var neuding = $.datepicker
												.formatDate("yy-mm-dd",
														dateObject);
										
									//	neuding=neuding+"T00:00:00+01:00";
//										
//										neuding="2015-10-10T17:00:32.329+02:00";

										controller.model.setItem(
												aitem.name, neuding,"xs:dateTime");
										
										
//										controller.model.setItem(
//												aitem.name, neuding,"xs:string");
//										
										
										
										console.log('fertig',controller.model);
									}
								}
							});

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
			$("#imixs-nav ul li").removeClass('active');
			$("#imixs-nav ul li:nth-child(2)").addClass('active');
			worklistController.loadWorklist();
		}
	}),

	workitemRoute = benJS
			.createRoute({
				id : "workitem-route",
				templates : {
					"content" : "view_workitem.html"
				},
				afterRoute : function(router) {
					$("#imixs-nav ul li").removeClass('active');
					$("#imixs-nav ul li:nth-child(2)").addClass('active');

					// update activities
					imixsWorkflow
							.loadActivities({
								workitem : workitemController.model,
								success : function(activities) {

									console.debug("found " + activities.length
											+ " activities :-)");
									imixsUI
											.renderActivities({
												activities : activities,
												context : "#workitem_activities",
												styleClass : "btn",
												onclick : function(activity) {
													workitemController.pull();

													imixsWorkflow
															.processWorkitem({
																workitem : workitemController.model,
																activity : activity,
																success : function(
																		workitem) {
																	workitemController.model.item = workitem.item;
																	workitemController
																			.push();

																},
																error : function() {
																	alert('process failed');
																}
															});

												}
											});

									$("#workitem_activities").imixsLayout();

								},
								error : function(activityList) {
									$("#workitem_activities").empty();
								}
							});

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
			items : [ '$uniqueid', 'txtworkflowsummary', '$creator', 'txtname',
					'$modified', 'txtworkflowstatus', 'namcurrenteditor' ],
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
		worklistController : worklistController,
		workitemController : workitemController,
		worklistRoute : worklistRoute,
		// imixsUI: imixsUI,
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

