/**
 * NoteTextEmail template class
 * @param app
 */
function NoteTextEmail(app)
 {
  // Private methods
  // ---------------
  
  // Public methods
  // ---------------
  this.init = init;
  
  /**
   * Runs a few elements to format the template
   */
  function init()
   {
    roundCorners();
    hideOptionalElements();
    
    $('body').one('template.loaded', function()
                                      {
                                       insertLearnerName();
                                       app.template.fixImgPaths();
                                       
                                       updateLabels([
                                                     'fromLabel',
                                                     'subjectLabel',
                                                     'toLabel'
                                                     ]);
                                      });
   }

  function insertLearnerName()
   {
    $('#data_toName, #lightbox_data_toName').html(app.scorm.learnerName());
    $('#emailBodyLearnerName').html(app.scorm.learnerName());
   }

  function roundCorners()
   {
    var email = RUZEE.ShadedBorder.create({
                                           shadow: 10
                                          });
                                          
    email.render("email_container_wrapper");
   }
  
  function updateLabels(arr)
   {
    $.each(arr, function(index, value)
                 {
                  if (app.template.getData().content[0][value] !== undefined)
                   {
                    $('#data_' + value).html(app.template.getData().content[0][value]);
                   }
                 })
   }

  function hideOptionalElements()
   {
    // Hide optional elements if they are not present in JSON
    if (typeof app.template.getData().content[0].attachmentGraphic === 'undefined') {
      $('#attachmentGraphic').hide();
     }
    
    if (typeof app.template.getData().content[0].emailAuthorImage === 'undefined' || app.template.getData().content[0].emailAuthorImage === '') {
      $('#data_emailAuthorImage').hide();
     }
   }
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.thisTemplate = new NoteTextEmail(ale);