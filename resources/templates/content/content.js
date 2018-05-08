function Content(app)
 {
  var console = app.console;

  function init()
   {
    DD_roundies.addRule('#data_contentText', '5px', true);
    
    $('body').one('template.loaded', function()
                                      {
                                       app.template.fixImgPaths('#data_contentText p');
                                      });
   }
  
  this.init = init;
 }
 
App.prototype.thisTemplate = new Content(ale);
ale.thisTemplate.init();