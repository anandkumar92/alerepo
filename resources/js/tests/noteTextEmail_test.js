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
                                                             test("noteTextEmail structure", function()
                                                              {
                                                               ok($('#main_container').length > 0, "main_container exists");
                                                               
                                                               setTimeout(function ()
                                                                           {
                                                                            // please wait...
                                                                            //$('a.ALE_next.button').trigger('click');
                                                                           }, 3000);
                                                                           
                                                               //var value = $('#top_container h2').html;
                                                               //equals( "something else", value, "We expect value to be Introducción" );
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