$(function ()
   {
    var template = "vidNotes_test";
    
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
                                                               $('#questions_content p.answerDescription:eq(3)').trigger('click');
                                                               
                                                               $('#questions_content p:eq(0) span.answerArea').trigger('click');
                                                              });
                                                            }
                                                   }
                                           };
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        console.info('global_test -> case 1');
        App.prototype.unitTests[template]().init()
       }
      else
       {
        console.info('global_test -> case 2');
        addTest();
        App.prototype.unitTests[template]().init()
       }
     }
    else
     {
      console.info('global_test -> case 3');
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template]().init()
     }

   })();