 $(document).ready(function ()
  {  
   //---[begin class code]----

   $('input.french').palette({
	   						'languageSelect' : true,
	   						'language' : 'french',
	   						'eventCallback' : {
		   										'beforeInsert' : function() {
		   											console.log('before insert');
		   									  },
	   										'afterInsert' : function() {
	   											console.log('after insert');
	   										},
	   										'beforeShow' : function() {
	   											console.log('before show');
	   											
	   										},
	   										'afterShow' : function() {
	   											console.log('after show');
	   										}
	   									 }
   							});

   $('input.spanish').palette({
							  'languageSelect' : true
                              });                           
   $('input.italiano').palette();

   $('input.german').palette({
                               language : 'german'
                              });                           
   $('input.deutsch').palette({
                               language : 'deutsch'
                              });                           

   $('textarea.french').palette({
	   							 auto:false,
                                 language : 'french'
                                });            

   $('textarea.spanish').palette({
                                  language : 'spanish',
                                  auto:false
                                 });            
   
   //---[end class code]----
   
   //---[begin id code]----
   $('#first').palette({
                        language : 'french'
                       });                           

   $('#second').palette({
                         language : 'spanish'
                        });                           

   $('#third').palette({
                        align : 'vertical',
                        language : 'french'
                       });                           

   //---[end id code]----

   //---[begin instructor code]----
   $('input.fr.instructor').palette({
                                     align : 'vertical',
                                     auto : false,
                                     language : 'french',
                                     resize:true
                                    });

   $('input.sp.instructor').palette({
                                     auto : false,    
                                     language : 'spanish'
                                    });                           

   //---[end instructor code]----
   
   //bind tinymce editor
   $('textarea.tinymce').tinymce({
		// Location of TinyMCE script
		script_url : 'tinymce/jscripts/tiny_mce/tiny_mce.js',
		init_instance_callback:function(inst){
			$('#'+inst.editorId).palette({
                             'language' : 'spanish',
                             'auto': false,
                             'tinymceEditor' : true 
                            });
		}, 
		theme : "advanced",
		theme_advanced_buttons1 : "bold, italic, palette_icon",
		theme_advanced_buttons2 : "",
		theme_advanced_buttons3 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "bottom",
		plugins : 'inlinepopups',
		width: "200",
		height: "100",
		setup: function (ed) {
			ed.addButton('palette_icon', {
			     title : 'special character icon',
			     image : 'images/tinymce_spl_character_icon.png',
			     onclick : function(event) {
			    	 $('#' + this.editorId).trigger('showPalette');
			     }
			    });
		}
	});

  }); 

