/**
 * @constructor
 * @param {Object} args
 */
function ThemesSummary(args)
 {  
  var _attempts = 3,
      _answersLength,
      _checked = 0,
      
      // Stores an array of answers to be passed to resetForm upon clicking "try again"
      _tryAgainAnswers = [];
  
  setConfig(args);
  
  var app = getConfig().link,
      console = new Console();
 
  init();
  
  function buildQuestions(args)
   {
    var groupList,
        jsonAnswers = args.jsonAnswers || false,
        questionsFragment = document.createDocumentFragment();
console.info('jsonAnswers::::::');
console.debug(jsonAnswers);
    // Check if interaction data was fed
    // Build out questions
    
    //  Create <ul> container and append to fragment
    var questionsUL = document.createElement('ul');
    questionsFragment.appendChild(questionsUL);

    if (jsonAnswers)
     {
      var jsonAnswersLength = jsonAnswers.length;
      
      for (var x = 0; x < jsonAnswersLength; x++)
       {
        var jsonSubAnswers = jsonAnswers[x].answers,
            jsonSubAnswersLength = jsonAnswers[x].answers.length,
            liElement = document.createElement('li'),
            liElement = $(liElement),
            questionsUL = $(questionsUL),
            spanElementGroup = document.createElement('span'),
            spanElementGroup = $(spanElementGroup);
        
//        app.toolkit.getData() === undefined
//         ? groupList = app.template.getData().content[0].groupList[(jsonAnswers[x].group-1)]
//         : groupList = app.toolkit.getData().content[0].groupList[(jsonAnswers[x].group-1)];
        
        groupList = getData().content[0].groupList[(jsonAnswers[x].group-1)];
       
         console.info('groupList::::::');
         console.debug(groupList);
         
        spanElementGroup.addClass('group');
        spanElementGroup.html(groupList);
        liElement.append(spanElementGroup);
        
        // Build out each answer
        for (var y = 0; y < jsonSubAnswersLength; y++)
         {
          var divContainer = document.createElement('div'),
              divContainer = $(divContainer),
              divElementTag = document.createElement('div'),
              divElementTag = $(divElementTag),
              divElementAns = document.createElement('div'),
              divElementAns = $(divElementAns);
          
          divContainer.addClass('feedback_container');
          divElementTag.addClass('tag');
          divElementAns.addClass('answer');
          
          divElementTag.html(jsonAnswers[x].answers[y].tag);
          divElementAns.html(jsonAnswers[x].answers[y].feedback);
          
          divContainer.append(divElementTag);
          divContainer.append(divElementAns);
          liElement.append(divContainer);
         }

        questionsUL.append(liElement);
       }
     }

    // Finally, append fragment to DOM
    $('#ul_container').append(questionsFragment);
   }
  
  /**
   * Returns app.template.getData().content[0].answerList
   * @return object
   */
  function jsonAnswers()
   {
//    var data;
//    
//    // Check data cache
//    if(app.getCache().themesSummary !== undefined)
//     {
//      data = app.getCache().themesSummary;
//     }
//    else
//     {
//      (app.template.getData() === undefined)
//       ? data = app.toolkit.getData().questions
//       : data = app.template.getData().questions;
//      
//      app.setCache({
//                    themesSummary : data
//                   });
//     }
//    
//     return data;
    return getData().questions;
   }
  
  function getData()
   {
    var data;
    
    // Check data cache
    if(app.getCache().themesSummary !== undefined)
     {
      data = app.getCache().themesSummary;
     }
    else
     {
      // If we've opened up this template from the toolkit for the first time
      
      // Next, hit this inner conditional which will check to see if we're accessing from the toolkit
      // or normal template instantiation. 
      (app.toolkit.getData() === undefined)
       ? data = app.template.getData()
       : data = app.toolkit.getData();
      
      app.setCache({
                    themesSummary : data
                   });
     }
     console.info('app.toolkit.getData()');
     console.debug(data);
     
     return data;
   }
  
  function getQuestionBank()
   {
    return app.getTest().getQuestionBank();
   }
  
  function init()
   {        
    // Need to clear hooks from previous themes test template
    // TODO: this should be coded to occur automatically on test unload as a core feature
    app.hooks.clearHooks();
    
    // Round corners
    DD_roundies.addRule('#questions_container', '5px', true);
    
    buildQuestions({
                    "jsonAnswers" : jsonAnswers()
                   });
   }
  
  function setConfig(args)  
   {
    getConfig = function()
                        {
                         return $.extend({
                                          'link' : this
                                         }, args);
                        };
   }
 }

App.prototype.thisTemplate = new ThemesSummary({
                                                'link' : ale
                                               });