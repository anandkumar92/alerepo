$(function ()
   {
    var template = "vidNotesRemediation_test";
    
    /**
     * Prevents the script from getting loaded twice
     */
    function addTest()
     {
      App.prototype.unitTests[template] = (function (link)
                                           {
                                            var app = link,
                                                questionType = app.getTest().getQuestionBank()[0].type;
                                            
                                            return {
                                                    init : function ()
                                                            {
                                                             test("template question type and description content validation", function()
                                                                                             {
                                                                                              var validType = true,
                                                                                                  questionCount = app.getTest().getQuestionBank().length;
                                                                                              switch(questionType)
                                                                                               {
                                                                                                case 'choice':
                                                                                                 ok($('span.answerArea').length === questionCount, '<span class="answerArea"></span> not existed or any missing');
                                                                                                 break;
                                                                                                case 'fillinInput':
                                                                                                 ok($('input.inputArea').length === questionCount, '<input type="text" class="inputArea"></input> not existed or any missing');
                                                                                                 break;
                                                                                                default:
                                                                                                 validType = false;
                                                                                               }
                                                                                              ok(validType, 'validate question type: ' + questionType);
                                                                                             });
                                                             
                                                             test("template structure", function()
                                                              {
                                                               // Check if all submit buttons are disabled, before inserting any testing data to the answer area.
                                                               var buttonsDisabled = $('.button.saveAndContinue').filter(function() 
                                                                                                                   {
                                                                                                                    return $(this).attr('disabled');
                                                                                                                   }); 
                                                               ok(buttonsDisabled, "saveAndContinue buttons are disabled");
                                                               var questionsLen = 0;
                                                               switch(questionType)
                                                                {
                                                                 case 'choice':
                                                                  questionsLen = $('span.answerArea').length;
                                                                  break;
                                                                 case 'fillinInput':
                                                                  questionsLen = $('input.inputArea').length;
                                                                  break;
                                                                }
                                                               ok(questionsLen, "questions elements got bound correctly");
                                                              });
                                                              
                                                             test("question content", function()
                                                              {
//                                                               ok(false, "image assets aren't broken");
                                                               
                                                               $('#menu_button').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'block', "menu showing");
                                                               
                                                               $('#nav_menu_close').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'none', "menu hiding");
                                                              });
                                                              
                                                             test("test interaction", function()
                                                              {
                                                               var excerpts = app.template.getData().content[0].excerptData,
                                                                   
                                                                   // Used in the loop iterator below
                                                                   excerptsLength = excerpts.length,
                                                                   
                                                                   // Initializing the loop iterator below
                                                                   i = 0,
                                                                   
                                                                   // Initializing questions used in the loop below 
                                                                   questions;
                                                               
                                                               // Loop through each excrept
                                                               for (; i < excerptsLength; i++)
                                                                {
                                                                 // Assert that the proper excerpt is visible
                                                                 ok($('div.excerpt:eq(' + i + ')').css('display') === 'block', 'excerpt ' + i + ' is visible');
                                                                 
                                                                 // Assert all img assets are not broken
                                                                 var imagePlaceholder = document.createDocumentFragment(),
                                                                     tempImage = document.createElement('img');
                                                                 
                                                                 
                                                                 $(tempImage).bind('error', function ()
                                                                                             {
                                                                                              alert('broken image');
                                                                                             });
                                                                 
                                                                 /* // Need a better solution for checking broken images
                                                                 ok($(tempImage).bind('error', function ()
                                                                                                {
                                                                                                 return false;
                                                                                                }), 'broken image URL');*/
                                                                                               
                                                                 tempImage.src = $('img', 'div.excerpt:eq(' + i + ')').attr('src');
                                                                 
                                                                 imagePlaceholder.appendChild(tempImage);
                                                                 //$('div.excerpt:eq(' + i + ')').append(imagePlaceholder);
                                                                 
                                                                 
                                                                 $('img', 'div.excerpt:eq(' + i + ')').each(function()
                                                                                                             {
                                                                                                              $(this).css({border: '1px solid #f00 !important'});
                                                                                                              ok($(this).height() > 0, 'image height is > 0');
                                                                                                             });
                                                                 
                                                                 switch(questionType)
                                                                  {
                                                                   case 'choice':
                                                                    // Click all the questions
                                                                    questions = $('span.answerArea', 'div.excerpt:eq(' + i + ')');
                                                                       
                                                                    $(questions).each(function()
                                                                                       {
                                                                                        var that = this;
                                                                                           
                                                                                        // Click the question item
                                                                                        $(this).trigger('click');
                                                                                           
                                                                                        // Assert a lightbox is displayed
                                                                                        ok($('div.lightbox:visible').length > 0, 'a lightbox was displayed');
                                                                                           
                                                                                        // Click the first answer item
                                                                                        $('div.answer', 'div.lightbox:visible').each(function ()
                                                                                                                                      {
                                                                                                                                       $('input', this).trigger('click');
                                                                                                                                          
                                                                                                                                       // Assert the answer was populated in the correct answer area
                                                                                                                                       ok($(that).html() === $('label', this).html(), 'value was populated properly');
                                                                                                                                          
                                                                                                                                       // Assert that the "saveAndContinue" buttons are properly visible
                                                                                                                                       });
                                                                                           
                                                                                        // Close the question item by clicking the "x" button
                                                                                        $('a.close', 'div.lightbox:visible').trigger('click');
                                                                                           
                                                                                        // Assert no lightboxes are displayed
                                                                                        ok($('div.lightbox:visible').length === 0, 'lightbox was hidden');
                                                                                       });
                                                                    break;
                                                                   case 'fillinInput':
                                                                    questions = $('input.inputArea', 'div.excerpt:eq(' + i + ')');
                                                                    $(questions).each(function()
                                                                                       {
                                                                                        $(this).val('vayas');
                                                                                        $(this).trigger('blur');
                                                                                       }); 
                                                                    break;
                                                                  }
                                                                 
                                                                 // Open the next excerpt
                                                                 $('h1', 'div.excerpt:eq(' + (i + 1) + ')').trigger('click');
                                                                }
                                                              });
                                                             
                                                             
                                                             test("template submit", function()
                                                              {
                                                               // click on submit button.
                                                               $($('input.saveAndContinue')[0]).trigger('click');
                                                               ok($('#question_container').css('display') === 'none', "question container hidding");
                                                               ok($('#scoreSummary').length, 'score summary showing');
                                                               ok($('#resultsSummary').length, 'result summary showing');
                                                               ok($('#tryAgainButtonContainer').length, 'try again div showing');
                                                              });
                                                             
                                                             test("template try again", function()
                                                              {
                                                               if($('#tryAgain').length)
                                                                {
                                                                 ok(true, "try again button existed");
                                                                 // click on try again button.
                                                                 $('#tryAgain').trigger('click');
                                                                }
                                                               else 
                                                                {
                                                                 ok(false, "try again button existed");  
                                                                }
                                                              });
                                                             
                                                             test("template lock correct answers and remove incorrect ones", function()
                                                              {
                                                                 var lockResult = false,
                                                                     removeResult = true;
                                                                 switch(questionType)
                                                                  {
                                                                   case 'choice':
                                                                    $('.answerArea').each(function() 
                                                                                           {
                                                                                            if($(this).hasClass('disabled'))
                                                                                             { 
                                                                                              lockResult = true; // pass the test if any disabled span.answerArea found
                                                                                             }
                                                                                            else if($(this).html())
                                                                                             {
                                                                                              removeResult = false; // fail the test if any non-disabled span.answerArea has innerHTML rather than "" 
                                                                                             }
                                                                                           });
                                                                    break;
                                                                   case 'fillinInput':
                                                                    $('input.inputArea').each(function() 
                                                                                               {
                                                                                                if($(this).attr('disabled'))
                                                                                                 { 
                                                                                                  lockResult = true; // pass the test if any input.inputArea has attribute disabled
                                                                                                 }
                                                                                                else if($(this).val())
                                                                                                 {
                                                                                                  removeResult = false; // fail the test if any non-disabled input.inputArea has value rather than "" 
                                                                                                 }
                                                                                               });
                                                                    break;
                                                                   default:
                                                                  }
                                                                 
                                                                 ok(lockResult, 'lock the correct answers');
                                                                 ok(removeResult, 'remove the incorrect answers');
                                                              });        
                                                             
                                                             test("template show the excerpt with first wrong answer", function()
                                                                     {
                                                                         var activeExcerptIndex = 0;
                                                                         $('.excerptBody').each(function(index, node) {
                                                                          if($(node).css('height') === 'auto') 
                                                                           {
                                                                              activeExcerptIndex = index;
                                                                              return false;
                                                                           }
                                                                         });
                                                                         var firstWrongAnswerIndex,
                                                                             questions = app.getTest().getQuestionBank();
                                                                         // Find the index of first wrong answer.
                                                                         switch(questionType)
                                                                          {
                                                                           case 'choice':
                                                                            $('.answerArea').each(function(index) 
                                                                                                   {
                                                                                                    if(!$(this).hasClass('disabled'))
                                                                                                     {
                                                                                                      firstWrongAnswerIndex = index;
                                                                                                      return false;
                                                                                                     }
                                                                                                   });
                                                                            break;
                                                                           case 'fillinInput':
                                                                            $('input.inputArea').each(function(index)
                                                                                                       {
                                                                                                        if($(this).attr('disabled') === false)
                                                                                                         {
                                                                                                          firstWrongAnswerIndex = index;
                                                                                                          return false;
                                                                                                         }
                                                                                                       }); 
                                                                            break;
                                                                           default:
                                                                                 
                                                                          }
                                            
                                                                         var passed = false;
                                                                         if(typeof firstWrongAnswerIndex !== 'undefined')
                                                                          {
                                                                           passed = (parseInt(questions[firstWrongAnswerIndex].group) - 1) === activeExcerptIndex;
                                                                          }
                                                                         ok(passed, 'showing the excerpt which contains the first wrong answer');
                                                                     });
                                                           
                                                            }
                                                   };
                                           })(ale);
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        App.prototype.unitTests[template].init();
       }
      else
       {
        addTest();
        App.prototype.unitTests[template].init();
       }
     }
    else
     {
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template].init();
     }
   })();