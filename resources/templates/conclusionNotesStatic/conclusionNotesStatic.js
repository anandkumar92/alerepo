function ConclusionNotes(args)
 {
  var _config = {};

  setConfig(args);

  var app = getConfig().link,
      console = new Console();

  init();

  function applyRoundCorners()
   {
    Nifty('#message_container_wrapper');
    
    // TODO: Figure out why this doesn't apply unless delayed
    setTimeout(function ()
                {
                 Nifty('div#body_container_wrapper');
                }, 500);
   }

  function getConfig()
   {
    return _config;
   }
  
  function init()
   {
    render();
   }
  
  function render()
   {
    applyRoundCorners();
    //added for giving student name where ever cssSkin will be set to 'showlearnername' in metadata
    $('#data_notes li p', 'body.showLearnerName').last().append(' ' + app.scorm.learnerName());
   }
  
  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this
                       }, args);
   }
  
 }
App.prototype.thisTemplate = new ConclusionNotes({
                                                  'link' : ale
                                                 })