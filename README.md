#Imixs-Script

Imixs-Script is a JavaScript library to build powerful web based workflow applications.
Imixs-Script is based on JQuery and can be used together with common SPA-Frameworks like [Angular](https://www.angularjs.org/), [BenJS](http://www.benjs.org), [EmberJS](http://emberjs.com/) or your own framework. 
Imixs-Script handles all the communication with the Imixs-Workflow engine via the Imixs Rest API which makes it easy to build a flexible ans scalable business application. 

###Learn more about Imixs-Script on the [project home](http://www.imixs.org/script/)


##Sample Application
You can checkout the latest release containing sample application which gives an overview about the functionality of Imixs-Script and can be used as a template for own applications.

##Deployment
To start with Imixs-Script you need to deploy an instance of the imixs-workflow engine. This can be done by deploying the sample application or any other Imixs-Workflow project. 

#Join this Project
If you have any questions our found a problem post it on [GitHub](https://github.com/imixs/imixs-script/issues). Find more about the Imixs-Workflow on the [project home](http://www.imixs.org)

##License

Imixs-Script is free software, because we believe that an open exchange of experiences is fundamental for the development of usefull software. The results of this project are provided under the GNU General Public License.

 
# HowTo

The following section shows some examples how to use Imixs-Script

## Layout
The imixs-ui.js provides some layout methods to apply the jQuery UI widgets to a page section. See the following example to layout a jQuery UI tab navigation



			...
			<form id="form1">
			<div class="imixs-tabs">
				<ul>
					<li><a href="#tab-1">Tab1</a></li>
					<li><a href="#tab-2">Tab2</a></li>
				</ul>
				<div id="tab-1">
					<p>Some data...</p>
				</div>
				<div id="tab-2" class="imixs-form-section">
					<p>Another page...</p>
				</div>
			</div>
			...
			<script type="text/javascript" src="./js/imixs-ui.js"></script>
		
			<script>
				$(document).ready(function() {
					$('#form1').imixsLayout();
				});
			</script>
			


## Working with Date Fields

Imixs-Script provides an easy way to work with Date fields which can be send to the back-end service as Date values. 
Therefor the Imixs-Script ItemCollection object provides a way to set the 'xsi:type' of a item to 'xs:dateTime'. Imixs-Script will handle those items as date objects. 

	myController.model=new ItemCollection();
	myController.model.setItem('datfrom','','xs:dateTime');


To edit such a date item the jQuery datepicker can be used. 

	<input type="text" class="imixs-date" 
			data-ben-model="getItem('datfrom')"></input> 
									
The Imixs-Script method 'imixsLayout()' will convert a input field with the class 'imixs-date' automatically into a jQuery date picker widget. (see section 'Layout')

The imixs-ui method 'convertDateTimeInput' automatically converts the date input values provided by the jQuery DatePicker into a ISO 8601 format. The converted ItemCollection an be send to the Imixs-Workflow Rest API.

	 // convert date objects into ISO 8601 format
	 imixsUI.convertDateTimeInput(myController.model);
	 console.log("new ISO format=" + myController.model.getItem('datfrom')); 

So a date value of German format '15.08.2016' will be converted into the ISO format '2016-08-15'. 
To convert the date values the imixs-ui makes use of the jQuery method '$.datepicker.parseDate'.
