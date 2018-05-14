function VidNotesRemediation(app) {
  // Private vars
  // ------------
  var console = app.console,
    container = '.question',
    mainContainer = '#question_container',
    attemptsAllowed = app.template.getData().metadata[0].remediationAttempts,
    visibleQuestion = 0,
    _questionType; //indicator for question type

  function setQuestionType(questionType) {
    _questionType = questionType;
  }

  function getQuestionType() {
    return _questionType;
  }
  // Private methods
  // ---------------
  /**
   * Closes the previous excerpt and opens the target (id) excerpt
   * @param {Object} args
   */
  function animateExcerpts(args) {
    // Close all others, and open args.id
    var DOMelement,
      elementHeight = $(window).height() - $('#question_container').offset().top - 300,
      excerptData = getExcerptData(),
      id = args.id || 0,
      previous = args.previous || 0;

    // this forces the opposite video to stop playing when loaded
    // try {
    //   flowplayer('*').each(function() {
    //     console.debug(this.getState())
    //     if (this.isLoaded() === true) {
    //       this.stop();
    //     }
    //   });
    // } catch (e) {
    //   //     alert(e)
    // }
    app.template.videoplayerHelper().pauseOtherVideo();
    // Set min/max
    elementHeight = (elementHeight < 500) ? 500 : elementHeight;

    // Hide all lightboxes
    $('div.lightbox').hide();

    // A flag to indicate if this excerpt is default
    // id === 0 && previous === 0
    var isDefaultToPlay = (id === 0) && (previous === 0);
    // If we're not trying to...? is this error prevention?
    if (id !== previous) {
      // Close previous element's arrow graphic
      $('div.excerpt h1').eq(previous).toggleClass('active');

      // Animate to close previous element
      $('div.excerpt div.excerptBody').eq(previous)
        .animate({
          height: 0
        })
        .queue(function() {
          $('div.excerpt:eq(' + previous + '), div.excerpt:eq(' + previous + ') .niftycorners b').css({
            background: '#e5e5e5'
          });
        });
    }

    // Animate to open target element
    $('div.excerpt div.excerptBody:eq(' + id + ')').dequeue()
      .animate({
        height: elementHeight
      }, function() {
        // Allow for large assets
        $(this).css('height', 'auto');

        // Only disable autoplay if this is a second+ attempt
        if (remediationAttempts.get() !== app.template.getData().metadata[0].remediationAttempts) {
          var domel= '.video-js:eq(' + id + ')'
          app.template.videoplayerHelper().pause(app.template.videoplayerHelper().getVideoPlayerId(domel));
          // app.template.flowplayerHelper().stop('a.flowplayer:eq(' + id + ')');
        }

        // Fixes multiple videos playing at once in chrome
        // $('.video-js').each(function(index, element) {
        //   if ($(this).parent().parent().parent().find('h1:not(.active)').length > 0) {
        //     $(this).html('');
        //   }
        // });

        // $('a.flowplayer').each(function(index, element) {
        //   if ($(this).parent().parent().parent().find('h1:not(.active)').length > 0) {
        //     $(this).html('');
        //   }
        // });

      });
    // Set the background to white
    $('div.excerpt:eq(' + id + '), div.excerpt:eq(' + id + ') .niftycorners b').css({
      background: '#fff'
    });

    // Turn the arrow graphic down via CSS class switching
    $('div.excerpt:eq(' + id + ') h1').addClass('active');

    var playMode = 'play',
      type = excerptData[id].type,
      flowPlayerHelper = app.template.flowplayerHelper(),
      videoplayerHelper = app.template.videoplayerHelper();

    // Check if flowplayer package config exists
    if (app.getPackageData().packageData[0].flowplayer !== undefined) {
      if (app.getPackageData().packageData[0].flowplayer.autoPlay !== undefined && app.getPackageData().packageData[0].flowplayer.autoPlay === false) {
        playMode = 'load';
      } else {
        playMode = 'play';
      }
    }
    switch (type) {
      case 'audio':
        // If isDefaultToPlay flag is false, stop the previous player and play the current player.
        if (!isDefaultToPlay) {
          videoplayerHelper.pause(videoplayerHelper.getVideoPlayerId('#data_' + type + '_' + previous + ' .video-js'));
          // flowPlayerHelper.stop('#data_' + type + '_' + previous + ' a.flowplayer');
        }
        videoplayerHelper[playMode](videoplayerHelper.getVideoPlayerId('#data_' + type + '_' + id + ' .video-js'));
        // flowPlayerHelper[playMode]('#data_' + type + '_' + id + ' a.flowplayer');
        break;
      case 'video':
        // If isDefaultToPlay flag is false, stop the previous player and play the current player.
        if (!isDefaultToPlay) {
          videoplayerHelper.pause(videoplayerHelper.getVideoPlayerId('.video-js:eq(' + previous + ')'));
          // flowPlayerHelper.stop('a.flowplayer:eq(' + previous + ')');
        }
        videoplayerHelper[playMode](videoplayerHelper.getVideoPlayerId('.video-js:eq(' + id + ')'));
        // flowPlayerHelper[playMode]('a.flowplayer:eq(' + id + ')');
        break;
      default:
    }
  }

  function applyLightboxFunctions(args) {
    var lightbox = $('#lightbox_' + (args.group || '') + args.id),
      target = args.target;

    // Change value when clicking the radio buttons
    $('input:radio', lightbox).unbind('click')
      .bind('click', function() {
        $(target).html($(this).val());

        updateCompletedQuestionsCount();

        // Check to see if this question is the last answer for interaction data
        // If thats the case, we want to transfer over the attemptsTaken property because otherwise it will overwritten with an undefined value
        if ((app.getTest().getQuestionBank().length - 1) === $(this).attr('id').split('_')[1]) {
          app.getTest().recordInteraction({
            attemptsTaken: app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].attemptsTaken,
            id: $(this).attr('id').split('_')[1],
            value: $(this).attr('id').split('_')[2]
          });
        } else {
          app.getTest().recordInteraction({
            id: $(this).attr('id').split('_')[1],
            value: $(this).attr('id').split('_')[2]
          });
        }

        checkEnableSubmitButton();
      });

    // Close lightbox when clicking 'ok'
    $('.close', lightbox).bind('click', function() {
      $(lightbox).hide();
      return false;
    });
  }

  // Find out which group index that the first wrong answer belongs to.
  function getExcerptIdToOpen() {
    var id = 0, //default value
      correctness;
    $(app.getTest().getQuestionBank()).each(function(index, question) {
      correctness = question.correctness;
      if (correctness && (correctness === 'incorrect')) {
        id = parseInt(question.group) - 1; // group start with 1, so reduce by one will be the index. 
        return false;
      }
    });
    return id;
  }

  function bindExcerptAnimations() {
    // Action for clicking on the excerpt title bars
    $('div.excerpt h1').bind('click', function() {
      var id,
        previousQuestion = getVisibleQuestion();

      setVisibleQuestion({
        value: $('.excerpt h1').index(this)
      });

      id = $('.excerpt h1').eq(getVisibleQuestion());

      animateExcerpts({
        id: $('div.excerpt h1').index(id),
        previous: previousQuestion
      });
      return false;
    });

    // Action for clicking on the 'go to next' link in each eacerpt (except the last)
    // NOTE: NOT WORKING CORRECTLY NOW - COMMENTED OUT UNTIL LATER.
    $('a.next_excerpt').bind('click', function() {
      var previousQuestion = getVisibleQuestion(),
        id = $('a.next_excerpt').eq(getVisibleQuestion() + 1),
        idVal = ($('a.next_excerpt').index(id) > -1) ? $('a.next_excerpt').index(id) : previousQuestion + 1;

      setVisibleQuestion({
        value: idVal
      });

      animateExcerpts({
        id: idVal,
        previous: previousQuestion
      });

      return false;
    });

    // Initialize the animation
    var id = getExcerptIdToOpen();
    animateExcerpts({
      id: id
    });
    // The id might be something other than 0, so call setVisibleQuestion to set the visible id
    setVisibleQuestion({
      value: id
    });
  }

  /**
   * event binding for quesitonType "fillinInput"
   */
  function bindFillinInput() {
    var timer;
    $('input.inputArea').bind('blur', function(e) {
      // find the index of target input node.
      var index = $('input.inputArea').index(this);
      // trim off the leading and trailing spaces.
      $(this).val($.trim($(this).val()));
      updateCompletedQuestionsCount();

      if ((app.getTest().getQuestionBank().length - 1) === index) {
        app.getTest().recordInteraction({
          attemptsTaken: app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].attemptsTaken,
          id: index,
          value: $(this).val()
        });
      } else {
        app.getTest().recordInteraction({
          id: index,
          value: $(this).val()
        });
      }
      checkEnableSubmitButton();
    }).bind('keyup', function(event) {
      if (!$('input.inputArea:[value=""]').length) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(checkEnableSubmitButton, 250);
      }
    });

    // plugin the aplette for fill in input.
    $('input.inputArea').palette('destroy').palette({
      'containment': '.jcarousel-container',
      'language': 'spanish'
    });
  }

  function bindLightboxes(args) {
    var questions = args.questionBank;

    // Bind lightbox events
    $('span.answerArea').bind('click', function(e) {
      if ($(this).hasClass('disabled')) {
        return false;
      }
      var answer,
        checked = '',
        html = [],
        i, // Used in the loop below
        id = $('.answerArea').index(this),
        group = 'answers',
        that = this,
        question,

        // Counts for (var i in questions[id].answers)
        x = 0;

      // Insert answer form elements
      for (i in questions[id].answers) {
        answer = questions[id].answers[i].value;
        checked = (questions[id].learner_response === i) ? ' checked' : null;
        question = questions[id];

        html.push('<div class="answer">');
        html.push('<input type="radio" value="', answer, '" name="question_', id, '_choices" id="question_', id, '_', i, '"', checked, '>');
        html.push('<label for="question_', id, '_', i, '">', question.answers[i].value, '</label>');
        html.push('</div>');
        x++;
      }

      // Insert submit button
      html.push('<input class="button go close" value="">');

      app.lightbox.render({
        global: ale,
        data: {
          type: 'vidNotes',
          content: {
            html: html.join(''),
            title: 'seleccionar'
          }
        },
        id: id,
        group: group,
        independent: $(this).hasClass('independent'),
        modal: false,
        position: {
          type: 'relative',
          x: ($(that).offset().left + ($(that).width() / 2)),
          y: $(that).offset().top + $(that).height() + 23
        },
        size: 'small'
      });

      applyLightboxFunctions({
        id: id,
        group: group,
        target: $('.answerArea').eq(id)
      });

    });
  }

  function bindSubmitButton() {
    $('input.saveAndContinue').bind('click', function() {
      submitAnswers();
      return false;
    });
  }

  function buildHTML() {
    var questionBank = app.getTest().getQuestionBank(),
      questionType = questionBank[0].type;

    // Disabling tabbing because the language tooltip causes issues
    $('body.vidNotesRemediation input.inputArea').live('keydown', function(e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode == 9) {
        e.preventDefault();
      }
    });


    // set the question type
    setQuestionType(questionType);
    buildQuestions({
      questionBank: questionBank,
      callback: populateAnswers
    });

    switch (questionType) {
      case 'choice':
        bindLightboxes({
          questionBank: questionBank
        });
        break;
      case 'fillinInput':
        bindFillinInput();
        break;
      default:
    }
    bindExcerptAnimations();

    bindSubmitButton();

    var display = false;
    // Now that all the questions & previously given answers have been put in place,
    // check if all remediation attempts have been used, and show results page if so
    if ((remediationAttempts.get() + 1) <= 0) {
      // Display results. NOTE: Nothing will get recorded for non-"persisted" tests
      // but also this case will never happen for persisted tests since progress
      // is set to "completed" after they submit the last question so returning
      // to the assignment will fire up a new (blank) instance anyhow.
      display = true;
    } else {
      lockAndUnbindCorrectAnswers();
    }
    if (display || isAllCorrect()) {
      hideAllQuestionElements();
      displayResults();
    }
    $('span.answerArea').html('&nbsp;');
  }

  function isAllCorrect() {
    var result = false;
    switch (getQuestionType()) {
      case 'choice':
        result = $('span.answerArea:not(".disabled")').length ? false : true;
        break;
      case 'fillinInput':
        result = $('input.inputArea[disabled!=true]').length ? false : true;
        break;
    }
    return result;
  }

  function buildQuestions(args) {
    var applySwf = [],

      // The last function to get called in buildQuestions
      callback = args.callback || function() {},

      // Contains the <div class="excerpt"> containers
      documentFragment = [],

      // Returns app.template.getData().content[0].excerptData;
      excerptData = getExcerptData(),

      // Will contain an eval()'d version of a dynamic object literal built in 
      // the form of a string and passed through data binding later
      json,

      // Looks like this is only used in a loop
      //lastAnswered = getVisibleQuestion(),

      // Resolves to app.getTest().getQuestionBank()
      // Which resolves to _questionBank
      // Which is set in TestManager.recordInteraction.record()
      questions = args.questionBank,

      // 
      string,

      // Count for (var i in excerptData)
      // l = excerptData.length - 1; // Uncomment this to reverse
      l = 0;

    // Insert the top "save and continue" button and reset documentFragment
    documentFragment.push('<div id="top_submit_container"><div class="submit_content"><input type="button" class="button saveAndContinue" disabled><div><span class="completed_questions">', questions.length, '</span> <span>de</span> <span class="total_questions">', questions.length, '</span> apuntes para completar</div></div></div>');
    $(documentFragment.join('')).insertBefore(getMainContainer());
    documentFragment = [];

    var i;
    for (i in excerptData) {

      var question = questions[i];

      // TODO: Refactor this to create DOM objects instead of the push string builder method
      documentFragment.push('<div class="excerpt">');
      documentFragment.push('<h1>', excerptData[l].title, '</h1>');
      documentFragment.push('<div class="excerptBody">');
      switch (excerptData[l].type) {
        case 'video':
          documentFragment.push('<div class="contentColumn" id="data_video_', l, '">');
          json = {
            source: {}
          };
          json.source['video_' + l] = {
            type: 'swf',
            content: excerptData[l].assetURL,
            // The first element in the array will be considering default. TODO: make this value confirugred in JSON file.
            isDefault: l === 0
          };
          applySwf.push(json);
          break;

        case 'audio':
          $('body').addClass('audio_only');
          documentFragment.push('<div class="contentColumn" id="data_audio_', l, '">');
          json = {
            source: {}
          };
          json.source['audio_' + l] = {
            type: 'audio',
            content: excerptData[l].assetURL,
            // The first element in the array will be considering default. TODO: make this value confirugred in JSON file.
            isDefault: l === 0
          };
          applySwf.push(json);
          break;

        default: // Text
          // NOTE: This div probably doesn't need the "_video_" id since it's just printing HTML
          // which will display properly regardless of the container ID.
          documentFragment.push('<div class="contentColumn" id="data_video_' + l + '">');
          documentFragment.push('<p>', excerptData[l].description, '</p>');

          if (excerptData[l].assetURL !== undefined) {
            documentFragment.push('<img src="', '/s3scorm/ale/content/assets/' + excerptData[l].assetURL + '" alt="', excerptData[l].assetURL, '">');
          }
      }
      documentFragment.push('</div>');
      documentFragment.push('<div class="answerColumn">');
      documentFragment.push('<h2>', excerptData[l].title, ' apuntes</h2>');
      documentFragment.push('<div id="questions_content">');

      // Count for (var i in questions)
      var x;
      for (x in questions) {
        // Match questions in the current group
        if ((questions[x].group * 1) === (l + 1)) { // +1 is added because 'group' is expected to start with 1 since is it human generated
          documentFragment.push('<p class="answerDescription">');
          documentFragment.push(questions[x].description);
          documentFragment.push('</p>');
        }
      }
      documentFragment.push('</div> <!-- questions_content -->');

      // Don't include the 'next excerpt' link on the last page
      if (i < (excerptData.length - 1)) {
        documentFragment.push('<a href="#" class="next_excerpt">ir a la siguiente parte</a>');
      }

      documentFragment.push('</div>');
      documentFragment.push('</div>');
      documentFragment.push('</div>');
      // l--; // Uncomment this to reverse
      l++;
    }

    $(getMainContainer()).append(documentFragment.join(""));

    //added for giving student name where ever cssSkin will be set to learnername in metadata
    $('body.showLearnerName ' + getMainContainer() + ' #questions_content').append(app.scorm.learnerName());

    // Call swfobject
    if (applySwf.length > 0) {
      var j;
      for (j = 0; j < applySwf.length; j++) {
        app.template.bindData(applySwf[j]);
        //set video width instead of default 100% in flowplayer lib
        // Commenting this out for now since this will cause viewing this template in an iframe to break due to the fixed width
        //$('div#data_video_' + j).css({'width':'600px'});
      }

      // For some reason, the object element's visibility gets set to hidden so we have to unhide it
      $('#swf_' + applySwf.l).css({
        'visibility': 'visible'
      });
    }

    // Reset documentFragment and add bottom "save and continue" button
    documentFragment = [];
    documentFragment.push('<div id="submit_container"><div class="submit_content"><input type="button" class="button saveAndContinue" disabled><div><span class="completed_questions">', questions.length, '</span> <span>de</span> <span class="total_questions">', questions.length, '</span> apuntes para completar</div></div></div>');
    $(documentFragment.join('')).insertAfter(getMainContainer());

    callback();
  }

  function checkEnableSubmitButton() {
    var questions,
      unansweredQuestions = false;

    // Check if all questions have been answered
    //if (updateCompletedQuestionsCount() === app.getTest().getQuestionBank().length) // This was used before when we were counting up from zero
    if (updateCompletedQuestionsCount() === 0) {
      unansweredQuestions = false;
    } else {
      unansweredQuestions = true;
    }

    // Enable submit button
    if (!unansweredQuestions) {
      $('input.saveAndContinue').removeAttr('disabled');
    } else {
      $('input.saveAndContinue').attr('disabled', true);
    }
  }

  /**
   *  Event binding for fillinInput summary page.
   */
  function bindFeedbackEvent(feedbacks) {
    // bind to id "test" onclick event, to handle the feedback lightbox popup.
    $('#test').unbind('click').bind('click', function() {
      var target = $(arguments[0].target);

      // if target node has sprite class, show the lightbox.
      if (target.hasClass('clickable')) {
        // Get the index from the id of the target node.
        // ex. index 0 for id "feedback_0". 
        var index = parseInt(target.attr('id').split('_')[1]),
          // Get the TR by index, and then get it's sencond TD child whose innerHTML will be the quesiton value pass to lightbox.
          // Because first TR is from header, using get(index + 1).
          td = $('td', $('tr').get(index + 1)).get(1),
          correctness = 'incorrect';

        if (target.hasClass('correct')) {
          correctness = 'correct';
        }
        // Show the lightbox for feedback.
        ale.lightbox.render({
          global: ale,
          id: app.lightbox.getFreshLightboxId(),
          data: {
            type: 'vidNotesFillinFeedback',
            content: {
              question: $(td).html(),
              yourAnswer: $('span', td).html(),
              correctness: correctness,
              feedback: feedbacks[index]
            }
          }
        });
      }
    });
  }

  function displayResults() {
    switch (getQuestionType()) {
      case 'choice':
        displayChoiceResults(app.getTest().getQuestionBank());
        break;
      case 'fillinInput':
        displayFillinResults(app.getTest().getQuestionBank());
        break;
      default:
    }
  }

  /**
   * Function called after display results.
   */
  function postDisplayResults(score) {
    if (testLimitReached() || score === 100) {
      // Save score and ungate the test
      app.getTest().recordTest({
        score: score
      });
      remediationAttempts.decrease();
      app.getTest().ungateThisTest();
    } else {
      // Display try again button
      remediationAttempts.decrease();
      displayTryAgainButton();
    }

    app.getTest().recordAttemptResult({
      testId: app.getPageName(),
      attempt: remediationAttempts.getAttemptsTaken(),
      score: score,
      persist: true
    });

    Nifty('div#scoreSummary', 'big');
    Nifty('div#resultsSummary', 'big');
  }
  /**
   * Generate HTML for question type fillinInput results state
   */
  function displayFillinResults(questions) {
    var resultsSummary = [],
      score,
      correctCount = 0,
      value,
      questionsLength = questions.length,
      temp = $('<div></div>'), //use node to convert special character codes.
      feedback,
      correctness,
      learnerResponse,
      newDescription,
      result,
      // Array to store the correct answer by index.
      answers = $(questions).map(function(index) {
        return temp.html(this.answers[0].value).text().toLowerCase();
      }),
      getFeedback = function(answer, question, correctAnswer) {
        var ret = {
          feedback: question.generalIncorrectFeedback,
          correct: answer === correctAnswer
        };
        $.each(question.answers, function(index, item) {
          if (temp.html(item.value).text().toLowerCase() === answer) {
            ret.feedback = item.feedback;
            return false;
          }
        });
        return ret;
      };

    resultsSummary.push('<table><thead><tr><th id="results_col1_header">#</th><th>apunte</th><th>resultado</th></tr></thead><tbody>');

    var feedbacks = [];
    $('input.inputArea').each(function(index) {
      learnerResponse = $(this).val();
      resultsSummary.push('<tr' + (index === questionsLength - 1 ? ' class="last">' : '>'));

      // Update the correctness value of question object in quesiton bank,
      // and prepare for the feedback value.
      result = getFeedback(learnerResponse.toLowerCase(), questions[index], answers[index]);
      feedbacks.push(result.feedback);
      if (result.correct) {
        correctness = questions[index].correctness = 'correct';
        correctCount++;
      } else {
        correctness = questions[index].correctness = 'incorrect';
      }
      newDescription = app.template.getData().questions[index].description.replace('<input type=\'text\' class=\'inputArea\'></input>', '<span class=' + correctness + '>' + learnerResponse + '</span>');
      newDescription = newDescription.replace(/<a href=\'#\' class=\'contextual_glossary( )?(data_[0-9]+)?\'>/g, '');
      newDescription = newDescription.replace(/<\/a>/g, '');
      newDescription = newDescription.replace(/'|�/g, "&#146;");

      resultsSummary.push('<td class="questionNumber" abbr="', questions[index]['group'], '">', ((index * 1) + 1), '</td>');
      resultsSummary.push('<td>', newDescription, '</td>');

      index = index + '';

      resultsSummary.push('<td class="questionFeedback"><div class="clickable sprite ' + correctness + '" id="feedback_' + index + '"></div></td>');
      resultsSummary.push('</tr>');
    });

    temp.remove();
    temp = null;

    resultsSummary.push('</tbody></table>');

    score = Math.round(correctCount * 100 / questionsLength);

    resultsSummary = '<div id="scoreSummary"><h3>Resultado: ' + score + '%</h3><h2>Antes de continuar, v&#233;ase abajo los detalles de su resultado.</h2></div><div class="sprite feedbackArrow"></div><div id="resultsSummary">' + resultsSummary.join('') + '</div>';
    $('#test').html(resultsSummary);

    // Bind feedback click event on summary page.
    bindFeedbackEvent(feedbacks);

    postDisplayResults(score);
  }
  /**
   * Generate HTML for question type choice results state, bind feedback lightbox events
   */
  function displayChoiceResults(questions) {
    var correctCount = 0,

      // Stores results table HTML
      resultsSummary = [],
      score,
      totalQuestions = questions.length,
      m = 0; // Counts for (var i in questions)

    // build results table
    // enclose th in tr to make it consistent on IE.
    resultsSummary.push('<table><thead><tr><th id="results_col1_header">#</th><th>apunte</th><th>resultado</th></tr></thead><tbody>');

    // Calculate score
    var i;

    for (i in questions) {
      var correctAnswer = null,
        correctness, // Stores 'correct/incorrect'
        feedback,
        learnerResponse = '',
        newCorrectAnswer, // Augmented below 
        newDescription, // Augmented below
        newLearnerResponse, // Augmented below
        question = questions[i],
        trClass = '',
        wasCorrect = false;



      // Add '.last' class to last tr
      if (m === (questions.length - 1)) {
        trClass = ' class="last"';
      }

      resultsSummary.push('<tr' + trClass + '>');

      // Get correct answer
      correctAnswer = question.correctAnswer[0];

      // TODO: question.id is undefined. Figure out where we should be grabbing it from.
      // ID was removed from the questions JSON in another template - look there.

      // Loop through answers 
      var j;

      for (j in question.answers) {
        var questionAnswersLength = question.answers.length;

        // Can't rely exclusively on the radio:checked method
        // since if they return from a suspended session, the lightboxes
        // don't get recreated even if there is learner information meaning
        // in that case, the results state will thrown the "feedback
        // undefined" error

        // Check radio inputs for latest input
        if ($('#question_' + m + '_' + j).length > 0) {
          if ($('#question_' + m + '_' + j + ':checked').length > 0) {
            learnerResponse = question.answers[j].value;
            feedback = question.answers[j].feedback || '';
          }
        } else {
          // Check questionBank for previous answers
          learnerResponse = app.getTest().getQuestionBank()[m].answers[(app.getTest().getQuestionBank()[m].learner_response * 1)].value;
          feedback = app.getTest().getQuestionBank()[m].answers[(app.getTest().getQuestionBank()[m].learner_response * 1)].feedback;
        }
      }

      wasCorrect = (correctAnswer === learnerResponse);
      if (wasCorrect) {
        correctness = 'correct';
      } else {
        correctness = 'incorrect';
      }
      // Set value to property "correctness" of question object in questionBank.
      question.correctness = correctness;
      // Replace question areas with colored answers given
      // Not sure why/how we're getting description from the question array
      // NOTE: The commented line below newDescription - this was causing errors
      // since we decided to use the description field to store remediation attempt data
      // so I changed it to pull from the JSON file instead of the questionBank()
      // which seems more appropriate anyways.
      newDescription = app.template.getData().questions[i].description.replace('<span class=\'answerArea\'>&nbsp;</span>', '<span class=' + correctness + '>' + learnerResponse + '</span>');
      //newDescription = question['description'].replace('<span class=\'answerArea\'></span>', '<span class=' + correctness + '>' + learnerResponse + '</span>');
      //matching if the glossary terms are more than one and at any index level in place of only one glossary term of single index level
      newDescription = newDescription.replace(/<a href=\'#\' class=\'contextual_glossary( )?(data_[0-9]+)?\'>/g, '');
      newDescription = newDescription.replace(/<\/a>/g, '');
      newDescription = newDescription.replace(/'|�/g, "&#146;");
      newLearnerResponse = newDescription; // So the Lightbox type case is semantic

      // Value is passed to the lightbox however, the vidNotes lightbox case was 
      // modified to remove the correct answer for the purpose of remidiation.
      newCorrectAnswer = app.template.getData().questions[i].description.replace('<span class=\'answerArea\'>&nbsp;</span>', '<span class=correct>' + correctAnswer + '</span>');
      //newCorrectAnswer = question['description'].replace('<span class=\'answerArea\'></span>', '<span class=correct>' + correctAnswer + '</span>');
      //matching if the glossary terms are more than one and at any index level in place of only one glossary term of single index level
      newCorrectAnswer = newCorrectAnswer.replace(/<a href=\'#\' class=\'contextual_glossary( )?(data_[0-9]+)?\'>/g, '');
      newCorrectAnswer = newCorrectAnswer.replace(/<\/a>/g, '');
      newCorrectAnswer = newCorrectAnswer.replace(/'/i, "&#146;");

      if (wasCorrect) {
        correctCount++;
      }

      // Replace this with excerpt (group) number
      //resultsSummary += '<td class="questionNumber">' + ((i * 1) + 1) + '</td>';

      // NOTE: Replaced with question number.
      //resultsSummary += '<td class="questionNumber" abbr="' + question['group'] + '">' + question['group'] + '</td>';
      resultsSummary.push('<td class="questionNumber" abbr="', question['group'], '">', ((i * 1) + 1), '</td>');
      resultsSummary.push('<td>', newDescription, '</td>');

      if (wasCorrect) {
        resultsSummary.push('<td class="questionFeedback"><div class="sprite correct" onclick="ale.lightbox.render({',
          'global:\x27ale\x27,',
          'id:\x27', app.lightbox.getFreshLightboxId(), '\x27,',
          'data:{type:\x27vidNotesFeedback\x27,content:{',
          'question:\x27', newDescription, '\x27,',
          'yourAnswer:\x27', newLearnerResponse, '\x27,',
          'correctAnswer:\x27', newCorrectAnswer, '\x27,',
          'feedback:\x27', feedback.replace(/'/i, "&#146;"), '\x27',
          '}}',
          '})"></div></td>');

      } else {
        resultsSummary.push('<td class="questionFeedback"><div class="sprite incorrect" onclick="ale.lightbox.render({',
          'global:\x27ale\x27,',
          'id:\x27', app.lightbox.getFreshLightboxId(), '\x27,',
          'data:{type:\x27vidNotesFeedback\x27,content:{',
          'question:\x27', newDescription, '\x27,',
          'yourAnswer:\x27', newLearnerResponse, '\x27,',
          'correctAnswer:\x27', newCorrectAnswer, '\x27,',
          'feedback:\x27', feedback.replace(/'/i, "&#146;"), '\x27',
          '}}',
          '})"></div></td>');
      }
      resultsSummary.push('</tr>');
      m++;
    }

    resultsSummary.push('</tbody></table>');

    score = Math.round(correctCount * 100 / totalQuestions);

    resultsSummary = '<div id="scoreSummary"><h3>Resultado: ' + score + '%</h3><h2>Antes de continuar, v&#233;ase abajo los detalles de su resultado.</h2></div><div class="sprite feedbackArrow"></div><div id="resultsSummary">' + resultsSummary.join('') + '</div>';
    $('#test').html(resultsSummary);

    postDisplayResults(score);
  }
  // stop/play the current visible flowplayer
  function controlCurrentFlowplayer(isPlay) {
    var flowplayerLength = $('a.flowplayer').length;
    var videoPlayerLength = $('.video-js').length;
    if(videoPlayerLength){
      var idToPlay = 0;
      if (videoPlayerLength > 1) {
        idToPlay = getVisibleQuestion();
      }
      var type = getExcerptData()[idToPlay].type;
      switch (type) {
        case 'audio':
          app.template.videoplayerHelper()[isPlay ? 'play' : 'pause'](app.template.videoplayerHelper().getVideoPlayerId('#data_audio_' + idToPlay + ' .video-js'));
          break;

        case 'video':
          app.template.videoplayerHelper()[isPlay ? 'play' : 'pause'](app.template.videoplayerHelper().getVideoPlayerId('.video-js:eq(' + idToPlay + ')'));
          break;
        default:
      }
    }else if(flowplayerLength){
      var idToPlay = 0;
      if (flowplayerLength > 1) {
        idToPlay = getVisibleQuestion();
      }
      var type = getExcerptData()[idToPlay].type;
      switch (type) {
        case 'audio':
          app.template.flowplayerHelper()[isPlay ? 'play' : 'stop']('#data_audio_' + idToPlay + ' a.flowplayer');
          break;

        case 'video':
          app.template.flowplayerHelper()[isPlay ? 'play' : 'stop']('a.flowplayer:eq(' + idToPlay + ')');
          break;
        default:
      }
    }
  }
  /**
   * Called after try again button clicked.
   * 
   * Correct answers: 
   *    Lock correct answer by adding class "disabled" to hotspot span,
   *    and unbind its click evnet.
   * Wrong answers:
   *    Remove class "disabled" from hotspot span.
   *    Delete learner_response property from question element in questionBank, 
   *    Reset the lightbox questions
   */
  function lockAndUnbindCorrectAnswers() {
    // update completed questions count and
    // check submit button enablility right after lock and remove answers.
    updateCompletedQuestionsCount();
    checkEnableSubmitButton();

    var questions = app.getTest().getQuestionBank(),
      attempts = questions[questions.length - 1].attempts;
    if (typeof attempts === 'undefined') {
      // if attempts property is not existed for last element of the questions array,
      // don't lock the correct answers.
      return;
    }
    var attempt = 1;
    while (attempt in attempts) {
      if (!attempts[attempt + 1]) {
        break;
      }
      attempt++;
    }
    var erased = attempts[attempt].erased;
    attempts[attempt].erased = true;
    var correctness,
      removeAnswer = (function(attemptObj) {
        return function(index, question) {
          return attemptObj.result[index] === question.learner_response;
        };
      })(attempts[attempt]);

    switch (getQuestionType()) {
      case 'choice':
        $('span.answerArea').each(function(index) {
          if (correctness = questions[index].correctness) {
            if (correctness === 'correct') //correct answer
            {
              // add 'disabled' to hotspot class to style it.  
              $(this).addClass('disabled').unbind('click');
            } else if (!erased) //incorrect answer
            {
              // reset the wrong answer
              $(this).removeClass('disabled').html('');
              // delete learnder_response property from question element in question bank.
              delete questions[index].learner_response;
              var lightbox = app.lightbox.getLightBoxInstance({
                id: index,
                group: 'answers'
              });
              if (lightbox) {
                // reset the checked radio button.
                $('input', lightbox).attr('checked', false);
              }
            }
          }
        });
        break;
      case 'fillinInput':
        $('input.inputArea').each(function(index) {
          if (correctness = questions[index].correctness) {
            if (correctness === 'correct') {
              // disable the input text by setting disabled property to true.
              // unbind the blur event.
              $(this).attr('disabled', true).unbind('blur');
            } else if (!erased) {
              delete questions[index].learner_response;
              $(this).attr('disabled', false).val('');
            }
          }
        });

        break;
      default:
    }

  }
  /**
   * Creates and inserts input element
   */
  function displayTryAgainButton() {
    // Build the button
    var tryAgainButtonPlaceholder = document.createDocumentFragment(),
      tryAgainButton = document.createElement('input'),
      tryAgainButtonContainer = document.createElement('div');

    tryAgainButton.id = 'tryAgain';
    tryAgainButton.type = 'button';

    tryAgainButtonContainer.id = 'tryAgainButtonContainer';

    // Append the button
    tryAgainButtonPlaceholder.appendChild(tryAgainButtonContainer);
    tryAgainButtonContainer.appendChild(tryAgainButton);
    $(tryAgainButtonPlaceholder).insertAfter('div#resultsSummary');

    // Bind the event
    $('#tryAgain').bind('click', function() {
      $('#test').html('');
      $('#top_submit_container, #question_container, #submit_container').show();

      // Call after try again button clicked.
      lockAndUnbindCorrectAnswers();

      var id = getExcerptIdToOpen();

      // jump to the excerpt which has the first wrong answer.
      animateExcerpts({
        id: id,
        previous: getVisibleQuestion()
      });

      // set the current visible question 
      setVisibleQuestion({
        value: id
      });

      // update the completed questions count again, because we might remove the wrong answers.
      updateCompletedQuestionsCount();
      //check submit button due to same reason as above.
      checkEnableSubmitButton();

      // If we have any flowplayers in this vidnotes, begin playing the first one on retry, only in IE
      // For FF and Safari, the player will be played automatically.
      if ($.browser.msie === true) {
        // Check if package has autoPlay disabled globally
        if (app.getPackageData().packageData[0].flowplayer !== undefined) {
          controlCurrentFlowplayer(app.getPackageData().packageData[0].flowplayer.autoPlay);
        } else {
          controlCurrentFlowplayer(true);
        }
      }
    });
  }

  function getContainer() {
    return container;
  }

  function getExcerptData() {
    return app.template.getData().content[0].excerptData;
  }

  function getMainContainer() {
    return mainContainer;
  }

  /**
   * Returns the number of attempts taken
   * @param questionBank
   * @returns number or undefined
   */
  function getPersistedAttemptsTaken(questionBank) {
    return questionBank[questionBank.length - 1].attemptsTaken || 0;
  }

  function getQuestionLength() {
    return container.length;
  }

  function getVisibleQuestion() {
    return visibleQuestion;
  }

  /**
   * Called by submitAnswers()
   * Hides all non-result state elements
   */
  function hideAllQuestionElements() {
    $('div.lightbox').hide();
    $('#question_container').hide();
    $('#top_submit_container').hide();
    $('#submit_container').hide();

    //  Ensure that lightbox gets removed
    $('div.contextual_view').remove();
  }

  // Set hooks to fire after TestManager gets loaded
  function init() {
    app.hooks.clearHooks();
    app.hooks.setHook({
      name: 'RenderTest',
      functionName: function() {
        app.thisTemplate.render();
      }
    });
  }

  function populateAnswers() {
    var answers = app.getTest().getQuestionBank();

    // Loop through containers and populate them with
    // their respective answers given if any.
    switch (getQuestionType()) {
      case 'choice':
        $('span.answerArea').each(function(index) {
          if (answers[index]) {
            if (answers[index].learner_response) {
              $(this).html(answers[index].answers[answers[index].learner_response].value);
            }
          }
        });
        break;
      case 'fillinInput':
        $('input.inputArea').each(function(index) {
          if (answers[index] && answers[index].learner_response) {
            $(this).val(answers[index].learner_response);
          }
        });
        break;
      default:
    }
    // Update the 'x of n remaining' count
    // this will be done in lockAndUnbindCorrectAnswers() 
    //    updateCompletedQuestionsCount();
    //    checkEnableSubmitButton();
  }

  var remediationAttempts = (function() {
    return {
      decrease: function() {
        // Save to interactions entry
        app.getTest().recordInteraction({
          id: app.getTest().getQuestionBank().length - 1,
          attemptsTaken: (app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].attemptsTaken || 0) + 1
        });
      },
      get: function() {
        var attemptsTaken = getPersistedAttemptsTaken(app.getTest().getQuestionBank());
        return attemptsAllowed - attemptsTaken;
      },
      getAttemptsTaken: function() {
        // Return the number of current attempt.
        var result = getPersistedAttemptsTaken(app.getTest().getQuestionBank());
        if (result > (attemptsAllowed + 1)) {
          result = attemptsAllowed + 1;
        }
        return result;
      }
    };
  }());

  function render() {
    if (!getVisibleQuestion()) {
      setVisibleQuestion({
        value: 0
      });
    }

    buildHTML();
    roundQuestionContainer();

    $('body').one('bindData.finished', function() {
      //                                       try
      //                                       {      
      //                                        flowplayer('*').each(function()
      //                                          {
      //                                           console.debug(this.getState())
      //                                           if (this.isLoaded() === true)
      //                                            {
      //                                             this.stop();
      //                                            }
      //                                          });
      //                                       }
      //                                      catch(e)
      //                                       {
      ////                                        alert(e)
      //                                       }
    })
  }

  function roundQuestionContainer() {
    Nifty('div#question_container');
    Nifty('div.excerpt');
  }

  function roundExerpts() {
    Nifty('div.exerpt', 'big');
  }

  function setVisibleQuestion(args) {
    visibleQuestion = args.value;
  }

  /*
   * Interaction includes submitting answers to the LMS <del>and navigating to the next page</del> and displaying the results page
   */
  function submitAnswers() {
    // Must include a stop for IE - stop flowplayer instances from continuing to play
    if ($.browser.msie) {
      controlCurrentFlowplayer(false);
    }
    hideAllQuestionElements();
    displayResults();
  }

  /**
   * Return true/false based on remidiation attempts remaining
   * False: Limit has not been reached yet
   */
  function testLimitReached() {
    // Check the remediation attempts
    return (remediationAttempts.get() > 0) ? false : true;
  }

  function updateCompletedQuestionsCount() {
    var newTotal;
    switch (getQuestionType()) {
      case 'choice':
        newTotal = 0;
        $('span.answerArea').each(function() {
          if ($(this).html() === '' || $(this).html() === '&nbsp;') {
            newTotal++;
            $(this).html('&nbsp;');
          }

        });

        break;
      case 'fillinInput':
        newTotal = $('input.inputArea').filter(function() {
          return !$(this).val();
        }).length;
        break;
      default:
    }
    $('span.completed_questions').html(newTotal);

    return newTotal;
  }

  // Public interface
  // ----------------
  this.render = render;
  this.disableFlowplayerAutoplay = true;


  // One-time setup
  // --------------
  init();
}

App.prototype.thisTemplate = new VidNotesRemediation(ale);