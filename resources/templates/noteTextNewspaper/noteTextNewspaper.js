function noteTextNewspaper(app)
 {
  // Private methods
  // ---------------
  function bindHeader()
   {
    var header = app.template.getData().content[0].headerImage;
    if (header)
     {
      $('div#newspaper_header_title').css('background-image','url("/s3scorm/ale/content/assets/' + header + '")');
     }
   }
  
  function init()
   {
    render();
   }
   
  function render()
   {
    if ($('body.soc').length <= 0 && $('#lightbox_toolkit_lb.soc').length <= 0)
     {
      roundCorners();
     }

    $('body').one('template.loaded', function()
                                      {
//                                     Bind a new header graphic if a custom one exists
                                       bindHeader();
                                       app.template.fixImgPaths('div#newspaper_main_container');
                                       $('#data_toName, #lightbox_data_toName').html(app.scorm.learnerName().split(' ')[1]);
                                      });
   }
   
  function roundCorners()
   {
    var newspaper = RUZEE.ShadedBorder.create({
                                               'shadow' : 15
                                              });

    newspaper.render($("#newspaper_container_wrapper"));
   }
  
  App.prototype.toolkitInit = function()
                               {
                                $('body').one('template.bound', function()
                                                                  {
                                //                                 Bind a new header graphic if a custom one exists
                                                                   bindHeader();
                                                                   app.template.fixImgPaths('#lightbox_toolkit_lb div#newspaper_main_container');
                                                                   $('#data_toName, #lightbox_data_toName').html(app.scorm.learnerName().split(' ')[1]);
                                                                  });
                               };
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new noteTextNewspaper(ale);