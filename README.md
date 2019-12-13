# Imixs-Script

Imixs-Script is a JavaScript library to used in combination with the Imixs-Workflow Rest API. 
The library is based on JQuery and can be used together with common SPA-Frameworks like [Vue.js](https://vuejs.org/), [Angular](https://www.angularjs.org/), [EmberJS](http://emberjs.com/) or your own framework. 

Imixs-Script proivdes an simple way to exchange data objects with the Imixs-Workflow Rest API.
The data can be loaded into the class 'ImixsDocument' which provides an convenience way to access the items within a Imixs Workitem. 

Imixs-Script brings its own namespace so there are no name conflicts with other classes. You can easily add the libray into your application:

	var imixs = IMIXS.org.imixs.core, 
		 imixsXML = IMIXS.org.imixs.xml;
		 imixsWorkflow = IMIXS.org.imixs.workflow;
 

See the following example loading a document form the Imixs-Worklfow Rest API:

	$.ajax({		            		
	    url: 'http://localhost:8080/api/documents/'+myUUID,
	    type: 'GET',
	    contentType: 'application/xml',
	    success: function (response) {
	    	// convert rest response to a document instance
	    	workitem=imixsXML.xml2document(response);	
	    },
	    error : function (xhr, ajaxOptions, thrownError){
	        console.log(xhr.status);          
	    }
	});

The result object 'workitem' can be used to access all attributes: 

	console.log(workitem.getItem('$workflowstatus');



You can also build a ImixsDocument from your application data

	var workitem=new imixs.ImixsDocument();
	workitem.setItem('$modelversion','1.0.0');
	workitem.setItem('$taskid',2000);
	workitem.setItem('$eventit',10);
	workitem.setItem('_subject','Some Data');
	


... and POST the object to the Imixs-Workflow Rest API:

	$.ajax({		            		
	    url: 'http://localhost:8080/api/documents/',
	    type: 'POST',
	    beforeSend: function (xhr) {
	        xhr.setRequestHeader('Authorization', app.token);
	    },
	    data: xmlData,
	    dataType: 'xml',
	    contentType: 'application/xml',
	    success: function (response) {
	    	// convert rest response to a document instance
	    	workitem=imixsXML.xml2document(response);	
	    },
	    error : function (xhr, ajaxOptions, thrownError){
	        console.log(xhr.status);          
	    }
	});


You can also directly convert a collection of data into an JavaScript Array of ImixsDocument classes:


	$.ajax({		            		
	    url: 'http://localhost:8080/api/workflow/tasklist/creator/'+myUserID,
	    type: 'GET',
	    contentType: 'application/xml',
	    success: function (response) {
	    	// convert rest response to a document instance
	    	worklist=imixsXML.xml2collection(response);	
	    },
	    error : function (xhr, ajaxOptions, thrownError){
	        console.log(xhr.status);          
	    }
	}); 


# Join this Project
If you have any questions our found a problem post it on [GitHub](https://github.com/imixs/imixs-script/issues). Find more about the Imixs-Workflow on the [project home](http://www.imixs.org)

## License

Imixs-Script is free software, because we believe that an open exchange of experiences is fundamental for the development of strong software. The results of this project are provided under the GNU General Public License.

 
