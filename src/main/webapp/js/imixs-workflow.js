/*******************************************************************************
 * imixs-xml.js Copyright (C) 2015, http://www.imixs.org
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You can receive a copy of the GNU General Public License at
 * http://www.gnu.org/licenses/gpl.html
 * 
 * Project:  http://www.imixs.org
 * 
 * Contributors: Ralph Soika - Software Developer
 ******************************************************************************/

/**
 * This library provides methods to control the state of a workitem and provide
 * model information
 * 
 * 
 * Version 1.0.0
 */

IMIXS.namespace("org.imixs.workflow");
IMIXS.org.imixs.workflow = (function() {

	if (!IMIXS.org.imixs.core) {
		console.error("ERROR - missing dependency: imixs-core.js");
	}
	
	if (!IMIXS.org.imixs.xml) {
		console.error("ERROR - missing dependency: imixs-xml.js");
	}
	
	
	// private properties
	var serviceURL,
	activityList,
	imixs = IMIXS.org.imixs.core,
	imixsXML = IMIXS.org.imixs.xml,


	// validates servcieURL
	getServiceURL = function() {
		var url = IMIXS.org.imixs.workflow.serviceURL;
		if (url.charAt(url.length - 1) != '/') {
			url = url + "/";
		}
		return url;
	},
	
	/**
	 * Custom method to load a single workitem from the service base URL
	 */
	loadWorkitem = function(options) {
		var d=this.serviceURL;
		var e=serviceURL;
		
		var url = getServiceURL();

		url = url + "workflow/workitem/"
				+ options.uniqueID;

		$.ajax({
			type : "GET",
			url : url,
			dataType : "xml",
			success : options.success,
			error : options.error
		});

	},

	
	

	/* Custom method to process a single workitem */
	processWorkitem = function(options) {
		var url = getServiceURL();
		
		var xmlData = imixsXML.json2xml(options.workitem);
		// console.debug(xmlData);
		console.debug("process workitem: '" + options.workitem.getItem('$uniqueid')
				+ "'...");

		url = url + "workflow/workitem/";

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

				console.debug( uniqueid + " : " + error_code + " - "
						+ error_message, true);

				options.error(workitem);
			},
			success : options.success
		});

	},
	
	
	
	
	
	
	/**
	 * This method loads the activitylist for a workitem.
	 * 
	 * The method uses the browsers localStorage to cache objects. 
	 * 
	 */
	loadActivityList = function(options) {
		
		var modelversion = options.workitem.getItem('$modelversion');
		var processid = options.workitem.getItem('$processid');

		// we first test if we still have the Entity in the local storage
		var currentProcessEntity = null;
		if (imixs.hasLocalStorage())
			activityList = localStorage
					.getItem("org.imixs.workflow.activities." + modelversion
							+ "." + processid);
		if (currentProcessEntity == null) {
			// now we need to load the model information from the rest
			// service...
			var url = getServiceURL();
			url = url + "model/" + modelversion
							+ "/activities/" + processid;

			$.ajax({
				type : "GET",
				url : url,
				dataType : "xml",
				success : function(response) {
					activityList = imixsXML.xml2collection(response);
					
					if (imixs.hasLocalStorage()) {
						localStorage.setItem(
								"org.imixs.workflow.activities."
										+ modelversion + "." + processid,
								JSON.stringify(activityList));
					}
					
					if ($.isFunction(options.success)) {
						options.success(activityList);
					}
				},
				error : options.error
			});
			
		} else {
			// already cached
			if ($.isFunction(options.success)) {
				options.success(activityList);
			}
		}

	},
	
	
	/**
	 * Appends for each activity entity an activity button
	 * 
	 * params: actitvitList, context;
	 */
	appendActivityActions = function(options) {
		
		// test options...
		if (options.activityList) {
			activityList=options.activityList;
		}
		
		$.each(activityList,
				function(i, entity) {
			var activity=new imixs.ItemCollection(entity);
			var actionName = activity.getItem('txtname');
			var actionID =  activity.getItem('numactivityid');
			var tooltipText = activity.getItem('rtfdescription');
			renderActionButton( {
				context:options.context,
				name:  actionName,	
				id: actionID,
				insert:false,
				tooltip:tooltipText,
				styleClass: options.styleClass
				});
			
			
		});
	},
	
	
	
	/**
	 * appends an action button to a given context.
	 * 
	 * Params:
	 * 
	 * context, name, id, insert, tooltip
	 */ 
	renderActionButton = function(options) {
			// build conclick event....
			var _activityScript = "onclick=\"processWorkitem('" + options.id + "');";

			// build tooltip span tag
			var _tooltip = "";
			if (options.tooltip != "")
				_tooltip = "<span class=\"imixs-tooltip\">" + options.tooltip
						+ "</span>";

			var _button="<input type=\"submit\" class=\"" + options.styleClass + "\" id=\"workflow_activity_"
				+ options.id + "\" value=\"" + options.name + "\" "
				+ _activityScript + "\" title=\"\"></input>"
				+ _tooltip;
			// insert at the beginning of the tag?
			if (options.insert)
				$(options.context).prepend(_button);
			else
				$(options.context).append(_button);

	}
	

	// public API
	return {
		serviceURL : serviceURL,
		activityList: activityList,
		loadWorkitem: loadWorkitem,
		processWorkitem: processWorkitem,
		loadActivityList : loadActivityList,
		appendActivityActions: appendActivityActions
	};
	
	


}());
