$(function ()
   {
    var template = 'conclusionRecap_test';
    
    function addTest()
     {
      App.prototype.unitTests[template] = (function (link)
                                           {
                                            var app = link;
                                            return {
                                                    init : function ()
                                                            {
                                                             var persistFrom = app.getPagesObject().pages[app.getCurrentPage()].persistFrom;
                                                             test('template load', function()
                                                                                    {
                                                                                     ok(true, 'template loaded.');   
                                                                                    });
                                                             test('presist from count', function()
                                                                                         {
                                                                                          ok($('.scoreBox').length === persistFrom.length, 'persistFrom length matched score box length');
                                                                                         });
                                                             test('view global navigation back link', function()
                                                                                                       {
                                                                                                        ok($('#nav_container .conclusion').length, 'global navigation back button visible');
                                                                                                       });
                                                             // Test score box click event and next attempt button click event.
                                                             test('scoreBoxes clicked and next/preivous attempt', function()
                                                                                         {
                                                                                          // trigger the click event on next attempt button.
                                                                                          var navAttempt = function(selector)
                                                                                                             {
                                                                                                              while(!$(selector).hasClass('disabled'))
                                                                                                               {
                                                                                                                $(selector).trigger('click');
                                                                                                               }
                                                                                                             };
                                                                                                             
                                                                                          $('.scoreBox').each(function(index)
                                                                                                               {
                                                                                                                try 
                                                                                                                 {
                                                                                                                  // trigger scoreBox click event.
                                                                                                                  $(this).trigger('click');
                                                                                                                  // go through each attempt.
                                                                                                                  navAttempt('#nextBtn');
                                                                                                                  ok(true, $(this).attr('id') + ' testing next attempt passed');
                                                                                                                  navAttempt('#prevBtn');
                                                                                                                  ok(true, $(this).attr('id') + ' testing previous attempt passed');
                                                                                                                 }
                                                                                                                catch(e)
                                                                                                                 {
                                                                                                                  ok(false, $(this).attr('id') + ' testing next and previous attempt failed');  
                                                                                                                 }
                                                                                                               });         

                                                                                         });     
                                                            }
                                                   };
                                           })(ale);
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        App.prototype.unitTests[template].init();
       }
      else
       {
        addTest();
        App.prototype.unitTests[template].init();
       }
     }
    else
     {
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template].init();
     }
   })();