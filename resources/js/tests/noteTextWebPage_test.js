$(function ()
   {
    var app = ale,
        template = "noteTextWebPage";
    
    function addTest()
     {
      console.info('addTest()');
      App.prototype.unitTests[template] = function ()
                                           {
                                            return {
                                                    init : function ()
                                                            {
                                                             test("map structure", function()
                                                                                    {
                                                                                     ok($('#main_container').length > 0, "main_container exists");
                                                                                     
                                                                                     var imageLoaded,
                                                                                         returnedMessage;
                                                                                     
                                                                                     $.ajax({
                                                                                             async : false,
                                                                                             url : $('#data_image').attr('src'),
                                                                                             success : function (data)
                                                                                                        {
                                                                                                         imageLoaded = true;
                                                                                                         returnedMessage = '';
                                                                                                        },
                                                                                             error : function (data)
                                                                                                        {
                                                                                                         imageLoaded = false;
                                                                                                         returnedMessage = data;
                                                                                                        }
                                                                                            });
                                                                                     
                                                                                     ok(imageLoaded, "image exists, message: " + returnedMessage);
                                                                                     
                                                                                     ok($('#data_url').html() === ale.template.getData().content[0].url, "image URL is properly set");
                                                                                     
                                                                                     $('input.assignment_button').trigger('click');
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
    /*
    test("map structure", function()
     {
      ok($('#main_container').length > 0, "main_container exists");
      //var value = $('#top_container h2').html;
      //equals( "something else", value, "We expect value to be Introducción" );
     });
     alert('end');
     */
   })();
   
    /*
    module("Module A");
    
    test("first test within module", function ()
     {
      ok( true, "all pass" );
     });
    
    test("second test within module", function ()
     {
      ok( true, "all pass" );
     });
    
    module("Module B");
    
    test("some other test", function ()
     {
      expect(2);
      equals( true, false, "failing test" );
      equals( true, true, "passing test" );
     });
  
    module("Module C");
  
    test("this is my test", function ()
     {
      expect(3);
      equals(true, true);
     });*/
//   });