$(function ()
   {
    var app = ale,
        console = app.console,
        template = "global_test";
    
    /**
     * Prevents the script from getting loaded twice
     */
    function addTest()
     {
      App.prototype.unitTests[template] = function ()
                                           {
                                            return {
                                                    init : function ()
                                                            {
                                                             test("global masthead structure", function()
                                                              {
                                                               ok($('#masthead_container'), "masthead_container exists");
                                                               ok($('#global_masthead'), "global_masthead exists");
                                                               ok($('#global_masthead h2'), "global_masthead h2 exists");
                                                               ok($('#global_masthead h2 span#data_chapter_number').length > 0, "global_masthead h2 span#data_chapter_number exists");
                                                               ok($('#global_masthead h2 span#data_chapter_name').length > 0, "global_masthead h2 span#data_chapter_name exists");
                                                               ok($('#global_masthead h3').length > 0, "global_masthead h3 exists");
                                                               ok($('#global_masthead h3 span#data_chapter_description').length > 0, "global_masthead h3 span#data_chapter_description exists");
                                                              });
                                                              
                                                             test("global navigation structure", function()
                                                              {
                                                               ok($('#navigation_container'), "navigation_container exists");
                                                               
                                                               $('#menu_button').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'block', "menu showing");
                                                               
                                                               $('#nav_menu_close').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'none', "menu hiding");
                                                              });
                                                             
                                                             test("contextual glossary check", function()
                                                               {

                                                                
                                                                // Get all contextual glossary items
                                                                var contextualGlossary = $('.contextual_glossary');
                                                                
                                                                if (contextualGlossary.length > 0) {
                                                                  // Get expected values
                                                                  var glossaryData = app.glossary.getData();
                                                                
                                                                  // Click each, and check the values against expected values
                                                                  $.each(contextualGlossary, function (linkIndex, linkValue)
                                                                                              {
                                                                                               var expectedDefinition,
                                                                                                   expectedTerm,
                                                                                                   tempDOMHolder = $('<span>');
                                                                                               
                                                                                               $.each(glossaryData.terms, function (glossaryIndex, glossaryValue)
                                                                                                                           {
                                                                                                                            // Put glossaryValue.name in a DOM element to convert it's HTML entities
                                                                                                                            $(tempDOMHolder).html(glossaryValue.name);
                                                                                                
                                                                                                                            if ($(tempDOMHolder).html() === $(linkValue).html()) {
                                                                                                                             expectedDefinition = glossaryValue.description[0];
                                                                                                                             expectedTerm = $(tempDOMHolder).html();
                                                                                                                             
                                                                                                                             // Click the contextual glossary link
                                                                                                                             $(contextualGlossary[linkIndex]).trigger('click');
                                                                                                                            }
                                                                                                                            
                                                                                                                           });
                                                                                               
                                                                                               ok($('#Glossary.contextual_view').length > 0, "contextual glossary opened");
                                                                                               ok($('#data_glossary h3').html(), "<h3> has data: " + $('#data_glossary h3').html());
                                                                                               ok($('#data_glossary p').html(), "<p> has data: " + $('#data_glossary p').html());
                                                                                               ok($('#data_glossary h3').html() === expectedTerm, "expected contextual glossary term: " + expectedTerm + ", found: " + $('#data_glossary h3').html());
                                                                                               ok($('#data_glossary p').html() === expectedDefinition, "expected contextual glossary definition: " + expectedDefinition + ", found: " + $('#data_glossary p').html());
                                                                                               
                                                                                               // Click the document (close the link)
                                                                                               $(document).trigger('click');
                                                                                               
                                                                                               ok($('#Glossary.contextual_view').length === 0, "contextual glossary closed");
                                                                                              });
                                                                 }
                                                               });
                                                            }
                                                   };
                                           };
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        App.prototype.unitTests[template]().init();
       }
      else
       {
        addTest();
        App.prototype.unitTests[template]().init();
       }
     }
    else
     {
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template]().init();
     }

   })();