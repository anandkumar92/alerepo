$(function ()
   {
    var template = "video_test";
    
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
                                                             test("video test", function()
                                                              {
                                                               ok($('#data_videoURL a.flowplayer'), "#data_videoURL a.flowplayer exists");
                                                               
                                                               setTimeout(function ()
                                                                           {
                                                                            $('a.ALE_next.button').trigger('click');
                                                                           }, 2000);
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