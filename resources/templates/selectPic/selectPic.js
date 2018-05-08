function SelectPic(app)
 {
  var console = new Console();
  
  function bindEvents(wasCorrect)
   {
    $('a.more').bind('click', function()
                               {
                                moreInfo({
                                          index : $(this).parent('div.option').index('div.option')
                                         });
                               });
    // base on wasCorrect flag, bind/unbind the click event.
    if(!wasCorrect)
     {
      $('div.option img, div.option a.title').bind('click', function() 
                {
                 setSelectedSlide($(this).parent('div.option').index('div.option'));
                });        
     }
    else
     {
      $('div.option img, div.option a.title').unbind('click');
     }
   }
  
  function buildSlide(count)
   {
    var fragment = document.createDocumentFragment();
    
    count = count || 1;
    
    var x;
    for (x = 0; x < count; x++)
     {
      var feedback = document.createElement('div'),
          holder = document.createElement('div'),
          titleAnchor = document.createElement('a'),
          moreAnchor = document.createElement('a'),
          img1 = document.createElement('img'),
          img2 = document.createElement('img');

      feedback.className = 'feedback';
      holder.className= 'option';
      moreAnchor.className = 'more';
      titleAnchor.className = 'title';
      
      moreAnchor.setAttribute('href', '#');
      titleAnchor.setAttribute('href', '#');
      
      holder.appendChild(titleAnchor);
      holder.appendChild(img1);
      holder.appendChild(img2);
      holder.appendChild(feedback);
      holder.appendChild(moreAnchor);
      
      fragment.appendChild(holder);
     }
    
    return fragment;
   }
  
  function buildSubmitButton()
   {
    // Create element
    var submitButton = document.createElement('input');
    submitButton.id = 'submit';
    submitButton.className = 'disableds';
    submitButton.setAttribute('disabled', '');
    submitButton.setAttribute('type', 'button');
    
    // Insert element
    $('div#button_content').html(submitButton);
    
    // Bind submit event to it
    $(submitButton).bind('click', function (e)
                                   {
                                    submitForm();
                                    e.stopPropagation();
                                   });
   }
  
  function getQuestionBank()
   {
    return app.getTest().getQuestionBank();
   }
  
  function getSelectedSlide()
   {
    return undefined;
   }

  function init()
   {
    app.hooks.clearHooks();
    app.hooks.setHook({
                       name : 'RenderTest',
                       functionName : function ()
                                       {
                                        app.thisTemplate.render();
                                       }
                      });
   }
  
  function moreInfo(args)
   {
    var index = args.index || 0;

    app.toolkit.scaffoldLightbox({
                                  callback : function()
                                              {
                                               setTimeout(function()
                                                           {
                                                            app.template.fixImgPaths('div#lightbox_data_emailBody');
                                                            app.thisTemplate.init();
                                                            $('body').trigger('template.loaded');
                                                           }, 0);
                                              },
                                  template : app.template.getData().questions[0].answers[index].json
                                 });
   }
  
  function render()
   {
    // Create/append tooltip
    renderTooltip();
    
    //populate content from json
    renderSlides({
                  data : app.template.getData().questions[0].answers,
                  parent : 'div#slides_content',
                  text : 'more info'
                 });

    var question = app.template.getData().questions[0],
        wasCorrect = false;
    // If interaction data exists, apply the saved answer
    if (getQuestionBank()[0].learner_response !== null)
     {
      setSelectedSlide(getQuestionBank()[0].learner_response);
      // Check if the answer is correct.
      wasCorrect = getQuestionBank()[0].learner_response === question.correctAnswer[0];
     }
    if(!wasCorrect) 
     {
      //submit button only if the answer to the question was incorrect.
      buildSubmitButton();        
     }
    else 
     {
      // Ungate this test for navigating to next page, since
      // we are noting show submit button if test completed.
      app.getTest().ungateThisTest();
     }
    //event binding
    bindEvents(wasCorrect);
    
    // Doing manual rounded corners in CSS because repainting div's in IE7 does not work with dd_roundies or Nifty
//    DD_roundies.addRule('div.option', '10px', true);
//    DD_roundies.addRule('div#slides_container', '10px', true);
   }
  
  function renderTooltip()
   {
    var contentContainer = $(document.getElementById('main_content_container')),
    tooltip = $(document.createElement('div'));

    tooltip.addClass('tooltip');
    contentContainer.prepend(tooltip);
   }
  
  function renderSlides(args)
   {
    var answers = args.data,
        answersLength,
        parent = args.parent,
        linkText = args.text || 'more info';
    
    answersLength = answers.length;
    
    // Add clearfix to slides_container
    $('div#slides_container').addClass('clearfix');
    
    $(parent).append(buildSlide(answersLength));
    
    for (var x = 0; x < answersLength; x++)
     {
      var slide = $(parent + ' div.option:eq(' + x + ')'),
          imgLength = answers[x].img.length;
      
      slide.find('a.title').html(answers[x].title);
      
      // Set graphics from array
      for (var y = 0; y < imgLength; y++)
       {
        slide.find('img:eq(' + y + ')').attr('src', '/s3scorm/ale/content/assets/' + answers[x].img[y]);
       }
      
      slide.find('a.more').text(linkText);
     }
   }
  
  function setSelectedSlide(i)
   {
    $('div.option').removeClass('selected');
    
    getSelectedSlide = function()
                        {
                         return i;
                        };
    
    // If the submitted answer is wrong the function will receive -1/undefined
    if (i === undefined)
     {
      $('div#slides_container').removeClass('selected');
      return;
     }
    
    $('div#slides_container').addClass('selected');
    $('div.option:eq(' + i + ')').addClass('selected');
    
    // Enable submit button...this will permanently be enabled from this step.
    // This is because you cannot de-select
    $('input#submit').removeAttr('disabled')
                     .removeClass('disableds');
    
    app.getTest().recordInteraction({
                                     id : 0,
                                     value : i
                                    });
   }
  
  function showFeedback(args)
   {
    var correctAnswer = args.correctAnswer,
        correctness = args.correctness,
        feedback = args.feedback,
        target = args.target,
        yourAnswer = args.yourAnswer;
    
    // Create new feedback element
    var feedbackElement = document.createElement('a');
    feedbackElement.className = 'feedback ' + correctness;
    feedbackElement.href = '#';
    $(target).append(feedbackElement);
    
    // If there is no feedback then do not bind a lightbox
    if (feedback.length <= 0) {
      return false;
     }
    
    // Bind feedback lightbox to it
    $(feedbackElement).bind('click', function ()
                                      {
                                       app.lightbox.render({
                                                            global : ale,
                                                            callback : function()
                                                                        {
                                                                         $('div.lightbox a.close, div#modal').unbind()
                                                                                                             .bind('click', function()
                                                                                                                             {
                                                                                                                              $('div.lightbox').remove();
                                                                                                                              $('div#modal').css('display', 'none');
                                                                                                                              return false;
                                                                                                                             });
                                                                        },
                                                            id : app.lightbox.getFreshLightboxId(),
                                                            data : {
                                                                    // We're using the same style feedback lightbox as vidNotesFeedback
                                                                    type : 'vidNotesFeedback',
                                                                    content : {
                                                                               yourAnswer : yourAnswer,
                                                                               correctAnswer : correctAnswer,
                                                                               feedback : feedback
                                                                              }
                                                                   },
                                                            // Set to true so we can allow multiple lightboxes in toolkit mode         
                                                            independent : true
                                                           });
                                       return false;
                                      });
   }
  
  function submitForm(args)
   {
    var args = args || {},
        noSubmit = args.noSubmit || false,
        questionAnswer = app.template.getData().questions[0].correctAnswer[0];
    
    // Assess answers
    $('div.option').each(function(i, e)
                          {
                           if (getSelectedSlide() === questionAnswer)
                            {
                             showFeedback({
                                           correctAnswer : $('div.option:eq(' + getSelectedSlide() + ')').find('a.title').text(),
                                           correctness : 'correct',
                                           feedback : app.template.getData().questions[0].answers[questionAnswer].feedback[1],
                                           target : $('div.option:eq(' + getSelectedSlide() + ')').find('div.feedback'),
                                           yourAnswer : $('div.option:eq(' + getSelectedSlide() + ')').find('a.title').text()
                                          });
                             
                             $('div.option').each(function(i, e)
                                                   {
                                                    if (i === questionAnswer)
                                                     {
                                                      return;
                                                     }
                                                    
                                                    showFeedback({
                                                                  correctAnswer : $(e).find('a.title').text(),
                                                                  correctness : 'correct',
                                                                  feedback : app.template.getData().questions[0].answers[i].feedback[1],
                                                                  target : $(e).find('div.feedback'),
                                                                  yourAnswer : $(e).find('a.title').text()
                                                                 });
                                                   });
                             return false;
                            }
                           else
                            {
                             showFeedback({
                                           correctAnswer : 'incorrect',
                                           correctness : 'incorrect',
                                           feedback : app.template.getData().questions[0].answers[getSelectedSlide()].feedback[0],
                                           target : $('div.option:eq(' + getSelectedSlide() + ')').find('div.feedback'),
                                           yourAnswer : $('div.option:eq(' + getSelectedSlide() + ')').find('a.title').text()
                                          });
                             
                             $('div.option').each(function(i, e)
                                                   {
                                                    if (i === questionAnswer)
                                                     {
                                                      showFeedback({
                                                                    correctAnswer : 'incorrect',
                                                                    correctness : 'incorrect',
                                                                    feedback : app.template.getData().questions[0].answers[i].feedback[0],
                                                                    target : $(e).find('div.feedback'),
                                                                    yourAnswer : $(e).find('a.title').text()
                                                                   });
                                                      return;
                                                     }
                                                    if (i !== getSelectedSlide())
                                                     {
                                                      showFeedback({
                                                                    correctAnswer : $(e).find('a.title').text(),
                                                                    correctness : 'correct',
                                                                    feedback : app.template.getData().questions[0].answers[i].feedback[1],
                                                                    target : $(e).find('div.feedback'),
                                                                    yourAnswer : $(e).find('a.title').text()
                                                                   });
                                                     }
                                                   });
                             return false;
                            }
                           
                          });
    var correctness = 'correct';
    // Manage controls
    if (getSelectedSlide() === app.template.getData().questions[0].correctAnswer[0])
     {
      var continueButton = document.createElement('input');
      
      continueButton.type = 'button';
      continueButton.id = 'continue';
      
      // Show our tooltip for clicking feedback
      $('div.tooltip').css('display','inline');
      
      // Unbind other slides
      $('div.option img, div.option a.title').unbind();
      
      // Reset cursors
      $('div.option img, a.title').css('cursor', 'auto');
      
      $('div#button_content').html(continueButton);
      
      $('input#continue').bind('click', function()
                                         {
                                          app.doNext();
                                         });
     }
    else
     {      
      correctness = 'incorrect';
      var tryAgainButton = document.createElement('input');
      
      tryAgainButton.type = 'button';
      tryAgainButton.id = 'tryAgain';
      
      // Show our tooltip for clicking feedback
      $('div.tooltip').css('display','inline');
      
      // Unbind other slides
      $('div.option img, div.option a.title').unbind();
      
      // Reset cursors
      $('div.option img, a.title').css('cursor', 'auto');
      
      $('div#button_content').html(tryAgainButton);
      
      $('input#tryAgain').bind('click', function()
                                         {
                                          setSelectedSlide(undefined);
                                          
                                          // Hide our tooltip
                                          $('div.tooltip').css('display', 'none');
                                          
                                          buildSubmitButton();
                                          
                                          $('div.option img, a.title').removeAttr('style');
                                          $('div.option div.feedback').empty();
                                          
                                          bindEvents();
                                         });
     }
    // Set the value to the property "correctness" of question object.
    app.template.getData().questions[0].correctness = correctness;
   }
  
  this.init = init;
  this.render = render;
 }
 
App.prototype.thisTemplate = new SelectPic(ale);

ale.thisTemplate.init();