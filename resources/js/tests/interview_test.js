$(function ()
   {
    var template = "noteTextEmail";
    
    function addTest()
     {
      App.prototype.unitTests[template] = function ()
                                           {
                                            return {
                                                    init : function ()
                                                            {
                                                             test("interview structure", function()
                                                              {
                                                               // Check basic structure
                                                               ok($('#main_container').length > 0, "Basic structure not loaded, malformed JSON?");
                                                               //app.template.getData().paneGroups.[groupId].videos[linkId].file.content
                                                               
                                                               // Check template structure
                                                               ok($('div.accordion').length > 0, "Accordion created.");
                                                               ok($('div.accordion h3').length === ale.template.getData().content[0].paneGroups.length, "Accordion contains all panes defined in JSON (" + ale.template.getData().content[0].paneGroups.length + ")");
                                                               ok($('div.accordion div.excerpt:has(ul, li, a)').length === $('div.accordion h3').length, "Accordion panes contain content.");
                                                               
                                                               setTimeout(function ()
                                                                           {
                                                                            // please wait...
                                                                            $('a.ALE_next.button').trigger('click');
                                                                           }, 3000);
                                                              });
                                                            }
                                                   }
                                           };
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        App.prototype.unitTests[template]().init()
       }
      else
       {
        addTest();
        App.prototype.unitTests[template]().init()
       }
     }
    else
     {
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template]().init()
     }
   })();