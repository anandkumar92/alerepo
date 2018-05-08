/**
 * NoteTextWebPage template class
 * @param app
 * @returns {NoteTextWebPage}
 */
function NoteTextWebPage(app)
 {
  function init()
   {
    roundCorners();
    app.template.fixImgPaths('#data_articleColumn1');
   }

  /**
   * Rounds corners
   * TODO: Run this through the jQuery extentions eventually if possible
   */
  function roundCorners()
   {
    var webpage = RUZEE.ShadedBorder.create({
                                             shadow : 15
                                            });
                                            
    webpage.render("webpage_container_wrapper");
    
    $('body').one('template.loaded', function()
                                      {
                                       app.template.fixImgPaths();
                                      });
   }
  
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new NoteTextWebPage(ale);