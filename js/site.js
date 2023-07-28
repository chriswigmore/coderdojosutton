var uuid = uuidv4();

// setup the hash navigation
var $moduleNavbar = $('#module-navbar');
var $question = $('#question');

setupHashNavigation();

function setupHashNavigation() {
    $(window).on('hashchange', function() {
        var hash = window.location.hash;
        if (!hash) hash = '#00-00';

        // split the hash into 2 possible parts: section, question
        var hashParts = hash.split('-');
        if (hashParts.length !== 2) throw 'hashParts.length === ' + hashParts.length;

        // get a section number from the hash, setting the active section in the module navbar, and showing only the questions for that section
        var sectionIndex = hashParts[0];
        $moduleNavbar.find('li').removeClass('active');
        $moduleNavbar.find('li').eq(sectionIndex.replace('#', '')).addClass('active');
        $question.children('.question').hide();
        $question.find('.question input[type=radio]').prop('checked', false);
        $question.find('.question .radio').remove('span.glyphicon');
        $question.children('.question[data-hash="' + sectionIndex + '"]').show();
        
        // activate the appropriate question in the section
        var questionIndex = hashParts[1];
        $question.children('.question').removeClass('active');
        $question.children('.question[data-hash="' + sectionIndex + '"]').eq(questionIndex).addClass('active');
        $question.find('.question input[type=radio]').attr('disabled', true);
        $question.find('.question a.btn-next').attr('disabled', true);
        $question.find('.question .incorrect').remove();
        $question.find('.question .glyphicon-ok').remove();
        $question.find('.question.active input[type=radio]').removeAttr('disabled');
        $question.find('.question.active a').removeAttr('disabled');
        $question.find('.question.active').prevAll().find('input[type=radio][data-correct]') // get all correct answers...
            .prop('checked', true) // ... check their radio buttons...
            .parent().append('<span class="glyphicon glyphicon-ok"></span>'); // ... and append a tick

        // scroll to the top of the page on loading a new section
        if (questionIndex == '00') {
            window.scrollTo({ top: 0, behavior: 'smooth' });        
        }

        log(hash);
    }).trigger('hashchange');
}

$(document).on('change', 'input[type=radio]', function(e) {
    var $target = $(e.target);
    var $radio = $target.closest('.radio');
    var isCorrect = $target.attr('data-correct') !== undefined;
    if (isCorrect) {
        // update the hash to the next question in the section (noting that all sections must end with a clickable link to the next section)
        var nextQuestionInSection = incrementQuestion($target.attr('name'));
        window.location.hash = nextQuestionInSection;
    } else {
        // add a (single) red cross and 'try again' message
        $target.closest('.question').find('.incorrect').remove();
        $target.closest('.question').append('<span class="incorrect"><span class="glyphicon glyphicon-remove"></span> No... try again</span>');
    }

    log($target.attr('name') + '-' + $radio.parent().children('.radio').index($radio));
});

$(document).on('click', '.help', function(e) {
    var $target = $(e.target);
    var $help = $target.closest('.help');
    $help.toggleClass('shown');
    $help.find('.glyphicon.pull-right').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');

    log(window.location.hash + 'i' + $help.parent().children('.help').index($help));
});

$(document).on('click', '.rating div', function(e) {
    var $target = $(e.target);
    var rating = $target.closest('[data-rating]').attr('data-rating');
    var $rating = $target.closest('.rating')
    $rating.children('div').remove();
    $rating.append('<strong>Thank you!</strong>');

    log('rating=' + rating);
});

function incrementQuestion(hash) {
    // split the hash into its three parts, increment the last part and ensure that it's left-padded with zeroes
    var hashParts = hash.split('-');
    if (hashParts.length !== 2) throw 'hashParts.length === ' + hashParts.length;
    return hashParts[0] + '-' + (parseInt(hashParts[1]) + 1).toString().padStart(2, '0');
}

// https://stackoverflow.com/a/2117523 - note, anything vaguely unique and random is fine... update, avoided arrow operator for compatibility with Sutton Life Centre's IE 11
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function log(message) {
    if (window.location.href.startsWith('http://localhost/')) {
        console.log(uuid + ':' + page + ':' + message);
    } else {
        var url = 'https://px4r2qv5yh4zazjchtqbbjhid40bdsyz.lambda-url.eu-west-1.on.aws/?i=' + uuid + '&p=' + page + '&m=' + encodeURIComponent(message);
        $.ajax(url).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
        });
    }
}        
