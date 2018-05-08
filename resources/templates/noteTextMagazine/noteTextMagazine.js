function noteTextMagazine(app)
 {
  // Private methods
  // ---------------
  function render()
   {
    roundCorners();
    app.template.fixImgPaths();
   }
  
  function roundCorners()
   {
    var magazine = RUZEE.ShadedBorder.create({
                                              'shadow' : 10
                                             });
    
    magazine.render("magazine_container_wrapper");
    
    $('body').one('template.loaded', function()
                                      {
                                       app.template.fixImgPaths('div#magazine_container')
                                      });
   }
  
  
  // One-time setup
  // --------------
  render();
 }
 
App.prototype.thisTemplate = new noteTextMagazine(ale);