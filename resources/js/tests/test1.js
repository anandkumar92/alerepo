$(function ()
 {
  $('head').append('<link rel="stylesheet" href="resources/js/lib/qunit/css/qunit.css" type="text/css" media="screen" />');
//           .append('<script src="resources/js/lib/qunit/qunit.js"></script>');
  $(top.headerFrame).attr({
                           'height' : '300px'
                          });
//  $.getScript("resources/js/lib/qunit/qunit.js", function ()
//   {
//    console.info('tests running');
  
    /*
    test("smoke test", function ()
     {
      ok(API, "API object exists");
      ok(ALE, "ALE object exists");
      ok(SCORM, "SCORM object exists");
      equals(SCORM.ScanForAPI(window), API, "SCORM.ScanForAPI returns API");
     });
    */
  
    test("a basic test example", function ()
     {
      ok( true, "this test is fine" );
      var value = "hello";
      equals( "hello", value, "We expect value to be hello" );
     });

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
     });
    
    console.info('tests ran');
//   });
 });