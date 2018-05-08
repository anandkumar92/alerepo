function GlobalMasthead(app)
 {
  function bindEvent()
   {
    $('#global_masthead #saveExit').unbind('click').bind('click', function()
                                                                   {
                                                                    if(confirm("Are you sure you want to exit this activity?\n\n(Your progress will be saved)")) 
                                                                     {
                                                                      app.doUnload();
                                                                     }
                                                                   });
   }
  
  function getCurrentPage()
   {
    return app.getCurrentPage();
   }

  function init()
   {
    render({
            currentPage : app.getCurrentPage()
           });
   }

  function render(args)
   {
    app.setCurrentPage(args.currentPage);
   }
  
  //toggle the save & exit button 
  function toggleSaveButton(isShow)
   {
    if(isShow)
     {
      if(!$('#global_masthead #saveExit').length)
       {
        $('#global_masthead').append('<a id="saveExit" href="#">exit this assignment</a>');     
       }
      bindEvent();
     }
    else
     {
      $('#global_masthead #saveExit').unbind('click');
      $('#global_masthead #saveExit').hide();
     }
   }
  
  // public interface
  this.render = render;
  this.toggleSaveButton = toggleSaveButton;
  
  init();
 }

App.prototype.globalMasthead = new GlobalMasthead(ale);