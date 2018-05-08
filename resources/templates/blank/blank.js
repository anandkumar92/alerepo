/**
 * Blank template class
 * @param app
 * @returns {Blank}
 */
function Blank(app)
 {
  function init()
   {
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      if ($('#lightbox_toolkit_lb').hasClass('timeline'))
       {
        var calc = new app.template.Widget({ element : '#timeline', template : 'timeline' });
        
        $('#data_content_container').css('margin-left', '50px');
        
        $('#data_content_container').css('overflow', 'visible');
       }
      
      if ($('#lightbox_toolkit_lb').hasClass('point'))
       {
        var calc = new app.template.Widget({ element : '#point', template : 'viewpoint' });
       }
      
      return;
     }
    
    $('body').one('template.loaded', function()
                                      {                
                                       if ($('body').hasClass('timeline'))
                                        {
                                         var calc = new app.template.Widget({ element : '#timeline', template : 'timeline' });
                                         
                                         $('#data_content_container').css('margin-left', '50px');

                                         $('#data_content_container').css('overflow', 'visible');
                                        }
                                       
                                       if ($('body').hasClass('point'))
                                        {
                                         var calc = new app.template.Widget({ element : '#point', template : 'viewpoint' });
                                         
//                                         $('#data_content_container').css('margin-left', '50px');
//                                         
//                                         $('#data_content_container').css('overflow', 'visible');
                                        }
                                       
                                       app.template.fixImgPaths();
                                      });
   }
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new Blank(ale);